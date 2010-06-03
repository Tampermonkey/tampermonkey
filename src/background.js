/**
 * @filename background.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var TM_tabs = {};
var TM_storage = {};

var TM_cmds = [];

var condAppendix = '@re';
var windowExcludes = [];

var urlAll = '://*/*';
var urlAllHttp = 'http' + urlAll;
var urlAllHttps = 'https' + urlAll;
var urlAllInvalid = '*';
var urlSecurityIssue = '.*/';
var urlTld = '.tld/';
var urlAllTlds = '(museum|travel|aero|arpa|coop|info|jobs|name|nvus|biz|com|edu|gov|int|mil|net|org|pro|xxx|ac|ad|ae|af|ag|ai|ak|al|al|am|an|ao|aq|ar|ar|as|at|au|aw|ax|az|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|co|cr|cs|ct|cu|cv|cx|cy|cz|dc|de|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fl|fm|fo|fr|ga|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gu|gw|gy|hi|hk|hm|hn|hr|ht|hu|ia|id|id|ie|il|il|im|in|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|ks|kw|ky|ky|kz|la|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|ma|mc|md|md|me|mg|mh|mi|mk|ml|mm|mn|mn|mo|mo|mp|mq|mr|ms|ms|mt|mt|mu|mv|mw|mx|my|mz|na|nc|nc|nd|ne|ne|nf|ng|nh|ni|nj|nl|nm|no|np|nr|nu|ny|nz|oh|ok|om|or|pa|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|pr|ps|pt|pw|py|qa|re|ri|ro|ru|rw|sa|sb|sc|sc|sd|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|tn|to|tp|tr|tt|tv|tw|tx|tz|ua|ug|uk|um|us|ut|uy|uz|va|va|vc|ve|vg|vi|vi|vn|vt|vu|wa|wf|wi|ws|wv|wy|ye|yt|yu|za|zm|zw)';

var Script = function() {
    this.observers = [];
    this.icon = '';
    this.fileURL = null;
    this.name = null;
    this.namespace = null;
    this.description = null;
    this.enabled = true;
    
    this.compat_metadata = false;
    this.compat_foreach = false;
    this.compat_arrayleft = false;
    this.compat_filterproto = false;
    this.requires = [];
    this.includes = [];
    this.excludes = [];
    this.resources = [];
    this.poll_unsafewindow = false;
    this.poll_unsafewindow_allvars = false;
    this.poll_unsafewindow_interval = 10000;
};

/* ###### Helpers ####### */

var getStringBetweenTags = function(source, tag1, tag2) {
    var b = source.search(escapeForRegExp(tag1));
    if (b == -1) {
        return "";
    }
    if (!tag2) {
        return source.substr(b + tag1.length);
    }
    var e = source.substr(b + tag1.length).search(escapeForRegExp(tag2));
    
    if (e == -1) {
        return "";
    }
    return source.substr(b + tag1.length, e);
};

var versionCmp = function(v1, v2) {
    var a1 = v1.split('.');
    var a2 = v2.split('.');
    var ret = false;
    var len = a1.length > a2.length ? a1.length : a1.length;

    for (var i=0; i<len; i++) {
        if (a1.length < len) a1[i] = 0;
        if (a2.length < len) a2[i] = 0;
        if (Number(a2[i]) > Number(a1[i])) {
            return true;
        }
    }

    return ret;
};

/* ###### URL Handling ####### */

var escapeForRegExp = function(str) {
    var re = new RegExp( '(\\' + [ '/', '.', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ].join('|\\') + ')', 'g');
    return str.replace(re, '\\$1');
};

var getRegExpFromUrl = function(url) {

    var u;
    if (Config.values.tryToFixUrl && url == urlAllInvalid) {
        u = urlAllHttp;
    } else if (Config.values.safeUrls && url != urlAllHttp && url != urlAllHttps && url.search(escapeForRegExp(urlSecurityIssue)) != -1) {
        u = url.replace(escapeForRegExp(urlSecurityIssue), urlTld);
    } else {
        u = url;
    }
    u = escapeForRegExp(u);
    u = u.replace(/\*/gi, '.*');
    u = u.replace(escapeForRegExp(urlTld), '.' + urlAllTlds + '\/');

    return '(' + u + ')';
};

var getNameFromUrl = function(url) {
    var s = url.split('/')
    if (!s.length) return '';
    return s[s.length-1];
};


/* ###### Extension Helpers ####### */

chrome.extension.getVersion = function() {

    if (!chrome.extension.version_) {

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", chrome.extension.getURL('manifest.json'), false);
            xhr.send(null);
            var manifest = JSON.parse(xhr.responseText);

            chrome.extension.version_ = manifest.version;
            chrome.extension.updateurl_ = manifest.update_url;

        } catch (e) {
            console.log(e);
            chrome.extension.version_ = 'unknown';
            chrome.extension.updateurl_ = null;
        }
    }

    return chrome.extension.version_;
};

