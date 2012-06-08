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
var curtain = null;
var allItems = null;
var gOptions = {};
var version = '0.0.0';
var gNoWarn = false;
var tvCache = {};
var stCache = {};

var gVis = undefined;
var gNVis = 'display: none;';
var gVisMove = undefined;
var gNVisMove = 'position:absolute; left: -20000px; top: -200000px; width: 1px; height: 1px;';
var gUSOicon = 'http://userscripts.org/images/script_icon.png';
var gArgs = null;
var gTabName = '???';
 
if (!window.requestFileSystem) window.requestFileSystem = window.webkitRequestFileSystem;
if (!window.BlobBuilder) window.BlobBuilder = window.WebKitBlobBuilder;
    
var cr = function(tag, name, id, append, replace) {
    return crc(tag, null, name, id, append, replace);
};

var crc = function(tag, clas, name, id, append, replace) {
    try {
        var uid = tag + '_' + createUniqueId(name, id);
        if (append != undefined) uid += '_' + append;
        var e = document.getElementById(uid);
        if (e && replace) {
            var f = document.createElement(tag);
            f.setAttribute('id', uid);
            var p = e.parentNode;
            p.insertBefore(f, e);
            p.removeChild(e);
            e = f;
        }
        if (e) {
            e.inserted = true;
        } else {
            e = document.createElement(tag);
            e.setAttribute('id', uid);
        }
        if (clas) e.setAttribute("class", clas);
        if (!e.__removeChild) {
            e.__removeChild = e.removeChild;
            e.removeChild = function(elem) {
                e.inserted = false;
                e.__removeChild(elem);
            };
        }
        if (!e.__appendChild) {
            e.__appendChild = e.appendChild;
            e.appendChild = function(elem) {
                if (!elem.parentNode && !elem.inserted) {
                    e.__appendChild(elem);
                }
            };
        }
        if (!e.__insertBefore) {
            e.__insertBefore = e.insertBefore;
            e.insertBefore = function(elem, old) {
                if (!elem.parentNode && !elem.inserted) {
                    e.__insertBefore(elem, old);
                }
            };
        }
    } catch (err) {
        console.log("options: Error:" + JSON.stringify(err));
    }
    return e;
};

var getConverter = function() {
    return window['eval'](getRawContent("convert.js"));
};

var getRawContent = function(file) {
    var url = chrome.extension.getURL(file);
    var content = null;
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        content = xhr.responseText;
        if (!content) console.log("WARN: content of " + file + " is null!");
    } catch (e) {
        console.log("getRawContent " + e);
    }
    return content;
};

var include = function(file) {
    window['eval'](getRawContent(file));
};

var getArgs = function() {
    var c = {};
    var p = window.location.search.replace(/^\?/, '');
    var args = p.split('&');
    var pair;
    for (var i=0; i<args.length; i++) {
        pair = args[i].split('=');
        if (pair.length != 2) {
            var p1 = pair[0];
            var p2 = pair.slice(1).join('=');
            pair = [p1, p2];
        }
        c[pair[0]] = decodeURI(pair[1]);
    }
    
    return c;
};

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

    var tabv = createTabView('_main', tv);
    ret = createMainTab(tabv);

    initialized = true;
    hideWait();

    return ret;
};

var createMainTab = function(tabv) {
    var i = {name: 'main', id: 'main'};
    var h = cr('div', i.name, i.id, 'tab_content_h');
    h.textContent = gTabName;
    var util = cr('div', i.name, i.id, 'tab_content');
    var tab = tabv.appendTab(createUniqueId(i.name, i.id), h, util);
    return util;
};

