/**
 * @filename i18n.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    Registry.require('helper');
    Registry.require('xmlhttprequest');

    var locale_data = {};
    var locale = null;
    var Helper = Registry.get('helper');

    var fallback = function(s) {
        var v = s;
        var a = Array.prototype.slice.call(arguments, 1);
        if (a.length == 1 && Helper.toType(a[0] === "Array")) {
            a = a[0];
        }

        var r = new RegExp("_0[a-zA-Z].*0");

        for (var i=0; i<a.length; a++) {
            if (v.search(r) == -1) {
                console.log("getMessage(): wrong argument count!!!");
                break;
            }
            v = v.replace(r, ' ' + a[i]);
        }

        return v.replace(/_/g, ' ');
    };

    var prepare = function(o, args) {
        var m = o.message;

        if (args.length == 1 && Helper.toType(args[0] === "Array")) {
            args = args[0];
        }

        for (var k in o.placeholders) {
            try {
                var c = Number(o.placeholders[k].content.replace(/^\$/, '')) - 1;
                var d;
                if (c < args.length) {
                    d = args[c];
                    m = m.replace('\$' + k + '\$', d);
                } else {
                    console.log("i18n: invalid argument count on processing '" + m + "' with args " + JSON.stringify(args));
                }
            } catch(e) {
                console.log("i18n: error processing '" + m + "' with args " + JSON.stringify(args));
            }
        }

        return m;
    };

    var getMessageOrig = function(s) {
        // default locale...
        var o = chrome.i18n.getMessage.apply(this, arguments);
        if (o) {
            // everything is ok, return original translation
            return o;
        } else {
            // fallback, replace _ and insert arguments
            return fallback.apply(this, arguments);
        }
    };

    var getMessageEx = function(s) {
        return getMessageInternal.apply(this, arguments);
    };

    var getMessageInternal = function(s) {
        if (!locale) {
            return getMessageOrig.apply(this, arguments);
        } else {
            // a locale is set
            var o = locale_data[s];
            if (o) {
                return prepare(o, Array.prototype.slice.call(arguments, 1));
            } else {
                return fallback.apply(this, arguments);
            }
        }
    };
    
    var getLocale = function() {
        return locale;
    };

    var setLocale = function(_locale) {
        if (_locale === "null") _locale = null;
        if (locale == _locale) return true;

        if (_locale) {
            var u = '_locales/' + _locale + '/messages.json';
            var c = Registry.getRaw(u);

            if (c) {
                try {
                    locale_data = JSON.parse(c);
                    locale = _locale;

                    return true;
                } catch (e) {
                    console.log("i18n: parsing locale " + _locale + " failed!");
                }
            } else {
                console.log("i18n: retrieving locale " + _locale + " failed!");
            }
        
            return false;
        } else {
            locale_data = {};
            locale = null;

            return true;
        }
    };

    var askForLocale = function(cb) {
        var resp = function(response) {
            if (cb) cb(response.i18n);
        };

        chrome.extension.sendMessage({ method: "getLocale" }, resp);
    };
 
    Registry.register('i18n', {
        getMessage: getMessageEx,
        getOriginalMessage: getMessageOrig,
        askForLocale: askForLocale,
        getLocale: getLocale,
        setLocale: setLocale
    });
})();
