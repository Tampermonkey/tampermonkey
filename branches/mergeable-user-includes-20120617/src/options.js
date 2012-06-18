/**
 * @filename options.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

// help scrambling...
(function() {

var V = false;

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

var itemsToMenu = function(items, tabv) {

    var table = null;
    var current_elem = null;
    var scripts = [];

    var getTable = function(i) {
        var t = null;
        var r = [];
        if (i.scriptTab) {
            t = crc('table', "scripttable", i.name, i.id, 'main');
            var t1 = crc('th', "", i.name, i.id, 'thead_en');
            var t2 = crc('th', "settingsth", i.name, i.id, 'thead_name');
            t2.textContent = chrome.i18n.getMessage('Name');
            var t25 = crc('th', "settingsth", i.name, i.id, 'thead_ver');
            t25.textContent = chrome.i18n.getMessage('Version');
            var t3 = crc('th', "settingsth", i.name, i.id, 'thead_sites');
            t3.width = "25%";
            t3.textContent = chrome.i18n.getMessage('Sites');
            var t4 = crc('th', "settingsth", i.name, i.id, 'thead_features');
            t4.textContent = chrome.i18n.getMessage('Features');
            var t5 = crc('th', "settingsth", i.name, i.id, 'thead_edit');
            t5.textContent = chrome.i18n.getMessage('Homepage');
            var t6 = crc('th', "settingsth", i.name, i.id, 'thead_updated');
            t6.textContent = chrome.i18n.getMessage('Last_Updated');
            var t7 = crc('th', "settingsth", i.name, i.id, 'thead_sort');
            t7.textContent = chrome.i18n.getMessage('Sort');
            var t8 = crc('th', "settingsth", i.name, i.id, 'thead_del');
            t8.textContent = chrome.i18n.getMessage('Delete');

            r = r.concat([t1, t2, t25, t3, t4, t5, t6, t7, t8]);
        } else {
            t = crc('table', "settingstable", i.name, i.id, 'main');
        }

        var tr = crc('tr', 'settingstr filler', i.name, i.id, 'filler');
        for (var o=0; o<r.length; o++) {
            tr.appendChild(r[o]);
        }

        if (i.scriptTab) {
            var td = crc('td', 'settingstd filler', i.name, i.id, 'filler_td' + i.id);
            // td.width = "100%";
            tr.appendChild(td);
        }
        t.appendChild(tr);
        return t;
    };

    var section = null;
    var section_root = null;
    var section_need_save = false;

    for (var k in items) {

        var i = items[k];
        if (V) console.log("options: process Item " + i.name);

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
            if (i.image) {
                td1.setAttribute("class", "imagetd");
                if (i.id && (i.userscript || i.nativeScript)) {
                    var el = function() {
                        modifyScriptOption(this.name, this.key, !this.oldvalue);
                    };
                    var nel = function() {
                        modifyNativeScriptOption(this.name, this.key, !this.oldvalue);
                    };
                    var pt = (i.position > 0) ? ((i.position < 10) ? " " + i.position  : i.position) : null
                    var g = createImageText(i.image,
                                        i.nativeScript ? i.id : i.name,
                                        "enabled",
                                        "enabled",
                                        i.enabled ? chrome.i18n.getMessage('Enabled') : chrome.i18n.getMessage('Disabled'),
                                        i.nativeScript ? nel : el,
                                        i.nativeScript ? '' : pt);
                    g.oldvalue = i.enabled;
                    td1.appendChild(g);
                } else {
                    td1.appendChild(createImage(i.image, i.name, i.id));
                }
            }
            var td2 = crc('td', 'settingstd', i.name, i.id, '2');
            if (i.option) {
                gOptions[i.id] = i.checkbox ? i.enabled : i.value;
            }
            if (i.checkbox) {
                var oc = function() {
                    enableScript(this.key, this.checked);
                }
                var oco = function() {
                    var doit = true;
                    if (this.warning) {
                        doit = confirm(this.warning);
                        if (!doit) this.checked = !this.checked;
                    }
                    if (doit) {
                        if (this.reload) window.location.href = window.location.href;
                        setOption(this.key, this.checked, this.reload);
                    }
                }
                var input = createCheckbox(i.name, i, i.option ? oco : oc);
                if (section) {
                    section.appendChild(input.elem);
                    tr = null;
                } else {
                    td2.appendChild(input.elem);
                }
                input.elem.setAttribute('style', (i.level > gOptions.configMode) ? gNVis : gVis);
            } else if (i.input) {
                var input = createTextarea(i.name, i);
                if (section) {
                    section.appendChild(input.elem);
                    tr = null;
                    section_need_save = true;
                } else {
                    td2.appendChild(input.elem);
                }
                input.elem.setAttribute('style', (i.level > gOptions.configMode) ? gNVis : gVis);
            } else if (i.select) {
                var oc = function() {
                    setOption(this.key, this.value);
                }
                var input = createDropDown(i.name, i, i.select, oc);
                if (section) {
                    section.appendChild(input);
                    tr = null;
                } else {
                    td2.appendChild(input);
                }
                input.setAttribute('style', (i.level > gOptions.configMode) ? gNVis : gVis);
            } else if (i.url) {
                var a = cr('a', i.name, i.id);
                a.href = 'javascript://nop/';
                a.url = i.url;
                a.newtab = i.newtab;
                if (!a.inserted) {
                    var oc = function() {
                        loadUrl(this.url, this.newtab);
                    }
                    a.addEventListener("click", oc);
                }
                a.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(a);
            } else if (i.heading) {
                var h = cr('span', i.name, i.id);
                h.textContent = i.name;
                table = getTable(i);
                current_elem = cr('div', i.name, i.id, 'tab_content');
                current_elem.appendChild(table);
                tr = null;
                var tab = tabv.appendTab(createUniqueId(i.name, i.id), h, current_elem);
            } else if (i.section) {
                if (section && section_need_save) {
                    var b = cr('input', section.name, section.id, 'Save');
                    if (!b.inserted) {
                        b.type = 'button'
                        b.section = section;
                        b.value = chrome.i18n.getMessage('Save');
                        var s = function() {
                            var elems = this.section.getElementsByTagName('textarea');
                            for (var o=0; o<elems.length; o++) {
                                var val = null;
                                if (elems[o].array) {
                                    var ar = elems[o].value.split("\n");
                                    var nar = [];
                                    for (var u=0; u<ar.length; u++) {
                                        if (ar[u] && ar[u].trim() != "") nar.push(ar[u]);
                                    }
                                    val = nar;
                                } else {
                                    val = elems[o].value;
                                }
                                setOption(elems[o].key, val);
                            }
                        };
                        b.addEventListener('click', s, false);
                    }
                    section.appendChild(b);
                    tr = null;
                }
                if (i.endsection) continue;

                var s = crc('div', 'section', i.name, i.id);
                var h = crc('div', 'section_head', i.name, i.id, 'head');
                var c = crc('div', 'section_content', i.name, i.id, 'content');
                h.textContent = i.name;
                s.appendChild(h);
                s.appendChild(c);
                if (section_root == null) {
                    section_root = crc('div', 'section_table', '', '');
                    td2.appendChild(section_root);
                    td2.setAttribute('class', 'section_td');
                } else {
                    tr = null;
                    td2 = null;
                }
                section_need_save = false;
                section_root.appendChild(s);

                s.setAttribute('style', (i.level > gOptions.configMode) ? gNVis : gVis);
                section = c;
                td1 = null;
            } else if (i.menucmd) {
                var span = cr('span', i.name, i.id, false, true);
                span.textContent = i.name;
                td2.setAttribute("colspan", "2");
                td2.appendChild(span);
            } else if (i.userscript || i.nativeScript) {
                td2.setAttribute("colspan", "2");
                var tds = createScriptItem(i, tr, tabv);
                tr.setAttribute('class', 'scripttr');
                if (i.nnew) {
                    tr.setAttribute('style', 'display: none;');
                }
                for (var u=0; u<tds.length;u++) {
                    tr.appendChild(tds[u]);
                }
                if (i.userscript) scripts.push({ script: tr, pos: i.position, posof: i.positionof });
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

    sortScripts(scripts);
    return table;
};

var createUtilTab = function(tabv) {
    var i = {name: 'utils', id: 'utils'};

    var h = cr('div', i.name, i.id, 'tab_util_h');
    h.textContent = chrome.i18n.getMessage('Utilities');
    var util = cr('div', i.name, i.id, 'tab_util');
    var tab = tabv.appendTab(createUniqueId(i.name, i.id), h, util);

    // TODO: hardcoded !!
    if (50 > gOptions.configMode) {
        tab.hide();
    } else {
        tab.show();
    }

    var cont = crc('div', 'tv_util', i.name, i.id, 'tab_util_cont');

    var expo = function() {
        var exp = { 'created_by' : 'Tampermonkey', 'version' : '1', scripts: [] };

        for (var o in allItems) {
            var c = allItems[o];
            if (c.userscript && c.id && !c.system) {
                var p = { name: c.name, options: c.options, enabled: c.enabled, position: c.position };
                if (c.update_url && c.update_url.trim() != "") {
                    p.update_url = c.update_url;
                }
                if (c.code && c.code.trim() != "" ){
                    p.source = Converter.Base64.encode(Converter.UTF8.encode(c.code));
                    exp.scripts.push(p);
                } else {
                    console.log("options: Strange script: " + c.name);
                }
            }
        }

        ta.value = JSON.stringify(exp);
    };

    var impo = function(src) {
        var err = false;
        var cnt = 0;
        if (ta.value.trim() != "") {
            var m = null;
            try {
                var src = ta.value
                m = JSON.parse(src);
            } catch (e) {
                var t1 = '<body>';
                var t2 = '</body>';
                if (src.search(t1) != -1) {
                    var p1 = src.indexOf(t1);
                    var p2 = src.lastIndexOf(t2);
                    if (p1 != -1 && p2 != -1) {
                        ta.value = src.substr(p1 + t1.length, p2 - (p1 + t1.length));
                        impo();
                    }
                } else {
                    alert(chrome.i18n.getMessage('Unable_to_parse_this_'));
                }
                return;
            }
            var processScript = function(s) {
                try {
                    var name = s.name;
                    var code = Converter.UTF8.decode(Converter.Base64.decode(s.source));
                    var uu = s.update_url;

                    if (code && code.trim() != "") {
                        var resp = function(response) {
                            if (response.installed) {
                                var en = (s.enable == undefined) ? s.enabled : s.enable;
                                var o = s.options;
                                o['enabled'] = en;
                                o['position'] = s.position;
                                modifyScriptOptions(s.name, o, false);
                            }
                            if (--cnt == 0) modifyScriptOption(null, false, null, true, true);
                        };
                        cnt++;
                        chrome.extension.sendRequest({method: "saveScript",
                                                             name: name,
                                                             code: code,
                                                             reload: false,
                                                             update_url: uu},
                                                     resp);
                    }
                } catch (e) {
                    err = true;
                    console.log('options: Error while importing script ' + o.name);
                }
            }
            var p = m.scripts;
            for (var o=p.length-1; o>=0; o--) {
                processScript(p[o]);
            }
            if (err) {
                alert(chrome.i18n.getMessage("An_error_occured_during_import_"));
            }
        }
    };

    var errorHandler = function(e) {
        var msg = '';

        switch (e.code) {
          case FileError.QUOTA_EXCEEDED_ERR:
              msg = 'QUOTA_EXCEEDED_ERR';
              break;
          case FileError.NOT_FOUND_ERR:
              msg = 'NOT_FOUND_ERR';
              break;
          case FileError.SECURITY_ERR:
              msg = 'SECURITY_ERR';
              break;
          case FileError.INVALID_MODIFICATION_ERR:
              msg = 'INVALID_MODIFICATION_ERR';
              break;
          case FileError.INVALID_STATE_ERR:
              msg = 'INVALID_STATE_ERR';
              break;
          default:
              msg = 'Unknown Error';
              break;
        };

        alert('Error: ' + msg);
    };

    var impo_ls = function() {
        function onInitFs(fs) {

            fs.root.getFile('scripts.tmx', {}, function(fileEntry) {

                                // Get a File object representing the file,
                                // then use FileReader to read its contents.
                                fileEntry.file(function(file) {
                                                   var reader = new FileReader();

                                                   reader.onloadend = function(e) {
                                                       ta.value = this.result;
                                                       impo();
                                                   };

                                                   reader.readAsText(file);
                                               }, errorHandler);

                            }, errorHandler);

        }

        window.requestFileSystem(window.PERSISTENT, 1024*1024, onInitFs, errorHandler);
    };

    var expo_ls = function() {
        expo();
        function onInitFs(fs) {

            fs.root.getFile('scripts.tmx', {create: true}, function(fileEntry) {
                                // Create a FileWriter object for our FileEntry (log.txt).
                                fileEntry.createWriter(function(fileWriter) {
                                                           fileWriter.onwriteend = function(e) {
                                                               console.log('Write completed.');
                                                           };

                                                           fileWriter.onerror = function(e) {
                                                               console.log('Write failed: ' + e.toString());
                                                           };

                                                           // Create a new Blob and write it to log.txt.
                                                           var bb = new BlobBuilder();
                                                           bb.append(ta.value);
                                                           fileWriter.write(bb.getBlob('text/plain'));

                                                       }, errorHandler);

                            }, errorHandler);
        }

        window.requestFileSystem(window.PERSISTENT, 1024*1024, onInitFs, errorHandler);
    };

    var expo_doc = function() {
        expo();
	var bb = new BlobBuilder();
	bb.append(ta.value);
	saveAs(bb.getBlob("text/plain"), "tmScripts.txt");
    };

    var imp_ta = createButton(i.name, i.id + '_i_ta', null, chrome.i18n.getMessage('Import_from_Textarea'), impo);
    var imp_ls = createButton(i.name, i.id + '_i_ls', null, chrome.i18n.getMessage('Import_from_SandboxFS'), impo_ls);
    var imp_file = cr('input', i.name, i.id + '_i_file', 'file');

    var handleFileSelect = function (evt) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                                 return function(e) {
                                     ta.value = e.target.result;
                                     impo();
                                 };
                             })(f);
            reader.readAsText(f);
            // reader.readAsDataURL(f);
        }
    }

    if (!imp_file.inserted) {
        imp_file.type = 'file';
        imp_file.addEventListener('change', handleFileSelect, false);
    }

    var exp_ta = createButton(i.name, i.id + '_e_ta', null, chrome.i18n.getMessage('Export_to_Textarea'), expo);
    var exp_doc = createButton(i.name, i.id + '_e_doc', null, chrome.i18n.getMessage('Export_to_file'), expo_doc);
    var exp_ls = createButton(i.name, i.id + '_e_ls', null, chrome.i18n.getMessage('Export_to_SandboxFS'), expo_ls);

    var ta = crc('textarea', 'importta', i.name, i.id, 'ta');
    var sta = crc('div', 'section', i.name, i.id, 'ta');
    var hta = crc('div', 'section_head', i.name, i.id, 'head_ta');
    var cta = crc('div', 'section_content', i.name, i.id, 'content_ta');

    hta.textContent = "TextArea";
    cta.appendChild(exp_ta);
    cta.appendChild(imp_ta);
    cta.appendChild(ta);
    sta.appendChild(hta);
    sta.appendChild(cta);

    var ssb = crc('div', 'section', i.name, i.id, 'sb');
    var hsb = crc('div', 'section_head', i.name, i.id, 'head_sb');
    var csb = crc('div', 'section_content', i.name, i.id, 'content_sb');

    hsb.textContent = "SandboxFS"
    ssb.appendChild(hsb);
    ssb.appendChild(csb);
    csb.appendChild(exp_ls);
    csb.appendChild(imp_ls);

    var sfi = crc('div', 'section', i.name, i.id, 'fi');
    var hfi = crc('div', 'section_head', i.name, i.id, 'head_fi');
    var cfi = crc('div', 'section_content', i.name, i.id, 'content_fi');

    hfi.textContent = "File"
    sfi.appendChild(hfi);
    sfi.appendChild(cfi);
    cfi.appendChild(exp_doc);
    cfi.appendChild(imp_file);

    cont.appendChild(sfi);
    cont.appendChild(ssb);
    cont.appendChild(sta);

    util.appendChild(cont);
};

var createOptionsMenu = function(items, noWarn) {

    gNoWarn = noWarn;

    if (!items) {
        console.log("options: items is empty!");
        return;
    }
    allItems = items;

    var o = document.getElementById('options')
    var main = crc('div', 'main_container p100100', 'options', 'main');

    if (o) {
        var p = o.parentNode;
        p.removeChild(o);
        p.appendChild(main);
        document.body.setAttribute('class', 'main');
    }

    if (V) console.log("options: head");

    var head = crc('div', 'head_container', 'opt', 'head_container');
    var tv = crc('div', 'tv_container', 'opt', 'tv_container');

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

    if (V) console.log("options: tabView");
    var tabv = createTabView('_main', tv);

    if (V) console.log("options: itemsToMenu");
    itemsToMenu(items, tabv);
    if (V) console.log("options: utilTab");
    createUtilTab(tabv);

    gNoWarn = null;
    initialized = true;
    hideWait();
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

            tvCache[prefix].g_entries[tid] = { entry: entry, tab: tab, content: cont, closable: closeCb != null };
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

var createImageText = function(src, name, id, append, title, oc, text) {
    var wrap = cr('div', name, id, append, 'wrap', true);
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

    if (oc) { //  && !wrap.inserted) { // TODO: dunno why...
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

var createFileInput = function(name, id, oc) {
    var input = crc('input', 'import', 'file');
    if (!input.inserted) {
        input.type = 'file';
        if (oc) input.addEventListener("change", oc);
    }
    return input;
};

var createTextarea = function(title, i, oc) {
    var s = cr('div', i.name, i.id, 'textarea');
    var input = crc('textarea', 'settingsta', i.name, i.id, 'textarea');
    input.name = i.name;
    input.key = i.id;
    input.array = i.array;
    input.oldvalue = i.value;
    input.value = (i.value != undefined) ? (i.array ? i.value.join("\n") : i.value) : '';
    if (!input.inserted) {
        if (oc) input.addEventListener("change", oc);
    }
    var span1 = cr('span', i.name, i.id, 's1');
    span1.textContent = title + ':';
    s.appendChild(span1);
    s.appendChild(input);

    return { elem: s, textarea: input };
};

var createInput = function(name, i, oc) {
    var s = cr('div', i.name, i.id, 'input');
    var input = cr('input', i.name, i.id, 'input');
    var n = name.split('##');
    input.name = i.name;
    input.key = i.id;
    input.oldvalue = i.value;
    input.value = (i.value != undefined) ? i.value : '';
    if (!input.inserted) {
        input.type = "text";
        if (oc) input.addEventListener("change", oc);
    }
    var span1 = cr('span', i.name, i.id, 's1');
    var span2 = cr('span', i.name, i.id, 's2');
    span1.textContent = n[0];
    if (n.length > 1) span2.textContent = n[1];
    s.appendChild(span1);
    s.appendChild(input);
    s.appendChild(span2);

    return { elem: s, input: input };
};

var createCheckbox = function(name, i, oc) {
    var s = crc('div', 'checkbox', i.name, i.id, 'cb1');
    var input = cr('input', i.name, i.id, 'cb');
    input.title = i.desc ? i.desc : '';
    input.name = i.name;
    input.key = i.id;
    input.reload = i.reload;
    input.warning = i.warning;
    input.oldvalue = i.enabled;
    input.checked = i.enabled;
    input.type = "checkbox";

    if (!input.inserted) {
        if (oc) input.addEventListener("click", oc);
    }
    var span = crc('span', 'checkbox_desc', i.name, i.id, 'cb2');
    span.textContent = name;
    s.title = i.desc ? i.desc : '';
    s.appendChild(input);
    s.appendChild(span);

    return { elem: s, input: input };
};

var createDropDown = function(name, e, values, oc) {
    var s = cr('div', e.name, e.id, 'outer_dd');
    var b = cr('select', e.name, e.id, 'dd');

    for (var k in values) {
        var o1 = cr('option', values[k].name, values[k].name, 'dd' + name);
        o1.textContent = values[k].name;
        o1.value = values[k].value;
        if (values[k].value == e.value) o1.selected = true;
        b.appendChild(o1);
    }

    b.key = e.id;
    b.name = e.name;
    if (!b.inserted) {
        b.addEventListener("change", oc);
    }

    var span = cr('span', e.name, e.id, 'inner_dd');
    span.textContent = name + ": ";
    s.appendChild(span);
    s.appendChild(b);
    return s;
};

var createScriptStartDropDown = function(name, e, oc) {
    var s = cr('div', e.name, e.id, 'outer_dd');
    var b = cr('select', e.name, e.id, 'dd');

    var o1 = cr('option', e.name, e.id, 'dd1');
    var i1 = "document-start";
    o1.textContent = i1;
    if (i1 == e.value) o1.selected = true;

    var o2 = cr('option', e.name, e.id, 'dd2');
    var i2 = "document-body";
    o2.textContent = i2;
    if (i2 == e.value) o2.selected = true;

    var o3 = cr('option', e.name, e.id, 'dd3');
    var i3 = "document-end";
    o3.textContent = i3;
    if (i3 == e.value || (!o1.selected && !o2.selected)) o3.selected = true;

    b.appendChild(o1);
    b.appendChild(o2);
    b.appendChild(o3);

    b.key = e.id;
    b.name = e.name;
    if (!b.inserted) {
        b.addEventListener("change", oc);
    }

    var span = cr('span', e.name, e.id, 'inner_dd');
    span.textContent = name;
    s.appendChild(span);
    s.appendChild(b);
    return s;
};

var createButton = function(name, id, value, text, oc, img) {
    var b = null;
    var c = null;
    var i = null;

    if (img) {
        b = crc('input', 'button', name, id, 'bu');
        c = crc('div', 'button_container', name, id, 'bu_container');
        c.appendChild(b);
    } else {
        b = cr('input', 'button' , name, id, 'bu');
    }
    b.name = name;
    b.key = id;
    b.type = "button";
    b.oldvalue = value;
    if (!img) {
        b.value = text;
    } else {
        i = crc('img', 'button_image', name, id, 'bu_img');
        i.src = img;
        c.appendChild(i);
        b.setAttribute('title', text);
        i.setAttribute('title', text);
    }
    if (!b.inserted && oc)  {
        b.addEventListener("click", oc);
        if (img) i.addEventListener("click", oc);
    }

    return img ? c : b;
};

var createPosition = function(name, e, oc) {
    var s = cr('div', e.name, e.id, 'pos1');
    var b = cr('select', e.name, e.id, 'pos', true);
    for (var i=1; i<=e.posof; i++) {
        var o = cr('option', e.name, e.id, 'opt' + i);
        o.textContent = i;
        if (i == e.pos) o.selected = true;
        b.appendChild(o);
    }
    b.key = e.id;
    b.name = e.name;
    b.addEventListener("change", oc);

    var span = cr('span', e.name, e.id, 'pos2');
    span.textContent = name;
    s.appendChild(span);
    s.appendChild(b);
    return s;
};

var createCludesEditor = function(name, type, other_name) {
    var i = type.item;
    var id = i.id + type.id;
    var key = (other_name ? 'orig_' : 'use_') + type.id;
	
    var selId = function(k){
        return 'select_' + createUniqueId(k, i.id) + '_sel1';
    };

    var s = crc('div', 'cludes', name, id, 'cb1');
    if (document.getElementById(selId(key))) return { elem: s };
    
    var span = cr('span', i.name, id, 'cb2');
    span.textContent = name;
    s.title = i.desc ? i.desc : '';

    var values = (i.options && i.options.override && i.options.override[key]) ? i.options.override[key] : [];
    var sel = crc('select', 'cludes', key, i.id, 'sel1');
    sel.setAttribute('size', '6');
    for (var n=0; n<values.length; n++) {
        var op = document.createElement('option');
        op.value = op.text = values[n];
        sel.appendChild(op);
    }

    s.appendChild(span);
    s.appendChild(sel);
	
    var addToOther = function(){
        var uid = selId('use_' + (type.id == 'excludes' ? 'includes' : 'excludes'));
        var other_sel = document.getElementById(uid);
        var op = sel.options[sel.selectedIndex];

        if (op && !other_sel.querySelector('option[value="'+op.value+'"]')){
            other_sel.appendChild(op.cloneNode(true));
            saveChanges();
        }
    };

    var addRule = function(){
        var rule = prompt(chrome.i18n.getMessage('Enter_the_new_rule'));
        if (rule) {
            var op = document.createElement('option');
            op.value = op.text = rule.trim();
            sel.appendChild(op);
            saveChanges();
        }
    };
	
    var editRule = function(){
        var op = sel.options[sel.selectedIndex];
        if (!op) return;
        var rule = prompt(chrome.i18n.getMessage('Enter_the_new_rule'), op.value);
        if (rule) {
            op.value = op.text = rule.trim();
            saveChanges();
        }
    };
	
    var delRule = function(){
        var op = sel.options[sel.selectedIndex];
        if (!op) return;
        op.parentNode.removeChild(op);
        saveChanges();
    };

    var optsToArr = function(select){
        var arr = [];
        for (var n=0; n<select.options.length; n++){
            arr.push(select.options[n].value);
        }
        return arr;
    };
	
    var saveChanges = function() {
        var options = {
            includes: optsToArr(document.getElementById(selId('use_includes'))),
            matches: optsToArr(document.getElementById(selId('use_matches'))),
            excludes: optsToArr(document.getElementById(selId('use_excludes')))
        };
	
        //save and merge original and user *cludes
        modifyScriptOptions(i.name, options);
        return true;
    };

    if (other_name) {
        //this is the original (in/ex)clude list; items can be added to the user (ex/in)clude list
        var btn = cr('button', i.name, id, 'btn1');
        btn.innerHTML = chrome.i18n.getMessage('Add_as_0clude0', other_name);
        btn.addEventListener('click', addToOther, false);
        s.appendChild(btn);
    } else {
        //this is a user *clude; append add, edit an remove buttons for this list
        var btn_add = cr('button', i.name, id, 'btn2');
        btn_add.innerHTML = chrome.i18n.getMessage('Add') + '...';
        btn_add.addEventListener('click', addRule, false);
        s.appendChild(btn_add);
		
        var btn_edit = cr('button', i.name, id, 'btn3');
        btn_edit.innerHTML = chrome.i18n.getMessage('Edit') + '...';
        btn_edit.addEventListener('click', editRule, false);
        s.appendChild(btn_edit);
		
        var btn_del = cr('button', i.name, id, 'btn4');
        btn_del.innerHTML = chrome.i18n.getMessage('Remove');
        btn_del.addEventListener('click', delRule, false);
        s.appendChild(btn_del);
    }

    return { elem: s };
};

var sortScripts = function(scripts) {
    var first = function(elem, tag) {
        if (elem.tagName == tag) {
            return elem
        } else {
            return (elem.parentNode ? first(elem.parentNode, tag) : null);
        }
    }
    var sortEm = function(results) {
        var numComparisonAsc = function(a, b) { return a.position-b.position; };
        results.sort(numComparisonAsc);
        return results;
    }

    var parent = null;
    var sort = [];
    var index = 0;

    for (var i=0; i<scripts.length; i++) {
        var e = scripts[i].script;
        var tr = first(e, 'TR');
        if (tr) {
            var p = first(tr, 'TABLE');
            if (!parent) {
                parent = p;
            } else if (parent != p) {
                console.log("options: different parents?!?!");
            }
            index++;
            sort.push({ tr: tr, position: e.pos ? e.pos: (1000+index) });
            tr.inserted = false;
            tr.parentNode.removeChild(tr);
        } else {
            console.log("options: unable to sort script at pos " + e.pos);
        }
    }
    sort = sortEm(sort);
    for (var i=0; i<index; i++) {
        parent.appendChild(sort[i].tr);
    }
};

var savedScript = {};

var createScriptDetailsTabView = function(tab, i, tr, parent, closeTab) {
    var tab_head = crc('div', '', i.name, i.id, 'script_tab_head');

    var old = tab_head.inserted;
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
    var set = createScriptEditorTab(i, tabd, closeTab);
    var sst = !i.id || i.system ? {} : createScriptSettingsTab(i, tabd);

    if (old) {
        return stCache['tab' + i.name];
    }

    var onKey = function(e) {
        var cancel = false;

        if (e.type != "keydown") return;
        if (e.keyCode == 27 /* ESC */) {
            if (tab.isSelected()) {
                closeTab();
            }
            cancel = true;
        }

        if (cancel) e.stopPropagation();
    };

    var beforeClose = function() {
        var leafmealone = false;
        if (sst.beforeClose) leafmealone |= sst.beforeClose();
        if (set.beforeClose) leafmealone |= set.beforeClose();
        return leafmealone;
    };

    var onShow = function() {
        if (sst.onShow) sst.onShow();
        if (set.onShow) set.onShow();
        window.addEventListener('keydown', onKey, false);
    };

    var onClose = function() {
        if (sst.onClose) {
            if (sst.onClose()) return true;
        }
        if (set.onClose) {
            if (set.onClose()) return true;
        }
        window.removeEventListener('keydown', onKey, false);
    };

    var onSelect = function() {
        if (sst.onSelect) {
            if (sst.onSelect()) return true;
        }
        if (set.onClose) {
            if (set.onSelect()) return true;
        }
    };

    var e = { onShow: onShow, onClose: onClose, onSelect: onSelect, beforeClose: beforeClose };

    stCache['tab' + i.name] = e;

    return e;
};

