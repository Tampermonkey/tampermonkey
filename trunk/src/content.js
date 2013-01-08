/**
 * @filename content.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

if (window.self != window.top &&
    window.location.href.search('file:\/\/') == 0 &&
    window.location.href.search('gimmeSource=1') != -1) {

    var getSource = function(elem) {
        if (elem.childNodes.length > 0) {
            return getSource(elem.childNodes[elem.childNodes.length - 1]);
        } else {
            return elem.innerText;
        }
    };

    var sendResp = function(event) {
        var data = JSON.parse(event.data);
        var content = null;

        // TODO: getSource might be unnecessary since usage of body.innerText !?
        if (document.body) {
            content = document.body.innerText;
        } else {
            content = getSource(document);
        }

        var s = JSON.stringify({ content: content, id: data.id });
        // event.srcElement.postMessage(s, event.origin);
        // event.returnValue = s;

        var req = { method: "localFileCB", data: s };
        chrome.extension.sendMessage(req, function() {});
        window.removeEventListener('message', sendResp, false);
    };

    window.addEventListener('message', sendResp, false);
} else {

// global (by emulation used) variables
var _background = true;
var _webRequest = {};
var Converter;
var Eventing;

var D = false;
var V = false;
var EV = false;
var EMV = false;
var ENV = false;
var TS = false;
var CV =  false;

(function() {

var eDOMATTRMODIFIED = "DOMAttrModified";
var XMLHttpRequest = window.XMLHttpRequest;

var use = { safeContext: true, scriptBlocker: false };
var logLevel = null;
var allReady = false;
var wannaRun = false;
var domLoaded = false;
var nodeInserted = false;
var Clean = [];

var adjustLogLevel = function() {
    D |= (logLevel >= 60);
    V |= (logLevel >= 80);
    EV |= (logLevel >= 100);
    ENV |= (logLevel >= 100);
    EMV |= (logLevel >= 100);
    TS |= (logLevel >= 100);
};

/* ######## include #### */

Registry.require("xmlhttprequest");
Registry.require("convert");
Registry.require("helper");

var emu = null;
var env = null;
var jslint = "";

var xmlhttpRequestHelper = Registry.get('xmlhttprequest');
var xmlhttpRequest = xmlhttpRequestHelper.run;
var Helper = Registry.get('helper');
Converter = Registry.get('convert');

/* ######## eventing #### */
var domContentLoaded = function() {
    if (V || EV || D) console.log("content: detected DOMContentLoaded " + Eventing.contextId);
    domLoaded = true;
    // help if domcontentloader listener is not installed at the page :-/
    if (allReady) _handler.sendMessage("domContentLoaded = true; if (typeof runAllLoadListeners !== 'undefined') runAllLoadListeners();");
};

var domNodeInserted = function(node) {
    if (!nodeInserted) {
        if (V || EV || D) console.log("content: first DOMNodeInserted " + Eventing.contextId);
        nodeInserted = true;
    }
};