// TODO: make this function shared between options, fire and ask.js!
var createTabView = function(_prefix, parent, style) {
    var prefix = _prefix.match(/[0-9a-zA-Z]/g).join('');
    var cached = false;

    if (style == undefined) {
        style = {
            "tv" : 'tv',
            "tv_table" : 'tv_table',
            "tr_tabs" : 'tr_tabs',
            "tr_content" : 'tr_content',
            "td_content" : 'td_content',
            "td_tabs" : 'td_tabs',
            "tv_tabs_table" : 'tv_tabs_table',
            "tv_tabs_align" : 'tv_tabs_align',
            "tv_contents" : 'tv_contents',
            "tv_tab_selected" : 'tv_tab tv_selected',
            "tv_tab_close" : 'tv_tab_close',
            "tv_tab" : 'tv_tab',
            "tv_content": 'tv_content'
        };
    }

    var container = crc('div', style.tv, 'main' + prefix);
    var table = crc('table', style.tv_table + ' noborder', 'main_table' + prefix);

    if (table.inserted) {
        cached = true;
    } else {
        tvCache[prefix] = {};
        tvCache[prefix].g_entries = {};
        tvCache[prefix].g_selectedId = null;
    }

    var ptr = crc('tr', style.tr_tabs, 'tabs' + parent.id + prefix);
    var ptd = crc('td', style.td_tabs, 'pages' + prefix);
    var tabs_table = crc('div', style.tv_tabs_table, 'tv_tabs_table' + prefix);
    var tabs = crc('div', style.tv_tabs_align, 'tv_tabs_align' + prefix);

    var ctr = crc('tr', style.tr_content, 'content' + parent.id + prefix);
    var ctd = crc('td', style.td_content, 'content' + prefix);
    var content = crc('table', style.tv_contents + ' noborder', 'tv_content' + prefix);

    tabs_table.appendChild(tabs);
    ptd.appendChild(tabs_table);
    ptr.appendChild(ptd);
    table.appendChild(ptr);

    ctd.appendChild(content);
    ctr.appendChild(ctd);
    table.appendChild(ctr);
    container.appendChild(table);

    parent.appendChild(container);

    var setHtmlVisible = function(elem, vis, move) {
        if (vis) {
            elem.setAttribute('style', move ? gVisMove : gVis);
        } else {
            elem.setAttribute('style', move ? gNVisMove : gNVis);
        }
        elem.setAttribute('vis', vis.toString());
    };

    var setEntryVisible = function(tab, vis) {
        var id = tab.getId();
        if (tvCache[prefix].g_entries[id]){
            if (vis == tvCache[prefix].g_entries[id].visible) return;

            tvCache[prefix].g_entries[id].visible = vis;
            setHtmlVisible(tvCache[prefix].g_entries[id].tab, vis);
        }
    };

    var setContentVisible = function(e, vis) {
        setHtmlVisible(e.content, vis, true);
    };

    var findEntryByTab = function(tab) {
        for (var k in tvCache[prefix].g_entries) {
            var e = tvCache[prefix].g_entries[k];

            if (e.tab.id == tab.id) {
                return e;
            }
        };

        return null;
    };

    var findIdByTab = function(tab) {
        for (var k in tvCache[prefix].g_entries) {
            var e = tvCache[prefix].g_entries[k];

            if (e.tab.id == tab.id) {
                return k;
            }
        };

        return null;
    };

    var selectTab = function(tab) {
        if (tab.getId() == tvCache[prefix].g_selectedId) return;
        var id = tab.getId();

        if (tvCache[prefix].g_selectedId) {
            setContentVisible(tvCache[prefix].g_entries[tvCache[prefix].g_selectedId], false);
        }

        for (var k in tvCache[prefix].g_entries) {
            var e = tvCache[prefix].g_entries[k];

            if (e.entry.getId() == id) {
                if (!e.visible) {
                    console.log("tv: WARN: tab selected but not visible!");
                } else if (!e.selected) {
                    e.tab.setAttribute('class', style.tv_tab_selected);
                    setContentVisible(e, true);
                    e.selected = true;
                }
            } else {
                if (e.selected) {
                    e.tab.setAttribute('class', style.tv_tab);
                    setContentVisible(e, false);
                    e.selected = false;
                }
            }
        }

        tvCache[prefix].g_selectedId = id;
    };

    var hideTab = function(tab) {
        var id = tab.getId();
        var sel = (id == tvCache[prefix].g_selectedId);

        if (tvCache[prefix].g_entries[id]){
            setEntryVisible(tab, false);
        } else {
            console.log("tv: WARN: tab not part of tabview!");
        }

        if (sel) {
            var f = null;
            var ff = null;
            for (var k in tvCache[prefix].g_entries) {
                if (tvCache[prefix].g_entries[k].visible) {
                    f = tvCache[prefix].g_entries[k];
                    if (!ff && !f.closable) ff = f;
                }
            }

            // select first "system" tab instead of last.
            if (!f.closable) f = ff;

            if (f) {
                f.entry.select();
            } else {
                tvCache[prefix].g_selectedId = null;
                console.log("tv: WARN: selected tab set, but entry collection empty!");
            }
        }
    };

    var showTab = function(tab) {
        var id = tab.getId();
        if (tvCache[prefix].g_entries[id]){
            setEntryVisible(tab, true);
        } else {
            console.log("tv: WARN: tab not part of tabview!");
        }
    };

    var removeTab = function(tab) {
        tab.hide();
        var id = tab.getId();
        var e = tvCache[prefix].g_entries[id];

        if (e) {
            e.tab.parentNode.removeChild(e.tab);
            e.content.parentNode.removeChild(e.content);
            var d = findIdByTab(e.tab);
            if (d) {
                delete tvCache[prefix].g_entries[d];
            }
        } else {
            console.log("tv: WARN: tab not part of tabview!");
        }

    };

    var tv = null;

    if (!cached) {
        tv = {
        removeTab : removeTab,

        appendTab : function(id, head, cont, selectCb, closeCb) {
            return this.insertTab(undefined, id, head, cont, selectCb, closeCb);
        },

        insertTab : function(before, id, head, cont, selectCb, closeCb) {

            if (before === null) {
                before = tabs.firstChild;
            }

            var tab = crc('div', '', id, 'content' + prefix);
            var old = (tab.inserted !== undefined && tab.inserted == true);

            if (closeCb) {
                // do this here, cause tab content might me overwritten!
                var closeX = crc('div', style.tv_tab_close, id, 'tv_close' + prefix, 'tab_close');
                if (!closeX.inserted) closeX.addEventListener('click', closeCb);
                closeX.textContent = "X";
                head.appendChild(closeX);
            }

            if (old) {
                var e = findEntryByTab(tab);
                if (e) return e.entry;
                console.log("tv: WARN: old tab, but not in tabs collection!");
            }

            var entry;
            var tid = (new Date()).getTime() + Math.floor(Math.random() * 061283 + 1);
            var oc = function(e) {
                // TODO: is there a better way to determine X button?!
                if (e.target.className != "" && e.target.className == style.tv_tab_close) return;
                entry.select();
            };

            tab.setAttribute('tv_id' + prefix, id);
            tab.addEventListener('click', oc);
            head.setAttribute('tv_id' + prefix, id);
            head.addEventListener('click', oc);
            tab.setAttribute('name', 'tabview_tab'+prefix);
            tab.setAttribute('class', style.tv_tab);
            tab.appendChild(head);

            if (before) {
                tabs.insertBefore(tab, before);
            } else {
                tabs.appendChild(tab);
            }

            cont.setAttribute('name', 'tabview_content'+prefix);
            cont.setAttribute('tv_id' + prefix, id);
            cont.setAttribute('class', style.tv_content);
            content.appendChild(cont);

            entry = {
                getId : function() {
                    return tid;
                },

                isVisible : function() {
                    return tab.getAttribute('vis') == 'true';
                },

                isSelected: function() {
                    return (tvCache[prefix].g_selectedId == this.getId());
                },

                remove: function() {
                    removeTab(this);
                },

                hide: function() {
                    hideTab(this);
                },

                show: function() {
                    showTab(this);
                },

                select: function() {
                    if (selectCb) selectCb();
                    selectTab(this);
                }
            };

            tvCache[prefix].g_entries[tid] = { entry: entry, tab: tab, content: cont, closable: closeCb != null }
            setContentVisible(tvCache[prefix].g_entries[tid], false);

            // tab visible b default
            entry.show();
            // select first entry added
            if (!tvCache[prefix].g_selectedId) {
                entry.select();
            }

            return entry;
        }
        };
        tvCache[prefix].tv = tv;

    } else {
        tv = tvCache[prefix].tv;
    }

    return tv;
};

