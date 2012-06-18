// ==UserScript==
// @name       tamperfireDB
// @namespace  http://tampermonkey.net/
// @version    0.1.13
// @description  creates a TamperFire DB
// @include    http://fire.tampermonkey.net/*
// @include    http://tampermonkey.net/fire/*
// @copyright  2011+, Jan Biniok
// ==/UserScript==

var V = false;
var D = true;
var MIN = 1;
var MAX = 118000;
var threads = 30;

var wait = 1;
var err_wait = 100;

var running = 1;
var DB = {};
var start = (new Date()).getTime() - 1;
var sps = 0;
var cnt = 0;
var paused = false;
var parted = false;
var items = [];
var missing = [];

var setupParameters = function() {
    var h = window.location.href;
    if (h.search('start=') != -1) {
        var a = h.match(/start=([0-9]*)/);
        if (a.length == 2) {
            parted = true;
            MIN = Number(a[1]);
            MAX = Number(a[1]) + 2000;
        }
    }
    if (h.search('end=') != -1) {
        var a = h.match(/end=([0-9]*)/);
        if (a.length == 2) {
            MAX = Number(a[1]);
        }
    }
    if (h.search('threads=') != -1) {
        var a = h.match(/threads=([0-9]*)/);
        if (a.length == 2) {
            threads = Number(a[1]);
        }
    }
    if (h.search('ids=') != -1) {
        var a = h.match(/ids=([\[\], 0-9]*)/);
        if (a.length == 2) {
            parted = true;
            items = JSON.parse(a[1]);
            MIN = 0;
            MAX = items.length - 1;
        }
    }
    
    if (MIN >= MAX) {
        alert('Adjust start and end parameter!');
        return true;
    }

    if (threads > (MAX - MIN)) {
        threads = MAX - MIN;
    }
    if (items.length && threads > items.length) {
        threads = items.length;
    }
};

var addNode = function(text) {
    var d = document.createElement('span');
    d.textContent = text;
    document.body.appendChild(d);
};

var finished = function() {
    if (--running == 0) {
        printResult();
        if (!parted) addNode('}}');
        console.log("var missing = " + JSON.stringify(missing) + ";");
        alert('done');
        // var out = JSON.stringify({ scripts: DB });
        // document.body.textContent = out;
    } 
};

var Script = function() {
    this.icon = null;
    this.icon64 = null;
    this.fileURL = null;
    this.name = null;
    this.namespace = null;
    this.homepage = null;
    this.description = null;
    this.options = {};
    this.requires = [];
    this.includes = [];
    this.excludes = [];
    this.resources = [];
};