var _handler = {
    responses : {},
    initstate : 0,
    sendMessage : function(msg) {
        var is = "";
        if (this.initstate == 0) {
            /* narf this breaks gmail and co :(
            is += "(function() {\n";
            is += "    window.TMJSON = JSON;\n";
            is += "})();\n";
            window.location = "javascript:" + is;
            */
            this.initstate = 1;
        } else if (this.initstate == 1) {
            is += "var ENV = " + (ENV ? "true" : "false") +";\n";
            is += "var TS = " + (TS ? "true" : "false") +";\n";
            is += "var Converter = " + Helper.serialize(Converter) + ";\n";
            is += "var TMwin = { backup: {}, use: " + JSON.stringify(use) + " };\n";
            is += "var TMJSON = JSON;\n";
            is += "var _background = false;\n";
            is += "var console = window['console'];\n";
            is += "var JSON = window['JSON'];\n";
            is += "function JSONcheck() {\n";
            is += "        if (!JSON.parse || JSON.parse != 'function parse() { [native code] }') {\n";
            is += "              if (TMJSON && TMJSON.parse == 'function parse() { [native code] }') {\n";
            is += "                  JSON = TMJSON;\n";
            is += "                  console.log('page: use JSON backup');\n";
            is += "              } else {\n";
            is += "                  JSON = window.JSON;\n";
            is += "                  console.log('page: use JSON fallback');\n";
            is += "              }\n";
            is += "        } else if (ENV) { \n";
            is += "            console.log('page: JSON is fine');\n";
            is += "        }\n";
            is += "};\n";
            is += "JSONcheck();\n";
            is += "var Eventing = " + Helper.serialize(Eventing).replace('___eval___', 'eval') /* do a little trick to allow YUI compression */  + ";\n";
            is += "Eventing.init();\n";
            is += "function cleanup(evt) {\n";
            is += "    Eventing.cleanup();\n";
            is += "    window.removeEventListener('unload', cleanup, false);\n";
            is += "    delete Eventing;\n";
            is += "    delete TMJSON;\n";
            is += "    delete TMwin;\n";
            is += "    delete Converter;\n";
            is += "    delete TS;\n";
            is += "    delete ENV;\n";
            is += "};\n";
            is += "window.addEventListener('unload', cleanup, false);\n";
            is += "if (ENV) console.log('page: env initialized (" + Eventing.contextId+ ")');\n";

            if (!use.safeContext) {
                is += "function removeScriptTag() {\n";
                is += "    var st = document.getElementById('TM_script_tag_"+Eventing.contextId+"');\n";
                is += "    if (st && st.parentNode) {\n";
                is += "        if (ENV) console.log('page: script tag cleanup ("+Eventing.contextId+")');\n";
                is += "        st.parentNode.removeChild(st);\n";
                is += "    }\n";
                is += "};\n";
                is += "removeScriptTag();\n";

                var s = document.createElement('script');
                s.textContent = "(function TM_mother() { " + is + "\n" + msg + "})();";
                s.setAttribute('name', "TM_internal");
                s.setAttribute('id', "TM_script_tag_"+Eventing.contextId);

                (document.head || document.body || document.documentElement || document).appendChild(s);
            } else {
                window['eval']("(function TM_mother() { " + is + "\n" + msg + "})();");
            }
            this.initstate = 2;
        } else if (this.initstate == 2) {
            Eventing.fireEvent(msg);
        }
    },
    getResponseId : function(callback) {
        var id = 0;
        if (callback) {
            while (id == 0 || _handler.responses[id] != undefined) {
                id = (new Date()).getTime() + Math.floor ( Math.random ( ) * 6121983 + 1 );
            }
            _handler.responses[id] = callback;
            if (V) console.log("content: registerResponseId " + id);
        }
        return id;
    },
    runResponse: function (responseId, args) {
        if (V) console.log("content: runResponse " + responseId + " -> " + Converter.decode(args));
        for (var k in _handler.responses) {
            if (k == responseId) {
                var p = "";
                try {
                    p = JSON.parse(Converter.decode(args));
                    if (!_handler.responses[k]) {
                        console.log("Warn: content: responseId " + k + " is undefined!!!");
                    } else {
                        _handler.responses[k](p);
                    }
                } catch (e) {
                    console.log("content: Json parse error (runResponse):" + e + "\n" + args);
                }
                _handler.responses[k] = null;
                return;
            }
        }
        console.log("WARN: responseId " + responseId + " not found!");
    }
};