var createScriptSettingsTab = function(i, tabd) {

    var tabh = cr('div', i.name, i.id, 'script_setting_h');
    var old = tabh.inserted;

    tabh.textContent = chrome.i18n.getMessage('Settings');
    var tabc = cr('td', i.name, i.id, 'script_settings_c');

    var co = function() {
        if (this.type == 'checkbox' || this.type == 'button') {
            modifyScriptOption(this.name, this.key, !this.oldvalue);
        } else if (this.type == 'text' || this.type == 'select-one') {
            modifyScriptOption(this.name, this.key, this.value);
        }
    };

    var i_pos = createPosition(chrome.i18n.getMessage('Position_') + ' ', { id: 'position', name: i.name, pos: i.position, posof: i.positionof }, co);

    var i_ra = createScriptStartDropDown(chrome.i18n.getMessage('Run_at'),
                              { id: 'run_at', name: i.name, value: i.run_at },
                              co);
							  
    var e_oi = createCludesEditor(chrome.i18n.getMessage('Original_includes'),
                                  { id: 'includes', item: i },
                                  chrome.i18n.getMessage('User_excludes'));
    var e_om = createCludesEditor(chrome.i18n.getMessage('Original_matches'),
                                  { id: 'matches', item: i },
                                  chrome.i18n.getMessage('User_excludes'));
    var e_oe = createCludesEditor(chrome.i18n.getMessage('Original_excludes'),
                                  { id: 'excludes', item: i },
                                  chrome.i18n.getMessage('User_includes'));
    var clear_cludes = crc('div', 'clear', i.name, i.id, 'clear');
									
    var e_ui = createCludesEditor(chrome.i18n.getMessage('User_includes'),
                                  { id: 'includes', item: i });
    var e_um = createCludesEditor(chrome.i18n.getMessage('User_matches'),
                                  { id: 'matches', item: i });
    var e_ue = createCludesEditor(chrome.i18n.getMessage('User_excludes'),
                                  { id: 'excludes', item: i });

    var i_md = createCheckbox(chrome.i18n.getMessage('Convert_CDATA_sections_into_a_chrome_compatible_format'),
                              { id: 'compat_metadata', name: i.name, enabled: i.compat_metadata },
                              co);
    var i_fe = createCheckbox(chrome.i18n.getMessage('Replace_for_each_statements'),
                              { id: 'compat_foreach', name: i.name, enabled: i.compat_foreach },
                              co);
    var i_vi = createCheckbox(chrome.i18n.getMessage('Fix_for_var_in_statements'),
                              { id: 'compat_forvarin', name: i.name, enabled: i.compat_forvarin },
                              co);
    var i_al = createCheckbox(chrome.i18n.getMessage('Convert_Array_Assignements'),
                              { id: 'compat_arrayleft', name: i.name, enabled: i.compat_arrayleft },
                              co);
    var i_ts = createCheckbox(chrome.i18n.getMessage('Add_toSource_function_to_Object_Prototype'),
                              { id: 'compat_prototypes', name: i.name, enabled: i.compat_prototypes },
                              co);

    var i_compats = [i_md, i_fe, i_vi, i_al, i_ts ];

    var section_opt = crc('div', 'section', i.name, i.id, 'ta_opt');
    var section_opt_head = crc('div', 'section_head', i.name, i.id, 'head_ta_opt');
    var section_opt_content = crc('div', 'section_content', i.name, i.id, 'content_ta_opt');

    section_opt_head.textContent = chrome.i18n.getMessage('Settings');
    section_opt.appendChild(section_opt_head);
    section_opt.appendChild(section_opt_content);

    var section_compat = crc('div', 'section', i.name, i.id, 'ta_compat');
    var section_compat_head = crc('div', 'section_head', i.name, i.id, 'head_ta_compat');
    var section_compat_content = crc('div', 'section_content', i.name, i.id, 'content_ta_compat');

    section_compat_head.textContent = chrome.i18n.getMessage('GM_compat_options_');
    section_compat.appendChild(section_compat_head);
    section_compat.appendChild(section_compat_content);

    section_opt_content.appendChild(i_pos);
    section_opt_content.appendChild(i_ra);
    section_opt_content.appendChild(e_oi.elem);
    section_opt_content.appendChild(e_om.elem);
    section_opt_content.appendChild(e_oe.elem);
    section_opt_content.appendChild(clear_cludes);
    section_opt_content.appendChild(e_ui.elem);
    section_opt_content.appendChild(e_um.elem);
    section_opt_content.appendChild(e_ue.elem);

    for (var u=0; u<i_compats.length; u++) {
        section_compat_content.appendChild(i_compats[u].elem);
    }

    if (i.awareOfChrome) {
        for (var k in i_compats) {
            i_compats[k].input.setAttribute("disabled", "disabled");
            i_compats[k].elem.setAttribute("title", chrome.i18n.getMessage('This_script_runs_in_Chrome_mode'));
        }
    }

    var h = cr('span', i.name, i.id);
    h.textContent = chrome.i18n.getMessage('Settings');
    var content = cr('div', i.name, i.id, 'tab_content_settings');
    content.appendChild(section_opt);
    content.appendChild(section_compat);
    tabc.appendChild(content);

    var tab = tabd.appendTab('script_settings_tab' + createUniqueId(i.name, i.id), tabh, tabc);

    if (old) {
        return stCache['settings' + i.name];
    }

    var beforeClose = function() {
        var leafmealone = false;
        if (e_oi.beforeClose) leafmealone |= e_oi.beforeClose();
        if (e_om.beforeClose) leafmealone |= e_om.beforeClose();
        if (e_oe.beforeClose) leafmealone |= e_oe.beforeClose();
        if (e_ui.beforeClose) leafmealone |= e_ui.beforeClose();
        if (e_um.beforeClose) leafmealone |= e_um.beforeClose();
        if (e_ue.beforeClose) leafmealone |= e_ue.beforeClose();
        return leafmealone;
    }

    var e = { beforeClose: beforeClose };

    stCache['settings' + i.name] = e;

    return e;
};

