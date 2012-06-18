/**
 * @filename background.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var trup = null;
var rase = null;
var rsse = null;
var init = null;
var fire = null;
var exte = null;
var lfgs = null;

var D = false;
var V = false;
var T = false;
var EV = false;
var MV = false;
var UV = false;
var SV = false;
var CV = false;
var NV = false;

// protect against other background pages
(function() {

var adjustLogLevel = function(logLevel) {
    D |= (logLevel >= 60);
    V |= (logLevel >= 80);
    EV |= (logLevel >= 100);
    MV |= (logLevel >= 100);
    UV |= (logLevel >= 100);
    SV |= (logLevel >= 100);
    CV |= (logLevel >= 100);
    NV |= (logLevel >= 100);
};

if (D || V) console.log("Starting background fred");

const eERROR = -2;
const eOLDER = -1;
const eEQUAL = 0;
const eNEWER = 1;

const cUSOHASH = 'uso:hash';
const cUSOTS = 'uso:timestamp';
const cUSOSCRIPT = 'uso:script';

var _use_localdb = true;
var _retries = 5; // global xmlHttpRequest retry var
var _setTimeout = 1;
var _webRequest = { use: true, delay: false, verified: false, verifyCnt : 20, id: 0, prefix: 'TM_', testprefix: 'foobar' };

var TM_tabs = {};
var TM_storageListener = [];
var closeableTabs = {};

var upNotification = null;
var ginit = false;

var condAppendix = '@re';
var storeAppendix = '@st';
var scriptAppendix = '@source';

var urlAll = '://*/*';
var urlAllHttp = 'http' + urlAll;
var urlAllHttps = 'https' + urlAll;
var urlAllInvalid = '*';
var urlSecurityIssue = '.*/';
var urlTld = '.tld/';
var urlTlds = 'museum|travel|aero|arpa|coop|info|jobs|name|nvus|biz|com|edu|gov|int|mil|net|org|pro|xxx|ac|ad|ae|af|ag|ai|ak|al|al|am|an|ao|aq|ar|ar|as|at|au|aw|ax|az|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|co|cr|cs|ct|cu|cv|cx|cy|cz|dc|de|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fl|fm|fo|fr|ga|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gu|gw|gy|hi|hk|hm|hn|hr|ht|hu|ia|id|id|ie|il|il|im|in|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|ks|kw|ky|ky|kz|la|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|ma|mc|md|md|me|mg|mh|mi|mk|ml|mm|mn|mn|mo|mo|mp|mq|mr|ms|ms|mt|mt|mu|mv|mw|mx|my|mz|na|nc|nc|nd|ne|ne|nf|ng|nh|ni|nj|nl|nm|no|np|nr|nu|ny|nz|oh|ok|om|or|pa|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|pr|ps|pt|pw|py|qa|re|ri|ro|ru|rw|sa|sb|sc|sc|sd|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|tn|to|tp|tr|tt|tv|tw|tx|tz|ua|ug|uk|um|us|ut|uy|uz|va|va|vc|ve|vg|vi|vi|vn|vt|vu|wa|wf|wi|ws|wv|wy|ye|yt|yu|za|zm|zw';
var url2LevelTlds = "de.net|gb.net|uk.net|dk.org|eu.org|asn.au|com.au|conf.au|csiro.au|edu.au|gov.au|id.au|info.au|net.au|org.au|otc.au|oz.au|telememo.au|ac.cn|ah.cn|bj.cn|com.cn|cq.cn|edu.cn|gd.cn|gov.cn|gs.cn|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|jl.cn|js.cn|ln.cn|mo.cn|net.cn|nm.cn|nx.cn|org.cn|qh.cn|sc.cn|sh.cn|sn.cn|sx.cn|tj.cn|tw.cn|xj.cn|xz.cn|yn.cn|zj.cn|ac.jp|ad.jp|aichi.jp|akita.jp|aomori.jp|chiba.jp|co.jp|ed.jp|ehime.jp|fukui.jp|fukuoka.jp|fukushima.jp|gifu.jp|go.jp|gov.jp|gr.jp|gunma.jp|hiroshima.jp|hokkaido.jp|hyogo.jp|ibaraki.jp|ishikawa.jp|iwate.jp|kagawa.jp|kagoshima.jp|kanagawa.jp|kanazawa.jp|kawasaki.jp|kitakyushu.jp|kobe.jp|kochi.jp|kumamoto.jp|kyoto.jp|lg.jp|matsuyama.jp|mie.jp|miyagi.jp|miyazaki.jp|nagano.jp|nagasaki.jp|nagoya.jp|nara.jp|ne.jp|net.jp|niigata.jp|oita.jp|okayama.jp|okinawa.jp|or.jp|org.jp|osaka.jp|saga.jp|saitama.jp|sapporo.jp|sendai.jp|shiga.jp|shimane.jp|shizuoka.jp|takamatsu.jp|tochigi.jp|tokushima.jp|tokyo.jp|tottori.jp|toyama.jp|utsunomiya.jp|wakayama.jp|yamagata.jp|yamaguchi.jp|yamanashi.jp|yokohama.jp|ac.uk|co.uk|edu.uk|gov.uk|ltd.uk|me.uk|mod.uk|net.uk|nhs.uk|nic.uk|org.uk|plc.uk|police.uk|sch.uk|co.tv";
var urlAllTlds = ("(" + [urlTlds, url2LevelTlds].join("|") + ")").replace(/\./gi, "\\.");
var allURLs = {};
var scriptOptions = [];
var requireCache = {};

/* ###### Helpers ####### */

var initScriptOptions = function() {
    var d = new scriptParser.Script();
    for (var k in d.options) {
        if (!d.options.hasOwnProperty(k)) continue;
        scriptOptions.push(k);
    }
};

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
    // return:
    //     eNEWER if v1 > v2
    //     eEQUAL if v1 == v2
    //     eOLDER if v1 < v2
    if (V) console.log("versionCmp: " + v1 + " : " + v2);

    var a1 = v1.split(".");
    var a2 = v2.split(".");

    var len = a1.length < a2.length ? a1.length : a2.length;

    for (var i=0; i<len; i++) {
        if (a1.length < len) a1[i] = 0;
        if (a2.length < len) a2[i] = 0;
        if (Number(a1[i]) > Number(a2[i])) {
            return eNEWER;
        } else if (Number(a1[i]) < Number(a2[i])) {
            return eOLDER;
        }
    }

    return eEQUAL;
};

var getConverter = function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "convert.js", false);
    xhr.send(null);
    var x = window['eval'](xhr.responseText);
    return x;
};

var getRawContent = function(file) {
    var url = chrome.extension.getURL(file);
    var content = null;
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        content = xhr.responseText;
        if (!content) console.log("WARN: content of " + file + " is null!");
    } catch (e) {
        console.log("getRawContent " + e);
    }
    return content;
};

var include = function(file) {
    window['eval'](getRawContent(file));
};

/* ###### URL Handling ####### */

var escapeForRegExpURL = function(str, more) {
    if (more == undefined) more = [];
    var re = new RegExp( '(\\' + [ '/', '.', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ].concat(more).join('|\\') + ')', 'g');
    return str.replace(re, '\\$1');
};

var escapeForRegExp = function(str, more) {
    return escapeForRegExpURL(str, ['*']);
};

var getRegExpFromUrl = function(url, safe, match) {
    var u;
    if ((Config.values.tryToFixUrl || safe) && url == urlAllInvalid) {
        u = urlAllHttp;
    } else if ((Config.values.safeUrls || safe) && url != urlAllHttp && url != urlAllHttps && url.search(escapeForRegExpURL(urlSecurityIssue)) != -1) {
        u = url.replace(escapeForRegExpURL(urlSecurityIssue), urlTld);
    } else {
        u = url;
    }

    if (match) {
        // @match *.biniok.net should match at "foo.biniok.net" and "biniok.net" but not evil.de#biniok.net
        // TODO: is this allowed to work on foo.*.net too?
        // TODO: is there a better way then using <>?
        u = u.replace(/\*\.([a-z0-9A-Z\.%].*\/)/gi, "<>$1");
    }

    u = '^' + escapeForRegExpURL(u);
    u = u.replace(/\*/gi, '.*');
    u = u.replace(escapeForRegExpURL(urlTld), '.' + urlAllTlds + '\/');
    u = u.replace(/(\^|:\/\/)\.\*/, '$1([^\?#])*');
    u = u.replace("<>", '([^\/#\?]*\\.)?');

    return '(' + u + ')';
};

/* ###### Extension Helpers ####### */