var tmCE = {
    ports: {},
    log: function(text) {
        if (_background) {
            console.log("content: " + text);
        } else {
            Eventing.fireEvent({ fn: "log", args: "page: " + text });
        }
    },

    onContentResponse: function(key, tabId, responseId, json) { // (String key, int tabId, long responseId, String json) {
        if (_background) {
            if (V) this.log("onContentResponse " + this.id + " " + responseId + " " + json);
            _handler.runResponse(responseId, Converter.encode(json));
        } else {
            var a = arguments;
            Eventing.fireEvent({ fn: "onContentResponse", args: a });
        }
    },

    onResponse: function(key, tabId, responseId, json) { // (String key, int tabId, long responseId, String json) {
        if (_background) {
            try {
                if (V) this.log("onResponse " + this.id + " " + responseId + " " + json);
                var j = Converter.encode(json);
                var l = "if (TMwin.chromeEmu) TMwin.chromeEmu.runResponse(" + responseId + ", \"" + j + "\")";
                _handler.sendMessage(l);
                j = '';
                l = '';
            } catch (e) {
                console.log("Error: processing onResponse");
            }
        } else {
            var a = arguments;
            Eventing.fireEvent({ fn: "onResponse", args: a });
        }
    },

    onConnectResponse: function(key, tabId, responseId, json) { // (String key, int tabId, long responseId, String json) {
        if (_background) {
            try {
                if (V) this.log("onConnectResponse " + this.id + " " + responseId + " " + json);
                var j = Converter.encode(json);
                var l = "if (TMwin.chromeEmu) TMwin.chromeEmu.runConnectResponse(" + responseId + ", \"" + j + "\")";
                _handler.sendMessage(l);
                j = '';
                l = '';
            } catch (e) {
                console.log("Error: processing onConnectResponse");
            }
        } else {
            var a = arguments;
            Eventing.fireEvent({ fn: "onConnectResponse", args: a });
        }
    },

    onContentRequest : function(request, sender, responseId) {
        if (_background) {
            if (V) this.log("onContentRequest " + this.id + " " + responseId + " " + JSON.stringify(request));
            if (request.id && this.id && request.id != this.id) {
                if (V) this.log("filter: " + request.id + "!=" +  this.id);
                return;
            }
            var j = Converter.encode(JSON.stringify({ sender: sender, request: request}));
            var l = "if (TMwin.chromeEmu) TMwin.chromeEmu.runContentRequest(" + responseId + ", \"" + j + "\", 0);";
            _handler.sendMessage(l);
            j = '';
            l = '';
        } else {
            console.log("Warn: onContentRequest from non BG not supported");
        }
    },

    onMessage : function(request, sender, responseId) {
        if (_background) {
            if (V) this.log("onMessage " + this.id + " " + responseId + " " + JSON.stringify(request));
            if (request.id && this.id && request.id != this.id) {
                if (V) this.log("filter: " + request.id + "!=" +  this.id);
                return;
            }
            var j = Converter.encode(JSON.stringify({ sender: sender, request: request}));
            var l = "if (TMwin.chromeEmu) TMwin.chromeEmu.runRequest(" + responseId + ", \"" + j + "\", 0)";
            _handler.sendMessage(l);
            j = '';
            l = '';
        } else {
            // var a = arguments;
            // Eventing.fireEvent({ fn: "onMessage", args: a });
            console.log("Warn: onMessage from non BG not supported");
        }
    },

    xmlHttpRequest: function(key, details, responseId) {
        if (_background) {
            if (V) this.log("xmlHttpRequest " + this.id + " " + responseId + " " + JSON.stringify(details));
            var obj = JSON.parse(details);
            if (obj.q_id) {
                var q = obj.q_id;
                obj = window[q];
                delete window[q];
            }

            var load = function(r) {
                // TODO: Waaaaaaaaaaahhhhhhhhh, bypass special objects like ArrayBuffer, cause they are destroyed when sent by an event
                var id = '__x__' + Math.floor ( Math.random() * 06121983 + 1 );
                window[id] = r.response;
                r.response = null;
                tmCE.onConnectResponse(key, 0, responseId, JSON.stringify( { onLoad : true, response: r, r_id: id }));
            };
            var readystatechange = function(r) {
                tmCE.onConnectResponse(key, 0, responseId, JSON.stringify( { onReadyStateChange : true, response: r }));
            };
            var error = function(r) {
                tmCE.onConnectResponse(key, 0, responseId, JSON.stringify( { onError: true, response: r }));
            }
            var done = function(r) {
                // add 'onDisconnect' to cleanup all emulation layer listeners
                tmCE.onConnectResponse(key, 0, responseId, JSON.stringify( { onDone : true, onDisconnect: true, response: r }));
            }
            xmlhttpRequest(obj, load, readystatechange, error, done);
        } else {
            var a = arguments;
            Eventing.fireEvent({ fn: "xmlHttpRequest", args: a });
        }

    },

    runUpdateListener: function() { // (int tabId, String details, String url) {
        console.log("WARN: not supported!");
    },

    getUrl: function() { // (String key, String file) {
        console.log("WARN: not supported!");
    },

    sendExtensionMessage: function(key, json, responseId) { //(String key, String json, long responseId) {
        if (_background) {
            if (V) this.log("sendExtensionMessage " + this.id + " " + responseId + " " + json);
            var response = function(resp) {
                tmCE.onResponse(key, 0, responseId, JSON.stringify(resp));
            };
            var obj = JSON.parse(json);
            obj.responseId = responseId;
            chrome.extension.sendMessage(obj, response);
            obj = null;
        } else {
            var a = arguments;
            Eventing.fireEvent({ fn: "sendExtensionMessage", args: a });
        }
    },

    sendExtensionConnect: function(key, json, responseId) { //(String key, String json, long responseId) {
        if (_background) {
            var obj = JSON.parse(json);
            obj.responseId = responseId;

            if (V) this.log("sendExtensionConnect " + this.id + " " + responseId + " " + json);
            var oMresponse = function(resp) {
                tmCE.onConnectResponse(key, 0, responseId, JSON.stringify({ onMessage: true, msg: resp }));
            };
            var oDresponse = function(resp) {
                tmCE.onConnectResponse(key, 0, responseId, JSON.stringify({ onDisconnect: true }));
                obj = null;
            };

            var port = chrome.extension.connect({name: obj});
            port.onMessage.addListener(oMresponse);
            port.onDisconnect.addListener(oDresponse);
            tmCE.ports[responseId] = port;
        } else {
            var a = arguments;
            Eventing.fireEvent({ fn: "sendExtensionConnect", args: a });
        }
    },

    sendExtensionPortMessage: function(key, json, responseId) { //(String key, String json, long responseId) {
        if (_background) {
            if (V) this.log("sendExtensionPortMessage " + this.id + " " + responseId + " " + json);
            var port = tmCE.ports[responseId];
            if (!port) {
                this.log("Error: sendExtensionPortMessage unable to find port " + responseId);
            } else {
                var obj = JSON.parse(json);
                obj.responseId = responseId;
                port.postMessage(obj);
                obj = null;
            }
        } else {
            var a = arguments;
            Eventing.fireEvent({ fn: "sendExtensionPortMessage", args: a });
        }
    },

    sendTabsRequest: function() { // (String key, int tabId, String json, long responseId) {
        console.log("WARN: not supported!");
    },

    createTab: function () { // (String key, String json) {
        console.log("WARN: not supported!");
    },

    getSelected: function () { //(String key, String json, long responseId) {
        console.log("WARN: not supported!");
    },

    updateTab: function () { //(String key, String tabId, String json) {
        console.log("WARN: not supported!");
    },

    onUpdated: function () { //() {
        console.log("WARN: not supported!");
    },

    getMessage: function () { //(String key, String json) {
        console.log("WARN: not supported!");
    },

    storageKey: function () { //(String key, String id) {
        console.log("WARN: not supported!");
    },

    storageRemoveItem: function () { //(String key, String vkey) {
        console.log("WARN: not supported!");
    },

    storageSetItem: function () { //(String key, String vkey, String value) {
        console.log("WARN: not supported!");
    },

    storageGetItem: function () { //(String key, String vkey) {
        console.log("WARN: not supported!");
    },

    storageLength: function () { //(String key) {
        console.log("WARN: not supported!");
    }
};

