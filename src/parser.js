/**
 * @filename parser.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {

Registry.require('helper');
Registry.require('convert');
Registry.require('compat');

var Converter = Registry.get('convert');
var Helper = Registry.get('helper');
var compaMo = Registry.get('compat');

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
    this.downloadURL = null;
    this.updateURL = null;
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
    this.sync = { imported: false },
    this.options = {
        comment : null,
        compatopts_for_requires : true,
        compat_metadata : false,
        compat_foreach : false,
        compat_arrayleft : false,
        compat_prototypes : false,
        compat_uW_gmonkey: false,
        compat_forvarin: false,
        noframes: false,
        awareOfChrome: false,
        run_at : '',
        user_agent : '',
        override: { includes: false, merge_includes: true, use_includes: [], orig_includes: [],
                    matches : false, merge_matches : true, use_matches : [], orig_matches : [],
                    excludes: false, merge_excludes: true, use_excludes: [], orig_excludes: [] }
    };
};

var headerStart = '==UserScript==';
var headerStop = '==/UserScript==';
        
var scriptParser = {
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
            meta[tags[t]] = Helper.getStringBetweenTags(header, '@'+tags[t], '\n').trim();
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

        var s, t, i, l, c, o, lines = header.split('\n');
        for (i in lines) {
            l = lines[i].replace(/^[\t\s]*\/\//gi, '').replace(/^[\t\s]*/gi, '').replace(/\s\s+/gi, ' ');
            c = false;

            for (var t in tags) {
                var r = new RegExp('^@' + tags[t] + '[\\t\\s]');
                if (l.search(r) != -1) {
                    script[tags[t]] = Helper.getStringBetweenTags(l, '@'+tags[t]).trim();
                    continue;
                }
            }

            for (t in icon64_tags) {
                s = Helper.getStringBetweenTags(l, '@'+icon64_tags[t]).trim();
                if (s != '') {
                    script.icon64 = s;
                    c = true;
                    break;
                }
            }
            if (c) continue;

            for (t in icon_tags) {
                s = Helper.getStringBetweenTags(l, '@'+icon_tags[t]).trim();
                if (s != '') {
                    script.icon = s;
                    c = true;
                    break;
                }
            }
            if (c) continue;

            for (t in homepage_tags) {
                s = Helper.getStringBetweenTags(l, '@'+homepage_tags[t]).trim();
                if (s != '') {
                    script.homepage = s;
                    c = true;
                    break;
                }
            }
            if (c) continue;

            if (l.search(/^@include[\t\s]/) != -1) {
                c = l.replace(/^@include/gi, '').trim().replace(/ /gi, '%20').replace(/[\b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.includes.push(c);
            }
            if (l.search(/^@match[\t\s]/) != -1) {
                c = l.replace(/^@match/gi, '').trim().replace(/ /gi, '%20').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.matches.push(c);
                script.options.awareOfChrome = true;
            }
            if (l.search(/^@exclude[\t\s]/) != -1) {
                c = l.replace(/^@exclude/gi, '').trim().replace(/ /gi, '%20').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.excludes.push(c);
            }
            if (l.search(/^@require[\t\s]/) != -1) {
                c = l.replace(/^@require/gi, '').trim().replace(/ /gi, '%20').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                o = { url: c, loaded: false, textContent: ''};
                if (c.trim() != "") script.requires.push(o);
            }
            if (l.search(/^@resource[\t\s]/) != -1) {
                c = l.replace(/^@resource/gi, '').replace(/[\r\n]/gi, '');
                s = c.trim().split(' ');
                if (V) console.log("c " + c);
                if (V) console.log("s " + s);
                if (s.length >= 2) {
                    script.resources.push({name: s[0], url: s[1], loaded: false});
                }
            }
            if (l.search(/^@run-at[\t\s]/) != -1) {
                c = l.replace(/^@run-at/gi, '').replace(/[ \b\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.options.run_at = c.trim();
            }
            if (l.search(/^@user-agent[\t\s]/) != -1) {
                c = l.replace(/^@user-agent/gi, '').trim().replace(/[\r\n]/gi, '');
                if (V) console.log("c " + c);
                if (c.trim() != "") script.options.user_agent = c.trim();
            }
            if (l.search(/^@noframes[\t\s\r\n]?/) != -1) {
                script.options.noframes = true;
            }
            if (l.search(/^@nocompat[\t\s\r\n]?/) != -1) {
                script.options.awareOfChrome = true;
            }
            
            if (l.search(/^@updateURL[\t\s]/) != -1) {
                c = l.replace(/^@updateURL/gi, '').trim().replace(/[ \b\r\n]/gi, '');
                if (c.trim() != "") script.updateURL = c;
            }
            if (l.search(/^@downloadURL[\t\s]/) != -1) {
                c = l.replace(/^@downloadURL/gi, '').trim().replace(/[ \b\r\n]/gi, '');
                if (c.trim() != "") script.downloadURL = c;
            }
        }

        if (script.name) {
            script.id = getScriptId(script.name);
            if (D) console.log('parser: script ' + script.name + ' got id ' + script.id);
        }
        if (!script.version) script.version = "0.0";

        return script;
    },

    getHeaderTags : function() {
        return { start: headerStart,
                 stop: headerStop };
    },

    getHeader : function(src) {
        var header = Helper.getStringBetweenTags(src, headerStart, headerStop);

        if (!header || header == '') {
            return null;
        }

        var b1 = '<html>';
        var b2 = '<body>';
        var p0 = src.search(headerStart);
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
        // there still seem to be some mac users outside...
        src = src.replace(/\r/g, '\n');
        src = src.replace(/\n\n/g, '\n');
        // save some space ;)
        src = src.replace(/\r/g, '');

        var header = scriptParser.getHeader(src);
        if (!header) return {};
        var script = scriptParser.processHeader(header);

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

Registry.register('parser', scriptParser);
})();
