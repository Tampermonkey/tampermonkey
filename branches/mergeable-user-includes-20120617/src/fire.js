/**
 * @filename fire.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

// help scrambling...
(function() {

var V = false;
 
var initialized = false;
var curtain = null;
var allItems = null;
var scriptItems = null;
var scriptTable = null;
var scriptOrderDown = true;
var scriptOrder = 'rank';
var gOptions = {};
var tvCache = {};

var tabID = 0;
var tabURL = 'http://...';
var versionDB = new Date();

var gVis = undefined;
var gNVis = 'display: none;';
var gVisMove = undefined;
var gNVisMove = 'position:absolute; left: -20000px; top: -200000px; width: 1px; height: 1px;';

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
            e.inserted = false;
            e = f;
        }
        if (e) {
            e.inserted = true;
        } else {
            e = document.createElement(tag);
            e.setAttribute('id', uid);
        }
        if (clas) e.setAttribute("class", clas);
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
        console.log("fire: Error:" + JSON.stringify(err));
    }
    return e;
};

var setVisible = function(elem, vis) {
     if (vis) {
         elem.setAttribute('style', gVis);
         elem.vis = true;
     } else {
         elem.setAttribute('style', gNVis);
         elem.vis = false;
     }
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

 var getURLParam = function(p, d) {
    var q = window.location.search.split('?');
    if (q.length != 2) return d;
    var as = q[1].split('&');
    for (var r in as) {
        var a = as[r];
        var va = a.split('=');
        if (va.length != 2) continue;
        if (va[0] == p) return va[1];
    }
    return d;
};

var determineTabID = function(d) {
    return getURLParam('tab', d);
};

var determineTabURL = function(d) {
    return getURLParam('url', d);
};

var cacluateRank = function(i) {
    var rt = 0.0;
    var ri = 0.0;
    var rf = 0.0;
    var rr = 0.0;

    var n = (new Date()).getTime();

    var d = 24 * 60 * 60 * 1000;
    var w = 7 * d;
    var m = 30 * d;

    if (i['uso:timestamp']) {
        var t = i['uso:timestamp'];
        if (n - w < t) {
            rt = 1;
        } else if (n - m < t) {
            rt = .96
        } else if (n -  6 * m < t) {
            rt = .90;
        } else if (n -  24 * m < t) {
            rt = .70;
        } else {
            rt = 0;
        }
    }

    var s = i['uso:installs'];
    if (s > 500000) {
        ri = 1;
    } else if (s > 100000) {
        ri = .95;
    } else if (s > 50000) {
        ri = .90;
    } else if (s > 10000) {
        ri = .88;
    } else if (s > 1000) {
        ri = .80;
    } else {
        ri = 0.5 * (s / 1000);
    }

    var fa = i['uso:fans'];
    if (fa > 5 && s > 333) {
        var f =  s / fa;
        if (f < 333) {
            rf = 1;
        } else if (f < 1000) {
            rf = .90;
        } else if (f < 3000) {
            rf = .85;
        } else if (f < 10000) {
            rf = .80;
        } else {
            rf = 0.5 * (10000/f);
        }
    }

    var a = Number(i['uso:rating']);
    rr = a > 4 ? 1 : a / 5;

    var r = 0.25 * rt + 0.35 * ri  + 0.15 * rf + 0.25 *  rr;

    return r;
};

var round = function(n, dec) {
    n = parseFloat(n);
    if(!isNaN(n)){
        if(!dec) var dec= 0;
        var factor= Math.pow(10,dec);
        return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
    } else {
        return n;
    }
};

var createScriptTable = function(ts) {
    if (ts == undefined) ts = '';
    var i = { id: 'new', name: ts};
    var r = [];
    
    var createSortable = function(i, ext, text, cmp, dflt) {

        var t = crc('div', "settingsth", i.name, i.id, ext);
       
        var markSort = function(a, a_up, a_down) {
            var mu = document.getElementsByName('settingsth_a_up' + i.name);
            var md = document.getElementsByName('settingsth_a_down' + i.name);
            var mh;
            var ms;
            for (var e=0; e<mu.length; e++) {
                mu[e].style.display = 'none';
            }
            for (var e=0; e<md.length; e++) {
                md[e].style.display = 'none';
            }
            if (scriptOrderDown) {
                a_up.style.display = '';
            } else {
                a_down.style.display = '';
            }
        };

        var a = crc('a', "settingsth_a", i.name, i.id, ext + '_a');
        a.setAttribute('name', 'settingsth_a' + i.name);
        var a_up = crc('a', "settingsth_a_up", i.name, i.id, ext + '_a_up');
        a_up.setAttribute('name', 'settingsth_a_up' + i.name);
        var a_down = crc('a', "settingsth_a_down", i.name, i.id, ext + '_a_down');
        a_down.setAttribute('name', 'settingsth_a_down' + i.name);

        a_up.style.display = 'none';
        a_down.style.display = 'none';

        var mS = function() {
            markSort(a, a_up, a_down);
        };
        var cb = function() {
            mS();
            hideWait();
        };
        var sort = function() {
            var run = function() {
                scriptOrder = cmp;
                sortScripts(scriptItems, scriptOrder, scriptOrderDown, cb);
            };
            pleaseWait();
            window.setTimeout(run, 1);
        };
        var sortUp = function() {
            var run = function() {
                scriptOrderDown = false;
                scriptOrder = cmp;
                sortScripts(scriptItems, scriptOrder, scriptOrderDown, cb);
            };
            pleaseWait();
            window.setTimeout(run, 1);
        };
        var sortDown = function() {
            var run = function() {
                scriptOrderDown = true;
                scriptOrder = cmp;
                sortScripts(scriptItems, scriptOrder, scriptOrderDown, cb);
            };
            pleaseWait();
            window.setTimeout(run, 1);
        };

        if (!t.inserted) {
            t.appendChild(a);
            t.appendChild(a_down);
            t.appendChild(a_up);

            a.addEventListener('click', sort);
            a_up.addEventListener('click', sortUp);
            a_down.addEventListener('click', sortDown);
            a.textContent = text + " ";
            a.href = 'javascript://nop/';

            a_up.innerHTML = "&#x25BE;";
            a_up.href = 'javascript://nop/';

            a_down.innerHTML = "&#x25B4;";
            a_down.href = 'javascript://nop/';

        }

        if (dflt && !scriptOrder || cmp == scriptOrder) window.setTimeout(mS, 1); // set initial sort state

        return t;
    };

    var t = crc('div', "scripttable", i.name, i.id, 'main');
    var t1 = crc('div', "settingsth_fill", i.name, i.id, 'thead_en');
    var tf1 = crc('div', "settingsth_fill", i.name, i.id, 'thead_fill1');
    var t2 = createSortable(i, 'thead_name', chrome.i18n.getMessage('Name'), "name");
    var tf2 = crc('div', "settingsth_fill", i.name, i.id, 'thead_fill');
    var t3 = createSortable(i, 'thead_score', chrome.i18n.getMessage('Rank'), "rank", true);
    var t4 = crc('div', "settingsth", i.name, i.id, 'thead_sites');
    t4.width = "25%";
    t4.textContent = chrome.i18n.getMessage('Sites');
    var t5 = createSortable(i, 'thead_installs', chrome.i18n.getMessage('Installs'), "installs");
    var t6 = createSortable(i, 'thead_rating', chrome.i18n.getMessage('Rating'), "rating");
    var t7 = createSortable(i, 'thead_fans', chrome.i18n.getMessage('Fans'), "fans");
    var t8 = createSortable(i, 'thead_timestamp', chrome.i18n.getMessage('Last_Changed'), "timestamp");
    var t9 = crc('div', "settingsth", i.name, i.id, 'thead_homepage');
    t9.textContent = chrome.i18n.getMessage('Homepage');

    if (!t.inserted) {
        r = r.concat([t1, tf1, tf2, t2, t3, t4, t5, t6, t7, t8]);

        var tr = crc('div', 'settingstr filler', i.name, i.id, 'filler');
        for (var o=0; o<r.length;o++) {
            tr.appendChild(r[o]);
        }

        t.appendChild(tr);
    }

    return t;
};

var itemsToMenu = function(items, tabv, cb) {

    var table = null;
    var current_elem = null;
    var scripts = [];

    var getTable = function(i) {
        var t = null;

        if (i.scriptTab) {
            t = createScriptTable();
            scriptTable = t;
        } else {
            t = crc('table', "settingstable", i.name, i.id, 'main');
            var tr = crc('tr', 'settingstr filler', i.name, i.id, 'filler');
            t.appendChild(tr);
        }

        return t;
    };

    var section = null;
    var section_root = null;

    for (var k in items) {

        var i = items[k];
        if (i.id === undefined) i.id = 'item' + k;

        if (V) console.log("fire: process Item " + i.name);

        var tr = crc('tr', 'settingstr', i.name, i.id, 'outer');

        if (i.divider) {
            /* var td = cr('td', 'divider', k);
            td.setAttribute("colspan", "3");
            td.style.height = "15px";
            tr.appendChild(td); */
            tr = null;
        } else {
            var dummy = cr('td', i.name, i.id, '0');
            tr.appendChild(dummy);
            var td1 = cr('td', i.name, i.id, '1');
            var ic = i.icon || i.icon64 || i.image;
            if (ic) {
                td1.setAttribute("class", "imagetd");
                if (i.id && i.userscript) {
                    var g = createImage(ic,
                                        i.name,
                                        i.id);
                    g.oldvalue = i.enabled;
                    td1.appendChild(g);
                } else {
                    td1.appendChild(createImage(ic, i.name, i.id));
                }
            }
            if (i.option) {
                gOptions[i.id] = i.checkbox ? i.enabled : i.value;
            }
            var td2 = crc('td', 'settingstd', i.name, i.id, '2');
            tr.appendChild(td2);
            if (i.heading) {
                var h = cr('span', i.name, i.id, 'heading');
                if (!h.inserted) {
                    h.textContent = i.name;
                    var t = getTable(i);
                    table = crc('tbody', 'settingstbody', i.name, i.id, 'tbody');
                    t.appendChild(table);
                    current_elem = cr('div', i.name, i.id, 'tab_content');
                    current_elem.appendChild(t);
                    tabv.appendTab(createUniqueId(i.name, i.id), h, current_elem);
                }
                tr = null;
            } else if (i.section) {
                if (i.endsection) continue;

                var s = crc('div', 'section' + (i.width ? ' section_width' + i.width : ''), i.name, i.id);
                var h = crc('b', 'section_head', i.name, i.id, 'head');
                var c = crc('div', 'section_content', i.name, i.id, 'content');
                h.textContent = i.name;
                s.appendChild(h);
                s.appendChild(c);
                if (section_root == null) {
                    section_root = crc('div', 'section_table', '', '');
                    td2.appendChild(section_root);
                    td2.setAttribute('class', 'section_td');
                }
                section_root.appendChild(s);
                section = c;
                td1 = null;
            } else if (i.userscript) {
                scripts.push({ item: i, tabv: tabv });
                tr = null;
            } else if (i.fireInfo) {
                var info = crc('span', i.name, i.id);
                info.innerHTML = i.value;
                versionDB = new Date(i.versionDB);

                if (section) {
                    section.appendChild(info);
                    tr = null;
                } else {
                    td2.appendChild(info);
                }
            } else if (i.fireUpdate) {
                var oc = function() {
                    startFireUpdate(false);
                };
                var ocf = function() {
                    startFireUpdate(true);
                };

                var input = createButton(i.name, i.id, null, i.name, oc);
                var inputf = createButton(i.fname, i.id, null, i.fname, ocf);

                if (section) {
                    section.appendChild(input);
                    section.appendChild(inputf);
                    tr = null;
                } else {
                    td2.appendChild(input);
                    td2.appendChild(inputf);
                }

            } else if (i.search) {
                tabURL = i.value;
                var search = cr('div', 'search', 'box', '');
                search.appendChild(createSearchBox());
                tr = null;
            } else if (i.version) {
                version = i.value;
                tr = null;
                var ver = crc('div', 'version', 'version', 'version');
                ver.textContent = 'v' + version + ' by Jan Biniok';
            } else  {
                var span = cr('span', i.name, i.id);
                span.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(span);
            }
            if (tr) {
                if (td1) tr.insertBefore(td1, dummy);
                if (td2) tr.appendChild(td2, dummy);
                tr.removeChild(dummy);
            }
        }
        if (table && tr) table.appendChild(tr);
    }

    scriptItems = scripts;

    var run = function() {
        sortScripts(scriptItems, null,  null, cb);
    };

    window.setTimeout(run, 1);

    if (V) console.log("sort done!");
};

