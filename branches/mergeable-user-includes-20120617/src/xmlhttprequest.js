/**
 * @filename xmlhttprequest.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    
var isLocalImage = function(url) {
    var bg = 'background.js';
    var u = chrome.extension.getURL(bg);
    u = u.replace(bg, '') + 'images/';
    return (url.length >= u.length && u == url.substr(0, u.length));
};

var validScheme = function(url) {
    var extimg = isLocalImage(url);
    return (url && url.length > 4 && url.substr(0,4) == 'http') || extimg;
};

window.xmlhttpRequest = window.xmlhttpRequest || function(details, callback, onreadychange, onerr, done, internal) {
    if (window.chrome != undefined &&
        window.chrome.xmlHttpRequest != undefined) {
        // Android ! :)
        window.chrome.xmlHttpRequest(details, callback);
        return;
    }
    var xmlhttp = new XMLHttpRequest();
    var createState = function() {
        var o = {
            readyState: xmlhttp.readyState,
            responseHeaders: (xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
            status: (xmlhttp.readyState == 4 ? xmlhttp.status : 0),
            statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : '')
        };
        if (xmlhttp.readyState == 4) {
            if (!xmlhttp.responseType || xmlhttp.responseType == '') {
                o.responseXML = (xmlhttp.responseXML ? escape(xmlhttp.responseXML) : null);
                o.responseText = xmlhttp.responseText;
                o.response = xmlhttp.response;
            } else {
                o.responseXML = null;
                o.responseText = null;
                o.response = xmlhttp.response;
            }
        } else {
            o.responseXML = null;
            o.responseText = '';
            o.response = null;
        }
        return o;
    };
    var onload = function() {
        var responseState = createState();
        if (responseState.readyState == 4 &&
            responseState.status != 200 &&
            responseState.status != 0 &&
            details.retries > 0) {
            details.retries--;
            // console.log("bg: error at onload, should not happen! -> retry :)")
            xmlhttpRequest(details, callback, onreadychange, onerr, done, internal);
            return;
        }
        if (callback) callback(responseState);
        if (done) done();
    };
    var onerror = function() {
        var responseState = createState();
        if (responseState.readyState == 4 &&
            responseState.status != 200 &&
            responseState.status != 0 &&
            details.retries > 0) {
            details.retries--;
            xmlhttpRequest(details, callback, onreadychange, onerr, done, internal);
            return;
        }
        if (onerr) {
            onerr(responseState);
        } else if (callback) {
            callback(responseState);
        }
        if (done) done();
        delete xmlhttp;
    };
    var onreadystatechange = function(c) {
        var responseState = createState();
        if (onreadychange) {
            try {
                if (c.lengthComputable || c.totalSize > 0 ) {
                    responseState.progress = { total: c.total,  totalSize: c.totalSize };
                } else {
                    var t = Number(getStringBetweenTags(responseState.responseHeaders, 'Content-Length:', '\n').trim());
                    if (t > 0) {
                        responseState.progress = { total: xmlhttp.responseText.length,  totalSize: t };
                    }
                }
            } catch (e) {}
            onreadychange(responseState);
        }
    };
    xmlhttp.onload = onload;
    xmlhttp.onerror = onerror;
    xmlhttp.onreadystatechange = onreadystatechange;
    try {
        if (!internal && !validScheme(details.url)) {
            throw new Error(chrome.i18n.getMessage("Invalid_scheme_of_url") + ": " + details.url);
        }
        xmlhttp.open(details.method, details.url);
        if (details.headers) {
            for (var prop in details.headers) {
                var p = prop;
                if (_webRequest.use && (prop.toLowerCase() == "user-agent" || prop.toLowerCase() == "referer"))  {
                    p = _webRequest.prefix + prop;
                }
                xmlhttp.setRequestHeader(p, details.headers[prop]);
            }
        }
        if (typeof(details.overrideMimeType) !== 'undefined') {
            xmlhttp.overrideMimeType(details.overrideMimeType);
        }
        if (typeof(details.responseType) !== 'undefined') {
            xmlhttp.responseType = details.responseType;
        }
        if (typeof(details.data) !== 'undefined') {
            xmlhttp.send(details.data);
        } else {
            xmlhttp.send();
        }
    } catch(e) {
        console.log("xhr: error: " + e.message);
        if(callback) {
            var resp = { responseXML: '',
                         responseText: '',
                         response: null,
                         readyState: 4,
                         responseHeaders: '',
                         status: 403,
                         statusText: 'Forbidden'};
            callback(resp);
        }
        if (done) done();
    }
};
})();
