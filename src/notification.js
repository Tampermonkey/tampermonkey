/**
 * @filename notification.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

function cleanup() {
    window.removeEventListener("load", load, false);
    window.removeEventListener("DOMContentLoaded", load, false);
}

function load() {
    cleanup();
 
    var params = window.location.search.split('&');
    var t = 10000;
    var notifyId = 0;
    for (var k in params) {
        var a = params[k].split('=');
        if (a.length < 2) continue;
        if (a[0] == "title" ||
            a[0] == "text") {
            var d = document.getElementById(a[0]);
            d.innerHTML = decodeURIComponent(a[1]).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
            d.setAttribute("style", "display:block;");
        } else if (a[0] == "delay") {
            t = Number(decodeURI(a[1]));
        } else if (a[0] == "image") {
            var d = document.getElementById(a[0]);
            d.src = decodeURIComponent(a[1]);
            d.setAttribute("style", "display:block; width: 48px; height: 48px;");
        } else if (a[0] == "notifyId") {
            notifyId = a[1];
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
    }
    if (t) window.setTimeout(function() { window.close(); }, t);
}

window.addEventListener("load", load, false);
window.addEventListener("DOMContentLoaded", load, false);
