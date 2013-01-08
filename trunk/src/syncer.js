/**
 * @filename syncer.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    Registry.require('convert');
    Registry.require('helper');
    Registry.require('xmlhttprequest');

    const eERROR = -1;
    const eOK = 0;
    const eINIT = 1;
    const eTEST = 2;

    var Converter = Registry.get('convert');
    var Helper = Registry.get('helper');
    var xmlhttpRequest = Registry.get('xmlhttprequest').run;

    var _settings = {};
    var _accountState = eINIT;
    var _id = 0;
    var _retries = 3;
    var _lockTimeout = 30 / 10;
    var _maxConcurrent = 2;
    var _waiting = [];
    var _simulate = null;
    
    var cc = 0;

    var enableDebug = function() {
        _simulate = {
            "login" : '{"jsonrpc":"2.0","result":"CcgIR7cR7f15Ew5x3TfJ0v1CfvKY5X","id":null,"ts":1349794938}',
            "list" : '{"jsonrpc":"2.0","result":["test2@source","smoothscroll@source","bernd@source"],"id":null,"ts":1349795062}',
            "get" : '{"jsonrpc":"2.0","result":"[\\"\\/\\/ ==UserScript==\\\\n\\/\\/ @name bernd_#_replace_#_\\\\n\\/\\/ @namespace http:\\/\\/use.i.E.your.homepage\\/\\\\n\\/\\/ @version 0.1\\\\n\\/\\/ @description enter something useful\\\\n\\/\\/ @include http:\\/\\/*\\/*\\\\n\\/\\/ @copyright 2011+, You\\\\n\\/\\/ ==\\/UserScript==\\\\n\\\\n\\",\\"\\"]","id":null,"ts":1349798045}',
            "set" : '{"jsonrpc":"2.0","result":"done ","id":null,"ts":1349795230}',
            "md5" : '{"jsonrpc":"2.0","result":"8d41b6105879734377287271ca1bea72","id":null,"ts":1349795258}'
        };
    }

    var addCredentials = function(p) {
        if (p === undefined) p = {};
        if (_settings.session) {
            p.session = _settings.session;
        } else {
            p.username = _settings.user;
            p.password = _settings.pass;
        }

        return p;
    };

    var runRequest = function(d, c) {
        var done = function(req) {
            if (req.readyState == 4) {
                if (--cc < _maxConcurrent && _waiting.length > 0) {
                    var r =  _waiting[0];
                    _waiting = _waiting.slice(1);
                    // next request in queue...
                    runRequest(r.d, r.c);
                }
                if (req.status == 200) {
                    c.apply(this, arguments);
                } else {
                    if (D) console.log("syncer: request failed with " + req.status);
                }
            }
        };
        if (cc < _maxConcurrent) {
            cc++;
            if (_simulate) {
                var m = JSON.parse(d.data).method;
                window.setTimeout(function() { done({ responseText: _simulate[m].replace('_#_replace_#_', Math.floor(Math.random() * 061283 + 1)), readyState : 4, status : 200}); }, 10);
            } else {
                xmlhttpRequest(d, done);
            }
        } else {
            _waiting.push({ d: d, c: c});
        }
    };

    var extractJSON = function(req, callback) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                try {
                    var j = JSON.parse(req.responseText);
                    return j;
                } catch (e) {
                    _accountState = eERROR;
                    if (callback) callback(1, "unable to parse JSON");
                }
            } else {
                _accountState = eERROR;
                if (callback) callback(req.status, "");
            }
        }

        return null;
    };

    var getStdCallback = function(callback, jobj) {
        return function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;

            if (j.error) {
                if (j.error == 423 && --details.retries > 0) {
                    window.setTimeout(function() { runRequest(details, cb); }, _lockTimeout);
                    return;
                }
                if (callback) callback(j.error, j.message);
            } else {
                if (jobj && jobj.id != j.id) {
                    console.log('syncer: set received non matching request ID! ' + jobj.id + ' != ' + j.id);
                }
                if (callback) callback(null, j.result);
            }
        };
    };

    var createAccount = function(u, p, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "create", id: _id++, params : addCredentials() } )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;

            if (j.error) {
                if (j.error == 423 && --details.retries > 0) {
                    window.setTimeout(function() { runRequest(details, cb); }, _lockTimeout);
                    return;
                }
                _accountState = eERROR
                callback(j.error, j.message);
            } else {
                _settings.user = u;
                _settings.pass = p;
                callback(0);
            }
        };

        runRequest(details, cb);
    };

    var check = function(v, callback) {
        var jobj = { method: "check", id: _id++, params : { "data" : v }};
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            headers : {
                "Content-type": "application/x-www-form-urlencoded"
            },
            data: JSON.stringify(jobj)
        };

        runRequest(details, getStdCallback(callback, jobj));
    };

    var set = function(k, v, callback) {
        var jobj = { method: "set", id: _id++, params : addCredentials({ "key": k, "data" : v })};
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            headers : {
                "Content-type": "application/x-www-form-urlencoded"
            },
            data: JSON.stringify(jobj)
        };

        runRequest(details, getStdCallback(callback, jobj));
    };

    var get = function(k, callback) {
        var jobj = { method: "get", id: _id++, params : addCredentials({ "key": k })};
        var details = {
            method: 'POST',
            retries: _retries,
            headers : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            url: _settings.url,
            data: JSON.stringify(jobj)
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;

            if (j.error) {
                if (j.error == 423 && --details.retries > 0) {
                    window.setTimeout(function() { runRequest(details, cb); }, _lockTimeout);
                    return;
                }
                callback(j.error, j.message);
            } else {
                if (jobj.id != j.id) {
                    console.log('syncer: get received non matching request ID! ' + jobj.id + ' != ' + j.id);
                }
                callback(0, k, j.result);
                // k param! no std callback
            }
        };

        runRequest(details, cb);
    };

    var md5 = function(k, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "md5", id: _id++, params : addCredentials({ "key": k })} )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;

            if (j.error) {
                if (j.error == 423 && --details.retries > 0) {
                    window.setTimeout(function() { runRequest(details, cb); }, _lockTimeout);
                    return;
                }
                callback(j.error, j.message);
            } else {
                callback(0, k, j.result);
                // k param! no std callback
            }
        };

        runRequest(details, cb);
    };

    var list = function(callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "list", id: _id++, params : addCredentials()} )
        };

        runRequest(details, getStdCallback(callback));
    };

    var touch = function(callback) {
        var data = {};

        if (_settings.session) {
            data = { method: "touch", id: _id++, params : addCredentials()};
        } else {
            data = { method: "set", id: _id++, params : addCredentials( {"key":"touch", data: null})};
        }

        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify(data)
        };

        runRequest(details, getStdCallback(callback));
    };

    var login = function(callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "login", id: _id++, params : addCredentials()} )
        };

        runRequest(details, getStdCallback(callback));
    };

    var logout = function(callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "logout", id: _id++, params : addCredentials()} )
        };

        _settings.session = null;
        runRequest(details, getStdCallback(callback));
    };

    var verifySettings = function(url, u, p, callback) {
        var os = JSON.parse(JSON.stringify(_settings));

        _settings.url = url;
        _settings.user = u;
        _settings.pass = p;
        _settings.session = null;
        var tryLogin = true;

        var cb = function(ret, msg) {
            if (!ret) {
                if (tryLogin) {
                    _settings.session = msg;
                }
                if (os.session) {
                    // logout with old sync settings
                    var ns = _settings;
                    _settings = os;
                    logout();
                    _settings = ns;
                }
                _accountState = eOK;
            } else if (ret == 501 && tryLogin) {
                tryLogin = false;
                touch(cb);
                return;
            } else {
                _settings = os;
                _accountState = eERROR;
            }
            callback(ret, msg);
        };

        // "hot-detect" "login" ability
        login(cb);
    };

    var isAccountOk = function() {
        return _accountState == eOK;
    };

    var onUnload = function() {
        if (_settings.session) {
            logout();
        }
    };

    var prepare = function(callback) {
        if (_settings.session) {
            var done = function(err) {
                if (err == 403) {
                    login(callback);
                } else {
                    callback();
                }
            };
            touch(done);
        } else {
            callback();
        }
    };

    Registry.register('syncer', {
                              enableDebug : enableDebug,
                              verifySettings: verifySettings,
                              createAccount: createAccount,
                              isAccountOk : isAccountOk,
                              md5 : md5,
                              check : check,
                              set : set,
                              get : get,
                              list: list,
                              onUnload: onUnload,
                              prepare: prepare});
})();

