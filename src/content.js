/**
 * @filename content.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "confirm") {
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

// send request when a node is inserted at the the document and remove the listener
var domEvent = "DOMNodeInserted";
var domEventListener = function() {
    window.document.removeEventListener(domEvent, domEventListener, false);
    window.setTimeout(function() { chrome.extension.sendRequest({ method: "onUpdate" }, function(response) {}); }, 500);
};
window.document.addEventListener(domEvent, domEventListener, false);
                                      