var createFireMenu = function(items, use_curtain) {
    if (!items) {
        console.log("fire: items is empty!");
        return;
    }
    allItems = items;

    var o = document.getElementById('fire')
    var main = crc('div', '', 'fire', 'main');

    if (o) {
        var p = o.parentNode;
        p.removeChild(o);
        p.appendChild(main);
        document.body.setAttribute('class', 'main');
    }

    if (V) console.log("fire: head");

    var head = crc('div', 'head_container', 'fire', 'head_container');
    var tv = crc('div', 'tv_container', 'fire', 'tv_container');

    var heada = cr('a', 'head_link', 'fire', 'head_link');
    heada.href="http://tampermonkey.net";
    heada.target="_blank";

    var head1 = crc('div', 'float margin4', 'fire', 'head1');
    var image = crc('img', 'banner', 'fire');
    image.src = chrome.extension.getURL('images/icon128.png');

    var head2 = crc('div', 'float head margin4', 'fire', 'head2');
    var heading = cr('div', 'fire');

    var ver = crc('div', 'version', 'version', 'version');
    ver.textContent = ' by Jan Biniok';

    var search = cr('div', 'search', 'box', '');
    
    heading.textContent = "T" + "amper" + "F" + "ire";

    head1.appendChild(image);
    head2.appendChild(heading);
    head2.appendChild(ver);

    heada.appendChild(head1);
    heada.appendChild(head2);

    head.appendChild(heada);
    head.appendChild(search);

    main.appendChild(head);
    main.appendChild(tv);
    
    if (V) console.log("fire: tabView");
    var tabv = createTabView('_main', tv);

    if (V) console.log("fire: itemsToMenu");
    var run = function() {
        var cb = function() {
            if (use_curtain) {
                console.log("fire: done! :)");
                hideWait();
            }

            initialized = true;
        }

        itemsToMenu(items, tabv, cb);
    }

    window.setTimeout(run, 10);
};