chrome.extension.getID = function() {
    var p = chrome.extension.getURL('/');
    var ida = p.replace(/\//gi, '').split(':');
    return (ida.length < 2) ? '' : ida[1];
};

chrome.extension.newVersion = function() {

    if (!chrome.extension.newversion_) {

        chrome.extension.getVersion();

        if (chrome.extension.updateurl_) {

            try {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", chrome.extension.updateurl_, false);
                xhr.send();

                var a1 = "<app appid='"+chrome.extension.getID()+"'>";
                var a2 = "</app>";
                var a = getStringBetweenTags(xhr.responseText, a1, a2);

                var t1 = "codebase='";
                var t2 = "'";
                var t = getStringBetweenTags(a, t1, t2);

                var v1 = "version='";
                var v2 = "'";
                var v = getStringBetweenTags(a, v1, v2);

                chrome.extension.newversion_ = v;

                if (versionCmp(chrome.extension.newversion_, chrome.extension.version_)) {
                    console.log("My version: " + chrome.extension.version_ + " - Remote version:" + chrome.extension.newversion_ + "; trigger update!");
                    chrome.tabs.create({ url: t});
                 }

            } catch (e) {
                console.log(e);
                chrome.extension.newversion_ = "unknown";
            }
        }
    }

    return chrome.extension.newversion_;
};

/* ###### Storage ####### */

TM_storage.deleteValue = function(name) {
    localStorage.removeItem(name);
};

TM_storage.listValues = function() {
    var ret = new Array();
    for (var i=0; i<localStorage.length; i++) {
        ret.push(localStorage.key(i));
    }
    return ret;
};

TM_storage.getValue = function(name, defaultValue) {
    var value = localStorage.getItem(name);
    if (!value)
        return defaultValue;
    var type = value[0];
    value = value.substring(1);
    switch (type) {
      case 'b':
          return value == 'true';
      case 'n':
          return Number(value);
      case 'o':
          try {
              return JSON.parse(value);
          } catch (e) {
              console.log(e);
              return defaultValue;
          }
      default:
          return value;
    }
};

TM_storage.setValue = function(name, value) {
    var type = (typeof value)[0];
    switch (type) {
      case 'o':
          try {
              value = type + JSON.stringify(value);
          } catch (e) {
              console.log(e);
              return;
          }
          break;
      default:
          value = type + value;
    }

    localStorage.setItem(name, value);
};

/* ###### unsafeWindow poller ######### */

var unsafeWindowPollerInit = function() {

    this.pollerExcludeNames = [];
    this.pollerExcludeTypes = ['function'];
    this.lastUpdate = 0;

    this.determineUsedUnsafeWindowVars = function(script) {
        var arr = script.textContent.split('unsafeWindow.');
        var ret = [];
        for (var i = 1; i < arr.length; i++) {
            var a = arr[i];
            // ignore first item
            var p = a.search(/[ \t\n;:=\(\)\[\]\.\{\}]/);
            if (p != -1) {
                var excl = false;
                var n = a.substr(0, p);
                for (var k in windowExcludes) {
                    if (windowExcludes[k] == n) {
                        excl = true;
                        break;
                    }
                }
                if (excl) continue;
                for (var k in ret) {
                    if (ret[k] == n) {
                        excl = true;
                        break;
                    }
                }
                if (!excl) {
                    ret.push(n);
                }
            }
        }
        return ret;
    };

    this.getWindowExcludes = function() {
        var a = [];
        for (var k in window) {
            a.push(k);
        }
        return a;
    };

    this.inject = function() {
        var s = document.createElement('script');
        var b = document.getElementsByTagName('body');
        var src = this.pollerSrc.toString();
        if (!b.length) return null;

        src = src.replace(/##POLLEREXCLUDETYPES##/g, JSON.stringify(this.pollerExcludeTypes));
        src = src.replace(/##POLLEREXCLUDENAMES##/g, JSON.stringify(this.pollerExcludeNames));
        src = 'try { (' + src + ')(); } catch (e) { console.log(e); }\n'
        s.textContent = src;
        b[0].appendChild(s);

        return true;
    };

    this.fillUnsafeWindow = function() {
        var oobj = (typeof oobj === 'undefined') ? this : oobj;
        var pollerInterval = Number('##INTERVAL##');
        var d = document.getElementById('##POLLERDIVID##');
        var ts = d.getAttribute('ts');
        try {
            if (ts && ts > oobj.lastUpdate) {
                var j = JSON.parse(d.textContent);
                for (var k in j) {
                    try {
                        // console.log("replace unsafeWindow elem " + k);
                        unsafeWindow[k] = JSON.parse(j[k]);
                    } catch (f) {
                        console.log(f);
                    }
                }
                this.lastUpdate = ts;
            }
        } catch (e) {
            console.log(e);
        }
        
        if (pollerInterval) window.setTimeout(function() { oobj.fillUnsafeWindow() }, pollerInterval);
    };

    this.pollerSrc = function() {
        var pollerInterval = Number('##INTERVAL##');
        var pollerIncludes = JSON.parse('##POLLERINCLUDES##');;
        var pollerExcludeWindow = JSON.parse('##POLLEREXCLUDEWINDOW##');
        var pollerExcludeTypes = JSON.parse('##POLLEREXCLUDETYPES##');
        var pollerExcludeNames = JSON.parse('##POLLEREXCLUDENAMES##');
        var pollerDivId = '##POLLERDIVID##';

        var createDiv = function() {
            var div = document.createElement('div');
            div.setAttribute('id', pollerDivId);
            div.setAttribute('style','display: none;');
            var b = document.getElementsByTagName('body');
            
            if (!b.length) return null;

            b[0].appendChild(div);
            return div
        };

        var poll = function() {
            // console.log('poll start');
            fillPollerDiv();
            if (pollerInterval) window.setTimeout(function() { poll(); }, pollerInterval);
            // console.log('poll end');
        };

        var isIncluded = function(n) {
            for (var i=0; i<pollerIncludes.length; i++) {
                if (pollerIncludes[i] == n) return true;
            }
            return (pollerIncludes.length == 0);
        };

        var isExcluded = function(t, n) {
            for (var i=0; i<pollerExcludeWindow.length; i++) {
                if (pollerExcludeWindow[i] == n) return true;
            }
            for (var i=0; i<pollerExcludeNames.length; i++) {
                if (pollerExcludeNames[i] == n) return true;
            }
            for (var i=0; i<pollerExcludeTypes.length; i++) {
                if (pollerExcludeTypes[i] == t) return true;
            }
            return false;
        };

        var fillPollerDiv = function() {
            var c = {};

            for (var k in window) {
                if (!isIncluded(k) || isExcluded(typeof window[k], k)) continue;
                try {
                    // console.log("stringify k " + k + ' ### ' + typeof window[k]);
                    c[k] = JSON.stringify(window[k]);
                    // console.log("END k " + k);
                } catch (e) {
                    console.log("error adding " + k + '(' + typeof window[k] + ') to poll array');
                }
            }

            var d = document.getElementById(pollerDivId);
            d.innerHTML = JSON.stringify(c);
            var ts = ((new Date()).getTime().toString());
            d.setAttribute('ts', ts);
        };

        createDiv();
        poll();
    };
};

/* ###### hehe ######### */

var defaultScripts = function() {

    var userscripts_header = '';

    userscripts_header += '// ==UserScript==\n';
    userscripts_header += '// @name       TamperScript\n';
    userscripts_header += '// @namespace  http://tampermonkey.biniok.net/\n';
    userscripts_header += '// @version    1.0\n';
    userscripts_header += '// @description  make UserScripts links one-click installable (links to *.user.js are caught by chrome)\n';
    userscripts_header += '// @include    http://*/*\n';
    userscripts_header += '// @copyright  2010+, Jan Biniok\n';
    userscripts_header += '// @license    GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html\n';
    userscripts_header += '// ==/UserScript==\n\n';

    var userscripts = function() {
        var userscript = ".user.js";

        var tamperScriptClickHandler = function(url) {
            var cb = function (req) {
                if (req.readyState == 4 && req.status == 200) {
                    TM_installScript(req.responseText);
                }
            };

            var details = {
                method: 'GET',
                url: url,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
                onload: cb,
                onerror: cb
            };

            TM_xmlhttpRequest(details);
        };

        var modifyUserScriptLinks = function() {
            var aarr = document.getElementsByTagName('a');
            for (var k in aarr) {
                var a = aarr[k];
                if (a.href && a.href.search(userscript) != -1) {
                    a.addEventListener('click', function () { tamperScriptClickHandler(this.tamper)});
                    a.tamper = a.href;
                    a.href = '#';
                }
            }
        }

        window.addEventListener("load", modifyUserScriptLinks, false);
    }

    return [ userscripts_header + '(' + userscripts.toString() + ')();' ];
};

/* ###### Config ####### */
var configInit = function() {

    var oobj = this;
    this.defaults = { safeUrls: true,
                      tryToFixUrl: true,
                      debug: false,
                      showFixedSrc: false,
                      firstRun: true};
    
    this.load = function() {
        oobj.values = TM_storage.getValue("TM_config", oobj.defaults);
    };

    this.load();

    this.save = function() {
        var c = oobj.values;
        var inst = c.firstRun;
        c.firstRun = false;
        TM_storage.setValue("TM_config", c);
        var ds = defaultScripts();

        if (inst) {
            for (var k in ds) {
                var s = ds[k];
                window.setTimeout(function() { addNewUserScript(null, s, false); }, 100 );
            }
        }
    };

    if (this.values.firstRun) {
        this.save();
    }

    return this;
};


/* ###### Runtime ####### */

var runtimeInit = function() {

    this.gm_emu = function() {
        this.GM_addStyle = function(css) {
            return TM_addStyle(css);
        };

        this.GM_deleteValue = function(name) {
            return TM_deleteValue(name);
        };

        this.GM_listValues = function() {
            return TM_listValues();
        };

        this.GM_getValue = function(name, defaultValue) {
            return TM_getValue(name, defaultValue)
        };

        this.GM_log = function(message) {
            return TM_log(message);
        };

        this.GM_registerMenuCommand = function(name, funk) {
            return TM_registerMenuCommand(name, funk);
        };

        this.GM_openInTab = function(url) {
            return TM_openInTab(url);
        };

        this.GM_setValue = function(name, value) {
            return TM_setValue(name, value);
        };

        this.GM_xmlhttpRequest = function(details) {
            return TM_xmlhttpRequest(details);
        };

        this.GM_getResourceText = function(name) {
            return TM_getResourceText(name);
        };

        this.GM_getResourceURL = function(name) {
            return TM_getResourceURL(name);
        };
    };

    this.tm_api = function() {

        this.TM_context_id = "##SCRIPTID##";

        this.TM_addStyle = function(css) {
            var style = document.createElement('style');
            style.textContent = css;
            document.getElementsByTagName('head')[0].appendChild(style);
        };

        this.TM_deleteValue = function(name) {
            localStorage.removeItem("##SCRIPTNAME##" + name);
        };

        this.TM_listValues = function() {
            var ret = new Array();
            for (var i=0; i<localStorage.length; i++) {
                var n = localStorage.key(i);
                var s = "##SCRIPTNAME##";
                if (n.length > s.length && n.substr(0, s.length) == s) {
                    ret.push(n);
                }
            }
            return ret;
        };

        this.TM_getValue = function(name, defaultValue) {
            var value = localStorage.getItem("##SCRIPTNAME##" + name);
            if (!value)
                return defaultValue;
            var type = value[0];
            value = value.substring(1);
            switch (type) {
              case 'b':
                  return value == 'true';
              case 'n':
                  return Number(value);
              case 'o':
                  try {
                      return JSON.parse(value);
                  } catch (e) {
                      console.log(e);
                      return defaultValue;
                  }
              default:
                  return value;
            }
        };

        this.TM_log = function(message) {
            console.log(message);
        };

        this.TM_getResourceText = function(name) {
            for (var k in TM_resources) {
                var r = TM_resources[k];
                if (r.name == name) {
                    return r.resText;
                }
            }
            return null;
        };

        this.TM_getResourceURL = function(name) {
            for (var k in TM_resources) {
                var r = TM_resources[k];
                if (r.name == name) {
                    return r.resURL;
                }
            }
            return null;
        };

        this.TM_registerMenuCommand = function(name, fn) {
            var id = TM_context_id + '#' + name;
            var onUnload = function() {
                chrome.extension.sendRequest({method: "unRegisterMenuCmd", name: name, id: id}, function(response) {});
            };
            var resp = function(response) {
                // response is send, command is unregisterd @ background page
                window.removeEventListener('unload', onUnload, false);
                if (response.run) {
                    window.setTimeout(function () { fn(); }, 1);
                    // re-register for next click
                    TM_registerMenuCommand(name, fn);;
                }
            };
            chrome.extension.sendRequest({method: "registerMenuCmd", name: name, id: id}, resp);
            window.addEventListener('unload', onUnload, false);
        };

        this.TM_openInTab = function(url) {
            chrome.extension.sendRequest({method: "openInTab", url: url}, function(response) {});
        };

        this.TM_setValue = function(name, value) {
            var type = (typeof value)[0];
            switch (type) {
              case 'o':
                  try {
                      value = type + JSON.stringify(value);
                  } catch (e) {
                      alert(e);
                      return;
                  }
                  break;
              default:
                  value = type + value;
            }

            localStorage.setItem("##SCRIPTNAME##" + name, value);
        };

        this.TM_xmlhttpRequest = function(details) {
            chrome.extension.sendRequest({method: "xhr", details: details}, function(response) {
                                             if (details["onload"]) {
                                                 if (response.data.responseXML) response.data.responseXML = unescape(response.data.responseXML);
                                                 details["onload"](response.data);
                                             }
                                         });
        }

        this.TM_getTab = function(cb) {
            chrome.extension.sendRequest({method: "getTab"}, function(response) {
                                             if (cb) {
                                                 cb(response.data);
                                             }
                                         });
        };

        this.TM_saveTab = function(tab) {
            chrome.extension.sendRequest({method: "saveTab", tab: tab});
        };

        this.TM_getTabs = function(cb) {
            chrome.extension.sendRequest({method: "getTabs"}, function(response) {
                                             if (cb) {
                                                 cb(response.data);
                                             }
                                         });
        };

        this.TM_getVersion = function() {
            // will be replaced later
            return "##VERSION##";
        };

        this.TM_installScript = function(src) {
            chrome.extension.sendRequest({method: "scriptClick", src: src}, function(response) {});
        };

        this.TM_run = function (fn, p, arg) {
            try {
                fn(arg);
            } catch(e) {
                try{
                    var s = '';
                    if (e.stack) s += 'Stack\n' + e.stack.replace(/\;/gi, ';\n\t').replace(/\{/gi, '{\n\t').replace(/\}/gi, '}\n\t').replace(/\;\\n\t/gi, ';'); + '\n';
                    if (e.description) s += 'Description\n' + e.description + '\n';
                    if (e.message) s += 'Message\n' + e.message + '\n';
                    try{
                        if (p) s+= "Request: " + p + '\n';
                    } catch (ee) {}
                    var c = fn.toString();
                    if (c.length > 300) c = c.substr(0, 300);
                    s += 'Fn: ' + c + '\n';
                    TM_log(s);
                } catch(ee) {
                    TM_log(ee);
                } finally {
                    throw(e);
                }
            }
        };

        this.TM_addEventListener = function (event, fn) {
            window.addEventListener(event, function (e) { TM_run(fn, 'Evt: ' + event, e) });
        };
        
        this.TM_setTimeout = function (fn, time) {
            window.setTimeout(function () { TM_run(fn, 'Timout: ' + time) }, time);
        };
    };

    this.validScheme = function(url) {
        return (url && url.length > 4 && url.substr(0,4) == 'http');
    };

    this.xmlhttpRequest = function(details, callback) {
        var xmlhttp = new XMLHttpRequest();
        var onload = function() {
            var responseState = {
                responseXML: (xmlhttp.readyState == 4 ? (xmlhttp.responseXML ? escape(xmlhttp.responseXML) : null) : ''),
                responseText: (xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
                readyState: xmlhttp.readyState,
                responseHeaders: (xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
                status: (xmlhttp.readyState == 4 ? xmlhttp.status : 0),
                statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : '')
            };
            if (callback) {
                callback(responseState);
            }
        }
        xmlhttp.onload = onload;
        xmlhttp.onerror = onload;
        try {
            if (!this.validScheme(details.url)) {
                console.log("error loading url: " + details.url);
                throw new Error;
            }
            xmlhttp.open(details.method, details.url);
        } catch(e) {
            console.log(e);
            if(callback) {
                var resp = { responseXML: '',
                             responseText: '',
                             readyState: 4,
                             responseHeaders: '',
                             status: 403,
                             statusText: 'Forbidden'};
                callback(resp);
            }
            return;
        }
        if (details.headers) {
            for (var prop in details.headers) {
                xmlhttp.setRequestHeader(prop, details.headers[prop]);
            }
        }
        if (typeof(details.data) !== 'undefined') {
            xmlhttp.send(details.data);
        } else {
            xmlhttp.send();
        }

    };

    this.encode64 = function(data){
        var key="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var c1,c2,c3,enc3,enc4,i=0,o="";
        while(i<data.length){
            c1=data.charCodeAt(i++);
            if(c1>127) c1=88;
            c2=data.charCodeAt(i++);
            if(c2>127) c2=88;
            c3=data.charCodeAt(i++);
            if(c3>127) c3=88;
            if(isNaN(c3)) {enc4=64; c3=0;} else enc4=c3&63;
            if(isNaN(c2)) {enc3=64; c2=0;} else enc3=((c2<<2)|(c3>>6))&63;
            o+=key.charAt((c1>>2)&63)+key.charAt(((c1<<4)|(c2>>4))&63)+key.charAt(enc3)+key.charAt(enc4);
        }
        return encodeURIComponent(o);
    }

    this.getNextResource = function(script, cb) {

        var oobj = this;

        var storeResource = function(req, res) {
            res.loaded = true;
            res.resUrl = '';
            res.resText = '';

            var image = null;
            var rh = req.responseHeaders.split('\n');

            for (var k in rh) {
                var h = rh[k].split(':');
                if (h.length >= 2 &&
                    h[0].trim() == 'Content-Type' &&
                    h[1].search('image') != -1) {
                    image = h[1].trim();
                }
            }

            if (req.readyState == 4 && req.status == 200) {
                res.resText = req.responseText;
                if (!image) {
                    res.resURL = oobj.encode64(req.responseText);
                } else {
                    res.resURL = 'data:' + image + ';base64,' + oobj.encode64(req.responseText);
                }
                cb(script);
            }
        };

        for (var k in script.resources) {
            var r = script.resources[k];
            if (!r.loaded) {

                var details = {
                    method: 'GET',
                    url: r.url,
                };

                console.log("request " + r.url);
                this.xmlhttpRequest(details, function(req) { storeResource(req, r); } );
                return true;
            }
        }

        return false;
    };

    this.getRequires = function(script, cb) {

        var oobj = this;

        var fillRequire = function(req, res) {
            res.loaded = true;
            if (req.readyState == 4 && req.status == 200) {
                res.textContent = req.responseText;
            }
        };

        for (var k in script.requires) {
            var r = script.requires[k];
            if (!r.loaded && r.url) {
                var details = {
                    method: 'GET',
                    url: r.url,
                };

                console.log("requires " + r.url);
                this.xmlhttpRequest(details, function(req) {
                                        fillRequire(req, r);
                                        oobj.getRequires(script, cb);
                                    });
                return true;
            }
        }

        cb();
    };

    this.contentLoad = function(tab, main) {

        var oobj = this;
        if (this.getNextResource(main, function(script) { oobj.contentLoad(tab, script); })) {
            return;
        }

        this.currentTab = tab;

        var req_cb = function() {
            var scripts = [];
            scripts.push(main);

            console.log("run script @ " + tab.url + " - " + main.name);

            oobj.injectScript(scripts);
        };

        this.getRequires(main, req_cb);
    };

    this.getUrlContents = function(url) {

        var content = '';
        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/' + url, false);
        xhr.send(null);
        content = xhr.responseText;
        return content;
    };

    this.envReplacer = function(str, script) {
        var re_ver = new RegExp( "##VERSION##", 'g');
        var re_name = new RegExp( "##SCRIPTNAME##", 'g');
        var re_id = new RegExp( "##SCRIPTID##", 'g');
        str = str.replace(re_ver, chrome.extension.getVersion());
        str = str.replace(re_name, script.name + "_");
        str = str.replace(re_id, "((new Date()).getTime().toString()) + '-' + escape(document.location)");
        return str
    };

    this.createEnv = function(src, script) {
        var ret = '';
        var api = '';
        var t = new this.tm_api();
        for (var k in t) {
            api += "var " + k + " = " + this.envReplacer(t[k].toString(), script) + ";\n";
        }

        var emu = '';
        var e = new this.gm_emu();
        for (var k in e) {
            emu += "var " + k + " = " + this.envReplacer(e[k].toString(), script) + ";\n";
        }

        emu += 'unsafeWindow = window;\n';
        emu += 'var uneval = function(arg) { try { return "\$1 = " + JSON.stringify(arg) + ";"; } catch (e) { alert(e) } };\n';
        emu += 'var CDATA = function(arg) { this.src = arg; this.toString = function() { return this.src; }; this.toXMLString = this.toString; };'

        var flt = function(fun /*, thisp*/) {

            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();
            
            var res = new Array();
            var thisp = arguments[1];
            
            for (var i = 0; i < len; i++) {
                if (i in this) {
                    var val = this[i]; // in case fun mutates this
                    
                    if (typeof fun.call != 'undefined') {
                        if (fun.call(thisp, val, i, this)) res.push(this[i]);
                    } else {
                        var re = new RegExp(fun);
                        if (val.match(fun)) res.push(this[i]);
                    }
                }
            }
            
            return res;
        };

        var cmp = 'Array.prototype.filter = ' + flt + ';';
        var res = 'var TM_resources = ' + JSON.stringify(script.resources) + ';\n';

        if (script.compat_filterproto) {
            console.log("env option: overwrite Array.filter");
            ret += cmp;
        }

        var secsrc = '';
        // secsrc += '(function(){';
        // secsrc += 'var chrome = {extension: {}, tabs: {}};';
        secsrc += compaMo.mkCompat(src, script);
        // secsrc += ';})();';

        if (Config.values.debug) {
            console.log("env option: debug scripts");
            secsrc = compaMo.debugify(secsrc);
        }

        if (script.poll_unsafewindow) {
            var poll = '';
            poll += "var PollerInit = " + unsafeWindowPollerInit.toString() + ";\n";
            poll += "var Poller = new PollerInit();\n";
            poll += "Poller.inject();\n";
            poll += "Poller.fillUnsafeWindow();\n";
            poll = poll.replace(/##INTERVAL##/g, script.poll_unsafewindow_interval);
            poll = poll.replace(/##POLLERDIVID##/g, 'tampermonkeyPollerDiv');

            var incs = Poller.determineUsedUnsafeWindowVars(script);
            if (script.poll_unsafewindow_allvars) {
                // all vars should be transfered, exclude at least chrome window specific ones
                poll = poll.replace(/##POLLEREXCLUDEWINDOW##/g, JSON.stringify(windowExcludes));
                poll = poll.replace(/##POLLERINCLUDES##/g, JSON.stringify([]));
                console.log("env option: poll all unsafeWindow vars");
            } else if (incs.length) {
                poll = poll.replace(/##POLLEREXCLUDEWINDOW##/g, JSON.stringify([]));
                poll = poll.replace(/##POLLERINCLUDES##/g, JSON.stringify(incs));
                console.log("env option: poll " + incs.length + " unsafeWindow vars");
            }

            if (script.poll_unsafewindow_allvars || incs.length != 0) emu += poll;
        }

        ret = api + emu + res;
        ret = 'try { (function(){ ' + ret + secsrc +';})(); } catch (e) { console.log(e); }';

        return ret;
    };

    this.injectScript = function(scripts) {
        var script;

        for (var i = 0; script = scripts[i]; i++) {
            var requires = [];
            script.requires.forEach(function(req) {
                                        var contents = req.textContent;
                                        requires.push(contents);
                                    });

            var scriptSrc = "\n" + requires.join("\n") + "\n" + script.textContent + "\n";
            chrome.tabs.sendRequest(this.currentTab.id,
                                    { method: "executeScript", code: this.createEnv(scriptSrc, script)},
                                    function(response) {});

            // chrome.tabs.executeScript(this.currentTab.id, { code: this.createEnv(scriptSrc, script)});
        }
    };
};

/* ###### UserScript Runtime ####### */

var processHeader = function(header) {
    var script = new Script();

    var tags = ['name', 'namespace', 'version', 'author', 'description'];

    // security...
    header = header.replace(/\'/gi, '').replace(/\"/gi, '');
    // convinience ;)
    header = header.replace(/\t/gi, '    ');
    header = header.replace(/\r/gi, '');
    
    for (var t in tags) {
        script[tags[t]] = getStringBetweenTags(header, tags[t], '\n').trim();
    }

    var lines = header.split('\n');

    for (var i in lines) {
        var l = lines[i].replace(/^\/\//gi, '').replace(/^ /gi, '');
        if (l.search(/^@include/) != -1) {
            var c = l.replace(/^@include/gi, '').replace(/[ \b\r\n]/gi, '');
            // console.log("c " + c);
            script.includes.push(c);
        }
        if (l.search(/^@exclude/) != -1) {
            var c = l.replace(/^@exclude/gi, '').replace(/[ \b\r\n]/gi, '');
            // console.log("c " + c);
            script.excludes.push(c);
        }
        if (l.search(/^@require/) != -1) {
            var c = l.replace(/^@require/gi, '').replace(/[ \b\r\n]/gi, '');
            // console.log("c " + c);
            var o = { url: c, loaded: false, textContent: ''};
            script.requires.push(o);
        }
        if (l.search(/^@resource/) != -1) {
            var c = l.replace(/^@resource/gi, '').replace(/[\r\n]/gi, '');
            var s = c.trim().split(' ');
            // console.log("c " + c);
            // console.log("s " + s);
            if (s.length >= 2) {
                script.resources.push({name: s[0], url: s[1], loaded: false});
            }
        }
    }

    if (script.version == '') script.version = "0.0";

    return script;
};

var removeUserScript = function(name) {
    storeScript(name, null);
};

var addNewUserScript = function(tabid, src, ask) {

    if (ask == undefined) ask = true;

    // save some space ;)
    src = src.replace(/\r/g, '');

    var t1 = '==UserScript==';
    var t2 = '==/UserScript==';

    var header = getStringBetweenTags(src, t1, t2);

    if (!header || header == '') return;

    var script = processHeader(header);

    script.textContent = src;

    var oldscript = TM_storage.getValue(script.name, null);
    var jsonscript = JSON.stringify(script);

    var msg = '';

    if (!script.name || script.name == '') {
        chrome.tabs.sendRequest(tabid,
                                { method: "showMsg", msg: 'Invalid UserScript. Sry!'},
                                function(response) {});
        return false;
    } else if (script.name.search('@') != -1) {
        chrome.tabs.sendRequest(tabid,
                                { method: "showMsg", msg: 'Invalid UserScript name. Sry!'},
                                function(response) {});
        return false;
    } else if (oldscript && script.version == oldscript.version) {
        // TODO: allow reinstall, doublecheck changed includes
        msg += 'You are about to reinstall a UserScript:     \n';
        msg += '\nName:\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\nInstalled Version:\n';
        msg += '    ' + 'v' + script.version +  '\n';
    } else if (oldscript && versionCmp(script.version, oldscript.version)) {
        chrome.tabs.sendRequest(tabid,
                                { method: "showMsg", msg: 'You can\'t downgrade ' + script.name + '\nfrom version ' + oldscript.version + ' to ' + script.version},
                                function(response) {});
        return false;
    } else if (oldscript) {
        // TODO: allow reinstall, doublecheck changed includes
        msg += 'You are about to update a UserScript:     \n';
        msg += '\nName:\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\nInstalled Version:\n';
        msg += '    ' + 'v' + oldscript.version +  '\n';

    } else {
        msg += 'You are about to install a UserScript:     \n';
        msg += '\nName:\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
    }

    if (!script.includes.length) {
        msg += '\nNote: \n';
        msg += '    ' + 'This script does not provide any @include information.\n';
        msg += '    ' + 'TamperMonkey assumes "' + urlAllHttp + '" in order to continue!    \n';
        script.includes.push(urlAllHttp);
    }

    var g = script.excludes.length + script.includes.length;
    var c = 0;
    var m = 4;

    msg += '\nInclude(s):\n';
    for (var k in script.includes) {
        msg += '    ' + script.includes[k];
        msg += (g < 25) ? '\n' : (c < m) ? ';' : '\n';
        if (c++ >= m) c = 0;
    }
    c = 0;
    if (script.excludes.length) {
        msg += '\nExclude(s):\n';
        for (var k in script.excludes) {
            msg += '    ' + script.excludes[k];
            msg += (g < 25) ? '\n' : (c < m) ? ';' : '\n';
            if (c++ >= m) c = 0;
        }
    }

    var compDe = false;
    var unWiVaLe = Poller.determineUsedUnsafeWindowVars(script);

    if (unWiVaLe) {
        script.poll_unsafewindow = true;
    }

    if (compaMo.mkCompat(src) != src) {
        compDe = true;
        if (src != compaMo.unMetaDataify(src)) script.compat_metadata = true;
        if (src != compaMo.unEachify(src)) script.compat_foreach = true;
        if (src != compaMo.unArrayOnLeftSideify(src)) script.compat_arrayleft = true;
        if (compaMo.checkFilterRegExp(src)) script.compat_filterproto = true;

    }

    if (unWiVaLe || compDe) {
        msg+= "\nNote: A recheck of the GreaseMonkey/FF       \n    compatibility options may be \n    required in order to run this script.\n\n";
    }

    msg+= "\nDo you want to continue?";

    var doit = function() {
        storeScript(script.name, script);
        var allitems = createOptionItems();
        chrome.extension.sendRequest({ method: "updateOptions",
                                             items: allitems },
                                     function(response) {});
    };

    if (ask) {
        chrome.tabs.sendRequest(tabid,
                                { method: "confirm", msg: msg},
                                function(response) {
                                    if (response.confirm) {
                                        doit();
                                        return true;
                                    }
                                });
    } else {
        doit();
        return true;
    }
    return null;
};

var validUrl = function(href, cond) {
    var run = false;
    for (var t in cond.inc) {
        var r = new RegExp(getRegExpFromUrl(cond.inc[t]));
        if (r.test(href)) {
            run = true;
            break;
        }
    }
    if (!run) return run;
    for (var t in cond.exc) {
        var r = new RegExp(getRegExpFromUrl(cond.exc[t]));
        if (r.test(href)) {
            run = false;
            break;
        }
    }
    return run;
};

var storeScript = function(name, script) {
    if (script) {
        TM_storage.setValue(name + condAppendix, { inc: script.includes , exc: script.excludes });
        TM_storage.setValue(name, script);
    } else {
        TM_storage.deleteValue(name + condAppendix);
        TM_storage.deleteValue(name);
    }
};

var loadScriptByName = function(name) {
    return { script: TM_storage.getValue(name, null), cond: TM_storage.getValue(name + condAppendix, null) };
};

var getAllScriptNames = function() {
    var values = TM_storage.listValues();
    var ret = [];
    for (var k in values) {
        var v = values[k];
        // TODO: use appendix
        if (v.search(/@re$/) == -1) continue;
        ret.push(v.split('@')[0]);
    }
    return ret;

};

var determineScriptsToRun = function(href) {
    var names = getAllScriptNames();
    var ret = [];

    for (var k in names) {
        var n = names[k];

        if (href) {
            var cond = TM_storage.getValue(n + condAppendix, null);
            if (!cond) continue;
            if (!validUrl(href, cond)) continue;
        }

        var r = loadScriptByName(n);

        if (!r.script || !r.cond) {
            console.log("fatal error!!!");
            continue;
        }

        ret.push(r.script);
    }

    return ret;
};

var requestHandler = function(request, sender, sendResponse) {
    console.log("back: request.method " + request.method);
    if (request.method == "xhr") {
        var cb = function(req) { sendResponse({data: req});};
        Runtime.xmlhttpRequest(request.details, cb);
    } else if (request.method == "openInTab") {
        chrome.tabs.create({ url: request.url});
        sendResponse({});
    } else if (request.method == "getTab") {
        if (typeof sender.tab != 'undefined') {
            if (typeof TM_tabs[sender.tab.id] == 'undefined') TM_tabs[sender.tab.id] = { };
            var tab = TM_tabs[sender.tab.id];
            sendResponse({data: tab});
        } else {
            console.log("unable to deliver tab due to empty tabID");
            sendResponse({data: null});
        }
    } else if (request.method == "getTabs") {
        sendResponse({data: TM_tabs});
    } else if (request.method == "saveTab") {
        if (typeof sender.tab != 'undefined') {
            var tab = {};
            for (var k in request.tab) {
                tab[k] = request.tab[k];
            };
            TM_tabs[sender.tab.id] = tab;
        } else {
            console.log("unable to save tab due to empty tabID");
        }
        sendResponse({});
    } else if (request.method == "setOption") {
        var optionstab = (typeof sender.tab != 'undefined' && sender.tab) ? sender.tab.id : null;

        Config.values[request.name] = request.value;
        Config.save();

        var items = createOptionItems();
        if (optionstab) {
            sendResponse({items: items});
        } else {
            chrome.extension.sendRequest({ method: "updateOptions",
                                                 items: items },
                                         function(response) {});
            sendResponse({});
        }
    } else if (request.method == "modifyScriptOptions") {
        var optionstab = (typeof sender.tab != 'undefined' && sender.tab) ? sender.tab.id : null;

        if (request.name) {
            var r = loadScriptByName(request.name);
            if (r.script && r.cond) {
                if (typeof request.compat_metadata !== 'undefined') r.script.compat_metadata = request.compat_metadata;
                if (typeof request.compat_foreach !== 'undefined') r.script.compat_foreach = request.compat_foreach;
                if (typeof request.compat_arrayleft !== 'undefined') r.script.compat_arrayleft = request.compat_arrayleft;
                if (typeof request.compat_filterproto !== 'undefined') r.script.compat_filterproto = request.compat_filterproto;
                if (typeof request.poll_unsafewindow !== 'undefined') r.script.poll_unsafewindow = request.poll_unsafewindow;
                if (typeof request.poll_unsafewindow_allvars !== 'undefined') r.script.poll_unsafewindow_allvars = request.poll_unsafewindow_allvars;
                if (typeof request.poll_unsafewindow_interval !== 'undefined') r.script.poll_unsafewindow_interval = request.poll_unsafewindow_interval;
                if (typeof request.enabled !== 'undefined') r.script.enabled = request.enabled;
                storeScript(r.script.name, r.script);
            }
        }
        var updateOptionsPage = function() {
            var allitems = createOptionItems();
            chrome.extension.sendRequest({ method: "updateOptions",
                                                 items: allitems },
                                         function(response) {});
        }
        if (optionstab) {
            updateOptionsPage();
        } else {
            if (request.name) window.setTimeout(updateOptionsPage,100);
            var resp = function(tab) {
                var items = createActionMenuItems(tab.url);
                sendResponse({items: items});
                if (request.name) {
                    chrome.tabs.sendRequest(tab.id,
                                            { method: "reload" },
                                        function(response) {});
                }
            };
            chrome.tabs.getSelected(null, resp);
        }
    } else if (request.method == "saveScript") {
        var optionstab = (typeof sender.tab != 'undefined' && sender.tab) ? sender.tab.id : null;

        // TODO: check renaming and remove old one
        if (request.code) {
            addNewUserScript(sender.tab.id, request.code);
        } else {
            removeUserScript(request.name);
        }
        var resp = function(tab) {
            var allitems = createOptionItems();
            sendResponse({items: allitems});
            if (request.name) {
                chrome.tabs.sendRequest(tab.id,
                                        { method: "reload" },
                                        function(response) {});
            }
        };
        chrome.tabs.getSelected(null, resp);
    } else if (request.method == "scriptClick") {
        if (typeof sender.tab != 'undefined') {
            addNewUserScript(sender.tab.id, request.src);
        } else {
            console.log("unable to install script tab due to empty tabID");
        }
        sendResponse({data: null});
    } else if (request.method == "onUpdate") {
        if (typeof sender.tab != 'undefined') {
            updateListener(sender.tab.id, {status: "complete"}, sender.tab);
        } else {
            console.log("unable to run scripts on tab due to empty tabID");
        }
        sendResponse({});
    } else if (request.method == "onLoad") {
        if (typeof sender.tab != 'undefined') {
            loadListener(sender.tab.id, {status: "complete"}, sender.tab);
        } else {
            console.log("unable to run scripts on tab due to empty tabID");
        }
        sendResponse({});
    } else if (request.method == "registerMenuCmd") {
        if (typeof sender.tab != 'undefined') {
            console.log("MC add " + request.id);
            TM_cmds.push({ url: sender.tab.url, name: request.name, id: request.id, response: sendResponse});
        } else {
            console.log("unable to run scripts on tab due to empty tabID");
            sendResponse({ run: false });
        }
    } else if (request.method == "unRegisterMenuCmd") {
        // cmd is unregistered just by getting
        getRegisteredMenuCmd(request.id);
        sendResponse({});
    } else if (request.method == "execMenuCmd") {
        // cmd is unregistered just by getting
        var c = getRegisteredMenuCmd(request.id);
        // console.log("MC exec " + c.id);
        c.response({ run: true });
        sendResponse({});
    } else {
        console.log("unknown method " + request.method);
    }
};


/* #### Action Menu && Options Page ### */

var getRegisteredMenuCmdsByUrl = function(url) {
    var ret = [];
    for (var k in TM_cmds) {
        var c = TM_cmds[k];
        if (!url || c.url == url) ret.push(c);
    }
    return ret;
};

var getRegisteredMenuCmd = function(id) {
    var ret = null;
    var old = TM_cmds;
    TM_cmds = [];
    for (var k in old) {
        var c = old[k];
        if (c.id != id) {
            TM_cmds.push(c);
        } else {
            ret = c;
        }
    }
    // console.log("MC remove " + c.id);
    return ret;
};

var createActionMenuItems = function(url) {
    var ret = [];

    var s = convertMgmtToMenuItems(url);
    if (!s.length) {
        s.push({ name: 'No script is running', image: chrome.extension.getURL('images/info.png')});
        s.push({ name: 'Get some scripts...', image: chrome.extension.getURL('images/edit_add.png'), url: 'http://userscript.org', newtab: true});
    }
    ret = ret.concat(s);
    ret.push(createDivider());

    var c = convertMenuCmdsToMenuItems(url);
    if (c.length) c.push(createDivider());
    c.push(createAboutItem());

    ret = ret.concat(c);
    return ret;
};

var createOptionItems = function() {
    var ret = [];
    var c = [];

    ret.push({ name: 'Settings', heading: true});
    ret.push({ name: 'make includes more safe', id: 'safeUrls', option: true, checkbox: true, enabled: Config.values.safeUrls,
               desc:  '(if enabled for example  "http://*google.*/*" is interpreted as "http://*google.tld/*" to avoid this script to work on "http://www.google.myevilpage.com/")'});
    ret.push({ name: 'fix includes', id: 'tryToFixUrl', option: true, checkbox: true, enabled: Config.values.tryToFixUrl,
               desc: '(this option converts a simple "*" to "http://*/*")' });
    ret.push({ name: 'debug scripts', id: 'debug', option: true, checkbox: true, enabled: Config.values.debug,
               desc: '' });
    ret.push({ name: 'show fixed source', id: 'showFixedSrc', option: true, checkbox: true, enabled: Config.values.showFixedSrc,
               desc: '' });
    
    ret.push(createDivider());
    ret.push({ name: 'Installed UserScripts',  heading: true});

    var s = convertMgmtToMenuItems(null, true);
    if (!s.length) {
        s.push({ name: 'No script is installed', image: chrome.extension.getURL('images/info.png')});
        s.push({ name: 'Get some scripts...', image: chrome.extension.getURL('images/edit_add.png'), url: 'http://userscript.org', newtab: true});
    }
    ret = ret.concat(s);
    ret.push(createDivider());

    if (true) {
        ret.push({ name: 'Registered Menu Cmds', heading: true});

        c = convertMenuCmdsToMenuItems();
        if (c.length) c.push(createDivider());
    }
    ret = ret.concat(c);

    return ret;
};

var createDivider = function() {
    return divider = { name: '', divider: true};
};

var createAboutItem = function() {
    return { name: ' About TamperMonkey', image: chrome.extension.getURL('images/home.png'), url: 'http://tampermonkey.biniok.net/about.html?version=' + chrome.extension.getVersion(), newtab: true };
};

var convertMenuCmdsToMenuItems = function(url) {
    var ret = [];
    var arr = getRegisteredMenuCmdsByUrl(url);

    for (var k in arr) {
        var c = arr[k];
        var item = { name: c.name, id: c.id, image: chrome.extension.getURL('images/gear.png'), menucmd: true };
        ret.push(item);
    }
    return ret;
};

var convertMgmtToMenuItems = function(url, options) {
    if (options == undefined) options = false;
    var scripts = determineScriptsToRun(url);
    var ret = [];

    for (var k in scripts) {
        var script = scripts[k];
        var img = script.icon;
        if (img == '') {
            img = script.enabled
                ? chrome.extension.getURL('images/cnr.png')
                : chrome.extension.getURL('images/clicknrungrey.png');
        }
        var item = { name: script.name,
                     id: script.name,
                     image: img,
                     checkbox: !options,
                     enabled: script.enabled,
                     compat_metadata: script.compat_metadata,
                     compat_foreach: script.compat_foreach,
                     compat_arrayleft: script.compat_arrayleft,
                     compat_filterproto: script.compat_filterproto,
                     poll_unsafewindow: script.poll_unsafewindow,
                     poll_unsafewindow_allvars: script.poll_unsafewindow_allvars,
                     poll_unsafewindow_interval: script.poll_unsafewindow_interval,
                     userscript: true };
        if (options) {
            item.code = script.textContent;
            if (Config.values.showFixedSrc) {
                item.code = compaMo.mkCompat(script.textContent, script);
            }
        }
        ret.push(item);
    }
    return ret;
};

/* ### Compatibility Mode */

var compaMoInit = function () {

    this.mkCompat = function(src, script) {
        if (!script) {
            return this.unArrayOnLeftSideify(this.unEachify(this.unMetaDataify(src)));
        } else {
            if (script.compat_metadata) src = this.unMetaDataify(src);
            if (script.compat_foreach) src = this.unEachify(src);
            if (script.compat_arrayleft) src = this.unArrayOnLeftSideify(src);
        }
        return src;
    };

    this.debugify = function(src) {
        src = src.replace(/window\.setTimeout\(/g, 'TM_setTimeout(');
        src = src.replace(/window\.addEventListener\(/g, 'TM_addEventListener(');
        src = src.replace(/document\.setTimeout\(/g, 'TM_setTimeout(');
        src = src.replace(/document\.addEventListener\(/g, 'TM_addEventListener(');
        var re = new RegExp('(\\n| |\\t|;)(setTimeout)\\(', 'g')
        src = src.replace(re, '$1TM_$2(');
        return src;
    };

    this.checkFilterRegExp = function(src) {
        return (src.search(escapeForRegExp('.filter(/')) != -1);
    };

    /*
     * unArrayOnLeftSideify(src)
     *
     * replaces i.e
     *
     *  [, name, value] = line.match(/\/\/ @(\S+)\s*(.*)/);
     * 
     * by
     *
     *  var __narf6439 = line.match(/\/\/ @(\S+)\s*(.*)/);;
     *  name = __narf6439[1];
     *  value = __narf6439[2];
     *  ...
     *
     */
    this.unArrayOnLeftSideify = function(src) {

        var lines = src.split('\n');

        for (var k in lines) {
            var line = lines[k];
            var wosp = line.replace(/[\t ]/g, '');
            var a1 = wosp.search(']=');
            var a2 = wosp.search(']==');
            var k1 = wosp.search('\\[');
            if (k1 != -1) {
                var ee = wosp.substr(0, k1);
                // seems to be a valid array assignement like a[0] = 'blub';
                if (ee != '') a1 = -1;
            }
            
            if (a1 != -1 && a1 != a2) {
                var nl = '';
                // stupid hack detected!
                var ie = line.search("=");
                var value = line.substr(ie+1, line.length-ie-1);
                var randvar = '__narf' + k.toString();

                nl += 'var ' + randvar + ' = ' + value + ';\n';

                var vars = getStringBetweenTags(wosp, '[', ']=');
                var vara = vars.split(',');

                for (var e in vara) {
                    var v = vara[e];
                    if (v.trim() != '') nl += v + ' = ' + randvar + '[' + e + '];\n';
                }
                lines[k] = nl;
            }
        }

        return lines.join('\n');
    };

    /*
     * unEachify(src)
     *
     * replaces i.e
     *
     *  for each (mod in mods) {;
     * 
     * by
     *
     *  for (var k in mods) {;
     *     mod = mods[k];
     *     ...
     *
     */
    this.unEachify = function(src) {
        src = src.replace(/for each.*\(/gi, 'for each(');
    
        var t1 = 'for each';
        var t2 = '(';
        var t3 = ')';

        var arr = src.split(t1);

        for (var i = 1; i < arr.length; i++) {
            var a = arr[i];
            if (a.substr(0,1) != "(") {
                arr[i] = ' each' + arr[i];
                continue;
            }
            var f = getStringBetweenTags(a, t2, t3);
            var m = f.split(' ');
            var varname = null;
            var inname = null;
            var arrname = null;
            for (var e in m) {
                if (m[e] != '' && m[e] != 'var') {
                    if (!varname) {
                        varname = m[e];
                    } else if (!inname) {
                        inname = m[e];
                    } else if (!arrname) {
                        arrname = m[e];
                    }
                }
            }
            if (!varname || !arrname) {
                arr[i] = ' each' + arr[i];
                continue;
            }

            var n = 'var __kk in ' + arrname;
            var b = '';
            // detect arrays and filter the Array.prototype.filter function :-/
            b += '{\n' + '    if (typeof ' + arrname + '.length !== "undefined" && __kk == "filter") continue;';    
            b += ' \n' + '    var ' + varname + ' = ' + arrname + '[__kk];';

            arr[i] = arr[i].replace(escapeForRegExp(f), n).replace('{', b);
        }

        return arr.join('for');
    };

    /*
     * unMetaDataify(src)
     *
     * replaces i.e
     *
     *   var code = <><![CDATA[
     *   if (this._name == null || refresh) {
     *     this._name = this.name();
     *   }
     *   ret = this._name;
     *   ]]></>.toString();
     * 
     * by
     *
     *   var code = ("\n" + 
     *   "    if (this._name == null || refresh) {\n" + 
     *   "      this._name = this.name();\n" + 
     *   "    }\n" + 
     *   "    ret = this._name;\n" + 
     *   "").toString();
     *   ...
     *
     */
    this.unMetaDataify = function(src) {
        var s = src;
        var t = src;
        var t1 = '<><![CDATA[';
        var t2 = ']]></>';
        var pos = s.search(escapeForRegExp(t1));
        while (pos != -1) {
            var p = s.substr(0, pos);
            var lc = p.lastIndexOf('\n');
            var cc = '';
            if (lc != -1) cc = p.substr(lc, p.length - lc);
            s = s.substr(pos, s.length-pos);

            // check if commented
            var c1 = cc.search("\\/\\*");
            var c2 = cc.search("\\/\\/");
            if (c1 == -1 &&
                c2 == -1) {
                var z = getStringBetweenTags(s,t1, t2);
                var x;
                x = z.replace(/\"/g, '\\"').replace(/\n/g, '\\n" + \n"');
                x = x.replace(/^\n/g, '').replace(/\n$/g, '');
                var g = t1+z+t2;
                t = t.replace(g, '(new CDATA("' + x + '"))');
            }
            s = s.substr(1, s.length-1);
            pos = s.search(escapeForRegExp(t1));
        }

        return t;
    };
};

/* ### Listener ### */
    
var loadListener = function(tabID, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        if (tab.url.search(/\.tamper\.js$/) != -1) {
            var request = function(tob) {
                chrome.tabs.sendRequest(tob.id,
                                        { method: "getSrc" },
                                        function(response) {
                                            addNewUserScript(tab.id, response.src);
                                        });
            };
            chrome.tabs.getSelected(null, request);
        }
    }
};

var updateListener = function(tabID, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        if (tab.title.search(tab.url + " is not available") != -1) {
            var reload = function() {
                console.log("trigger reload (tabID " + tabID + ") of " + tab.url);
                chrome.tabs.update(tabID, {url: tab.url});
            };
            window.setTimeout(reload, 20000);
        } else {
            var scripts = determineScriptsToRun(tab.url);
                
            for (var k in scripts) {
                var script = scripts[k];
                if (!script.enabled) continue;
                Runtime.contentLoad(tab, script);
            }
        }
    }
};

var Poller = new unsafeWindowPollerInit();
// determine excludable items like chrome, dcoument, getElementById and so on afap
windowExcludes = Poller.getWindowExcludes();

var Runtime = new runtimeInit();
var Config = new configInit();
var compaMo = new compaMoInit();

chrome.extension.onRequest.addListener(requestHandler);
// the content script sends a request when it's loaded.. this happens just once ;)
chrome.tabs.onUpdated.addListener(loadListener);
