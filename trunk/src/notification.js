/**
 * @filename notification.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

Registry.require('helper');
var Helper = Registry.get('helper');

function cleanup() {
    window.removeEventListener("load", load, false);
    window.removeEventListener("DOMContentLoaded", load, false);
}

function load() {
    cleanup();
 
    var params = Helper.getUrlArgs();
    var t = 10000;
    var notifyId = 0;

    if (params.title) {
        var d = document.getElementById('title');
        d.innerHTML = decodeURIComponent(params.title).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        d.setAttribute("style", "display:block;");
    }
    if (params.text) {
        var d = document.getElementById('text');
        d.innerHTML = decodeURIComponent(params.text).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        d.setAttribute("style", "display:block;");
    }
    if (params.link) {
        var b = params.link.split(';');
        var d = document.getElementById('link');
        d.setAttribute("style", "display:block;");
        var a = document.createElement('a');
        a.innerHTML = decodeURIComponent(b[0]);
        a.setAttribute("href", decodeURIComponent(b[1]));
        a.setAttribute("target", "_blank");
        d.appendChild(a);
    }

    if (params.delay) {
        t = Number(params.delay);
    }
    if (params.image) {
        var d = document.getElementById('image');
        d.src = decodeURIComponent(params.image);
        d.setAttribute("style", "display:block; width: 48px; height: 48px;");
    }
    
    if (params.notifyId) {
        notifyId = params.notifyId;
        document.body.addEventListener("click", function() {
                                           var bg = chrome.extension.getBackgroundPage();
                                           var customEvent = document.createEvent("MutationEvent");
                                           customEvent.initMutationEvent("notify_" + notifyId,
                                                                         false,
                                                                         false,
                                                                         null,
                                                                         null,
                                                                         null,
                                                                         null,
                                                                         null);
                                           bg.dispatchEvent(customEvent);
                                           window.close();
                                       });
    }
    if (params.requestPerm) {
        var b = params.requestPerm.split(';');
        var perm = b[0];
        notifyId = b[1];
        document.body.addEventListener("click", function() {
                                           var done = function(granted) {
                                               var bg = chrome.extension.getBackgroundPage();
                                               var customEvent = document.createEvent("MutationEvent");
                                               customEvent.initMutationEvent("notify_" + notifyId,
                                                                             false,
                                                                             false,
                                                                             null,
                                                                             null,
                                                                             null,
                                                                             granted ? "true" : "false",
                                                                             null);
                                               bg.dispatchEvent(customEvent);
                                               window.close();
                                           };
                                           
                                           var p = { permissions : [ perm ] };
                                           chrome.permissions.request(p, done);
                                       });
    }
    if (t) window.setTimeout(function() { window.close(); }, t);
}

window.addEventListener("load", load, false);
window.addEventListener("DOMContentLoaded", load, false);