var createSearchBox = function() {
    var search = crc('div', 'searchbox', 'search_inner');
    var search_mv = crc('div', 'searchbox_mv tv_tab', 'search_inner_mv');
    var search_input = crc('input', 'searchbox_input', 'search_input');
    var search_button = crc('input', 'searchbox_button', 'search_button');

    search_input.type = "text";
    search_input.value = tabURL;
    search_button.type = "button";
    search_button.value = "Go";

    var onC = function() {
        var v = search_input.value;
        // if (v.split('/').length < 4) v += '/';
        window.location = window.location.origin + window.location.pathname + "?url=" + encodeURI(v);
    };

    var onK = function(e) {
        if (e && e.keyCode == 13) {
            onC();
        }
    };

    search_button.addEventListener('click', onC);
    search_input.addEventListener('keyup', onK);

    search_mv.appendChild(search_input);
    search_mv.appendChild(search_button);

    search.appendChild(search_mv);
    return search;
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
        
        if (e){
            e.tab.parentNode.removeChild(e.tab);
            e.content.parentNode.removeChild(e.content);
        } else {
            console.log("tv: WARN: tab not part of tabview!");
        }
        
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

            if (closeCb) {
                var closeX = crc('div', style.tv_tab_close, id, 'tv_close' + prefix, 'tab_close');
                if (!closeX.inserted) closeX.addEventListener('click', closeCb);
                closeX.textContent = "X";
                head.appendChild(closeX);
            }

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
            if (!tvCache[prefix].g_selectedId) entry.select();

            return entry;
        }
        };
        tvCache[prefix].tv = tv;

    } else {
        tv = tvCache[prefix].tv;
    }

    return tv;
};

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