/* ######## init unsafe ##### */
var initUnsafe = function() {
    if (use.safeContext) {
        // use it to avoid attacks in case the pages scripts are alredy running!
        var id = '';
        var get = { 'window' : { forceUnsafe: true },
                    'top': { forceUnsafe: true}, // top is marked as writable, but isn't
                    'frames': {},
                    'parent' : {},
                    'opener': {} };
        var props = '';

        var c=0;
        for (var k in get) {
            if (!get.hasOwnProperty(k)) continue;
            if (c != 0) props += ', ';
            props += k + ':' + k;
            c++;
        }

        var yippieYeah = document.createElement("div");
        var unsafeWindow = null;
        try {
            yippieYeah.setAttribute("onclick", "return {" + props + "};");
            var ret = yippieYeah.onclick();
            unsafeWindow = ret.window;
        } catch (e) {
            unsafeWindow = window;
            use.scriptBlocker = true;
            console.log("content: unsafeWindow retrieval failed! Do you use a script blocker like ScriptNo?");

            // http://code.google.com/p/chromium/issues/detail?id=111522
            var response = function(resp) {
                if (resp.alert) {
                    // TODO: alert on response breaks Chrome event magic, but setTimeout doesn't work because of the script blocker :(
                    alert(resp.alert);
                }
            };
            var req = { method: "scriptBlockerDetected",
                        id: Eventing.contextId,
                        url: window.location.origin + window.location.pathname,
                        params: window.location.search + window.location.hash };

            chrome.extension.sendMessage(req, response);
        }

        yippieYeah.setAttribute("onclick", null);
        yippieYeah.onclick = null;
        yippieYeah = null;

        var fi = '__o__' + id;
        var f = 'window.' + fi + ' = {' + props + '};';

        // to be on the safe side: register an unsafe event handler to be able to workaround some Chrome security issues
        var is = '';
        is += "function eventHandler(evt) {\n";
        is += "    try {\n";
        is += "        eval(decodeURI(evt.attrName))\n";
        is += "    } catch (e) {}\n";
        is += "    evt = null;\n";
        is += "};\n";
        is += "document.addEventListener('TM_do"+Eventing.contextId+"', eventHandler, false);\n";
        f += is;

        var s = unsafeWindow.document.createElement('script');
        s.setAttribute('name', "TM_internal");
        s.innerHTML = f;
        var d = unsafeWindow.document;
        (d.documentElement || d).appendChild(s);

        var ret = unsafeWindow[fi] || { window: window, top: top, frames: frames, parent: parent, opener: opener};
        delete unsafeWindow[fi];
        s.parentNode.removeChild(s);

        if (D) console.log("env: init " + window.location.href);

        for (var kk in get) {
            if (!get.hasOwnProperty(kk)) continue;

            var run = function() {
                var k = kk;
                var item = ret[k];
                var obj = Object.getOwnPropertyDescriptor(window, k);
                var written = false;

                if (!get[k].forceUnsafe) {
                    try {
                        if (obj) {
                            if (obj.writable) {
                                window[k] = item;
                                written = true;
                                if (D) console.log("env: write " + k);
                                Clean.push(function() {
                                               if (CV) console.log("clean: window["+k+"]");
                                               delete window[k];
                                           });
                            } else if (obj.configurable) {
                                var prop = {};
                                obj.value = item;
                                prop[k] = obj;
                                Object.defineProperties(window, prop);
                                written = true;
                                if (D) console.log("env: redefine " + k);
                                Clean.push(function() {
                                               if (CV) console.log("clean: prop window["+k+"]");
                                               prop[k].value = null;
                                               Object.defineProperties(window, prop);
                                           });
                            }
                        } else {
                            var prop = {};
                            prop[k] = {
                                value: item,
                                enumerable: true,
                                writable: false,
                                configurable: true
                            };

                            Object.defineProperties(window, prop);
                            written = true;
                            if (D) console.log("env: define " + k + " to " + JSON.stringify(obj));
                            Clean.push(function() {
                                           if (CV) console.log("clean: prop window["+k+"]");
                                           prop[k].value = null;
                                           Object.defineProperties(window, prop);
                                       });
                        }
                    } catch (e) {
                        console.log(e.message);
                    }
                }

                if (!written) {
                    var cc = k.replace(/^(.)/g, function($1) { return $1.toUpperCase(); });
                    if (D) console.log("env: create unsafe" + cc);
                    var prop = {};
                    prop['unsafe' + cc] = {
                        value: item,
                        enumerable: true,
                        writable: false,
                        configurable: true
                    };
                    Object.defineProperties(window, prop);
                    Clean.push(function() {
                                   if (CV) console.log("clean: prop window[unsafe"+ cc +"]");
                                 prop['unsafe' + cc].value = null;
                                 Object.defineProperties(window, prop);
                             });
                }
            };
            run();
        }
    }
};

