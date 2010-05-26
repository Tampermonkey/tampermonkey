/**
 * @filename option.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var itemsToMenu = function(items) {

    var table = document.createElement('table');
    table.setAttribute("class", "settingstable");
    
    for (var k in items) {
        var i = items[k];
        var tr = document.createElement('tr');
        if (i.divider) {
            var td = document.createElement('td');
            td.setAttribute("colspan", "3");
            td.style.height = "15px";
            tr.appendChild(td);
        } else {
            var td1 = document.createElement('td');
            if (i.image) {
                td1.setAttribute("class", "imagetd");
                td1.appendChild(createImage(i.image));
            }
            var td2 = document.createElement('td');
            if (i.checkbox) {
                var input = document.createElement('input');
                input.type = "checkbox";
                input.id = i.id;
                input.checked = i.enabled;
                var oc = function() {
                    enableScript(this.id, this.checked);
                }
                var oco = function() {
                    setOption(this.id, this.checked);
                }
                input.addEventListener("click", i.option ? oco : oc);
                var span = document.createElement('span');
                span.textContent = i.name + (i.desc ? " " + i.desc : '');
                td2.appendChild(input);
                td2.appendChild(span);
            } else if (i.url) {
                var a = document.createElement('a');
                a.href = '#';
                a.url = i.url;
                a.newtab = i.newtab;
                var oc = function() {
                    loadUrl(this.url, this.newtab);
                }
                a.addEventListener("click", oc);
                a.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(a);
            } else if (i.heading) {
                var h = document.createElement('h3');
                h.textContent = i.name;
                td2.appendChild(h);
            } else if (i.menucmd) {
                var span = document.createElement('span');
                span.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(span);
            } else if (i.userscript) {
                td2.setAttribute("colspan", "2");
                td2.appendChild(createScriptItem(i.name, i.code, i.compat, i.enabled));
            } else  {
                var span = document.createElement('span');
                span.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(span);
            }
            tr.appendChild(td1);
            tr.appendChild(td2);
        }
        table.appendChild(tr);
    }

    return table;
};

var createOptionsMenu = function(items) {
    var action = document.getElementById('options');
    var p = action.parentNode;
    p.removeChild(action);
    action = document.createElement('table');
    action.setAttribute("id", "options");
    p.appendChild(action);

    var head = document.createElement('h3');
    head.textContent = "TamperMonkey Options";

    action.appendChild(head);
    action.appendChild(itemsToMenu(items));
}

var createImage = function(src) {
    var image = document.createElement('image');
    image.setAttribute("width", "19px");
    image.setAttribute("height", "19px");
    image.setAttribute("src", src);
    return image;
};


var createButton = function(value, oc, img) {
    var b = document.createElement('input');
    b.type = "button";
    b.value = value;
    b.addEventListener("click", oc);
    return b;
};

var createScriptItem = function(name, code, compated, enabled) {
    var outer = document.createElement('span');
    var name_ = name.replace('/ /g', '_');
    var id_ = 'span_' + name_; 
    var a = document.createElement('a');
    a.textContent = name;
    a.href = '#';
    var oc = function() {
        document.getElementById(id_).setAttribute('style', 'display:block');
    }
    a.addEventListener("click", oc);

    var sett = document.createElement('span');
    sett.setAttribute('class', 'sett');
    sett.setAttribute('id', id_);
    sett.setAttribute('style', 'display:none')
    
    sett.appendChild(createButton(enabled ? 'Disable' : 'Enable', function() { modifyScriptOptions(name, compated, !enabled); }));
    sett.appendChild(createButton('Delete', function() {
                                      var c = confirm("Really delete this script?");
                                      if (c) saveScript(name, null);
                                  }));
    sett.appendChild(document.createElement('br'));
    sett.appendChild(createButton(compated ? 'Disable GM/FF Compatibility Mode' : 'Enable GM/FF Compatibility Mode', function() { modifyScriptOptions(name, !compated, enabled); }));

    var closp = document.createElement('div');
    var close = createButton('Close', function() { document.getElementById(id_).setAttribute('style', 'display:none') })
    closp.setAttribute('class', "closp");
    closp.appendChild(close);
    sett.appendChild(closp);
    var input = document.createElement('textarea');
    input.textContent = code;
    input.cols = 100;
    input.rows = 2000000000;
    input.setAttribute('wrap', 'off');
    
    sett.appendChild(input);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(document.createElement('br'));
    
    sett.appendChild(createButton('Save', function() { saveScript(name, input.value); }));
    sett.appendChild(createButton('Cancel', function() {
                                      var c = confirm("Really reset all changes?");
                                      if (c) input.textContent = code;
                                  }));
    sett.appendChild(document.createElement('br'));
    sett.appendChild(document.createElement('br'));

    outer.appendChild(a);
    outer.appendChild(sett);
    return outer;
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

var saveScript = function(name, code) {
    try {
        chrome.extension.sendRequest({method: "saveScript", name: name, code: code},
                                     function(response) {
                                         createOptionsMenu(response.items);
                                     });
        document.getElementById('options').innerHTML = "Please wait...";
    } catch (e) {
        alert(e);
    }
};

var setOption = function(name, value) {
    try {
        chrome.extension.sendRequest({method: "setOption", name: name, value: value},
                                     function(response) {
                                         createOptionsMenu(response.items);
                                     });
        document.getElementById('options').innerHTML = "Please wait...";
    } catch (e) {
        alert(e);
    }
};

var modifyScriptOptions = function(name, compat, enable) {
    try {
        chrome.extension.sendRequest({method: "modifyScriptOptions", name: name, enable: enable, compat: compat},
                                     function(response) {
                                         createOptionsMenu(response.items);
                                     });
        document.getElementById('options').innerHTML = "Please wait...";
    } catch (e) {
        alert(e);
    }
};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "updateOptions") {
            createOptionsMenu(request.items);
            sendResponse({});
        } else if (request.method == "confirm") {
            var c = confirm(request.msg);
            sendResponse({confirm: c});
        } else if (request.method == "showMsg") {
            alert(request.msg);
            sendResponse({});
        } else {
            console.log("unknown method " + request.method);
        }
    });