var createButton = function(name, id, value, text, oc, img) {
    var b = cr('input', name, id, 'bu');
    b.name = name;
    b.key = id;
    b.type = "button";
    b.oldvalue = value;
    b.value = text;
    if (!b.inserted && oc) b.addEventListener("click", oc);
    return b;
};

var sortFn = {
    name: function(a, b) {
        return a;
    },
    rank: function(a,b) {
        return a.rank - b.rank;
    },
    installs: function(a,b) {
        return a.installs - b.installs;
    },
    fans: function(a,b) {
        return a.fans - b.fans;
    },
    timestamp: function(b, a) {
        return a.timestamp - b.timestamp;
    },
    rating: function(a,b) {
        return a.rating - b.rating;
    }
};

var sortScripts = function(scripts, cmp, down, cb) {

    if (V) console.log("sortScripts: start");

    if (cmp === undefined || cmp === null) cmp = "rank";
    if (down === undefined || down === null) down = true;

    var id = gOptions.fire_sort_cache_enabled ? scriptOrder + '_' + scriptOrderDown.toString() : "";
    var sort = [];
    var index = 0;
    var newTable = gOptions.fire_sort_cache_enabled ? createScriptTable(id) : null;
    var cached = gOptions.fire_sort_cache_enabled ? newTable.inserted : false;
    var tr, i, td1, td2, ic, tabv;
    var delay0, delay1, delay2;
    var oldTable = scriptTable

    if (gOptions.fire_sort_cache_enabled) {
        if (cached && V) {
            console.log("use cached table " + id);
        }
        scriptTable.setAttribute('style', gNVisMove);
    }

    /* var delayedRemove = function() {
        if (V) console.log("old table removement started");
        oldTable.setAttribute('class', '');
        if (V) console.log("old table removement started 2");

        oldTable.parentNode = null;
        if (V) console.log("old table removement ended");
    }; */

    if (gOptions.fire_sort_cache_enabled) {
        scriptTable.parentNode.insertBefore(newTable, scriptTable);
        scriptTable = newTable;
        scriptTable.setAttribute('style', gVisMove);
    }

    var parent = null;

    if (!cached) {
        parent = crc('div', 'scripttbody', 'new', id, 'tbody');
        if (scriptTable) scriptTable.appendChild(parent);
    }

    delay0 = function() {
        if (V) console.log("sortScripts: delay 0");

        for (var j=0; j<scripts.length; j++) {
            tabv = scripts[j].tabv;
            i =  scripts[j].item;
            // id hack to generate new elements
            i.id = i.id + id;

            tr = crc('div', 'scripttr', i.name, i.id, 'outer');
            if (gOptions.fire_sort_cache_enabled || !tr.inserted) {
                td1 = crc('div', 'scripttd', i.name, i.id, '1');
                td2 = crc('div', 'scripttd', i.name, i.id, '2');

                ic = i.icon || i.icon64 || i.image;

                if (ic) {
                    td1.setAttribute("class", "scripttd imagetd");
                    td1.appendChild(createImage(ic, i.name, i.id));
                }
                
                tr.appendChild(td1);
                tr.appendChild(td2);
                createScriptItem(tabv, i, tr);
            }

            index++;
            sort.push({ tr: tr,
                        installs: i['uso:installs'],
                        fans: i['uso:fans'],
                        timestamp: i['uso:timestamp'],
                        rating: i['uso:rating'],
                        rank: i.rank });
        }

        if (V) console.log("sortScripts: delay 0.1");
        
        sort = sort.sort(sortFn[cmp]);

        if (V) console.log("sortScripts: delay 0.2");

        if (down) sort = sort.reverse();
        window.setTimeout(delay1, 100);
    };

    delay1 = function() {
        if (V) console.log("sortScripts: delay 1");

        
        if (gOptions.fire_sort_cache_enabled) {
            for (var i=0; i<index; i++) {
                parent.__appendChild(sort[i].tr);
            }
            window.setTimeout(delay2, 100);
        } else {
            var dummy = crc('div', '', 'dummy', 'dummy');
            parent.appendChild(dummy);

            var s = 0;
            
            var run = function() {
                var i;
                var t = (new Date()).getTime() + 15000;

                while ((new Date()).getTime() < t) {
                    // move 100 rows and check time again
                    for (i = s; (i < index) && (s + 100 > i); i++) {
                        parent.__insertBefore(sort[i].tr, dummy);
                    }
                    s = i;
                }

                if (i < index) {
                    console.log('puhhhhh: sorting is hard work...');
                    window.setTimeout(run, 1);
                } else {
                    parent.removeChild(dummy);
                    window.setTimeout(delay2, 100);
                }
            };

            run();
        }
    };

    delay2 = function() {
        if (V) console.log("sortScripts: end");
        
        sort = [];

        var cleanup = function() {
            // if (gOptions.fire_sort_cache_enabled) delayedRemove();
            if (cb) cb();
        }

        window.setTimeout(cleanup, 100);
    };

    window.setTimeout(cached || scripts.length == 0 ? delay2 : delay0, 100);
};

