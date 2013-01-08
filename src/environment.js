/**
 * @filename environment.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

Registry.registerRaw('environment.js', function() {

var eDOMCONTENTLOADED = "DOMContentLoaded";
var eLOAD = "load";
var eDOMNODEINSERTED = "DOMNodeInserted";

var eNORMAL = 0;
var eBACKUP = 1;

var TM_internal = "TM_internal";

TMwin.domContentLoaded = false;
TMwin.loadHappened = false;
TMwin.domNodeInserted = false;
TMwin.props = {};
TMwin.adjustLogLevel = function(l) {
    if (l !== undefined) {
        logLevel = l;
    }

    D |= (logLevel >= 60);
    V |= (logLevel >= 80);
    EV |= (logLevel >= 100);
    EMV |= (logLevel >= 100);
};

Clean = [];
TMwin.adjustLogLevel();
var chromeEmu = TMwin.chromeEmu;

var TM_toType = function(obj) {
    return ({}).toString.apply(obj).match(/\s([a-z|A-Z]+)/)[1];
};

var TM_outerHTML = function(elem){
    var div = document.createElement('div');
    div.appendChild(elem.cloneNode(true));
    return div.innerHTML;
};

var TM_isPartOfDOM = function(elem, cnt){
    if (cnt == undefined) cnt = 100; // just to be sure!
    return (cnt && elem && (elem == document || (TM_isPartOfDOM(elem.parentNode, cnt-1))));
};

var TM_mEval = function(script, src, requires, addProps) {
    var all = null;

    try {
        var mask = addProps.context;
        var emu = '';
        var setid = '';

        if (!mask['__TMbackref']) mask['__TMbackref'] = {};

        // TODO: window fake
        /* if (false) {
        var winKeys = [ 'localStorage', 'sessionStorage' ];
        for (var p in TMwin.backup) {
            if (!TMwin.backup.hasOwnProperty(p)) continue;
            winKeys.push(p);
        }

        for (var i=0; i<winKeys.length; i++) {
            var p = winKeys[i];
            var t = window[p];
            if (p && p.trim() != "" && p != "window") {
                if (typeof window[p] === 'function') {
                    (function() {
                        var k = p;
                        mask[p] = window[k].apply(window, arguments);
                    })();
                } else {
                    mask[p] = window[p];
                }
            }
        }
        } */

        for (var p in addProps.elements) {
            if (!addProps.elements.hasOwnProperty(p)) continue;
            var t = addProps.elements[p];
            if (t.name) {
                if (t.overwrite) {
                    emu += "var " + t.name + " = " + t.value + ";\n";
                } else if (t.scriptid) {
                    mask['__TMbackref'][t.name + '_' + t.scriptid] = t.value;
                    // TODO: window fake
                    // mask[t.name] = mask['__TMbackref'][t.name + '_' + t.scriptid]
                    emu += "var " + t.name + " = this.__TMbackref." + t.name + '_' + t.scriptid + ";\n";
                } else {
                    mask[t.name] = t.value;
                    // TODO: window fake
                    emu += "var " + t.name + " = this." + t.name + ";\n";
                }
            } else {
                if (D) console.log("env: WARN: unexpected item in props elem: " + JSON.stringify(t));
            }
        }

        var wrap = function(source) {
            // TODO: is there another way than generating this code?
            var s = "";
            s += 'try {\n';
            s +=  requires + source + '\n';
            s += '} catch (e) {\n';
            s += '    console.log("ERROR: Execution of script \'' + script.name + '\' failed! " + e.message); \n';
            s += '    console.log(e.stack.replace(/\\(eval at <anonymous> /g, "").replace(/<anonymous>:/g, "").replace(/chrome-extension:\\/\\/[\\w]{32}\\/content\\.js:\\d*:\\d*\\)*, /g, ""))\n';
            s += '}\n';
            return s;
        };

        setid = 'arguments.callee.setID({ id: "' + script.id + '", run_at: "' + script.options.run_at + '", ns: "' + script['namespace'] + '" });\n';

        // TODO: window fake
        // execute script in private context and fake window root
        // var runEm = new Function( "window",  emu + "with (window) { " + src + "}");
        all = setid + emu + wrap(src);
        var runEm = new Function(all);
        runEm.apply(mask, []);

    } catch (e) {
        var opts = { maxerr: 999,
                     newcap: true,
                     es5: true,
                     sloppy: true,
                     browser: true,
                     white: true,
                     plusplus: true,
                     nomen: true,
                     'continue': true,
                     todo: true,
                     eqeq: true,
                     passfail: false,
                     unparam: true,
                     devel: true };
        var JS = null;
        try {
            JS = JSLINT;
        } catch (je) {}

        var result = JS ? JS(all, opts) : true;
        var details = '';

        if (result) {
            details = emu + src;
        } else {
            var lines = (setid + emu).split('\n').length + 2;
            var rlines = requires.split('\n').length;

            var error_message = '';
            for (var i in JSLINT.errors) {
                var error = JSLINT.errors[i];
                if (error && error.line >= lines) {
                    var l = error.line - lines + 1;
                    error_message += l > rlines ? 'script: ' : 'require: ';
                    error_message += error.reason.replace(/.$/, '') + ' on line: ' + l + ' at character: ' + error.character + "\n";
                }
            }
            details = "JSLINT output:\n" + error_message;
        }

        if (D || result) {
            console.log("env: ERROR: Syntax error @ '" + script.name + "'!\n" +
                        "##########################\n" +
                        details +
                        "##########################\nERROR: " + e.message + "\n");
            console.log(e.stack);
        } else {
            console.log("env: ERROR: Syntax error @ '" + script.name + "'!\n" + e.message + "\n");
            console.log(e.stack);
        }

        var fail = function() {
            if (D) {
                chromeEmu.extension.sendMessage({ method: "copyToClipboard",
                                                  data: { content: src, type: "test" },
                                                  id: '42'}, function() {});
            }

            throw e;
        };

        window.setTimeout(fail, 1);
        return;
    }
};

