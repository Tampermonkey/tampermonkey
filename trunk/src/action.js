/**
 * @filename action.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

var createActionsMenu = function(items) {
    var action = document.getElementById('action');
    var p = action.parentNode;
    p.removeChild(action);
    action = document.createElement('table');
    action.setAttribute("id", "action");
    p.appendChild(action);

    var table = document.createElement('table');

    for (var k in items) {
        var i = items[k];
        var tr = document.createElement('tr');
        if (i.divider) {
            var td = document.createElement('td');
            td.appendChild(document.createElement('hr'));
            td.setAttribute("colspan", "3");
            tr.appendChild(td);
        } else {
            var td1 = document.createElement('td');
            if (i.image) {
                var image = document.createElement('image');
                image.setAttribute("width", "19px");
                image.setAttribute("height", "19px");
                image.setAttribute("src", i.image);
                td1.appendChild(image);
            }
            var td2 = document.createElement('td');
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
                var span = document.createElement('span');
                span.textContent = i.name;
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
            } else if (i.menucmd) {
                var a = document.createElement('a');
                a.href = '#';
                a.id = i.id;
                var oc = function() {
                    execMenuCmd(this.id);
                }
                a.addEventListener("click", oc);
                a.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(a);
            } else if (i.runUpdate) {
                var a = document.createElement('a');
                a.href = '#';
                a.id = i.id;
                var oc = function() {
                    runScriptUpdates(this.id);
                }
                a.addEventListener("click", oc);
                a.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(a);
            } else {
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

    action.appendChild(table);
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

var modifyScriptOptions = function(name, id, value) {
    try {
        var s = { method: "modifyScriptOptions", name: name };
        if (id && id != '') s[id] = value;
        chrome.extension.sendRequest(s,
                                     function(response) {
                                         createActionsMenu(response.items);
                                     });
        document.getElementById('action').innerHTML = "Please wait...";
    } catch (e) {
        alert("mSo: " + e);
    }
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        // console.log("a: method " + request.method);
        // TODO: action page pops up, no need to update?
        if (false && request.method == "updateActions") {
            createActionsMenu(request.items);
            sendResponse({});
        } else {
            console.log("a: unknown method " + request.method);
        }
    });
