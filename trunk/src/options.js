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
                var oc = function() {
                    enableScript(this.id, this.checked);
                }
                var oco = function() {
                    setOption(this.id, this.checked);
                }
                var input = createCheckbox(i.name + (i.desc ? " " + i.desc : ''), i, i.option ? oco : oc);
                td2.appendChild(input);
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
                td2.appendChild(createScriptItem(i));
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

var createInput = function(name, i, oc) {
    var s = document.createElement('span');
    var input = document.createElement('input');
    var n = name.split('##');
    input.type = "text";
    input.name = i.name;
    input.id = i.id;
    input.oldvalue = i.value;
    input.value = (i.value != undefined) ? i.value : '';
    input.addEventListener("change", oc);
    var span1 = document.createElement('span');
    var span2 = document.createElement('span');
    span1.textContent = n[0];
    if (n.length > 1) span2.textContent = n[1];
    s.appendChild(span1);
    s.appendChild(input);
    s.appendChild(span2);
    return { elem: s, input: input };
};
var createCheckbox = function(name, i, oc) {
    var s = document.createElement('span');
    var input = document.createElement('input');
    input.type = "checkbox";
    input.name = i.name;
    input.id = i.id;
    input.oldvalue = i.enabled;
    input.checked = i.enabled;
    input.addEventListener("click", oc);
    var span = document.createElement('span');
    span.textContent = name;

    s.appendChild(input);
    s.appendChild(span);
    return s;
};

var createButton = function(name, id, value, text, oc, img) {
    var b = document.createElement('input');
    b.name = name;
    b.id = id;
    b.type = "button";
    b.oldvalue = value;
    b.value = text;
    b.addEventListener("click", oc);
    return b;
};

var createPosition = function(name, e, oc) {
    var s = document.createElement('span');
    var b = document.createElement('select');
    for (var i=1; i<=e.posof; i++) {
        var o = document.createElement('option');
        o.textContent = i;
        if (i == e.pos) o.selected = true;
        b.appendChild(o);
    }
    b.id = e.id;
    b.name = e.name;
    b.addEventListener("change", oc);

    var span = document.createElement('span');
    span.textContent = name;
    s.appendChild(span);
    s.appendChild(b);
    return s;
};

var createScriptItem = function(i) {
    var outer = document.createElement('span');
    var name_ = i.name.replace('/ /g', '_');
    var id_ = 'span_' + name_; 
    var a = document.createElement('a');
    a.textContent = i.name;
    a.href = '#';
    var oc = function() {
        document.getElementById(id_).setAttribute('style', 'display:block');
    }
    a.addEventListener("click", oc);

    var sett = document.createElement('span');
    sett.setAttribute('class', 'sett');
    sett.setAttribute('id', id_);
    sett.setAttribute('style', 'display:none')

    var co = function() {
        if (this.type == 'checkbox' || this.type == 'button') {
            modifyScriptOptions(this.name, this.id, !this.oldvalue);
        } else if (this.type == 'text' || this.type == 'select-one') {
            modifyScriptOptions(this.name, this.id, this.value);
        }
    };

    sett.appendChild(createPosition('Position: ',
                                    { id: 'position', name: i.name, pos: i.position, posof: i.positionof }, co));

    if (i.id != null) {
        sett.appendChild(createButton(i.name, 'enabled', i.enabled, i.enabled ? 'Disable' : 'Enable', co));
        if (!i.system) sett.appendChild(createButton(null, null, null, 'Delete', function() {
                                          var c = confirm("Really delete this script?");
                                          if (c) saveScript(i.name, null, null);
                                      }));
    }
    sett.appendChild(createButton(null, null, null, 'Close', function() {
                                      document.getElementById(id_).setAttribute('style', 'display:none');
                                  }));

    sett.appendChild(document.createElement('br'));

    var comp = document.createElement('span');
    comp.innerText = 'GM/FF compatibility options:';


    var i_md = createCheckbox('Convert CDATA sections into a chrome compatible format',
                              { id: 'compat_metadata', name: i.name, enabled: i.compat_metadata},
                              co);
    var i_fe = createCheckbox('Replace "for each" statements',
                              { id: 'compat_foreach', name: i.name, enabled: i.compat_foreach},
                              co);
    var i_wo = createCheckbox('Remove "wrappedJSObject" statements',
                              { id: 'compat_wrappedobj', name: i.name, enabled: i.compat_wrappedobj},
                              co);

    var i_al = createCheckbox('Convert [blub, bla] = s.split(":") statements',
                              { id: 'compat_arrayleft', name: i.name, enabled: i.compat_arrayleft},
                              co);
    var i_fp = createCheckbox('Replace Array.filter function to handle regexps',
                              { id: 'compat_filterproto', name: i.name, enabled: i.compat_filterproto},
                              co);

    var i_uw = createCheckbox('Poll unsafeWindow variables ',
                              { id: 'poll_unsafewindow', name: i.name, enabled: i.poll_unsafewindow},
                              co);

    var i_av = createCheckbox('Poll all unsafeWindow variable (Attention: this might produce a lot of cpu load!)',
                              { id: 'poll_unsafewindow_allvars', name: i.name, enabled: i.poll_unsafewindow_allvars},
                              co);

    var i_ui = createInput('every ## ms',
                           { id: 'poll_unsafewindow_interval', name: i.name, value: i.poll_unsafewindow_interval},
                           co);
    
    var i_uu = createInput(' Update URL:',
                           { id: 'update_url', name: i.name, value: i.update_url});
    

    sett.appendChild(document.createElement('br'));
    sett.appendChild(comp);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(i_md);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(i_fe);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(i_wo);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(i_al);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(i_fp);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(document.createElement('hr'));
    sett.appendChild(i_uw);
    sett.appendChild(i_ui.elem);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(i_av);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(i_uu.elem);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(document.createElement('br'));

    var input = document.createElement('textarea');
    input.textContent = i.code;
    input.cols = 100;
    input.rows = 2000000000;
    input.setAttribute('wrap', 'off');
    
    sett.appendChild(input);
    sett.appendChild(document.createElement('br'));
    sett.appendChild(document.createElement('br'));
    
    if (!i.system) {
        sett.appendChild(createButton(null, null, null, 'Save', function() { saveScript(i.name, input.value, i_uu.input.value); }));
        sett.appendChild(createButton(null, null, null, 'Cancel', function() {
                                      var c = confirm("Really reset all changes?");
                                      if (c) input.textContent = i.code;
                                  }));
    sett.appendChild(document.createElement('br'));
    sett.appendChild(document.createElement('br'));
    }

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
        alert("lU: " + e);
    }
};

var saveScript = function(name, code, update_url) {
    try {
        chrome.extension.sendRequest({method: "saveScript", name: name, code: code, update_url: update_url},
                                     function(response) {
                                         createOptionsMenu(response.items);
                                     });
        document.getElementById('options').innerHTML = "Please wait...";
    } catch (e) {
        alert("sS: " + e);
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
        alert("sO: " + e);
    }
};

var modifyScriptOptions = function(name, id, value) {
    try {
        var s = { method: "modifyScriptOptions", name: name };
        if (id && id != '') s[id] = value;
        chrome.extension.sendRequest(s,
                                     function(response) {
                                         createOptionsMenu(response.items);
                                     });
        document.getElementById('options').innerHTML = "Please wait...";
    } catch (e) {
        alert("mSo: " + e);
    }
};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        // console.log("o: method " + request.method);
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
            console.log("o: unknown method " + request.method);
        }
    });