/* ######### Eventing ############ */

var loadListeners = [];
var nodeInserts = { events: [], done: {}, running: null};
var nodeInsertListener = [];

var applyEvent = function(event, props, fn, that) {
    var eprops = {
        attrChange: 0,
        attrName: null,
        bubbles: true,
        cancelBubble: false,
        cancelable: false,
        clipboardData: undefined,
        currentTarget: null,
        defaultPrevented: false,
        eventPhase: 0,
        newValue: null,
        prevValue: null,
        relatedNode: null,
        returnValue: true,
        srcElement: null,
        target: null,
        timeStamp: (new Date()).getTime()
    };

    var v = new Event();
    for (var k in eprops) {
        v[k] = eprops[k];
    }

    for (var k in props) {
        v[k] = props[k];
    }

    v.type = event;
    fn.apply(that, [ v ]);
};

var postLoadEvent = function(fn, that) {
    if (V || EV) console.log("env: postLoadEvent!");
    var p = {
        attrName : "null",
        newValue : "null",
        prevValue : "null",
        eventPhase : window.Event.AT_TARGET,
        attrChange: MutationEvent.ADDITION,
        target: document,
        relatedNode: document,
        srcElement: document };
    applyEvent(eLOAD, p, fn, that);
};

var postDomEventListener = function(fn, that) {
    if (V || EV) console.log("env: postDomEventListener!");
    var p = {
        attrName : "null",
        newValue : "null",
        prevValue : "null",
        eventPhase : window.Event.AT_TARGET,
        attrChange: MutationEvent.ADDITION,
        target: document,
        relatedNode: document,
        srcElement: document };

    applyEvent(eDOMCONTENTLOADED, p, fn, that);
};

var refireAllNodeInserts = function(fn, that, sid, onlyDomLoaded) {
    if (!nodeInserts) return;
    if (V || EV) console.log("env: refireAllNodeInserts!");

    var ret = nodeInserts.events.length;
    for (var i=0; i<ret; i++) {
        if (!onlyDomLoaded || nodeInserts.events[i].domContentLoaded) {
            var p = {
                attrName : "",
                newValue : "",
                prevValue : "",
                eventPhase : window.Event.AT_TARGET,
                target: nodeInserts.events[i].event.target,
                relatedNode: nodeInserts.events[i].event.relatedNode,
                srcElement: nodeInserts.events[i].event.srcElement };

            applyEvent(eDOMNODEINSERTED, p, fn, that);
        }

        if (!nodeInserts.running) {
            return;
        }
    }
};

var domLoadedListener = function(node) {
    TMwin.loadHappened = true;
    TMwin.domContentLoaded = true;
    if (V || EV || D) console.log("env: DOMContentLoaded Event!");
    runAllLoadListeners();
};

var domNodeInsertedListener = function(e) {
    if (!TMwin.domNodeInserted && (V || EV || D)) console.log("env: first DOMNodeInserted Event!");
    TMwin.loadHappened = true;
    TMwin.domNodeInserted = true;
    if (nodeInserts) {
        nodeInserts.events.push({ event: e, domContentLoaded: TMwin.domContentLoaded });
    }
};

var loadListener = function(node) {
    TMwin.loadHappened = true;
    if (V || EV || D) console.log("env: load Event!");
};

var cleanup = function() {
    document.removeEventListener(eDOMNODEINSERTED, domNodeInsertedListener, false);
    document.removeEventListener(eDOMCONTENTLOADED, domLoadedListener, false);
    document.removeEventListener(eLOAD, loadListener, false);
    window.removeEventListener('unload', cleanup, false);

    for (var i = 0; i<Clean.length; i++) {
        Clean[i]();
    }
    Clean = null;

    if (chromeEmu.clean) {
        chromeEmu.clean();
    }
};