var createScriptEditorTab = function(i, tabd, closeEditor) {

    var saveEm = null;

    var tabh = cr('div', i.name, i.id, 'script_editor_h');
    var old = tabh.inserted;

    tabh.textContent = chrome.i18n.getMessage('Editor');
    var tabc = cr('td', i.name, i.id, 'script_editor_c');

    var container = crc('tr', 'editor_container p100100', i.name, i.id, 'container');
    var container_menu = crc('tr', 'editormenubar', i.name, i.id, 'container_menu');
    var container_o = crc('table', 'editor_container_o p100100 noborder', i.name, i.id, 'container_o');

    container_o.appendChild(container_menu);
    container_o.appendChild(container);
    tabc.appendChild(container_o);

    var saveEditor = function() {
        if (saveEm) {
            if (saveEm()) {
                savedScript[i.id] = true;
                if (container.editor && gOptions.editor_enabled) container.editor.mirror.clearHistory();
            }
        }
    };

    var fullReset = function() {
        var cb = null;
        cb = function(r) {
            if (r.cleaned) {
                closeEditor();
            }
        }
        saveScript(i.name, null, i_uu.input, true, cb);
    };

    var resetScript = function() {
        var c = confirm(chrome.i18n.getMessage("Really_reset_all_changes_"));
        if (c) {
            if (container.editor && gOptions.editor_enabled) {
                // set value clears history too
                container.editor.mirror.setValue(i.code);
            } else {
                input.textContent = i.code;
            }
        }
    };

    var i_sc_save =   createButton(i.name, 'save',         null, chrome.i18n.getMessage('Save'),         saveEditor, chrome.extension.getURL('images/filesave.png'));
    var i_sc_cancel = createButton(i.name, 'cancel',       null, chrome.i18n.getMessage('Editor_reset'), resetScript, chrome.extension.getURL('images/editor_cancel.png'));
    var i_sc_reset =  createButton(i.name, 'reset',        null, chrome.i18n.getMessage('Full_reset'),   fullReset, chrome.extension.getURL('images/script_cancel.png'));
    var i_sc_close =  createButton(i.name, 'close_script', null, chrome.i18n.getMessage('Close'),        closeEditor, chrome.extension.getURL('images/exit.png') );

    var i_uu = createInput(chrome.i18n.getMessage('Update_URL_'),
                           { id: 'update_url', name: i.name, value: i.update_url });
    i_uu.input.setAttribute("class", "updateurl_input");
    i_uu.elem.setAttribute("class", "updateurl");

    var input = crc('textarea', 'editorta', i.name, i.id);
    input.setAttribute('wrap', 'off');
    var edit_outer = crc('td', 'editor_outer', i.name, i.id, 'edit');
    var edit = crc('div', 'editor', i.name, i.id, 'edit');
    edit_outer.appendChild(edit);

    if (!gNoWarn && container.editor) {
        if (savedScript[i.id]) {
            savedScript[i.id] = false;
            return [];
        } else if (!i.nnew) {
            // huh! script item is recreated but editor is open!
            alert(chrome.i18n.getMessage('Script_modified_in_background'));
            return [];
        }
    }

    var menu = crc('div', 'editormenu', i.name, i.id, 'editormenu');

    container_menu.appendChild(menu);
    container_menu.appendChild(i_uu.elem);

    if (!container.inserted) {
        edit.appendChild(input);
        container.appendChild(edit_outer);
    }

    /* if (!container.inserted) {
        var v = i.id ? "" : gNVis;
        i_pos.setAttribute('style', v);
        i_en.setAttribute('style', v);
        i_del.setAttribute('style', v);
    } */

    if (!i.system) {
        saveEm = function(value) {
            var doIt = true;
            var e = document.getElementById('input_Show_fixed_source_showFixedSrc_cb');
            if (e && e.checked) {
                doIt = confirm(chrome.i18n.getMessage("Do_you_really_want_to_store_fixed_code_", chrome.i18n.getMessage('Show_fixed_source')));
            }
            var value = container.editor && gOptions.editor_enabled ? container.editor.mirror.getValue() : input.value;
            if (doIt) {
                var cb = null;
                if (i.nnew) {
                    cb = function(r) {
                        if (r.installed) {
                            closeEditor();
                        }
                    }
                }
                saveScript(i.name, value, i_uu.input, false, cb);
            }
            return doIt;
        };

        menu.appendChild(i_sc_save);
        menu.appendChild(i_sc_cancel);
    }

    if (!i.nnew) {
        menu.appendChild(i_sc_reset);
    }
    menu.appendChild(i_sc_close);

    var tab = tabd.appendTab('script_editor_tab' + createUniqueId(i.name, i.id), tabh, tabc);

    if (old) {
        return stCache['editor' + i.name];
    }

    var onSelect = function() {
        if (container.editor) {
            container.editor.mirror.refresh();
        }
    };

    var onEditorKey = function(editor, e) {
        var cancel = false;

        if (e.type != "keydown") return;
        if (e.ctrlKey && e.keyCode == 83 /* CTRL-s */) {
            saveEditor();
            cancel = true;
        } else if (e.ctrlKey && e.keyCode == 81 /* CTRL-q */) {
            closeEditor();
            cancel = true;
        } else if (e.ctrlKey && e.keyCode == 70 /* CTRL-f */) {
            container.editor.searchText = container.editor.search();
            cancel = true;
        } else if (e.keyCode == 114 && e.keyIdentifier == "F3" /* F3 */) {
            container.editor.searchText = container.editor.search(container.editor.searchText);
            cancel = true;
        } else if (e.ctrlKey && e.keyCode == 82 /* CTRL-r */) {
            container.editor.replace();
            cancel = true;
        } else if (e.ctrlKey && e.keyCode == 71 /* CTRL-g */) {
            container.editor.jump();
            cancel = true;
        } else if (e.keyCode == 27 /* ESC */) {
            closeEditor();
            cancel = true;
        }

        if (cancel) e.stop();
    };

    var onShow = function() {
        var textareas = tabc.getElementsByTagName('textarea');
        if (textareas.length) {
            var textarea = textareas[0];
            if (!container.editor) {
                // speed up by adding the source code on show
                if (gOptions.editor_enabled) {
                    var edit = textarea.parentNode;
                    edit.removeChild(textarea);
                    container.editor = new MirrorFrame(edit, {
                        value: i.code,
                        indentUnit: Number(gOptions.editor_indentUnit),
                        indentWithTabs: gOptions.editor_indentWithTabs == 'tabs',
                        smartIndent: gOptions.editor_tabMode != 'classic',
                        enterMode: gOptions.editor_enterMode,
                        electricChars: gOptions.editor_electricChars.toString() == 'true',
                        lineNumbers: gOptions.editor_lineNumbers.toString() == 'true',
                        onKeyEvent: onEditorKey,
                        // saveFunction: saveEditor,
                        matchBrackets: true});
                } else {
                    textarea.value = i.code;
                }
            }
        }
    };

    var e = {
        onSelect: onSelect,
        onShow: onShow,
        onClose: function() {
            var doIt = function () {
                container.editor = null;
            };
            var uc = false;
            if (gOptions.editor_enabled) {
                if (container.editor) {
                    var h = container.editor.mirror.historySize();
                    if (h.undo) {
                        uc = true;
                    }
                }
            } else {
                uc = (input.value != i.code);
            }
            if (uc) {
                var c = confirm(chrome.i18n.getMessage('There_are_unsaved_changed_'));
                if (c) doIt();
                return !c;

            } else {
                doIt();
                return false;
            }
        }
    };

    stCache['editor' + i.name] = e;

    return e
};

