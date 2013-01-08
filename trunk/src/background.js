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
var sycl = null;
var cfgo = null;

var D = false;
var V = false;
var T = false;
var EV = true;
var MV = false;
var UV = false;
var SV = false;
var CV = false;
var NV = false;
var RV = false;

Registry.require('convert');
Registry.require('xmlhttprequest');
Registry.require('compat');
Registry.require('parser');
Registry.require('helper');
Registry.require('syncinfo');
Registry.require('i18n');

(function() {

var adjustLogLevel = function(logLevel) {
    D |= (logLevel >= 60);
    V |= (logLevel >= 80);
    RV |= (logLevel >= 80);
    EV |= (logLevel >= 100);
    MV |= (logLevel >= 100);
    UV |= (logLevel >= 100);
    SV |= (logLevel >= 100);
    CV |= (logLevel >= 100);
    NV |= (logLevel >= 100);
};

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
var _webRequest = { use: true, headers: true, verified: false, verifyCnt : 20, id: 0, prefix: 'TM_', testprefix: 'foobar' };

var TM_instanceID = (new Date()).getTime() + Math.floor(Math.random() * 061283 + 1);
var TM_tabs = {};
var TM_storageListener = [];
var closeableTabs = {};

var upNotification = null;
var ginit = false;

var condAppendix = '@re';
var storeAppendix = '@st';
var scriptAppendix = '@source';
var headerAppendix = '@header';

var requireCache = {};

if (D || V) console.log("Starting background fred @" + TM_instanceID);

/* ###### Helpers ####### */

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

chrome.extension.id = chrome.extension.getID();
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

    var restoreAllScriptsEx = function(processSource, cb) {
        var d = new scriptParser.Script();
        var names = getAllScriptNames();
        var running = 1;
        var check = function() {
            if (--running == 0 && cb) {
                window.setTimeout(cb, 1);
            }
        };

        for (var k in names) {
            var wrap = function() {
                var n = names[k];
                var r = loadScriptByName(n);
                if (!r.script || !r.cond) {
                    console.log(I18N.getMessage("fatal_error") + " (" + n + ")" +"!!!");
                    return;
                }
                for (var kk in d.options) {
                    if (!d.options.hasOwnProperty(kk)) continue;

                    if (r.script.options[kk] === undefined) {
                        console.log("set option " + kk + " to " + JSON.stringify(d.options[kk]));
                        r.script.options[kk] = d.options[kk];
                    }
                }
                for (var e in d.options.override) {
                    if (r.script.options.override[e] === undefined) {
                        console.log("set option.override." + e + " to " + JSON.stringify(d.options.override[e]));
                        r.script.options.override[e] = d.options.override[e];
                    }
                }

                var time = function() {
                    r.script = mergeCludes(r.script);

                    if (processSource) {
                        var ss = { url: r.script.fileURL,
                                   src: r.script.textContent,
                                   ask: false,
                                   cb : function() { /* done! */ },
                                   hash: r.script.hash };
                        addNewUserScript(ss);
                    } else {
                        r.script.id = scriptParser.getScriptId(r.script.name);
                        storeScript(r.script.name, r.script, false);
                    }

                    check();
                };
                if (cb) {
                    running++;
                    window.setTimeout(time, 10);
                } else {
                    time();
                }
            };
            wrap();
        }

        check();
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
        { cond: isNewVersion && versionCmp("2.5.61", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 2.5.61");

                var names = getAllScriptNames();
                for (var k in names) {
                    var n = names[k];
                    var r = loadScriptByName(n);
                    if (!r.script || !r.cond) {
                        console.log(I18N.getMessage("fatal_error") + " (" + n + ")" +"!!!");
                        continue;
                    }
                    r.script.options.do_sync = r.script.options.sync;
                    delete r.script.options.sync;
                    r.script.id = scriptParser.getScriptId(r.script.name);
                    storeScript(r.script.name, r.script, false);
                }

                var o = TM_storage.getValue("TM_config", null);
                if (o) {
                    for (var r in o) {
                        if (!o.hasOwnProperty(r)) continue;
                        if (r == 'fire_updateURL') {
                            o[r] = 'http://fire.tampermonkey.net/update.php';
                        } else if (r == 'sync_URL') {
                            o[r] = '';
                        }
                    }
                    TM_storage.setValue("TM_config", o);
                }
                window.setTimeout(cb, _setTimeout);
            }
        },
        { cond: isNewVersion && versionCmp("2.6.83", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 2.6.83");
                restoreAllScriptsEx(false, cb);
            }
        },
        { cond: isNewVersion && versionCmp("2.9.2943", version) == eNEWER,
          fn : function(cb) {
                console.log("Update config from " + version + " to 2.9.2943");

                var names = getAllScriptNames();
                for (var k in names) {
                    var n = names[k];
                    var r = loadScriptByName(n);
                    if (!r.script || !r.cond) {
                        console.log(I18N.getMessage("fatal_error") + " (" + n + ")" +"!!!");
                        continue;
                    }
                    r.script.options.compatopts_for_requires = r.script.options.compat_for_requires;
                    storeScript(r.script.name, r.script, false);
                }
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

/* ####### context registry #### */

var ctxRegistry = {
    n: {},
    has: function(tabId) {
        return (!!ctxRegistry.n[tabId]);
    },
    reset : function(tabId) {
        if (V || UV) console.log("ctxReg: reset ctxRegistry["+tabId+"]");
        ctxRegistry.init(tabId);
    },
    assert : function(tabId, log) {
        if (log === undefined) log = true;

        if (!ctxRegistry.has(tabId)) {
            if (log) console.log("ctxReg: assert ctxRegistry["+tabId+"]");
            ctxRegistry.init(tabId);
        }
    },
    init : function(tabId) {
        ctxRegistry.n[tabId] = { ts: (new Date()).getTime(),
                                 urls: {},
                                 fire_cnt: null,
                                 empty: true,
                                 user_agent: null,
                                 blocker: false,
                                 stats: { running : 0, disabled: 0, executed: {} } };
    },
    remove : function(tabId) {
        if (ctxRegistry.has(tabId)) delete ctxRegistry.n[tabId];
    },
    addUrl : function(tabId, frameId, url, ua) {
        if (V || UV || EV) console.log("ctxReg: add to ctxRegistry["+tabId+"] -> " + url + " ua: " + JSON.stringify(ua));
        ctxRegistry.assert(tabId, false);

        if (ctxRegistry.n[tabId].urls[url] == undefined) ctxRegistry.n[tabId].urls[url] = 0;

        ctxRegistry.n[tabId].urls[url]++;
        ctxRegistry.n[tabId].empty = false;

        for (var k in ua) {
            if (!ua.hasOwnProperty(k)) continue;
            if (!ctxRegistry.n[tabId].user_agent) ctxRegistry.n[tabId].user_agent = {};
            ctxRegistry.n[tabId].user_agent[url] = ua[k];
        }
    },

    setCache : function(tabId, frameId, url, runInfo) {
        if (V || UV || EV) console.log("ctxReg: setCache to ctxRegistry["+tabId+"] -> " + url);
        ctxRegistry.assert(tabId, false);

        ctxRegistry.n[tabId].cache = runInfo;
    },

    clearCache : function(tabId, frameId) {
        if (V || UV || EV) console.log("ctxReg: clearCache to ctxRegistry["+tabId+"]");
        if (ctxRegistry.has(tabId)) {
            delete ctxRegistry.n[tabId].cache;
        }
    },

    removeUrl : function(tabId, frameId, url) {
        if (!ctxRegistry.has(tabId)) return;

        if (--ctxRegistry.n[tabId].urls[url] == 0) {
            if (V || UV || EV) console.log("ctxReg: remove from ctxRegistry["+tabId+"] -> " + url);

            delete ctxRegistry.n[tabId].urls[url];
            if (ctxRegistry.n[tabId].user_agent) {
                delete ctxRegistry.n[tabId].user_agent[url];
            }
            ctxRegistry.n[tabId].empty = true;

            // really empty?
            for (var k in ctxRegistry.n[tabId].urls) {
                if (!ctxRegistry.n[tabId].urls.hasOwnProperty(k)) continue;
                ctxRegistry.n[tabId].empty = false;
                break;
            }
        }
    },
    isEmpty : function(tabId) {
        if (!ctxRegistry.has(tabId)) return true;
        return ctxRegistry.n[tabId].empty;
    },

    setFireCnt : function(tabId, value) {
        ctxRegistry.assert(tabId, false);
        ctxRegistry.n[tabId].fire_cnt = value;
    },

    getFireCnt : function(tabId) {
        if (!ctxRegistry.has(tabId)) return null;
        return ctxRegistry.n[tabId].fire_cnt;
    },

    getInfo : function(tabId) {
        return ctxRegistry.n[tabId];
    },

    getRunning : function(tabId) {
        if (!ctxRegistry.has(tabId)) return null;
        return ctxRegistry.n[tabId].stats.running;
    },

    iterateTabs : function(fn) {
        for (var k in ctxRegistry.n) {
            if (!ctxRegistry.n.hasOwnProperty(k)) continue;
            if (fn(k, ctxRegistry.n[k])) break;
        }
    },
    iterateUrls : function(tabId, fn) {
        return ctxRegistry.iterate(tabId, 'urls', fn);
    },
    iterate : function(tabId, key, fn) {
        if (!ctxRegistry.has(tabId)) return null;

        for (var k in ctxRegistry.n[tabId][key]) {
            if (!ctxRegistry.n[tabId][key].hasOwnProperty(k)) continue;
            if (fn(k, ctxRegistry.n[tabId][key][k])) break;
        }
        return true;
    }
};

/* ####### Tabs #### */
var Tab = {
    getScriptRunInfo : function(url, frameId) {
        var scripts = determineScriptsToRun(url);
        var runners = [];
        var disabled = 0;
        var script_map = {};
        var user_agent = {};

        for (var k=0; k<scripts.length; k++) {
            var script = scripts[k];

            if (V) console.log("check " + script.name + " for enabled:" + script.enabled);

            if (!script.enabled) {
                disabled++;
                continue;
            }
            if (script.options.noframes && frameId != 0) continue;

            if (script.options.user_agent && script.options.user_agent != "") {
                user_agent[frameId] = script.options.user_agent;
            }
            script_map[script.name] = true;
            runners.push(script);
        }

        return { runners: runners, disabled: disabled, script_map: script_map, user_agent: user_agent };
    },

    prepare : function(nfo, length_cb) {
        var runInfo = Tab.getScriptRunInfo(nfo.url, nfo.frameId);

        ctxRegistry.addUrl(nfo.tabId, nfo.frameId, nfo.url, runInfo.user_agent);
        if (length_cb) length_cb(runInfo.runners.length, runInfo.disabled);

        return runInfo;
    },

    runScripts : function(nfo, runInfo, allrun_cb) {
        var check = function() {
            if (--running == 0 && allrun_cb) allrun_cb();
        };
        var running = 1;
        var fromCache = false;

        if (!runInfo &&
            ctxRegistry.has(nfo.tabId)) {
            runInfo = ctxRegistry.n[nfo.tabId].cache;
            fromCache = true;
        }

        if (runInfo) {
            for (var k=0; k<runInfo.runners.length; k++) {
                var script = runInfo.runners[k];
                if (!script.options.user_agent) {
                    var rt = new runtimeInit();
                    running++;
                    rt.contentLoad(nfo, script, check);
                }
            }

            if (fromCache) ctxRegistry.clearCache(nfo.tabId, nfo.frameId);
        } else {
            console.log("bg: ERROR: runInfo neither given nor found in cache!!!!");
        }
        check();
    },

    reset : function(tabId, early) {
        ctxRegistry.reset(tabId);
        TM_menuCmd.clearByTabId(tabId);
        notifyStorageListeners(null, null, tabId, false);

        if (early) {
            // skip some actions, cause tab does not exist for some APIs yet
        } else {
            setIcon(tabId);
        }
    }
};

/* ###### Sync ####### */

var ScriptDetector = {
    isScriptUrl : function(url_string) {
        if (!url_string) return false;

        var url = url_string.split(/[\?#$]/)[0];
        var p = url.search(/\.user\.(js\#|js\?|js$)/) != -1 ||
                url.search(/\.tamper\.(js\#|js\?|js$)/) != -1;
        if (!p) return p;

        var n = (url.search(/^htt[ps]{1,2}:\/\/code\.google\.com/) != -1) || /* google code raw files are deliverd from googlecode.com */
                (url.search(/^htt[ps]{1,2}:\/\/github\.com/) != -1 && url.search(/^htt[ps]{1,2}:\/\/github\.com\/[a-zA-Z0-9%-]\/[a-zA-Z0-9%-]\/raw\//) == -1); /* install userscirpt only from /raw/ urls */

        return !n;
    }
}
/* ####### local file permission #### */

var localFile = {
    id : 0,
    useXmlHttpReq: true,
    useIframeMessage: false,
    callbacks: {},
    listener: function(event, d) {
        d = event ? event.data : d;

        try {
            var data = JSON.parse(d);
            var o = localFile.callbacks[data.id];

            if (o) {
                if (V) console.log("localFile: retrieval of '" + o.url + "' took " + ((new Date()).getTime() - o.ts) + "ms");
                if (o.cb) o.cb(data.content);
                if (o.iframe) o.iframe.parentNode.removeChild(o.iframe);
                delete localFile.callbacks[data.id];
            } else {
                console.log("localFile: WARN: getSource callback " + data.id + " not found!");
            }
        } catch (e) {
            console.log("localFile: ERR: getSource processing of " + d + " failed!");
        }
    },
    initialize : function() {
        if (localFile.useIframeMessage) {
            window.addEventListener('message', localFile.listener, false);
            window.addEventListener('unload', localFile.clean, false);
        }
    },
    clean: function() {
        if (localFile.useIframeMessage) {
            window.removeEventListener('message', localFile.listener, false);
            window.removeEventListener('unload', localFile.clean, false);
        }
        localFile.callbacks = {};
    },
    getSource : function(url, cb) {
        if (localFile.useXmlHttpReq) {
            return localFile.getSourceXmlHttp(url, cb);
        } else {
            return localFile.getSourceIframe(url, cb);
        }
    },
    getSourceXmlHttp: function(url, cb) {
        // avoid file:// caching... !?
        var ts = (new Date()).getTime();
        url += (url.search('\\?') != -1) ? '&' : '?';
        url += 'ts=' + ts;

        var resp = function(req) {
            cb(req.responseText);
        };
        var details = {
            method: 'GET',
            retries: 0,
            url: url,
        };
        xmlhttpRequest(details,
                       resp,
                       null,
                       null,
                       null,
                       true);
    },
    getSourceIframe: function(url, cb) {
        if (localFile.id == 0) {
            localFile.initialize();
        }

        var i = document.createElement('iframe');
        i.src = url + "?gimmeSource=1";
        document.getElementsByTagName('body')[0].appendChild(i);

        var d = JSON.stringify({ id: localFile.id });
        localFile.callbacks[localFile.id] = { cb: cb, ts: (new Date()).getTime(), iframe: i, url: url };

        var wrap = function() {
            var cbi = localFile.id;
            var notfound = function() {
                if (cbi == null) return; // too late! :)
                if (localFile.callbacks[cbi]) {
                    localFile.listener(null, JSON.stringify({ id: cbi, content: null }));
                }
                cbi = null;
            };
            var post = function() {
                if (cbi == null) return; // too late! :(
                try {
                    i.contentWindow.postMessage(d, i.src);
                    cbi = null;
                } catch (e) {
                    if (D) console.log("localFile: ERROR:" + e.message);
                }
            };
            i.onload = post;

            // timeout 3000s, this should be enough for local resources
            window.setTimeout(notfound, 3000);
        }
        wrap();

        localFile.id++;
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
    status : { initialized : false, action : "Initializing"},

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
        // return "http://tampermonkey.net/fire/update_23x.php?ts=0";
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
                        I18N.getMessage('TamperFire_update_failed___'), chrome.extension.getURL("images/icon128.png"));

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
                    TM_fire.status.action = I18N.getMessage('Update_in_progress');
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

                    var inited = function() {
                        TM_fire.status.update = true;

                        var done = function(cnt) {
                            TM_fire.resetStatus();
                            if (cb) cb(cnt);
                        };

                        TM_fire.insertValuesFromJSON(json, done);
                    };

                    var cleaned = function() {
                        TM_fire.initTables(inited);
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
                TM_fire.status.action = I18N.getMessage('Downloading');
                TM_fire.status.download = true;

                setTimer();
                xmlhttpRequestInternal(details, done, progress);
                tries--;
            } else {
                error('Download failed!');
            }
        };

        notify.show('TamperFire',
                    I18N.getMessage('TamperFire_update_started'), chrome.extension.getURL("images/icon128.png"));

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
            if (cb) cb();
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
                    I18N.getMessage('TamperFire_import_started'), chrome.extension.getURL("images/icon128.png"));

        for (var k in json.scripts) {
            if (!json.scripts.hasOwnProperty(k)) continue;
            index.push(k);
        }

        TM_fire.status.action = I18N.getMessage('Processing_scripts');
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
                TM_fire.status.action = I18N.getMessage('Writing_scripts');
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
                            I18N.getMessage('TamperFire_is_up_to_date'), chrome.extension.getURL("images/icon128.png"));
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

                    var k = Helper.getRegExpFromUrl(obj.excludes[j], Config, true);
                    if (!excludes[k]) {
                        excludes[k] = { sids: [] };
                    }
                    excludes[k].sids.push(index[i]);
                }

                for (var j=0; j < obj.includes.length; j++) {
                    var inc = obj.includes[j].trim();
                    var k = Helper.getRegExpFromUrl(inc, Config, true);
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
                             inc.search("^" + Helper.escapeForRegExp("*://*[$|\/]")) != -1 ||
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

            if (ctxRegistry.has(id)) {
                var it = function(i, v) {
                    running++;
                    TM_fire.url.getItems(i, add);
                };
                ctxRegistry.iterateUrls(id, it);
            } else {
                cb(ret);
            }

            running--;
        },

        getCount : function(id, cb) {
            var done = function(r) {
                ctxRegistry.setFireCnt(r.length);
                if (cb) cb(r.length);
            };
            var cn = ctxRegistry.getFireCnt(id);
            if (cn) {
                cb(cn);
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
        if (V) console.log("bg: TM_storage.init() " + _use_localdb);
        if (_use_localdb) {
            var fill = function(tx, vars) {
                TM_storage.cacheDB = {};
                if (vars) {
                    for (var i=0; i<vars.rows.length; i++) {
                        // if (SV) console.log("fill: " + vars.rows.item(i).name + " -> " +vars.rows.item(i).value);
                        TM_storage.cacheDB[vars.rows.item(i).name] = vars.rows.item(i).value;
                    }
                }
                TM_storage.initialized = true;
                if (cb) cb();
            };
            var initCache = function() {
                if (SV) console.log("bg: init storage cache");
                TM_storage.localDB.db.transaction(function(tx) {
                                           tx.executeSql("SELECT * FROM config",
                                                         [],
                                                         fill,
                                                         TM_storage.localDB.onError);
                                       });
            };
            TM_storage.localDB = {
                db: openDatabase('tmStorage', '1.0', 'TM Storage', 30 * 1024 * 1024),
                onSuccess : function(tx, result) {
                    if (SV) console.log("bg: storage: localDB Success ");
                },
                onError : function(tx, e) {
                    console.log("bg: storage: localDB Error " + JSON.stringify(e));
                },
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
        if (SV) console.log("TM_storage.setValue -> " + uename);
        var type = (typeof value)[0];
        var name = escapeName(uename);
        switch (type) {
          case 'o':
              try {
                  value = type + JSON.stringify(value);
              } catch (e) {
                  console.log("bg: storage: setValue ERROR: " + e.message);
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
        if (SV) console.log("TM_storage.getValue -> " + uename);
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
                      console.log("bg: storage: getValue ERROR: " + e.message);
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
        if (SV) console.log("TM_storage.deleteAll()");
        if (_use_localdb) {
            TM_storage.cacheDB = {};
            TM_storage.localDB.db.transaction(function(tx) {
                                       tx.executeSql('DROP TABLE config',
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
        if (SV) console.log("TM_storage.deleteValue -> " + uename);
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
        if (SV) console.log("TM_storage.listValues");
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
        var c = Registry.getRaw(u);
        if (c) ret.push(c);
    }

    return ret;
};

/* ###### Sync ####### */

var SyncClient = {
    initialized : false,
    enabled : false,
    syncing : 0,
    period : null,
    syncDoneListener: [],
    scheduled : { to: null, force: null, t: 0 },
    createTeslaData : function(cb) {
        var ret = [];
        var local = SyncClient.getLocalScriptList();

        for (var k=0; k<local.length; k++) {
            if (local[k].url) {
                var s = local[k].name.replace(/\|/g, '!') + '|' + '{}' + '|' + local[k].url.replace(/\|/g, '%7C');
                ret.push(s)
            }
        }
        if (cb) cb(ret);
    },
    enable :  function(callback) {
        if (SyncClient.enabled) {
            if (D) console.log("sync: reenable?");
        } else if (Config.values.sync_type == 0) {
            SyncClient.enabled = false;
        } else {
            SyncClient.enabled = SyncInfo.init(Config.values.sync_type, Config.values.sync_id);
        }
        if (!SyncClient.initialized) {
            SyncInfo.addChangeListener(SyncClient.remoteChangeCb);
            SyncClient.initialized = true;
        }
        if (callback) callback(SyncClient.enabled);
    },
    finalize : function() {
    },
    reset : function(cb) {
        SyncInfo.reset(cb);
    },
    addSyncDoneListener : function (cb) {
        SyncClient.syncDoneListener.push(cb);
        if (V) console.log("sync: addSyncDoneListener() -> " + SyncClient.syncDoneListener.length);
    },
    runAllSyncDoneListeners : function(success) {
        if (V) console.log("sync: runAllSyncDoneListeners() -> " + SyncClient.syncDoneListener.length);

        while (SyncClient.syncDoneListener.length) {
            var e = SyncClient.syncDoneListener.splice(0, 1);
            e[0](success);
        }
    },
    scheduleSync : function(t, force) {
        var n = (new Date()).getTime();

        force = SyncClient.scheduled['force'] || force;
        if (SyncClient.scheduled.to) {
            window.clearTimeout(SyncClient.scheduled.to);
            if (SyncClient.scheduled.ts < (n + t)) {
                // run as early as possible
                t = SyncClient.scheduled.ts - n;
                if (t < 1) t = 1;
                if (V) console.log("sync: re-schedule sync for run in " + t + " ms");
            }
        } else {
            if (D) console.log("sync: schedule sync for run in " + t + " ms");
        }

        var run = function() {
            SyncClient.sync(SyncClient.scheduled.force);
            SyncClient.scheduled.to = null;
            SyncClient.scheduled.force = null;
        };

        var abort = function() {
            SyncClient.scheduled.to = null;
            SyncClient.scheduled.force = null;
        };

        var check = function() {
            if (Config.values.sync_type == SyncInfo.types.eCHROMESYNC) {
                var got = function(has, asked) {
                    if (has) {
                        run();
                    } else {
                        console.log("sync: storage permission is needed in order to use Google Sync!");
                        abort();
                    }
                };
                storagePermission.requestPermissionEx(got);
            } else {
                run();
            }
        };

        SyncClient.scheduled.to = window.setTimeout(check, t);
        SyncClient.scheduled.force = force;
        SyncClient.scheduled.ts = n + t;
    },
    schedulePeriodicalCheck : function() {
        if (SyncClient.period) return;
        var t = 18000000 /* 5h */;
        if (D) console.log("sync: schedule sync for periodical run every " + t + " ms");
        SyncClient.period = window.setInterval(SyncClient.sync, t);
    },
    disablePeriodicalCheck : function() {
        if (SyncClient.period) {
            if (D) console.log("sync: disable periodical sync");
            window.clearInterval(SyncClient.period);
            SyncClient.period = null;
        }
    },
    getLocalObjFromScript : function(script) {
        var id = (script.id || scriptParser.getScriptId(script.name));
        var durl = script.downloadURL ? script.downloadURL.split('#')[0] : null;
        var furl = script.fileURL ? script.fileURL.split('#')[0] : null;
        var url = furl || durl;

        return { id: id, name: script.name, durl: durl, furl: furl, url: url };
    },
    getLocalScriptList : function() {
        var ret = [];
        var names = getAllScriptNames();
        for (var k in names) {
            var n = names[k];
            var r = loadScriptByName(n);
            if (!r.script || !r.cond) {
                continue;
            }
            ret.push(SyncClient.getLocalObjFromScript(r.script));
        }

        return ret;
    },
    getRemoteScriptList : function(cb) {
        SyncInfo.list(cb);
    },
    checkSyncAccount : function(key, oldVal, newVal) {
        var et = null;
        var scheduleEnable = function(force) {
            if (et == null) {
                var run = function() {
                    SyncClient.enable(function() {
                                          notifyOptionsTab();
                                          SyncClient.scheduleSync(3000, force);
                                      });
                    et = null;
                }
                et = window.setTimeout(run, 200);
            }
        };
        if (key == 'sync_enabled') {
            if (newVal) {
                if (Config.values.sync_type == SyncInfo.types.ePASTEBIN) {
                    SyncClient.schedulePeriodicalCheck();
                }
                scheduleEnable();
            } else {
                SyncClient.enabled = false;
                SyncClient.disablePeriodicalCheck();
            }
        } else if (key == 'sync_type') {
            if (newVal == SyncInfo.types.ePASTEBIN) {
                SyncClient.schedulePeriodicalCheck();
            } else if (newVal == SyncInfo.types.eCHROMESYNC) {
                SyncClient.disablePeriodicalCheck();
            }
            scheduleEnable();
        } else if (key == 'sync_id') {
            if (Config.values.sync_type == SyncInfo.types.ePASTEBIN) {
                scheduleEnable();
            }
        }
    },
    sync: function(force) {
        if (SyncClient.syncing > 0) {
            if (force) {
                var sched = function(success) {
                    if (success) {
                        // schedule maybe a lot of sync runs, but do only one
                        SyncClient.scheduleSync(50, force);
                    }
                };
                // wait for sync end
                SyncClient.addSyncDoneListener(sched);
            }
            return;
        }

        if (!SyncClient.enabled) {
            return;
        }

        SyncClient.syncing++;
        if (V) console.log("sync: start syncing = " + SyncClient.syncing);

        var local = null;
        var remote = null;
        var run = [];
        var change = false;
        var success = true;
        var processedlocals = {};

        var next = function() {
            if (run.length > 0) {
                var fn = run.splice(0, 1);
                window.setTimeout(fn[0], 1);
            }
        };

        var error = function() {
            success = false;
            all_done();
        };

        var get = function() {
            SyncClient.getRemoteScriptList(got);
            local = SyncClient.getLocalScriptList();
        }
        var got = function(l) {
            remote = l;

            if (remote) {
                next();
            } else {
                if (D) console.log("sync: unable to get remotelist!");
                error();
            }
        };
        run.push(get);

        var localByUrl = function(u) {
            if (u) {
                u = u.split('#')[0];
                for (var k=0; k<local.length; k++) {
                    // compare with file _and_ update URL!!
                    if (local[k].furl == u ||
                        local[k].durl == u) {

                        return local[k];
                    }
                }
            }

            return null;
        };

        var remoteByUrl = function(u) {
            if (u) {
                u = u.split('#')[0];
                for (var k=0; k<remote.length; k++) {
                    if (remote[k].url == u) {
                        return remote[k];
                    }
                }
            }

            return null;
        };

        var impo = function() {
            // first run, maybe other instance filled some data, but it is not transfered yet -> nothing to do
            // later, assume Chrome does conflict resolution!? -> import all scripts with !o.removed, remove all scripts with o.remove
            var running = 1;
            var check = function() {
                if (--running == 0) next();
            };

            for (var u=0; u<remote.length; u++) {
                var o = remote[u];
                var locally = false;
                var l = localByUrl(o.url);
                if (l) {
                    locally = true;
                    processedlocals[o.url] = true;
                }

                if (locally && o.options.removed) {
                    change = true;
                    if (D) console.log("sync: remove local script " + (o.name || o.url));
                    storeScript(l.name, null, false);
                }
                if (!locally && !o.options.removed) {
                    running++;
                    change = true;
                    SyncClient.importScript(o, check);
                }
            }
            check();
        };
        run.push(impo);

        var expo = function() {
            // first run, maybe other instance filled some data, but it is not transfered yet -> export all scripts
            // later, Chrome does confict resolution?! -> export new scripts, remove
            var running = 1;
            var check = function() {
                if (--running == 0) next();
            };

            for (var u=0; u<local.length; u++) {
                var remotely = false;
                var o = local[u];
                var r = o.url;
                if (!r || processedlocals[r]) continue;
                var e = remoteByUrl(r);
                if (e) {
                    remotely = true;
                }

                if (!remotely) {
                    running++;
                    change = true;
                    SyncClient.exportScript(o, check);
                }
            }

            check();
        };
        run.push(expo);

        var all_done = function() {
            if (D) console.log("sync: finished");
            if (--SyncClient.syncing == 0) {
                SyncClient.runAllSyncDoneListeners(success);
            }
            if (change) {
                notifyOptionsTab();
            }
        };
        run.push(all_done);

        next();
    },

    importScript: function(o, cb) {
        if (D) console.log("sync: import " + (o.name || o.url));

        var sync = { imported: Config.values.sync_type };
        var props = { ask: false, sync: sync, save: true };
        installFromUrl(o.url, props, cb);
    },

    exportScript: function(o, cb) {
        if (D) console.log("sync: export " + (o.name || o.url));
        SyncInfo.add(o, cb);
    },

    removeScript: function(o, cb) {
        if (D) console.log("sync: remove " + (o.name || o.url));
        SyncInfo.remove(o, cb);
    },

    remoteChangeCb : function(name, script) {
        if (!SyncClient.enabled || Config.values.sync_type != SyncInfo.types.eCHROMESYNC) return;
        if (V) console.log("sync: remoteChangeCb()");
        SyncClient.scheduleSync(500, true);
    },
    scriptAddedCb : function(name, script) {
        if (!SyncClient.enabled) return;
        if (V) console.log("sync: scriptAddedCb()");
        var o = SyncClient.getLocalObjFromScript(script);
        if (o.url) {
            SyncClient.exportScript(o);
        }
    },
    scriptChangedCb : function(name, script) {
        if (!SyncClient.enabled) return;
        /* there are no properties intended to be synced at the moment, so ignore the change callback for the moment
        if (V) console.log("sync: scriptChangedCb()");
        SyncClient.scheduleSync(500, true); */
    },
    scriptRemovedCb : function(name, script) {
        if (!SyncClient.enabled) return;
        if (V) console.log("sync: scriptRemovedCb()");

        var o = SyncClient.getLocalObjFromScript(script);
        if (o.url) {
            SyncClient.removeScript(o);
        }
        // no need to schedule a sync, we deleted the script remotely right now and locally this was done by the caller
    }
};
sycl = SyncClient;

/* ###### UI ####### */

var setIcon = function(tabId, obj) {
    if (obj == undefined) obj = Config;
    var s;

    var blocker = false;
    var running = false;

    if (tabId && ctxRegistry.has(tabId)) {
        blocker = ctxRegistry.n[tabId].blocker;
        running = ctxRegistry.getRunning(tabId);
    }

    if (blocker) {
        obj.images.icon = 'images/icon_grey_blocker.png';
    } else if (running) {
        obj.images.icon = 'images/icon.png';
    } else {
        obj.images.icon = 'images/icon_grey.png';
    }

    s = { path: chrome.extension.getURL( obj.images.icon) };
    if (tabId != null) s.tabId = tabId;

    try {
        chrome.browserAction.setIcon(s);
    } catch (e) {
        console.log("bg: ERROR while setIcon! " + e.message);
    }
};

var addCfgCallbacks = function(obj) {
    Config.addChangeListener('scriptblocker_overwrite', contentSettings.init);
    Config.addChangeListener('sync_enabled', SyncClient.checkSyncAccount);
    Config.addChangeListener('sync_type', SyncClient.checkSyncAccount);
    Config.addChangeListener('sync_id', SyncClient.checkSyncAccount);

    Config.addChangeListener('fire_enabled', function(n, o, e) {
                                 if (e && !TM_fire.status.initialized) {
                                     TM_fire.init();
                                 }
                             });
    Config.addChangeListener('logLevel', function() {
                                 adjustLogLevel(Config.values.logLevel);
                             });
    Config.addChangeListener('i18n', function() {
                                 I18N.setLocale(Config.values.i18n);
                             });
};

/* ###### Config ####### */

var ConfigObject = function(initCallback) {

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

    this.changeListeners = {};
    var _internal = {};

    var defaults = { configMode: 0,
                     safeUrls: true,
                     tryToFixUrl: true,
                     debug: false,
                     logLevel: 0,
                     showFixedSrc: false,
                     firstRun: true,
                     webrequest_use : 'yes',
                     webrequest_modHeaders : 'yes',
                     webrequest_fixCSP : 'yes',
                     scriptblocker_overwrite : 'yes',
                     notification_showTMUpdate: true,
                     notification_silentScriptUpdate: true,
                     scriptTemplate : defltScript,
                     scriptUpdateCheckPeriod: 12 * 60 * 60 * 1000,
                     scriptUpdateHideNotificationAfter: 15 * 1000,
                     scriptUpdateCheckDisabled: false,
                     autoReload: false,
                     appearance_badges: 'running',
                     fire_enabled: false,
                     fire_sort_cache_enabled: true,
                     fire_updateURL: 'http://fire.tampermonkey.net/update.php',
                     fire_updatePeriod: 14 * 24 * 60 * 60 * 1000,
                     editor_enabled: true,
                     editor_keyMap: 'windows',
                     editor_indentUnit: 4,
                     editor_indentWithTabs: false,
                     editor_tabMode : 'smart',
                     editor_enterMode : 'indent',
                     editor_electricChars : true,
                     editor_lineNumbers: true,
                     editor_autoSave: false,
                     editor_easySave: false,
                     i18n: null,
                     sync_enabled: false,
                     sync_type: 0,
                     sync_id: "",
                     require_blacklist : [ '/^https?:\\/\\/sizzlemctwizzle.com\\/.*/' ],
                     forbiddenPages : [ '*.paypal.tld/*', 'https://*deutsche-bank-24.tld/*', 'https://*bankamerica.tld/*',
                                        '*://plusone.google.com/*/fastbutton*',
                                        '*://www.facebook.com/plugins/*',
                                        '*://platform.twitter.com/widgets/*' ]};

    this.addChangeListener = function(name, cb) {
        if (!oobj.changeListeners[name]) {
            oobj.changeListeners[name] = [];
        }

        oobj.changeListeners[name].push(cb);
    };

    this.load = function(cb) {
        var ds = defaultScripts();
        for (var k in ds) {
            var s = ds[k];
            window.setTimeout(function() { addNewUserScript({ tabid: null, url: null, src: s, ask: false, defaultscript:true }); }, 1);
        }
        oobj.defaults = defaults;
        oobj.values = {};
        for (var r in defaults) {
            if (!defaults.hasOwnProperty(r)) continue;
            (function wrap() {
                var k = r;
                var getter = function() {
                    return _internal[k];
                };
                var setter = function(val) {
                    setValue(k, val); // set and check for change listeners
                };
                oobj.values.__defineGetter__(k, getter);
                oobj.values.__defineSetter__(k, setter);
            })();

            _internal[r] = defaults[r];
        }

        var o = TM_storage.getValue("TM_config", oobj.defaults);
        for (var r in o) {
            if (!o.hasOwnProperty(r)) continue;
            oobj.values[r] = o[r];
        }

        cb();
    };

    var setValue = function(name, value) {
        if (oobj.changeListeners[name] &&
            (_internal[name]) != value) {

            for (var i=0; i<oobj.changeListeners[name].length; i++) {
                (function wrap() {
                    var n = name;
                    var o = oobj.values[n];
                    var e = value;
                    if (o != e) {
                        var fn = oobj.changeListeners[n][i];
                        var cb = function() {
                            fn(n, o, e);
                        }
                        window.setTimeout(cb, 1);
                    }
                })();
            }
        }

        _internal[name] = value;
    };

    this.save = function(runCb) {
        if (runCb == undefined) runCb = true;
        var c = oobj.values;
        c.firstRun = false;
        TM_storage.setValue("TM_config", c);
    };

    var afterload = function() {
        if (oobj.values.firstRun) {
            oobj.save(false);
        }

        oobj.images = {};
        oobj.images.icon = 'images/icon.png';

        oobj.initialized = true;

        if (oobj.values.notification_showTMUpdate && upNotification) {
            var args = 'version=' + chrome.extension.getVersion() + '&' +
                       'ext=' + chrome.extension.getID().substr(0, 4);
            var url = 'http://tampermonkey.net/changelog.php?' + args;

            notify.showUpdate(I18N.getMessage('Updated_to__0version0', (upNotification || chrome.extension.getVersion())),
                              null,
                              chrome.extension.getURL("images/icon128.png"),
                              { text: I18N.getMessage('Click_here_to_see_the_recent_changes'), src: url });
        }

        if (initCallback) initCallback();
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
                var parts = rh[k].split(':');
                var h = parts.shift() || "";
                var field = parts.join(':') || "";

                if (V) console.log("Header: " + JSON.stringify(h));
                if (h.trim().toLowerCase() == 'content-type' &&
                    field.search('image') != -1) {
                    image = h[1].trim();
                    break;
                }
            }

            if (req.readyState == 4) {
                if (req.status == 200 || req.status == 0) {
                    res.resText = req.responseText;
                    if (!image) {
                        if (res.url.search('.ico$') != -1 ||
                            res.url.search('.jpg$') != -1) {
                            image = 'image/x-icon';
                        } else if (res.url.search('.gif$') != -1) {
                            image = 'image/gif';
                        } else if (res.url.search('.png$') != -1) {
                            image = 'image/png';
                        } else if (Helper.isLocalImage(res.url)) {
                            image = 'image/x-icon';
                        }
                    }
                    if (req.status == 200 /* not local! */) {
                        addToRequireCache(res.url, req.responseText, req.responseHeaders);
                    }
                    if (!image) {
                        res.resURL = Converter.Base64.encode(req.responseText);
                    } else {
                        res.resURL = 'data:' + image + ';base64,' + Converter.Base64.encode(req.responseText);
                    }
                    cb(script);
                } else {
                    if (D || V) console.log("getRes: Failed to load: '" + res.url + "' " + req.status + " " + req.statusText);
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
                            /* TODO: Why does the response headers now (Chrome 24) contain this overriden mime type?!
                                     This breaks the image detection above, so use the URL to check for images! :/ */
                        };

                        if (V) console.log("getRes: request " + r.url);
                        xmlhttpRequest(details, function(req) { storeResource(req, r); }, null, null, null, true);
                    }
                }
                return true;
            }
        }

        return false;
    };

    this.isBlacklisted = function(url) {
        var black = false;

        var check = function(v) {
            var b = false;

            if (!v.length) return;

            if (v.substr(0,1) == '/') {
                b = matchUrl(url, v);
            } else {
                b = (url.search(v) != -1);
            }
            if (D && b) console.log('bg: require blacklist entry "' + v + '" matched');

            black |= b;
        };

        Helper.forEach(Config.values.require_blacklist, check);

        return black;
    };

    this.getRequires = function(script, cb) {

        var fillRequire = function(req, res) {
            r.loaded = true;
            if (req.readyState == 4 && req.status == 200 || req.status == 0) {
                r.textContent = req.responseText;
                if (req.status != 0) {
                    // don't cache file:// URIs
                    addToRequireCache(r.url, req.responseText);
                }
            }
        };

        for (var k in script.requires) {
            var r = script.requires[k];
            if (!r.loaded && r.url) {

                var t = null;
                if (oobj.isBlacklisted(r.url)) {
                    t  = { content: '// this @require ("' + encodeURIComponent(r.url) + '") is blacklisted!\n' };
                } else {
                    t = getFromRequireCache(r.url);
                }

                if (t) {
                    fillRequire( { readyState: 4, status: 200, responseText: t.content }, r);
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

    this.contentLoad = function(info, main, cb) {

        if (oobj.getNextResource(main, function(script) { oobj.contentLoad(info, script, cb); })) {
            return;
        }

        oobj.info = info;
        if (typeof TM_tabs[info.tabId] == 'undefined') TM_tabs[info.tabId] = { storage: {} };

        var req_cb = function() {
            var scripts = [];
            scripts.push(main);

            console.log(I18N.getMessage("run_script_0url0___0name0", [ info.url , main.name]));
            oobj.injectScript(scripts, cb);
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
            console.log(I18N.getMessage("env_option__debug_scripts"));
            src = "debugger;\n" + src;
        }

        return src;
    };

    this.injectScript = function(scripts, cb) {
        var script;
        if (cb == undefined) cb = function() {};

        for (var i = 0; script = scripts[i]; i++) {
            var requires = [];

            script.requires.forEach(function(req) {
                                        var contents = req.textContent;
                                        contents = compaMo.mkCompat(contents, script.options.compatopts_for_requires ? script : null);
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

            chrome.tabs.sendMessage(oobj.info.tabId,
                                    { method: "executeScript",
                                      header: script.header,
                                      code: oobj.createEnv( script.textContent, script),
                                      requires: requiredSrc,
                                      version: chrome.extension.getVersion(),
                                      storage: storage,
                                      script: dblscript,
                                      id: oobj.info.scriptId },
                                    cb);
        }
    };
};

/* ###### UserScript Runtime ####### */

var removeUserScript = function(name) {
    storeScript(name, null);
    storeScriptStorage(name, null);
};

var ts_ify = function(u) {
    if (u) u += (u.search('\\?') == -1 ? '?' : '&') + 'ts=' + (new Date()).getTime();
    return u;
};

var determineSourceURL = function(o, add_ts) {
    if (!o) return null;

    var f = null;

    if (o.fileURL && o.fileURL.search('^file://' == -1)) f = o.fileURL;
    if (o.downloadURL && o.downloadURL.search('^file://' == -1)) f = o.downloadURL;
    if (f && add_ts) f = ts_ify(f);

    return f;
};

var determineMetaURL = function(o, add_ts) {
    if (!o) return null;

    var f = null, u = null;

    if (o.fileURL && o.fileURL.search('^file://' == -1)) f = o.fileURL;
    if (o.downloadURL && o.downloadURL.search('^file://' == -1)) f = o.downloadURL;
    if (o.updateURL && o.updateURL.search('^file://' == -1)) u = o.updateURL;

    if (u) return add_ts ? ts_ify(u) : u;

    if (f) {
        var murl = null;

        murl = f.replace('\.user\.js', '.meta.js');
        if (murl == f) murl = f.replace('\.tamper\.js', '.meta.js');
        if (murl == f) murl = null;

        return add_ts ? ts_ify(murl) : murl;
    }

    return null;
};

var getMetaData = function(o, callback) {
    var murl = determineMetaURL(o, true);

    if (murl) {
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

    o.meta = null;
    callback(o);
};

//merge original and user-defined *cludes and matches
var mergeCludes = function(script){
    var n, cludes = script.options.override;

    //clone the original cludes as a starting point
    script.includes = cludes.merge_includes && cludes.orig_includes ? cludes.orig_includes.slice() : [];
    script.excludes = cludes.merge_excludes && cludes.orig_excludes ? cludes.orig_excludes.slice() : [];
    script.matches =  cludes.merge_matches  && cludes.orig_matches  ? cludes.orig_matches.slice() : [];

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

var notifyOptionsTab = function() {
    reorderScripts();
    var done = function(allitems) {
        chrome.extension.sendMessage({ method: "updateOptions",
                                             items: allitems },
                                     function(response) {});

    };
    createOptionItems(done);
};

var addNewUserScript = function(o) {
    // { tabid: tabid, force_url: durl, url: url, src: src, ask: ask, defaultscript:defaultscript, noreinstall : noreinstall, save : save, sync: sync, cb : cb }
    var reset = false;
    var allowSilent = false;
    var hashChanged = false;

    if (o.name == undefined) o.name = null;
    if (o.clean == undefined) o.clean = false;
    if (o.defaultscript == undefined) o.defaultscript = false;
    if (o.ask == undefined) o.ask = true;
    if (o.url == undefined || o.url == null) o.url = "";
    if (o.save == undefined) o.save = false;
    if (o.hash == undefined) o.hash = "";
    if (o.force_url == "") o.force_url = null;

    var script = scriptParser.createScriptFromSrc(o.src);

    if (o.name && o.name != script.name) {
        console.log("bg: addNewUserScript() Names do not match!");
        return false;
    }

    if (!script.name || script.name == '' || (script.version == undefined)) {
        chrome.tabs.sendMessage(o.tabid,
                                { method: "showMsg", msg: I18N.getMessage('Invalid_UserScript__Sry_')},
                                function(response) {});
        return false;
    }

    var oldscript = TM_storage.getValue(script.name, null);
    var msg = '';

    if (!o.clean && oldscript && oldscript.system && !o.defaultscript) return false;

    if (script.options.compat_uW_gmonkey) {
        chrome.tabs.sendMessage(o.tabid,
                                { method: "showMsg", msg: I18N.getMessage('This_script_uses_uW_gm_api_')},
                                function(response) {});

        return false;
    }

    if (oldscript) {
        hashChanged = (o.hash && oldscript.hash != o.hash);
    }

    script.hash = o.hash ? o.hash : (oldscript ? oldscript.hash : null);
    script.lastUpdated = (new Date()).getTime();
    script.system = o.defaultscript;
    script.fileURL = o.url;

    if (!o.clean && o.force_url) {
        /* Note: Replace downloadURL with the users preference and clear the updateURL.
           When a new script version is detected it will be installed and the parameters
           (@downloadURL, @updateURL) of the script will be used again. */
        script.updateURL = null;
        script.downloadURL = o.force_url;
    }

    script.position = oldscript ? oldscript.position : determineLastScriptPosition() + 1;

    if (script.name.search('\n') != -1) {
        chrome.tabs.sendMessage(o.tabid,
                                { method: "showMsg", msg: I18N.getMessage('Invalid_UserScript_name__Sry_')},
                                function(response) {});
        return false;
    } else if (!o.clean && oldscript && script.version == oldscript.version && !hashChanged) {
        if (o.defaultscript || o.noreinstall) {
            // stop here... we just want to update (system) scripts...
            return null;
        }

        if (o.save) {
            msg += I18N.getMessage('You_are_about_to_modify_a_UserScript_') + '     \n';
        } else {
            msg += I18N.getMessage('You_are_about_to_reinstall_a_UserScript_') + '     \n';
            reset = true;
            msg += '\n' + I18N.getMessage('All_script_settings_will_be_reset_') + '!!\n';
        }

        msg += '\n' + I18N.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\n' + I18N.getMessage('Installed_Version_') + '\n';
        msg += '    ' + 'v' + script.version +  '\n';
    } else if (!o.clean && oldscript && versionCmp(script.version, oldscript.version) == eOLDER) {
        msg += I18N.getMessage('You_are_about_to_downgrade_a_UserScript') + '     \n';
        msg += '\n' + I18N.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\n' + I18N.getMessage('Installed_Version_') + '\n';
        msg += '    ' + 'v' + oldscript.version +  '\n';
    } else if (!o.clean && oldscript) {
        msg += I18N.getMessage('You_are_about_to_update_a_UserScript_') + '     \n';
        msg += '\n' + I18N.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
        msg += '\n' + I18N.getMessage('Installed_Version_') + '\n';
        msg += '    ' + 'v' + oldscript.version +  '\n';
        allowSilent = true;
    }  else {
        msg += I18N.getMessage('You_are_about_to_install_a_UserScript_') + '     \n';
        msg += '\n' + I18N.getMessage('Name_') + '\n';
        msg += '    ' + script.name + ((script.version != '') ? ' v' + script.version : '') +  '\n';
    }

    // user defined *cludes will be persistent except for a user triggered script factory reset
    if (!o.clean && oldscript){
        script.options.override = oldscript.options.override;
        script.options.comment = oldscript.options.comment;
    }
    // back up *cludes to be able to restore them if override *clude is disabled
    script.options.override.orig_includes = script.includes;
    script.options.override.orig_excludes = script.excludes;
    script.options.override.orig_matches = script.matches;
    script = mergeCludes(script);

    if (oldscript) {
        // sync options and info
        if (oldscript.sync) script.sync = oldscript.sync;
    }

    if (!reset && !o.clean && oldscript) {
        // don't change some settings in case it's a system script or an update
        script.enabled = oldscript.enabled;
        // TODO: overwrite ?! script.options.user_agent = oldscript.options.user_agent || '';

        // compatibility
        if (!script.options.awareOfChrome) {
            script.options.compat_forvarin = oldscript.options.compat_forvarin;
            if (script.options.run_at == '') {
                script.options.run_at = oldscript.options.run_at;
            }
        }

        // update URL change notification
        var ouu = determineMetaURL(oldscript);
        var nuu = determineMetaURL(script);

        if (ouu != nuu) {
            msg += '\n' + I18N.getMessage('The_update_url_has_changed_from_0oldurl0_to__0newurl0', [ouu, nuu]);
            allowSilent = false;
        }
    }

    if (!o.clean && o.sync) {
        script.sync = o.sync;
    }

    if (!script.includes.length && !script.matches.length) {
        msg += '\n' + I18N.getMessage('Note_') + '\n';
        msg += '    ' + I18N.getMessage('This_script_does_not_provide_any__include_information_') + '\n';
        msg += '    ' + I18N.getMessage('Tampermonkey_assumes_0urlAllHttp0_in_order_to_continue_', Helper.urlAllHttp) + '    \n';
        script.includes.push(Helper.urlAllHttp);
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
    incls += '\n' + I18N.getMessage('Include_s__');
    if (script.options.override.includes || script.options.override.matches) {
        incls += ' (' + I18N.getMessage('overwritten_by_user') + ')';
    }
    incls += '\n';
    var k=0, q=0;

    for (k=0;k<script.includes.length;k++,q++) {
        incls += '    ' + script.includes[k];
        incls += (g < 15) ? '\n' : (c < m) ? ';' : '\n';
        if (c++ >= m) c = 0;
        if (q > 13) {
            incls += "\n" + I18N.getMessage('Attention_Can_not_display_all_includes_') + "\n";
            break;
        }
    }
    for (k=0;k<script.matches.length;k++,q++) {
        incls += '    ' + script.matches[k];
        incls += (g < 15) ? '\n' : (c < m) ? ';' : '\n';
        if (c++ >= m) c = 0;
        if (q > 13) {
            incls += "\n" + I18N.getMessage('Attention_Can_not_display_all_includes_') + "\n";
            break;
        }
    }

    var excls = '';
    c = 0;
    if (script.excludes.length) {
        excls += '\n' + I18N.getMessage('Exclude_s__');
        if (script.options.override.excludes) {
            excls += ' (' + I18N.getMessage('overwritten_by_user') + ')';
        }
        excls += '\n';

        for (var k=0;k<script.excludes.length;k++) {
            excls += '    ' + script.excludes[k];
            excls += (g < 15) ? '\n' : (c < m) ? ';' : '\n';
            if (c++ >= m) c = 0;
            if (k > 13) {
                excls += "\n" + I18N.getMessage('Attention_Can_not_display_all_excludes_') + "\n";
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
        msg += "\n" + I18N.getMessage('Note__A_recheck_of_the_GreaseMonkey_FF_compatibility_options_may_be_required_in_order_to_run_this_script_') +"\n\n";
    }

    if (o.clean) {
        msg += '\n' + I18N.getMessage('Do_you_really_want_to_factory_reset_this_script_') + '    ';
    } else {
        msg += "\n" + I18N.getMessage('Do_you_want_to_continue_');
    }

    var doit = function() {
        storeScript(script.name, script);
        if (!oldscript || o.clean) storeScriptStorage(script.name, { ts: (new Date()).getTime() });
        if (!o.cb) {
            notifyOptionsTab();
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
        chrome.tabs.sendMessage(o.tabid,
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

var installFromUrl = function(url, props, cb) {
    var details = {
        method: 'GET',
        retries: _retries,
        url: url,
    };
    var inst = function(req) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                var callback = function(installed) {
                    if (cb) cb(true, installed);
                };
                var o = { url: url, src: req.responseText, ask: true, cb : callback };
                if (props) {
                    for (var k in props) {
                        if (!props.hasOwnProperty(k)) continue;
                        o[k] = props[k];
                    }
                }
                if (!addNewUserScript(o)) {
                    if (cb) cb(false, false);
                }
            } else {
                if (V) console.log("scriptClick: " + url + " req.status = " + req.status);
                if (cb) cb(false, false);
            }
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
        if (!tab || !tab.id || !ctxRegistry.has(tab.id)) {
            var i = 0;
            var ts = 0;

            var it = function(g, t) {
                if (ts == 0 || t.ts < ts) {
                    if (!isIn(g)) {
                        ts = t.ts;
                        i = g;
                    }
                }
            };
            ctxRegistry.iterateTabs(it);

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
            chrome.tabs.create({ url:  chrome.extension.getURL("ask.html") + "?i18n=" + Config.values.i18n }, created);
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
    notify : function(title, text, image, delay, perm, link, callback) {
        var notifyId = callback ? notify.getNotifyId(callback) : null;
        var args = 'notify=1&title=' + encodeURIComponent(title);
        if (text) {
            args += '&text=' + encodeURIComponent(text);
        }
        if (image) args += "&image=" + encodeURIComponent(image);
        if (delay) {
            delay = Number(delay);
            args += "&delay=" + encodeURIComponent(delay);
        }

        if (perm || notifyId) {
            if (perm) {
                args += "&requestPerm=" + perm + ";" + encodeURIComponent(notifyId);
            } else {
                args += "&notifyId=" + encodeURIComponent(notifyId);
            }
            var to = null;
            var remove = null;
            var listen = function(evt) {
                if (NV) console.log("bg: received click -> notifyId: " + notifyId);
                remove();
                callback(!perm || evt.attrName == "true");
            };
            remove = function() {
                if (NV) console.log("bg: remove listener -> notifyId: " + notifyId);
                window.removeEventListener("notify_" + notifyId, listen, false);
                if (to) window.clearTimeout(to);
            };
            window.addEventListener("notify_" + notifyId, listen, false);
            to = window.setTimeout(function() { to = null; remove(); callback(false); }, delay ? delay + 5000 : 10 * 60 * 1000);
        }
        if (link) {
            args += "&link=" + encodeURIComponent(link.text) + ";" + encodeURIComponent(link.src);
        }
        var notification = webkitNotifications.createHTMLNotification('notification.html?' + args);
        notification.show();
    },
    getPermission : function(title, text, image, delay, perm, callback) {
        notify.notify(title, text, image, delay, perm, null, callback);
    },
    showUpdate : function(title, text, image, link) {
        notify.notify(title, text, image, 300000, null, link, null);
    },
    show : function(title, text, image, delay, callback) {
        notify.notify(title, text, image, delay, null, null, callback);
    }
};

var ScriptUpdater = {
    check : function(force, showResult, id, callback) {
        if (!force && Config.values.scriptUpdateCheckPeriod == 0) return;

        var runCheck = function(initial) {
            if (showResult) {
                var t = I18N.getMessage('Script_Update');
                var msg = I18N.getMessage('Check_for_userscripts_updates') + '...';
                notify.show(t, msg, chrome.extension.getURL("images/icon128.png"), 5000);
            }

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
                                               hash: obj.newhash !== undefined ? obj.newhash : null };
                                    addNewUserScript(ss);
                                };
                                getValidTabId(null, gotId);
                            }
                        };

                        var msg = I18N.getMessage('There_is_an_update_for_0name0_avaiable_', obj.name) + '\n' + I18N.getMessage('Click_here_to_install_it_');
                        var t = I18N.getMessage('Just_another_service_provided_by_your_friendly_script_updater_');
                        if (Config.values.notification_silentScriptUpdate) {
                            install(true);
                        } else {
                            notify.show(t, msg, chrome.extension.getURL("images/icon128.png"), Config.values.scriptUpdateHideNotificationAfter, install);
                        }
                    } catch (e) {
                        console.log("bg: notification error " + e.message);
                    }
                }
                if (callback) callback(updatable);
            };
            ScriptUpdater.updateUserscripts(0, showResult, id, cb);
        };

        var prepare = function() {
            var last = getUpdateCheckCfg();
            if (force || ((new Date()).getTime() - last.scripts) > Config.values.scriptUpdateCheckPeriod) {
                var exec = function() {
                    runCheck();
                    last.scripts = (new Date()).getTime();
                    setUpdateCheckCfg(last);
                };
                if (SyncClient.enabled) {
                    SyncClient.addSyncDoneListener(exec);
                    SyncClient.scheduleSync(50, false);
                } else {
                    exec();
                }
            } else if (callback) {
                console.log("bg: WARN ScriptUpdater.check -> no force but callback");
                window.setTimeout(callback, 1);
            }
        };

        prepare();

        window.setTimeout(ScriptUpdater.check, 5 * 60 * 1000);
    },

    srcCmp : function(src) {

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
    },

    updateUserscripts : function(tabid, showResult, scriptid, callback) {
        var names = getAllScriptNames();
        var running = 1;
        var found = 0;

        var checkNoUpdateNotification = function() {
            if (running == 0 && found == 0) {
                if (showResult) {
                    if (D || V || UV) console.log("No update found");
                    notify.show('Narf!',
                                I18N.getMessage('No_update_found__sry_'),
                                chrome.extension.getURL("images/icon128.png"));
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
                url: determineSourceURL(r.script, true),
            };

            running++;
            (function() {
                var obj = { tabid: tabid, r: r};
                var durl = determineSourceURL(obj.r.script)
                    var cb = function(req) {
                    running--;
                    if (req.readyState == 4 && req.status == 200) {
                        if (V) console.log(durl);

                        var updateHash = function() {
                            // call only if local and remove script version do match
                            if (obj.r.meta) {
                                if (V || UV) console.log("bg: update hash of script " + r.script.name + " to " + obj.r.meta[cUSOHASH]);
                                obj.r.script.hash = obj.r.meta[cUSOHASH];
                                storeScript(obj.r.script.name, obj.r.script, false);
                            }
                        };

                        var ret = ScriptUpdater.srcCmp(req.responseText);
                        if (ret == eNEWER || r.hash_different) {
                            found++;
                            if (callback) callback(true, { name: obj.r.script.name,
                                                           url: durl,
                                                           code: req.responseText,
                                                           newhash: obj.r.meta[cUSOHASH] });
                            return;
                        } else if (ret == eEQUAL) {
                            if (V || UV) console.log("bg: found same version @ " + durl);
                            updateHash();
                        }
                    } else {
                        console.log(I18N.getMessage("UpdateCheck_of_0name0_Url_0url0_failed_", [ obj.r.script.name, durl ]));
                    }
                    checkNoUpdateNotification();
                };
                xmlhttpRequest(details, cb);
            })();
        };

        var metaCheck = function(r) {
            running++;

            var getmeta = function(o) {
                var meta_found = !!o.meta;
                var hash_different = meta_found && !!o.meta[cUSOHASH] && o.meta[cUSOHASH] != r.script.hash;
                var version_found = meta_found && !!o.meta.version;
                var version_newer = version_found && (!r.script.version || versionCmp(o.meta.version, r.script.version) == eNEWER);

                // check script source in case:
                if (!meta_found || // no meta data was found
                    hash_different || // hash has changed
                    !version_found || // meta data does not contain version info
                    version_newer) { // we noticed a newer version

                    if (V || UV) console.log("bg: hash of script " + r.script.name + " has changed or does not exist! running version check!");
                    r.meta = o.meta;
                    r.metasrc = o.metasrc;
                    r.hash_different = hash_different;
                    realCheck(r);
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
                console.log(I18N.getMessage("fatal_error") + "(" + n + ")!!!");
                continue;
            }

            var c_scriptid = scriptid && r.script.id != scriptid;
            var c_disabled = !Config.values.scriptUpdateCheckDisabled && !r.script.enabled && !scriptid;

            if (c_scriptid || c_disabled || !(determineMetaURL(r.script) || determineSourceURL(r.script))) continue;

            one = true;
            metaCheck(r);
        }

        if (!one && scriptid && callback) {
            window.setTimeout(callback, 1);
        }

        running--;
        // remove initialy assigned 1
    }
};
trup = ScriptUpdater;

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
        var re = Helper.getRegExpFromUrl(reg, Config, false, match);
        if (match) {
            r = new RegExp(re);
        } else {
            r = new RegExp(re, 'i');
        }
    }

    return href.replace(r, '') == '';
};

var validUrl = function(href, cond, n) {
    var t, run = false;
    if (cond.inc || cond.match) {
        for (t in cond.inc) {
            if (typeof cond.inc[t] !== 'string') {
                console.log("bg: WARN: include[" + t + "] '" + cond.inc[t] + "' " + (n ? "@" + n + " " : "") + "can't be compared to '" + href + "'");
            } else if (matchUrl(href, cond.inc[t])) {
                if (D) console.log("bg: @include '" + cond.inc[t] + "' matched" + (n ? " (" + n + ")" : ""));
                run = true;
                break;
            }
        }
        if (cond.match) {
            for (t in cond.match) {
                if (typeof cond.match[t] !== 'string') {
                    console.log("bg: WARN: match[" + t + "] '" + cond.match[t] + "' " + (n ? "@" + n + " " : "") + "can't be compared to '" + href + "'");
                } else if (matchUrl(href, cond.match[t], true)) {
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
        storeScript(s.name, s, false);
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

        if (V) console.log("bg: determineScriptsToRun: found script " + n);
        ret.push(r.script);
    }

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

var storeScript = function(name, script, triggerSync) {
    if (triggerSync === undefined) triggerSync = true;

    if (script) {
        var added = !TM_storage.getValue(name);
        var changed;

        TM_storage.setValue(name + condAppendix, { inc: script.includes, match: script.matches, exc: script.excludes });
        TM_storage.setValue(name + scriptAppendix, script.textContent);
        var s = script;
        s.textContent = null;
        TM_storage.setValue(name, s);

        if (triggerSync) {
            if (added) {
                SyncClient.scriptAddedCb(name, script);
            } else {
                SyncClient.scriptChangedCb(name, script);
            }
        }
    } else {
        var r = loadScriptByName(name);

        TM_storage.deleteValue(name + condAppendix);
        TM_storage.deleteValue(name + scriptAppendix);
        TM_storage.deleteValue(name);

        if (triggerSync && r.script && r.cond) {
            SyncClient.scriptRemovedCb(name, r.script);
        }
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

var removeStorageListeners = function(name, id, send) {
    if (send === undefined) send = true;
    var old = TM_storageListener;

    TM_storageListener = [];
    for (var k in old) {
        var c = old[k];
        try {
            if (c.name == name && c.id == id) {
                if (V || SV) console.log('send empty response ' + name + " " + id);
                if (send) c.response({});
            } else {
                TM_storageListener.push(c);
            }
        } catch (e) {
            if (D) console.log("Storage listener clear for script " + name + " failed! Page reload?!");
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
        var disconnectHandler = null;
        var sender = port.sender;
        var sendResponse = function(o) {
            try {
                port.postMessage(o);
            } catch (e) {
                console.log('bg: Error sending port (' + port.name + ') message: ' + JSON.stringify(o));
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
                disconnectHandler = function() {
                    // there is no need to try to send some data when we're already disconnected
                    removeStorageListeners(request.name, request.id, false);
                };
            } else {
                console.log(I18N.getMessage("Unable_to_load_storage_due_to_empty_tabID_"));
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
                console.log(I18N.getMessage("Unable_to_save_storage_due_to_empty_tabID_"));
            }
            sendResponse({});
        }
        if (disconnectHandler) port.onDisconnect.addListener(disconnectHandler);
    };

    port.onMessage.addListener(connectMsgHandler);
};

var requestHandling = {
    "ping" : {
        allow : { "insecure" : true },
        exec : function(request, sender, sendResponse) {
            sendResponse({ pong: true, instanceID: TM_instanceID });
        }
    },
    "openInTab" : {
        allow : { "script" : true, "extpage": true },
        exec : function(request, sender, sendResponse) {
            var done = function(tab) {
                closeableTabs[tab.id] = true;
                sendResponse({ tabId: tab.id });
            }
            var s = [ 'active' ];
            var o = { url: request.url };
            if (request.options) {
                for (var n=0; n<s.length; n++) {
                    if (request.options[s[n]] !== undefined) {
                        o[s[n]] = request.options[s[n]];
                    }
                }
                if (request.options.insert) {
                    o.index = sender.tab.index + 1;
                }
            }
            chrome.tabs.create(o, done);
        }
    },
    "closeTab" : {
        allow : { "script" : true, "extpage": true },
        exec : function(request, sender, sendResponse) {
            // check if this tab was created by openInTab request!
            if (request.tabId && closeableTabs[request.tabId]) {
                chrome.tabs.remove(request.tabId);
            }
            sendResponse({});
        }
    },
    "getTab" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            if (typeof sender.tab != 'undefined') {
                if (typeof TM_tabs[sender.tab.id] == 'undefined') TM_tabs[sender.tab.id] = { storage: {} };
                var tab = TM_tabs[sender.tab.id];
                sendResponse({data: tab});
            } else {
                console.log(I18N.getMessage("Unable_to_deliver_tab_due_to_empty_tabID_"));
                sendResponse({data: null});
            }
        }
    },
    "getTabs" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            sendResponse({data: TM_tabs});
        }
    },
    "saveTab" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            if (typeof sender.tab != 'undefined') {
                var tab = {};
                for (var k in request.tab) {
                    tab[k] = request.tab[k];
                };
                TM_tabs[sender.tab.id] = tab;
            } else {
                console.log(I18N.getMessage("Unable_to_save_tab_due_to_empty_tabID_"));
            }
            sendResponse({});
        }
    },
    "copyToClipboard" : {
        allow : { "script" : true, "extpage": true },
        exec : function(request, sender, sendResponse) {
            if (typeof sender.tab != 'undefined') {
                clipboard.copy(request.data);
            } else {
                console.log("bg: unable to process request!");
            }
            sendResponse({});
        }
    },
    "setOption" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            var optionstab = (sender.extpage == "options");

            Config.values[request.name] = request.value;
            Config.save();

            var done = function(items) {
                if (optionstab) {
                    sendResponse({items: items});
                } else {
                    notifyOptionsTab();
                    sendResponse({});
                }
            };

            createOptionItems(done);
        }
    },
    "buttonPress" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            var optionstab = (sender.extpage == "options");

            var done = function() {
                sendResponse({});
            };

            if (request.name == 'reset_simple') {
                Reset.reset(done);
            } else if (request.name == 'reset_factory') {
                Reset.factoryReset(done)
            } else if (request.name == 'create_tesla_data') {
                var cb = function(ret) {
                    clipboard.copy({ content: Converter.UTF8.encode(ret.join('<br>')), type: 'html'});
                    done();
                };
                SyncClient.createTeslaData(cb);
            } else if (request.name == 'reset_chrome_sync') {
                SyncClient.reset(done)
            } else {
                console.log("bg: Warning: unnknown button " + name);
                sendResponse({});
            }

        }
    },
    "modifyScriptOptions" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            var optionstab = (sender.extpage == "options");
            var reload = (request.reload == undefined || request.reload == true);

            var nextStep = function() {
                if (request.reorder) {
                    reorderScripts();
                }

                if (V) console.log("modifyScriptOptions " + optionstab);
                if (reload) {
                    if (optionstab) { // options page
                        var done = function(allitems) {
                            sendResponse({ items: allitems, i18n: Config.values.i18n });
                        };
                        createOptionItems(done);
                    } else { // action page
                        // update options page, in case a script was en/disabled
                        if (request.name) window.setTimeout(notifyOptionsTab, 100);

                        var resp = function(tab) {
                            // TODO: use allURLs[tid].scripts instead of getting them again?
                            var items = createActionMenuItems(tab);
                            sendResponse({ items: items, i18n: Config.values.i18n });
                            if (request.name && Config.values.autoReload) {
                                chrome.tabs.sendMessage(tab.id,
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
                    var do_merge = false;
                    var dns = new scriptParser.Script();

                    for (var k in dns.options) {
                        if (!dns.options.hasOwnProperty(k)) continue;
                        if (typeof request[k] !== 'undefined') r.script.options[k] = request[k];
                    }
                    for (var k in dns.options.override) {
                        if (!dns.options.override.hasOwnProperty(k) ||
                            k.search("merge_") == -1) continue;

                        if (typeof request[k] !== 'undefined') {
                            r.script.options.override[k] = request[k];
                            do_merge = true;
                        }
                    }

                    if (typeof request.enabled !== 'undefined') r.script.enabled = request.enabled;
                    if (typeof request.includes !== 'undefined') {
                        //merge original and user *cludes
                        r.script.options.override.use_includes = request.includes;
                        r.script.options.override.use_excludes = request.excludes;
                        r.script.options.override.use_matches = request.matches;
                        do_merge = true;
                    }

                    if (do_merge) {
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
                                return true;
                            }
                        } else if (request.actionid == 'enabled') {
                            extensions.setEnabled(sc, request.value, nextStep);
                            return true;
                        }
                        nextStep();
                    }
                }
                extensions.getUserscriptById(request.nid, done);
                return true;
            }

            nextStep();

        }
    },
    "modifyNativeScript" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            return requestHandling['modifyScriptOptions'].exec(request, sender, sendResponse);
        }
    },
    "saveScript" : {
        allow : { "extpage": true },
        exec : function(request, sender, sendResponse) {
            // TODO: check renaming and remove old one
            var reload = (request.reload == undefined || request.reload == true);

            var cb = function(installed) {
                if (reload) {
                    var done = function(allitems) {
                        sendResponse({items: allitems, installed: installed});
                    };
                    createOptionItems(done);
                } else {
                    sendResponse({});
                }
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
                    console.log(I18N.getMessage("fatal_error") + " (" + request.name + ")" +"!!!");
                    callback(false);
                } else {
                    if (!addNewUserScript({ name: request.name, tabid: sender.tab.id, force_url: null, url: request.file_url, src: r.script.textContent, clean: true, ask: true, save: true, cb : callback })) {
                        if (callback) callback(false);
                    }
                }
            } else if (request.code) {
                var callback = function(installed) { sendResponse({ installed: installed}); };
                if  (request.reload == undefined || request.reload == true) {
                    callback = function (installed) { reorderScripts();
                                                      cb(installed); };
                }
                request.force &= (sender.extpage == "options"); // always ask in case it is not send from options tab
                var options = { tabid: sender.tab.id,
                                force_url: request.force_url,
                                url: request.file_url,
                                src: request.code,
                                ask: !Config.values.editor_easySave && !request.force,
                                save: true,
                                cb : callback };

                if (!addNewUserScript(options)) {
                    if (callback) callback(false);
                }
            } else {
                removeUserScript(request.name);
                reorderScripts();
                cb();
            }
        }
    },
    "scriptClick" : {
        allow : { "insecure" : true },
        exec : function(request, sender, sendResponse) {
            if (typeof sender.tab != 'undefined') {
                var cb = function(found, installed) {
                    sendResponse({ data: null, found: found, installed: installed });
                    if (found) {
                        // update options page after script installation
                        if (installed) {
                            notifyOptionsTab();
                        }
                    } else {
                        chrome.tabs.sendMessage(sender.tab.id,
                                                { method: "showMsg", msg: I18N.getMessage('Unable_to_get_UserScript__Sry_'), id: request.id},
                                                function(response) {});
                    }
                };
                installFromUrl(request.url, { tabid: sender.tab.id }, cb);
            } else {
                console.log(I18N.getMessage("Unable_to_install_script_due_to_empty_tabID_"));
            }
        }
    },
    "registerMenuCmd" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            if (typeof sender.tab != 'undefined') {
                if (V || MV) console.log("MC add " + request.id);
                TM_menuCmd.add({ tabId: sender.tab.id, url: sender.tab.url, name: request.name, id: request.menuId, response: sendResponse });
            } else {
                console.log("Unable to register menu cmd due to empty tabID!");
                sendResponse({ run: false });
            }
        }
    },
    "unRegisterMenuCmd" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            // cmd is unregistered just by getting
            if (V || MV) console.log("MC unreg " + request.id);
            TM_menuCmd.clearById(request.id);
            sendResponse({});
        }
    },
    "execMenuCmd" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            // cmd is unregistered just by getting
            var c = TM_menuCmd.getById(request.id);
            if (c) {
                if (V || MV) console.log("MC exec " + c.id);
                c.response({ run: true, menuId: c.id });
            } else {
                console.log("bg: Error: unable to find MC id " + c.id);
            }
            sendResponse({});
        }
    },
    "runScriptUpdates" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            if (request.scriptid) {
                var done = function(up) {
                    sendResponse({ scriptid: request.scriptid, updatable: up});
                }
                ScriptUpdater.check(true, false, request.scriptid, done);
            } else {
                ScriptUpdater.check(true, true);
                sendResponse({});
            }
        }
    },
    "getWebRequestInfo" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            if (typeof sender.tab != 'undefined') {
                var r = { webRequest: _webRequest };
                sendResponse(r);
            } else {
                console.log(I18N.getMessage("Unable_to_run_scripts_due_to_empty_tabID_"));
                sendResponse({});
            }
        }
    },
    "unLoad" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            if (!request.topframe && // unload of topframe will be handled by next load event
                (Config.values.appearance_badges == 'running' ||
                 Config.values.appearance_badges == 'disabled')) {

                var frameId = 0;
                var contextId = request.id;
                if (V || UV) console.log("unload check " + contextId + " url: " + request.url);

                if (contextId &&
                    ctxRegistry.has(sender.tab.id) &&
                    ctxRegistry.n[sender.tab.id].stats.executed[contextId]) {

                    ctxRegistry.n[sender.tab.id].stats.running -= ctxRegistry.n[sender.tab.id].stats.executed[contextId].running;
                    ctxRegistry.n[sender.tab.id].stats.disabled -= ctxRegistry.n[sender.tab.id].stats.executed[contextId].disabled;

                    // shouldn't happen...
                    if (ctxRegistry.n[sender.tab.id].stats.running < 0) ctxRegistry.n[sender.tab.id].stats.running = 0;
                    if (ctxRegistry.n[sender.tab.id].stats.disabled < 0) ctxRegistry.n[sender.tab.id].stats.disabled = 0;

                    var url = request.url + request.params;
                    ctxRegistry.removeUrl(sender.tab.id, frameId, url);

                    setBadge(sender.tab.id);
                }
            }
            sendResponse({});
        }
    },
    "prepare" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            if (typeof sender.tab != 'undefined' && sender.tab.index >= 0) { // index of -1 is used by google search for omnibox
                var scheme = (!sender.tab || !sender.tab.url || sender.tab.url.length < 4) ? null :  sender.tab.url.substr(0,4);

                if (scheme == "file" ||
                    !ctxRegistry.has(sender.tab.id) /* i.e. tamperfire page */) {

                    Tab.reset(sender.tab.id, false);

                    if (request.topframe &&
                        _webRequest.headers &&
                        _webRequest.verified) {

                        if (!scheme || (scheme != "http" && scheme != "file")) {
                            // all http related traffic should be Tab.prepare'd by webRequest.headerFix !
                            console.log("bg: WARN: this should _NEVER_ happen!!!!!");
                        } else {
                            var nfo = { tabId: sender.tab.id,
                                        frameId: request.topframe ? 0 : 1 /* TODO: get frameId of sender!*/ ,
                                        scriptId: request.id,
                                        url: sender.tab.url };

                            ctxRegistry.setCache(nfo.tabId, nfo.frameId, nfo.url, Tab.prepare(nfo));
                        }
                    }
                }

                var length_cb = function(enabledScriptsCount, disabledScriptsCount ) {
                    var r = { enabledScriptsCount: enabledScriptsCount,
                              raw: {},
                              webRequest: _webRequest,
                              logLevel: Config.values.logLevel };

                    if (enabledScriptsCount) {
                        if (request.raw) {
                            for (var o=0; o<request.raw.length; o++) {
                                r.raw[request.raw[o]] = Registry.getRaw(request.raw[o]);
                            }
                        }
                        sendResponse(r);
                    } else {
                        sendResponse( { logLevel: Config.values.logLevel } );
                    }
                    ctxRegistry.n[sender.tab.id].stats.running += enabledScriptsCount;
                    ctxRegistry.n[sender.tab.id].stats.disabled += disabledScriptsCount;
                    ctxRegistry.n[sender.tab.id].stats.executed[request.id] = { disabled: disabledScriptsCount, running: enabledScriptsCount };

                    setIcon(sender.tab.id);
                    if (Config.values.appearance_badges != 'tamperfire') {
                        // dont determine tamperfire entries too often!
                        setBadge(sender.tab.id);
                    }
                };
                var allrun_cb = function() {
                    setBadge(sender.tab.id);
                };
                if (Config.values.forbiddenPages.length == 0 || validUrl(request.url, { exc: Config.values.forbiddenPages })) {
                    // TODO: get frameId of sender!
                    sender.tab.frameId = request.topframe ? 0 : 1;
                    tabUpdateListener(sender.tab.id, {status: "complete"}, sender.tab, request, length_cb, allrun_cb);
                    // a url may be added! reset fire count
                    ctxRegistry.setFireCnt(sender.tab.id, null);
                } else {
                    console.log("Forbidden page: '" + request.url + "' -> Do nothing!");
                    sendResponse({});
                }
            } else {
                sendResponse({});
            }
        }
    },
    "scriptBlockerDetected" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            var done = function(has, asked) {
                var a = (has && asked) ? I18N.getMessage("Please_reload_this_page_in_order_to_run_your_userscripts_") : null;
                sendResponse({ alert: a });
            };

            contentSettings.requestPermissionEx(done);
            if (ctxRegistry.has(sender.tab.id)) {
                ctxRegistry.n[sender.tab.id].blocker = true;;
                setIcon(sender.tab.id);
            }
        }
    },
    "startFireUpdate" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            var done = function(suc) {
                sendResponse({ suc: suc });
            };
            TM_fire.checkUpdate(true, request.force, done);
        }
    },
    "getFireItems" : {
        allow : { "extpage" : true },
        exec : function(request, sender, sendResponse) {
            var done = function(cnt, items, progress) {
                if (items == undefined) items = null;

                var done2 = function(data) {
                    try {
                        sendResponse({ image: data, cnt: cnt, scripts: items, progress: progress });
                        items = [];
                    } catch (e) {
                        console.log("bg: warn: action menu closed? " + JSON.stringify(e));
                    }
                };
                if (request.countonly) {
                    done2(null);
                } else {
                    PNG.createIconEx(cnt, done2);
                }
            };
            if (!TM_fire.isReady()) {
                done(0, [], { action: TM_fire.status.action , state: TM_fire.status.progress } );
                return true;
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
        }
    },
    "notification" : {
        allow : { "script" : true, "extpage": true },
        exec : function(request, sender, sendResponse) {
            var image = (request.image && request.image != "") ? request.image : chrome.extension.getURL("images/icon128.png");
            var cb = function (clicked) {
                sendResponse({clicked : clicked});
            }
            notify.show(request.title, request.msg, image, request.delay, cb);
        }
    },
    "localFileCB" : {
        allow : { "script" : true },
        exec : function(request, sender, sendResponse) {
            if (!localFile.useIframeMessage) {
                localFile.listener(null, request.data);
            }
            sendResponse({});
        }
    },
    handler:  function(request, sender, sendResponse) {
        if (!ginit) {
            window.setTimeout(function() { requestHandler(request, sender, sendResponse); }, 10);
            return true;
        }
        if (V || EV || MV) console.log("back: request.method " + request.method + " contextId " + request.id + " tabId: " + (sender.tab ? sender.tab.id : "unknown!!!"));

        var entry = requestHandling[request.method];
        if (entry) {
            if (entry.allow && entry.exec) {
                var thisId = chrome.extension.getID();
                var reqId = (sender.id === thisId);
                var page = null;
                var extpage = reqId && sender.tab && (sender.tab.url.search("chrome-extension") == 0);
                if (reqId && extpage) {
                    var arr = sender.tab.url.match(new RegExp("chrome-extension:\/\/" + thisId + "\/([a-zA-Z]*)\.html"));
                    if (arr.length == 2) page = arr[1];
                    sender.extpage = page;
                }
                var options = (page == 'options');
                var script = reqId && !extpage;

                if ((entry.allow.insecure) ||
                    (entry.allow.extpage && extpage) ||
                    (entry.allow.options && options) ||
                    (entry.allow.script && script)) {

                    var ret = entry.exec(request, sender, sendResponse);
                    if (ret !== undefined) return ret;
                } else {
                    if (D) console.log("back: method " + request.method + " doesn't have the permission to be called from this context");
                    return false;
                }
            } else {
                console.log("b: invalid implementation of " + request.method);
                return false;
            }
        } else {
            console.log("b: " + I18N.getMessage("Unknown_method_0name0" , request.method));
            return false;
        }
        if (V) console.log("back: request.method " + request.method + " end!");

        return true;
    }
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

    if (request.tabid && !ctxRegistry.isEmpty(request.tabid)) {
        var it = function(k, v) {
            u = k;
            return true;
        };
        ctxRegistry.iterateUrls(request.tabid, it);
    } else if (request.url) {
        u = request.url;
    }

    ret.push({ name: I18N.getMessage('Enable_Sort_Cache'),
               id: 'fire_sort_cache_enabled',
               checkbox: true,
               option: true,
               enabled: Config.values.fire_sort_cache_enabled,
               desc: '' });

    var c = items.length ? ' (' + items.length + ')' : '';
    ret.push({ name: I18N.getMessage('Available_Userscripts') + c,  heading: true, scriptTab: true});

    ret = ret.concat(convertScriptsToMenuItems(items, true));

    ret.push({ name: I18N.getMessage('Settings'),  heading: true });
    ret.push({ name: I18N.getMessage('General'), section: true});

    var v = '', d = '';
    var l = getUpdateCheckCfg();

    if (l.fire.db_version == 0) {
        d = '?'
    } else {
        var m = l.fire.db_version * 1000;
        d = new Date(m).toString();
    }

    v += I18N.getMessage('Current_Index_') + '<br><br>';
    v += I18N.getMessage('Date_') + ' ' + d  + '<br>';
    v += I18N.getMessage('Entries_') + ' ' + ((l.fire.entries) ? l.fire.entries : '?')  + '<br><br><br>';

    ret.push({ name: 'TamperFire DB', fire: true, fireInfo: true, value: v, versionDB: m});
    ret.push({ name: I18N.getMessage('Check_for_Updates'),
              fname: I18N.getMessage('Force_Update'),
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
        s.push({ name: I18N.getMessage('_0_scripts_found'),
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
            s.push({ name: I18N.getMessage('No_script_is_running'), image: chrome.extension.getURL('images/info.png')});
        } else {
            s.push({ name: I18N.getMessage('This_page_is_blacklisted_at_the_security_settings'), image: chrome.extension.getURL('images/critical.png')});
        }
    }
    s.push({ name: I18N.getMessage('Get_new_scripts___'), image: chrome.extension.getURL('images/script_download.png'), url: 'http://userscripts.org', newtab: true});
    s.push({ name: I18N.getMessage('Add_new_script___'), image: chrome.extension.getURL('images/script_add.png'), url: chrome.extension.getURL('options.html') + '?open=0', newtab: true });

    ret = ret.concat(s);
    ret.push(createDivider());

    var c = convertMenuCmdsToMenuItems(tab.id);
    if (c.length) c.push(createDivider());
    c.push({ name: I18N.getMessage('Check_for_userscripts_updates'), image: chrome.extension.getURL('images/update.png'), runUpdate: true});
    c.push({ name: I18N.getMessage('Report_a_bug'), image: chrome.extension.getURL('images/bug.png'), url: 'http://tampermonkey.net/bug', newtab: true });
    c.push({ name: I18N.getMessage('Please_consider_a_donation'), image: chrome.extension.getURL('images/amor.png'), url: 'http://tampermonkey.net/donate.html', newtab: true });
    if (c.length) c.push(createDivider());
    c.push({ name: I18N.getMessage('Options'), image: chrome.extension.getURL('images/agt_utilities.png'), url: chrome.extension.getURL('options.html'), newtab: true });
    c.push(createAboutItem());

    ret = ret.concat(c);

    return ret;
};

var createOptionItems = function(cb) {
    var ret = [];
    var c = [];
    var len = 1;

    ret.push({ name: I18N.getMessage('Installed_userscripts'),  heading: true, scriptTab: true});

    var s = convertMgmtToMenuItems(null, true);
    if (!s.length) {
        s.push({ name: I18N.getMessage('No_script_is_installed'), image: chrome.extension.getURL('images/info.png')});
        s.push({ name: I18N.getMessage('Get_some_scripts___'), image: chrome.extension.getURL('images/edit_add.png'), url: 'http://userscripts.org', newtab: true});
    } else {
        len = s.length;
    }

    var done = function(exts) {

        for (var i=0; i< exts.length; i++) {
            var k = exts[i];

            var obj = { name: k.name,
                        id: k.id,
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

    ret.push ({ name: I18N.getMessage('New_userscript'),
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

    ret.push({ name: I18N.getMessage('Settings'), heading: true});

    var optsg = [];
    var optse = [];
    var optsu = [];
    var optsa = [];
    var optss = [];
    var opttf = [];
    var optns = [];
    var optsy = [];
    var optsr = [];

    optsg.push({ name: I18N.getMessage('General'), section: true});

    optsg.push({ name:  I18N.getMessage('Config_Mode'),
               id: 'configMode',
               level: 0,
               option: true,
               select: [ { name: I18N.getMessage('Novice'), value: 0 },
                         { name: I18N.getMessage('Beginner'), value: 50 },
                         { name: I18N.getMessage('Advanced'), value: 100 } ],
               value: Config.values.configMode,
               desc: I18N.getMessage('Changes_the_number_of_visible_config_options') });

    optsg.push({ name:  I18N.getMessage('Language'),
               id: 'i18n',
               level: 0,
               option: true,
               reload: true,
               warning: I18N.getMessage('A_reload_is_required'),
               /* do not translate the default options to allow this to be reset! */
               select: [ { name: 'Browser Default', value: null },
                         { name: I18N.getOriginalMessage('English'), value: 'en' },
                         { name: I18N.getOriginalMessage('German'), value: 'de' },
                         { name: I18N.getOriginalMessage('French'), value: 'fr' },
                         { name: I18N.getOriginalMessage('Spanish'), value: 'es' },
                         { name: I18N.getOriginalMessage('Polish'), value: 'pl' },
                         { name: I18N.getOriginalMessage('Chinese__Simplified_'), value: 'zh_CN' },
                         { name: I18N.getOriginalMessage('Chinese__Traditional_'), value: 'zh_TW' },
                         { name: I18N.getOriginalMessage('Japanese'), value: 'ja' } ],
               value: Config.values.i18n });

    optsg.push({ name: I18N.getMessage('Make_includes_more_safe'), id: 'safeUrls', level: 60, option: true, checkbox: true, enabled: Config.values.safeUrls,
               desc: I18N.getMessage('Includes_more_safe_example')});
    optsg.push({ name: I18N.getMessage('Fix_includes'), id: 'tryToFixUrl', level: 60, option: true, checkbox: true, enabled: Config.values.tryToFixUrl,
               desc: I18N.getMessage('Fix_includes_example') });
    optsg.push({ name: I18N.getMessage('Auto_reload_on_script_enabled'), level: 20, id: 'autoReload', option: true, checkbox: true, enabled: Config.values.autoReload,
               desc: I18N.getMessage('Auto_reload_on_script_enabled_desc') });

    optsg.push({ name: I18N.getMessage('Debug_scripts'), level: 100, id: 'debug', option: true, checkbox: true, enabled: Config.values.debug,
               desc: '' });
    optsg.push({ name: I18N.getMessage('Show_fixed_source'), level: 100, id: 'showFixedSrc', option: true, checkbox: true, enabled: Config.values.showFixedSrc,
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

    optsy.push({ name: I18N.getMessage('TESLA') + ' BETA', section: true, level: 50, needsave: true });

    optsy.push({ name: I18N.getMessage('Enable_TESLA'),
                       id: 'sync_enabled',
                       level: 50,
                       option: true,
                       checkbox: true,
                       enabled: Config.values.sync_enabled,
                       desc: I18N.getMessage('Tampermonkey_External_Script_List_Access') });


    optsy.push({ name: I18N.getMessage('Sync_Type'),
                 id: 'sync_type',
                 enabler: true,
                 level: 50,
                 option: true,
                 select: [ { name: "pastebin.com", value: SyncInfo.types.ePASTEBIN },
                           { name: "Chrome Sync (Beta)", value: SyncInfo.types.eCHROMESYNC, enable : { 'sync_id': 0, 'create_tesla_data' : 0 }} ],
                 value: Config.values.sync_type });

    optsy.push({ name: I18N.getMessage('Sync_Id'),
                 id: 'sync_id',
                 enabledBy: 'sync_type',
                 level: 50,
                 text: true,
                 value: Config.values.sync_id,
                 option: true });


    optsy.push({ name: I18N.getMessage('Create_Exportable_Data'),
               id: 'create_tesla_data',
               enabledBy: 'sync_type',
               button: true,
               ignore: true,
               level: 60,
               warning: I18N.getMessage('Copy_exportable_data_to_clipboard_Ok_') });

    optsa.push({ name: I18N.getMessage('Appearance'), section: true, level: 20 });

    optsa.push({ name: I18N.getMessage('Update_Notification'),
               id: 'notification_showTMUpdate',
               level: 20,
               option: true,
               checkbox: true,
               enabled: Config.values.notification_showTMUpdate,
               desc: '' });

    optsa.push({ name: I18N.getMessage('Icon_badge_info'),
               id: 'appearance_badges',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Off'), value: 'off' },
                         { name: I18N.getMessage('Running_scripts'), value: 'running' },
                         { name: I18N.getMessage('Unique_running_scripts'), value: 'running_unique' },
                         { name: I18N.getMessage('Disabled_scripts'), value: 'disabled' },
                         { name: 'TamperFire', value: 'tamperfire' } ],
               value: Config.values.appearance_badges,
               desc: '' });

    opttf.push({ name: I18N.getMessage('TamperFire'), section: true});

    opttf.push({ name: I18N.getMessage('Enable_TamperFire'),
               id: 'fire_enabled',
               level: 0,
               option: true,
               checkbox: true,
               enabled: Config.values.fire_enabled,
               desc: '' });
    opttf.push({ name: I18N.getMessage('Enable_Sort_Cache'),
               id: 'fire_sort_cache_enabled',
               level: 100,
               checkbox: true,
               option: true,
               enabled: Config.values.fire_sort_cache_enabled,
               desc: '' });

    opttf.push({ name: I18N.getMessage('Update_interval'),
               id: 'fire_updatePeriod',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Never'), value: 0 },
                         { name: I18N.getMessage('Every_Day'), value: 24 * 60 * 60 * 1000 },
                         { name: I18N.getMessage('Every_Week'), value: 7 * 24 * 60 * 60 * 1000 },
                         { name: I18N.getMessage('Every_2_Weeks'), value: 14 * 24 * 60 * 60 * 1000 },
                         { name: I18N.getMessage('Every_Month'), value: 30 * 24 * 60 * 60 * 1000 } ],
               value: Config.values.fire_updatePeriod,
               desc: '' });

    optse.push({ name: I18N.getMessage('Editor'), section: true, level: 20});

    optse.push({ name: I18N.getMessage('Enable_Editor'),
               id: 'editor_enabled',
               level: 100,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_enabled,
               reload: true,
               warning: I18N.getMessage('A_reload_is_required'),
               desc: '' });

    optse.push({ name: I18N.getMessage('Key_Mapping'),
               id: 'editor_keyMap',
               level: 50,
               option: true,
               reload: true,
               warning: I18N.getMessage('A_reload_is_required'),
               select: [ { name: I18N.getMessage('Windows'), value: 'windows' },
                         { name: I18N.getMessage('Emacs'), value: 'emacs' },
                         { name: I18N.getMessage('Vim'), value: 'vim' } ],
               value: Config.values.editor_keyMap });

    optse.push({ name: I18N.getMessage('Indentation_Width'),
               id: 'editor_indentUnit',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('1'), value: 1 },
                         { name: I18N.getMessage('2'), value: 2 },
                         { name: I18N.getMessage('3'), value: 3 },
                         { name: I18N.getMessage('4'), value: 4 },
                         { name: I18N.getMessage('5'), value: 5 },
                         { name: I18N.getMessage('6'), value: 6 },
                         { name: I18N.getMessage('7'), value: 7 },
                         { name: I18N.getMessage('8'), value: 8 },
                         { name: I18N.getMessage('9'), value: 9 },
                         { name: I18N.getMessage('10'), value: 10 },
                         { name: I18N.getMessage('11'), value: 11 } ],
               value: Config.values.editor_indentUnit,
               desc: '' });

    optse.push({ name: I18N.getMessage('Indent_with'),
               id: 'editor_indentWithTabs',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Tabs'), value: 'tabs' },
                         { name: I18N.getMessage('Spaces'), value: 'spaces' } ],
               value: Config.values.editor_indentWithTabs,
               desc: '' });

    optse.push({ name: I18N.getMessage('TabMode'),
               id: 'editor_tabMode',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Classic'), value: 'classic' },
                         { name: I18N.getMessage('Smart'), value: 'smart' } ],
               value: Config.values.editor_tabMode,
                     desc: '' });


    /* optse.push({ name: I18N.getMessage('EnterMode'),
               id: 'editor_enterMode',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Indent_new_lines'), value: 'indent' },
                         { name: I18N.getMessage('Indent_as_previous'), value: 'keep' },
                         { name: I18N.getMessage('No_Indentation'), value: 'flat' } ],
               value: Config.values.editor_enterMode,
               desc: '' }); */

    optse.push({ name: I18N.getMessage('Reindent_on_typing'),
               id: 'editor_electricChars',
               level: 50,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_electricChars,
               desc: '' });


    optse.push({ name: I18N.getMessage('Show_Line_Numbers'),
               id: 'editor_lineNumbers',
               level: 20,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_lineNumbers,
               desc: '' });

   /* optse.push({ name: I18N.getMessage('Enable_autoSave'),
               id: 'editor_autoSave',
               level: 20,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_autoSave,
               desc: '' }); */

    optse.push({ name: I18N.getMessage('Enable_easySave'),
               id: 'editor_easySave',
               level: 20,
               option: true,
               checkbox: true,
               enabled: Config.values.editor_easySave,
               desc: '' });

    optsu.push({ name: I18N.getMessage('Script_Update'), section: true, level: 0});

    optsu.push({ name: I18N.getMessage('Check_disabled_scripts'),
               id: 'scriptUpdateCheckDisabled',
               level: 0,
               option: true,
               checkbox: true,
               enabled: Config.values.scriptUpdateCheckDisabled,
               desc: '' });

    optsu.push({ name: I18N.getMessage('Check_interval'),
               id: 'scriptUpdateCheckPeriod',
               level: 0,
               option: true,
               select: [ { name: I18N.getMessage('Never'), value: 0 },
                         { name: I18N.getMessage('Every_Hour'), value: 1 * 60 * 60 * 1000 },
                         { name: I18N.getMessage('Every_6_Hours'), value: 6 * 60 * 60 * 1000 },
                         { name: I18N.getMessage('Every_12_Hour'), value: 12 * 60 * 60 * 1000 },
                         { name: I18N.getMessage('Every_Day'), value: 24 * 60 * 60 * 1000 },
                         { name: I18N.getMessage('Every_Week'), value: 7 * 24 * 60 * 60 * 1000 } ],
               value: Config.values.scriptUpdateCheckPeriod,
               desc: '' });

    optsu.push({ name: I18N.getMessage('Dont_ask_me_for_simple_script_updates'),
               id: 'notification_silentScriptUpdate',
               level: 80,
               option: true,
               checkbox: true,
               enabled: Config.values.notification_silentScriptUpdate,
               desc: '' });

    optsu.push({ name: I18N.getMessage('Hide_notification_after'),
               id: 'scriptUpdateHideNotificationAfter',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Never'), value: 0 },
                         { name: I18N.getMessage('15_Seconds'), value: 15 * 1000 },
                         { name: I18N.getMessage('30_Seconds'), value: 30 * 1000 },
                         { name: I18N.getMessage('1_Minute'), value: 60 * 1000 },
                         { name: I18N.getMessage('5_Minutes'), value: 5 * 60 * 1000 },
                         { name: I18N.getMessage('1_Hour'), value: 60 * 60 * 1000 } ],
               value: Config.values.scriptUpdateHideNotificationAfter,
               desc: '' });

    optss.push({ name: I18N.getMessage('Security'), section: true, level: 50 });

    optss.push({ name: I18N.getMessage('Allow_overwrite_javascript_settings'),
               id: 'scriptblocker_overwrite',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Yes'), value: 'yes' },
                         { name: I18N.getMessage('No'), value: 'no' } ],
               value: Config.values.scriptblocker_overwrite,
               desc: I18N.getMessage('Tampermonkey_can_not_work_when_javascript_is_disabled') });

    optss.push({ name: I18N.getMessage('Add_TM_to_CSP'),
               id: 'webrequest_fixCSP',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Yes'), value: 'yes' },
                         { name: I18N.getMessage('No'), value: 'no' } ],
               value: Config.values.webrequest_fixCSP,
               desc: I18N.getMessage('Tampermonkey_might_not_be_able_to_provide_access_to_the_unsafe_context_when_this_is_disabled') });

    optss.push({ name: I18N.getMessage('Allow_headers_to_be_modified_by_scripts'),
               id: 'webrequest_modHeaders',
               level: 50,
               option: true,
               select: [ { name: I18N.getMessage('Yes'), value: 'yes' },
                         { name: I18N.getMessage('Auto'), value: 'auto' },
                         { name: I18N.getMessage('No'), value: 'no' } ],
               value: Config.values.webrequest_modHeaders,
               desc: '' });

    optss.push({ name: I18N.getMessage('Forbidden_Pages'),
               id: 'forbiddenPages',
               level: 50,
               option: true,
               input: true,
               array: true,
               value: Config.values.forbiddenPages,
               desc: '' });

    optss.push({ name: I18N.getMessage('_require_blacklist'),
               id: 'require_blacklist',
               level: 80,
               option: true,
               input: true,
               array: true,
               value: Config.values.require_blacklist,
               desc: '' });

    optns.push({ name: I18N.getMessage('Userscripts'), section: true, level: 80 });

    optns.push({ name: I18N.getMessage('New_script_template_'),
                 id: 'scriptTemplate',
                 level: 80,
                 option: true,
                 input: true,
                 value: Config.values.scriptTemplate });

    optsr.push({ name: I18N.getMessage('Reset_Section'), section: true, level: 50 });

    optsr.push({ name: I18N.getMessage('Restart_Tampermonkey'),
               id: 'reset_simple',
               level: 50,
               button: true,
               reload: true,
               value: 0,
               warning: I18N.getMessage('This_will_restart_Tampermonkey_Ok_') });

    optsr.push({ name: I18N.getMessage('Factory_Reset'),
               id: 'reset_factory',
               level: 80,
               button: true,
               reload: true,
               value: 0,
               warning: I18N.getMessage('This_will_remove_all_scripts_and_reset_all_settings_Ok_') });

    if (storagePermission.hasPermission) {
        optsr.push({ name: I18N.getMessage('Chrome_Sync_Reset'),
                     id: 'reset_chrome_sync',
                     level: 80,
                     button: true,
                     reload: false,
                     value: 0,
                     warning: I18N.getMessage('This_will_remove_all_stored_data_from_google_sync_Ok_') });
    }

    ret = ret.concat(optsg).concat(optsa).concat(optsu).concat(optsy).concat(opttf).concat(optse).concat(optss).concat(optns).concat(optsr);

    ret.push({ name: 'EOS', section: true, endsection: true});

    ret.push(createDivider());

    if (false) {
        ret.push({ name: I18N.getMessage('Registered_menu_cmds'), heading: true});

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

    var args = 'version=' + chrome.extension.getVersion() + '&' +
               'ext=' + chrome.extension.getID().substr(0, 4);

    return { image: chrome.extension.getURL('images/info.png'),
             urls : [ { name: ' ' + I18N.getMessage('About'),
                        url: 'http://tampermonkey.net/about.html?' + args,
                        newtab: true },
                      { name: ' ' + I18N.getMessage('Changelog'),
                        url: 'http://tampermonkey.net/changelog.php?' + args,
                        newtab: true } ]
            };
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

        item.file_url = script.downloadURL || script.fileURL;
        item.positionof = scripts.length;
        item.userscript = script.options.user_agent ? false : true;
        item.user_agent = script.options.user_agent;

        if (!script.icon64 && !script.icon) {
            item.icon64 = chrome.extension.getURL(item.user_agent ? 'images/user_agent.png' : 'images/txt.png');
        }

        if (script.options) {
            var dns = new scriptParser.Script();
            for (var kk in dns.options) {
                if (!dns.options.hasOwnProperty(kk)) continue;
                item[kk] = script.options[kk];
            }
        }
        if (options) {
            item.code = script.textContent;
            item.sync = script.sync;

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
        if (!ctxRegistry.isEmpty(tab.id)) {
            var it = function(i, v) {
                if (V || UV) console.log("Found at ctxRegistry["+tab.id+"].urls -> " + i);

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
            };

            ctxRegistry.iterateUrls(tab.id, it);
        } else {
            console.log("bg: WARN: ctxRegistry["+tab.id+"].urls is empty!");
        }
    } else {
        scripts = determineScriptsToRun(url);
    }

    return convertScriptsToMenuItems(scripts, options);
};

/* ###clipboard ### */

var clipboard = {
    copy : function(data) {
        var myFrame = document.createElement("iframe");
        myFrame.setAttribute("sandbox" , "allow-same-origin"); // disable javascript
        document.body.appendChild(myFrame);
        try {
            if (data.type == "html") {
                myFrame.contentDocument.documentElement.innerHTML = data.content;
            } else {
                myFrame.contentDocument.documentElement.textContent = data.content;
            }

            myFrame.contentDocument.designMode = "on";
            myFrame.contentDocument.execCommand("selectAll", false, null);
            myFrame.contentDocument.execCommand("copy", false, null);
            myFrame.contentDocument.designMode = "off";

        } catch (e) {
            console.log("bg: clipboard Error: " + e.message);
        }

        myFrame.parentNode.removeChild(myFrame);
        myFrame = null;
    }
};

/* ### content settings ### */
var permission = {
    permContentSettings: 'contentSettings',
    permStorage : 'storage',
    permissions : null,
    lock: false,

    clear: function() {
        if (permission.lock) {
            console.log("perm: clear, but locked");
        };
        permission.permissions = null;
    },

    get : function(cb) {
        var gotPerms = function(p) {
            Helper.forEach(p.permissions, function(v, k) { permission.permissions[v] = true; });
            permission.lock = false;
            if (cb) cb();
        };

        permission.lock = true;
        permission.permissions = {};
        chrome.permissions.getAll(gotPerms);
    },

    has : function(perm, cb) {
        if (permission.lock) {
            var again = function() { permission.has(perm, cb); };
            window.setTimeout(again, 50);
            return;
        };

        if (!permission.permissions) {
            var check = function() {
                permission.has(perm, cb);
            };
            permission.get(check);
            return;
        }

        if (cb) cb(!!permission.permissions[perm]);
    },

    ask : function(perm, title, msg, cb) {
        var image = chrome.extension.getURL("images/icon128.png");
        var done = function(granted) {
            if (cb) cb(granted);
        };

        var gotPerm = function(granted) {
            if (granted) {
                if (!permission.permissions) permission.permissions = {};
                permission.permissions[perm] = true;

                done(granted);
                return;
            }
            done(false);
        };

        notify.getPermission(title, msg, image, 60000, perm, gotPerm);
    },

    remove : function(perm, cb) {
        var done = function(removed) {
            if (permission.permissions) permission.permissions[perm] = false;
            if (cb) cb(removed);
        };
        chrome.permissions.remove({ permissions: [perm] }, done);
    }
};

var storagePermission = {
    asked: false,
    hasPermission: null,

    init: function() {
        var g = function(s) {
            storagePermission.hasPermission = s;
            if (D) console.log("bg: storagePermission: hasPermission = " + s)
        };
        permission.has(permission.permStorage, g);
    },

    askForPermission : function(cb) {
        permission.ask(permission.permStorage,
                       I18N.getMessage("Storage_permission_is_needed_"),
                       I18N.getMessage("Click_here_to_allow_TM_to_use_Google_sync"),
                       cb);
    },

    requestPermissionEx : function(cb) {
        var gotPerm = function(g) {
            if (cb) cb(g, true);
            if (g && !storagePermission.hasPermission) {
                storagePermission.hasPermission = true;
                // restart TM
                Reset.reset();
            }
        };

        var h = function(p) {
            if (storagePermission.asked) {
                // asked earlier, but not now
                if (cb) cb(p, false);
            } else if (p) {
                // we have permission :)
                cb(p, false);
            } else {
                // we don't have permission and also don't have asked yet
                storagePermission.askForPermission(gotPerm);
            }

            // only once in a lifetime (TM) :)
            storagePermission.asked = true;
        };

        permission.has(permission.permStorage, h);
    },

    remove : function(cb) {
        permission.remove(permission.permStorage, cb);
    }
};

var contentSettings = {
    asked: false,
    runCheck: false,
    hasPermission: false,
    init: function() {
        var g = function(s) {
            contentSettings.hasPermission = s;
            contentSettings.runCheck = contentSettings.hasPermission && (Config.values.scriptblocker_overwrite == 'yes');
            if (D) console.log("bg: contentSettings: runCheck = " + contentSettings.runCheck + " hasPerm = " + contentSettings.hasPermission);
        };
        permission.has(permission.permContentSettings, g);
    },

    askForPermission : function(cb) {
        permission.ask(permission.permContentSettings,
                       I18N.getMessage("A_script_blocker_was_detected_"),
                       I18N.getMessage("Click_here_to_allow_TM_to_override_the_script_blocker"),
                       cb);
    },

    requestPermissionEx : function(cb) {
        if (Config.values.scriptblocker_overwrite != 'yes') {
            if (cb) cb();
            return;
        }

        var gotPerm = function(g) {
            if (cb) cb(g, true);
            if (g && !contentSettings.runCheck) {
                contentSettings.runCheck = true;
                // restart TM
                Reset.reset();
            }
        };

        var h = function(p) {
            if (contentSettings.asked) {
                // asked earlier, but not now
                if (cb) cb(p, false);
            } else if (p) {
                // we have permission :)
                cb(p, false);
            } else {
                // we don't have permission and also don't have asked yet
                contentSettings.askForPermission(gotPerm);
            }

            // only once in a lifetime (TM) :)
            contentSettings.asked = true;
        };

        permission.has(permission.permContentSettings, h);
    },

    remove : function(cb) {
        permission.remove(permission.permContentSettings, cb);
    }
};

/* ### reset ### */

var Reset = {
    run : function(type, cb) {
        var running = 1;

        var alldone = function() {
            if (cb) cb();
            window.location.reload();
        };

        var check = function() {
            if (--running == 0) {
                alldone();
            }
        };

        if (type == "config") {
            var values = TM_storage.listValues();
            for (var k in values) {
                var v = values[k];
                if (v.search(scriptAppendix) == -1) continue;
                if (v.search(condAppendix) == -1) continue;
                if (v.search(storeAppendix) == -1) continue;
                TM_storage.deleteValue(v);
            }

        } else if (type == "factory") {
            if (TM_fire.isReady()){
                running++;
                TM_fire.clean(check);
            }

            if (contentSettings.hasPermission) {
                running++;
                contentSettings.remove(check);
            }

            if (storagePermission.hasPermission) {
                running++;
                storagePermission.remove(check);
            }

            running++;
            TM_storage.deleteAll(check);
        }

        check();
    },

    reset: function(cb) {
        Reset.run(null, cb);
    },

    factoryReset: function(cb) {
        Reset.run("factory", cb);
    },

    configReset: function(cb) {
        Reset.run("config", cb);
    }
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

/* #### pimped icon, browser action ### */

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

            if (objImg.parentNode) objImg.parentNode.removeChild(objImg);
            objImg = null;

            if (cb) cb();
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

var initBrowserAction = function() {
   chrome.browserAction.setIcon(  {  path: chrome.extension.getURL("images/icon_grey.png") } );
   chrome.browserAction.setPopup( { popup: "action.html" } );
   chrome.browserAction.setTitle( { title: "Tampermonkey" });
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
        if (tabId && ctxRegistry.has(tabId)) {
            c = ctxRegistry.n[tabId].stats.running;
        }
    } else if (Config.values.appearance_badges == 'running_unique') {
        if (tabId && ctxRegistry.has(tabId) && ctxRegistry.n[tabId].cache) {
            c = ctxRegistry.n[tabId].cache.runners.length;
        }
    } else if (Config.values.appearance_badges == 'disabled') {
        if (tabId && ctxRegistry.has(tabId)) {
            c = ctxRegistry.n[tabId].stats.disabled;
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
var webRequest = {
    infoChanged : [],
    redirects : {},

    addInfoChangedListener : function(fn) {
        webRequest.infoChanged.push(fn);
    },
    runInfoChangedListener : function() {
        for (var i=0; i<webRequest.infoChanged.length; i++) {
            webRequest.infoChanged[i](_webRequest);
        }
    },
    headerCheck : function(details) {
        if (details.tabId >= 0 && _webRequest.verified == false) {
            if (D || UV) console.log('bg: verify that webRequest is working at ' + details.type + ' to ' + details.url);

            var found = false;
            var r = new RegExp('^' + _webRequest.testprefix);
            for (var i = 0; i < details.requestHeaders.length; i++) {
                var item = details.requestHeaders[i];
                if (UV) console.log(" #: " + item.name + " -> " + item.value);
                if (item.name.search(r) == 0) {
                    if (D) console.log('bg: found ' + item.name + ' @webRequest :)');
                    found = true;
                }
            }

            if (!found && _webRequest.verifyCnt-- > 0) return;

            _webRequest.headers = found;
            _webRequest.verified = true;

            webRequest.runInfoChangedListener();
            if (D) console.log('bg: verified webRequest ' + (_webRequest.headers ? '' : 'not ') + 'being working');

            try {
                chrome.webRequest.onSendHeaders.removeListener(webRequest.headerCheck);
            } catch(ex) {
                _webRequest.headers = false;
                _webRequest.verified = true;
                webRequest.runInfoChangedListener();
            }
        }
    },

    extractInfoFromURL : function(url) {
        var d = '';
        var p = 'http';

        if (url) {
            var x = url.toLowerCase();
            if (x.indexOf("://") != -1) {
                p = x.substr(0, url.indexOf("://"));
                x = x.substr(url.indexOf("://") + 3);
            }
            if (x.indexOf("/") != -1) x = x.substr(0, x.indexOf("/"));
            if (x.indexOf("@") != -1) x = x.substr(x.indexOf("@") + 1);
            if (x.indexOf(":") > 0) x = x.substr(0, x.indexOf(":"));
            d = x;
        }

        return {domain: d, protocol: p};
    },

    detectRedirect : function(details) {
        var rh = details.responseHeaders;
        var id = details.requestId;
        var redirected = false;
        var mod = false;
        var xmlreq = (details.type == 'xmlhttprequest');

        if (!xmlreq && !Config.values.webrequest_fixCSP) return {};

        if (xmlreq && webRequest.redirects[id]) {
            redirected = true;
            // if (D) console.log("webReq: #" + id + " detected old redirect " + webRequest.redirects[id].url);
        }

        for (var i = 0; i < rh.length; i++) {
            var item = rh[i];
            if (xmlreq && item.name == 'Location') {
                var wrap = function() {
                    var rid = id;
                    if (redirected) {
                        // if (D) console.log("webReq: #" + id + " skip cleanup");
                        window.clearTimeout(webRequest.redirects[id].to);
                    }
                    var cleanRedirect = function() {
                        // if (D) console.log("webReq: #" + id + " cleanup");
                        delete(webRequest.redirects[rid]);
                    };

                    webRequest.redirects[rid] = { url: item.value, to: window.setTimeout(cleanRedirect, 10000) };
                };
                wrap();
                break;
            } else if (Config.values.webrequest_fixCSP &&
                       (item.name == 'X-WebKit-CSP' || item.name == 'X-Content-Security-Policy')) {

                var n = item.value.replace(/script-src /, 'script-src ' + 'chrome-extension://' + chrome.extension.id + '/ \'unsafe-inline\' \'unsafe-eval\' ')
                if (D) console.log('csp: replace "' + item.value + '" with "' + n + '"');

                item.value = n;
                rh[i] = item;
                mod = true;
            }
        }

        if (redirected) {
            // if (D) console.log("webReq: #" + id + " add url to responseHeaders (" + webRequest.redirects[id].url + ")");
            rh.push({name: 'TM-finalURL', value: webRequest.redirects[id].url });
            // if (D) console.log(rh);
            mod = true;
        }

        if (mod) {
            return { responseHeaders: rh };
        }

        return {};
    },

    headerFix : function(details) {
        if (V || UV) console.log(details.type);

        var registered = ctxRegistry.has(details.tabId);
        var main = details.type == 'main_frame';
        var script = contentSettings.runCheck;
        var frame = main || details.type == 'sub_frame';

        if (main) {
            Tab.reset(details.tabId, true);
            if (V || UV || EV) console.log("bg: create new ctxRegistry entry for URL " + details.url);
            var nfo = { tabId: details.tabId, frameId: 0 /* 'main_frame' */ , scriptId: 0, url: details.url };
            ctxRegistry.setCache(nfo.tabId, nfo.frameId, nfo.url, Tab.prepare(nfo));

            registered = true;
        }

        if (frame && script) {
            var info = webRequest.extractInfoFromURL(details.url);
            var pat = info.protocol + '://' + info.domain + '/*';

            // white list protocol + domain to be more specific and therefore more important than a script blocker
            // note: doesn't work at the moment...
            chrome.contentSettings.javascript.set({ primaryPattern: pat, setting: 'allow'});

            if (V || UV || EV) {
                var later = function() {
                    var cb = function(a) {
                        console.log("contentSettings: (" + (new Date()).getTime() + ") state: " + JSON.stringify(a));
                    };
                    chrome.contentSettings.javascript.get({ primaryUrl: details.url }, cb);
                };
                console.log("contentSettings: (" + (new Date()).getTime() + ") allow URL " + pat);
                later();

                window.setTimeout(later, 20);
            }
        }

        var u = registered && ctxRegistry.n[details.tabId].user_agent;
        var xml = _webRequest.headers && details.type == 'xmlhttprequest';

        if (!u && !xml) return {};

        var m = false;
        var f = {};
        var t = [];
        var r = new RegExp('^' + _webRequest.prefix);

        var uv;
        if (u) {
            for (var k in ctxRegistry.n[details.tabId].user_agent) {
                if (!ctxRegistry.n[details.tabId].user_agent.hasOwnProperty(k)) continue;
                uv = ctxRegistry.n[details.tabId].user_agent[k];
            }
            if (V || UV) console.log("bg: userscript user-agent spoof enabled! (" + uv + ")");
        }

        if (V || UV) {
            console.log("bg: process request to " + details.url);
            console.log(details.requestHeaders);
        }

        for (var i = 0; i < details.requestHeaders.length; i++) {
            var item = details.requestHeaders[i];
            if (item.name.search(r) == 0) {
                t.push(item);
            } else if (u && item.name == 'User-Agent') {
                m = true;
                f[item.name] = uv;
            } else {
                f[item.name] = item.value;
            }
        }

        if (xml) {
            for (var i = 0; i < t.length; i++) {
                var item = t[i];
                m = true;
                f[item.name.replace(r, '')] = item.value;
            }

            if (!_webRequest.verified) {
                m = true;
                f[_webRequest.testprefix] = 'true';
            }
        }

        if (m) {
            var d = [];
            for (var k in f) {
                if (!f.hasOwnProperty(k)) continue;
                if (k != "") d.push({ name: k, value: f[k]});
            }

            if (V || UV) console.log(d);
            return { requestHeaders: d };
        }

        return {};
    },

    sucRequest : function(details) {
        if (details.tabId > 0) {
            console.log("bg: " + details.requestId + " print " + details.type + " request of tabId " + details.tabId + " to " + details.url);
        }
    },

    checkRequestForUserscript : function(details) {
        var up = ScriptDetector.isScriptUrl(details.url);
        var qp = details.url.search(/\?/);
        var hp = details.url.search(/\#/);
        var fi = details.url.search(/^file:\/\//);

        if (details.tabId > 0 &&
            details.type == "main_frame" &&    /* ignore URLs from frames, xmlhttprequest, ... */
            details.method != 'POST' &&        /* i.e. github script modification commit */
            fi == -1 &&
            up == true &&
            (qp == -1 || up < qp) &&           /* ignore user.js string in URL params */
            (hp == -1 || up < hp) &&           /* ignore user.js string in URL params */
            details.url.search(/\#bypass=true/) == -1) {

            var url = chrome.extension.getURL("ask.html") + "?script=" + Converter.Base64.encode(details.url) + "&i18n=" + Config.values.i18n;
            if (RV) console.log("bg: user script detected @ " + details.url + " -> open tab with " + url);

            chrome.tabs.create({ url: url}, function() {});

            return { redirectUrl: "javascript:history.back()" };
        }

        return {};
    },

    removeWebRequestListeners : function() {
        if (_webRequest.use) {
            try {
                chrome.webRequest.onBeforeRequest.removeListener(webRequest.checkRequestForUserscript);
                chrome.webRequest.onBeforeSendHeaders.removeListener(webRequest.headerFix);
                chrome.webRequest.onHeadersReceived.removeListener(webRequest.detectRedirect);
                if (_webRequest.headers) {
                    if (_webRequest.verified == false) chrome.webRequest.onSendHeaders.removeListener(webRequest.headerCheck);
                    if (V || UV) chrome.webRequest.onCompleted.removeListener(webRequest.sucRequest);
                }
            } catch(ex) {}
        }

        _webRequest.headers = false;
        _webRequest.verified = true;
        webRequest.runInfoChangedListener();
    },

    init : function(verified, headers) {
        if (_webRequest.use) {
            try {
                var reqFilter = { urls: [ "http://*/*", "https://*/*" ], types : [ "xmlhttprequest" ] };
                var rreqFilter = { urls: [ "http://*/*", "https://*/*", "file://*/*" ] };
                var hreqFilter = { urls: [ "http://*/*", "https://*/*" ] };
                chrome.webRequest.onBeforeRequest.addListener(webRequest.checkRequestForUserscript, rreqFilter, ["blocking"]);
                chrome.webRequest.onBeforeSendHeaders.addListener(webRequest.headerFix, rreqFilter, ["requestHeaders", "blocking"]);
                chrome.webRequest.onHeadersReceived.addListener(webRequest.detectRedirect, hreqFilter, ["responseHeaders", "blocking"]);

                if (headers) {
                    if (!verified) chrome.webRequest.onSendHeaders.addListener(webRequest.headerCheck, reqFilter, ["requestHeaders"]);
                    if (V || UV) chrome.webRequest.onCompleted.addListener(webRequest.sucRequest, reqFilter, []);
                }

                chrome.webRequest.handlerBehaviorChanged();
                _webRequest.verified = verified;
                _webRequest.headers = headers;
                _webRequest.id = ((new Date()).getTime() + Math.floor ( Math.random ( ) * 6121983 + 1 )).toString();
                _webRequest.testprefix = _webRequest.prefix + (Math.floor ( Math.random ( ) * 6121983 + 1 )).toString();
                _webRequest.prefix = _webRequest.prefix + _webRequest.id + '_';
                webRequest.runInfoChangedListener();

            } catch (e) {
                if (D) console.log("bg: error initializing webRequests " + e.message);
                webRequest.removeWebRequestListeners();
            }
        }
    },

    finalize : function() {
        webRequest.removeWebRequestListeners();
    }
};

/* ### Cleanup ### */
function cleanup() {
    if (D) console.log("bg: cleanup!");
    webRequest.finalize();
    SyncClient.finalize();
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
        chrome.tabs.sendMessage(tabID,
                                { method: "getSrc" },
                                function(response) {
                                    if (V) console.log("add script from " + tab.url);
                                    addNewUserScript({ tabid: tab.id, url: tab.url, src: response.src });
                                });
    };
    if (ScriptDetector.isScriptUrl(tab.url)) {
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
    } else if (changeInfo.url) {
        if (V || EV) console.log("bg: url of tab " + tabID + "(" +  changeInfo.status + ") has changed to " + changeInfo.url);
    } else if (changeInfo.status == 'complete') {
        if (!ctxRegistry.isEmpty(tabID)) {
            chrome.tabs.sendMessage(tabID,
                                    { method: "onLoad" },
                                    function(response) {});
        }
        if (contentSettings.runCheck) {
            if (V || EV || UV) console.log("contentSettings: (" + (new Date()).getTime() + ") javascript.clear({})");
            chrome.contentSettings.javascript.clear({});
        }
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

var tabUpdateListener = function(tabId, changeInfo, tab, request, length_cb, allrun_cb) {
    if (!Config.initialized) {
        window.setTimeout(function() { tabUpdateListener(tabId, changeInfo, tab, request, length_cb, allrun_cb); }, 100);
        return;
    }
    if (changeInfo.status == 'complete') {
        var scriptId = 0;
        var url = tab.url;

        if (request) {
            url = request.url + request.params;
            scriptId = request.id;
        }
        var nfo = { tabId: tabId, frameId: tab.frameId, scriptId: scriptId, url: url };
        var runInfo = null;

        if (tab.frameId > 0 ||
            /* TODO: sub_frame runInfo is not cached cause frameId is not available for reqestListeners!
                     Otherwise we would pre-generate the info at webRequest.headerFix for sub frames too. */
            !ctxRegistry.has(tabId) ||
            !ctxRegistry.n[tabId].cache) {

            runInfo = Tab.prepare(nfo, length_cb);
        } else if (length_cb) {
            if (ctxRegistry.has(tabId)) {
                var runInfo = ctxRegistry.n[tabId].cache;
                length_cb(runInfo.runners.length, runInfo.disabled);
            } else {
                // all info should be Tab.prepare'd by webRequest.headerFix !
                console.log("bg: WARN: this should _NEVER_ happen!!!!!");
            }
        }

        Tab.runScripts(nfo, runInfo, allrun_cb);
    }
};

var selectionChangedListener = function(tabId, selectInfo) {
    // setBadge(tabId);
};

var removeListener = function(tabId, removeInfo) {
    ctxRegistry.remove(tabId);
};

var initObjects = function() {
    adjustLogLevel(Config.values.logLevel);
    I18N.setLocale(Config.values.i18n);

    contentSettings.init();
    storagePermission.init();

    if (Config.values.sync_enabled &&
        Config.values.sync_type) {

        SyncClient.enable();
        SyncClient.scheduleSync(1000, true);
        SyncClient.schedulePeriodicalCheck();
    }

    if (Config.values.fire_enabled) {
        TM_fire.init();
    }

    if (Config.values.webrequest_use != 'no') {
        var infoChanged = function(wr) {
            if (V) console.log("bg: webRequest changed " + JSON.stringify(wr));
        };
        webRequest.addInfoChangedListener(infoChanged);

        webRequest.init(Config.values.webrequest_modHeaders != 'auto',
                        Config.values.webrequest_modHeaders != 'no');
    }
};

var Config;
var Converter;
var xmlhttpRequest;
var compaMo;
var scriptParser;
var Helper;
var Syncer;
var I18N;

init = function() {
    Converter = Registry.get('convert');
    I18N = Registry.get('i18n');
    xmlhttpRequest = Registry.get('xmlhttprequest').run;

    compaMo = Registry.get('compat');
    scriptParser = Registry.get('parser');
    Helper = Registry.get('helper');
    SyncInfo = Registry.get('syncinfo');

    initBrowserAction();

    var cfgdone = function() {
        initObjects();
        addCfgCallbacks();
        setIcon();
        alldone();
    };

    var storagedone = function() {
        Config = new ConfigObject(cfgdone);
        cfgo = Config;
    };

    TM_storage.init(storagedone);

    var waitForWebNav  = function() {
        if (!chrome.webNavigation || !chrome.webNavigation.onCommitted) {
            if (D || V) console.log("gb: waitForWebNav()");
            window.setTimeout(waitForWebNav, 300);
            return;
        }

        chrome.webNavigation.onCommitted.addListener(onCommitedListener);
    };

    var alldone = function() {
        window.setTimeout(ScriptUpdater.check, 10000);

        // the content script sends a request when it's loaded.. this happens just once ;)
        chrome.tabs.onUpdated.addListener(loadListener);
        chrome.tabs.onRemoved.addListener(removeListener);
        chrome.tabs.onSelectionChanged.addListener(selectionChangedListener);

        chrome.extension.onMessage.addListener(requestHandling.handler);
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
window.setTimeout(init, 1);

})();