var createScriptUsoTab = function(i, tabd, closeEditor) {

    var tabh = cr('div', i.name, i.id, 'script_editor_h');
    tabh.textContent = 'USO';
    var tabc = cr('td', i.name, i.id, 'script_editor_c');

    var container = crc('tr', 'editor_container p100100', i.name, i.id, 'container');
    var container_menu = crc('tr', '', i.name, i.id, 'container_menu');
    var container_o = crc('table', 'editor_container_o p100100', i.name, i.id, 'container_o');

    var info_outer = crc('td', 'editor_outer', i.name, i.id, 'script_info');
    var info = crc('td', 'editor', i.name, i.id, 'script_info');
    var tab;

    container_o.appendChild(container_menu);
    container_o.appendChild(container);
    tabc.appendChild(container_o);

    var menu = crc('td', 'editormenu', i.name, i.id, 'editormenu');

    info_outer.appendChild(info);
    container.appendChild(info_outer);
    container_menu.appendChild(menu);

    var i_sc_close = createButton(i.name, 'close_script', null, chrome.i18n.getMessage('Close'), closeEditor);

    var install = function() {
        var cb = function(resp) {
            if (resp.found) {
                // if (resp.installed) {}
            } else {
                alert(chrome.i18n.getMessage("Unable_to_get_UserScript__Sry_"));
            }
        }
        chrome.extension.sendRequest({ method: "scriptClick",
                                       url: "http://userscripts.org/scripts/source/" + i['uso:script'] + ".user.js" },
                                       cb);
    };

    var install_button = createButton(i.name, 'save', null, chrome.i18n.getMessage('Install'), install);

    menu.appendChild(install_button);
    menu.appendChild(i_sc_close);

    tab = tabd.appendTab('script_editor_tab' + createUniqueId(i.name, i.id), tabh, tabc);

    return { onShow: function() {
                 var iframe = document.createElement('iframe');
                 iframe.setAttribute('class', 'script_iframe');
                 iframe.setAttribute('src', "http://greasefire.userscripts.org/scripts/show/" + i['uso:script']);
                 info.innerHTML = '';
                 info.appendChild(iframe);
             },
             onClose: function() {
             }
    }
};