var createScriptItem = function(i, tr, tabv) {

    // tab stuff for later use
    var tab;
    var scriptdetails;
    var use_icon = i.icon && !i.nativeScript;

    var sname = crc('span', 'script_name clickable', i.name, i.id, 'sname');
    var sname_img = crc('img', 'nameNicon16', i.name, i.id, 'sname_img');

    var sname_name = crc('span', use_icon ? 'nameNname16': '', i.name, i.id, 'sname_name');
    var hp = i.homepage ? i.homepage : (i['namespace'] && i['namespace'].search('http://') == 0 ? i['namespace'] : null)

    sname_name.textContent = (i.name.length > 35 ? i.name.substr(0,35) + '...' : i.name);

    var sversion = cr('span', i.name, i.id, 'sversion');
    sversion.textContent = i.version ? i.version : '';

    if (use_icon) {
        sname_img.src = i.icon;
        sname.appendChild(sname_img);
    }

    var ret = [];

    var getTD = function(i, child, app, clas) {
        if (!clas) clas = 'scripttd';
        var td1 = crc('td', clas, i.name, i.id, app)
        if (child) td1.appendChild(child);
        return td1;
    };

    var closeAndRemoveTab = function() {
        if (tab) {
            tab.remove();
            tab = null;
        }
    };
    
    var removeScriptItem = function() {
        sname.parentNode.removeChild(sname);
        // sname_name.setAttribute('open', 'false');
    };
    
    var doRecreateScriptItem = function() {
        var run = function() {
            for (var o in allItems) {
                var c = allItems[o];
                if (c.id == i.id &&
                    c.name == i.name) {
                    // recreate editor
                    createScriptItem(c, tr, tabv);
                    break;
                }
            }
        }
        window.setTimeout(run, 1);
    };
    
    var doClose = function() {
        var recreate = true;
        if (scriptdetails.beforeClose) {
            recreate = !scriptdetails.beforeClose();
        }
        if (scriptdetails.onClose && scriptdetails.onClose()) return;

        closeAndRemoveTab();
        removeScriptItem();
        if (recreate) {
            doRecreateScriptItem();
        }
    };

    var onSelect = function() {
        if (scriptdetails.onSelect && scriptdetails.onSelect()) return;
    };

    var createTab = function() {
        var tabh = null;
        if (i.nnew) {
            tabh = crc('div', 'head_icon', i.name, i.id, 'details_h');
            tabh.appendChild(createImage(i.image, i.name, i.id, 'new_script_head'));
        } else {
            tabh = crc('div', '', i.name, i.id, 'details_h');
            tabh.textContent = chrome.i18n.getMessage('Edit') + ' - ' + (i.name.length > 25 ? i.name.substr(0,25) + '...' : i.name);
        }

        var tabc = cr('td', i.name, i.id, 'details_c');
        tab = tabv.insertTab(null, 'details_' + createUniqueId(i.name, i.id), tabh, tabc, onSelect, i.nnew ? null : doClose);

        scriptdetails = createScriptDetailsTabView(tab, i, tr, tabc, doClose);
    };

    var scriptClick = function(e, noselect) {
        if (!tab) createTab();
        if (scriptdetails.onShow) scriptdetails.onShow();
        tab.show();
        if ((!e || e.button != 1) && !noselect) {
            tab.select();
        }
        sname_name.setAttribute('open', 'true');
    };

    if (sname_name.getAttribute('open') == 'true') {
        // update currently open tabs too
        scriptClick(null, true);
    };

    var hp_script = cr('span', i.name, i.id, 'hp');
    if (hp) {
        var hpa = cr('a', i.name, i.id, 'hp');
        hpa.setAttribute('href', hp);
        hpa.setAttribute('target', '_blank');

        var hp_script_img = createImage(chrome.extension.getURL('images/home.png'),
                                    i.name,
                                    i.id,
                                    "hp",
                                    "");

        hpa.appendChild(hp_script_img);
        hp_script.appendChild(hpa);
    }

    var time_between = function(date1, date2) {
        // The number of milliseconds in one day
        var ONE_MINUTE = 1000 * 60
        var ONE_HOUR = 1000 * 60 * 60;
        var ONE_DAY = 1000 * 60 * 60 * 24;

        // Convert both dates to milliseconds
        var date1_ms = date1.getTime()
        var date2_ms = date2.getTime()

        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(date1_ms - date2_ms)

        // Convert back to days and return
        var m = Math.round(difference_ms/ONE_MINUTE);
        var h = Math.round(difference_ms/ONE_HOUR);
        var d = Math.round(difference_ms/ONE_DAY);
        if (m <= 60) {
            return m + " min";
        } else if (h <= 48) {
            return h + " h";
        } else {
            return d + " d";
        }
    };

    var last_updated = cr('span', i.name, i.id, 'last_updated');
    var lUp = '';
    if (i.nativeScript || !i.id || i.system) {
        lUp = '';
    } else {
        var scriptUpdate = function() {
            var t = last_updated.textContent;
            last_updated.textContent = '';
            last_updated.appendChild(createImage('/images/download.gif',
                                                 i.name + '_down',
                                                 i.id));
            var done = function(up) {
                last_updated.textContent = t;
                if (up) {
                    last_updated.style.color = 'green';
                    last_updated.title = chrome.i18n.getMessage('There_is_an_update_for_0name0_avaiable_', i.name);
                    // close and remove tab
                    closeAndRemoveTab();
                    removeScriptItem();
                    // update tab to not show the old version
                    modifyScriptOption(null, false);
                } else {
                    last_updated.style.color = 'red';
                    last_updated.title = chrome.i18n.getMessage('No_update_found__sry_');
                }
            };

            runScriptUpdates(i.id, done);
        };

        if (!sname_name.inserted) {
            last_updated.addEventListener('click', scriptUpdate);
            last_updated.style.cursor = "pointer";
            last_updated.title = chrome.i18n.getMessage('Check_for_Updates');
        }

        if (i.lastUpdated) {
            try {
                lUp = time_between(new Date(), new Date(i.lastUpdated));
            } catch (e) {
                console.log("o: error calculating time " + e.message);
            }
        } else {
            lUp = '?';
        }
    }
    last_updated.textContent = lUp;

    if (i.update_url && i.update_url.trim() != "") {
        // "http://userscripts.org/scripts/source/44327.user.js".match(new RegExp("/http:\/\/userscripts\.org\/scripts\/source\/([0-9]{1,9})\.user\.js/"));
        var usoid = i.update_url.match(new RegExp("http:\/\/userscripts\.org\/scripts\/source\/([0-9]{1,9})\.user\.js"));
        if (usoid && usoid.length == 2) {
            var hpa = cr('a', i.name, i.id, 'hp');
            hpa.setAttribute('href', 'http://userscripts.org/scripts/show/' + usoid[1]);
            hpa.setAttribute('target', '_blank');

            var uso_script_img = createImage(gUSOicon,
                                            i.name,
                                            i.id,
                                            "uso",
                                            "");

            hpa.appendChild(uso_script_img);
            hp_script.appendChild(hpa);
        }
    }

    var img_delete = createImage(chrome.extension.getURL('images/delete.png'),
                                 i.nativeScript ? i.id : i.name,
                                 "delete",
                                 "delete",
                                 chrome.i18n.getMessage("Delete"),
                                 function() {
                                     if (i.nativeScript) {
                                         var c = confirm(chrome.i18n.getMessage('Really_delete_this_extension__'));
                                         if (c == true) {
                                             modifyNativeScriptOption(this.name, 'installed', 'false');
                                             tr.parentNode.removeChild(tr);
                                         }
                                     } else {
                                         var c = confirm(chrome.i18n.getMessage('Really_delete_this_script__'));
                                         if (c == true) {
                                             saveScript(i.name, null, false, null);
                                             tr.parentNode.removeChild(tr);
                                         }
                                     }
                                 });

    if (!sname.inserted && !i.nativeScript) {
        sname.addEventListener('click', scriptClick);
    }

    sname.appendChild(sname_name);
    var sname_td = getTD(i, sname, 'script_td1', 'scripttd_name');
    sname_td.title = i.description ? i.name + '\n\n' + i.description : i.name;

    ret.push(sname_td);
    ret.push(getTD(i, sversion, 'script_td25', 'scripttd_version'));
    ret.push(getTD(i, createImagesFromScript(i), 'script_td3'));
    ret.push(getTD(i, createFeatureImagesFromScript(i), 'script_td4'));
    ret.push(getTD(i, hp_script, 'script_td5'));
    ret.push(getTD(i, last_updated, 'script_td6'));
    ret.push(getTD(i, createPosImagesFromScript(i), 'script_td7'));
    ret.push(getTD(i, i.id && !i.system ? img_delete : null, 'script_td8'));

    for (var o = ret.length; o<10; o++) {
        ret.push(cr('td', i.name, i.id, 'script_filler_' + o));
    }

    if (i.nnew) {
        var show = function() {
            scriptClick(null, true);
        };
        window.setTimeout(show, 100);
        if (!initialized && window.location.href.search('new=1') != -1) {
            window.setTimeout(scriptClick, 1000);
        }
    }

    return ret;
};