var runAllLoadListeners = function() {
    if (!TMwin.domContentLoaded) {
        if (V || EV || D) console.log("env: Content not loaded, schedule loadListeners run!");
        return -1;
    }
    var ret = loadListeners.length;
    while (loadListeners.length > 0) {
        var run = function() {
            var fn = loadListeners.shift();
            try {
                window.setTimeout(fn.fn, 1);
            } catch (e) {
                console.log("ERROR: Execution (loadListener) of script env " + fn.name + " failed!" + e.message);
            }
        };
        run();
    }
    return ret;
};

var TM_runASAP = function(fn, sid) {
    fn();
};

var TM_runBody = function(fn, sid) {
    if (!document.body) {
        var waitForBody = function() {
            document.removeEventListener('load', waitForBody, false);
            document.removeEventListener('DOMNodeInserted', waitForBody, false);
            document.removeEventListener('DOMContentLoaded', waitForBody, false);
            TM_runBody(fn, sid);
        };

        document.addEventListener('load', waitForBody, false);
        document.addEventListener('DOMNodeInserted', waitForBody, false);
        document.addEventListener('DOMContentLoaded', waitForBody, false);
    } else {
        var run = function() { fn(); };
        window.setTimeout(run, 1);
    }
};

var TM_addLoadListener = function(fn, sid, name) {
    var li = function() {
        fn();
    };
    loadListeners.push( { fn: li, name: name} );
    if (!TMwin.domNodeInserted && !TMwin.domContentLoaded) {
        if (V || EV || D) console.log("env: schedule for node Insert Event!");
    } else {
        // run this function now and simulate events...
        runAllLoadListeners();
    }
};

function TM_addEventListenerFix() {
    var arr = [ window['HTMLDocument'].prototype, window.__proto__ ];
    var order = [];

    for (var o=0; o<arr.length; o++) {
        var wrap = function() {
            var k = arr[o];
            if (!k.__addEventListener) {
                k.__addEventListener = k.addEventListener;
                k.__removeEventListener = k.removeEventListener;

                k.removeEventListener = function (event, fn, arg1) {
                    if (event == eDOMNODEINSERTED) {
                        if (nodeInserts && nodeInserts.running == fn) {
                            if (EV) console.log("env: detected removeEventListener while refireAllNodeInserts");
                            nodeInserts.running = null;
                        }
                    }

                    this.__removeEventListener(event, fn, arg1);
                };

                k.addEventListener = function (event, fn, arg1) {
                    if (V || EV) console.log("env: addEventListener " + event);

                    var reallyRegister = true;
                    if (event == eLOAD || event == eDOMCONTENTLOADED || event == eDOMNODEINSERTED) {

                        var sid = null;
                        var that = this;
                        try {
                            sid = arguments.callee.getID ? arguments.callee.getID() : 0;
                        } catch (e) {
                            if (D) {
                                console.log("env: Error: event " + event);
                                console.log(e);
                            }
                        }

                        if (V || EV) console.log("env: sid done " + event);

                        var namesp = null;

                        if (sid) {
                            var run = null;

                            // hu, we're called from a userscript context
                            for (var k in TMwin.props) {
                                if (!TMwin.props.hasOwnProperty(k)) continue;
                                if (TMwin.props[k].scriptid == sid.id) {
                                    namesp = k;
                                    break;
                                }
                            }
                            if (event == eLOAD) {
                                if (TMwin.loadHappened) {
                                    run = function() { postLoadEvent(fn, that); };
                                    reallyRegister = false; // event will be fired only once, registering is uuseless and confuses jQuery
                                    order.splice(1, 0, run); // high priority
                                }
                            } else if (event == eDOMCONTENTLOADED) {
                                if (TMwin.domContentLoaded) {
                                    run = function() { postDomEventListener(fn, that); };
                                    reallyRegister = false; // event will be fired only once, registering is uuseless and confuses jQuery
                                    order.push(run);
                                }
                            } else if (event == eDOMNODEINSERTED) {
                                if (nodeInserts && !nodeInserts.done[sid]) {
                                    nodeInserts.done[sid] = true;
                                    run = function() {
                                        var onlyEventsAfterDomLoaded = sid.run_at != 'document-start' && sid.run_at != 'document-body';

                                        nodeInserts.running = fn;
                                        refireAllNodeInserts(fn, that, sid, onlyEventsAfterDomLoaded);

                                        if (nodeInserts.running) {
                                            // if not already de-registered, register after all delayed events are fired to keep events in order
                                            that.__addEventListener(event, fn, arg1);
                                        }

                                        nodeInserts.running = null;
                                    };
                                    order.push(run);
                                }
                            }

                            // avoid confusing listener by adhoc execution
                            if (run) {
                                var exec = function() {
                                    if (order.length) {
                                        var l = order[0];
                                        order = order.slice(1);
                                        l();
                                    }
                                }
                                window.setTimeout(exec, 1);
                                reallyRegister = false; // will be done by run function
                            }
                        }
                    }

                    if (reallyRegister) this.__addEventListener(event, fn, arg1);
                };

                Clean.push(function() {
                               k.removeEventListener = k.__removeEventListener;
                               k.addEventListener =  k.__addEventListener;
                           });
            }
        }

        wrap();
    }
};

