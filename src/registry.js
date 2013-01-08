/**
 * @filename registry.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var V;
var RV = false;
var RD = false;

var Registry = {
    objects : {},
    raw_objects : {},
    callbacks: [],
    loading: 0,
    init : function() {
    },
    onLoad: function() {
        var cb = Registry.callbacks.pop();
        if (cb) cb();
    },
    checkLoading : function() {
        var l = false;
        for (var k in Registry.objects) {
            if (!Registry.objects.hasOwnProperty(k)) continue;
            if (Registry.objects[k] === null) {
                l = true;
                break;
            }
        }
        if (!l) {
            Registry.onLoad();
        }
    },
    register : function(name, obj, overwrite) {
        if (RD || RV || V) console.log("Registry.register " + name + " overwrite: " + overwrite);
        if (!Registry.objects[name] || overwrite) {
            Registry.objects[name] = obj;
            Registry.checkLoading();
        }
    },
    registerRaw : function(name, obj, overwrite) {
        if (RD || RV || V) console.log("Registry.registerRaw " + name + " overwrite: " + overwrite);
        if (!Registry.raw_objects[name] || overwrite) {
            Registry.raw_objects[name] = obj;
        }
    },
    require : function(name) {
        if (RD || RV || V) console.log("Registry.require " + name);
        if (Registry.objects[name] === undefined) {
            console.log("Error: need " + name + ".js");
            Registry.objects[name] = null; // to avoid require loops
            Registry.loadFile(name + '.js');
        }
    },
    getRaw : function(file) {
        if (RD || RV || V) console.log("Registry.getRaw " + file);
        var content = null;
        
        if (Registry.raw_objects[file] !== undefined) {
            content = Registry.raw_objects[file];
        } else {
            var url = chrome.extension.getURL(file);
            try {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.send(null);
                content = xhr.responseText;
                if (!content) console.log("WARN: content of " + file + " is null!");
            } catch (e) {
                console.log("getRawContent " + e);
            }
        }
        return content;
    },
    loadFile : function(file, ev) {
        // if (!ev) ev = window['eval']; // manifest_version: 1
        if (RV || V) console.log("Registry.loadFile " + file);
        try {
            if (ev) {
                var r = Registry.getRaw(file);
                ev(r);
            } else {
                // TODO: we need a callback to continue when the script is executed
                var s = document.createElement('script');
                s.setAttribute('src', chrome.extension.getURL(file));
                (document.head || document.body || document.documentElement || document).appendChild(s);
            }
        } catch (e) {
            console.log("Error: Registry.load " + file + " failed! " + e.message);
        }
    },
    get : function(name) {
        if (RV || V) console.log("Registry.get " + name);
        var o = Registry.objects[name];
        if (o === undefined) {
            console.log("Error: Registry.get " + name + " wasn't required or found!");
        }
        return o;
    },
    addLoadHandler : function(cb) {
        Registry.callbacks.push(cb);
    }
};

window.setTimeout(Registry.init, 1);