var createFeatureImagesFromScript = function(i) {
    var span = cr('span', i.name, i.id, 'pos_features', true);

    if (!i.id) return span;

    if (i.awareOfChrome) {
        var m = createImage('http://www.google.com/images/icons/product/chrome-16.png',
                            i.name,
                            i.id,
                            "chrome_mode",
                            chrome.i18n.getMessage("This_script_runs_in_Chrome_mode"));
        span.appendChild(m);
    }
    if (i.nativeScript) {
        var m = createImage(i.icon,
                            i.name,
                            i.id,
                            "chrome_ext",
                            chrome.i18n.getMessage("This_is_a_chrome_extension"));
        span.appendChild(m);
    }

    if (i.nativeScript) return span;

    if (i.code.search('GM_xmlhttpRequest') != -1) {
        var m = createImage(chrome.extension.getURL('images/web.png'),
                            i.name,
                            i.id,
                            "web",
                            chrome.i18n.getMessage("This_script_has_full_web_access"));
        span.appendChild(m);
    }
    if (i.code.search('GM_setValue') != -1) {
        var m = createImage(chrome.extension.getURL('images/db.png'),
                            i.name,
                            i.id,
                            "db",
                            chrome.i18n.getMessage("This_script_stores_data"));
        span.appendChild(m);
    }
    if (i.code.search('unsafeWindow') != -1) {
        var m = createImage(chrome.extension.getURL('images/resources.png'),
                            i.name,
                            i.id,
                            "resource",
                            chrome.i18n.getMessage("This_script_has_access_to_webpage_scripts"));
        span.appendChild(m);
    }
    for (var o=0; o<i.includes.length; o++) {
        if (i.includes[o].search('https') != -1) {
            var m = createImage(chrome.extension.getURL('images/halfencrypted.png'),
                                i.name,
                                i.id,
                                "encrypt",
                                chrome.i18n.getMessage("This_script_has_access_to_https_pages"));
            span.appendChild(m);
            break;
        }
    }
    for (var k in i.options) {
        if (k.search('compat') != -1 && i.options[k]) {
            var m = createImage(chrome.extension.getURL('images/critical.png'),
                                i.name,
                                i.id,
                                "crit",
                                chrome.i18n.getMessage("One_or_more_compatibility_options_are_set"));
            span.appendChild(m);
            break;
        }
    }
    if (i.system) {
        var m = createImage(chrome.extension.getURL('images/lock.png'),
                            i.name,
                            i.id,
                            "lock",
                            chrome.i18n.getMessage("This_is_a_system_script"));
        span.appendChild(m);
    }

    return span;
};