chrome.extension.getVersion = function() {

    if (!chrome.extension.version_) {
        var url = chrome.extension.getURL('manifest.json');
        try {
            var manifest;
            if (url && url.search('{') != -1) {
                manifest = JSON.parse(url);
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.send(null);
                manifest = JSON.parse(xhr.responseText);
            }
            chrome.extension.version_ = manifest.version;
            chrome.extension.updateurl_ = manifest.update_url;
        } catch (e) {
            console.log("getVersion" + e);
            chrome.extension.version_ = '0.0.0.0';
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

/* ###### version related data conversion ####### */

var convertData = function(convertCB) {

    var determineOldVersion = function() {
        var d = "0.0.0.0";
        var v = d;
        if (_use_localdb) {
            var v = TM_storage.getValue("TM_version", d);
            if (d == v) {
                _use_localdb = false;
                v = TM_storage.getValue("TM_version", d);
                _use_localdb = true;
            }
        }
        return v;
    };
    var newversion = chrome.extension.getVersion();
    var version = determineOldVersion();

    var restoreAllScriptsEx = function(processSource) {
        var d = new scriptParser.Script();
        var names = getAllScriptNames();
        for (var k in names) {
            var n = names[k];
            var r = loadScriptByName(n);
            if (!r.script || !r.cond) {
                console.log(chrome.i18n.getMessage("fatal_error") + " (" + n + ")" +"!!!");
                continue;
            }
            for (var i=0; i<scriptOptions.length;i++) {
                if (r.script.options[scriptOptions[i]] == undefined) {
                    console.log("set option " + scriptOptions[i] + " to " + JSON.stringify(d.options[scriptOptions[i]]));
                    r.script.options[scriptOptions[i]] = d.options[scriptOptions[i]];
                }
            }
            if (processSource) {
                var ss = { url: r.script.fileURL,
                           src: r.script.textContent,
                           ask: false,
                           cb : function() { /* done! */ },
                           hash: r.script.hash };
                addNewUserScript(ss);
            } else {
                r.script.id = scriptParser.getScriptId(r.script.name);
                storeScript(r.script.name, r.script);
            }
        }
    };

    var resaveAllScriptsEx = function() {
        restoreAllScriptsEx(true);
    };

    var isNewVersion = versionCmp(newversion, version) == eNEWER;

    var checks = [];
    var checkCnt = 0;
    var running = false;
    var runChecks = function() {
        if (checkCnt < checks.length) {
            var enqueue = function() {
                window.setTimeout(runChecks, _setTimeout);
            };
            if (checks[checkCnt].cond) {
                checks[checkCnt].fn(enqueue);
            } else {
                enqueue();
            }
            checkCnt++;
        }
    };

    checks = [
        { cond: isNewVersion && versionCmp("1.0.0.4", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 1.0.0.4");
                reorderScripts(null, null);
                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: isNewVersion && _use_localdb && versionCmp("1.2", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 1.2");
                var names = [];
                TM_storage.deleteAll();
                for (var i=0; i<localStorage.length; i++) {
                    var name = localStorage.key(i);
                    _use_localdb = false;
                    var value = TM_storage.getValue(name, null);
                    _use_localdb = true;
                    if (value) {
                        if (V) console.log("Copy from localStorage: " + name + " -> " + value);
                        TM_storage.setValue(name, value);
                    }
                    names.push(name);
                }
                for (var i=0; i<names.length; i++) {
                    localStorage.removeItem(names[i]);
                }
                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: isNewVersion && versionCmp("2.0.2316", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 2.0.2316");
                restoreAllScriptsEx(false);
                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: isNewVersion && versionCmp("2.3", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 2.3");
                resaveAllScriptsEx();
                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: isNewVersion && versionCmp("2.3.2597", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 2.3.2597");

                var last = getUpdateCheckCfg();
                last.fire.last = 0;
                last.fire.db_version = 0;
                last.fire.entries = 0;
                setUpdateCheckCfg(last);
                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: isNewVersion && versionCmp("2.3.2660", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 2.3.2660");
                // not needed anymore
                removeUserScript('TamperScript');
                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: isNewVersion,
          fn : function(cb) {
                console.log("First run of version " + newversion + "!");

                upNotification = newversion;
                TM_storage.setValue("TM_version", newversion);

                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: true,
          fn : function(cb) {
                if (convertCB) convertCB();
                window.setTimeout(cb, _setTimeout);
            }
        }
    ];

    runChecks();

    rase = restoreAllScriptsEx;
    rsse = resaveAllScriptsEx;
};

/* ###### requires cache ####### */

var cacheValidPeriod = 30 * 60 * 1000;
var cacheCheckPeriod = 3 * 60 * 1000;

 var addToRequireCache = function(url, content, headers) {
    if (V || CV) console.log("cache: add '" + url + "'");
    requireCache[url] = { ts: (new Date()).getTime(), content: content, headers: headers }
};

var getFromRequireCache = function(url) {
    var ret = requireCache[url];
    if (ret) requireCache[url].ts = (new Date()).getTime();
    if (V || CV) console.log("cache: " + (ret ? "found" : "missed") + " '" + url + "'");
    return ret;
};

var cleanRequireCache = function() {
    if (V || CV) console.log("cache: check");
    var t = (new Date()).getTime() - cacheValidPeriod;
    var d = [];
    for (var k in requireCache) {
        if (!requireCache.hasOwnProperty(k)) continue;
        var i = requireCache[k];
        if (i && i.ts) {
            if (i.ts < t) {
                d.push(k);
            }
        }
    }

    for (var k in d) {
        if (!d.hasOwnProperty(k)) continue;
        delete requireCache[d[k]];
        if (V || CV) console.log("cache: remove '" + d[k] + "'");
    }

    window.setTimeout(cleanRequireCache, cacheCheckPeriod);
};

cleanRequireCache();

/* ####### local file permission #### */

var localFile = {
    id : 0,
    callbacks: {},
    listener: function(event, d) {
        d = event ? event.data : d;

        try {
            var data = JSON.parse(d);
            var o = localFile.callbacks[data.id];

            if (o) {
                if (o.cb) o.cb(data.content);
                if (o.iframe) o.iframe.parentNode.removeChild(o.iframe);
                delete localFile.callbacks[data.id];
            } else {
                console.log("Warn: localFile.getSource callback " + data.id + " not found!");
            }
        } catch (e) {
            console.log("ERR: localFile.getSource processing of " + d + " failed!");
        }
    },
    initialize : function() {
        // window.addEventListener('message', localFile.listener, false);
        // window.addEventListener('unload', localFile.clean, false);
    },
    clean: function() {
        // window.removeEventListener('message', localFile.listener, false);
        // window.removeEventListener('unload', localFile.clean, false);
        localFile.callbacks = {};
    },
    getSource : function(url, cb) {
        if (localFile.id == 0) {
            localFile.initialize();
        }

        var i = document.createElement('iframe');
        i.src = url + "?gimmeSource=1";
        document.getElementsByTagName('body')[0].appendChild(i);
    
        var post = function() {
            var d = JSON.stringify({ id: localFile.id });
            localFile.callbacks[localFile.id] = { cb: cb, ts: (new Date()).getTime(), iframe: i };
            
            var wrap = function() {
                var cbi = localFile.id;
                var notfound = function() {
                    if (localFile.callbacks[cbi]) {
                        localFile.listener(null, JSON.stringify({ id: cbi, content: null }));
                    }
                };

                // timeout 3000s, this should be enough for local resources
                window.setTimeout(notfound, 3000);
            }

            wrap();
            localFile.id++;
            try {
                i.contentWindow.postMessage(d, i.src);
            } catch (e) {}

        };

        window.setTimeout(post, 10);
    }
};
lfgs = localFile;

/* ####### update check #### */

var getUpdateCheckCfg = function() {
    var fire_dflt = { db_version: 0, last: 0, entries: 0 };
    var dflt = { scripts: 0, fire: fire_dflt };
    var last = TM_storage.getValue("TM_update_check", dflt);
    if (!last) last = dflt;
    if (last.fire == undefined) {
        last.fire = fire_dflt;
    }
    if (last.scripts == undefined) {
        last.scripts = 0;
    }
    return last;
};

var setUpdateCheckCfg = function(last) {
    if (last) TM_storage.setValue("TM_update_check", last);
};

/* ###### Storage ####### */

var escapeName = function(name) {
    return name;
};

var TM_fire = {
    fireDB : null,
    status : {},

    resetStatus : function(initialized) {
        if (initialized == undefined) initialized = true;
        TM_fire.status = {
            initialized : initialized,
            update : false,
            download : false,
            action : "",
            error : "",
            progress : { n: 0, of: 0 }
        };
    },

    isReady : function() {
        return TM_fire.status.initialized && !TM_fire.status.update && !TM_fire.status.download;
    },

    checkUpdate : function(force_check, force_update, check_cb, up_cb) {
        var force = force_check || force_update;

        if (!force && ( Config.values.fire_updatePeriod == 0 || !Config.values.fire_enabled) ) return;
        var last = getUpdateCheckCfg();

        var alldone = function() {
            if (up_cb) up_cb(TM_fire.status.error == "");
        };

        if (TM_fire.status.update || TM_fire.status.download) {
            if (check_cb) check_cb(true);
            var recheck = function() {
                if (TM_fire.isReady()) {
                    alldone();
                } else {
                    window.setTimeout(recheck, 1000);
                }
            }
            if (up_cb) recheck();
            return;
        }

        if (force || ((new Date()).getTime() - last.fire.last) > Config.values.fire_updatePeriod) {
            var db = 0;

            var do_update = function() {
                var done = function(cnt) {
                    if (TM_fire.status.error == "") {
                        last.fire.last = (new Date()).getTime();
                        last.fire.db_version = db;
                        last.fire.entries = cnt;
                        setUpdateCheckCfg(last);
                    }
                    alldone();
                };

                TM_fire.update(done);
            };

            var version_check = function(req) {
                if (req.readyState == 4) {
                    if (req.status = 200) {
                        try {
                            var o = JSON.parse(req.responseText);
                            db = o.db_version;
                        } catch (e) {
                            console.log("bg: fire: unable to parse DB version response! " + req.responseText);
                        }
                        console.log("bg: fire: local DB version: " + last.fire.db_version + " remote: " + db);
                        var run = db > last.fire.db_version || force_update;
                        if (check_cb) check_cb(run);
                        if (run) {
                            do_update();
                            return;
                        }
                    }
                    alldone();
                }
            };

            var details = {
                method: 'GET',
                url: TM_fire.updateURL() + "&db_version=get",
                retries: _retries,
                overrideMimeType: 'text/plain; charset=x-user-defined'
            };

            xmlhttpRequestInternal(details, version_check);
        } else {
            alldone();
        }
    },

    updateURL : function() {
        // return "http://tampermonkey.net/fire/update_23x.php";
        return Config.values.fire_updateURL + "?ts=0"; // "?ts=" + (new Date()).getTime();
    },

    update : function(cb) {
        var timer = null;
        var tries = 1;
        var watchdog = null;

        var cancelTimer = function() {
            if (timer) window.clearTimeout(timer);
            timer = null;
        };

        var setTimer = function() {
            cancelTimer();
            timer = window.setTimeout(watchdog, 2 * 60 * 1000);
        };

        var details = {
            method: 'GET',
            url: TM_fire.updateURL(),
            retries: _retries,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        };

        var error = function(msg) {
            cancelTimer();
            TM_fire.resetStatus();
            TM_fire.status.error = msg;
            if (cb) cb();
            notify.show('TamperFire',
                        chrome.i18n.getMessage('TamperFire_update_failed___'), chrome.extension.getURL("images/icon128_3d.png"));

        };

        var progress = function(req) {
            setTimer();
            if (req.progress) {
                TM_fire.status.progress = { n: req.progress.total, of: req.progress.totalSize * 6};
                // console.log("bg: fire download: " + req.progress.total + " bytes");
            }
        };

        var done = function(req) {
            setTimer();
            if (req.readyState == 4) {
                if (req.status = 200) {
                    cancelTimer();

                    TM_fire.resetStatus();
                    TM_fire.status.update = true;
                    TM_fire.status.action = chrome.i18n.getMessage('Update_in_progress');
                    var json = {};

                    var t = req.responseText;
                    try {
                        json = JSON.parse(t);
                    } catch (e) {
                        var t1 = '<body>';
                        var t2 = '</body>';
                        if (t.search(t1) != -1) {
                            var p1 = t.indexOf(t1);
                            var p2 = t.lastIndexOf(t2);
                            if (p1 != -1 && p2 != -1) {
                                 t = t.substr(p1 + t1.length, p2 - (p1 + t1.length));
                            }
                        }
                        try {
                            json = JSON.parse(t);
                        } catch (e) {
                            error("Parse Error! Update URL: " + TM_fire.updateURL());
                            return;
                        }
                    }

                    t = null;
                    if (!json.scripts) {
                        error('Invalid Content! Update URL: ' + TM_fire.updateURL());
                        return;
                    }

                    /* var rr = [];
                    for (var o in json.scripts) {
                        if (!json.scripts.hasOwnProperty(o)) continue;
                        rr.push(o);
                    }
                    console.log(JSON.stringify(rr)); */

                    var cleaned = function() {
                        TM_fire.status.update = true;

                        var done = function(cnt) {
                            TM_fire.resetStatus();
                            if (cb) cb(cnt);
                        };

                        TM_fire.insertValuesFromJSON(json, done);
                    };
                    TM_fire.clean(cleaned);
                } else {
                    error("Update URL: " + req.status);
                    return;
                }
            } else {
                console.log(req);
            }
        };

        watchdog = function() {
            if (tries > 0) {
                TM_fire.status.action = chrome.i18n.getMessage('Downloading');
                TM_fire.status.download = true;

                setTimer();
                xmlhttpRequestInternal(details, done, progress);
                tries--;
            } else {
                error('Download failed!');
            }
        };

        notify.show('TamperFire',
                    chrome.i18n.getMessage('TamperFire_update_started'), chrome.extension.getURL("images/icon128_3d.png"));

        watchdog();
    },

    init : function(cb) {
        var done = function(suc) {
            var s = suc !== false;
            if (cb) cb(s);
            if (s) window.setTimeout(TM_fire.checkUpdate, 20000);
        };

        TM_fire.resetStatus(false);
        TM_fire.initTables(done);
    },

    clean : function(cb) {
        var done = function() {
            TM_fire.initTables(cb);
        }


        var do5 = function() {
            TM_fire.fireDB.db.transaction(function(tx) {
                                              tx.executeSql("DROP TABLE scripts",
                                                            [],
                                                            done,
                                                            done);
                                          });

        };

        var do4 = function() {
            TM_fire.fireDB.db.transaction(function(tx) {
                                              tx.executeSql("DROP TABLE excludes",
                                                            [],
                                                            do5,
                                                            do5);
                                          });

        };

        var do3 = function() {
            TM_fire.fireDB.db.transaction(function(tx) {
                                              tx.executeSql("DROP TABLE includes",
                                                            [],
                                                            do4,
                                                            do4);
                                          });

        };

        var do2 = function() {
            TM_fire.fireDB.db.transaction(function(tx) {
                                              tx.executeSql("DROP TABLE scriptexcludes",
                                                            [],
                                                            do3,
                                                            do3);
                                          });

        };

        var do1 = function() {
            TM_fire.fireDB.db.transaction(function(tx) {
                                              tx.executeSql("DROP TABLE scriptincludes",
                                                            [],
                                                            do2,
                                                            do2);
                                          });

        };

        do1();
    },

    initTables : function(cb) {

        var done = function() {
            TM_fire.status.initialized = true;
            if (cb) cb();
        };

        TM_fire.fireDB = {
            db: openDatabase('tmFire', '1.0', 'TamperFire', 40 * 1024 * 1024),
            onSuccess : function(tx, result) {
                if (V) console.log("fireDB Success ");
            },
            onError : function(tx, e) {
                console.log("fireDB Error " + JSON.stringify(e));
            },
            createScriptTable : function(aftercreate) {
                var err = function(tx, e) {
                    TM_fire.fireDB.onError(tx, e);
                    if (cb) cb(false);
                };
                TM_fire.fireDB.db.transaction(function(tx) {
                                                  tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                                                                "scripts(sid INTEGER PRIMARY KEY ASC, value TEXT)", [], aftercreate, err);
                                              });
            },
            createScriptIncludesTable : function(aftercreate) {
                var err = function(tx, e) {
                    TM_fire.fireDB.onError(tx, e);
                    if (cb) cb(false);
                };
                TM_fire.fireDB.db.transaction(function(tx) {
                                                  tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                                                                "scriptincludes(" +
                                                                "iid INTEGER, " +
                                                                "sid INTEGER, " +
                                                                "FOREIGN KEY(sid) REFERENCES scripts(sid)," +
                                                                "FOREIGN KEY(iid) REFERENCES includes(iid)" +
                                                                ")", [], aftercreate, err);
                                              });
            },
            createIncludesTable : function(aftercreate) {
                var err = function(tx, e) {
                    TM_fire.fireDB.onError(tx, e);
                    if (cb) cb(false);
                };
                TM_fire.fireDB.db.transaction(function(tx) {
                                                  tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                                                                "includes(iid INTEGER PRIMARY KEY ASC, generic BOOLEAN, regex TEXT)", [], aftercreate, err);
                                              });
            },
            createScriptExcludesTable : function(aftercreate) {
                var err = function(tx, e) {
                    TM_fire.fireDB.onError(tx, e);
                    if (cb) cb(false);
                };
                TM_fire.fireDB.db.transaction(function(tx) {
                                                  tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                                                                "scriptexcludes(" +
                                                                "eid INTEGER, " +
                                                                "sid INTEGER, " +
                                                                "FOREIGN KEY(sid) REFERENCES scripts(sid)," +
                                                                "FOREIGN KEY(eid) REFERENCES excludes(eid)" +
                                                                ")", [], aftercreate, err);
                                              });
            },
            createExcludesTable : function(aftercreate) {
                var err = function(tx, e) {
                    TM_fire.fireDB.onError(tx, e);
                    if (cb) cb(false);
                };
                TM_fire.fireDB.db.transaction(function(tx) {
                                                  tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                                                                "excludes(eid INTEGER PRIMARY KEY ASC, regex TEXT)", [], aftercreate, err);
                                              });
            }
        }

        var init5 = function() {
            TM_fire.fireDB.createScriptExcludesTable(done);
        };
        var init4 = function() {
            TM_fire.fireDB.createScriptIncludesTable(init5);
        };
        var init3 = function() {
            TM_fire.fireDB.createExcludesTable(init4);
        };
        var init2 = function() {
            TM_fire.fireDB.createIncludesTable(init3);
        };
        var init1 = function() {
            TM_fire.fireDB.createScriptTable(init2);
        };
        init1();
    },

    insertValuesFromJSON: function(json, cb) {
        var index = [];
        var bulk = 10000;

        var scripts = [];
        var includes = {};
        var excludes = {};
        var writeInc = [];
        var writeExc = [];

        var writeSInc = [];
        var writeSExc = [];

        var currentIID = 0;
        var currentEID = 0;

        notify.show('TamperFire',
                    chrome.i18n.getMessage('TamperFire_import_started'), chrome.extension.getURL("images/icon128_3d.png"));

        for (var k in json.scripts) {
            if (!json.scripts.hasOwnProperty(k)) continue;
            index.push(k);
        }

        TM_fire.status.action = chrome.i18n.getMessage('Processing_scripts');
        TM_fire.status.progress = { n: 0, of: index.length };

        var i = 0;
        var j;
        var a = 0;

        var prepareIncludes = function() {
            for (var regex in includes) {
                var iid = currentIID++;
                writeInc.push([ regex, includes[regex].generic, iid ]);
                for (var ksid in includes[regex].sids) {
                    writeSInc.push([ iid, includes[regex].sids[ksid] ]);
                }
            }
        };

        var prepareExcludes = function() {
            for (var regex in excludes) {
                var eid = currentEID++;
                writeExc.push([ regex, eid ]);
                for (var ksid in excludes[regex].sids) {
                    writeSExc.push([ eid, excludes[regex].sids[ksid] ]);
                }
            }
        };

        var write = function(progress, fn, obj, cb) {
            if (obj.length) {
                TM_fire.resetStatus();
                TM_fire.status.update = true;
                TM_fire.status.action = chrome.i18n.getMessage('Writing_scripts');
                TM_fire.status.progress = { n: progress, of: writeInc.length + writeExc.length + writeSInc.length + writeSExc.length };
            } else  {
                if (cb) cb();
                return;
            }

            var runAgain = function () {
                write(progress, fn, obj, cb);
            };

            var writeDone = function() {
                if (j >= obj.length - 1) {
                    if (cb) cb();
                } else {
                    window.setTimeout(runAgain, 0);
                }
            };

            var end = obj.length - 1;
            if ((end - j) > bulk) end = j + bulk;
            if (D) console.log("bg: write TF " + end);

            fn(obj.slice(j, end), writeDone);
            j = end;
            TM_fire.status.progress.n = progress + j;
        };

        var writeScripts = function(cb) {
            if (scripts.length) {
                TM_fire.scripts.setValues(scripts, cb);
                scripts = [];
            } else if (cb) {
                cb()
            }
        };

        var done = function() {
            var aDone = function() {
                if (cb) cb(index.length);
                notify.show('TamperFire',
                            chrome.i18n.getMessage('TamperFire_is_up_to_date'), chrome.extension.getURL("images/icon128_3d.png"));
            };
            var siDone = function() {
                j=0;
                write(a, TM_fire.scriptExcludes.setValues, writeSExc, aDone);
                a += writeSExc.length;
            };

            var eDone = function() {
                j=0;
                write(a, TM_fire.scriptIncludes.setValues, writeSInc, siDone);
                a += writeSInc.length;
            };

            var iDone = function() {
                j=0;
                write(a, TM_fire.excludes.setValues, writeExc, eDone);
                a += writeExc.length;
            };
            var sDone = function() {
                j=0;
                write(a, TM_fire.includes.setValues, writeInc, iDone);
                a += writeInc.length;
            };

            prepareIncludes();
            prepareExcludes();

            writeScripts(sDone);
        };

        var insertDone = function() {
            if (scripts.length > bulk) {
                writeScripts(insertDone);
                return;
            }
            i++;
            if (i % 96 == 0) {
                window.setTimeout(insertItem, 0);
            } else {
                insertItem();
            }
        };

        var insertItem = function() {

            if (D && i % 2048 == 0) console.log("bg: import TF script " + index[i]);

            TM_fire.status.progress.n = i;
            if (i < index.length) {
                var obj = json.scripts[index[i]];

                scripts.push([index[i], JSON.stringify(obj)]);
                for (var j=0; j < obj.excludes.length; j++) {

                    var k = getRegExpFromUrl(obj.excludes[j], true);
                    if (!excludes[k]) {
                        excludes[k] = { sids: [] };
                    }
                    excludes[k].sids.push(index[i]);
                }

                for (var j=0; j < obj.includes.length; j++) {
                    var inc = obj.includes[j].trim();
                    var k = getRegExpFromUrl(inc, true);
                    if (!includes[k]) {
                        var generic = 0;
                         /* function t(inc) {
                           return {1: inc.match("^[https\*]{1,}[:\/\/]{0,}[w\.]{0,4}[\*|\.]{1,}[$|\/]"),
                           2: inc.match("^[\.\*\/]{1,}$"),
                           3: inc.match("^[https\*]{1,}[:\/\/]{0,}[w\.]{0,4}[\.|\*|\/]{1,}$") }
                           }; */
                         if (inc.search("^[https*]]{1,}[:\/\/]{0,}[w\.]{0,4}[\*|\.]{1,}[$|\/]") != -1 ||
                             inc.search("^[\.\*\/]{1,}$") != -1 ||
                             inc.search("^[https*]{1,}[:\/\/]{0,}[w\.]{0,4}[\.|\*|\/]{1,}$") != -1 ||
                             inc.search("^" + escapeForRegExp("*://*[$|\/]")) != -1 ||
                             inc.replace(new RegExp("(https|http|\\*).://\\*"), '') == "" ||
                             inc == "*") {
                            generic = 1;
                        }
                        includes[k] = { sids: [], generic: generic.toString()};
                    }
                    includes[k].sids.push(index[i]);
                }
                insertDone();

            } else {
                done();
            }
        };

        insertItem();
    },

    count : function(table, keyname, keyvalue, cb) {
        var done = function(items) {
            cb(items.length);
        };

        TM_fire.getValues(table, keyname, [ keyvalue ], done);
    },

    setValue : function(table, keyname, keyvalue, valuename, valuevalue, cb) {
        TM_fire.setValues(table,  [ keyname, valuename ], [valuename, valuevalue], cb);
    },

    setValues : function(table, rows, pairs, cb) {

        if (V) console.log("TM_fire.setValues");
        var i = 0;

        var done = function() {
            if (cb) cb();
        };

        var q = [];
        var v = [];

        for (var r=0; r<rows.length; r++) {
            q.push(rows[r]);
            v.push('?');
        }

        var run = function(tx) {
            if (i < pairs.length) {
                tx.executeSql("INSERT INTO " + table + "(" + q.join(', ') + ") VALUES (" + v.join(', ') + ");",
                              pairs[i],
                              run,
                              TM_fire.fireDB.onError);
                i++;
            } else {
                done();
            }
        };

        TM_fire.fireDB.db.transaction(run);
    },

    getValues : function(table, keyname, keyvalues, cb) {
        if (V) console.log("TM_fire.getValues");

        var i = 0;
        var tx = null;
        var ret = [];
        var bulk = 20;

        var callback = function(tx, vars) {

            if (vars.rows) {
                for (var j=0; j<vars.rows.length; j++) {
                    ret.push(vars.rows.item(j));
                }
            }

            if (i < keyvalues.length) {
                run();
            } else {
                cb(ret);
            }
        };

        var run = function(t) {
            if (!tx) tx = t;

            var search = [];
            var t = [];
            for (var o=i; o<keyvalues.length && o-i < bulk; o++) {
                t.push(keyname + '=?');
                search.push(keyvalues[o]);
            }

            tx.executeSql('SELECT * FROM ' + table + ' WHERE ' + t.join(' OR '),
                          search,
                          callback,
                          TM_fire.fireDB.onError);

            i += bulk;
        };

        TM_fire.fireDB.db.transaction(run);
    },

    getMax : function(table, entry, cb) {
        var cid = 'MAX("' + entry + '")';

        var callback = function(tx, vars) {
            var s = 0;
            if (vars.rows && vars.rows.length) {
                s = vars.rows.item(0)[cid];
            }
            cb(s);
        };

        var run = function(tx) {

            tx.executeSql('SELECT ' + cid + ' FROM "' + table + '"',
                          [],
                          callback,
                          TM_fire.fireDB.onError);
        };

        TM_fire.fireDB.db.transaction(run);
    },

    tab : {
        getItems : function(id, cb) {
            var cnt = 0;
            var r = {};
            var ret = [];
            var running = 1;

            var done = function() {
                for(var e in r) {
                    if (!r.hasOwnProperty(e)) continue;
                    ret.push(r[e]);
                }

                if (cb) cb(ret);
            };

            var add = function(res) {
                // unify
                for (var i=0; i<res.length; i++) {
                    r[res[i][cUSOSCRIPT]] = res[i];
                }
                if (--running == 0) done();
            };

            if (allURLs[id]) {
                for (var i in allURLs[id].urls) {
                    if (!allURLs[id].urls.hasOwnProperty(i)) continue;
                    running++;
                    TM_fire.url.getItems(i, add);
                }
            } else {
                cb(ret);
            }

            running--;
        },

        getCount : function(id, cb) {
            var done = function(r) {
                if (allURLs[id]) allURLs[id].fire_cnt = r.length;
                if (cb) cb(r.length);
            };
            if (allURLs[id] && allURLs[id].fire_cnt != undefined) {
                cb(allURLs[id].fire_cnt);
            } else {
                // use getItems to get a unified result for all URLs
                TM_fire.tab.getItems(id, done);
            }
        }
    },

    url: {
        getCount : function(url, cb) {
            if (D)  console.log("bg: TF: get count for URL " + url );
            var cid = "count(*)";
            var callback = function(tx, vars) {
                var s = 0;
                if (vars.rows && vars.rows.length) {
                    s = vars.rows.item(0)[cid];
                }
                cb(s);
            };

            var inc_url = "";
            inc_url += "SELECT " + cid + " FROM scripts WHERE sid IN ";
            inc_url += "    (SELECT sid FROM scriptincludes WHERE iid IN (SELECT iid FROM includes WHERE generic=0 AND ? REGEXP regex)) ";
            inc_url += "AND NOT sid IN ";
            inc_url += "    (SELECT sid FROM scriptexcludes WHERE eid IN (SELECT eid FROM excludes WHERE ? REGEXP regex)) ";

            TM_fire.fireDB.db.transaction(function(tx) {
                                              tx.executeSql(inc_url,
                                                            [url, url],
                                                            callback,
                                                            TM_fire.fireDB.onError);
                                          });
        },

        getItems: function(url, cb) {
            if (D)  console.log("bg: TF: get scripts for URL " + url );

            var ret = [];
            var inc_url = "";
            var u = 1, t1 = 0, t2 = 0;

            if (u == 0) {
                // 1600
                inc_url += "SELECT DISTINCT t1.* FROM scripts T1 JOIN scriptincludes T2 ON T1.sid=T2.sid WHERE T2.iid IN ";
                inc_url += "    (SELECT iid FROM includes WHERE generic=0 AND ? REGEXP regex) ";
                inc_url += "AND NOT T1.sid IN ";
                inc_url += "    (SELECT T4.sid FROM excludes T3 JOIN scriptexcludes T4 ON T3.eid=T4.eid WHERE T3.eid IN (SELECT eid FROM excludes WHERE ? REGEXP regex))";
            } else if (u == 1) {
                // 1134
                inc_url += "SELECT * FROM scripts T1 WHERE T1.sid IN ";
                inc_url += "    (SELECT sid FROM scriptincludes WHERE iid IN (SELECT iid FROM includes WHERE generic=0 AND ? REGEXP regex)) ";
                inc_url += "AND NOT T1.sid IN ";
                inc_url += "    (SELECT sid FROM scriptexcludes WHERE eid IN (SELECT eid FROM excludes WHERE ? REGEXP regex)) ";
            } else if (u == 2) {
                // 2700
                inc_url += "SELECT DISTINCT t1.* FROM scripts T1 JOIN scriptincludes T2 ON T1.sid=T2.sid WHERE EXISTS";
                inc_url += "    (SELECT iid FROM includes I1 WHERE T2.iid=I1.iid AND generic=0 AND ? REGEXP regex) ";
                inc_url += "AND NOT T1.sid IN ";
                inc_url += "    (SELECT T4.sid FROM excludes T3 JOIN scriptexcludes T4 ON T3.eid=T4.eid WHERE T3.eid IN (SELECT eid FROM excludes WHERE ? REGEXP regex))";
            } else if (u == 3) {
                // 2800
                inc_url += "SELECT DISTINCT t1.* FROM scripts T1 JOIN scriptincludes T2 ON T1.sid=T2.sid JOIN includes I1 ON I1.iid=T2.iid WHERE I1.generic=0 AND ? REGEXP I1.regex ";
                inc_url += "AND NOT T1.sid IN ";
                inc_url += "    (SELECT T4.sid FROM excludes T3 JOIN scriptexcludes T4 ON T3.eid=T4.eid WHERE T3.eid IN (SELECT eid FROM excludes WHERE ? REGEXP regex))";
            }
            var inc_all = "SELECT DISTINCT t1.value, t1.sid FROM scripts T1 JOIN scriptincludes T2 ON T1.sid=T2.sid WHERE T2.iid IN (SELECT iid FROM includes WHERE generic=0)";

            var all = (url == '*');
            var inc = (all ? inc_all : inc_url);

            var done = function(tx, vars) {
                t2 = (new Date()).getTime();
                if (D) console.log("bg: TF db access: " + u + " -> " + (t2 - t1) + "ms");
                if (vars.rows && vars.rows.length) {
                    for (var s=0; s<vars.rows.length; s++) {
                        try {
                            var sc = vars.rows.item(s).value;
                            ret.push(JSON.parse(sc));
                        } catch (e) {
                            console.log("bg: error parsing TamperFire entry " + item[s]);
                        }
                    }
                    cb(ret);
                } else {
                    console.log("bg: warn: no scripts entry");
                    cb(ret);
                }
            }

            TM_fire.fireDB.db.transaction(function(tx) {
                                              t1 = (new Date()).getTime();
                                              tx.executeSql(inc,
                                                            all ? [] : [url, url],
                                                            done,
                                                            TM_fire.fireDB.onError);
                                          });
        }
    },

    ids : {
        getItems : function(ids, cb) {
            var ret = [];
            var done = function(item) {

                if (item && item.length) {
                    for (var s=0; s<item.length; s++) {
                        try {
                            ret.push(JSON.parse(item[s]));
                        } catch (e) {
                            console.log("bg: error parsing TamperFire entry " + item);
                        }
                    }
                    cb(ret);
                } else {
                    console.log("bg: warn: no scripts entry");
                    cb(ret);
                }
            }
            if (ids.length) {
                TM_fire.scripts.getValues(ids, null, done);
            } else {
                cb(ret);
            }
        }
    },

    includes : {
        setValues : function(incls, cb) {
            TM_fire.setValues('includes', [ 'regex', 'generic', 'iid' ], incls, cb);
        }
    },

    scriptIncludes : {
        setValues : function(sincls, cb) {
            TM_fire.setValues('scriptincludes', [ 'iid', 'sid' ], sincls, cb);
        }
    },

    excludes : {
        setValues : function(excls, cb) {
            TM_fire.setValues('excludes', [ 'regex', 'eid' ], excls, cb);
        }
    },

    scriptExcludes : {
        setValues : function(sexcls, cb) {
            TM_fire.setValues('scriptexcludes', [ 'eid', 'sid' ], sexcls, cb);
        }
    },

    scripts : {

        getValues : function(keys, defaultValue, cb) {
            var done = function(items) {
                var ret = [];
                for (var i=0; i<items.length; i++) {
                    ret.push(items[i]['value']);
                }
                cb(ret);
            };
            TM_fire.getValues('scripts', 'sid', keys, done);
        },

        setValue : function(key, value, cb) {
            TM_fire.setValue('scripts', 'sid', key, 'value', value, cb);
        },

        setValues : function(pairs, cb) {
            TM_fire.setValues('scripts', ['sid', 'value'], pairs, cb);
        }

    }
}
fire = TM_fire;

var TM_storage = {
    cacheDB : null,
    localDB : null,
    init : function(cb) {
        if (V) console.log("TM_storage.init() " + _use_localdb);
        if (_use_localdb) {
            var fill = function(tx, vars) {
                TM_storage.cacheDB = {};
                if (vars) {
                    for (var i=0; i<vars.rows.length; i++) {
                        // if (V) console.log("fill: " + vars.rows.item(i).name + " -> " +vars.rows.item(i).value);
                        TM_storage.cacheDB[vars.rows.item(i).name] = vars.rows.item(i).value;
                    }
                }
                TM_storage.initialized = true;
                if (cb) cb();
            };
            var initCache = function() {
                if (V) console.log("init cache");
                TM_storage.localDB.db.transaction(function(tx) {
                                           tx.executeSql("SELECT * FROM config",
                                                         [],
                                                         fill,
                                                         TM_storage.localDB.onError);
                                       });
            };
            TM_storage.localDB = {
                db: openDatabase('tmStorage', '1.0', 'TM Storage', 30 * 1024 * 1024),
                onSuccess : function(tx, result) { if (V) console.log("localDB Success "); },
                onError : function(tx, e) { console.log("localDB Error " + JSON.stringify(e)); },
                createTable : function(aftercreate) {
                    TM_storage.localDB.db.transaction(function(tx) {
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                                                             "config(ID INTEGER PRIMARY KEY ASC, name TEXT, value TEXT)", [], aftercreate, TM_storage.localDB.onError);
                                           });
                }
            }
            TM_storage.localDB.createTable(initCache);
        } else {
            TM_storage.initialized = true;
            if (cb) cb();
        }
    },

    setValue : function(uename, value, cb) {
        if (V) console.log("TM_storage.setValue");
        var type = (typeof value)[0];
        var name = escapeName(uename);
        switch (type) {
          case 'o':
              try {
                  value = type + JSON.stringify(value);
              } catch (e) {
                  console.log("setValue: " + e);
                  return;
              }
              break;
          default:
              value = type + value;
        }

        if (_use_localdb) {
            if (TM_storage.getValue(name, null)) {
                TM_storage.localDB.db.transaction(function(tx){
                                           tx.executeSql("UPDATE config SET value=? WHERE name=?",
                                                         [value, name],
                                                         cb ? cb : TM_storage.localDB.onSuccess,
                                                         TM_storage.localDB.onError);
                                       });
            } else {
                TM_storage.localDB.db.transaction(function(tx){
                                           tx.executeSql("INSERT INTO config(name, value) VALUES (?,?)",
                                                         [name, value],
                                                         cb ? cb : TM_storage.localDB.onSuccess,
                                                         TM_storage.localDB.onError);
                                       });
            }
            TM_storage.cacheDB[name] = value;
        } else {
            localStorage.setItem(name, value);
        }
    },

    getValue : function(uename, defaultValue) {
        if (V) console.log("TM_storage.getValue");
        var name = escapeName(uename);
        var get = function(value, dV) {
            if (!value) {
                return dV;
            }
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
                      return dV;
                  }
              default:
                  return value;
            }
        }

        if (_use_localdb) {
            /*
              var callback = function(vars) {
              var ret = null;
              if (vars.rows.length >= 1) ret = vars.rows.item(i).value;
              cb(ret);
              };
              TM_storage.localDB.db.transaction(function(tx) {
              tx.executeSql('SELECT * FROM config WHERE name="?"',
              [name],
              callback,
              TM_storage.localDB.onError);
              });
            */
            return get(TM_storage.cacheDB[name], defaultValue);
        } else {
            return get(localStorage.getItem(name, defaultValue), defaultValue);
        }
    },
    deleteAll : function(cb) {
        if (V) console.log("TM_storage.deleteAll");
        if (_use_localdb) {
            TM_storage.cacheDB[name] = null;
            TM_storage.localDB.db.transaction(function(tx) {
                                       tx.executeSql('DELETE FROM config WHERE ID>0',
                                                     [],
                                                     cb,
                                                     TM_storage.localDB.onError);
                                   });
        } else {
            var r = TM_storage.listValues();
            for (var i=0; i<r.length;i++) {
                localStorage.removeItem(r[i]);
            }
        }
    },

    deleteValue : function(uename, cb) {
        if (V) console.log("TM_storage.deleteValue");
        var name = escapeName(uename);
        if (_use_localdb) {
            TM_storage.cacheDB[name] = null;
            delete TM_storage.cacheDB[name];
            TM_storage.localDB.db.transaction(function(tx) {
                                       tx.executeSql('DELETE FROM config WHERE name=?',
                                                     [name],
                                                     cb,
                                                     TM_storage.localDB.onError);
                                   });
        } else {
            localStorage.removeItem(name);
        }
    },

    listValues : function() {
        if (V) console.log("TM_storage.listValues");
        if (_use_localdb) {
            /*
              var callback = function(vars) {
              var ret = [];
              for (var i=0; i<vars.rows.length; i++) {
              ret.push(vars.rows.item(i).name);
              }
              cb(ret);
              };
              TM_storage.localDB.db.transaction(function(tx) {
              tx.executeSql('SELECT * FROM config',
              [name],
              callback,
              TM_storage.localDB.onError);
              });
            */
            var ret = [];
            for (var i in TM_storage.cacheDB) {
                if (!TM_storage.cacheDB.hasOwnProperty(i)) continue;
                ret.push(i);
            }
            return ret;
        } else {
            var ret = [];
            for (var i=0; i<localStorage.length; i++) {
                ret.push(localStorage.key(i));
            }
            return ret;
        }
    }
};

/* ###### hehe ######### */

var defaultScripts = function() {
    var scripts = [];
    var ret = [];

    for (var i=0; i < scripts.length; i++) {
        var u = 'system/' + scripts[i] + '.tamper.js';
        var c = getRawContent(u);
        if (c) ret.push(c);
    }

    return ret;
};

/* ###### UI ####### */

var setIcon = function(tabId, obj) {
    if (obj == undefined) obj = Config;

    if (tabId != null && allURLs[tabId] && allURLs[tabId].scripts_running) {
        obj.images.icon = obj.values.appearance_3d_icons ? 'images/icon_3d.png' : 'images/icon.png';
        chrome.browserAction.setIcon( { tabId: tabId, path: chrome.extension.getURL( obj.images.icon) } );
    } else {
        obj.images.icon = obj.values.appearance_3d_icons ? 'images/icon_3d_grey.png' : 'images/icon_grey.png';
        var s = { path: chrome.extension.getURL( obj.images.icon) };
        if (tabId != null) s.tabId = tabId;
        chrome.browserAction.setIcon( s );
    }
};
 
var setOptions = function(obj) {
    setIcon(null, obj);
    if (Config.values.fire_enabled && !TM_fire.status.initialized) TM_fire.init();

    adjustLogLevel(Config.values.logLevel);
};

/* ###### Config ####### */

var configInit = function(callback, saveCallback) {

    var oobj = this;

    var defltScript = '';
    defltScript += '// ==UserScript==\n';
    defltScript += '// @name       My Fancy New Userscript\n';
    defltScript += '// @namespace  http://use.i.E.your.homepage/\n';
    defltScript += '// @version    0.1\n';
    defltScript += '// @description  enter something useful\n';
    defltScript += '// @match      http://*/*\n';
    defltScript += '// @copyright  2012+, You\n';
    defltScript += '// ==/UserScript==\n\n';

    var defaults = {
                     configMode: 0,
                     safeUrls: true,
                     tryToFixUrl: true,
                     debug: false,
                     logLevel: 0,
                     showFixedSrc: false,
                     firstRun: true,
                     notification_showTMUpdate: false,
                     notification_silentScriptUpdate: true,
                     scriptTemplate : defltScript,
                     scriptUpdateCheckPeriod: 12 * 60 * 60 * 1000,
                     scriptUpdateHideNotificationAfter: 15 * 1000,
                     scriptUpdateCheckDisabled: false,
                     autoReload: false,
                     appearance_3d_icons: false,
                     appearance_badges: 'running',
                     fire_enabled: false,
                     fire_sort_cache_enabled: true,
                     fire_updateURL: 'http://tampermonkey.net/fire/update.php',
                     fire_updatePeriod: 14 * 24 * 60 * 60 * 1000,
                     editor_enabled: true,
                     editor_indentUnit: 4,
                     editor_indentWithTabs: false,
                     editor_tabMode : 'smart',
                     editor_enterMode : 'indent',
                     editor_electricChars : true,
                     editor_lineNumbers: true,
                     forbiddenPages : [ '*.paypal.tld/*', 'https://*deutsche-bank-24.tld/*', 'https://*bankamerica.tld/*',
                                        '*://plusone.google.com/*/fastbutton*',
                                        '*://www.facebook.com/plugins/*',
                                        '*://platform.twitter.com/widgets/*' ]};

    this.load = function(cb) {
        var ds = defaultScripts();
        for (var k in ds) {
            var s = ds[k];
            window.setTimeout(function() { addNewUserScript({ tabid: null, url: null, src: s, ask: false, defaultscript:true }); }, 1 );
        }
        oobj.defaults = defaults;
        oobj.values = {};
        for (var r in defaults) {
            if (!defaults.hasOwnProperty(r)) continue;
            oobj.values[r] = defaults[r];
        }

        var o = TM_storage.getValue("TM_config", oobj.defaults);
        for (var r in o) {
            if (!o.hasOwnProperty(r)) continue;
            oobj.values[r] = o[r];
        }

        cb();
    };

    this.save = function(runCb) {
        if (runCb == undefined) runCb = true;
        var c = oobj.values;
        c.firstRun = false;
        TM_storage.setValue("TM_config", c);
        if (runCb && saveCallback) saveCallback();
    };

    var afterload = function() {
        if (oobj.values.firstRun) {
            oobj.save(false);
        }

        oobj.images = {};
        oobj.images.icon = Config.values.appearance_3d_icons ? 'images/icon_3d.png' : 'images/icon.png';

        oobj.initialized = true;

        if (callback) callback(oobj);

        if (oobj.values.notification_showTMUpdate && upNotification) {
            notify.show(chrome.i18n.getMessage('Welcome_'),
                        chrome.i18n.getMessage('Have_fun_with_Tampermonkey', upNotification), chrome.extension.getURL("images/icon128_3d.png"));
        }
    }

    var convert = function(cb) {
        if (!TM_storage.initialized) {
            window.setTimeout(function() { convert(cb); }, 10);
            return;
        }
        var next = function() {
            oobj.load(cb);
        }
        convertData(next);
    };

    convert(afterload);

    return this;
};

/* ###### xmlhttp ####### */

var xmlhttpRequestInternal = function(details, callback, onreadychange, onerr, done) {
    return xmlhttpRequest(details, callback, onreadychange, onerr, done, true);
};

    
/* ###### Runtime ####### */

var isLocalImage = function(url) {
    var bg = 'background.js';
    var u = chrome.extension.getURL(bg);
    u = u.replace(bg, '') + 'images/';
    return (url.length >= u.length && u == url.substr(0, u.length));
};

var runtimeInit = function() {
    var oobj = this;

    this.getNextResource = function(script, cb) {

        var storeResource = function(req, res) {
            res.loaded = true;
            res.resURL = '';
            res.resText = '';

            var image = null;
            var rh = req.responseHeaders ? req.responseHeaders.split('\n') : null;

            for (var k in rh) {
                var h = rh[k].split(':');
                if (V) console.log("Header: " + JSON.stringify(h));
                if (h.length >= 2 &&
                    h[0].trim().toLowerCase() == 'content-type' &&
                    h[1].search('image') != -1) {
                    image = h[1].trim();
                    break;
                }
            }

            if (req.readyState == 4) {
                if (req.status == 200 || req.status == 0) {
                    res.resText = req.responseText;
                    if (req.status == 0 || isLocalImage(res.url)) {
                        if (res.url.search('.ico$') != -1) {
                            image = 'image/x-icon';
                        } else if (res.url.search('.gif$') != -1) {
                            image = 'image/gif';
                        } else if (res.url.search('.png$') != -1) {
                            image = 'image/png';
                        } else {
                            image = 'image/x-icon';
                        }
                    } else {
                        addToRequireCache(res.url, req.responseText, req.responseHeaders);
                    }
                    if (!image) {
                        res.resURL = Converter.Base64.encode(req.responseText);
                    } else {
                        res.resURL = 'data:' + image + ';base64,' + Converter.Base64.encode(req.responseText);
                    }
                    cb(script);
                } else {
                    if (D || V) console.log("Failed to load! " + req.status + " " + req.statusText);
                    cb(script);
                }
            }
        };

        for (var k in script.resources) {
            var r = script.resources[k];
            if (!r.loaded) {

                if (r.url.length > 8 && r.url.substr(0,8) == '/images/' && r.url.search('\\.\\.') == -1) {
                    r.url = chrome.extension.getURL(r.url);
                }

                var t = getFromRequireCache(r.url);

                if (t) {
                    storeResource( { readyState: 4, status: 200, responseText: t.content, responseHeaders: t.headers }, r );
                } else {
                    if (r.url.search('^file://') == 0) {
                        var c = function(s) {
                            storeResource({readyState: 4, status: s ? 0 : 404, responseText: s}, r);
                        };
                        localFile.getSource(r.url, c);
                    } else {
                        var details = {
                            method: 'GET',
                            url: r.url,
                            retries: _retries,
                            overrideMimeType: 'text/plain; charset=x-user-defined'
                        };

                        if (V) console.log("request " + r.url);
                        xmlhttpRequest(details, function(req) { storeResource(req, r); });
                    }
                }
                return true;
            }
        }

        return false;
    };

    this.getRequires = function(script, cb) {

        var fillRequire = function(req, res) {
            r.loaded = true;
            if (req.readyState == 4 && req.status == 200 || req.status == 0) {
                r.textContent = req.responseText;
                addToRequireCache(r.url, req.responseText);
            }
        };

        for (var k in script.requires) {
            var r = script.requires[k];
            if (!r.loaded && r.url) {
                var t = getFromRequireCache(r.url);
                if (t) {
                    fillRequire( { readyState: 4, status: 200, responseText: t.content }, r );
                    oobj.getRequires(script, cb);
                } else {
                    if (V) console.log("requires " + r.url);
                    var onResp = function(req) {
                        fillRequire(req, r);
                        oobj.getRequires(script, cb);
                    };
                    
                    if (r.url.search('^file://') == 0) {
                        var c = function(s) {
                            onResp({readyState: 4, status: s ? 0 : 404, responseText: s});
                        };
                        localFile.getSource(r.url, c);
                    } else { 
                        var details = {
                            method: 'GET',
                            retries: _retries,
                            url: r.url,
                        };
                        xmlhttpRequest(details,
                                       onResp,
                                       null,
                                       null,
                                       null,
                                       true);
                    }
                }
                return true;
            }
        }

        cb();
    };

    this.contentLoad = function(tab, main, cb) {

        if (oobj.getNextResource(main, function(script) { oobj.contentLoad(tab, script, cb); })) {
            return;
        }

        oobj.currentTab = tab;
        if (typeof TM_tabs[tab.id] == 'undefined') TM_tabs[tab.id] = { storage: {} };

        var req_cb = function() {
            var scripts = [];
            scripts.push(main);

            console.log(chrome.i18n.getMessage("run_script_0url0___0name0", [ tab.url , main.name]));
            oobj.injectScript(scripts, tab, cb);
        };

        oobj.getRequires(main, req_cb);
    };

    this.getUrlContents = function(url) {

        var content = '';
        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/' + url, false);
        xhr.send(null);
        content = xhr.responseText;
        return content;
    };

    this.createEnv = function(src, script) {
        src = compaMo.mkCompat(src, script);

        if (Config.values.debug) {
            console.log(chrome.i18n.getMessage("env_option__debug_scripts"));
            src = "debugger;\n" + src;
        }

        return src;
    };

    this.injectScript = function(scripts, tab, cb) {
        var script;
        if (cb == undefined) cb = function() {};

        for (var i = 0; script = scripts[i]; i++) {
            var requires = [];

            script.requires.forEach(function(req) {
                                        // TODO: option to use compaMo.mkCompat here !?!
                                        var contents = req.textContent;
                                        requires.push(contents);
                                    });

            var requiredSrc = "\n" + requires.join("\n") + "\n";
            var storage = loadScriptStorage(script.name);
            var dblscript = {};

            for (var k in script) {
                if (k == 'includes' ||
                    k == 'matches' ||
                    k == 'requires' ||
                    k == 'excludes' ||
                    k == 'textContent') continue;
                dblscript[k] = script[k];
            }

            chrome.tabs.sendRequest(oobj.currentTab.id,
                                    { method: "executeScript",
                                      header: script.header,
                                      code: oobj.createEnv( script.textContent, script),
                                      requires: compaMo.mkCompat(requiredSrc, script),
                                      version: chrome.extension.getVersion(),
                                      storage: storage,
                                      script: dblscript,
                                      id: oobj.currentTab.scriptId },
                                    cb);
        }
    };
};

/* ###### UserScript Runtime ####### */

var removeUserScript = function(name) {
    storeScript(name, null);
    storeScriptStorage(name, null);
};

var getMetaData = function(o, callback) {
    if (o.fileURL && o.fileURL.search('^file://' == -1)) {
        var murl = o.fileURL.replace('\.user\.js', '.meta.js');
        if (murl == o.fileURL) murl = o.fileURL.replace('\.tamper\.js', '.meta.js');

        if (murl != o.fileURL) {
            murl += (murl.search('\\?') == -1 ? '?' : '&') + 'ts=' + (new Date()).getTime();

            var details = {
                method: 'GET',
                retries: 0,
                url: murl,
            };

            var getmeta = function(req) {
                o.meta = null;
                if (req.readyState == 4 && req.status == 200) {
                    var meta = scriptParser.processMetaHeader(req.responseText);
                    o.meta = meta;
                    o.metasrc = req.responseText;
                } else {
                    console.log("bg: unable to find meta data @ " + murl + " req.status = " + req.status);
                }
                callback(o);
            };

            xmlhttpRequest(details, getmeta);

            return;
        }
    }

    o.meta = null;
    callback(o);
};

//merge original and user-defined *cludes and matches
var mergeCludes = function(script){
    var n, cludes = script.options.override;
	
    //clone the original cludes as a starting point
    script.includes = cludes.orig_includes.slice();
    script.excludes = cludes.orig_excludes.slice();
    script.matches = cludes.orig_matches ? cludes.orig_matches.slice() : [];

    //add user includes (and remove them from original excludes if they exist)
    for (n=0; n<cludes.use_includes.length; n++){
        var idx = script.excludes.indexOf(cludes.use_includes[n]);
        if (idx >= 0){
            script.excludes.splice(idx, 1);
        }
        script.includes.push(cludes.use_includes[n]);
    }

    //who uses matches anyway?
    if (typeof cludes.use_matches !== 'undefined'){
        for (n=0; n<cludes.use_matches.length; n++){
            idx = script.excludes.indexOf(cludes.use_matches[n]);
            if (idx >= 0){
                script.excludes.splice(idx, 1);
            }
            script.matches.push(cludes.use_matches[n]);
        }
    }

    //add user excludes (overrides includes anyway)
    for (n=0; n<cludes.use_excludes.length; n++){
        script.excludes.push(cludes.use_excludes[n]);
    }

    return script;
};

var addNewUserScript = function(o) {
    // { tabid: tabid, url: url, src: src, ask: ask, defaultscript:defaultscript, noreinstall : noreinstall, save : save, cb : cb }
    var reset = false;
    var allowSilent = false;

    if (o.name == undefined) o.name = null;
    if (o.clean == undefined) o.clean = false;
    if (o.defaultscript == undefined) o.defaultscript = false;
    if (o.ask == undefined) o.ask = true;
    if (o.url == undefined || o.url == null) o.url = "";
    if (o.save == undefined) o.save = false;
    if (o.hash == undefined) o.hash = "";

    var script = scriptParser.createScriptFromSrc(o.src);

    if (o.name && script.name != script.name) {
        console.log("bg: addNewUserScript() Names do not match!");
        return false;
    }

    if (!script.name || script.name == '' || (script.version == undefined)) {
        chrome.tabs.sendRequest(o.tabid,
                                { method: "showMsg", msg: chrome.i18n.getMessage('Invalid_UserScript__Sry_')},
                                function(response) {});
        return false;
    }

    var oldscript = TM_storage.getValue(script.name, null);
    var msg = '';

    if (!o.clean && oldscript && oldscript.system && !o.defaultscript) return false;

    if (script.options.compat_uW_gmonkey) {
        chrome.tabs.sendRequest(o.tabid,
                                { method: "showMsg", msg: chrome.i18n.getMessage('This_script_uses_uW_gm_api_')},
                                function(response) {});

        return false;
    }

    script.hash = oldscript ? oldscript.hash : o.hash;
    script.lastUpdated = (new Date()).getTime();
    script.system = o.defaultscript;
    script.fileURL = o.url;
    script.position = oldscript ? oldscript.position : determineLastScriptPosition() + 1;

    if (script.name.search('@') != -1) {
        chrome.tabs.sendRequest(o.tabid,
                                { method: "showMsg", msg: chrome.i18n.getMessage('Invalid_UserScript_name__Sry_')},
                                function(response) {});
        return false;
    } else if (!o.clean && oldscript && script.version == oldscript.version) {
        if (o.defaultscript || o.noreinstall) {
            // stop here... we just want to update (system) scripts...
            return null;
        }

        if (o.save) {
            msg += chrome.i18n.getMessage('You_are_about_to_modify_a_UserScript_') + '     \n';
        } else {
            msg += chrome.i18n.getMessage('You_are_about_to_reinstall_a_UserScript_') + '     \n';
            reset = true;
            msg += '\n' + chrome.i18n.getMessage('All_script_settings_will_be_reset_') + '!!\n';
        }

        msg += '\n' + chrome.i18n.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\n' + chrome.i18n.getMessage('Installed_Version_') + '\n';
        msg += '    ' + 'v' + script.version +  '\n';
    } else if (!o.clean && oldscript && versionCmp(script.version, oldscript.version) == eOLDER) {
        msg += chrome.i18n.getMessage('You_are_about_to_downgrade_a_UserScript') + '     \n';
        msg += '\n' + chrome.i18n.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\n' + chrome.i18n.getMessage('Installed_Version_') + '\n';
        msg += '    ' + 'v' + oldscript.version +  '\n';
    } else if (!o.clean && oldscript) {
        msg += chrome.i18n.getMessage('You_are_about_to_update_a_UserScript_') + '     \n';
        msg += '\n' + chrome.i18n.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\n' + chrome.i18n.getMessage('Installed_Version_') + '\n';
        msg += '    ' + 'v' + oldscript.version +  '\n';
        allowSilent = true;
    }  else {
        msg += chrome.i18n.getMessage('You_are_about_to_install_a_UserScript_') + '     \n';
        msg += '\n' + chrome.i18n.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
    }

    // user defined *cludes will be persistent except for a user triggered script factory reset
    if (!o.clean && oldscript){
        script.options.override = oldscript.options.override;
    }
    // back up *cludes to be able to restore them if override *clude is disabled
    script.options.override.orig_includes = script.includes;
    script.options.override.orig_excludes = script.excludes;
    script.options.override.orig_matches = script.matches;
    script = mergeCludes(script);

    if (!reset && !o.clean && oldscript) {
        // don't change some settings in case it's a system script or an update
        script.enabled = oldscript.enabled;

        if (!script.options.awareOfChrome) {
            script.options.compat_forvarin = oldscript.options.compat_forvarin;
            if (script.options.run_at == '') {
                script.options.run_at = oldscript.options.run_at;
            }
        }

        if (oldscript.fileURL != script.fileURL) {
            msg += '\n' + chrome.i18n.getMessage('The_update_url_has_changed_from_0oldurl0_to__0newurl0', [oldscript.fileURL, script.fileURL]);
            allowSilent = false;
        }
    }

    if (!script.includes.length && !script.matches.length) {
        msg += '\n' + chrome.i18n.getMessage('Note_') + '\n';
        msg += '    ' + chrome.i18n.getMessage('This_script_does_not_provide_any__include_information_') + '\n';
        msg += '    ' + chrome.i18n.getMessage('Tampermonkey_assumes_0urlAllHttp0_in_order_to_continue_', urlAllHttp) + '    \n';
        script.includes.push(urlAllHttp);
    }

    if (!script.options.awareOfChrome) {
        if (o.src.search("DOMContentLoaded") != -1
            /* || src.search('(addEventListener[ ]*\\([ ]*)([\\"\'])load([\\"\'])') != -1 */) {
            if (script.options.run_at == '') {
                script.options.run_at = 'document-start';
            }
        }
    }

    if (script.options.run_at == '') {
        script.options.run_at = 'document-end';
    }

    var g = script.excludes.length + script.includes.length + script.matches.lenght;
    var c = 0;
    var m = 4;

    var incls = '';
    incls += '\n' + chrome.i18n.getMessage('Include_s__');
    if (script.options.override.includes || script.options.override.matches) {
        incls += ' (' + chrome.i18n.getMessage('overwritten_by_user') + ')';
    }
    incls += '\n';
    var k=0, q=0;
    
    for (k=0;k<script.includes.length;k++,q++) {
        incls += '    ' + script.includes[k];
        incls += (g < 15) ? '\n' : (c < m) ? ';' : '\n';
        if (c++ >= m) c = 0;
        if (q > 13) {
            incls += "\n" + chrome.i18n.getMessage('Attention_Can_not_display_all_includes_') + "\n";
            break;
        }
    }
    for (k=0;k<script.matches.length;k++,q++) {
        incls += '    ' + script.matches[k];
        incls += (g < 15) ? '\n' : (c < m) ? ';' : '\n';
        if (c++ >= m) c = 0;
        if (q > 13) {
            incls += "\n" + chrome.i18n.getMessage('Attention_Can_not_display_all_includes_') + "\n";
            break;
        }
    }

    var excls = '';
    c = 0;
    if (script.excludes.length) {
        excls += '\n' + chrome.i18n.getMessage('Exclude_s__');
        if (script.options.override.excludes) {
            excls += ' (' + chrome.i18n.getMessage('overwritten_by_user') + ')';
        }
        excls += '\n';

        for (var k=0;k<script.excludes.length;k++) {
            excls += '    ' + script.excludes[k];
            excls += (g < 15) ? '\n' : (c < m) ? ';' : '\n';
            if (c++ >= m) c = 0;
            if (k > 13) {
                excls += "\n" + chrome.i18n.getMessage('Attention_Can_not_display_all_excludes_') + "\n";
                break;
            }
        }
    }

    msg += incls + excls;

    var compDe = false;
    for (var h in script.options) {
        if (h.search('compat_') != -1 &&
            script.options[h] === true) {
            compDe = true;
            break;
        }
    }

    if (compDe) {
        msg += "\n" + chrome.i18n.getMessage('Note__A_recheck_of_the_GreaseMonkey_FF_compatibility_options_may_be_required_in_order_to_run_this_script_') +"\n\n";
    }

    if (o.clean) {
        msg += '\n' + chrome.i18n.getMessage('Do_you_really_want_to_factory_reset_this_script_') + '    ';
    } else {
        msg += "\n" + chrome.i18n.getMessage('Do_you_want_to_continue_');
    }

    var doit = function() {
        storeScript(script.name, script);
        if (!oldscript || o.clean) storeScriptStorage(script.name, { ts: (new Date()).getTime() });
        if (!o.cb) {
            reorderScripts();
            var done = function(allitems) {
                chrome.extension.sendRequest({ method: "updateOptions",
                                                     items: allitems },
                                             function(response) {});

            };
            createOptionItems(done);
        }

        if (false) { // add user option
            var disableNative = function(item) {
                if (!item) return;
                console.log("bg: disable extension " + item.name);
                extensions.setEnabled(item, false);
            }
            extensions.getUserscriptByName(script.name, disableNative);
        }
    };
    
    if (!o.ask ||
       (allowSilent && Config.values.notification_silentScriptUpdate)) {
        doit();
        if (o.cb) o.cb(true);
    } else {
        chrome.tabs.sendRequest(o.tabid,
                                { method: "confirm", msg: msg},
                                function(response) {
                                    if (response.confirm) {
                                        doit();
                                    }
                                    if (o.cb) o.cb(response.confirm);
                                });
    }
    return true;
};

var installFromUrl = function(url, tabid, cb) {
    var details = {
        method: 'GET',
        retries: _retries,
        url: url,
    };
    var inst = function(req) {
        if (req.readyState == 4 && req.status == 200) {
            var callback = function(installed) {
                if (cb) cb(true, installed);
            };

            addNewUserScript({ tabid: tabid, url: url, src: req.responseText, ask: true, cb : callback });
        } else {
            if (V) console.log("scriptClick: " + url + " req.status = " + req.status);
            if (cb) cb(false, false);
        }
    };
    xmlhttpRequest(details, inst);
};

var getValidTabId = function(ignore, cb) {
    var isIn = function(id) {
        if (!ignore) return false;
        for (var i=0; i<ignore.length; i++) {
            if (ignore[i] == id) return true;
        }
        return false;
    };

    var resp = function(tab) {
        var id = 0;
        if (!tab || !tab.id || !allURLs[tab.id]) {
            var i = 0;
            var ts = 0;
            for (var g in allURLs) {
                if (!allURLs.hasOwnProperty(g)) continue;
                if (ts == 0 || allURLs[g].ts < ts) {
                    if (!isIn(g)) {
                        ts = allURLs[g].ts;
                        i = g;
                    }
                }
            }
            id = Number(i);
        } else if (!isIn(tab.id)) {
            id = tab.id;
        }
        if (id == 0) {
            var created = function(t) {
                id = t.id;
                var closeTab = function() {
                    chrome.tabs.remove(id);
                };
                var run = function() {
                    cb(id, closeTab);
                };
                window.setTimeout(run, 100);
            };
            chrome.tabs.create({ url:  chrome.extension.getURL("ask.html")}, created);
        } else {
            cb(id, null);
        }
    };
    chrome.tabs.getSelected(null, resp);
};
 
/******** notify *******/ 
var notify = {
    responses : {},
    getNotifyId : function(callback) {
        var id = 0;
        if (callback) {
            while (id == 0 || notify.responses[id] != undefined) {
                id = ((new Date()).getTime() + Math.floor ( Math.random ( ) * 6121983 + 1 )).toString();
            }
            notify.responses[id] = callback;
            if (NV) console.log("bg: registerNotifyId " + id);
        }
        return id;
    },
    show : function(title, text, image, delay, callback) {
        var notifyId = callback ? notify.getNotifyId(callback) : null;
        var args = 'notify=1&title=' + encodeURIComponent(title) + '&text=' + encodeURIComponent(text);
        if (image) args += "&image=" + encodeURIComponent(image);
        if (delay != undefined) {
            delay = Number(delay);
            args += "&delay=" + encodeURIComponent(delay);
        }
        if (notifyId) {
            args += "&notifyId=" + encodeURIComponent(notifyId);
            var to = null;
            var remove = null;
            var listen = function() {
                if (NV) console.log("bg: received click -> notifyId: " + notifyId);
                remove();
                callback(true);
            };
            remove = function() {
                if (NV) console.log("bg: remove listener -> notifyId: " + notifyId);
                window.removeEventListener("notify_" + notifyId, listen, false);
                if (to) window.clearTimeout(to);
            };
            window.addEventListener("notify_" + notifyId, listen, false);
            to = window.setTimeout(function() { to = null; remove(); callback(false); }, delay ? delay + 5000 : 10 * 60 * 1000);
        }
        var notification = webkitNotifications.createHTMLNotification('notification.html?' + args);
        notification.show();
    }
};

var notifyOnScriptUpdates = function(force, showResult, id, callback) {
    if (!force && Config.values.scriptUpdateCheckPeriod == 0) return;

    if (showResult) {
        var t = chrome.i18n.getMessage('Script_Update');
        var msg = chrome.i18n.getMessage('Check_for_userscripts_updates') + '...';
        notify.show(t, msg, chrome.extension.getURL("images/icon128_3d.png"), 5000);
    }

    var last = getUpdateCheckCfg();
    if (force || ((new Date()).getTime() - last.scripts) > Config.values.scriptUpdateCheckPeriod) {
        console.log("bg: check for script updates " + (id ? ' for ' + id : ''));
        var cb = function(updatable, obj) {
            if (updatable) {
                try {
                    var install = function(clicked) {
                        if (clicked) {
                            var gotId = function(id, close) {
                                var ss = { tabid: id,
                                           url: obj.url,
                                           src: obj.code,
                                           ask: true,
                                           cb : close,
                                           hash: obj.newhash != undefined ? obj.newhash : null };
                                addNewUserScript(ss);
                            };
                            getValidTabId(null, gotId);
                        }
                    };

                    var msg = chrome.i18n.getMessage('There_is_an_update_for_0name0_avaiable_', obj.name) + '\n' + chrome.i18n.getMessage('Click_here_to_install_it_');
                    var t = chrome.i18n.getMessage('Just_another_service_provided_by_your_friendly_script_updater_');
                    if (Config.values.notification_silentScriptUpdate) {
                        install(true);
                    } else {
                        notify.show(t, msg, chrome.extension.getURL("images/icon128_3d.png"), Config.values.scriptUpdateHideNotificationAfter, install);
                    }
                } catch (e) {
                    console.log("bg: notification error " + e.message);
                }
            }
            if (callback) callback(updatable);
        };
        updateUserscripts(0, showResult, id, cb);
        last.scripts = (new Date()).getTime();
        setUpdateCheckCfg(last);
    } else if (callback) {
        console.log("bg: WARN notifyOnScriptUpdates -> no force but callback");
        window.setTimeout(callback, 1);
    }
    window.setTimeout(notifyOnScriptUpdates, 5 * 60 * 1000);
};

trup = notifyOnScriptUpdates;

var scriptUpdateCheck = function(src) {

    var script = scriptParser.createScriptFromSrc(src);

    if (!script.name || script.name == '' || (script.version == undefined)) {
        return eERROR;
    }

    var oldscript = TM_storage.getValue(script.name, null);

    if (oldscript && oldscript.system) return null;

    if (script.options.compat_uW_gmonkey) {
        return eERROR;
    }

    if (script.name.search('@') != -1) {
        return eERROR;
    } else if (oldscript && script.version == oldscript.version) {
        return eEQUAL;
    } else if (oldscript && versionCmp(script.version, oldscript.version) == eOLDER) {
        return eOLDER;
    } else if (oldscript) {
        return eNEWER;
    }  else {
        // should not happen
        return eNEWER;
    }
    return eNEWER;
};

var updateUserscripts = function(tabid, showResult, scriptid, callback) {
    var names = getAllScriptNames();
    var running = 1;
    var found = 0;

    var checkNoUpdateNotification = function() {
        if (running == 0 && found == 0) {
            if (showResult) {
                if (D || V || UV) console.log("No update found");
                notify.show('Narf!',
                            chrome.i18n.getMessage('No_update_found__sry_'),
                            chrome.extension.getURL("images/icon128_3d.png"));
            }
            if (callback) {
                window.setTimeout(callback, 1);
            }
        }
    };

    var realCheck = function(r) {
        var details = {
            method: 'GET',
            retries: _retries,
            url: r.script.fileURL,
        };

        running++;
        (function() {
            var obj = { tabid: tabid, r: r};
            var cb = function(req) {
                running--;
                if (req.readyState == 4 && req.status == 200) {
                    if (V) console.log(obj.r.script.fileURL);

                    var updateHash = function() {
                        // call only if local and remove script version do match
                        if (obj.r.meta) {
                            if (V || UV) console.log("bg: update hash of script " + r.script.name + " to " + obj.r.meta[cUSOHASH]);
                            obj.r.script.hash = obj.r.meta[cUSOHASH];
                            storeScript(obj.r.script.name, obj.r.script);
                        }
                    };

                    var ret = scriptUpdateCheck(req.responseText);
                    if (ret == eNEWER) {
                        found++;
                        if (callback) callback(true, { name: obj.r.script.name,
                                                       url: obj.r.script.fileURL,
                                                       code: req.responseText,
                                                       newhash: obj.r.newhash });
                        return;
                    } else if (ret == eEQUAL) {
                        if (V || UV) console.log("bg: found same version @ " + obj.r.script.fileURL);
                        updateHash();
                    }
                } else {
                    console.log(chrome.i18n.getMessage("UpdateCheck_of_0name0_Url_0url0_failed_", [ obj.r.script.name, obj.r.script.fileURL ]));
                }
                checkNoUpdateNotification();
            };
            xmlhttpRequest(details, cb);
        })();
    };

    var metaCheck = function(r) {
        running++;

        var getmeta = function(o) {
            if (!r.script.hash || !o.meta || o.meta[cUSOHASH] != r.script.hash) {
                if (V || UV) console.log("bg: hash of script " + r.script.name + " has changed or does not exist! running version check!");
                r.meta = o.meta;
                r.metasrc = o.metasrc;
                realCheck(r)
            } else {
                if (V || UV) console.log("bg: hash of script " + r.script.name + " has NOT changed (" + o.meta[cUSOHASH] + ").");
            }
            running--;
            checkNoUpdateNotification();
        };

        getMetaData(r.script, getmeta);
    };

    var one = false;
    
    for (var k in names) {
        var n = names[k];
        var r = loadScriptByName(n);
        if (!r.script || !r.cond) {
            console.log(chrome.i18n.getMessage("fatal_error") + "(" + n + ")!!!");
            continue;
        }

        var c_scriptid = scriptid && r.script.id != scriptid
        var c_disabled = !Config.values.scriptUpdateCheckDisabled && !r.script.enabled && !scriptid;

        if (c_scriptid || c_disabled || !r.script.fileURL || r.script.fileURL == "") continue;

        one = true;
        metaCheck(r);
    }

    if (!one && scriptid && callback) {
        window.setTimeout(callback, 1);
    }

    running--;
    // remove initialy assigned 1
};

var determineLastScriptPosition = function() {
    var names = getAllScriptNames();
    var pos = 0;
    for (var k in names) {
        var n = names[k];
        var r = loadScriptByName(n);
        if (!r.script || !r.cond) {
            console.log("fatal error (" + n +")!!!");
            continue;
        }
        if (r.script.position && r.script.position > pos) pos = r.script.position;
    }
    var s = new scriptParser.Script();
    if (s.position > pos) pos = s.position;
    return pos;
};

var matchUrl = function(href, reg, match) {
    var clean = function(url) {
        return url.replace(/\/$/, '');
    };
    var r;

    if (!match &&
        reg.length > 1 &&
        reg.substr(0, 1) == '/') {
        r = new RegExp('.*' + reg.replace(/^\//g, '').replace(/\/$/g, '') + '.*', 'i');
    } else {
        var re = getRegExpFromUrl(reg, false, match);
        r = new RegExp(re);
    }
    return href.replace(r, '') == '';
};

var validUrl = function(href, cond, n) {
    var t, run = false;
    if (cond.inc || cond.match) {
        for (t in cond.inc) {
            if (matchUrl(href, cond.inc[t])) {
                if (D) console.log("bg: @include '" + cond.inc[t] + "' matched" + (n ? " (" + n + ")" : ""));
                run = true;
                break;
            }
        }
        if (cond.match) {
            for (t in cond.match) {
                if (matchUrl(href, cond.match[t], true)) {
                    if (D) console.log("bg: @match '" + cond.match[t] + "' matched" + (n ? " (" + n + ")" : ""));
                    run = true;
                    break;
                }
            }
        }
        if (!run) return run;
    } else {
        run = true;
    }
    for (t in cond.exc) {
        if (matchUrl(href, cond.exc[t])) {
            if (D) console.log("bg: @exclude '" + cond.exc[t] + "' matched" + (n ? " (" + n + ")" : ""));
            run = false;
            break;
        }
    }
    return run;
};

var getAllScriptNames = function() {
    var values = TM_storage.listValues();
    var ret = [];
    for (var k in values) {
        var v = values[k];
        // TODO: use appendix
        if (v.search(/@re$/) == -1) continue;
        var s = v.replace(/@re$/, '');
        // console.log("#### found " + v + " -> " + s);
        ret.push(s);
    }
    return ret;
};

var reorderScripts = function(name, pos) {
    var scripts = determineScriptsToRun();
    // add position tag
    for (var i=0; i<scripts.length; i++) {
        var s = scripts[i];
        if (s.name == name) {
            var f = (s.position < pos) ? .5 : -.5;
            s.position = (Number(pos) + f);
        }
    }
    scripts = sortScripts(scripts);
    var p = 1;
    for (var i=0;i<scripts.length;i++) {
        var s = scripts[i];
        s.position = p++;
        storeScript(s.name, s);
    }
};

var sortScripts = function(results) {
    var numComparisonAsc = function(a, b) { return a.position-b.position; };
    results.sort(numComparisonAsc);
    return results;
}

var determineScriptsToRun = function(href) {
    var names = getAllScriptNames();
    var ret = [];

    if (D || V) console.log("determineScriptsToRun @" + href);

    for (var k in names) {
        var n = names[k];

        if (href) {
            var cond = TM_storage.getValue(n + condAppendix, null);

            if (!cond) continue;
            if (!validUrl(href, cond, n)) {
                continue;
            }
        }

        var r = loadScriptByName(n);
        if (!r.script || !r.cond) {
            console.log("fatal error (" + n + ")!!!");
            continue;
        }

        if (V) console.log("schedule script " + n);
        ret.push(r.script);
    }

    if (V) console.log("determineScriptsToRun sort");

    return sortScripts(ret);
};

/* ###### Storage ####### */

var loadScriptStorage = function(name) {
    var s = TM_storage.getValue(name + storeAppendix, { ts: 0, data: {}});
    if (typeof s.ts === 'undefined') s.ts = 0;
    if (typeof s.data === 'undefined') s.data = {};
    return s;
};

var storeScriptStorage = function(name, storage) {
    if (storage) {
        TM_storage.setValue(name + storeAppendix, storage);
    } else {
        TM_storage.deleteValue(name + storeAppendix);
    }
};

var loadScriptByName = function(name) {
    var s = TM_storage.getValue(name, null);
    if (s) {
        s.textContent = TM_storage.getValue(name + scriptAppendix, s.textContent);
        if (!s.textContent) s = null;
    }
    return { script: s,
             cond: TM_storage.getValue(name + condAppendix, null) };
};

var storeScript = function(name, script) {
    if (script) {
        TM_storage.setValue(name + condAppendix, { inc: script.includes, match: script.matches, exc: script.excludes });
        TM_storage.setValue(name + scriptAppendix, script.textContent);
        var s = script;
        s.textContent = null;
        TM_storage.setValue(name, s);
    } else {
        TM_storage.deleteValue(name + condAppendix);
        TM_storage.deleteValue(name + scriptAppendix);
        TM_storage.deleteValue(name);
    }
};

var notifyStorageListeners = function(name, key, tabid, send) {
    if (send === undefined) send = true;
    if (key === undefined) key = null;
    var old = TM_storageListener;

    TM_storageListener = [];
    for (var k in old) {
        var c = old[k];
        try {
            if (name && c.name == name) {
                if (V || SV) console.log('storage notify ' + name);
                if (send) {
                    if (key) {
                        var st = { data: {}, ts: 0 };
                        var s = loadScriptStorage(c.name);
                        st.data[key] = s.data[key];
                        st.ts = s.ts;
                        var so = { storage : st };
                        if (s.data[key] === undefined) {
                            so.removed = key;
                        }
                        c.response(so);
                    } else {
                        c.response({ storage : loadScriptStorage(c.name) });
                    }
                }
                TM_storageListener.push(c);
            } else if (tabid != undefined && c.tabid == tabid) {
                if (V || SV) console.log('storage refresh/remove listeners of tab ' + tabid);
                if (send) c.response({ refresh: true });
            } else {
                TM_storageListener.push(c);
            }
        } catch (e) {
            console.log("Storage listener notification for script " + name + " failed! Page reload?!");
        }
    }
};

var removeStorageListeners = function(name, id) {
    var old = TM_storageListener;
    TM_storageListener = [];
    for (var k in old) {
        var c = old[k];
        try {
            if (c.name == name && c.id == id) {
                if (V || SV) console.log('send empty response ' + name + " " + id);
                c.response({});
            } else {
                TM_storageListener.push(c);
            }
        } catch (e) {
            console.log("Storage listener clear for script " + name + " failed! Page reload?!");
        }
    }
};

/* ###### Request Handler ####### */

var connectHandler = function(port) {
    if (!ginit) {
        window.setTimeout(function() { connectHandler(port); }, 10);
        return;
    }

    var connectMsgHandler = function(request) {
        var sender = port.sender;
        var sendResponse = function(o) {
            try {
                port.postMessage(o);
            } catch (e) {
                console.log('bg: Error sending port message: ' + JSON.stringify(o));
            }
        };

        if (request.method == "xhr") {
            var done = function() {
                port.disconnect();
            }
            var cbe = function(req) { sendResponse({error: true, data: req});};
            var cbs = function(req) { sendResponse({success: true, data: req});};
            var cbc = function(req) { sendResponse({change: true, data: req});};
            xmlhttpRequest(request.details, cbs, cbc, cbe, done);
        } else if (request.method == "addStorageListener") {
            if (typeof sender.tab != 'undefined') {
                if (V || SV) console.log("storage add listener " + request.name + " " + request.id);
                TM_storageListener.push({ tabid: sender.tab.id, id: request.id, name: request.name, time: (new Date()).getTime(), response: sendResponse});
            } else {
                console.log(chrome.i18n.getMessage("Unable_to_load_storage_due_to_empty_tabID_"));
                sendResponse({ error: true });
            }
        } else if (request.method == "removeStorageListener") {
            if (typeof sender.tab != 'undefined') {
                if (V) console.log("storage remove listener " + request.name + " " + request.id);
                /* do not store the whole storage as it already should be modifed with every GM_setValue
                if (request.name) {
                    var s = loadScriptStorage(request.name);
                    if (request.storage.ts != undefined &&
                        request.storage.ts > s.ts) {
                        if (V || SV) console.log("storage store " + request.name);
                        storeScriptStorage(request.name, request.storage);
                    }
                } */
                removeStorageListeners(request.name, request.id);
                sendResponse({ error: false });
            } else {
                console.log("Unable to remove storage listener due to empty tabID!");
                sendResponse({ error: true });
            }
        } else if (request.method == "saveStorageKey") {
            if (typeof sender.tab != 'undefined') {
                if (request.name) {
                    var s = loadScriptStorage(request.name);
                    if (V || SV) console.log("storage (" + request.name + "): set key " + request.key + " to '" + request.value + "'");
                    s.data[request.key] = request.value;
                    s.ts = request.ts;
                    storeScriptStorage(request.name, s);
                    notifyStorageListeners(request.name, request.key);
                }
            } else {
                console.log(chrome.i18n.getMessage("Unable_to_save_storage_due_to_empty_tabID_"));
            }
            sendResponse({});
        }
    };

    port.onMessage.addListener(connectMsgHandler);
};

var requestHandler = function(request, sender, sendResponse) {
    if (!ginit) {
        window.setTimeout(function() { requestHandler(request, sender, sendResponse); }, 10);
        return;
    }
    if (V || EV || MV) console.log("back: request.method " + request.method + " id " + request.id);
    if (request.method == "openInTab") {
        var done = function(tab) {
            closeableTabs[tab.id] = true;
            sendResponse({ tabId: tab.id });
        }
        chrome.tabs.create({ url: request.url}, done);
    } else if (request.method == "closeTab") {
        // check if this tab was created by openInTab request!
        if (request.tabId && closeableTabs[request.tabId]) {
            chrome.tabs.remove(request.tabId);
        }
        sendResponse({});
    } else if (request.method == "getTab") {
        if (typeof sender.tab != 'undefined') {
            if (typeof TM_tabs[sender.tab.id] == 'undefined') TM_tabs[sender.tab.id] = { storage: {} };
            var tab = TM_tabs[sender.tab.id];
            sendResponse({data: tab});
        } else {
            console.log(chrome.i18n.getMessage("Unable_to_deliver_tab_due_to_empty_tabID_"));
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
            console.log(chrome.i18n.getMessage("Unable_to_save_tab_due_to_empty_tabID_"));
        }
        sendResponse({});
    } else if (request.method == "setOption") {
        var optionstab = (typeof sender.tab != 'undefined' && sender.tab) ? (sender.tab.id >= 0 ? true : false) : null;

        Config.values[request.name] = request.value;
        Config.save();

        var done = function(items) {
            if (optionstab) {
                sendResponse({items: items});
            } else {
                chrome.extension.sendRequest({ method: "updateOptions",
                                                     items: items },
                                             function(response) {});
                sendResponse({});
            }
        };

        createOptionItems(done);
    } else if (request.method == "modifyScriptOptions" || request.method == "modifyNativeScript") {
        var optionstab = (typeof sender.tab != 'undefined' && sender.tab) ? (sender.tab.id >= 0 ? true : false) : null;
        var reload = (request.reload == undefined || request.reload == true);

        var nextStep = function() {
            if (request.reorder) {
                reorderScripts();
            }

            var updateOptionsPage = function() {
                var done = function(allitems) {
                    chrome.extension.sendRequest({ method: "updateOptions",
                                                         items: allitems },
                                                 function(response) {});
                };
                createOptionItems(done);
            }
            if (V) console.log("modifyScriptOptions " + optionstab);
            if (reload) {
                if (optionstab) { // options page
                    var done = function(allitems) {
                        sendResponse({ items: allitems });
                    };
                    createOptionItems(done);
                } else { // action page
                    // update options page, in case a script was en/disabled
                    if (request.name) window.setTimeout(updateOptionsPage, 100);

                    var resp = function(tab) {
                        // TODO: use allURLs[tid].scripts instead of getting them again?
                        var items = createActionMenuItems(tab);
                        sendResponse({items: items});
                        if (request.name && Config.values.autoReload) {
                            chrome.tabs.sendRequest(tab.id,
                                                    { method: "reload" },
                                                    function(response) {});
                        }
                    };
                    chrome.tabs.getSelected(null, resp);
                }
            } else {
                sendResponse({});
            }
        };

        if (request.name && request.method == "modifyScriptOptions") {
            var r = loadScriptByName(request.name);
            if (r.script && r.cond) {
                for (var i=0; i<scriptOptions.length;i++) {
                    if (typeof request[scriptOptions[i]] !== 'undefined') r.script.options[scriptOptions[i]] = request[scriptOptions[i]];
                }

                if (typeof request.enabled !== 'undefined') r.script.enabled = request.enabled;
                if (typeof request.includes !== 'undefined') {
                    //merge original and user *cludes
                    r.script.options.override.use_includes = request.includes;
                    r.script.options.override.use_excludes = request.excludes;
                    r.script.options.override.use_matches = request.matches;
                    r.script = mergeCludes(r.script);
                }

                storeScript(r.script.name, r.script);
                if (typeof request.position !== 'undefined' && reload) {
                    reorderScripts(request.name, request.position);
                }
            }
        } else if (request.nid && request.method == "modifyNativeScript") {
            var done = function (sc) {
                if (sc) {
                    if (request.actionid == 'installed') {
                        if (request.value == 'false') {
                            extensions.uninstall(sc, nextStep);
                            return;
                        }
                    } else if (request.actionid == 'enabled') {
                        extensions.setEnabled(sc, request.value, nextStep);
                        return;
                    }
                    nextStep();
                }
            }
            extensions.getUserscriptById(request.nid, done);
            return;
        }

        nextStep();

    } else if (request.method == "saveScript") {
        // TODO: check renaming and remove old one
        var cb = function(installed) {
            var done = function(allitems) {
                sendResponse({items: allitems, installed: installed});
            };
            createOptionItems(done);
        };

        if (request.clean) {
            var callback = function(installed) {
                var done = function(allitems) {
                    sendResponse({ cleaned: installed, items: allitems });
                    if (installed) notifyStorageListeners(request.name, null);
                };
                createOptionItems(done)
            };

            if (D) console.log("bg: clean userscript " + request.name);
            var r = loadScriptByName(request.name);
            if (!r.script || !r.cond) {
                console.log(chrome.i18n.getMessage("fatal_error") + " (" + n + ")" +"!!!");
                callback(false);
            } else {
                if (!addNewUserScript({ name: request.name, tabid: sender.tab.id, url: request.update_url, src: r.script.textContent, clean: true, ask: true, save: true, cb : callback })) {
                    if (callback) callback(false);
                }
            }
        } else if (request.code) {
            var callback = function(installed) { sendResponse({ installed: installed}); };
            if  (request.reload == undefined || request.reload == true) {
                callback = function (installed) { reorderScripts();
                                                  cb(installed); };
            }
            if (!addNewUserScript({ tabid: sender.tab.id, url: request.update_url, src: request.code, ask: true, save: true, cb : callback })) {
                if (callback) callback(false);
            }
        } else {
            removeUserScript(request.name);
            reorderScripts();
            cb();
        }
    } else if (request.method == "scriptClick") {
        if (typeof sender.tab != 'undefined') {
            var cb = function(found, installed) {
                sendResponse({ data: null, found: found, installed: installed });
                if (found) {
                    // update options page after script installation
                    if (installed) {
                        reorderScripts();
                        var done = function(allitems) {
                            chrome.extension.sendRequest({ method: "updateOptions",
                                                                 items: allitems },
                                                         function(response) {});
                        }
                        createOptionItems(done);
                    }
                } else {
                    chrome.tabs.sendRequest(sender.tab.id,
                                            { method: "showMsg", msg: chrome.i18n.getMessage('Unable_to_get_UserScript__Sry_'), id: request.id},
                                            function(response) {});
                }
            };
            installFromUrl(request.url, sender.tab.id, cb);
        } else {
            console.log(chrome.i18n.getMessage("Unable_to_install_script_due_to_empty_tabID_"));
        }
    } else if (request.method == "registerMenuCmd") {
        if (typeof sender.tab != 'undefined') {
            if (V || MV) console.log("MC add " + request.id);
            TM_menuCmd.add({ tabId: sender.tab.id, url: sender.tab.url, name: request.name, id: request.menuId, response: sendResponse });
        } else {
            console.log("Unable to register menu cmd due to empty tabID!");
            sendResponse({ run: false });
        }
    } else if (request.method == "unRegisterMenuCmd") {
        // cmd is unregistered just by getting
        if (V || MV) console.log("MC unreg " + request.id);
        TM_menuCmd.clearById(request.id);
        sendResponse({});
    } else if (request.method == "execMenuCmd") {
        // cmd is unregistered just by getting
        var c = TM_menuCmd.getById(request.id);
        if (c) {
            if (V || MV) console.log("MC exec " + c.id);
            c.response({ run: true, menuId: c.id });
        } else {
            console.log("bg: Error: unable to find MC id " + c.id);
        }
        sendResponse({});
    } else if (request.method == "runScriptUpdates") {
        if (request.scriptid) {
            var done = function(up) {
                sendResponse({ scriptid: request.scriptid, updatable: up});
            }
            notifyOnScriptUpdates(true, false, request.scriptid, done);
        } else {
            notifyOnScriptUpdates(true, true);
            sendResponse({});
        }
    } else if (request.method == "getWebRequestInfo") {
        if (typeof sender.tab != 'undefined') {
            var r = { webRequest: _webRequest };
            sendResponse(r);
        } else {
            console.log(chrome.i18n.getMessage("Unable_to_run_scripts_due_to_empty_tabID_"));
            sendResponse({});
        }
    } else if (request.method == "prepare") {
        if (typeof sender.tab != 'undefined' && sender.tab.index >= 0) { // index of -1 is used by google search for omnibox
            if (request.topframe || !allURLs[sender.tab.id] /* i.e. tamperfire page */) {
                resetTabInfo(sender.tab.id);
                setIcon(sender.tab.id);
            }
            var cb = function( scripts, enabledScriptsCount, disabledScriptsCount ) {
                var r = { enabledScriptsCount: enabledScriptsCount,
                          raw: {},
                          webRequest: _webRequest,
                          logLevel: Config.values.logLevel };

                if (enabledScriptsCount) {
                    if (request.raw) {
                        for (var o=0; o<request.raw.length; o++) {
                            r.raw[request.raw[o]] = getRawContent(request.raw[o]);
                        }
                    }
                    sendResponse(r);
                } else {
                    sendResponse( { logLevel: Config.values.logLevel } );
                }
                for (var k in scripts) {
                    if (!scripts.hasOwnProperty(k)) continue;
                    allURLs[sender.tab.id].scripts[k] = true;
                }
                allURLs[sender.tab.id].scripts_running += enabledScriptsCount;
                allURLs[sender.tab.id].scripts_disabled += disabledScriptsCount;
                setIcon(sender.tab.id);
                if (Config.values.appearance_badges != 'tamperfire') {
                    // dont determine tamperfire entries too often!
                    setBadge(sender.tab.id);
                }
            };
            var allrun_cb = function() {
                allURLs[sender.tab.id].allow_requests = true;
                setBadge(sender.tab.id);
            };
            if (Config.values.forbiddenPages.length == 0 || validUrl(request.url, { exc: Config.values.forbiddenPages })) {
                updateListener(sender.tab.id, {status: "complete"}, sender.tab, request, cb, allrun_cb);
                // a url may be added! reset fire count
                allURLs[sender.tab.id].fire_cnt = undefined;
            } else {
                console.log("Forbidden page: '" + request.url + "' -> Do nothing!");
                allURLs[sender.tab.id].allow_requests = true;
                sendResponse({});
            }
        } else {
            sendResponse({});
        }
    } else if (request.method == "startFireUpdate") {
        var done = function(suc) {
            sendResponse({ suc: suc });
        };
        TM_fire.checkUpdate(true, request.force, done);
    } else if (request.method == "getFireItems") {
        var done = function(cnt, items, progress) {
            if (progress == undefined) progress = null;
            if (items == undefined) items = null;

            var done2 = function(data) {
                try {
                    sendResponse({ image: data, cnt: cnt, scripts: items, progress: progress });
                    items = [];
                    res = [];
                } catch (e) {
                    console.log("bg: warn: action menu closed? " + JSON.stringify(e));
                }
            };
            PNG.createIconEx(cnt, done2);
        };
        if (!TM_fire.isReady()) {
            var s  = chrome.i18n.getMessage('Update_needed');
            if (TM_fire.status.downloading || TM_fire.status.update) {
                s = chrome.i18n.getMessage('Update_in_progress');
            }
            done(0, [], { action: TM_fire.status.action , state: TM_fire.status.progress } );
            return;
        }

        var idsdone = function(items) {
            var ret = createFirePageItems(request, items);
            done(items.length, ret);
        };

        if (request.tabid) {
            if (request.countonly) {
                TM_fire.tab.getCount(request.tabid, done);
            } else {
                TM_fire.tab.getItems(request.tabid, idsdone);
            }
        } else if (request.url) {
            if (request.url == '*') {
                var cb = function(s) {
                    var ids = [];
                    for (var i=0; i<1000; i++) {
                        ids.push(Math.floor(Math.random() * s + 1 ).toString());
                    }

                    TM_fire.ids.getItems(ids, idsdone);
                };

                TM_fire.getMax('scripts', 'sid', cb);
            } else if (request.countonly) {
                TM_fire.url.getCount(request.url, done);
            } else {
                TM_fire.url.getItems(request.url, idsdone);
            }
        } else {
            done([], []);
        }
    } else if (request.method == "notification") {
        var image = (request.image && request.image != "") ? request.image : chrome.extension.getURL("images/icon128_3d.png");
        var cb = function (clicked) {
            sendResponse({clicked : clicked});
        }
        notify.show(request.title, request.msg, image, request.delay, cb);
    } else if (request.method == "localFileCB") {
        localFile.listener(null, request.data);
        sendResponse({});
    } else {
        console.log("b: " + chrome.i18n.getMessage("Unknown_method_0name0" , request.method));
    }
    if (V) console.log("back: request.method " + request.method + " end!");
};

/* #### Action Menu && Options Page ### */
var TM_menuCmd = {
    commands: [],

    add : function(obj) {
        TM_menuCmd.commands.push(obj);
    },

    list : function() {
        var ret = [];
        for (var k in TM_menuCmd.commands) {
            if (!TM_menuCmd.commands.hasOwnProperty(k)) continue;
            var c = TM_menuCmd.commands[k];
            ret.push(c);
        }
        return ret;
    },

    listByTabId : function(tabId) {
        var ret = [];
        for (var k in TM_menuCmd.commands) {
            if (!TM_menuCmd.commands.hasOwnProperty(k)) continue;
            var c = TM_menuCmd.commands[k];
            if (c.tabId == tabId) {
                var drin = false;
                for (var i = 0; i < ret.length; i++) {
                    if (ret[i].name == c.name) {
                        drin = true;
                        break;
                    }
                }
                if (!drin) ret.push(c);
            }
        }
        return ret;
    },

    clearByTabId : function(id) {
        TM_menuCmd.getByTabId(id);
    },

    getByTabId : function(tabId) {
        var ret = [];
        var old = TM_menuCmd.commands;
        TM_menuCmd.commands = [];
        for (var k in old) {
            if (!old.hasOwnProperty(k)) continue;
            var c = old[k];
            if (c.tabId != tabId) {
                TM_menuCmd.commands.push(c);
            } else {
                ret.push(c);
                if (V || MV) console.log("MC remove " + c.id);
            }
        }
        return ret;
    },

    clearById : function(id) {
        TM_menuCmd.getById(id);
    },

    getById : function(id) {
        var ret = null;
        var old = TM_menuCmd.commands;
        TM_menuCmd.commands = [];
        for (var k in old) {
            if (!old.hasOwnProperty(k)) continue;
            var c = old[k];
            if (c.id != id) {
                TM_menuCmd.commands.push(c);
            } else {
                ret = c;
            }
        }
        if (V || MV) console.log("MC remove " + ret.id);
        return ret;
    }
};

/* #### Action Menu && Options Page ### */

var createFirePageItems = function(request, items) {

    var ret = [];
    var u = 'http://...';

    if (request.tabid && allURLs[request.tabid] && !allURLs[request.tabid].empty) {
        for (var k in allURLs[request.tabid].urls) {
            if (!allURLs[request.tabid].urls.hasOwnProperty(k)) continue;
            u = k;
            break;
        }
    } else if (request.url) {
        u = request.url;
    }

    ret.push({ name: chrome.i18n.getMessage('Enable_Sort_Cache'),
               id: 'fire_sort_cache_enabled',
               checkbox: true,
               option: true,
               enabled: Config.values.fire_sort_cache_enabled,
               desc: '' });

    var c = items.length ? ' (' + items.length + ')' : '';
    ret.push({ name: chrome.i18n.getMessage('Available_Userscripts') + c,  heading: true, scriptTab: true});

    ret = ret.concat(convertScriptsToMenuItems(items, true));

    ret.push({ name: chrome.i18n.getMessage('Settings'),  heading: true });
    ret.push({ name: chrome.i18n.getMessage('General'), section: true});

    var v = '', d = '';
    var l = getUpdateCheckCfg();

    if (l.fire.db_version == 0) {
        d = '?'
    } else {
        var m = l.fire.db_version * 1000;
        d = new Date(m).toString();
    }

    v += chrome.i18n.getMessage('Current_Index_') + '<br><br>';
    v += chrome.i18n.getMessage('Date_') + ' ' + d  + '<br>';
    v += chrome.i18n.getMessage('Entries_') + ' ' + ((l.fire.entries) ? l.fire.entries : '?')  + '<br><br><br>';

    ret.push({ name: 'TamperFire DB', fire: true, fireInfo: true, value: v, versionDB: m});
    ret.push({ name: chrome.i18n.getMessage('Check_for_Updates'),
              fname: chrome.i18n.getMessage('Force_Update'),
               fire: true, fireUpdate: true});

    ret.push({ name: 'Search by URL',
                     id: 'searchByURL',
                     search: true,
                     value: u,
                     desc: '' });
    return ret;
};

var createActionMenuItems = function(tab) {

    var url = tab ? tab.url : null;

    if (V) console.log("createActionMenuItems " + url);
    var ret = [];
    var s = [];

    if (Config.values.fire_enabled) {
        s.push({ name: chrome.i18n.getMessage('_0_scripts_found'),
                 image: chrome.extension.getURL('images/download.gif'),
                 doneImage: chrome.extension.getURL('images/fire.png'),
                 tabid: tab.id, tamperfire: true,
                 url: chrome.extension.getURL('fire.html?tab=' + tab.id),
                 newtab: true});
        s.push(createDivider());
    }

    s = s.concat(convertMgmtToMenuItems(tab));
    if (!s.length) {
        if (Config.values.forbiddenPages.length == 0 || validUrl(url, { exc: Config.values.forbiddenPages })) {
            s.push({ name: chrome.i18n.getMessage('No_script_is_running'), image: chrome.extension.getURL('images/info.png')});
        } else {
            s.push({ name: chrome.i18n.getMessage('This_page_is_blacklisted_at_the_security_settings'), image: chrome.extension.getURL('images/critical.png')});
        }
    }
    s.push({ name: chrome.i18n.getMessage('Get_new_scripts___'), image: chrome.extension.getURL('images/script_download.png'), url: 'http://userscripts.org', newtab: true});
    s.push({ name: chrome.i18n.getMessage('Add_new_script___'), image: chrome.extension.getURL('images/script_add.png'), url: chrome.extension.getURL('options.html') + '?new=1', newtab: true });

    ret = ret.concat(s);
    ret.push(createDivider());

    var c = convertMenuCmdsToMenuItems(tab.id);
    if (c.length) c.push(createDivider());
    c.push({ name: chrome.i18n.getMessage('Check_for_userscripts_updates'), image: chrome.extension.getURL('images/update.png'), runUpdate: true});
    c.push({ name: chrome.i18n.getMessage('Report_a_bug'), image: chrome.extension.getURL('images/bug.png'), url: 'http://forum.tampermonkey.net/posting.php?mode=post&f=17&subject=[BUG]', newtab: true });
    c.push({ name: chrome.i18n.getMessage('Please_consider_a_donation'), image: chrome.extension.getURL('images/amor.png'), url: 'http://tampermonkey.net/donate.html', newtab: true });
    if (c.length) c.push(createDivider());
    c.push({ name: chrome.i18n.getMessage('Options'), image: chrome.extension.getURL('images/agt_utilities.png'), url: chrome.extension.getURL('options.html'), newtab: true });
    c.push(createAboutItem());

    ret = ret.concat(c);

    return ret;
};

var createOptionItems = function(cb) {
    var ret = [];
    var c = [];
    var len = 1;

    ret.push({ name: chrome.i18n.getMessage('Installed_userscripts'),  heading: true, scriptTab: true});

    var s = convertMgmtToMenuItems(null, true);
    if (!s.length) {
        s.push({ name: chrome.i18n.getMessage('No_script_is_installed'), image: chrome.extension.getURL('images/info.png')});
        s.push({ name: chrome.i18n.getMessage('Get_some_scripts___'), image: chrome.extension.getURL('images/edit_add.png'), url: 'http://userscripts.org', newtab: true});
    } else {
        len = s.length;
    }

    var done = function(exts) {

        for (var i=0; i< exts.length; i++) {
            var k = exts[i];
            var img = k.enabled
                ? chrome.extension.getURL('images/greenled.png')
                : chrome.extension.getURL('images/redled.png');

            var obj = { name: k.name,
                        id: k.id,
                        image: img,
                        icon: k.icon,
                        code: null,
                        position: 0,
                        positionof: len,
                        enabled: k.enabled,
                        version: k.version,
                        description: k.description,
                        nativeScript: true };

            ret.push(obj);
        }

    ret.push ({ name: 'Version',
                id: null,
                version: true,
                value: chrome.extension.getVersion() });

    ret.push ({ name: chrome.i18n.getMessage('New_userscript'),
                id: null,
                image: chrome.extension.getURL('images/script_add.png'),
                icon: chrome.extension.getURL('images/txt.png'),
                code: Config.values.scriptTemplate,
                nnew: true,
                position: -1,
                positionof: len,
                enabled: true,
                userscript: true });

    ret = ret.concat(s);
    ret.push(createDivider());

    ret.push({ name: chrome.i18n.getMessage('Settings'), heading: true});

    var optsg = [];
    var optse = [];
    var optsu = [];
    var optsa = [];
    var optss = [];
    var opttf = [];
    var optns = [];

    optsg.push({ name: chrome.i18n.getMessage('General'), section: true});

    optsg.push({ name:  chrome.i18n.getMessage('Config_Mode'),
               id: 'configMode',
               level: 0,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Novice'), value: 0 },
                         { name: chrome.i18n.getMessage('Beginner'), value: 50 },
                         { name: chrome.i18n.getMessage('Advanced'), value: 100 } ],
               value: Config.values.configMode,
               desc: chrome.i18n.getMessage('Changes_the_number_of_visible_config_options') });

    optsg.push({ name: chrome.i18n.getMessage('Make_includes_more_safe'), id: 'safeUrls', level: 60, option: true, checkbox: true, enabled: Config.values.safeUrls,
               desc: chrome.i18n.getMessage('Includes_more_safe_example')});
    optsg.push({ name: chrome.i18n.getMessage('Fix_includes'), id: 'tryToFixUrl', level: 60, option: true, checkbox: true, enabled: Config.values.tryToFixUrl,
               desc: chrome.i18n.getMessage('Fix_includes_example') });
    optsg.push({ name: chrome.i18n.getMessage('Auto_reload_on_script_enabled'), level: 20, id: 'autoReload', option: true, checkbox: true, enabled: Config.values.autoReload,
               desc: chrome.i18n.getMessage('Auto_reload_on_script_enabled_desc') });

    optsg.push({ name: chrome.i18n.getMessage('Debug_scripts'), level: 100, id: 'debug', option: true, checkbox: true, enabled: Config.values.debug,
               desc: '' });
    optsg.push({ name: chrome.i18n.getMessage('Show_fixed_source'), level: 100, id: 'showFixedSrc', option: true, checkbox: true, enabled: Config.values.showFixedSrc,
               desc: '' });
    optsg.push({ name: 'LogLevel',
               id: 'logLevel',
               level: 0,
               option: true,
               select: [ { name: "Trace", value: 100 },
                         { name: "Verbose", value: 80 },
                         { name: "Debug", value: 60 },
                         /* { name: "Warning", value: 10 }, */
                         { name: "Error", value: 0 } ],
               value: Config.values.logLevel,
               desc: '' });


        optsa.push({ name: chrome.i18n.getMessage('Appearance'), section: true, level: 20 });

    optsa.push({ name: chrome.i18n.getMessage('3D_Icon_Set'),
               id: 'appearance_3d_icons',
               level: 200, /* never */
               option: true,
               checkbox: true,
               enabled: Config.values.appearance_3d_icons,
               desc: '' });

    optsa.push({ name: chrome.i18n.getMessage('Update_Notification'),
               id: 'notification_showTMUpdate',
               level: 20,
               option: true,
               checkbox: true,
               enabled: Config.values.notification_showTMUpdate,
               desc: '' });

    optsa.push({ name: chrome.i18n.getMessage('Icon_badge_info'),
               id: 'appearance_badges',
               level: 50,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Off'), value: 'off' },
                         { name: chrome.i18n.getMessage('Running_scripts'), value: 'running' },
                         { name: chrome.i18n.getMessage('Unique_running_scripts'), value: 'running_unique' },
                         { name: chrome.i18n.getMessage('Disabled_scripts'), value: 'disabled' },
                         { name: 'TamperFire', value: 'tamperfire' } ],
               value: Config.values.appearance_badges,
               desc: '' });

    opttf.push({ name: chrome.i18n.getMessage('TamperFire'), section: true});

    opttf.push({ name: chrome.i18n.getMessage('Enable_TamperFire'),
               id: 'fire_enabled',
               level: 0,
               option: true,
               checkbox: true,
               enabled: Config.values.fire_enabled,
               desc: '' });
    opttf.push({ name: chrome.i18n.getMessage('Enable_Sort_Cache'),
               id: 'fire_sort_cache_enabled',
               level: 100,
               checkbox: true,
               option: true,
               enabled: Config.values.fire_sort_cache_enabled,
               desc: '' });

    opttf.push({ name: chrome.i18n.getMessage('Update_interval'),
               id: 'fire_updatePeriod',
               level: 50,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Never'), value: 0 },
                         { name: chrome.i18n.getMessage('Every_Day'), value: 24 * 60 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('Every_Week'), value: 7 * 24 * 60 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('Every_2_Weeks'), value: 14 * 24 * 60 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('Every_Month'), value: 30 * 24 * 60 * 60 * 1000 } ],
               value: Config.values.fire_updatePeriod,
               desc: '' });

        optse.push({ name: chrome.i18n.getMessage('Editor'), section: true, level: 20});

    optse.push({ name: chrome.i18n.getMessage('Enable_Editor'),
               id: 'editor_enabled',
               level: 100,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_enabled,
               reload: true,
               warning: chrome.i18n.getMessage('A_reload_is_required'),
               desc: '' });

    optse.push({ name: chrome.i18n.getMessage('Indentation_Width'),
               id: 'editor_indentUnit',
               level: 50,
               option: true,
               select: [ { name: chrome.i18n.getMessage('1'), value: 1 },
                         { name: chrome.i18n.getMessage('2'), value: 2 },
                         { name: chrome.i18n.getMessage('3'), value: 3 },
                         { name: chrome.i18n.getMessage('4'), value: 4 },
                         { name: chrome.i18n.getMessage('5'), value: 5 },
                         { name: chrome.i18n.getMessage('6'), value: 6 },
                         { name: chrome.i18n.getMessage('7'), value: 7 },
                         { name: chrome.i18n.getMessage('8'), value: 8 },
                         { name: chrome.i18n.getMessage('9'), value: 9 },
                         { name: chrome.i18n.getMessage('10'), value: 10 },
                         { name: chrome.i18n.getMessage('11'), value: 11 } ],
               value: Config.values.editor_indentUnit,
               desc: '' });

    optse.push({ name: chrome.i18n.getMessage('Indent_with'),
               id: 'editor_indentWithTabs',
               level: 50,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Tabs'), value: 'tabs' },
                         { name: chrome.i18n.getMessage('Spaces'), value: 'spaces' } ],
               value: Config.values.editor_indentWithTabs,
               desc: '' });

    optse.push({ name: chrome.i18n.getMessage('TabMode'),
               id: 'editor_tabMode',
               level: 50,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Classic'), value: 'classic' },
                         { name: chrome.i18n.getMessage('Smart'), value: 'smart' } ],
               value: Config.values.editor_tabMode,
                     desc: '' });

        
    /* optse.push({ name: chrome.i18n.getMessage('EnterMode'),
               id: 'editor_enterMode',
               level: 50,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Indent_new_lines'), value: 'indent' },
                         { name: chrome.i18n.getMessage('Indent_as_previous'), value: 'keep' },
                         { name: chrome.i18n.getMessage('No_Indentation'), value: 'flat' } ],
               value: Config.values.editor_enterMode,
               desc: '' }); */

    optse.push({ name: chrome.i18n.getMessage('Reindent_on_typing'),
               id: 'editor_electricChars',
               level: 50,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_electricChars,
               desc: '' });


    optse.push({ name: chrome.i18n.getMessage('Show_Line_Numbers'),
               id: 'editor_lineNumbers',
               level: 20,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_lineNumbers,
               desc: '' });


    optsu.push({ name: chrome.i18n.getMessage('Script_Update'), section: true, level: 0});

    optsu.push({ name: chrome.i18n.getMessage('Check_disabled_scripts'),
               id: 'scriptUpdateCheckDisabled',
               level: 0,
               option: true,
               checkbox: true,
               enabled: Config.values.scriptUpdateCheckDisabled,
               desc: '' });

    optsu.push({ name: chrome.i18n.getMessage('Check_interval'),
               id: 'scriptUpdateCheckPeriod',
               level: 0,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Never'), value: 0 },
                         { name: chrome.i18n.getMessage('Every_Hour'), value: 1 * 60 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('Every_6_Hours'), value: 6 * 60 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('Every_12_Hour'), value: 12 * 60 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('Every_Day'), value: 24 * 60 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('Every_Week'), value: 7 * 24 * 60 * 60 * 1000 } ],
               value: Config.values.scriptUpdateCheckPeriod,
               desc: '' });

    optsu.push({ name: chrome.i18n.getMessage('Dont_ask_me_for_simple_script_updates'),
               id: 'notification_silentScriptUpdate',
               level: 80,
               option: true,
               checkbox: true,
               enabled: Config.values.notification_silentScriptUpdate,
               desc: '' });
                        
    optsu.push({ name: chrome.i18n.getMessage('Hide_notification_after'),
               id: 'scriptUpdateHideNotificationAfter',
               level: 50,
               option: true,
               select: [ { name: chrome.i18n.getMessage('Never'), value: 0 },
                         { name: chrome.i18n.getMessage('15_Seconds'), value: 15 * 1000 },
                         { name: chrome.i18n.getMessage('30_Seconds'), value: 30 * 1000 },
                         { name: chrome.i18n.getMessage('1_Minute'), value: 60 * 1000 },
                         { name: chrome.i18n.getMessage('5_Minutes'), value: 5 * 60 * 1000 },
                         { name: chrome.i18n.getMessage('1_Hour'), value: 60 * 60 * 1000 } ],
               value: Config.values.scriptUpdateHideNotificationAfter,
               desc: '' });

    optss.push({ name: chrome.i18n.getMessage('Security'), section: true, level: 50 });

    optss.push({ name: chrome.i18n.getMessage('Forbidden_Pages'),
               id: 'forbiddenPages',
               level: 50,
               option: true,
               input: true,
               array: true,
               value: Config.values.forbiddenPages,
               desc: '' });

    optns.push({ name: chrome.i18n.getMessage('Userscripts'), section: true, level: 80 });

    optns.push({ name: chrome.i18n.getMessage('New_script_template_'),
                 id: 'scriptTemplate',
                 level: 80,
                 option: true,
                 input: true,
                 value: Config.values.scriptTemplate });

        
    ret = ret.concat(optsg).concat(optsa).concat(optsu).concat(opttf).concat(optse).concat(optss).concat(optns);

    ret.push({ name: 'EOS', section: true, endsection: true});

    ret.push(createDivider());

    if (false) {
        ret.push({ name: chrome.i18n.getMessage('Registered_menu_cmds'), heading: true});

        c = convertMenuCmdsToMenuItems();
        if (c.length) c.push(createDivider());
    }
    ret = ret.concat(c);

    if (cb) cb(ret);
    }

    extensions.getAllUserscripts(done);
};