var createUniqueId = function(name, id) {
    var name_ = (name != undefined) ? name.replace(/ /g, '_') : "null";
    return name_ + "_" + id;
};

var createCenterTable = function(elem, name, id, app, clas) {
    if (!app) app = '';

    var t = crc('table', 'curtable' + (clas ? ' ' + clas : ''), name, id, 'table' + app);

    // var tr1 = cr('tr', name, id, 'tr1' + app);
    var tr2 = crc('tr', (clas ? ' ' + clas : ''), name, id, 'tr2' + app);
    // var tr3 = cr('tr', name, id, 'tr3' + app);
    var td1 = crc('td', 'curtableoutertd', name, id, 'td1' + app);
    var td2 = crc('td', 'curtableinner', name, id, 'td2' + app);
    var td3 = crc('td', 'curtableoutertd', name, id, 'td3' + app);

    tr2.appendChild(td1);
    tr2.appendChild(td2);
    tr2.appendChild(td3);
    // t.appendChild(tr1);
    t.appendChild(tr2);
    // t.appendChild(tr3);

    if (elem) td2.appendChild(elem);
    return t;
}

var createCurtain = function(childnode, name, id, app, clas) {
    var p = cr('div', name, id, 'p' + app);
    var c = crc('div', 'curbg', name, id, 'c' + app);
    var d = crc('div', 'curmiddle', name, id, 'd' + app);
    if (!p.inserted) {
        p.setAttribute('class', 'curouter hide');
        p.setAttribute('style', 'z-index: ' + (name ? "10000" : "20000"));
    }
    var t = createCenterTable(childnode, name, id, app, clas);

    d.appendChild(t);
    p.appendChild(d);
    p.appendChild(c);

    p.show = function() { p.setAttribute('class', 'curouter block'); };
    p.hide = function() { p.setAttribute('class', 'curouter hide'); };
    var bs = document.getElementsByTagName('body');
    if (!bs.length) {
        console.log("Err: Body not found!");
    } else {
        bs[0].appendChild(p);
    }
    return p;
};