var createPosImagesFromScript = function(i) {
    var span = cr('span', i.name, i.id, 'pos_images', true);

    if (!i.id || i.nativeScript) return span;

    var up2 = createImage(chrome.extension.getURL('images/2uparrow.png'),
                          i.name,
                          "position",
                          "2up",
                          "2 Up",
                          function() { modifyScriptOption(this.name, this.key, 1); });
    var up1 = createImage(chrome.extension.getURL('images/1downarrow.png'),
                          i.name,
                          "position",
                          "1up",
                          "1 Up",
                          function() { modifyScriptOption(this.name, this.key, i.position-1); });
    var down1 = createImage(chrome.extension.getURL('images/1downarrow1.png'),
                            i.name,
                            "position",
                            "1down",
                            "1 Down",
                            function() { modifyScriptOption(this.name, this.key, i.position+1); });
    var down2 = createImage(chrome.extension.getURL('images/2downarrow.png'),
                            i.name,
                            "position",
                            "2down",
                            "2 Down",
                            function() { modifyScriptOption(this.name, this.key, i.positionof); });
    if (i.position > 1) {
        if (false) span.appendChild(up2);
        span.appendChild(up1);
    }
    if (i.position < i.positionof) {
        span.appendChild(down1);
        if (false) span.appendChild(down2);
    }

    return span;
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
        return {tld: tld, dom: dom, predom: predom.reverse()};
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
                    ico.search('http://userscripts.com/') == 0) ico = gUSOicon;

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
        console.log("lU: " + JSON.stringify(e));
    }
};