var escapeForRegExp = function(str) {
    var re = new RegExp( '(\\' + [ '/', '.', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ].join('|\\') + ')', 'g');
    return str.replace(re, '\\$1');
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

var processHeader = function(header) {
    var script = new Script();
    
    var tags = ['name', 'namespace', 'version', 'author', 'description'];
    var uso = [ 'uso:script', 'uso:timestamp', 'uso:installs', 'uso:reviews', 'uso:rating', 'uso:fans'];

    // Attention: long tags at first!!!
    var icon_tags = ['iconURL', 'defaulticon', 'icon'];
    var icon64_tags = ['icon64URL', 'icon64' ];
    var homepage_tags = ['homepage', 'homepageURL', 'website', 'source'];

    // security...
    header = header.replace(/\'/g, '').replace(/\"/g, '');
    // convinience ;)

    header = header.replace(/\t/g, '    ');
    header = header.replace(/\r/g, '\n');
    header = header.replace(/\n\n+/g, '\n');
    header = header.replace(/[^|\n][ \t]+\/\//g, '//')

    tags = tags.concat(uso);

    for (var t in tags) {
        script[tags[t]] = getStringBetweenTags(header, '@'+tags[t], '\n').trim();
    }

    try {
        script['uso:timestamp'] = Date.parse(script['uso:timestamp']);
    } catch (e) {
        script['uso:timestamp'] = 0;
    }        
    
    for (var t in icon_tags) {
        var s = getStringBetweenTags(header, '@'+icon_tags[t], '\n').trim();
        script.icon = s;
        if (s != '') break;
    }

    for (var t in icon64_tags) {
        var s = getStringBetweenTags(header, '@'+icon64_tags[t], '\n').trim();
        script.icon64 = s;
        if (s != '') break;
    }

    for (var t in homepage_tags) {
        var s = getStringBetweenTags(header, '@'+homepage_tags[t], '\n').trim();
        script.homepage = s;
        if (s != '') break;
    }

    var lines = header.split('\n');

    for (var i in lines) {
        var l = lines[i].replace(/^\/\//gi, '').replace(/^ /gi, '').replace(/\s\s+/gi, ' ');
        if (l.search(/^@include/) != -1) {
            var c = l.replace(/^@include/gi, '').replace(/[ \b\r\n]/gi, '');
            if (V) console.log("c " + c);
            if (c.trim() != "") script.includes.push(c);
        }
        if (l.search(/^@match/) != -1) {
            var c = l.replace(/^@match/gi, '').replace(/[ \b\r\n]/gi, '');
            if (V) console.log("c " + c);
            if (c.trim() != "") script.includes.push(c);
        }
        if (l.search(/^@exclude/) != -1) {
            var c = l.replace(/^@exclude/gi, '').replace(/[ \b\r\n]/gi, '');
            if (V) console.log("c " + c);
            if (c.trim() != "") script.excludes.push(c);
        }
        if (l.search(/^@require/) != -1) {
            var c = l.replace(/^@require/gi, '').replace(/[ \b\r\n]/gi, '');
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
    }

    if (script.version == '') script.version = "0.0";

    return script;
};

var printResult = function() {
    var out = JSON.stringify(DB);
    if (out.length > 2) {
        addNode(", " + out.replace(/^{/g, '').replace(/}$/g, ''));
        out = '';
        DB = {};
    }
};

var getMetaData = function(id, aid) {
    var im = (id == null);
    if (im) id = items[aid];

    if (D && ((im && aid % 10 == 0) || (!im && id % 100 == 0))) { 
        var st = Math.round(((cnt - sps) / ((new Date()).getTime() - start)) * 1000);
        start = (new Date()).getTime();
        sps = cnt;
        console.log("check ID " + id + " " + st + " scripts per second; threads = " + running);
        printResult();
    }
    var retries = 100;
    var request = null;
    var next = function() {
        cnt++;        
        var nid = im ? aid + threads : id + threads;
        if (nid > MAX) {
            finished();
        } else {
            var n = function() {
                if (im) {
                    getMetaData(null, nid);
                } else {
                    getMetaData(nid);
                }
            };
            window.setTimeout(n, wait);
        }
    };

    var onl = function(req) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                var s = processHeader(req.responseText);
                if (s.name && s.includes.length > 0) {
                    DB[id] = s;
                }
            } else if (req.status != 404) {
                var t = err_wait;
                if (req.status == 500) {
                    retries--;
                    t = err_wait * 5;
                } else {
                    retries -= 3;
                }
                if (retries > 0) {
                    window.setTimeout(request, t);
                    return;
                } else {
                    missing.push(id);                    
                    console.log("Error: getting ID " + id + " status: " + req.status);
                }
            }
            next();
        }
    };
    
    var one = function(req) {
        if (retries > 0) {
            retries -= 1;
            window.setTimeout(request, err_wait);
        } else {
            missing.push(id);
            console.log("Error: processing ID " + id + " status: " + req.status);
            next();
        }
    };
    
    request = function() {
        if (paused) {
            window.setTimeout(request, 400);
            return;
        }
        GM_xmlhttpRequest({
            method : 'GET',
            url    : 'http://userscripts.org/scripts/source/' + id + '.meta.js' + '?ts=' + (new Date()).getTime(),
            onload : onl,
            onerror : one
        });
    };

    request();
};

var pause = function() {
    paused = true;
    window.setTimeout(unpause, 4000);
};

var unpause = function() {
    paused = false;
    window.setTimeout(pause, 10000);
};

if (setupParameters()) return;

try {
    if (items.length == 0) {
        for (var r=0; r<threads; r++) {
            getMetaData(MIN + r);
            running++;
        }
    } else {
        var i = 0;
        for (var r=0; r<threads; r++) {
            getMetaData(null, i++);
            running++;
        }
    }
} catch (e) {
    console.log(e);
}

if (!parted) addNode('{ scripts: { "0": {}');
unpause();
running--;