var createScriptDetailsTabView = function(tab, i, tr, parent, closeTab) {
    var tab_head = crc('div', '', i.name, i.id, 'script_tab_head');

    var heading = crc('div', 'heading', i.name, 'heading');
    var heading_icon = crc('img', 'nameNicon64', i.name, 'heading_icon');
    var hicon = i.icon64 ? i.icon64 : i.icon
    heading_icon.src = hicon;
    var heading_name = crc('div', 'nameNname64', i.name, 'heading_name');
    heading_name.textContent = i.name;
    if (hicon) heading.appendChild(heading_icon);
    heading.appendChild(heading_name);
    var heading_author = crc('div', 'author', i.name, 'author');
    if (i.author) {
        heading_author.textContent = 'by ' + i.author;
    } else if (i.copyright) {
        heading_author.innerHTML = '&copy; ';
        heading_author.textContent += i.copyright;
    }

    var table = crc('table', 'noborder p100100', i.name, 'table');
    var tr1 = crc('tr', 'script_tab_head', i.name, 'tr1');
    var tr2 = crc('tr', 'details', i.name, 'tr2');
    var td1 = crc('td', '', i.name, 'td1');
    var details = crc('td', '', i.name, 'td2');
    
    heading.appendChild(heading_author);
    tab_head.appendChild(heading);
    
    td1.appendChild(tab_head);
    
    tr1.appendChild(td1);
    tr2.appendChild(details);

    table.appendChild(tr1);
    table.appendChild(tr2);
    
    parent.appendChild(table);

    var style = {
        "tv" : 'tv tv_alt',
        "tv_table" : 'tv_table tv_table_alt',
        "tr_tabs" : 'tr_tabs tr_tabs_alt',
        "tr_content" : 'tr_content tr_content_alt',
        "td_content" : 'td_content td_content_alt',
        "td_tabs" : 'td_tabs td_tabs_alt',
        "tv_tabs_align" : 'tv_tabs_align tv_tabs_align_alt',
        "tv_tabs_table" : 'tv_tabs_table tv_tabs_table_alt',
        "tv_contents" : 'tv_contents tv_contents_alt',
        "tv_tab_selected" : 'tv_tab tv_selected tv_tab_alt tv_selected_alt',
        "tv_tab_close" : '',
        "tv_tab" : 'tv_tab tv_tab_alt',
        "tv_content": 'tv_content tv_content_alt'
    };
    
    var tabd = createTabView('_details' + createUniqueId(i.name, i.id), details, style);
    var set = createScriptUsoTab(i, tabd, closeTab);

    var onKey = function(e) {
        var cancel = false;
        
        if (e.type != "keydown") return;
        if (e.keyCode == 27 /* ESC */) {
            if (tab.isSelected()) {
                window.setTimeout(closeTab, 100);
            }
            cancel = true;
        }

        if (cancel) e.stopPropagation();
    };
    
    return { onShow: function() {
                 if (set.onShow) set.onShow();
                 window.addEventListener('keydown', onKey, false);
             },
             onClose: function() {
                 if (set.onClose) {
                     if (set.onClose()) return true;
                 }
                 window.removeEventListener('keydown', onKey, false);
             }
    };
};

