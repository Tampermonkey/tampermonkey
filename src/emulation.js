/**
 * @filename emulation.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

// var EMV = false;

if (!window.console && !console) {
    console = {
        log: function(text) {
            tmCE.log((_background ? "BG: " : "") + text);
        }
    };
};

if (!Converter) {
    Converter = {
        decode: function(data) {
            return atob(data);
        },
        encode: function(text) {
            return btoa(data);
        }
    }
}

var java2js = function(value) {
    if (value == undefined) {
        return undefined;
    } else if (value == null) {
        return null;
    } else {
        return String(value);
    }
};

var chromeEmu = {
    key : "##REPLACE_KEY##",

    responses : {},

    xmlHttpRequest: function(details, callback, onreadychange, onerr, done) {
        var cb = function(req) {
            if (EMV) console.log("emu: req (" + id + " -" + details.url + " returned: " + req);

            if (req.onLoad && callback) {
                if (req.r_id) {
                    // TODO: Waaaaaaaaaaahhhhhhhhh, bypass special objects like ArrayBuffer, cause they are destroyed when sent by an event
                    req.response.response = window[req.r_id];
                    delete window[req.r_id];
                }
                callback(req.response);
            }

            if (req.onReadyStateChange && onreadychange) onreadychange(req.response);
            if (req.onError && onerr) onerr(req.response);
            if (req.onDone && done) done(req.response);
        };
        var id = chromeEmu.getResponseId(cb);
        var d;
        if (typeof details.data === 'object') {
            // TODO: Waaaaaaaaaaahhhhhhhhh, bypass special objects like FormData, cause they are destroyed when sent by an event
            var q_id = '__y__' + Math.floor ( Math.random() * 06121983 + 1 );
            window[q_id] = details;
            d = JSON.stringify({ q_id: q_id });
        } else {
            d = JSON.stringify(details);
        }

        var run = function() { tmCE.xmlHttpRequest(chromeEmu.key, d, id); };
        window.setTimeout(run, 1);
    },

    runUpdateListeners: function (tabId, details, tab) {
        if (EMV) console.log("emu: runUpdateListeners " + tabId + " URL: " + tab.url);
        for (var k=0; k<chromeEmu.tabs.updateListeners.length;k++) {
            var l = chromeEmu.tabs.updateListeners[k];
            try {
                l(tabId, details, tab);
            } catch (e) {
                console.log("emu: Error (runUpdateListeners):" + e + "\n" + l.toString());
            }
        }
    },

    runRequestHandlers: function (request, sender, responseId, responseTab) {
        if (EMV) console.log("emu: runRequestHandlers " + responseId);
        for (var k=0; k<chromeEmu.extension.requestHandlers.length;k++) {
            var l = chromeEmu.extension.requestHandlers[k];
            try {
                var response = function(ret) {
                    tmCE.onResponse(chromeEmu.key, responseTab, responseId, JSON.stringify(ret));
                }
                l(request, sender, response);
            } catch (e) {
                console.log("emu: Error (runRequestHandlers):" + e + "\n" + l.toString());
            }
        }
    },

    runContentRequestHandlers: function (request, sender, responseId, responseTab) {
        if (EMV) console.log("emu: runRequestHandlers " + responseId);
        for (var k=0; k<chromeEmu.extension.requestHandlers.length;k++) {
            var l = chromeEmu.extension.requestHandlers[k];
            try {
                var response = function(ret) { 
                    tmCE.onContentResponse(chromeEmu.key, responseTab, responseId, JSON.stringify(ret));
                }
                l(request, sender, response);
            } catch (e) {
                console.log("emu: Error (runContentRequestHandlers):" + e + "\n" + l.toString());
            }
        }
    },
    
    runRequest: function (responseId, args, responseTab) {
        try {
            if (EMV) console.log("emu: runRequest " + responseId + " -> " + Converter.decode(request));
            var r = JSON.parse(Converter.decode(args));
            chromeEmu.runRequestHandlers(r.request, r.sender, responseId, responseTab);
            r = '';
        } catch (e) {
            console.log("emu: Json parse error (runRequest):" + e  + "\n" + args);
        }
    },

    runContentRequest: function (responseId, args, responseTab) {
        try {
            if (EMV) console.log("runContentRequest " + responseId + " -> " + Converter.decode(args));
            var r = JSON.parse(Converter.decode(args));
            chromeEmu.runContentRequestHandlers(r.request, r.sender, responseId, responseTab);
            r = '';
        } catch (e) {
            console.log("emu: Json parse error (runContentRequest):" + e + "\n" + args);
        }
    },
    
    runResponse: function (responseId, args) {
        try {
            for (var k in chromeEmu.responses) {
                if (k == responseId) {
                    if (EMV) console.log("emu: runResponse " + responseId + " -> " + Converter.decode(args));
                    var p = "";
                    try {
                        p = JSON.parse(Converter.decode(args));
                        chromeEmu.responses[k](p);
                    } catch (e) {
                        console.log("emu: Json parse error (runResponse):" + e + "\n" + args);
                    }
                    p = '';
                    delete chromeEmu.responses[k];
                    return;
                }
            }
        } catch (e) {
            console.log("emu: Json parse error (runResponse):" + e + "\n" + args);
        }
        console.log("WARN: emu: responseId " + responseId + " not found!");
    },

    runConnectResponse: function (responseId, args) {
        try {
            for (var k in chromeEmu.responses) {
                if (k == responseId) {
                    if (EMV) console.log("emu: runConnectResponse " + responseId + " -> " + Converter.decode(args));
                    var p = "";
                    var disconnect = false;
                    try {
                        p = JSON.parse(Converter.decode(args));
                        chromeEmu.responses[k](p);
                        disconnect = p.onDisconnect;
                    } catch (e) {
                        console.log("emu: Json parse error (runConnectResponse):" + e + "\n" + args);
                    }
                    p = '';
                    // Do _not_ remove response id in case of a msg! This is a connection!
                    if (disconnect) chromeEmu.responses[k] = null;
                    return;
                }
            }
        } catch (e) {
            console.log("emu: Json parse error (runConnectResponse):" + e + "\n" + args);
        }
        console.log("WARN: emu: responseId " + responseId + " not found!");
    },
        
    getResponseId : function(callback) {
        var id = 0;
        if (callback) {
            while (id == 0 || chromeEmu.responses[id] != undefined) {
                id = ((new Date()).getTime() + Math.floor ( Math.random ( ) * 6121983 + 1 )).toString();
            }
            chromeEmu.responses[id] = callback;
            if (EMV) console.log("emu: registerResponseId " + id);
        }
        return id;
    },
    
    extension: {
        requestHandlers : [],
        getURL: function(url) {
            return java2js(tmCE.getUrl(chromeEmu.key, url));
        },
        connect : function(obj) {
            var port = {
                           oMlisteners: [],
                           oDlisteners: [],
                           notifyListeners: function(l, m) {
                               for (var i = 0; i < l.length; i++) {
                                   l[i](m);
                               }
                           },
                           postMessage: function (obj) {
                               tmCE.sendExtensionMessage(chromeEmu.key, JSON.stringify(obj), id);
                           },
                           onMessage:
                           {
                               addListener : function(listener) {
                                   port.oMlisteners.push(listener);
                               }
                           },
                           onDisconnect:
                           {
                               addListener : function(listener) {
                                   port.oDlisteners.push(listener);
                               }
                           }
            };

            var msg = function(m) {
                if (m.onMessage) {
                    port.notifyListeners(port.oMlisteners, m.msg);
                } else if (m.onDisconnect) {
                    port.notifyListeners(port.oDlisteners);
                }
            };

            var id = chromeEmu.getResponseId(msg);
            tmCE.sendExtensionConnect(chromeEmu.key, JSON.stringify(obj), id);
            return port;
        },
        sendRequest : function(obj, response) {
            var id = chromeEmu.getResponseId(response);

            if (EMV) console.log("emu: extension.sendRequest " + id + " # " + JSON.stringify(obj));

            tmCE.sendExtensionRequest(chromeEmu.key, JSON.stringify(obj), id);
        },
        onRequest : {
            addListener: function (requestHandler) {
                // chromeEmu.request(tmCE.onRequest, { requestHandlerIdx: chrome.extension.requestHandlers.length });
                chromeEmu.extension.requestHandlers.push(requestHandler);
            }
        }
    },
    
    i18n: {
        getMessage: function() {
            var args = [];
            for (var i=0; i<arguments.length; i++) {
                args.push(arguments[i]);
            }
            var ret = tmCE.getMessage(chromeEmu.key, JSON.stringify(args));
            return java2js(ret);
        }
    },
    tabs: {
        updateListeners : [],
        sendRequest: function(tabId, obj, response) {
            var id = chromeEmu.getResponseId(response);

            if (EMV) console.log("emu: tabs.sendRequest " + id);
            
            tmCE.sendTabsRequest(chromeEmu.key, tabId, JSON.stringify(obj), id);
        },
        create : function(url) {
            if (EMV) console.log("emu: tabs.create " + url);

            tmCE.createTab(chromeEmu.key, JSON.stringify(url));
        },
        getSelected : function(obj, callback) {
            var id = chromeEmu.getResponseId(callback);
            tmCE.getSelected(chromeEmu.key, JSON.stringify(obj), id);
        },
        update : function(tabID, url) {
            tmCE.updateTab(chromeEmu.key, tabID, url);
        },
        onUpdated : {
            addListener: function(loadListener) {
                // chromeEmu.request(tmCE.onUpdated, { updateListenerIdx: chrome.tabs.updateListeners.length });
                chromeEmu.tabs.updateListeners.push(loadListener);
            }
        }
    }
};

function checkInterface(cb) {
    if (!window.hasOwnProperty("tmCE")) {
        window.setTimeout(function() { checkInterface(cb); }, 100);
    }
    cb();
}

function checkBgFred(cb) {
    if (TM_tabs == undefined) {
        window.setTimeout(function() { checkBgFred(cb); }, 100);
    }
    cb();
}

if (EMV) console.log("emu: Started (" + window.location.origin + window.location.pathname + ")");

if (!TMwin.chromeEmu) Object.defineProperties(TMwin,
    { "chromeEmu":
        {
            value: chromeEmu,
            enumerable: false,
            writable: false,
            configurable: false,
        },
     }
);
