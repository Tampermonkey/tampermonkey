/**
 * @filename action.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var V = false;

var cr = function(tag, clas) {
    return crc(tag);
};

var crc = function(tag, clas) {
    var e = document.createElement(tag);
    if (clas) e.setAttribute("class", clas);
    return e;
};

var createActionsMenu = function(items) {
    var action = document.getElementById('action');
    var p = action.parentNode;
    p.removeChild(action);
    action = cr('span');
    action.setAttribute("id", "action");
    p.appendChild(action);

    var table = crc('table', 'actiontable', 'actiontable');

    for (var k in items) {
        var i = items[k];
        var tr = crc('tr', 'actiontr');
        var span;
        var image;

        if (i.divider) {
            var t = crc('tr', 'filler');
            var d = crc('td', 'filler ');
            d.setAttribute('colspan', '3');
            var s = crc('div', 'actiondivider', 'divider', k.toString());
            d.appendChild(s);
            t.appendChild(d);
            table.appendChild(t);
        } else {
            var td1 = crc('td', 'imagetd actionimagetd');
            if (i.image) {
                if (i.id && i.userscript) {
                    var el = function() {
                        modifyScriptOptions(this.name, 'enabled', !this.oldvalue);
                    };
                    var pt = (i.position > 0) ? ((i.position < 10) ? " " + i.position  : i.position) : null
                    var g = createImageText(i.image,
                                        i.name,
                                        "enabled",
                                        "enabled",
                                        i.enabled ? chrome.i18n.getMessage('Enabled') : chrome.i18n.getMessage('Disabled'),
                                        el,
                                        pt);
                    g.oldvalue = i.enabled;
                    td1.appendChild(g);
                } else {
                    image = createImage(i.image, i.name, i.id, null, "");
                    td1.appendChild(image);
                }
            }
            var td2 = crc('td', 'actiontd');
            var ai2 = crc('div', 'actionitem', i.name, i.id, 'ai');
            td2.appendChild(ai2);
            
            if (i.checkbox) {
                var input = document.createElement('input');
                input.type = "checkbox";
                input.name = i.name;
                input.id = 'enabled';
                input.checked = i.enabled;
                var oc = function() {
                    modifyScriptOptions(this.name, this.id, this.checked);
                }
                input.addEventListener("click", oc);
                span = document.createElement('span');
                span.textContent = i.name;
                ai2.appendChild(input);
                ai2.appendChild(span);
            } else if (i.url) {
                span = document.createElement('a');
                span.href = 'javascript://nop/';
                span.url = i.url;
                span.newtab = i.newtab;
                var loc = function() {
                    loadUrl(this.url, this.newtab);
                }
                span.addEventListener("click", loc);
                span.textContent = i.name;
                td2.setAttribute("colspan", "2");
                ai2.appendChild(span);
            } else if (i.menucmd) {
                var a = document.createElement('a');
                a.href = 'javascript://nop/';
                a.id = i.id;
                var oc = function() {
                    execMenuCmd(this.id);
                }
                a.addEventListener("click", oc);
                a.textContent = i.name;
                td2.setAttribute("colspan", "2");
                ai2.appendChild(a);
            } else if (i.runUpdate) {
                var a = document.createElement('a');
                a.href = 'javascript://nop/';
                a.id = i.id;
                var uoc = function() {
                    runScriptUpdates(this.id);
                }
                a.addEventListener("click", uoc);
                a.textContent = i.name;
                td2.setAttribute("colspan", "2");
                ai2.appendChild(a);
            } else {
                span = document.createElement('span');
                span.textContent = i.name;
                td2.setAttribute("colspan", "2");
                ai2.appendChild(span);
            }
            if (i.tamperfire) {
                var process = function() {
                    var elem = span;
                    var img = image;
                    var nImg = i.doneImage;
                    var done = function(cnt, update) {
                        if (elem) {
                            if (update) {
                                elem.textContent = update;
                            } else {
                                elem.textContent = elem.textContent.replace('\?', Number(cnt));
                            }
                        }
                        if (img) img.setAttribute("src", nImg);
                    };
                    if (i.tabid) {
                        getFireItems(i.tabid, done);
                    } else {
                        td1 = null;
                        td2 = null;
                    }
                };
                process();
            }
            if (td1) tr.appendChild(td1);
            if (td2) tr.appendChild(td2);
        }
        table.appendChild(tr);
    }

    action.appendChild(table);
};

var createImageText = function(src, name, id, append, title, oc, text) {
    var wrap = cr('span', name, id, append, 'wrap', true);
    var image = cr('image', name, id, append, true);
    var spos;

    image.setAttribute("width", "16px");
    image.setAttribute("height", "16px");
    image.setAttribute("src", src);
    wrap.setAttribute("style", "cursor: pointer;");
    wrap.title = title;
    wrap.key = id;
    wrap.name = name;
    wrap.alt = ' ?';

    wrap.appendChild(image);
    spos = crc('span', 'scriptpos', name, id, 'spos');
    spos.textContent = text;
    wrap.appendChild(spos);
    
    if (oc) {
        var oco = function(evt) {
            oc.apply(wrap);
        };
        wrap.addEventListener("click", oco);
    }
    image.href = 'javascript://nop/';
    
    return wrap;
}
    
var createImage = function(src, name, id, append, title, oc, text) {
    var image = cr('image', name, id, append);

    image.setAttribute("width", "16px");
    image.setAttribute("height", "16px");
    image.setAttribute("src", src);
    image.setAttribute("style", "cursor: pointer;");
    image.title = title;
    image.key = id;
    image.name = name;
    image.alt = ' ?';

    if (oc && !image.inserted) {
        image.addEventListener("click", oc);
        image.href = 'javascript://nop/';
    }
    
    return image;
};

var loadUrl = function(url, newtab) {
    try {
        var resp = function(tab) {
            chrome.tabs.sendRequest(tab.id,
                                    {method: "loadUrl", url: url, newtab: newtab},
                                    function(response) {});
        };
        if (newtab) {
            chrome.extension.sendRequest({method: "openInTab", url: url},
                                         function(response) {});
        } else {
            chrome.tabs.getSelected(null, resp);
        }
    } catch (e) {
        alert(e);
    }
};

var runScriptUpdates = function() {
    try {
        chrome.extension.sendRequest({method: "runScriptUpdates"}, function(response) {});
    } catch (e) {
        alert(e);
    }
};

var execMenuCmd = function(id) {
    try {
        chrome.extension.sendRequest({method: "execMenuCmd", id: id}, function(response) {});
    } catch (e) {
        alert(e);
    }
};

var getFireItems = function(tabid, cb) {
    try {
        var fiResp = function(response) {
            var c = null;
            if (response.progress) {
                var a = response.progress.action + '... ';
                if (!a || a == "") a = "";
                var p = "";
                if (response.progress.state && response.progress.state.of) {
                    p = ' ' + Math.round(response.progress.state.n * 100 / response.progress.state.of) + '%';
                }
                c = (a != "" || p != "") ? a + p : null;
            }
            cb(response.cnt, c);
        }

        chrome.extension.sendRequest({method: "getFireItems", countonly: true, tabid: tabid}, fiResp);
    } catch (e) {
        alert(e);
    }

};

var modifyScriptOptions = function(name, id, value) {
    try {
        var s = { method: "modifyScriptOptions", name: name };
        if (id && id != '') s[id] = value;
        chrome.extension.sendRequest(s,
                                     function(response) {
                                         if (response && response.items) createActionsMenu(response.items);
                                     });
        document.getElementById('action').innerHTML = chrome.i18n.getMessage("Please_ wait___");
    } catch (e) {
        alert("mSo: " + e);
    }
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (V) console.log("a: method " + request.method);
        // TODO: action page pops up, no need to update?
        if (false && request.method == "updateActions") {
            createActionsMenu(request.items);
            sendResponse({});
        } else {
            if (V) console.log("a: " + chrome.i18n.getMessage("Unknown_method_0name0" , request.method));
        }
    });