var createScriptItem = function(tabv, i, tr) {

    // tab stuff for later use
    var tab;
    var scriptdetails;

    var sname = crc('span', 'clickable', i.name, i.id, 'sname');

    var sname_name = crc('span', '', i.name, i.id, 'sname_name');
    var sname_elem;
    var hp = i.homepage ? i.homepage : (i['namespace'] && i['namespace'].search('http://') == 0 ? i['namespace'] : null)
    var up = 'http://userscripts.org/scripts/show/' + i['uso:script'] + '/';

    sname_elem = cr('a', i.name, i.id, 'sname_name_a');
    if (!sname_elem.inserted) {
        // sname_elem.setAttribute('href', up);
        sname_elem.setAttribute('target', '_blank');
        sname_name.appendChild(sname_elem);
    }

    sname_elem.textContent = (i.name.length > 35) ? i.name.substr(0,35) + '...' : i.name;
    sname.appendChild(sname_name);

    var ret = [];

    var getTD = function(i, child, app, clas) {
        if (!clas) clas = 'scripttd';
        var td1 = crc('div', clas, i.name, i.id, app)
        if (child) td1.appendChild(child);
        return td1;
    };

    var doClose = function() {
        if (scriptdetails.onClose && scriptdetails.onClose()) return;
        if (tab) tab.hide();
    };

    var createTab = function() {
        var tabh = crc('div', '', i.name, i.id, 'details_h');
        tabh.textContent = chrome.i18n.getMessage('Edit') + ' - ' + ((i.name.length > 25) ? i.name.substr(0,25) + '...' : i.name);
        var tabc = cr('div', i.name, i.id, 'details_c');

        tab = tabv.insertTab(null, 'details_' + createUniqueId(i.name, i.id), tabh, tabc, null, doClose);

        scriptdetails = createScriptDetailsTabView(tab, i, tr, tabc, doClose);
    };

    var scriptClick = function(e) {
        if (!tab) createTab()
        if (scriptdetails.onShow) scriptdetails.onShow();
        tab.show();
        if (e.button != 1) {
            tab.select();
        }
    };

    var srank = cr('span', i.name, i.id, 'srank');
    var sinstalls = cr('span', i.name, i.id, 'sinstalls');
    var srating = cr('span', i.name, i.id, 'srating');
    var sfans = cr('span', i.name, i.id, 'sfans');
    var stimestamp = cr('span', i.name, i.id, 'stimestamp');
    var shomepage = cr('span', i.name, i.id, 'shomepage');
    var shomepage_elem = cr('a',i.name, i.id, 'shomepage_a');

    i.rank = cacluateRank(i);
    srank.textContent = round(i.rank * 100, 1);
    sinstalls.textContent = i['uso:installs'];
    srating.textContent = i['uso:rating'];
    sfans.textContent = i['uso:fans'];

    var prefixZero = function(s) {
        var r = "0" + s;
        return r.substr(r.length - 2, 2);
    };

    var time_between = function(date1, date2) {
        // The number of milliseconds in one day
        var ONE_HOUR = 1000 * 60 * 60;
        var ONE_DAY = 1000 * 60 * 60 * 24;

        // Convert both dates to milliseconds
        var date1_ms = date1.getTime()
        var date2_ms = date2.getTime()

        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(date1_ms - date2_ms)

        // Convert back to days and return
        var h = Math.round(difference_ms/ONE_HOUR);
        var d = Math.round(difference_ms/ONE_DAY);
        if (h <= 48) {
            return h + " h";
        } else {
            return d + " d";
        }
    };

    if (i['uso:timestamp'] != 0) {
        stimestamp.textContent = time_between(versionDB, new Date(i['uso:timestamp']));
    }

    shomepage.appendChild(shomepage_elem);
    if (!shomepage_elem.inserted) {
        shomepage_elem.setAttribute('href', hp);
        shomepage_elem.setAttribute('target', '_blank');
        shomepage.appendChild(sname_elem);
    }

    // add click listener to td to make this more convenient
    var sname_td = getTD(i, sname, 'script_td2', 'scripttd scripttd_name clickable');
    sname_td.addEventListener('click', scriptClick);
    sname_td.title = i.description ? i.name + '\n\n' + i.description : i.name;
    
    ret.push(sname_td);
    ret.push(getTD(i, srank, 'script_td3'));
    ret.push(getTD(i, createImagesFromScript(i), 'script_td4'));
    ret.push(getTD(i, sinstalls, 'script_td5'));
    ret.push(getTD(i, srating, 'script_td6'));
    ret.push(getTD(i, sfans, 'script_td7'));
    ret.push(getTD(i, stimestamp, 'script_td8'));
    ret.push(getTD(i, shomepage, 'script_td9'));

    for (var o= ret.length; o<10; o++) {
        ret.push(crc('div', 'scripttd', i.name, i.id, 'script_filler_'+o));
    }

    // tr.removeChild(tr.lastChild);
    // tr.appendChild(cr('td', i.name, i.id, 'script_prefiller_1'));
    tr.appendChild(crc('div', 'scripttd', i.name, i.id, 'script_prefiller_2'));

    for (var u=0; u<ret.length;u++) {
        tr.appendChild(ret[u]);
    }

    return ret;
};

