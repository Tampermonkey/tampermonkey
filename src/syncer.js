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

    var extractJSON = function(req, callback) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                try {
                    var j = JSON.parse(req.responseText);
                    return j;
                } catch (e) {
                    _accountState = eERROR;
                    callback(1, "unable to parse JSON");
                }
            } else {
                _accountState = eERROR;
                callback(req.status, "");
            }
        }
        
        return null;
    };
    
    var createAccount = function(u, p, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "create", id: _id++, params : { "username" : u, "password": p }} )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;
            
            if (j.error) {
                e = eERROR;
                callback(j.error, j.message);
            } else {
                _settings.user = u;
                _settings.pass = p;
                callback(0);
            }
        };

        xmlhttpRequest(details, cb);
    };

    var set = function(k, v, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "set", id: _id++, params : { "username" : _settings.user, "password": _settings.pass, "key": k, "data" : v }} )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;
            
            if (j.error) {
                callback(j.error, j.message);
            } else {
                callback(0);
            }
        };

        xmlhttpRequest(details, cb);
    };

    var get = function(k, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "get", id: _id++, params : { "username" : _settings.user, "password": _settings.pass, "key": k }} )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;
            
            if (j.error) {
                callback(j.error, j.message);
            } else {
                callback(0, k, j.result);
            }
        };

        xmlhttpRequest(details, cb);
    };

    var md5 = function(k, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "md5", id: _id++, params : { "username" : _settings.user, "password": _settings.pass, "key": k }} )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;
            
            if (j.error) {
                callback(j.error, j.message);
            } else {
                callback(0, k, j.result);
            }
        };

        xmlhttpRequest(details, cb);
    };

    var list = function(callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "list", id: _id++, params : { "username" : _settings.user, "password": _settings.pass }} )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;
            
            if (j.error) {
                callback(j.error, j.message);
            } else {
                callback(0, j.result);
            }
        };

        xmlhttpRequest(details, cb);
    };
    
    var verifySettings = function(url, u, p, callback) {
        var os = _settings;

        _settings.url = url;
        _settings.user = u;
        _settings.pass = p;

        var cb = function(ret, msg) {
            if (ret == 0) {
                _accountState = eOK;
            } else {
                _settings = os;
                _accountState = eERROR;
            }
            callback(ret, msg);
        };
        
        set("touch", "", cb);
    };
    
    var isAccountOk = function() {
        return _accountState == eOK;
    };

    Registry.register('syncer', {
                              verifySettings: verifySettings,
                              createAccount: createAccount,
                              isAccountOk : isAccountOk,
                              md5 : md5,
                              set : set,
                              get : get,
                              list: list });
})();

