/**
 * @filename compat.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {

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

window.compaMo = window.compaMo || {

    mkCompat : function(src, script, test) {
        if (script.options.compat_metadata || test) src = window.compaMo.unMetaDataify(src);
        if (script.options.compat_foreach || test) src = window.compaMo.unEachify(src);
        if (script.options.compat_arrayleft || test) src = window.compaMo.unArrayOnLeftSideify(src);
        if (script.options.compat_forvarin /* || test */) src = window.compaMo.fixForVarXStatements(src);
        return src;
    },

    findPrototypes : function(src) {
        if (src.search(escapeForRegExp('.toSource(')) != -1) {
            return true;
        }
        var fns = ["indexOf", "lastIndexOf", "filter", "forEach", "every", "map", "some", "slice"];
        for (var k in fns) {
            if (src.search(escapeForRegExp('Array.' + fns[k] + '(')) != -1) {
                return true;
            }
        }
    },

    // for (var handler in events[ type ] )
    fixForVarXStatements : function(src) {
        src = src.replace(/for[ \t.]*\([ \t.]*var/gi, 'for (var');

        var t1 = 'for (';
        var t3 = ')';

        var arr = src.split(t1);

        for (var i = 1; i < arr.length; i++) {
            var a = arr[i];
            var e = a.search(escapeForRegExp(t3));
            if (e == -1) continue;
            var f = a.substr(0, e);
            if (f.search(/[ \r\n]*in[ \r\n]/) == -1) continue;
            var aw = f.match(/^[ \r\n]*(?:var[ \r\n\t]*)*(.*?)[ \r\n]* in [ \r\n]*(.*?)$/);

            if (aw == null || aw.length < 3) continue;
            var varname = aw[1];
            var inname = 'in';
            var arrname = aw[2];

            /*
            var m = f.split(' ');
            var varname = null;
            var inname = null;
            var arrname = null;
            for (var r in m) {
                if (m[r] != '') {
                    if (!varname) {
                        varname = m[r];
                    } else if (!inname) {
                        inname = m[r];
                    } else if (!arrname) {
                        arrname = m[r];
                    }
                }
            }*/

            if (!varname || !arrname || inname != 'in' || e > a.length) {
                continue;
            }
            var p = a.search(/\)[\n\r\t ]*\{/);
            if (p != e) {
                continue;
                /* if (getStringBetweenTags(arr[i], ')', '\n').trim() == "") {
                   arr[i] = arr[i].replace(')','){').replace(/([\n|\r].*[\n|\r|;])/, '$1}');
                   } else {
                   arr[i] = arr[i].replace(')','){').replace(/([\n|\r|;])/, '}$1');
                   } */
            }
            var b = '';
            b += '{ ' + '    if (!' + arrname + '.hasOwnProperty(' + varname + ')) continue;';
            arr[i] = arr[i].replace('{', b);
        }

        return arr.join(t1);
    },

    /*
     * unArrayOnLeftSideify(src)
     *
     * replaces i.e
     *
     *  [, name, value] = line.match(/\/\/ @(\S+)\s*(.*)/);
     *
     * by
     *
     *  var __narf6439 = line.match(/\/\/ @(\S+)\s*(.*)/);;
     *  name = __narf6439[1];
     *  value = __narf6439[2];
     *  ...
     *
     */
    unArrayOnLeftSideify : function(src) {

        var lines = src.split('\n');

        for (var k in lines) {
            var line = lines[k];
            var wosp = line.replace(/[\t ]/g, '');
            var a1 = wosp.search(']=');
            var a2 = wosp.search(']==');
            var k1 = wosp.search('\\[');
            if (k1 != -1) {
                var ee = wosp.substr(0, k1);
                // seems to be a valid array assignement like a[0] = 'blub';
                if (ee != '') a1 = -1;
            }

            if (a1 != -1 && a1 != a2) {
                var nl = '';
                // stupid hack detected!
                var ie = line.search("=");
                var value = line.substr(ie+1, line.length-ie-1);
                var randvar = '__narf' + k.toString();

                nl += 'var ' + randvar + ' = ' + value + ';\n';

                var vars = getStringBetweenTags(wosp, '[', ']=');
                var vara = vars.split(',');

                for (var e in vara) {
                    var v = vara[e];
                    if (v.trim() != '') nl += v + ' = ' + randvar + '[' + e + '];\n';
                }
                lines[k] = nl;
            }
        }

        return lines.join('\n');
    },

    /*
     * unEachify(src)
     *
     * replaces i.e
     *
     *  for each (mod in mods) {;
     *
     * by
     *
     *  for (var k in mods) {;
     *     mod = mods[k];
     *     ...
     *
     */
    unEachify : function(src) {
        src = src.replace(/for each[ \t]*\(/gi, 'for each(');

        var t1 = 'for each';
        var t2 = '(';
        var t3 = ')';

        var arr = src.split(t1);

        for (var i = 1; i < arr.length; i++) {
            var a = arr[i];
            if (a.substr(0,1) != "(") {
                arr[i] = ' each' + arr[i];
                continue;
            }
            var f = getStringBetweenTags(a, t2, t3);
            var m = f.split(' ');
            var varname = null;
            var inname = null;
            var arrname = null;
            for (var e in m) {
                if (m[e] != '' && m[e] != 'var') {
                    if (!varname) {
                        varname = m[e];
                    } else if (!inname) {
                        inname = m[e];
                    } else if (!arrname) {
                        arrname = m[e];
                    }
                }
            }
            if (!varname || !arrname) {
                arr[i] = ' each' + arr[i];
                continue;
            }

            var n = 'var __kk in ' + arrname;
            var b = '';
            // filter the Array.prototype.filter function :-/
            b += '{\n' + '    if (!' + arrname + '.hasOwnProperty(__kk)) continue;';
            b += ' \n' + '    var ' + varname + ' = ' + arrname + '[__kk];';

            arr[i] = arr[i].replace(escapeForRegExp(f), n).replace('{', b);
        }

        return arr.join('for');
    },

    /*
     * unMetaDataify(src)
     *
     * replaces i.e
     *
     *   var code = <><![CDATA[
     *   if (this._name == null || refresh) {
     *     this._name = this.name();
     *   }
     *   ret = this._name;
     *   ]]></>.toString();
     *
     * by
     *
     *   var code = ("\n" +
     *   "    if (this._name == null || refresh) {\n" +
     *   "      this._name = this.name();\n" +
     *   "    }\n" +
     *   "    ret = this._name;\n" +
     *   "").toString();
     *   ...
     *
     */
    unMetaDataify : function(src) {
        var s = src;
        var t = src;
        var t1 = '<><![CDATA[';
        var t2 = ']]></>';
        var pos = s.search(escapeForRegExp(t1));
        while (pos != -1) {
            var p = s.substr(0, pos);
            var lc = p.lastIndexOf('\n');
            var cc = '';
            if (lc != -1) cc = p.substr(lc, p.length - lc);
            s = s.substr(pos, s.length-pos);

            // check if commented
            var c1 = cc.search("\\/\\*");
            var c2 = cc.search("\\/\\/");
            if (c1 == -1 &&
                c2 == -1) {
                var z = getStringBetweenTags(s,t1, t2);
                var x;
                x = z.replace(/\"/g, '\\"').replace(/\n/g, '\\n" + \n"');
                x = x.replace(/^\n/g, '').replace(/\n$/g, '');
                var g = t1+z+t2;
                t = t.replace(g, '(new CDATA("' + x + '"))');
            }
            s = s.substr(1, s.length-1);
            pos = s.search(escapeForRegExp(t1));
        }

        return t;
    }
};

})()
