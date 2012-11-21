/**
 * @filename syncinfo.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    Registry.require('xmlhttprequest');
    var xmlhttpRequest = Registry.get('xmlhttprequest').run;

    var _registered = false;
    var _retries = 1;
    var _id = null;
    var _type = 0;
    var _url = null;
    var _etype = { ePASTEBIN: 1,
                   eCHROMESYNC: 2 };
    var _urls = {};
    var _listeners = [];

    _urls[_etype.ePASTEBIN] = 'http://pastebin.com/raw.php?i=%s';
    _urls[_etype.eCHROMESYNC] = '';

    var init = function(type, id) {
        _listeners = [];

        var r = false;
        _id = id;
        _type = type;

        if (type == _etype.eCHROMESYNC) {
            registerOnChange();
            r = true;
        } else if (_urls[_type] && _id) {
            _url = _urls[_type].replace('%s', id);
            r = true;
        }

        return r;
    };

    var registerOnChange = function() {
        if (_registered) return;
        _registered = true;
        chrome.storage.onChanged.addListener(handleChange);
    };

    var handleChange = function(changes, ns) {
        if (_type == _etype.eCHROMESYNC &&
            ns == 'sync') {

            for (key in changes) {
                var storageChange = changes[key];
                console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
                            key, ns, storageChange.oldValue, storageChange.newValue);

                for (var i=0; i<_listeners.length; i++) {
                    _listeners[i](key, storageChange.oldValue, storageChange.newValue);
                }
            }
        }
    };

    var parse = function(data, cb) {
        var ret = [];

        try {
            data = data.replace(/\t/g, '    ');
            data = data.replace(/\r/g, '\n');
            data = data.replace(/\n\n+/g, '\n');

            var lines = data.split('\n');
            for (var i=0;i<lines.length;i++) {
                var l = lines[i];
                var tags = l.split('|');
                if (tags.length > 3) {
                    console.log("si: can't handle line: " + l);
                    continue;
                }
                var url = tags[tags.length - 1];
                var options = null;
                var name = null;
                if (tags.length > 1) {
                    for (var j=tags.length-2;j>=0;j--) {
                        try {
                            options = JSON.parse(tags[j]);
                        } catch (e) {
                            name = tags[j];
                        }
                    }
                }

                ret.push({ name: name, url: url, options: (options || {}) });
            }
        } catch (e) {
            console.log("si: unable to parse data: " + data);
        }
        if (cb) cb(ret);
    };

    var listFromUrl = function(callback) {
        if (!_url) {
            if (callback) callback([]);
            return;
        }

        var details = {
            method: 'GET',
            retries: _retries,
            url: _url,
        };

        var got = function(req) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    parse(req.responseText, callback);
                } else {
                    if (callback) callback([]);
                }
            }
        };
        xmlhttpRequest(details, got);
    };

    var listFromChromeSync = function(callback) {
        var ret = [];
        for (var i=0; i<chrome.storage.sync.length; i++) {
            ret.push(chrome.storage.sync.key(i));
        }

        if (callback) callback(ret);
        return ret;
    };

    var list = function(callback) {
        if (_type == _etype.eCHROMESYNC) {
            return listFromChromeSync(callback);
        } else {
            return listFromUrl(callback);
        }

    };

    var addChangeListener = function(cb) {
        listeners.push(cb);
    };

    Registry.register('syncinfo', {
                              init : init,
                              list: list,
                              addChangeListener : addChangeListener,
                              types: _etype});
})();