/* ######### Fixes ############ */

var TM_functionIdFix_getID = function (cnt) {
    if (cnt === undefined) cnt = 20;
    if (cnt == 0) return null;
    if (!this.__tmid && this.caller && this.caller.getID) {
        var id = this.caller.getID(cnt-1);
        return id;
    }
    return this.__tmid;
};

var TM_functionIdFix_setID = function(id) {
    this.__tmid = id;
    return this;
};

function TM_functionIdFix() {
    if (!Function.prototype.getID) {

        Function.prototype.getID = TM_functionIdFix_getID;
        Function.prototype.setID = TM_functionIdFix_setID;
    }
}

function TM_docEvalFix() {
    var k = 'HTMLDocument';

    if (!window[k].prototype.__evaluate) {
        window[k].prototype.__evaluate = window[k].prototype.evaluate;
        window[k].prototype.evaluate = function(query, elem, arg1, arg2, arg3) {

            if (V) console.log("env: document.evaluate " + query);
            if (!elem) elem = this;
            var res;
            if (typeof XPathResult != "undefined") {
                var div = null;
                var querydiv = query;

                try {
                    res = this.__evaluate(querydiv, elem, arg1, arg2, arg3);
                } catch (e) {
                    if (V) console.log("env: Error: document.evaluate " + JSON.stringify(e));
                }
                var use_tmp_div = true;

                try {
                    use_tmp_div &= !res.snapshotLength;
                } catch (e) {}
                try {
                    use_tmp_div &= !res.singleNodeValue;
                } catch (e) {}

                if (use_tmp_div && query.charAt(0)!='.' && !TM_isPartOfDOM(elem)) {
                    if (V) console.log("env: query added elem for " + querydiv);
                    querydiv = (query.charAt(0) == '/' ? '.' : './') + query;
                    res = this.__evaluate(querydiv, elem, arg1, arg2, arg3);
                } else {
                    if (V) console.log("env: queried document for " + querydiv);
                }
                if (V) {
                    console.log("env: query returned ");
                    console.log(res);
                }
            } else {
                if (V) console.log("env: XPathResult == undefined, but selectNodes via " + xpathExpr);
                res = elem.selectNodes(xpathExpr);
            }

            return res;
        }

        Clean.push(function() {
                       window[k].prototype.evaluate = window[k].prototype.__evaluate;
                   });
    }
};

function TM_windowOpenFix() {
    if (TMwin.use.safeContext) {
        // redefine window.open to a function the returns the DOMWindow of the opened window
        window.open = function(url) {
            var fi = '__o__' + TM_context_id;
            var f = 'window.' + fi + ' = window.open(decodeURI("' + encodeURI(url) + '"));';
            TM_do(f);
            var ret = unsafeWindow[fi];
            delete unsafeWindow[fi];
            return ret;
        };

        Clean.push(function() {
                       window.open = null;
                   });
    }
};

function TM_winEvalFix() {
    if (!TMwin.use.safeContext || window.__setTimeout) return;

    // fake Pitfall #1 (http://bit.ly/Yztwr)
    window.__setTimeout = window.setTimeout;
    window.__setInterval = window.setInterval;

    window.setTimeout = function() {
        var args = arguments;
        var fn = args[0];

        if (typeof fn === 'string') {
            args[0] = function() { TM_do(fn) };
        }

        return __setTimeout.apply(this, args);
    };

    window.setInterval = function() {
        var args = arguments;
        var fn = args[0];

        if (typeof fn === 'string') {
            args[0] = function() { TM_do(fn) };
        }
        return __setInterval.apply(this, args);
    };


    Clean.push(function() {
                   window.setTimeout = window.__setTimeout;
                   window.setInterval = window.__setInterval;
               });
};

/* ######### TM_do ###################### */

var TM_do = function(src) {
    if (TMwin.use.safeContext) {
        var customEvent = document.createEvent("MutationEvent");
        customEvent.initMutationEvent('TM_do' + TM_context_id,
                                      false,
                                      false,
                                      null,
                                      null,
                                      null,
                                      encodeURI(src),
                                      customEvent.ADDITION);
        document.dispatchEvent(customEvent);
        return customEvent.returnValue;
    } else {
        console.log("env: ERROR: assert(use.safeContext)");
    }
};

/* ######### TM/GM Functions ############ */

var TM_registerMenuCommand = function(name, fn) {
    var menuId = TM_context_id + '#' + name;
    var onUnload = function() {
        if (V) console.log("env: unRegisterMenuCMD due to unload " + fn.toString());
        chromeEmu.extension.sendMessage({method: "unRegisterMenuCmd", name: name, id: menuId}, function(response) {});
    };
    var resp = function(response) {
        // response is send, command is unregisterd @ background page
        window.removeEventListener('unload', onUnload, false);
        if (response.run) {
            if (V) console.log("env: execMenuCmd " + fn.toString());
            window.setTimeout(function () { fn(); }, 1);
            // re-register for next click
            TM_registerMenuCommand(name, fn);
        }
    };
    window.addEventListener('unload', onUnload, false);
    if (V) console.log("env: registerMenuCmd " + fn.toString());
    chromeEmu.extension.sendMessage({method: "registerMenuCmd", name: name, id: TM_context_id, menuId: menuId}, resp);
};

