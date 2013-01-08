/**
 * @filename helper.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    var gVis = undefined;
    var gNVis = 'display: none;';
    var gVisMove = undefined;
    var gNVisMove = 'position:absolute; left: -20000px; top: -200000px; width: 1px; height: 1px;';
    var gUSOicon = 'http://userscripts.org/images/script_icon.png';
 
    var urlAllInvalid = '*';
    var urlAll = '://*/*';
    var urlAllHttp = 'http' + urlAll;
    var urlAllHttps = 'https' + urlAll;
    var urlSecurityIssue = '.*/';
    var urlTld = '.tld/';
    var urlTlds = 'museum|travel|aero|arpa|coop|info|jobs|name|nvus|biz|com|edu|gov|int|mil|net|org|pro|xxx|ac|ad|ae|af|ag|ai|ak|al|al|am|an|ao|aq|ar|ar|as|at|au|aw|ax|az|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|co|cr|cs|ct|cu|cv|cx|cy|cz|dc|de|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fl|fm|fo|fr|ga|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gu|gw|gy|hi|hk|hm|hn|hr|ht|hu|ia|id|id|ie|il|il|im|in|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|ks|kw|ky|ky|kz|la|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|ma|mc|md|md|me|mg|mh|mi|mk|ml|mm|mn|mn|mo|mo|mp|mq|mr|ms|ms|mt|mt|mu|mv|mw|mx|my|mz|na|nc|nc|nd|ne|ne|nf|ng|nh|ni|nj|nl|nm|no|np|nr|nu|ny|nz|oh|ok|om|or|pa|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|pr|ps|pt|pw|py|qa|re|ri|ro|ru|rw|sa|sb|sc|sc|sd|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|tn|to|tp|tr|tt|tv|tw|tx|tz|ua|ug|uk|um|us|ut|uy|uz|va|va|vc|ve|vg|vi|vi|vn|vt|vu|wa|wf|wi|ws|wv|wy|ye|yt|yu|za|zm|zw';
    var url2LevelTlds = "de.net|gb.net|uk.net|dk.org|eu.org|asn.au|com.au|conf.au|csiro.au|edu.au|gov.au|id.au|info.au|net.au|org.au|otc.au|oz.au|telememo.au|ac.cn|ah.cn|bj.cn|com.cn|cq.cn|edu.cn|gd.cn|gov.cn|gs.cn|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|jl.cn|js.cn|ln.cn|mo.cn|net.cn|nm.cn|nx.cn|org.cn|qh.cn|sc.cn|sh.cn|sn.cn|sx.cn|tj.cn|tw.cn|xj.cn|xz.cn|yn.cn|zj.cn|ac.jp|ad.jp|aichi.jp|akita.jp|aomori.jp|chiba.jp|co.jp|ed.jp|ehime.jp|fukui.jp|fukuoka.jp|fukushima.jp|gifu.jp|go.jp|gov.jp|gr.jp|gunma.jp|hiroshima.jp|hokkaido.jp|hyogo.jp|ibaraki.jp|ishikawa.jp|iwate.jp|kagawa.jp|kagoshima.jp|kanagawa.jp|kanazawa.jp|kawasaki.jp|kitakyushu.jp|kobe.jp|kochi.jp|kumamoto.jp|kyoto.jp|lg.jp|matsuyama.jp|mie.jp|miyagi.jp|miyazaki.jp|nagano.jp|nagasaki.jp|nagoya.jp|nara.jp|ne.jp|net.jp|niigata.jp|oita.jp|okayama.jp|okinawa.jp|or.jp|org.jp|osaka.jp|saga.jp|saitama.jp|sapporo.jp|sendai.jp|shiga.jp|shimane.jp|shizuoka.jp|takamatsu.jp|tochigi.jp|tokushima.jp|tokyo.jp|tottori.jp|toyama.jp|utsunomiya.jp|wakayama.jp|yamagata.jp|yamaguchi.jp|yamanashi.jp|yokohama.jp|ac.uk|co.uk|edu.uk|gov.uk|ltd.uk|me.uk|mod.uk|net.uk|nhs.uk|nic.uk|org.uk|plc.uk|police.uk|sch.uk|co.tv";
    var urlAllTlds = ("(" + [urlTlds, url2LevelTlds].join("|") + ")").replace(/\./gi, "\\.");

    var createUniqueId = function(name, id) {
        var name_ = (name != undefined) ? name.replace(/ /g, '_') : "null";
        return name_ + "_" + id;
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


    var escapeForRegExpURL = function(str, more) {
        if (more == undefined) more = [];
        var re = new RegExp( '(\\' + [ '/', '.', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ].concat(more).join('|\\') + ')', 'g');
        return str.replace(re, '\\$1');
    };

    var escapeForRegExp = function(str, more) {
        return escapeForRegExpURL(str, ['*']);
    };

    var getRegExpFromUrl = function(url, cfg, safe, match) {
        var u;
        if ((cfg.values.tryToFixUrl || safe) && url == urlAllInvalid) {
            u = urlAllHttp;
        } else if ((cfg.values.safeUrls || safe) && url != urlAllHttp && url != urlAllHttps && url.search(escapeForRegExpURL(urlSecurityIssue)) != -1) {
            u = url.replace(escapeForRegExpURL(urlSecurityIssue), urlTld);
        } else {
            u = url;
        }

        if (match) {
            // @match *.biniok.net should match at "foo.biniok.net" and "biniok.net" but not evil.de#biniok.net
            // TODO: is this allowed to work on foo.*.net too?
            // TODO: is there a better way then using <>?
            u = u.replace(/\*\.([a-z0-9A-Z\.%].*\/)/gi, "<>$1");
        }

        u = '^' + escapeForRegExpURL(u);
        u = u.replace(/\*/gi, '.*');
        u = u.replace(escapeForRegExpURL(urlTld), '.' + urlAllTlds + '\/');
        u = u.replace(/(\^|:\/\/)\.\*/, '$1([^\?#])*');
        u = u.replace("<>", '([^\/#\?]*\\.)?');

        return '(' + u + ')';
    };

    var isLocalImage = function(url) {
        var bg = 'background.js';
        var u = chrome.extension.getURL(bg);
        u = u.replace(bg, '') + 'images/';
        return (url.length >= u.length && u == url.substr(0, u.length));
    };

    var getUrlArgs = function() {
        var c = {};
        var p = window.location.search.replace(/^\?/, '');
        var args = p.split('&');
        var pair;
        for (var i=0; i<args.length; i++) {
            pair = args[i].split('=');
            if (pair.length != 2) {
                var p1 = pair[0];
                var p2 = pair.slice(1).join('=');
                pair = [p1, p2];
            }
            c[pair[0]] = decodeURI(pair[1]);
        }

        return c;
    };

    var doAlert = function(msg) {
        var t = function() {
            alert(msg);
        };
        window.setTimeout(t, 1);
    };
    
    var doConfirm = function(msg, cb) {
        var t = function() {
            var r = confirm(msg);
            cb(r);
        };
        window.setTimeout(t, 1);
    };

    var toType = function(obj) {
        return ({}).toString.apply(obj).match(/\s([a-z|A-Z]+)/)[1];
    };

    var forEach = function(arr, fn) {
        var t = toType(arr);
        if (t === "Array" ||
            t === "NodeList") {
            
            for (var r=0; r<arr.length; r++) {
                fn(arr[r], r);
            }
        } else if (t === "XPathResult") {
            var thisNode = arr.iterateNext();
            while (thisNode) {
                fn(thisNode);
                thisNode = arr.iterateNext();
            }
        } else {
            for (var k in arr) {
                if (!arr.hasOwnProperty(k)) continue;
                fn(arr[k], k);
            }
        }
    };

    var serialize = function(o) {
        var ret = '';
        for (var k in o) {
            if (!o.hasOwnProperty(k)) continue;
            if (ret != '') ret += ',';
            if (toType(o[k]) == 'Object') {
                ret += k + ':' + serialize(o[k]);
            } else if (o[k] === undefined) {
                ret += k + ':' + 'undefined';
            } else if (o[k] === null) {
                ret += k + ':' + 'null';
            } else if (toType(o[k]) == 'Function') {
                ret += k + ':' + o[k].toString();
            } else {
                ret += k + ':"' + o[k].toString() + '"';
            }
        }
        return '{' + ret + '}';
    };

    var decodeHtml = function(str) {
        return str.replace( /(?:&#x([a-fA-F0-9]+);|&#([0-9]+);)/g, function(full, m1, m2 ) {
                                if (m1) {
                                    return String.fromCharCode(parseInt(m1, 16));
                                } else {
                                    return String.fromCharCode(parseInt(m2, 10));
                                }
                            });
    };

    var encodeHtml = function(str) {
        return str.replace(/[\u00A0-\u2666]/g, function(c) {
                                    return '&#'+c.charCodeAt(0)+';';
                           });
    };

    Registry.register('helper', {
                              createUniqueId: createUniqueId,
                              getStringBetweenTags: getStringBetweenTags,
                              escapeForRegExpURL: escapeForRegExpURL,
                              escapeForRegExp: escapeForRegExp,
                              getRegExpFromUrl: getRegExpFromUrl,
                              isLocalImage: isLocalImage,
                              getUrlArgs: getUrlArgs,
                              alert : doAlert,
                              confirm : doConfirm,
                              serialize: serialize,
                              toType : toType,
                              forEach : forEach,
                              decodeHtml : decodeHtml,
                              encodeHtml : encodeHtml,
                              staticVars : {
                                  urlAllHttp: urlAllHttp,
                                  urlAllHttps: urlAllHttps,
                                  visible: gVis,
                                  invisible: gNVis,
                                  visible_move : gVisMove,
                                  invisible_move : gNVisMove,
                                  USOicon : gUSOicon } });

})();