var hideWait = function() {
    if (curtain) window.setTimeout(function() { curtain.hide(); }, 1);
};

var pleaseWait = function() {
    if (curtain) {
        curtain.show();
        return;
    }
    var createCurtainWaitMsg = function(text) {
        var outer = document.createElement('div');
        outer.setAttribute('class', 'curcontainer');

        var head = document.createElement('div');
        head.setAttribute('class', 'curwaithead');
        var msg = document.createElement('div');
        msg.setAttribute('class', 'curwaitmsg');

        var dimg = document.createElement('div');
        var t = document.createElement('div');
        t.textContent = text;
        t.innerHTML += '<br><br>';
        t.setAttribute('class','curtext');

        var img = document.createElement('img')
        img.src = chrome.extension.getURL('images/large-loading.gif');
        dimg.appendChild(img);

        msg.appendChild(dimg);
        msg.appendChild(t);

        outer.appendChild(head);
        outer.appendChild(msg);

        return outer;
    };

    curtain = createCurtain(createCurtainWaitMsg(chrome.i18n.getMessage("Please_wait___")));
    curtain.show();
};

/****** main ********/
include('xmlhttprequest.js');
include('compat.js');
include('parser.js');
    
var main = function() {
    gArgs = getArgs();
 
    var installNatively = function(url) {
        window.location = url + '#' + 'bypass=true';
    };

    if (gArgs.script) {
        gTabName = chrome.i18n.getMessage('Install');
        var url = gArgs.script;
        var content;

        pleaseWait();

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
                hideWait();
                
                if (req.status == 200 || req.status == 0) {
                    var script = window.scriptParser.createScriptFromSrc(req.responseText);
                    if (!script.name || script.name == '' || (script.version == undefined)) {
                        installNatively(url);
                        return;
                    }

                    content = createPage();
                    createSource(req);

                    var ask = function() {
                        if (confirm(chrome.i18n.getMessage('Do_you_want_to_install_this_userscript_in_Tampermonkey_or_Chrome'))) {
                            pleaseWait();
                            chrome.extension.sendRequest({method: "scriptClick", url: url, id: 0}, function(response) { hideWait(); });
                        } else {
                            installNatively(url);
                        }
                    };

                    window.setTimeout(ask, 500);
                } else {
                    alert(chrome.i18n.getMessage('Unable_to_load_script_from_url_0url0', url));
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
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (V) console.log("a: method " + request.method);
        if (request.method == "confirm") {
            var c = confirm(request.msg);
            sendResponse({confirm: c});
        } else if (request.method == "showMsg") {
            alert(request.msg);
            sendResponse({});
        } else {
            if (V) console.log("a: " + chrome.i18n.getMessage("Unknown_method_0name0" , request.method));
        }
    });

if (V) console.log("Register request listener (ask)");

var listener = function() {
    window.removeEventListener('DOMContentLoaded', listener, false);
    window.removeEventListener('load', listener, false);
    main();
};

window.addEventListener('DOMContentLoaded', listener, false);
window.addEventListener('load', listener, false);

var Converter = getConverter();
 
})();