var TM_openInTab = function(url, options) {
    // retrieve tabId to have a chance of closing this window lateron
    var tabId = null;
    var close = function() {
        if (tabId === null) {
            // re-schedule, cause tabId is null
            window.setTimeout(close, 500);
        } else if (tabId > 0) {
            chromeEmu.extension.sendMessage({method: "closeTab", tabId: tabId, id: TM_context_id}, resp);
            tabId = undefined;
        } else {
            if (D) console.log("env: attempt to close already closed tab!");
        }
    };
    var resp = function(response) {
        tabId = response.tabId;
    };
    if (url && url.search(/^\/\//) == 0) {
        url = location.protocol + url;
    }
    chromeEmu.extension.sendMessage({method: "openInTab", url: url, id: TM_context_id, options: options }, resp);
    return { close: close };
};

var TM_xmlhttpRequest = function(details) {
    var forget = false;

    var callit = function(fn, arg) {
        var run = function() {
            fn(arg);
        };
        if (fn && !forget) window.setTimeout(run, 1);
    };

    var xmlhttp2 = !!details.responseType;
    if (/* TMwin.use.safeContext */ xmlhttp2) {
        var load = function(r) {
            callit(details["onload"], r);
        };
        var readystatechange = function(r) {
            callit(details["onreadystatechange"], r);
        };
        var error = function(r) {
            callit(details["onerror"], r);
        }

        chromeEmu.xmlHttpRequest(details, load, readystatechange, error);
    } else {
        var port = chromeEmu.extension.connect('xhr_' + TM_context_id);
        port.postMessage({ method: "xhr", details: details, id: TM_context_id });

        var plist = function(response) {
            try {
                if (response.success) {
                    if (details["onload"]) {
                        if (response.data.responseXML) response.data.responseXML = unescape(response.data.responseXML);
                        callit(details["onload"], response.data);
                    }
                } else if (response.change) {
                    if (details["onreadystatechange"]) {
                        callit(details["onreadystatechange"], response.data);
                    }
                } else {
                    if (details["onerror"]) {
                        callit(details["onerror"], response.data);
                    }
                }
            } catch (e) {
                console.log("env: Error: TM_xmlhttpRequest - " + e.message + "\n" + JSON.stringify(details));
            }
        };

        port.onMessage.addListener(plist);
        var omsg = function(response) { console.log("env: onDisconnect! :)")};
        if (V) port.onDisconnect.addListener(omsg);
    }

    return { abort: function() { forget = true; } };
}

var TM_getTab = function(cb) {
    chromeEmu.extension.sendMessage({method: "getTab", id: TM_context_id}, function(response) {
                                        if (cb) {
                                            cb(response.data);
                                        }
                                    });
};

var TM_saveTab = function(tab) {
    chromeEmu.extension.sendMessage({method: "saveTab", id: TM_context_id, tab: tab}, function(response) {});
};

var TM_getTabs = function(cb) {
    chromeEmu.extension.sendMessage({method: "getTabs", id: TM_context_id}, function(response) {
                                     if (cb) {
                                         cb(response.data);
                                     }
                                 });
};

var TM_installScript = function(url, cb) {
    chromeEmu.extension.sendMessage({method: "scriptClick", url: url, id: TM_context_id}, function(response) { if (cb) cb(response); });
};

/* ######### Helpers  ############ */

var HTM_generateScriptId = function(){
    var ret = '';
    ret += ((new Date()).getTime().toString());
    ret += Math.floor ( Math.random ( ) * 6121983 + 1 )
    return ret;
};

var HTM_runMyScript = function(HTM_request) {
    var TM_storage_listeners = [];
    var TM_context_storage = HTM_request.storage;
    var TM_context_name = HTM_request.script.name;
    var HTM_script = HTM_request.script;
    var nop = function(response) {};
    var storagePort = null;

    var HTM_getInfo = function() {
        var excl = { 'observers' : 1,
                     'id': 1,
                     'enabled': 1,
                     'hash' : 1,
                     'fileURL' : 1 };
        var o = { script: {} };

        for (var k in HTM_script) {
            if (!HTM_script.hasOwnProperty(k) || excl[k]) continue;
            o.script[k] = HTM_script[k];
        }

        // GM_info compatibility
        o.script['run-at'] = HTM_script['options'].override.run_at || HTM_script['options'].run_at;
        o.script['excludes'] = HTM_script['options'].override.orig_excludes;
        o.script['includes'] = HTM_script['options'].override.orig_includes;
        o.script['matches'] = HTM_script['options'].override.orig_includes;
        o.script['unwrap'] = false;

        o['scriptMetaStr'] = HTM_request.header;
        o['scriptSource'] = HTM_request.code;
        o['scriptWillUpdate'] = !!(HTM_script['options'].fileURL && HTM_script['options'].fileURL != "");
        o['scriptUpdateURL'] = HTM_script['options'].fileURL;
        o['version'] = HTM_request.version;
        o['scriptHandler'] = "Tampermonkey";

        return o;
    };

    var HTM_initStoragePort = function() {
        var storageListener = function(response) {
            if (response.storage) {
                for (var k in response.storage.data) {
                    if (!response.storage.data.hasOwnProperty(k)) continue;
                    var run = function() {
                        var key = k;
                        var oldval = TM_context_storage.data[k];
                        TM_context_storage.data[k] = response.storage.data[k];
                        var newval = TM_context_storage.data[k];
                        if (V) console.log("env: storageListener - config key " + key + ": " + oldval + " -> " + newval);
                        TM_notifyValueChangeListeners(key, oldval, newval, true);
                    };
                    run();
                }
            }
            if (response.removed) {
                TM_context_storage[response.removed] = undefined;
            }
            if (response.error) {
                console.log("env: Error: storage listener... :(");
            }
        };

        storagePort = chromeEmu.extension.connect('storageListener_' + TM_context_id);
        storagePort.onMessage.addListener(storageListener);
        var omsg = function(response) { console.log("env: storageListener onDisconnect! :)")};
        if (V) storagePort.onDisconnect.addListener(omsg);

        storagePort.postMessage({ method: "addStorageListener", name: TM_context_name, id: TM_context_id});
    };

    HTM_initStoragePort();

    var HTM_removeStorageListener = function() {
        storagePort.postMessage({ method: "removeStorageListener", name: TM_context_name, storage: TM_context_storage, id: TM_context_id});
    };

    var HTM_saveStorageKey = function(key) {
        storagePort.postMessage({ method: "saveStorageKey",
                                  name: TM_context_name,
                                  key: key,
                                  value: TM_context_storage.data[key],
                                  id: TM_context_id,
                                  ts: TM_context_storage.ts });
        if (V) console.log("env: saveStorageKey - config key " + key + ": " + TM_context_storage.data[key]);
    };

    var TM_saveStorageKey = function(key) {
        HTM_saveStorageKey(key);
    };

    var TM_notifyValueChangeListeners = function(name, oldVal, newVal, remote) {
        if (oldVal == newVal) return;
        for (var i in TM_storage_listeners) {
            if (!TM_storage_listeners.hasOwnProperty(i)) continue;
            var n = TM_storage_listeners[i];
            if (n && n.key == name) {
                if (n.cb) {
                    try {
                        n.cb(name, oldVal, newVal, remote);
                    } catch (e) {
                        if (D) console.log("env: value change listener of '" + name + "' failed with: " + e.message);
                    }
                }
            }
        }
    };

    var TM_addValueChangeListener = function(name, cb) {
        var id = 0;
        for (var n in TM_storage_listeners) {
            if (!TM_storage_listeners.hasOwnProperty(n)) continue;
            var i = TM_storage_listeners[n];
            if (n.id > id) {
                id = n.id;
            }
        }
        id++;
        var s = { id: id, key: name, cb: cb};
        TM_storage_listeners.push(s);
        return id;
    };

    var TM_removeValueChangeListener = function(id) {
        for (var n in TM_storage_listeners) {
            if (!TM_storage_listeners.hasOwnProperty(n)) continue;
            var i = TM_storage_listeners[n];
            if (n.id == id) {
                delete TM_storage_listeners[n];
                return true;
            }
        }
    };

    var TM_deleteValue = function(name) {
        var old = TM_context_storage.data[name];
        TM_context_storage.ts = (new Date()).getTime();
        delete TM_context_storage.data[name];
        TM_saveStorageKey(name);
        TM_notifyValueChangeListeners(name, old, TM_context_storage.data[name], false);
    };

    var TM_listValues = function() {
        var ret = new Array();
        for (var n in TM_context_storage.data) {
            if (!TM_context_storage.data.hasOwnProperty(n)) continue;
            ret.push(n);
        }
        return ret;
    };

    var TM_getValue = function(name, defaultValue) {
        var value = TM_context_storage.data[name];
        if (!value) {
            return defaultValue;
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
                  console.log("env: TM_getValue: " + e);
                      return defaultValue;
              }
          default:
              return value;
        }
    };

    var TM_setValue = function(name, value) {
        var old = TM_context_storage.data[name];

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

        TM_context_storage.ts = (new Date()).getTime();
        TM_context_storage.data[name] = value;

        TM_saveStorageKey(name);
        TM_notifyValueChangeListeners(name, old, TM_context_storage.data[name], false);
    };

    var TM_getResourceText = function(name) {
        for (var k in HTM_script.resources) {
            var r = HTM_script.resources[k];
            if (r.name == name) {
                return r.resText;
            }
        }
        return null;
    };

    var TM_getResourceURL = function(name) {
        for (var k in HTM_script.resources) {
            var r = HTM_script.resources[k];
            if (r.name == name) {
                return r.resURL;
            }
        }
        return null;
    };

    var TM_log = function(message) {
        if (window.console) {
            window.console.log(message);
        } else {
            console.log(message);
        }
    };

    var TM_addStyle = function(css) {
        try {
            var style = document.createElement('style');
            style.textContent = css;
            (document.head || document.body || document.documentElement || document).appendChild(style);
        } catch (e) {
            console.log("Error: env: adding style " + e);
        }
    };

    var TM_notification = function(msg, title, image, cb, delay) {
        if (!title) title = TM_context_name;
        if (image == undefined) {
            image = HTM_request.script.icon ? HTM_request.script.icon : HTM_request.script.icon64
        }
        var noti = function(response) {
            if (response.clicked && cb) cb();
        };
        chromeEmu.extension.sendMessage({method: "notification", delay: delay, msg: msg, image: image, title: title, id: TM_context_id},
                                        noti);
    };

    var TM_setClipboard = function(content, type, cb) {
        if (!type) type = 'text';
        var done = function(response) {
            if (cb) cb();
        };
        chromeEmu.extension.sendMessage({ method: "copyToClipboard",
                                          data: { content: content, type: type },
                                          id: TM_context_id}, done);
    };

    var TM_runNative = function(fn, args) {
        return TM_execUnsafe(fn, args);
    };

    var TM_execUnsafe = function(fn, args) {
        var id = '__u__' + Math.floor ( Math.random() * 06121983 + 1);
        unsafeWindow[id] = fn;
        unsafeWindow[id + '_'] = args;
        var r = TM_do('window["' + id + '"].apply(this, window["' + id + '_"])');
        delete unsafeWindow[id];
        return r;
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

        this.GM_addValueChangeListener = function(name, cb) {
            return TM_addValueChangeListener(name, cb)
        };

        this.GM_removeValueChangeListener = function(id) {
            return TM_removeValueChangeListener(id)
        };

        this.GM_log = function(message) {
            return TM_log(message);
        };

        this.GM_registerMenuCommand = function(name, funk) {
            return TM_registerMenuCommand(name, funk);
        };

        this.GM_openInTab = function(url, options) {
            return TM_openInTab(url, options);
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

        this.GM_notification = function(msg, title, icon, callback, delay) {
            return TM_notification(msg, title, icon, callback, delay);
        };

        this.GM_installScript = function(url, callback) {
            return TM_installScript(url, callback);
        };

        this.GM_getTab = function(callback) {
            return TM_getTab(callback);
        };

        this.GM_saveTab = function(tab) {
            return TM_saveTab(tab);
        };

        this.GM_getTabs = function(callback) {
            return TM_getTabs(callback);
        };

        this.GM_setClipboard = function(data, type, callback) {
            return TM_setClipboard(data, type, callback);
        };

        this.GM_info = HTM_getInfo();
    };

    var undefined = TMwin.undefined;
    if (TMwin.props[HTM_script['namespace']] == undefined) {
        TMwin.props[HTM_script['namespace']] = { scriptid: HTM_request.script.id, context: function () {}, elements: [] };

        Clean.push(function() {
                       TMwin.props[HTM_script['namespace']] = null;
                   });
    }

    if (!TMwin.use.safeContext) {
        // create some key elements in case the content page window can't do this for us
        var unsafe = { window : window };

        for (var k in unsafe) {
            if (!unsafe.hasOwnProperty(k)) continue;
            var run = function() {
                var cc = k.replace(/^(.)/g, function($1) { return $1.toUpperCase(); });
                TMwin.props[HTM_script['namespace']].elements.push({ name: 'unsafe' + cc, value: unsafe[k] });
            };
            run();
        }
    }

    TMwin.props[HTM_script['namespace']].elements.push({ name: 'CDATA',  value: function(arg) { this.src = arg; this.toString = function() { return this.src; }; this.toXMLString = this.toString }});
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'uneval', value: function(arg) { try { return "\$1 = " + JSON.stringify(arg) + ";"; } catch (e) { console.log(e) } } });

    // backup some key elements
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'console',  value: console, type: eBACKUP });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'JSON',  value: JSON, type: eBACKUP });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'document', value: window.document, type: eBACKUP });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'location', value: window.location, type: eBACKUP });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'undefined', value: undefined, type: eBACKUP });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'top', value: "window.unsafeTop", overwrite: true });

    // TM fns
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_addStyle', value: TM_addStyle });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_deleteValue', value: TM_deleteValue });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_listValues', value: TM_listValues });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_getValue', value: TM_getValue });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_log', value: TM_log });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_registerMenuCommand', value: TM_registerMenuCommand });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_openInTab', value: TM_openInTab });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_setValue', value: TM_setValue });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_addValueChangeListener', value: TM_addValueChangeListener });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_removeValueChangeListener', value: TM_removeValueChangeListener });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_xmlhttpRequest', value: TM_xmlhttpRequest });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_setClipboard', value: TM_setClipboard });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_getTab', value: TM_getTab });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_saveTab', value: TM_saveTab });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_getTabs', value: TM_getTabs });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_installScript', value: TM_installScript });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_runNative', value: TM_runNative });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_execUnsafe', value: TM_execUnsafe });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_notification', value: TM_notification });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_getResourceText', value: TM_getResourceText, scriptid: HTM_script.id });
    TMwin.props[HTM_script['namespace']].elements.push({ name: 'TM_getResourceURL', value: TM_getResourceURL, scriptid: HTM_script.id });

    // GM fns
    var e = new GM_EMU();
    for (var k in e) {
        TMwin.props[HTM_script['namespace']].elements.push({ name: k, value: e[k] });
    }

    if (HTM_script.options.compat_prototypes) {
        if (V || D) console.log("env: option: add toSource");

        if (!Object.prototype.toSource) {
            Object.defineProperties(Object.prototype,
                { 'toSource':
                    {
                        value: function() {
                            return "JSON.parse(unescape('" + escape(JSON.stringify(this)) + "'));";
                        },
                        enumerable: false,
                        writable: true,
                        configurable: true,
                    },
                });
        }

        if (V || D) console.log("env: option: add some array generics");

        var fns = ["indexOf", "lastIndexOf", "filter", "forEach", "every", "map", "some", "slice"];
        fns.forEach(function(funcName) {
                        if (typeof Array[funcName] !== "function") {
                            var obj = {};
                            obj[funcName] = {
                                value: function(arraylikeObj) {
                                    return Array.prototype[funcName].apply(arraylikeObj, Array.prototype.slice.call(arguments, 1))
                                },
                                enumerable: false,
                                writable: true,
                                configurable: true,
                            };

                            Object.defineProperties(Array, obj);
                        }
                    });
    }

    if (V || D) console.log("env: execute script " + HTM_script.name + " now!");
    TM_mEval(HTM_script, HTM_request.code, HTM_request.requires, TMwin.props[HTM_script['namespace']]);

    Clean.push(function() {
                   HTM_removeStorageListener();
                   try {
                       storagePort.disconnect();
                       storagePort = null;
                   } catch (e) {}
                   TM_storage_listeners = null;
                   HTM_request = null;
               });

    return HTM_script.options.used_events;
};