var createImagesFromScript = function(i) {
    var span = cr('span', i.name, i.id, 'site_images', true);
    var getInfo = function(inc) {
        if (inc.search("http") != 0) inc = "http://" + inc;
        var sl = inc.split('/');
        if (sl.length < 3) return null;
        var ps = sl[2].split('.');
        if (ps.length < 2) return null;
        var tld = ps[ps.length-1];
        var dom = ps[ps.length-2];
        var predom = [];
        for (var t=ps.length-3; t>=0; t--) {
            if (ps[t].search('\\*') != -1) break;
            predom.push(ps[t]);
        }
        return { tld: tld, dom: dom, predom: predom.reverse()};
    };

    if (i.includes) {
        var d = 0;
        for (var o=0; o<i.includes.length;o++) {
            var inc = i.includes[o];
            if (inc.search(/htt(ps|p):\/\/(\*\/\*|\*)*$/) != -1 ||
                inc == "*") {
                var img = createImage(chrome.extension.getURL('images/web.png'),
                                      i.name,
                                      i.id,
                                      i.includes[o],
                                      i.includes[o]);
                span.appendChild(img);
                break;
                continue;
            }
            var inf = getInfo(inc);
            if (inf == null) continue;
            var drin = false;
            for (var p=0; p<o; p++) {
                var pinc = i.includes[p];
                var pinf = getInfo(pinc);
                if (pinf == null) continue;
                if (pinf.dom == inf.dom) {
                    drin = true;
                    break;
                }
            }
            if (!drin) {
                var tld = 'com';
                var predom = '';
                if (inf.tld != '*' && inf.tld != 'tld') tld = inf.tld;
                if (inf.predom.length) predom = inf.predom.join('.') + '.';
                var ico = ("http://" + predom + inf.dom + '.' + tld + '/favicon.ico').replace(/\*/g, '');
                if (ico.search('http://userscripts.org/') == 0 ||
                    ico.search('http://userscripts.com/') == 0) ico = 'http://userscripts.org/images/script_icon.png';
                var img = createImage(ico,
                                      i.name,
                                      i.id,
                                      i.includes[o],
                                      i.includes[o]);
                span.appendChild(img);
                d++;
            }
            if (d > 7) {
                var tbc = crc('span',
                              i.name,
                              i.id,
                              "tbc");
                tbc.textContent = '...';
                span.appendChild(tbc);
                break;
            }
        }
    }
    return span;
};

var getFireItems = function(tab, url) {
    if (V) console.log("run getFireItems");
    try {
        var s = { method: "getFireItems", tabid: tab, url: url  };

        if (V) console.log("getFireItems sendReq");

        var onResp = function(response) {
            try {
                var use_curtain = true;
                if (response.progress) {
                    var a = response.progress.action + '... ';
                    if (!a || a == "") a = "";
                    var p = "";
                    if (response.progress.state && response.progress.state.of) {
                        p = ' ' + Math.round(response.progress.state.n * 100 / response.progress.state.of) + '%';
                    }
                    var c = (a != "" || p != "") ? a + p : null;
                    pleaseWait(c);
                    var retry = function() {
                        getFireItems(tab, url);
                    }
                    window.setTimeout(retry, 2000);
                    use_curtain = false;
                }
                if (response.scripts) {
                    createFireMenu(response.scripts, use_curtain);
                    if (V) console.log("createFireMenu done!");
                }
                if (response.image) {
                    var image = crc('img', 'banner', 'fire');
                    image.src = response.image;
                }
                response = null;
            } catch (e) {
                console.log(e);
                throw e;
            }
        };

        chrome.extension.sendRequest(s, onResp);
        pleaseWait();
    } catch (e) {
        console.log("mSo: " + JSON.stringify(e));
    }
};

var startFireUpdate = function(force, cb) {
    if (V) console.log("run startFireUpdate");
    try {
        var s = { method: "startFireUpdate", force: force };
        var refresh = function() {
            getFireItems(tabID, tabURL);
        };
        chrome.extension.sendRequest(s, function(response) {
                                         if (response.suc === false) {
                                             hideWait();
                                             alert(chrome.i18n.getMessage('TamperFire_is_up_to_date_'));
                                         } else {
                                             window.setTimeout(refresh, 1000);
                                         }
                                     });
        pleaseWait();
    } catch (e) {
        console.log("mSo: " + JSON.stringify(e));
    }
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
    p.setText = function(elem) { p.text = elem; };
    p.print = function(msg) { if (p.text) p.text.textContent = msg; };

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

var pleaseWait = function(msg) {
    if (msg == undefined) msg = chrome.i18n.getMessage("Please_wait___");
    if (curtain) {
        curtain.print(msg);
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

        return { all: outer, text: t };
    };

    var m = createCurtainWaitMsg(msg);
    curtain = createCurtain(m.all);
    // setTextNode
    curtain.setText(m.text);
    curtain.show();
};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (V) console.log("f: method " + request.method);
        if (request.method == "confirm") {
            var c = confirm(request.msg);
            sendResponse({confirm: c});
        } else if (request.method == "showMsg") {
            alert(request.msg);
            sendResponse({});
        } else {
            if (V) console.log("f: " + chrome.i18n.getMessage("Unknown_method_0name0" , request.method));
        }
    });

var listener = function() {
    window.removeEventListener('DOMContentLoaded', listener, false);
    window.removeEventListener('load', listener, false);
    getFireItems(tabID, tabURL);
};

window.addEventListener('DOMContentLoaded', listener, false);
window.addEventListener('load', listener, false);

var Converter = getConverter();
tabID = determineTabID();
tabURL = decodeURI(determineTabURL(encodeURI(tabURL)));

})();
