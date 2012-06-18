/**
 * @filename parser.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {

var getConverter = function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "convert.js", false);
    xhr.send(null);
    var x = window['eval'](xhr.responseText);
    return x;
};

var Converter = getConverter();

var getScriptId = function(name) {
    var id = null;
    var name = encodeURI(name);
    var ch = name.match(/[a-zA-Z0-9]/g);
    if (ch) {
        id = ch.join('');
    } else {
        id = Converter.Base64.encode(name).match(/[a-zA-Z0-9]/g).join('');
    }
    return id;
};

var Script = function() {
    this.observers = [];
    this.icon = null;
    this.icon64 = null;
    this.fileURL = null;
    this.name = null;
    this.namespace = null;
    this.homepage = null;
    this.description = null;
    this.system = false;
    this.enabled = true;
    this.position = 0;
    this.requires = [];
    this.includes = [];
    this.matches = [];
    this.excludes = [];
    this.resources = [];
    this.lastUpdated = 0;
    this.options = {
        compat_metadata : false,
        compat_foreach : false,
        compat_arrayleft : false,
        compat_prototypes : false,
        compat_uW_gmonkey: false,
        compat_forvarin: false,
        noframes: false,
        awareOfChrome: false,
        run_at : '',
        override: { includes: false, use_includes: [], orig_includes: [],
                    matches: false, use_matches: [], orig_matches: [],
                    excludes: false, use_excludes: [], orig_excludes: [] }
    };
};

var escapeForRegExpURL = function(str, more) {
    if (more == undefined) more = [];
    var re = new RegExp( '(\\' + [ '/', '.', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ].concat(more).join('|\\') + ')', 'g');
    return str.replace(re, '\\$1');
};

var escapeForRegExp = function(str, more) {
    return escapeForRegExpURL(str, ['*']);
};

var getStringBetweenTags = function(source, tag1, tag2) {
    var b = source.search(escapeForRegExp(tag1));
    if (b == -1) {
        return "";
    }
    if (!tag2) {
        return source.substr(b + tag1.length);
    }
    var e = source.substr(b + tag1.length).search(escapeForRegExp(tag2));

    if (e == -1) {
        return "";
    }
    return source.substr(b + tag1.length, e);
};

window.scriptParser = window.scriptParser || {
    Script : Script,
    getScriptId : getScriptId,
    processMetaHeader : function(header) {
        var meta = {};

        var tags = ['uso:hash', 'version', 'name' ];

        // security...
        header = header.replace(/\'/gi, '').replace(/\"/gi, '');
        // convinience ;)
        header = header.replace(/\t/gi, '    ');
        header = header.replace(/\r/gi, '');

        for (var t in tags) {
            meta[tags[t]] = getStringBetweenTags(header, '@'+tags[t], '\n').trim();
        }

        if (V || UV) console.log("parser: processMetaHeader -> " + JSON.stringify(meta));

        return meta;
    },

    processHeader : function(header) {
        var script = new Script();

        var tags = ['name', 'namespace', 'version', 'author', 'copyright', 'description'];

        // Attention: long tags at first!!!
        var icon_tags = ['iconURL', 'defaulticon', 'icon'];
        var icon64_tags = ['icon64URL', 'icon64' ];
        var homepage_tags = ['homepageURL', 'homepage', 'website', 'source'];

        // security...
        header = header.replace(/\'/g, '').replace(/\"/g, '');
        // convinience ;)

        header = header.replace(/\t/g, '    ');
        header = header.replace(/\r/g, '\n');
        header = header.replace(/\n\n+/g, '\n');
        header = header.replace(/[^|\n][ \t]+\/\//g, '//')

        for (var t in tags) {
            script[tags[t]] = getStringBetweenTags(header, '@'+tags[t], '\n').trim();;
        }

        var lines = header.split('\n');
        for (var i in lines) {
            var l = lines[i].replace(/^[\t\s]*\/\//gi, '').replace(/^[\t\s]*/gi, '').replace(/\s\s+/gi, ' ');
            var c = false;

            for (var t in icon64_tags) {
                var s = getStringBetweenTags(l, '@'+icon64_tags[t]).trim();
                if (s != '') {
                    script.icon64 = s;
                    c = true;
                    break;
                }
            }
            if (c) continue;

            for (var t in icon_tags) {
                var s = getStringBetweenTags(l, '@'+icon_tags[t]).trim();
                if (s != '') {
                    script.icon = s;
                    c = true;
                    break;
                }
            }
            if (c) continue;

            for (var t in homepage_tags) {
                var s = getStringBetweenTags(l, '@'+homepage_tags[t]).trim();
                if (s != '') {
                    script.homepage = s;
                    c = true;
                    break;
                }
            }
            if (c) continue;

            if (l.search(/^@include/) != -1) {
                var c = l.replace(/^@include/gi, '').trim().replace(/ /gi, '%20').replace(/[\b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.includes.push(c);
            }
            if (l.search(/^@match/) != -1) {
                var c = l.replace(/^@match/gi, '').trim().replace(/ /gi, '%20').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.matches.push(c);
                script.options.awareOfChrome = true;
            }
            if (l.search(/^@exclude/) != -1) {
                var c = l.replace(/^@exclude/gi, '').trim().replace(/ /gi, '%20').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.excludes.push(c);
            }
            if (l.search(/^@require/) != -1) {
                var c = l.replace(/^@require/gi, '').trim().replace(/ /gi, '%20').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                var o = { url: c, loaded: false, textContent: ''};
                if (c.trim() != "") script.requires.push(o);
            }
            if (l.search(/^@resource/) != -1) {
                var c = l.replace(/^@resource/gi, '').replace(/[\r\n]/gi, '');
                var s = c.trim().split(' ');
                if (V) console.log("c " + c);
                if (V) console.log("s " + s);
                if (s.length >= 2) {
                    script.resources.push({name: s[0], url: s[1], loaded: false});
                }
            }
            if (l.search(/^@run-at/) != -1) {
                var c = l.replace(/^@run-at/gi, '').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.options.run_at = c.trim();
            }
            if (l.search(/^@noframes/) != -1) {
                script.options.noframes = true;
            }
            if (l.search(/^@nocompat/) != -1) {
                script.options.awareOfChrome = true;
            }
        }

        if (script.name) {
            script.id = getScriptId(script.name);
            if (D) console.log('parser: script ' + script.name + ' got id ' + script.id);
        }
        if (script.version == '') script.version = "0.0";

        return script;
    },

    getHeader : function(src) {
        var t1 = '==UserScript==';
        var t2 = '==/UserScript==';

        var header = getStringBetweenTags(src, t1, t2);

        if (!header || header == '') {
            return null;
        }

        var b1 = '<html>';
        var b2 = '<body>';
        var p0 = src.search(t1);
        var p1 = src.search(b1);
        var p2 = src.search(b2);

        if ((p1 > 0 && p1 < p0) ||
            (p2 > 0 && p2 < p0)) {
            // seems to be a html document
            return null;
        }

        return header;
    },
    
    createScriptFromSrc : function(src) {
        // save some space ;)
        src = src.replace(/\r/g, '');

        var header = window.scriptParser.getHeader(src);
        if (!header) return {};
        var script = window.scriptParser.processHeader(header);

        script.textContent = src;
        script.header = header;

        if (!script.options.awareOfChrome) {
            // var comp_src = compaMo.mkCompat(src, script, true)
            // if (comp_src != src) {
            script.options.compat_metadata = (src != compaMo.unMetaDataify(src));
            script.options.compat_foreach = (src != compaMo.unEachify(src));
            script.options.compat_arrayleft = (src != compaMo.unArrayOnLeftSideify(src));
            // script.options.compat_forvarin = (src != compaMo.fixForVarXStatements(src));
            script.options.compat_prototypes = compaMo.findPrototypes(src);
            // }
        }

        if (src.search("unsafeWindow.gmonkey") != -1) {
            script.options.compat_uW_gmonkey = true;
        }

        return script;
    }
};

})();