/* ######### Request Listener ############ */

chromeEmu.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (V || EV) console.log("env: request.method " + request.method + " id: " + request.id);

        if (request.id && request.id != TM_context_id) {
            console.log("env: Not for me! " + TM_context_id + "!=" + request.id);
            return;
        }
        var topframe = window.self == window.top;

        if (request.method == "executeScript") {
            var r = function() {
                HTM_runMyScript(request);
                sendResponse({});
            };
            if (request.script.options.run_at == 'document-start') {
                if (D) console.log("env: run '" + request.script.name + "' ASAP -> document-start");
                TM_runASAP(r, request.script.id);
            } else if (request.script.options.run_at == 'document-body') {
                if (D) console.log("env: schedule '" + request.script.name + "' for document-body");
                TM_runBody(r, request.script.id);
            } else {
                if (D) console.log("env: schedule '" + request.script.name + "' for document-end");
                TM_addLoadListener(r, request.script.id, request.script.name);
            }
        } else if (request.method == "onLoad") {
            // hu! we're loaded! check if there are remaining listeners and setDomContentLoaded to true!
            TMwin.domContentLoaded = true;
            runAllLoadListeners();
            sendResponse({});
            window.setTimeout(function() { if (V || EV) console.log("env: disable nodeInserts magic!"); nodeInserts = null }, 2000);
        } else if (topframe) {
            if (request.method == "loadUrl") {
                window.location = request.url;
                sendResponse({});
            } else if (request.method == "reload") {
                window.location.reload();
                sendResponse({});
            } else if (request.method == "confirm") {
                var ask = function() {
                    var c = confirm(request.msg);
                    sendResponse({confirm: c});
                }
                window.setTimeout(ask, 100);
            } else if (request.method == "showMsg") {
                var ask = function() {
                    var t = function() {
                        alert(request.msg);
                    };
                    window.setTimeout(t, 1);
                    sendResponse({});
                }
                window.setTimeout(ask, 100);
            } else if (request.method == "getSrc") {
                var t = '';
                var bodies = document.getElementsByTagName('body');
                if (bodies.length > 0) {
                    var body = bodies[0];
                    t = body.innerText;
                } else {
                    t = document.innerHTML;
                }
                sendResponse({src: t});

            } else {
                console.log("env: unknown method " + request.method);
            }
        }
    });

/* ######### Run ############ */

TM_docEvalFix();
TM_functionIdFix.apply(window, []);
TM_addEventListenerFix();
TM_windowOpenFix();
TM_winEvalFix();

document.addEventListener(eDOMNODEINSERTED, domNodeInsertedListener, false);
document.addEventListener(eDOMCONTENTLOADED, domLoadedListener, false);
document.addEventListener(eLOAD, loadListener, false);
window.addEventListener('unload', cleanup, false);

if (V || D) console.log("env: initialized (content, id:" + TM_context_id + ", " + window.location.origin + window.location.pathname + ") ");

});
