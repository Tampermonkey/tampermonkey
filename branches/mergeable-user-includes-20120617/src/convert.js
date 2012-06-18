/**
 * @filename convert.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    var UTF8 = {
	encode : function (s) {
            return unescape(encodeURIComponent(s));
	},

	decode : function (s) {
            return decodeURIComponent(escape(s));
	},
    }

    var Base64 = {
	encode : function (input) {
            var binary = ''
            for (var i = 0; i < input.length; i++) {
                binary += String.fromCharCode(input.charCodeAt(i) & 0xff)
            }
            return window.btoa(binary);
	},
	decode : function (input) {
            return atob(input);
	}
    };

    return {UTF8: UTF8,
            Base64: Base64,
            JSON: window.JSON,
            encode: function(t) { return escape(t);  },
            decode: function(t) { return unescape(t); },
            encodeR: function(t) { return t; },
            decodeR: function(t) { return t; }};
})();