var saveScript = function(name, code, ta, clean, cb) {
    try {
        var uu = ta ? ta.value : "";
        chrome.extension.sendRequest({method: "saveScript",
                                      name: name,
                                      code: code,
                                      clean : clean,
                                      update_url: uu},
                                     function(response) {
                                         if (response.items) createOptionsMenu(response.items, name && true);
                                         if (!code) {
                                             hideWait();
                                         }
                                         if (cb) {
                                             cb(response);
                                         }
                                     });
        pleaseWait();
    } catch (e) {
        console.log("sS: " + JSON.stringify(e));
    }
};

var setOption = function(name, value, ignore) {
    try {
        chrome.extension.sendRequest({method: "setOption", name: name, value: value},
                                     function(response) {
                                         if (!ignore) createOptionsMenu(response.items);
                                     });
        pleaseWait();
    } catch (e) {
        console.log("sO: " + JSON.stringify(e));
    }
};

var modifyScriptOptions = function(name, options, reload, reorder) {
    if (V) console.log("run modifyScriptOptions");
    if (reload == undefined) reload = true;
    try {
        var s = { method: "modifyScriptOptions", name: name, reload: reload, reorder: reorder };
        for (var k in options) {
            if (!options.hasOwnProperty(k)) continue;
            s[k] = options[k];
        }

        if (V) console.log("modifyScriptOptions sendReq");
        chrome.extension.sendRequest(s,
                                     function(response) {
                                         if (response.items) createOptionsMenu(response.items, name && true);
                                     });
        pleaseWait();
    } catch (e) {
        console.log("mSo: " + JSON.stringify(e));
    }
};

