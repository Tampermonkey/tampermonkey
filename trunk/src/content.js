/**
 * @filename content.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var TM_context_id = '"##SCRIPTID##"';
var domContentLoaded = false;
var domEvent = "DOMContentLoaded";
var loadEvent = "load";
var domEventListener = function() {
    domContentLoaded = true;
};
var loadEventListener = function() {
    loadEvent = true;
};

var TM_addloadEventListener = function(fn, addWTime) {
    if (loadEvent) {
        var run = function(fn, retries) {
            if (document.getElementsByTagName('body').length == 0 &&
                retries-- > 0) {
                // console.log("load already fired! but no body");
                window.setTimeout(function() { run(fn, retries); }, 100);
            } else if (addWTime) {
                window.setTimeout(function() { fn(); }, addWTime);
            } else {
                fn();
            }
        };
        run(fn, 200);
    } else {
        document.addEventListener(loadEvent, fn, false);
    }
    document.removeEventListener(loadEvent, loadEventListener, false);
};

var TM_addDomContentLoadedListener = function(fn) {
    if (domContentLoaded) {
        // console.log("DOMContentLoaded already fired! Running script...");
        fn();
    } else {
        document.addEventListener(domEvent, fn, false);
    }
    document.removeEventListener(domEvent, domEventListener, false);
};

document.addEventListener(domEvent, domEventListener, false);
document.addEventListener(loadEvent, loadEventListener, false);

var TM_run = function (fn, p, arg) {
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

var TM_log = function(message) {
    console.log(message);
};

var TM_addStyle = function(css) {
    var style = document.createElement('style');
    style.textContent = css;
    document.getElementsByTagName('head')[0].appendChild(style);
};

var TM_getResourceText = function(name) {
    for (var k in TM_resources) {
        var r = TM_resources[k];
        if (r.name == name) {
            return r.resText;
        }
    }
    return null;
};

var TM_getResourceURL = function(name) {
    for (var k in TM_resources) {
        var r = TM_resources[k];
        if (r.name == name) {
            return r.resURL;
        }
    }
    return null;
};

var TM_registerMenuCommand = function(name, fn) {
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

var TM_openInTab = function(url) {
    chrome.extension.sendRequest({method: "openInTab", url: url}, function(response) {});
};

var TM_xmlhttpRequest = function(details) {
    chrome.extension.sendRequest({method: "xhr", details: details}, function(response) {
                                     if (details["onload"]) {
                                         if (response.data.responseXML) response.data.responseXML = unescape(response.data.responseXML);
                                         details["onload"](response.data);
                                     }
                                 });
}
    
    var TM_getTab = function(cb) {
        chrome.extension.sendRequest({method: "getTab"}, function(response) {
                                             if (cb) {
                                                 cb(response.data);
                                             }
                                     });
    };

var TM_saveTab = function(tab) {
    chrome.extension.sendRequest({method: "saveTab", tab: tab});
};

var TM_getTabs = function(cb) {
    chrome.extension.sendRequest({method: "getTabs"}, function(response) {
                                     if (cb) {
                                         cb(response.data);
                                     }
                                 });
};

var TM_getVersion = function() {
    // will be replaced later
    return "##VERSION##";
};

var TM_installScript = function(src) {
    chrome.extension.sendRequest({method: "scriptClick", src: src}, function(response) {});
};

var TM_addEventListener = function (event, fn) {
    window.addEventListener(event, function (e) { TM_run(fn, 'Evt: ' + event, e) });
};

var TM_setTimeout = function (fn, time) {
    window.setTimeout(function () { TM_run(fn, 'Timout: ' + time) }, time);
};

var GM_EMU = function() {
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

var HTM_generateScriptId = function(){
    var ret = '';
    ret += ((new Date()).getTime().toString());
    ret += Math.floor ( Math.random ( ) * 07011982 + 1 )
    return ret;
};

var HTM_envReplacer = function(str, version, name, scriptid) {
    var re_ver = new RegExp( "##VERSION##", 'g');
    var re_name = new RegExp( "##SCRIPTNAME##", 'g');
    var re_id = new RegExp( "##SCRIPTID##", 'g');
    str = str.replace(re_ver, version);
    str = str.replace(re_name, name + "_");
    str = str.replace(re_id, scriptid);
    return str
};

var HTM_runMyScript = function(HTM_request) {
    var TM_context_storage = HTM_request.storage;
    var TM_context_name = HTM_request.script.name;
    var HTM_script = HTM_request.script;

    var HTM_storageUpdater = function() {
        chrome.extension.sendRequest({method: "addStorageListener", name: TM_context_name},
                                     function(response) {
                                         if (response.storage &&
                                             response.storage.ts > TM_context_storage.ts) {
                                             TM_context_storage = response.storage;
                                         }
                                         if (response.error) {
                                             console.log("Error: adding my storage listener... :(");
                                         } else {
                                             // console.log("readd storage listener!");
                                             HTM_storageUpdater()
                                         }
                                     });
    }

    var HTM_saveStorage = function() {
        chrome.extension.sendRequest({method: "saveStorage", name: TM_context_name, storage: TM_context_storage});
    };

    var TM_saveStorage = function() {
        HTM_saveStorage();
    };

    var TM_deleteValue = function(name) {
        TM_context_storage.ts = (new Date()).getTime();
        TM_context_storage.data[name] = undefined;
        TM_saveStorage();
    };

    var TM_listValues = function() {
        var ret = new Array();
        for (var n in TM_context_storage.data) {
            ret.push(n);
        }
        return ret;
    };

    var TM_getValue = function(name, defaultValue) {
        var value = TM_context_storage.data[name];
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

    var TM_setValue = function(name, value) {
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

        TM_context_storage.ts = (new Date()).getTime();
        TM_context_storage.data[name] = value;
        TM_saveStorage();
    };
    
    (function() {

        var env = ''
        for (var k in window) {
            if (k.length > 2  && k.substr(0,3) == 'TM_') {
                // console.log("map " + k);
                env += 'this["'+k+'"] = ' + this[k].toString() + ';\n';
            }
        }

        var emu = '';
        var e = new GM_EMU();
        for (var k in e) {
            emu += "var " + k + " = " + e[k].toString() + ";\n";
        }

        unsafeWindow = window;
        var uneval = function(arg) { try { return "\$1 = " + JSON.stringify(arg) + ";"; } catch (e) { alert(e) } };
        var CDATA = function(arg) { this.src = arg; this.toString = function() { return this.src; }; this.toXMLString = this.toString; };
        var TM_resources = HTM_script.resources;

        if (HTM_script.compat_filterproto) {
            console.log("env option: overwrite Array.filter");
            
            Array.prototype.filter = function(fun /*, thisp*/) {
                
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
        }

        if (HTM_script.poll_unsafewindow) {

            var poD = 'tampermonkeyPollerDiv';
            var puD = 'tampermonkeyPusherDiv';
            var Poller = new HTM_pollerInit(HTM_script.poll_unsafewindow_interval,
                                            poD, puD);

            var poll = Poller.pollerSrc.toString();
            
            poll = poll.replace(/##INTERVAL##/g, HTM_script.poll_unsafewindow_interval);
            poll = poll.replace(/##POLLERDIVID##/g, poD);
            poll = poll.replace(/##PUSHERDIVID##/g, puD);
            poll = poll.replace(/##POLLEREXCLUDEWINDOW##/g, HTM_request.windowExcludes);

            if (HTM_script.poll_unsafewindow_allvars) {
                // all vars should be transfered, exclude at least chrome window specific ones
                poll = poll.replace(/##POLLERINCLUDES##/g, JSON.stringify([]));
                console.log("env option: poll all unsafeWindow vars");
            } else if (HTM_request.scriptIncludes.length > 2) {
                poll = poll.replace(/##POLLERINCLUDES##/g, HTM_request.scriptIncludes);
                console.log("env option: poll " + HTM_request.scriptIncludes.length + " unsafeWindow vars");
            }

            if (HTM_script.poll_unsafewindow_allvars || HTM_request.scriptIncludes.length > 2) {
                var injector = function(retries) {
                    if (retries == undefined) retries = 100;
                    if (!Poller.inject(poll)) {
                        if (retries-- > 0) {
                            window.setTimeout(function() { injector(retries); }, 500);
                        } else {
                            console.log("Error: poller injection failed!");
                        }
                        return;
                    }
                    Poller.fillUnsafeWindow();
                }
                injector();
            }
        }

        var sec = '';
        for (var k in window) {
            if (k.length > 3  && k.substr(0,4) == 'HTM_') {
                // console.log("hide " + k);
                sec += 'var ' + k + ' = undefined;\n';
            }
        }

        var src = env + emu + sec + HTM_request.code;
        src =  'function run_##SCRIPTID##() { try {\n' + src +';\n} catch (e) { console.log("Run:" + e); } };\n';
        src += 'TM_addDomContentLoadedListener(run_##SCRIPTID##);\n';
        src = HTM_envReplacer(src, HTM_request.version, HTM_script.name, TM_context_id);

        // console.log(src);
        eval(src);
    })();

    HTM_storageUpdater();
    window.addEventListener('unload', HTM_saveStorage, false);
};


/* ########## POLLER ############ */

var HTM_pollerInit = function(pusherInterval, pollerDivId, pusherDivId) {

    this.pollerExcludeNames = [];
    this.pollerExcludeTypes = [];
    this.lastUpdate = 0;

    this.inject = function(src) {
        var s = document.createElement('script');
        var b = document.getElementsByTagName('body');
        if (!b.length) return null;

        src = src.replace(/##POLLEREXCLUDETYPES##/g, JSON.stringify(this.pollerExcludeTypes));
        src = src.replace(/##POLLEREXCLUDENAMES##/g, JSON.stringify(this.pollerExcludeNames));
        src = 'try { (' + src + ')(); } catch (e) { console.log("Poller:" + e); }\n'

        // console.log(src);
        
        s.textContent = src;
        b[0].appendChild(s);

        return true;
    };

    var createFakeFunction = function(name, source, path) {
        /* Function.prototype.toString = function() {
            return source;
            } */
        var f = function(a) {
            var d = document.getElementById(pollerDivId);
            var args = [];
            for (var i=0; i<arguments.length; i++) {
                // console.log("name: " + name + " " + arguments[i]);
                args.push(arguments[i]);
            }
            d.textContent += '\n' + JSON.stringify({name: name, path: path, args: args});
            // console.log("name: " + name + " path: " + path + " args: [" + args.join(',') + "]");
            var ts = ((new Date()).getTime().toString());
            d.setAttribute('ts', ts);
        };

        return f;
    };

    var unFunctionify = function(name, elem, path) {
        var fnkey = '__functions__';
        if (path == undefined) {
            path = name;
        } else {
            path += '.' + name;
        }

        var f = elem[fnkey];

        // console.log("unFunctionify " + path)
        for (var k in elem) {
            if (k == fnkey) continue;
            elem[k] = unFunctionify(k, elem[k], path);
        }
        for (var k in f) {
            // console.log("createFakeFunction " + path + '.' + f[k].name); // + ' = ' + f[k].src);
            elem[f[k].name] = createFakeFunction(f[k].name, f[k].src, path);
            // console.log("replace " + path + '.' + f[k].name);
        }
        return elem;
    };

    this.fillUnsafeWindow = function() {
        var oobj = (typeof oobj === 'undefined') ? this : oobj;
        var d = document.getElementById(pusherDivId);
        if (d) {
            try {
                var ts = d.getAttribute('ts');
                if (ts && ts > oobj.lastUpdate) {
                    // console.log('##d ' + (typeof d.textContent) + '\n' + d.textContent);
                
                    var a = JSON.parse(d.textContent);
                    if (typeof a === 'string') a = JSON.parse(a);
                    // console.log('##a ' + (typeof a) + '\n' + a);

                    for (var i = 0; i <a.length; i++) {
                        var j = a[i];
                        if (j.name != undefined) {
                            try {
                                if (j.type == 'function') {
                                    unsafeWindow[j.name] = createFakeFunction(j.name, j.src, '');
                                    // console.log("replace unsafeWindow fn " + j.name + '\n'); //  + unsafeWindow[j.name].toString());
                                } else if (j.value != undefined) { 
                                    unsafeWindow[j.name] = unFunctionify(j.name, j.value);
                                    // console.log("replace unsafeWindow elem " + j.name); // + " " + unsafeWindow[j.name].toString());
                                }
                            } catch (f) {
                                console.log("fillUnsafeWindow: (" + j.name + ")" + f);
                            }
                        }
                    }
                    this.lastUpdate = ts;
                }
            } catch (e) {
                console.log("Error:" + e);
            }
        }

        if (pusherInterval) window.setTimeout(function() { oobj.fillUnsafeWindow() }, pusherInterval);
    };

    this.pollerSrc = function() {
        var dbg = true;
        var pollerInterval = Number('500');
        var pusherInterval = Number('##INTERVAL##');
        var pollerIncludes = JSON.parse('##POLLERINCLUDES##');;
        var pollerExcludeWindow = JSON.parse('##POLLEREXCLUDEWINDOW##');
        var pollerExcludeTypes = JSON.parse('##POLLEREXCLUDETYPES##');
        var pollerExcludeNames = JSON.parse('##POLLEREXCLUDENAMES##');
        var pollerDivId = '##POLLERDIVID##';
        var pusherDivId = '##PUSHERDIVID##';
        var pollerTs = 0;
        var pusherExcludeObjs = [window, top, parent, document];
        var pusherExcludes = ['childNodes', 'parent', 'parentNode', 'parentElement','previousSibling',
                             'firstElementChild', 'previousElementSibling', 'nextElementSibling', 'offsetParent',
                             'children', 'lastElementChild', 'lastChild', 'firstChild']

        var createDivs = function() {
            var polldiv = document.createElement('div');
            polldiv.setAttribute('id', pollerDivId);
            polldiv.setAttribute('style','display: none;');
            var pushdiv = document.createElement('div');
            pushdiv.setAttribute('id', pusherDivId);
            pushdiv.setAttribute('style','display: none;');

            var b = document.getElementsByTagName('body');

            if (!b.length) return null;

            b[0].appendChild(polldiv);
            b[0].appendChild(pushdiv);
        };

        var pushDiv = function(interval) {
            if (interval == undefined) interval = 10;
            // if (dbg) console.log('push start');
            fillPusherDiv();
            if (interval < pollerInterval) interval *= 2;
            if (pusherInterval) window.setTimeout(function() { pushDiv(interval); }, (interval < pusherInterval) ? interval : pusherInterval);
            // if (dbg) console.log('push end');
        };

        var pollDiv = function() {
            // if (dbg) console.log('poll start');
            runPollerDiv();
            if (pollerInterval) window.setTimeout(function() { pollDiv(); }, pollerInterval);
            // if (dbg) console.log('poll end');
        };

        var isIncluded = function(n) {
            for (var i=0; i<pollerIncludes.length; i++) {
                if (pollerIncludes[i] == n) return true;
            }
            return (pollerIncludes.length == 0);
        };

        var isExcluded = function(t, n, e) {
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

        var runPollerDiv = function() {
            var d = document.getElementById(pollerDivId);
            if (!d) return;
            var ts = d.getAttribute('ts');
            if (ts > pollerTs) {
                pollerTs = ts;
                // console.log("#!#" + d.textContent);
                var a = d.textContent.split("\n");
                for (var i=0; i<a.length; i++) {
                    var e = a[i].trim();
                    if (e != '') {
                        try {
                            var o = JSON.parse(e);
                            var r = '';
                            if (o.args) {
                                for (var x=0;x<o.args.length;x++) {
                                    var a = o.args[x];
                                    if (r != '') r += ',';
                                    if (typeof a === 'string') {
                                        r += JSON.stringify(a);
                                    } else {
                                        r += a;
                                    }
                                }
                            }
                            var n = o.name;
                            if (o.path) {
                                n = o.path + '.' + o.name;
                            }
                            // console.log("eval(" + o.name + '(' + r + ');) ts: ' + ts + ' pTs ' + pollerTs);
                            eval(n + '(' + r + ');');
                        } catch (f) {
                            console.log("runPollerDiv:" + f + '\nContent: ' + d.textContent);
                        }
                    }
                }
                d.textContent = '';
                fillPusherDiv();
            }
        };

        var isPusherExcluded = function(n) {
            for (var i=0; i<pusherExcludes.length; i++) {
                if (pusherExcludes[i] == n) return true;
            }
            return false;
        };

        var markFunctions = function(name, elem, max, parents) {
            if (max == undefined) max = 0;
            if (max > 8) return elem;
            var r = {};
            if (typeof elem !== 'undefined' && elem != null) {
                var f = [];
                var c = 0;
                for (var k in elem) {
                    if (isExcluded(typeof elem[k], k, elem[k])) continue;
                    if (typeof elem[k] === 'function') {
                        // console.log("pushFunction:" + k);
                        f.push({ name: k, type: typeof elem[k]}); // , src: elem[k].toString()});
                    } else {
                        if (typeof elem[k] === 'object') {
                            if (!elem.hasOwnProperty(k) || isPusherExcluded(k)) {
                                // console.log("inherited or excluded value...: " + k);
                                continue;
                            }
                            var drin = false;
                            for (var i=0; i<parents.length; i++) {
                                if (parents[i] == elem[k]) {
                                    drin = true;
                                    break;
                                }
                            }
                            if (drin) continue;
                            // console.log("markFn: " + k + "(" + typeof elem[k] + ")");
                            var t = markFunctions(k, elem[k], max+1, parents.concat([elem[k]]));
                            // try {
                            //JSON.stringify(t);
                            r[k] = t;
                            //} catch (e) {}
                        } else {
                            // console.log("value: " + k + "("+typeof elem[k]+") = "); //  + elem[k].toString());
                            r[k] = elem[k];
                        }
                    }
                    if (c++ > (128/(max+1))) break;
                }
                r['__functions__'] = f;
            }
            return r;
        };

        var fillPusherDiv = function() {
            var getPropsFromObj = function(obj, parent) {
                if (parent == undefined) parent = '';
                var c = [];
                for (var k in obj) {
                    if (!isIncluded(k) || isExcluded(typeof window[k], k)) continue;
                    var elem = obj[k];
                    try {
                        if (typeof elem === 'function') {
                            // console.log("pushFN: " + k);
                            c.push({ name: parent + k, type: typeof elem}); //, src: elem.toString(),});
                        } else {
                            var r;
                            if (typeof elem === 'object') {
                                // console.log("markFN: " + k);
                                r = markFunctions(parent + k, obj[k], 0, pusherExcludeObjs);
                                JSON.stringify(r);
                            } else {
                                // console.log("value: " + k);
                                r = elem;
                            }
                            c.push({ name: parent + k, value: r, type: typeof r});
                        }
                    } catch (e) {
                        console.log("error adding " + parent + k + '(' + typeof obj[k] + ') to poll array\n' + e);
                    }
                }
                return c;
            }

            var c = getPropsFromObj(window);
            if (false && top != window) {
                c.concat(getPropsFromObj(top, 'top.'));
            }

            var d = document.getElementById(pusherDivId);
            d.innerHTML = JSON.stringify(c);
            // console.log("##f" + JSON.stringify(c));
            var ts = ((new Date()).getTime().toString());
            d.setAttribute('ts', ts);
        };

        createDivs();
        pushDiv();
        pollDiv();
    };
};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "confirm") {
            var c = confirm(request.msg);
            sendResponse({confirm: c});
        } else if (request.method == "showMsg") {
            alert(request.msg);
            sendResponse({});
        } else if (request.method == "reload") {
            window.location = window.location;
            sendResponse({});
        } else if (request.method == "executeScript") {
            TM_context_id = HTM_generateScriptId()
            var r = function() {
                HTM_runMyScript(request);
                sendResponse({});
            };
            if (request.script.poll_unsafewindow) {
                TM_addloadEventListener(r, 0);// 2000 TODO: make this script specific
            } else {
                r();
            }
        } else if (request.method == "loadUrl") {
            window.location = request.url;
            sendResponse({});
        } else {
            console.log("unknown method " + request.method);
        }
    });

chrome.extension.sendRequest({ method: "onUpdate" }, function(response) {});