var createDivider = function() {
    return divider = { name: '', divider: true};
};

var createAboutItem = function() {
    return { name: ' ' + chrome.i18n.getMessage('About_Tampermonkey'), image: chrome.extension.getURL('images/info.png'), url: 'http://tampermonkey.net/about.html?version=' + chrome.extension.getVersion(), newtab: true };
};

var convertMenuCmdsToMenuItems = function(tabId) {
    var ret = [];
    var arr = (tabId == null || tabId == undefined) ? TM_menuCmd.list() : TM_menuCmd.listByTabId(tabId);

    for (var k in arr) {
        if (!arr.hasOwnProperty(k)) continue;
        var c = arr[k];
        var item = { name: c.name, id: c.id, image: chrome.extension.getURL('images/package_utilities.png'), menucmd: true };
        ret.push(item);
    }
    return ret;
};

var convertScriptsToMenuItems = function(scripts, options) {
    var ret = [];

    for (var k in scripts) {
        var script = scripts[k];

        var img = script.enabled
                ? chrome.extension.getURL('images/greenled.png')
                : chrome.extension.getURL('images/redled.png');

        if (!script.icon64 && !script.icon) {
            script.icon64 = chrome.extension.getURL('images/txt.png');
        }

        var item;
        if (options) {
            item = script;
        } else {
            item =  { name: script.name,
                      id: script.id,
                      system: script.system,
                      enabled: script.enabled,
                      position: script.position};
        }

        item.image = img;
        item.update_url = script.fileURL,
        item.positionof = scripts.length;
        item.userscript = true;

        if (script.options) {
            for (var i=0; i<scriptOptions.length;i++) {
                item[scriptOptions[i]] = script.options[scriptOptions[i]];
            }
        }
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

var convertMgmtToMenuItems = function(tab, options) {
    if (options == undefined) options = false;

    var url = tab ? tab.url : null;
    var scripts = [];

    if (tab) {
        if (allURLs[tab.id] && !allURLs[tab.id].empty) {
            for (var i in allURLs[tab.id].urls) {
                if (!allURLs[tab.id].urls.hasOwnProperty(i)) continue;
                if (V || UV) console.log("Found at AllURL["+tab.id+"] -> " + allURLs[tab.id].urls[i]);
                var s = determineScriptsToRun(i);
                for (var j=0; j<s.length; j++) {
                    var drin = false;
                    for (var k=0; k<scripts.length; k++) {
                        if (scripts[k].name == s[j].name) {
                            drin = true;
                            break;
                        }
                }
                    if (!drin) scripts.push(s[j]);
                }
            }
        } else {
            console.log("bg: WARN: allURLs["+tab.id+"] is empty!");
        }
    } else {
        scripts = determineScriptsToRun(url);
    }

    return convertScriptsToMenuItems(scripts, options);
};

/* ### web requests ### */
var extensions = {
    getAll : function (cb) {
        try {
            chrome.management.getAll(cb);
        } catch (e) {
            cb([]);
        }
    },
    getAllUserscripts : function(cb) {
        var run = function(all) {
            var ret = [];

            for (var k in all) {
                if (!all.hasOwnProperty(k)) continue;
                var i = all[k];

                if (i.homepageUrl == "" &&
                    i.hostPermissions.length == 0 &&
                    i.permissions.length == 0 &&
                    !i.icons &&
                    !i.updateUrl &&
                    i.isApp == false &&
                    i.optionsUrl == "" &&
                    i.mayDisable == true) {

                    i.icon = 'chrome://extension-icon/' + i.id + '/48/1';
                    ret.push(i);

                }
            }
            if (cb) cb(ret);
        };
        chrome.management.getAll(run);
    },
    getUserscriptByName : function(name, cb) {
        var run = function(some) {
            for (var k=0; k<some.length; k++) {
                var i = some[k];
                if (i.name == name) {
                    cb(i);
                    return;
                }
            }
            cb(null);
        };
        this.getAllUserscripts(run);
    },
    getUserscriptById : function(id, cb) {
        var run = function(some) {
            for (var k=0; k<some.length; k++) {
                var i = some[k];
                if (i.id == id) {
                    cb(i);
                    return;
                }
            }
            cb(null);
        };
        this.getAllUserscripts(run);
    },
    setEnabled : function(ext, en, cb) {
        try {
            chrome.management.setEnabled(ext.id, en, cb);
            return;
        } catch (e) {}
        if (cb) window.setTimeout(cb, 1);
    },
    uninstall : function(ext, cb) {
        try {
            chrome.management.uninstall(ext.id, cb);
            return;
        } catch (e) {}
        if (cb) window.setTimeout(cb, 1);
    }
};
exte = extensions;

/* #### pimped icon ### */

var PNG = {
    initCanvas : function(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
    },

    init : function(x, y) {
        var c = null;
        if (this.canvas) {
            c = this.canvas;
        } else {
            c = document.createElement('canvas');
            if (D) document.body.appendChild(c);
        }
        c.height = y;
        c.width = x;

        this.initCanvas(c);
    },
    
    initFromImage : function(img, x, y, xp, yp, s, cb) {
        var objImg = document.createElement('img');
        if (D) document.body.appendChild(objImg);
        
        var gy = this;
        var done = function() {
            gy.init(x, y);
            if (s) gy.context.scale(s, s);
            gy.context.drawImage(objImg, xp, yp);

            gy.loaded = true;
            if (cb) cb();
            objImg = null;
        };
        
        objImg.onload = done;
        objImg.src = img;
    },

    printNr : function(x, y, nr, color) {
        this.context.font = "22pt Arial bold";
        this.context.fillStyle = "rgba(" + color.join(',') + ", 1)";
        this.context.fillText(nr, x, y);
    },
    
    circle : function (x, y, r, color) {
        var c = "rgba(" + color.join(',') + ", 1)";
        this.context.fillStyle = c;
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2*Math.PI, true);
        this.context.fill();
    },

    rect : function(wx, wy, w, h, fill, color){
        if (fill == null) fill = true;
        if (fill) {
            this.context.fillStyle = "rgba(" + color.join(',') + ", 0.99)";
            this.context.fillRect (wx, wy, w, h);
        } else {
            this.context.fillStyle = "rgb(" + color.join(',') + ", 1)";
            this.context.beginPath();
            this.context.moveTo(wx,wy);
            this.context.lineTo(wx+w,wy);
            this.context.lineTo(wx+w,wy+h);
            this.context.lineTo(wx,wy+h);
            this.context.lineTo(wx,wy);
            this.context.stroke();
        }
    },

    rrect : function(x1, y1, x2, y2, r, bcolor) {
        var h = r;
        this.circle(x1 + h, y1 + h, r, bcolor);
        this.circle(x2 - h, y1 + h, r, bcolor);
        this.circle(x1 + h, y2 - h, r, bcolor);
        this.circle(x2 - h, y2 - h, r, bcolor);
        this.rect(x1 + r, y1, x2 - x1 - 2 * r, y2 - y1, true, bcolor);
        this.rect(x1, y1 + r, x2 - x1, y2 - y1 - 2 * r , true, bcolor);
    },

    createIconEx : function(nr, cb) {
        var w = 140;
        var h = 140;
        var gy = this;
        var s = 1;
        var done = function() {
            var pn = 14;
            var rh = 25;
            var x = 116 - (nr > 10 ? pn : 0) - (nr > 100 ? pn : 0) - (nr > 1000 ? pn : 0) - (nr > 10000 ? pn : 0);
            PNG.rrect(x, 0, w, rh, 4, [200,0,0]);
            var rand = 3;
            PNG.rrect(x + rand, 0 + rand, h - rand, rh - rand, 4, [190,0,0]);
            PNG.printNr(x + 4, rh - 3, nr, [240, 250, 240]);
            
            // if (cb) cb(gy.context.getImageData(0, 0, 19, 19));
            if (cb) cb(gy.canvas.toDataURL());
        };
        PNG.initFromImage(chrome.extension.getURL("images/icon128.png"), w, h, 6, 6, 1, done);
    },

    toPNG : function() {
        return this.canvas.toDataURL();
    }
};

var setBadge = function(tabId) {
    var c = 0;

    var set = function() {
        if (D) console.log("bg: setBadge: " + c);
        if (c == 0) {
            chrome.browserAction.setBadgeText({ text: '', tabId: tabId})
        } else {
            chrome.browserAction.setBadgeText({ text: c.toString(), tabId: tabId})
        }
    };

    if (Config.values.appearance_badges == 'off') {
        c = 0;
    } else if (Config.values.appearance_badges == 'running') {
        if (tabId && allURLs[tabId]) {
            c = allURLs[tabId].scripts_running;
        }
    } else if (Config.values.appearance_badges == 'running_unique') {
        if (tabId && allURLs[tabId]) {
            for (var k in allURLs[tabId].scripts) {
                if (!allURLs[tabId].scripts.hasOwnProperty(k)) continue;
                c++;
            }
        }
    } else if (Config.values.appearance_badges == 'disabled') {
        if (tabId && allURLs[tabId]) {
            c = allURLs[tabId].scripts_disabled;
        }
    } else if (Config.values.appearance_badges == 'tamperfire') {
        var done = function(cnt) {
            c = cnt;
            set();
        };
        TM_fire.tab.getCount(tabId, done);
        return;
    }

    set();
};

/* ### web requests ### */
var headerCheck = function(details) {
    if (_webRequest.verified == false) {
        if (D || UV) console.log('bg: verify that webRequest is working at ' + details.type + ' to ' + details.url);

        if (true) {
            for (var i = 0; i < details.requestHeaders.length; i++) {
                var item = details.requestHeaders[i];
                if (UV) console.log(" #: " + item.name + " -> " + item.value);
            }
        }

        var found = false;
        var r = new RegExp('^' + _webRequest.testprefix);
        for (var i = 0; i < details.requestHeaders.length; i++) {
            var item = details.requestHeaders[i];
            if (item.name.search(r) == 0) {
                if (D) console.log('bg: found ' + item.name + ' @webRequest :)');
                found = true;
            }
        }

        if (!found && _webRequest.verifyCnt-- > 0) return;

        _webRequest.use = found;
        _webRequest.verified = true;
        if (D) console.log('bg: verified webRequest ' + (_webRequest.use ? '' : 'not ') + 'being working');

        try {
            if (!_webRequest.use) {
                chrome.webRequest.onBeforeSendHeaders.removeListener(headerFix);
            }
            chrome.webRequest.onSendHeaders.removeListener(headerCheck);
        } catch(ex) {
            _webRequest.use = false;
            _webRequest.verified = true;
        }
    }
};

var headerFix = function(details) {
    if (V || UV) console.log(details.type);

    var f = {};
    var t = [];
    var r = new RegExp('^' + _webRequest.prefix);

    if (V || UV) {
        console.log("bg: process request to " + details.url);
        console.log(details.requestHeaders);
    }
    for (var i = 0; i < details.requestHeaders.length; i++) {
        var item = details.requestHeaders[i];
        if (item.name.search(r) == 0) {
            t.push(item);
        } else {
            f[item.name] = item.value;
        }
    }

    for (var i = 0; i < t.length; i++) {
        var item = t[i];
        f[item.name.replace(r, '')] = item.value;
    }

    if (!_webRequest.verified) {
        f[_webRequest.testprefix] = 'true';
    }
    
    var d = [];
    for (var k in f) {
        if (!f.hasOwnProperty(k)) continue;
        if (k != "") d.push({ name: k, value: f[k]});
    }

    if (V || UV) console.log(d);
    return { requestHeaders: d };
};

var sucRequest = function(details) {
    if (details.tabId > 0) {
        console.log("bg: " + details.requestId + " print " + details.type + " request of tabId " + details.tabId + " to " + details.url);
    }
};

var delayRequest = function(details) {

    if (details.tabId > 0) {
        if (V || UV) console.log("bg: " + details.requestId + " check " + details.type + " request of tabId " + details.tabId + " to " + details.url);

        // TODO: this still allows a iframe to load in case the parent documents content script is running
        if (details.type == "main_frame") {
            if (!allURLs[details.tabId] ||
                allURLs[details.tabId].allow_requests) {
                if (V || UV) console.log("bg: detected inital navigation");
                initAllURLsByTabId(details.tabId);
            }
        } else if (details.type == "sub_frame") {
            // TODO: somehow get frame id and check if script is running!
        } else {
            if (allURLs[details.tabId]) {
                if (allURLs[details.tabId].allow_requests) {
                    if (V || UV) console.log("bg: tab content script is running");
                    return {};
                } else {
                    if (V || UV) console.log("bg: tab content script is NOT running -> delay " + details.url);
                    var doit = function() {
                        var delay = function(d, v) {
                            if (V || UV) console.log("bg: (" + v + ")" + d.requestId + " delay " + d.type + " request of tabId " + d.tabId + " to " + d.url);

                            var remove = null;
                            var delayer = function(dets) {
                                remove();
                                v++;
                                // if (dets.requestId == d.requestId) {
                                    if (!allURLs[d.tabId] || !allURLs[d.tabId].allow_requests) {
                                        delay(d, v);  // third and fourth delay, this is all we can do...
                                        return { redirectUrl: d.url };  // second delay
                                    } else {
                                        if (V || UV) console.log('bg: ' + d.requestId + ' stop delaying of ' + d.url);
                                    }
                                // } else {
                                    //     if (V || UV) console.log('bg: ### ' + dets.requestId + " " +  d.requestId + '');
                                // }
                                return { };
                            };

                            remove = function() {
                                if (delayer) chrome.webRequest.onBeforeRequest.removeListener(delayer);
                                delayer = null;
                            };
                            var rreqFilter = { urls: [ "http://*/*", "https://*/*", "file://*/*" ] };
                            chrome.webRequest.onBeforeRequest.addListener(delayer, rreqFilter, ["blocking"]);
                            window.setTimeout(remove, 100);
                        };
                        delay(details, 0);
                    };
                    doit();
                    return { redirectUrl: details.url }; // first delay
                }
            } else {
                if (D) console.log("bg: delayRequest -> allURLs[" + details.tabId + "] is not defined!");
            }
        }
    }
    return {};
};

var checkRequestForUserscript = function(details) {
    var up = details.url.search(/\.user\.[js\#|js\?|js$]/);
    var qp = details.url.search(/\?/);

    if (details.tabId > 0 &&
        details.type == "main_frame" &&    /* ignore URLs from frames, xmlhttprequest, ... */
        details.method != 'POST' &&        /* i.e. github script modification commit */
        up != -1 &&
        (qp == -1 || up < qp) &&           /* ignore user.js string in URL params */
        details.url.search(/\#bypass=true/) == -1) {

        var redirect = function() {
            chrome.tabs.update(details.tabId, { url:  chrome.extension.getURL("ask.html") + "?script=" + encodeURI(details.url) });
        };

        window.setTimeout(redirect, 1);
        return { cancel: true };
    }

    return {};
};
 
var removeWebRequestListeners = function() {
    if (_webRequest.use) {
        try {
            chrome.webRequest.onBeforeSendHeaders.removeListener(headerFix);
            chrome.webRequest.onBeforeRequest.removeListener(checkRequestForUserscript);
            if (_webRequest.verified == false) chrome.webRequest.onSendHeaders.removeListener(headerCheck);
            if (V || UV) chrome.webRequest.onCompleted.removeListener(sucRequest);
        } catch(ex) {}
    }

    _webRequest.use = false;
    _webRequest.verified = true;
};

if (_webRequest.use) {
    try {
        var reqFilter = { urls: [ "http://*/*", "https://*/*" ], types : [ "xmlhttprequest" ] };
        var rreqFilter = { urls: [ "http://*/*", "https://*/*", "file://*/*" ] };
        chrome.webRequest.onBeforeSendHeaders.addListener(headerFix, reqFilter, ["requestHeaders", "blocking"]);
        if (_webRequest.delay) chrome.webRequest.onBeforeRequest.addListener(delayRequest, rreqFilter, ["blocking"]);
        chrome.webRequest.onSendHeaders.addListener(headerCheck, reqFilter, ["requestHeaders"]);
        chrome.webRequest.onBeforeRequest.addListener(checkRequestForUserscript, rreqFilter, ["blocking"]);
        if (V || UV) chrome.webRequest.onCompleted.addListener(sucRequest, reqFilter, []);

        chrome.webRequest.handlerBehaviorChanged();
        _webRequest.use = true;
        _webRequest.verified = false;
        _webRequest.id = ((new Date()).getTime() + Math.floor ( Math.random ( ) * 6121983 + 1 )).toString();
        _webRequest.testprefix = _webRequest.prefix + (Math.floor ( Math.random ( ) * 6121983 + 1 )).toString();
        _webRequest.prefix = _webRequest.prefix + _webRequest.id + '_';
    } catch (e) {
        if (D) console.log("bg: error initializing webRequests " + e.message);
        removeWebRequestListeners();
    }
 }

/* ### Cleanup ### */
function cleanup() {
    if (D) console.log("bg: cleanup!");
    removeWebRequestListeners();
}

window.addEventListener("unload", cleanup, false);

/* ### Listener ### */

var loadListenerTimeout = null;

var loadListener = function(tabID, changeInfo, tab) {
    if (!Config.initialized) {
        window.setTimeout(function() { loadListener(tabID, changeInfo, tab); }, 100);
        return;
    }
    if (V) console.log("loadListener " + tab.url + " " + changeInfo.status);
    var sere = function() {
        loadListenerTimeout = null;
        chrome.tabs.sendRequest(tabID,
                                { method: "getSrc" },
                                function(response) {
                                    if (V) console.log("add script from " + tab.url);
                                    addNewUserScript({ tabid: tab.id, url: tab.url, src: response.src });
                                });
    };
    if (tab.url.search(/\.tamper\.js$/) != -1 ||
        tab.url.search(/\.user\.js$/) != -1) {
        if (V) console.log("found script @ " + tab.url);
        if (changeInfo.status == 'complete') {
            if (loadListenerTimeout != null) {
                window.clearTimeout(loadListenerTimeout);
                loadListenerTimeout = null;
            }
            sere();
        } else {
            loadListenerTimeout = window.setTimeout(sere, 5000);
        }
    } else if (changeInfo.status == 'complete') {
        chrome.tabs.sendRequest(tabID,
                                { method: "onLoad" },
                                function(response) {});
    }
};

var onCommitedListener = function(details) {
    var resp = function(tab) {
        if (details.tabId != tab.id) return;
        // for i.e. facebook message
        setIcon(tab.id);
        setBadge(tab.id);
    };
    // determine selected tab, cause an new tab is created when the omnibox is selected :-/
    chrome.tabs.getSelected(null, resp);
};

var resetTabInfo = function(tabId) {
    if (V || UV) console.log("bg: reset AllURL["+tabId+"]");
    initAllURLsByTabId(tabId);
    TM_menuCmd.clearByTabId(tabId);
    notifyStorageListeners(null, null, tabId, false);
};

var addToAllURLs = function(tabid, url) {
    if (V || UV) console.log("Add to AllURL["+tabid+"] -> " + url);
    allURLs[tabid].urls[url] = true;
    allURLs[tabid].empty = false;
};

var initAllURLsByTabId = function(tabId) {
    allURLs[tabId] = { ts: (new Date()).getTime(), urls: {}, fire: null, empty: true, allow_requests: false, scripts: {}, scripts_running: 0, scripts_disabled: 0 };
};

var updateListener = function(tabID, changeInfo, tab, request, length_cb, allrun_cb) {
    if (!Config.initialized) {
        window.setTimeout(function() { updateListener(tabID, changeInfo, tab, request, cb); }, 100);
        return;
    }
    if (changeInfo.status == 'complete') {
        if (tab.title.search(escapeForRegExp(tab.url) + " is not available") != -1) {
            var reload = function() {
                console.log("trigger reload (tabID " + tabID + ") of " + tab.url);
                chrome.tabs.update(tabID, {url: tab.url});
            };
            window.setTimeout(reload, 20000);
        } else {
            if (request) tab.url = request.url + request.params;
            var scripts = determineScriptsToRun(tab.url);
            var runners = [];
            var disabled = 0;
            var script_map = {};
            
            for (var k=0; k<scripts.length; k++) {
                var script = scripts[k];

                if (V) console.log("check " + script.name + " for enabled:" + script.enabled);

                if (!script.enabled) {
                    disabled++;
                    continue;
                }
                if (script.options.noframes && !request.topframe) continue;

                script_map[script.name] = true;
                runners.push(script);
            }

            addToAllURLs(tabID, tab.url);
            if (length_cb) length_cb(script_map, runners.length, disabled);

            var cb = function() {
                if (--running == 0) allrun_cb();
            };
            var running = 1;
            for (var k=0; k<runners.length; k++) {
                running++;
                var script = runners[k];
                var rt = new runtimeInit();
                if (request) tab.scriptId = request.id;
                rt.contentLoad(tab, script, cb);
            }
            running--;
        }
    }
};

var selectionChangedListener = function(tabId, selectInfo) {
    // setBadge(tabId);
};

var removeListener = function(tabId, removeInfo) {
    if (allURLs[tabId]) delete allURLs[tabId];
};

var Config;
var Converter;

init = function() {
    /* TODO: include magic needs to be reworked cause eval fails when using
       manifest_version 2 -> http://code.google.com/chrome/extensions/manifest.html */
    include('xmlhttprequest.js');
    include('compat.js');
    include('parser.js');

    TM_storage.init();
    initScriptOptions();

    var cfgdone = function() {
        setOptions();
        alldone();
    };

    Config = new configInit(cfgdone, setOptions);
    Converter = getConverter();

    var waitForWebNav  = function() {
        if (!chrome.webNavigation || !chrome.webNavigation.onCommitted) {
            if (D || V) console.log("gb: waitForWebNav()");
            window.setTimeout(waitForWebNav, 300);
            return;
        }

        chrome.webNavigation.onCommitted.addListener(onCommitedListener);
    };
    
    var alldone = function() {
        window.setTimeout(notifyOnScriptUpdates, 10000);

        // the content script sends a request when it's loaded.. this happens just once ;)
        chrome.tabs.onUpdated.addListener(loadListener);
        chrome.tabs.onRemoved.addListener(removeListener);
        chrome.tabs.onSelectionChanged.addListener(selectionChangedListener);

        chrome.extension.onRequest.addListener(requestHandler);
        chrome.extension.onConnect.addListener(connectHandler);
        chrome.extension.onConnectExternal.addListener(function(port) {
                                                           port.disconnect();
                                                       });

        waitForWebNav();

        if (D || V) console.log("Listeners registered!");
        ginit = true;
    }
}

// webRequest API forces us to not use synchronous xmlHttpRequest initially
// window.setTimeout(init, 1);
init();

})();
