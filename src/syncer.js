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
    var xmlhttpRequest = Registry.get('xmlhttprequest');
    
    var _settings = {};
    var _accountState = eINIT;
    var _id = 0;
    var _retries = 3;

    var extractJSON = function(req, callback) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                try {
                    var j = JSON.parse(req.textContent);
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
                _settings.username = u;
                _settings.password = p;
                callback(0);
            }
        };

        xmlhttpRequest(details, cb);
    };

    var set = function(u, p, k, v, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "set", id: _id++, params : { "username" : u, "password": p, "key": k, "value" : v }} )
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

    var get = function(u, p, k, callback) {
        var details = {
            method: 'POST',
            retries: _retries,
            url: _settings.url,
            data: JSON.stringify( { method: "get", id: _id++, params : { "username" : u, "password": p, "key": k }} )
        };

        var cb = function(req) {
            var j = extractJSON(req, callback);
            if (!j) return;
            
            if (j.error) {
                callback(j.error, j.message);
            } else {
                callback(0, value);
            }
        };

        xmlhttpRequest(details, cb);
    };
    
    var verifySettings = function(url, u, p, callback) {
        _settings.url = url;

        var cb = function(ret, msg) {
            if (ret == 0) {
                _accountState = eOK;
                _settings.username = u;
                _settings.password = p;
            } else {
                _accountState = eERROR;
            }
            callback(ret, msg);
        };
        
        set(u, p, "touch", "", cb);
    };
    
    var scriptChanged = function() {
    };
    var scriptInstalled = function() {
    };
    var scriptRemoved = function() {
    };
    var isAccountOk = function() {
        return _accountState == eOK;
    };

    Registry.register('syncer', {
                              verifySettings: verifySettings,
                              createAccount: createAccount,
                              isAccountOk : isAccountOk,
                              scriptChanged : scriptChanged,
                              scriptInstalled : scriptInstalled,
                              scriptRemoved : scriptRemoved });
})();