/* ######### TM_do ###################### */

var TM_do = function(src) {
    if (use.safeContext) {
        var customEvent = document.createEvent("MutationEvent");
        customEvent.initMutationEvent('TM_do' + Eventing.contextId,
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
        console.log("ERROR: assert(use.safeContext)");
    }
};

/* ######### fixes ###################### */

function xhrFix() {
    // not working yet
    return;

    if (use.safeContext) {
        var fi = '__o__' + Eventing.contextId;
        var f = 'window.' + fi + ' = { XMLHttpRequest: XMLHttpRequest };';
        TM_do(f);
        var ret = unsafeWindow[fi];
        delete unsafeWindow[fi];

        if (ret.XMLHttpRequest) {
            window.XMLHttpRequest = ret.XMLHttpRequest;
            if (D) console.log("content: XMLHttpRequest overwritten");
        }
    }
}

function wrappedJSObjectFix() {
    var arr = [ window['HTMLElement'].prototype, document.__proto__ ];
    for (var o=0; o < arr.length; o++) {
        var wrap = function() {
            var k = arr[o];
            var obj = Object.getOwnPropertyDescriptor(k, 'wrappedJSObject');

            if (!obj) {
                var prop = { 'wrappedJSObject':
                             {
                                 get: function() {
                                     return this;
                                 },
                                 enumerable: false,
                                 configurable: true
                             },
                };
                Object.defineProperties(k, prop);

                Clean.push(function() {
                               if (CV) console.log("clean: " + Helper.toType(k) + "[wrappedJSObject]");
                               delete k['wrappedJSObject'];
                           });
            }
        };
        wrap();
    }
};

function domAttrFix() {
    var logged = false;
    var useObserver = true;

    var testDOMAttr = function() {
        var p = document.createElement("p");
        var flag = false;

        p.addEventListener("DOMAttrModified", function() { flag = true; }, false);
        p.setAttribute("class", "trigger");

        return flag;
    };

    if (testDOMAttr()) return;

    var arr = [ window['HTMLElement'].prototype, document.__proto__ ];

    for (var o=0; o < arr.length; o++) {
        var k = arr[o];
        if (!k.___addEventListener) {
            k.___addEventListener = k.addEventListener;
            k.___removeEventListener = k.removeEventListener;

            k.removeEventListener = function (event, fn, arg1) {
                this.___removeEventListener(event, fn, arg1);
            };

            k.addEventListener = function (event, fn, arg1) {
                if (event == eDOMATTRMODIFIED) { // not working in chrome

                    // console.log(eDOMATTRMODIFIED + " reg: " + this);
                    if (this.outerHTML) {
                        var old = this.outerHTML.split('>')[0] + ' />';
                        var that = this;
                        var node;

                        if (this.parentNode) {
                            node = this.parentNode;
                        } else {
                            node = this;
                        }

                        // console.log(eDOMATTRMODIFIED + " node: " + node);
                        var sendEvent = function(obj, attrName, prevVal, newVal) {
                            var evt = document.createEvent("MutationEvent");
                            evt.initMutationEvent("DOMAttrModified",
                                                  true,
                                                  false,
                                                  obj,
                                                  prevVal || "",
                                                  newVal || "",
                                                  attrName,
                                                  (prevVal == null) ? evt.ADDITION : (newVal == null) ? evt.REMOVAL : evt.MODIFICATION);
                            obj.dispatchEvent(evt);
                            // if (D) console.log(' send event DOMAttrModified (' + attrName + " from " + prevVal + " to " + newVal + ')');
                        };

                        try {
                            var onMutation = function(mutations) {
                                for (var k in mutations) {
                                    if (!mutations.hasOwnProperty(k)) continue;
                                    var m = mutations[k];
                                    if (m.attributeName != "" && m.target) {
                                        var ov = m.oldValue;
                                        var nv = m.target.getAttribute(m.attributeName);
                                        if (ov != nv) sendEvent(that, m.attributeName, ov, nv);
                                    }
                                }
                            };

                            var observer = new WebKitMutationObserver(onMutation);
                            observer.observe(that, { childList: false, subtree: false, attributeOldValue: true, attributes: true });
                        } catch (e) {

                            var getAttrsFromString = function(s, ret) {
                                if (ret == undefined) ret = {};
                                var a = s.replace(/\\\"/g, '').replace(/".*?"/g, '').replace(/^<[a-zA-b0-9]* |>$/g, '').split(' ');
                                for (var k in a) {
                                    if (!a.hasOwnProperty(k)) continue;
                                    var e = a[k];
                                    if (e.substr(e.length - 1, 1) == '=') {
                                        ret[e.substr(0, e.length - 1)] = null;
                                    }
                                }
                                return ret;
                            };

                            var onSubtree = function(e) {
                                // console.log(eDOMATTRMODIFIED + " onSubtree: ");
                                // console.log(e.target);
                                // console.log(that);

                                // was the event send for the element we're watching?
                                if (e.target == that) {
                                    // create <div class="foo" /> from outerHTML
                                    var n = e.target.outerHTML.split('>')[0] + ' />';
                                    // cmp strings
                                    if (old != n) {
                                        // console.log(eDOMATTRMODIFIED + " changes!!!!");

                                        // create real HTMLElements
                                        var od = document.createElement('div');
                                        od.innerHTML = old;
                                        var oe = od.childNodes[0];
                                        var nd = document.createElement('div');
                                        nd.innerHTML = n;
                                        var ne = nd.childNodes[0];

                                        // determine all attributes from outerHTML
                                        var a = getAttrsFromString(old, getAttrsFromString(n));

                                        for (var k in a) {
                                            if (!a.hasOwnProperty(k)) continue;
                                            var ov = oe.getAttribute(k);
                                            var nv = ne.getAttribute(k);
                                            // send event in case some attributes differ
                                            if (ov != nv) sendEvent(that, k, ov, nv);
                                        }

                                        // store new outerHTML
                                        old = n;
                                    }
                                }
                            };

                            useObserver = false;
                            if (!logged) console.log('content: WARN unable to use MutationObserver -> fallback to DOMSubtreeModified event');
                            logged = true;
                            // register for modifications for this and unfortunately all child nodes
                            node.addEventListener('DOMSubtreeModified', onSubtree, true);
                        }
                    }
                }

                this.___addEventListener(event, fn, arg1);
            };

            Clean.push(function() {
                         k.removeEventListener = k.___removeEventListener;
                         k.addEventListener =  k.___addEventListener;
                     });
        }
    }
};

/* ######### Eventing ###################### */

// predefined outside to allow use at environment
Eventing = {
    contextId: null,
    rEventId: null,
    sEventId: null,
    eventSource : null,
    generateScriptId : function (){
        var ret = '';
        ret += Math.floor ( Math.random() * 06121983 + 1 )
        ret += ((new Date()).getTime().toString()).substr(10,7);
        return ret;
    },
    log : function(m) {
        console.log((_background ? "content" : "page") + ": " + m);
    },
    alternativeEventSource : {
        // this is only working for code not behind timeouts and events :(
        dispatchEvent : function(e) {
            if (!window.AltEventing) window.AltEventing = {};
            if (window.AltEventing[e.type]) {
                window.AltEventing[e.type](e);
            }
        },
        addEventListener : function(id, e) {
            if (!window.AltEventing) window.AltEventing = {};
            window.AltEventing[id] = e;
        },
        removeEventListener : function(id) {
            if (!window.AltEventing) window.AltEventing = {};
            delete window.AltEventing[id];
        }
    },
    init: function() {
        if (!Eventing.contextId) {
            Eventing.log("Eventing.init() failed!!!");
            return;
        }
        var top = "TM_toPage";
        var toc = "TM_toContent";
        var u = {};

        if (_background) {
            u = use;
            Eventing.rEventId = toc;
            Eventing.sEventId = top;
            Eventing.eventHandler = Eventing.eventHandlerContent;
        } else {
            u = TMwin.use;
            Eventing.rEventId = top;
            Eventing.sEventId = toc;
            Eventing.eventHandler = Eventing.eventHandlerPage;
        }

        if (u.safeContext && u.scriptBlocker) {
            if (D) Eventing.log("Eventing: use scriptBlocker workaround!");
            Eventing.eventSource = Eventing.alternativeEventSource;
        } else {
            Eventing.eventSource = document;
        }

        if (V) Eventing.log("Eventing initialized (" + Eventing.contextId + ")");
        Eventing.registerListener();
    },

    fireEvent: function(data, evt) {
        if (evt == undefined) {
            evt = Eventing.sEventId + Eventing.contextId;
        }

        if (ENV) Eventing.log("fireEvent " + evt + " -> " + JSON.stringify(data));
        try {
            var customEvent = document.createEvent("MutationEvent");
            customEvent.initMutationEvent(evt,
                                          false,
                                          false,
                                          null,
                                          null,
                                          null,
                                          Converter.encodeR(JSON.stringify(data)),
                                          customEvent.ADDITION);
            Eventing.eventSource.dispatchEvent(customEvent);
        } catch (e) {
            Eventing.log("Error: fire event " + evt + " -> " + JSON.stringify(data) +  " " + e);
        }
    },

    registerListener: function() {
        if (ENV) Eventing.log("registerListener " + Eventing.rEventId + Eventing.contextId);
        if (_background) {
            Eventing.eventSource.addEventListener(Eventing.rEventId + Eventing.contextId, Eventing.eventHandler, false);
        } else {
            Eventing.eventSource.addEventListener(Eventing.rEventId + Eventing.contextId, Eventing.eventHandler, false);
        }
    },
    eventHandlerPage: function(evt) {
        try {
            if (ENV) Eventing.log("Event received " + Eventing.rEventId + Eventing.contextId + " " + evt.attrName);
            var j = JSON.parse(Converter.decodeR(evt.attrName));
            try {
                ___eval___(j); /* do a little trick to allow YUI compression, window['eval'] resets the context :( */
                if (TS) Eventing.log('it took ' + ((new Date()).getTime() - evt.timeStamp)  + ' ms to process this event ->' + j.fn);
            } catch (e) {
                console.log("page:Error: processing event (" + j + ")! " + e.message);
            }
            j = '';
        } catch (e) {
            Eventing.log("Error: retrieving event! " + e.message);
            Eventing.log("Error: " + evt.attrName);
        }
        evt = null;
    },

    eventHandlerContent: function(evt) {
        try {
            if (V) Eventing.log("Event received " + Eventing.rEventId + Eventing.contextId + " " + evt.attrName);
            var j = JSON.parse(Converter.decodeR(evt.attrName));
            try {
                tmCE[j.fn](j.args[0], j.args[1], j.args[2], j.args[3], j.args[4], j.args[5], j.args[6], j.args[7]);
                if (TS) Eventing.log('it took ' + ((new Date()).getTime() - evt.timeStamp)  + ' ms to process this event ->' + j.fn);
            } catch (e) {
                Eventing.log("Error: processing event (" + j.fn + ")! " + JSON.stringify(e));
            }
            j = '';
        } catch (e) {
            Eventing.log("Error: retrieving event! " + e.message);
            Eventing.log("Error: " + evt.attrName);
        }
        evt = null;
    },

    cleanup: function() {
        if (Eventing.eventSource) {
            Eventing.eventSource.removeEventListener(Eventing.rEventId + Eventing.contextId, Eventing.eventHandler, false);
        }
    }
};
Eventing.contextId = Eventing.generateScriptId();
tmCE.id = Eventing.contextId;

/* ######### 2n stage ###################### */

var secondStage = {
    init: function() {
        window.addEventListener("load", secondStage.runHlp, false);
        window.addEventListener("DOMNodeInserted", secondStage.runHlp, false);
        window.addEventListener("DOMContentLoaded", secondStage.runHlp, false);
    },

    runHlp: function(arg) {
        if (!allReady) {
            if (!document.head && !document.body) {
                if (arg == undefined) window.setTimeout(secondStage.runHlp, 100);
                return;
            } else {
                secondStage.cleanupHlp();
                secondStage.run();
            }
        }
    },

    run : function() {
        if (!allReady && env && emu) {
            var debug  = "var V = " + (V ? "true" : "false")+ ";\n";
            debug += "var EV = " + (EV ? "true" : "false")+ ";\n";
            debug += "var ENV = " + (ENV ? "true" : "false")+ ";\n";
            debug += "var EMV = " + (EMV ? "true" : "false")+ ";\n";
            debug += "var logLevel = " + logLevel + ";\n";

            var tm = "var tmCE = " + Helper.serialize(tmCE) + ";\nvar Event = function() {};\n";
            var context = "var TM_context_id = '" + Eventing.contextId + "';\n";
            var load = "";

            _handler.sendMessage("console.log('Tampermonkey started');");
            if (domLoaded) {
                load = "TMwin.loadHappened = true;\n";
                load = "TMwin.domContentLoaded = true;\n";
                if (V || EV || D) console.log("content: Start ENV with DOMContentLoaded " + Eventing.contextId);
            } else if (nodeInserted) {
                load = "TMwin.loadHappened = true;\n";
                if (V || EV || D) console.log("content: Start ENV with loadHappened " + Eventing.contextId);
            }
            if (load != '' && (V || EV)) {
                console.log("content: Start ENV normally " + Eventing.contextId);
            }

            var run = "(function () { " + debug + context + jslint + tm + emu + env + load + "})();";
            _handler.sendMessage(run);
            env = null;
            emu = null;
            tm = null;
            allReady = true;
        }
    },

    cleanupHlp: function() {
        if (!allReady) {
            window.removeEventListener("load", secondStage.runHlp, false);
            window.removeEventListener("DOMNodeInserted", secondStage.runHlp, false);
            window.removeEventListener("DOMContentLoaded", secondStage.runHlp, false);
        }
    }
};

/* ############ unload ############### */
function cleanup() {
    if (V) console.log("content: cleanup!");

    var req = { method: "unLoad",
                id: Eventing.contextId,
                topframe: window.self == window.top,
                url: window.location.origin + window.location.pathname,
                params: window.location.search + window.location.hash };

    chrome.extension.sendMessage(req, function(response) {});

    try {
        Eventing.cleanup();
        secondStage.cleanupHlp();
    } catch (e) {
        console.log("cleanup: Error: " + e.message);
    }

    window.removeEventListener("DOMContentLoaded", domContentLoaded, false);
    window.removeEventListener("DOMNodeInserted", domNodeInserted, false);
    window.removeEventListener("unload", cleanup, false);

    if (Clean != null) {
        for (var i = 0; i<Clean.length; i++) {
            Clean[i]();
        }
        Clean = null;
    } else {
        console.log("content: Warning: multiple unload events detected!!!");
    }
}

/* ############ run ############### */

// initUnsafe before adding node insert listeners ;)
initUnsafe();

// init some magic before the first elements are created
domAttrFix();
wrappedJSObjectFix();
xhrFix();

window.addEventListener("unload", cleanup, false);
window.addEventListener("DOMContentLoaded", domContentLoaded, false);
window.addEventListener("DOMNodeInserted", domNodeInserted, false);

function reqListerner(request, sender, sendResponse) {
    if (!allReady) {
        window.setTimeout(function() { reqListerner(request, sender, sendResponse); }, 10);
        return true;
    }
    if (wannaRun) {
        var id = _handler.getResponseId(sendResponse);
        tmCE.onContentRequest(request, sender, id);
    }

    return true;
}

chrome.extension.onMessage.addListener(reqListerner);
_handler.sendMessage();

var xhrRetryCnt = 2;
var forceTestXhr = function() {
    // TODO: this spams my servers log file! :D
    if (D) console.log("content: create test XHR to check whether webRequest API is working");
    var d = {
        method: 'GET',
        url: 'http://tampermonkey.net/empty.html',
        headers: { "Referer": 'http://doesnt.matter.com' },
    }

    var res = function(r) {
        if (r.webRequest) {
            _webRequest = r.webRequest;
            xmlhttpRequestHelper.setWebRequest(_webRequest);
        }
        if (V) console.log("content: updated webRequest info");
    };

    var done = function() {
        var req = { method: "getWebRequestInfo",
                    id: Eventing.contextId };

        chrome.extension.sendMessage(req, res);
    };

    xmlhttpRequest(d, null, null, null, done);
};

var initW = 1;
var init = function() {
    var Femu = "emulation.js";
    var Fenv = "environment.js";
    // var Fjslint = "jslint.js";

    var updateResponse = function(resp) {
        if (resp === undefined) {
            if (D) console.log("content: _early_ execution, connection to bg failed -> retry!");
            window.setTimeout(init, initW);
            // avoid too much load in case something is really b0rken!
            initW *= 2;
            return;
        }

        // register listeners for eventing... context ID now is 'stable'
        Eventing.init();

        logLevel = resp.logLevel;
        adjustLogLevel();

        if (V || D) console.log("content: Started (" + Eventing.contextId + ", " + window.location.origin + window.location.pathname + ")");

        if (allReady) {
            // env is already executed -> set loglevel
            _handler.sendMessage("TMwin.adjustLogLevel(" + logLevel + ");\n");
        }
        if (resp.enabledScriptsCount) {
            if (V || D) console.log('content: start event processing for ' + Eventing.contextId + ' (' + resp.enabledScriptsCount + ' to run)');
            wannaRun = true;

            /* if (!emu || !env || !jslint) {
                emu = resp.raw[Femu] || emu;
                env = resp.raw[Fenv] || env;
                jslint = resp.raw[Fjslint] || jslint || "";
            } */

            if (resp.webRequest) {
                _webRequest = resp.webRequest;
                xmlhttpRequestHelper.setWebRequest(_webRequest);
                if (_webRequest.headers && !_webRequest.verified && xhrRetryCnt-- > 0) {
                    forceTestXhr();
                }
            }

            secondStage.runHlp();
        } else {
            if (V || D) console.log('content: disable event processing for ' + Eventing.contextId);
            wannaRun = false;
            allReady = true;
            secondStage.cleanupHlp();
            cleanup();
        }
    };

    var raw = [];
    try {
        emu = '(' + Registry.getRaw(Femu) + ')();\n';
        env = '(' + Registry.getRaw(Fenv) + ')();\n';;
        // jslint = Registry.getRaw(Fjslint);
    } catch (e) {}

    /* if (!emu || !env || !jslint) {
        if (V) console.log("content: getRaw unsupported!");
        raw = [ Femu, Fenv, Fjslint ];
    } */

    var req = { method: "prepare",
                id: Eventing.contextId,
                raw: raw,
                topframe: window.self == window.top,
                url: window.location.origin + window.location.pathname,
                params: window.location.search + window.location.hash };

    chrome.extension.sendMessage(req, updateResponse);
};

init();

})();
} // endif
