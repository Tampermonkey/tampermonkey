/**
 * @filename ask.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var V = false;
var D = false;
var UV = false;

// help scrambling...
(function() {

var initialized = false;
var allItems = null;
var version = '0.0.0';
var gNoWarn = false;

var gArgs = null;
var gTabName = '???';

if (!window.requestFileSystem) window.requestFileSystem = window.webkitRequestFileSystem;
if (!window.BlobBuilder) window.BlobBuilder = window.WebKitBlobBuilder;

/* ########### include ############## */
Registry.require('convert');
Registry.require('xmlhttprequest');
Registry.require('compat');
Registry.require('parser');
Registry.require('crcrc');
Registry.require('helper');
Registry.require('i18n');
Registry.require('curtain');
Registry.require('tabview');

var cr = Registry.get('crcrc').cr;
var crc = Registry.get('crcrc').crc;
var Converter = Registry.get('convert');
var I18N = Registry.get('i18n');
var Please = Registry.get('curtain');
var Helper = Registry.get('helper');
var TabView = Registry.get('tabview');
var xmlhttpRequest = Registry.get('xmlhttprequest').run;
 
/* ########### main ############## */

var createPage = function() {
    var ret;
    var o = document.getElementById('ask')
    var main = crc('div', 'main_container p100100', 'ask', 'main');

    if (o) {
        var p = o.parentNode;
        p.removeChild(o);
        p.appendChild(main);
        document.body.setAttribute('class', 'main');
    }

    if (V) console.log("ask: head");

    var head = crc('div', 'head_container', 'ask', 'head_container');
    var tv = crc('div', 'tv_container', 'ask', 'tv_container');

    var heada = cr('a', 'head_link', 'ask', 'head_link');
    heada.href="http://tampermonkey.net";
    heada.target="_blank";

    var head1 = crc('div', 'float margin4', 'ask', 'head1');
    var image = crc('img', 'banner', 'ask');
    image.src = chrome.extension.getURL('images/icon128.png');

    var head2 = crc('div', 'float head margin4', 'ask', 'head2');
    var heading = cr('div', 'fire');

    var ver = crc('div', 'version', 'version', 'version');
    ver.textContent = ' by Jan Biniok';

    var search = cr('div', 'search', 'box', '');

    heading.textContent = "T" + "amper" + "m" + "onkey";

    head1.appendChild(image);
    head2.appendChild(heading);
    head2.appendChild(ver);

    heada.appendChild(head1);
    heada.appendChild(head2);

    head.appendChild(heada);
    head.appendChild(search);

    main.appendChild(head);
    main.appendChild(tv);

    var tabv = TabView.create('_main', tv);
    ret = createMainTab(tabv);

    initialized = true;
    Please.hide();

    return ret;
};

var createMainTab = function(tabv) {
    var i = {name: 'main', id: 'main'};
    var h = cr('div', i.name, i.id, 'tab_content_h');
    h.textContent = gTabName;
    var util = cr('div', i.name, i.id, 'tab_content');
    var tab = tabv.appendTab(Helper.createUniqueId(i.name, i.id), h, util);
    return util;
};

/****** main ********/
var main = function() {
   
    gArgs = Helper.getUrlArgs();

    var installNatively = function(url) {
        window.location = url + '#' + 'bypass=true';
    };

    if (gArgs.i18n) {
        I18N.setLocale(gArgs.i18n);
    }

    if (gArgs.script) {
        gArgs.script = Converter.Base64.decode(gArgs.script);

        gTabName = I18N.getMessage('Install');
        var url = gArgs.script;
        var content;

        Please.wait(I18N.getMessage("Please_wait___"));

        var createSource = function(req) {
            var heading = crc('div', 'heading', 'indzsll', 'heading');
            var heading_name = crc('div', 'nameNname64', 'install', 'heading_name');
            heading_name.textContent = gArgs.script;
            heading.appendChild(heading_name);
            content.appendChild(heading);

            var outer = crc('div', 'editor_outer', '', '');
            var editor = crc('div', 'editor', '', '');

            var textarea = crc('textarea', 'editorta', '', '');
            textarea.setAttribute('wrap', 'off');
            textarea.value = req.responseText;

            content.appendChild(outer);
            outer.appendChild(editor);
            editor.appendChild(textarea);

            if (!gArgs.nocm) {
                var edit = textarea.parentNode;
                edit.removeChild(textarea);
                content.editor = new MirrorFrame(edit, {
                        value: req.responseText,
                        noButtons: true,
                        matchBrackets: true });
            }
        };

        var showNask = function(req) {
            if (req.readyState == 4) {
                Please.hide();

                if (req.status == 200 || req.status == 0) {
                    var script = Registry.get('parser').createScriptFromSrc(req.responseText);
                    if (!script.name || script.name == '' || (script.version == undefined)) {
                        window.close();
                        return;
                    }

                    content = createPage();
                    createSource(req);

                    var ask = function() {
                        if (confirm(I18N.getMessage('Do_you_want_to_install_this_userscript_in_Tampermonkey_or_Chrome'))) {
                            Please.wait(I18N.getMessage("Please_wait___"));
                            chrome.extension.sendMessage({method: "scriptClick", url: url, id: 0}, function(response) { Please.hide(); });
                        } else {
                            installNatively(url);
                        }
                    };

                    window.setTimeout(ask, 500);
                } else {
                    Helper.alert(I18N.getMessage('Unable_to_load_script_from_url_0url0', url));
                    installNatively();
                }
            }
        };

        var details = {
            method: 'GET',
            url: url,
            retries: 3,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        };

        xmlhttpRequest(details, showNask);
    } else {
        createPage();
    }
};

/****** init ********/
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (V) console.log("a: method " + request.method);
        if (request.method == "confirm") {
            var resp = function(c) {
                sendResponse({ confirm: c });
            };
            Helper.confirm(request.msg, resp);
        } else if (request.method == "showMsg") {
            Helper.alert(request.msg);
            sendResponse({});
        } else {
            if (V) console.log("a: " + I18N.getMessage("Unknown_method_0name0" , request.method));
            return false;
        }

        return true;
    });

if (V) console.log("Register request listener (ask)");

var listener = function() {
    window.removeEventListener('DOMContentLoaded', listener, false);
    window.removeEventListener('load', listener, false);

    main();
};

window.addEventListener('DOMContentLoaded', listener, false);
window.addEventListener('load', listener, false);

})();
