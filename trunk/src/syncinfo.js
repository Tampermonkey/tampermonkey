/**
 * @filename syncinfo.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    Registry.require('xmlhttprequest');
    var xmlhttpRequest = Registry.get('xmlhttprequest').run;
    var V = true;
    var scriptAppendix = '@us';

    var _registered = false;
    var _retries = 1;
    var _id = null;
    var _type = 0;
    var _url = null;
    var _etype = { ePASTEBIN: 1,
                   eCHROMESYNC: 2 };
    var _urls = {};
    var _listeners = [];
    var _retries = 3;
    var _syncwait = 60 * 1000;
    var _lock = false;
    var _timeoffset = null;
    var _timeservers = [ { method: 'HEAD',
                           url: 'http://www.google.com',
                           extract: function(text, headers) {
                                        try {
                                            var rh = headers ? headers.split('\n') : null;
                                            for (var k in rh) {
                                                var parts = rh[k].split(':');
                                                var h = parts.shift() || "";
                                                var field = parts.join(':') || "";

                                                if (h.trim().toLowerCase() == 'date' && field) {
                                                    var tt = new Date(field);
                                                    if (tt) {
                                                        return tt.getTime() - (new Date()).getTime();
                                                    }
                                                }
                                            }
                                        } catch (e) {};
                                        return null;
                                    }
                         },
                         { method: 'GET',
                           url: 'http://json-time.appspot.com/time.json',
                           extract: function(text, headers) {
                                        try {
                                            var t = JSON.parse(text);
                                            if (!t.error &&
                                                t.datetime) {

                                                var tt = new Date(t.datetime);
                                                if (tt) {
                                                    return tt.getTime() - (new Date()).getTime();
                                                }
                                            }
                                        } catch (e) {};
                                        return null;
                                    }
                         } ];
    
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

    var getTime = function() {
        return (new Date()).getTime() + _timeoffset;
    };

    var syncTime = function(callback) {
        var srv = 0;
        var next = function() {
            srv++;
            window.setTimeout(run, 1);
        };

        var error = function() {
            _timeoffset = 0;
            console.log('si: time offset  detection failed!');
            if (callback) callback(false);
        };

        var succ = function(t) {
            _timeoffset = t;
            console.log('si: detected a time offset of ' + t + ' ms');
            if (callback) callback(true);
        };

        var run = function() {
            if (srv < _timeservers.length) {
                var o = _timeservers[srv];
                
                var details = {
                    method: o.method,
                    url: o.url,
                };

                var got = function(req) {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            var t = o.extract(req.responseText, req.responseHeaders);
                            if (t === null) {
                                next();
                            } else {
                                succ(t);
                            }
                        } else {
                            next();
                        }
                    }
                };

                if (V) console.log('si: determine time offset with server ' + o.url);
                xmlhttpRequest(details, got);
            } else {
                error();
            };
        };

        run();
    };
    
    var registerOnChange = function() {
        if (_registered) return;
        _registered = true;
        chrome.storage.onChanged.addListener(handleChange);
    };

    var handleChange = function(changes, ns) {
        if (_type == _etype.eCHROMESYNC &&
               ns == 'sync') {

            if (_timeoffset === null) {
                var done = function() {
                    handleChange(changes, ns);
                };
                syncTime(done);
                return;
            }

            var re = new RegExp(scriptAppendix + '$');
            for (var key in changes) {
                var storageChange = changes[key];
                if (V) console.log('si: storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
                                   key, ns, storageChange.oldValue, storageChange.newValue);

                if (key.search(re) == -1) {
                    if (V) console.log("si:   ^^ ignore cause it is not a script!");
                    continue;
                }

                for (var i=0; i<_listeners.length; i++) {
                    if (_syncObjects[key]) {
                        if (V) console.log("si:   ^^ ignore cause object is going to be changed right now or was changed by me!");
                    } else {
                        _listeners[i](key, storageChange.oldValue, storageChange.newValue);
                    }
                }
            }
        }
    };

    var parseUrlData = function(data, cb) {
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
                    parseUrlData(req.responseText, callback);
                } else {
                    if (callback) callback([]);
                }
            }
        };
        xmlhttpRequest(details, got);
    };

    var listFromChromeSync = function(callback) {
        var selfargs = arguments;
        var again = function() {
            selfargs.callee.apply(this, selfargs);
        };
        if (_lock) {
            window.setTimeout(again, 500);
            return;
        };

        var re = new RegExp(scriptAppendix + '$');
        var gotValues = function(items) {
            var ret = [];

            for (var k in items) {
                if (k.search(re) == -1) continue;
                var id = k.replace(re, '');

                var j = null;
                try {
                    if (_syncObjects[k]) {
                        j = JSON.parse(_syncObjects[k]);
                    } else {
                        j = JSON.parse(items[k]);
                    }
                } catch (e) {}
                if (!j || !j.url) {
                    if (V) console.log('si: unable to parse extended info of ' + k);
                    continue;
                }
                ret.push({ id: id,
                           name: id.replace(/20/g, ' '),
                           url: j.url,
                           options: j.options ? j.options : {}});
            }

            _lock = false;
            
            if (callback) callback(ret);
        };

        _lock = true;
        chrome.storage.sync.get(null, gotValues);
        return null;
    };

    var _syncTimeout = null;
    var _syncObjects = {};
    var add = function(script, cb) {
        _syncObjects[script.id + scriptAppendix] = JSON.stringify({ url: script.url });
        if (_syncTimeout) {
            window.clearTimeout(_syncTimeout);
        }

        _syncTimeout = window.setTimeout(write, 3000);
        if (cb) cb();
    };

    var remove = function(script, cb) {
        _syncObjects[script.id + scriptAppendix] = JSON.stringify({ url: script.url, options: { removed: getTime() } });
        if (_syncTimeout) {
            window.clearTimeout(_syncTimeout);
        }

        _syncTimeout = window.setTimeout(write, 3000);
        if (cb) cb();
    };

    var reset = function(cb) {
        var selfargs = arguments;
        var again = function() {
            selfargs.callee.apply(this, selfargs);
        };
        if (_lock) {
            window.setTimeout(again, 500);
            return;
        };
        _lock = true;
        
        var done = function() {
            _syncObjects = {};
            _lock = false;
            if (cb) cb();
        };

        chrome.storage.sync.clear(done);
    };

    
    var write = function(callback, retry) {
        var selfargs = arguments;
        var again = function() {
            selfargs.callee.apply(this, selfargs);
        };
        if (_lock) {
            window.setTimeout(again, 500);
            return;
        };

        if (retry === undefined) retry = _retries;
        var cb = function(f) {
            var e = chrome.runtime ? chrome.runtime.lastError : f;
            if (e) {
                console.log("si: error on write " + e.message);
                if (--retry > 0) window.setTimeout(again, _syncwait);
            } else {
                _syncObjects = {};
            }
            _lock = false;
        };
        _lock = true;

        try {
            chrome.storage.sync.set(_syncObjects, cb);
        } catch (e) {
            cb(e);
        }
    };

    var list = function(callback) {
        if (_timeoffset === null) {
            var done = function() {
                list(callback);
            };
            syncTime(done);
            return;
        }
        
        if (_type == _etype.eCHROMESYNC) {
            return listFromChromeSync(callback);
        } else {
            return listFromUrl(callback);
        }

    };

    var addChangeListener = function(cb) {
        _listeners.push(cb);
    };

    Registry.register('syncinfo', {
                              init : init,
                              list: list,
                              add: add,
                              reset: reset,
                              getTime: getTime,
                              remove: remove,
                              addChangeListener : addChangeListener,
                              types: _etype});
})();

