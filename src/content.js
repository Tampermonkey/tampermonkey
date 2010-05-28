/**
 * @filename content.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "getSrc") {
            var t = '';
            var bodies = document.getElementsByTagName('body');
            if (bodies.length >= 1) {
                var body = bodies[0];
                t = body.innerText;
            }
            sendResponse({src: t});
        } else if (request.method == "confirm") {
            var c = confirm(request.msg);
            sendResponse({confirm: c});
        } else if (request.method == "showMsg") {
            alert(request.msg);
            sendResponse({});
        } else if (request.method == "reload") {
            window.location = window.location;
            sendResponse({});
        } else if (request.method == "executeScript") {
            eval(request.code);
            sendResponse({});
        } else if (request.method == "loadUrl") {
            window.location = request.url;
            sendResponse({});
        } else {
            console.log("unknown method " + request.method);
        }
    });

// send request when content script is loaded.. this happens just once ;)
chrome.extension.sendRequest({ method: "onUpdate" }, function(response) {});
// window.addEventListener('load', function(evt) { chrome.extension.sendRequest({ method: "onLoad" }, function(response) {}); }, false);
