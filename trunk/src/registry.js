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
    init : function() {
    },
    register : function(name, obj, overwrite) {
        if (RD || RV || V) console.log("Registry.register " + name + " overwrite: " + overwrite);
        if (!Registry.objects[name] || overwrite) {
            Registry.objects[name] = obj;
        }
    },
    require : function(name) {
        if (RD || RV || V) console.log("Registry.require " + name);
        if (Registry.objects[name] === undefined) {
            Registry.objects[name] = null; // to avoid require loops
            Registry.loadFile(name + '.js');
        }
    },
    getRaw : function(file) {
        if (RD || RV || V) console.log("Registry.getRaw " + file);
        var url = chrome.extension.getURL(file);
        var content = null;
        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send(null);
            content = xhr.responseText;
            if (!content) console.log("WARN: content of " + file + " is null!");
        } catch (e) {
            console.log("getRawContent " + e);
        }
        return content;
    },
    loadFile : function(file, ev) {
        if (!ev) ev = window['eval']; // manifest_version: 1
        if (RV || V) console.log("Registry.loadFile " + file);
        try {
            if (ev) {
                var r = Registry.getRaw(file);
                ev(r);
            } else {
                // TODO: we need a callback to continue when the script is executed
                var s = document.createElement('script');
                s.setAttribute('src', file);
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
    }
};

window.setTimeout(Registry.init, 1);