var modifyScriptOption = function(name, id, value, reload, reorder) {
    if (V) console.log("run modifyScriptOption");
    if (reload == undefined) reload = true;
    try {
        var s = { method: "modifyScriptOptions", name: name, reload: reload, reorder: reorder };
        if (id && id != '') s[id] = value;

        if (V) console.log("modifyScriptOption sendReq");
        chrome.extension.sendRequest(s,
                                     function(response) {
                                         if (response && response.items) createOptionsMenu(response.items, name && true);
                                     });
        pleaseWait();
    } catch (e) {
        console.log("mSo: " + JSON.stringify(e));
    }
};

var modifyNativeScriptOption = function(nid, id, value, reload) {
    if (V) console.log("run modifyNativeScriptOption");
    if (reload == undefined) reload = true;
    try {
        var s = { method: "modifyNativeScript", nid: nid, actionid: id, value: value, reload: reload };

        if (V) console.log("modifyNativeScriptOption sendReq");
        chrome.extension.sendRequest(s,
                                     function(response) {
                                         if (response.items) createOptionsMenu(response.items, name && true);
                                     });
        pleaseWait();
    } catch (e) {
        console.log("mSo: " + JSON.stringify(e));
    }
};

var runScriptUpdates = function(id, cb) {
    try {
        var done = function(response) {
            if (cb) cb(response.updatable);
        }
        chrome.extension.sendRequest({method: "runScriptUpdates", scriptid: id}, done);
    } catch (e) {
        console.log("rSu: " + JSON.stringify(e));
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

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (V) console.log("o: method " + request.method);
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
            if (V) console.log("o: " + chrome.i18n.getMessage("Unknown_method_0name0" , request.method));
        }
    });

if (V) console.log("Register request listener (options)");

var listener = function() {
    window.removeEventListener('DOMContentLoaded', listener, false);
    window.removeEventListener('load', listener, false);
    modifyScriptOption(null, false);
};

window.addEventListener('DOMContentLoaded', listener, false);
window.addEventListener('load', listener, false);

var Converter = getConverter();

})();
