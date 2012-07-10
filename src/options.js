/**
 * @filename options.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

// help scrambling...
(function() {

var V = false;

var initialized = false;
var allItems = null;
var gOptions = {};
var version = '0.0.0';
var gNoWarn = false;
var stCache = {};

if (!window.requestFileSystem) window.requestFileSystem = window.webkitRequestFileSystem;
if (!window.BlobBuilder) window.BlobBuilder = window.WebKitBlobBuilder;

/* ########### include ############## */
Registry.require('crcrc');
Registry.require('curtain');
Registry.require('tabview');
Registry.require('htmlutil');
Registry.require('helper');
Registry.require('convert');

var cr = Registry.get('crcrc').cr;
var crc = Registry.get('crcrc').crc;
var Please = Registry.get('curtain');
var TabView = Registry.get('tabview');
var HtmlUtil = Registry.get('htmlutil');
var Helper = Registry.get('helper');
var Converter = Registry.get('convert');

/* ########### main ############## */
 
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
                    var g = HtmlUtil.createImageText(i.image,
                                        i.nativeScript ? i.id : i.name,
                                        "enabled",
                                        "enabled",
                                        i.enabled ? chrome.i18n.getMessage('Enabled') : chrome.i18n.getMessage('Disabled'),
                                        i.nativeScript ? nel : el,
                                        i.nativeScript ? '' : pt);
                    g.oldvalue = i.enabled;
                    td1.appendChild(g);
                } else {
                    td1.appendChild(HtmlUtil.createImage(i.image, i.name, i.id));
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
                var input = HtmlUtil.createCheckbox(i.name, i, i.option ? oco : oc);
                if (section) {
                    section.appendChild(input.elem);
                    tr = null;
                } else {
                    td2.appendChild(input.elem);
                }
                input.elem.setAttribute('style', (i.level > gOptions.configMode) ? Helper.staticVars.invisible : Helper.staticVars.visible);
            } else if (i.input) {
                var input = HtmlUtil.createTextarea(i.name, i);
                if (section) {
                    section.appendChild(input.elem);
                    tr = null;
                    section_need_save = true;
                } else {
                    td2.appendChild(input.elem);
                }
                input.elem.setAttribute('style', (i.level > gOptions.configMode) ? Helper.staticVars.invisible : Helper.staticVars.visible);
            } else if (i.select) {
                var oc = function() {
                    setOption(this.key, this.value);
                }
                var input = HtmlUtil.createDropDown(i.name, i, i.select, oc);
                if (section) {
                    section.appendChild(input);
                    tr = null;
                } else {
                    td2.appendChild(input);
                }
                input.setAttribute('style', (i.level > gOptions.configMode) ? Helper.staticVars.invisible : Helper.staticVars.visible);
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
                var tab = tabv.appendTab(Helper.createUniqueId(i.name, i.id), h, current_elem);
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

                s.setAttribute('style', (i.level > gOptions.configMode) ? Helper.staticVars.invisible : Helper.staticVars.visible);
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
    var tab = tabv.appendTab(Helper.createUniqueId(i.name, i.id), h, util);

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
                if (c.file_url && c.file_url.trim() != "") {
                    p.file_url = c.file_url;
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
                    Helper.alert(chrome.i18n.getMessage('Unable_to_parse_this_'));
                }
                return;
            }
            var processScript = function(s) {
                try {
                    var name = s.name;
                    var code = Converter.UTF8.decode(Converter.Base64.decode(s.source));
                    var uu = s.file_url || s.update_url; // compatibility cause update_url was renamed to file_url

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
                                                             file_url: uu},
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
                Helper.alert(chrome.i18n.getMessage("An_error_occured_during_import_"));
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

        Helper.alert('Error: ' + msg);
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

    var imp_ta = HtmlUtil.createButton(i.name, i.id + '_i_ta', null, chrome.i18n.getMessage('Import_from_Textarea'), impo);
    var imp_ls = HtmlUtil.createButton(i.name, i.id + '_i_ls', null, chrome.i18n.getMessage('Import_from_SandboxFS'), impo_ls);
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

    var exp_ta = HtmlUtil.createButton(i.name, i.id + '_e_ta', null, chrome.i18n.getMessage('Export_to_Textarea'), expo);
    var exp_doc = HtmlUtil.createButton(i.name, i.id + '_e_doc', null, chrome.i18n.getMessage('Export_to_file'), expo_doc);
    var exp_ls = HtmlUtil.createButton(i.name, i.id + '_e_ls', null, chrome.i18n.getMessage('Export_to_SandboxFS'), expo_ls);

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
    var tabv = TabView.create('_main', tv);

    if (V) console.log("options: itemsToMenu");
    itemsToMenu(items, tabv);
    if (V) console.log("options: utilTab");
    createUtilTab(tabv);

    gNoWarn = null;
    initialized = true;
    Please.hide();
};

var createCludesEditor = function(name, type, other_name) {
    var i = type.item;
    var id = i.id + type.id;
    var key = (other_name ? 'orig_' : 'use_') + type.id;
	
    var selId = function(k){
        return 'select_' + Helper.createUniqueId(k, i.id) + '_sel1';
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

    var tabd = TabView.create('_details' + Helper.createUniqueId(i.name, i.id), details, style);
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

    var i_pos = HtmlUtil.createPosition(chrome.i18n.getMessage('Position_') + ' ', { id: 'position', name: i.name, pos: i.position, posof: i.positionof }, co);

    var i_ra = HtmlUtil.createScriptStartDropDown(chrome.i18n.getMessage('Run_at'),
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

    var i_md = HtmlUtil.createCheckbox(chrome.i18n.getMessage('Convert_CDATA_sections_into_a_chrome_compatible_format'),
                              { id: 'compat_metadata', name: i.name, enabled: i.compat_metadata },
                              co);
    var i_fe = HtmlUtil.createCheckbox(chrome.i18n.getMessage('Replace_for_each_statements'),
                              { id: 'compat_foreach', name: i.name, enabled: i.compat_foreach },
                              co);
    var i_vi = HtmlUtil.createCheckbox(chrome.i18n.getMessage('Fix_for_var_in_statements'),
                              { id: 'compat_forvarin', name: i.name, enabled: i.compat_forvarin },
                              co);
    var i_al = HtmlUtil.createCheckbox(chrome.i18n.getMessage('Convert_Array_Assignements'),
                              { id: 'compat_arrayleft', name: i.name, enabled: i.compat_arrayleft },
                              co);
    var i_ts = HtmlUtil.createCheckbox(chrome.i18n.getMessage('Add_toSource_function_to_Object_Prototype'),
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

    var tab = tabd.appendTab('script_settings_tab' + Helper.createUniqueId(i.name, i.id), tabh, tabc);

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
        var ou = i_uu.input ? i_uu.input.oldvalue : "";
        var nu = i_uu.input ? i_uu.input.value : "";

        saveScript(i.name, null, ou, nu, true, cb);
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

    var i_sc_save =   HtmlUtil.createButton(i.name, 'save',         null, chrome.i18n.getMessage('Save'),         saveEditor, chrome.extension.getURL('images/filesave.png'));
    var i_sc_cancel = HtmlUtil.createButton(i.name, 'cancel',       null, chrome.i18n.getMessage('Editor_reset'), resetScript, chrome.extension.getURL('images/editor_cancel.png'));
    var i_sc_reset =  HtmlUtil.createButton(i.name, 'reset',        null, chrome.i18n.getMessage('Full_reset'),   fullReset, chrome.extension.getURL('images/script_cancel.png'));
    var i_sc_close =  HtmlUtil.createButton(i.name, 'close_script', null, chrome.i18n.getMessage('Close'),        closeEditor, chrome.extension.getURL('images/exit.png') );

    var i_uu = HtmlUtil.createInput(chrome.i18n.getMessage('Update_URL_'),
                           { id: 'file_url', name: i.name, value: i.file_url });
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
            Helper.alert(chrome.i18n.getMessage('Script_modified_in_background'));
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
        var v = i.id ? "" : Helper.staticVars.invisible;
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
                var ou = i_uu.input ? i_uu.input.oldvalue : "";
                var nu = i_uu.input ? i_uu.input.value : "";
        
                saveScript(i.name, value, ou, nu, false, cb);
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

    var tab = tabd.appendTab('script_editor_tab' + Helper.createUniqueId(i.name, i.id), tabh, tabc);

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

    var sname = crc('span', 'script_name' + (i.nativeScript ? '' : ' clickable'), i.name, i.id, 'sname');
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
            tabh.appendChild(HtmlUtil.createImage(i.image, i.name, i.id, 'new_script_head'));
        } else {
            tabh = crc('div', '', i.name, i.id, 'details_h');
            tabh.textContent = chrome.i18n.getMessage('Edit') + ' - ' + (i.name.length > 25 ? i.name.substr(0,25) + '...' : i.name);
        }

        var tabc = cr('td', i.name, i.id, 'details_c');
        tab = tabv.insertTab(null, 'details_' + Helper.createUniqueId(i.name, i.id), tabh, tabc, onSelect, i.nnew ? null : doClose);

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

        var hp_script_img = HtmlUtil.createImage(chrome.extension.getURL('images/home.png'),
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
            last_updated.appendChild(HtmlUtil.createImage('/images/download.gif',
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

    if (i.file_url && i.file_url.trim() != "") {
        // "http://userscripts.org/scripts/source/44327.user.js".match(new RegExp("/http:\/\/userscripts\.org\/scripts\/source\/([0-9]{1,9})\.user\.js/"));
        var usoid = i.file_url.match(new RegExp("http:\/\/userscripts\.org\/scripts\/source\/([0-9]{1,9})\.user\.js"));
        if (usoid && usoid.length == 2) {
            var hpa = cr('a', i.name, i.id, 'hp');
            hpa.setAttribute('href', 'http://userscripts.org/scripts/show/' + usoid[1]);
            hpa.setAttribute('target', '_blank');

            var uso_script_img = HtmlUtil.createImage(Helper.staticVars.USOicon,
                                            i.name,
                                            i.id,
                                            "uso",
                                            "");

            hpa.appendChild(uso_script_img);
            hp_script.appendChild(hpa);
        }
    }

    var img_delete = HtmlUtil.createImage(chrome.extension.getURL('images/delete.png'),
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
                                             saveScript(i.name, null, null, null, null);
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
        var m = HtmlUtil.createImage('http://www.google.com/images/icons/product/chrome-16.png',
                            i.name,
                            i.id,
                            "chrome_mode",
                            chrome.i18n.getMessage("This_script_runs_in_Chrome_mode"));
        span.appendChild(m);
    }
    if (i.nativeScript) {
        var m = HtmlUtil.createImage(i.icon,
                            i.name,
                            i.id,
                            "chrome_ext",
                            chrome.i18n.getMessage("This_is_a_chrome_extension"));
        span.appendChild(m);
    }

    if (i.nativeScript) return span;

    if (i.code.search('GM_xmlhttpRequest') != -1) {
        var m = HtmlUtil.createImage(chrome.extension.getURL('images/web.png'),
                            i.name,
                            i.id,
                            "web",
                            chrome.i18n.getMessage("This_script_has_full_web_access"));
        span.appendChild(m);
    }
    if (i.code.search('GM_setValue') != -1) {
        var m = HtmlUtil.createImage(chrome.extension.getURL('images/db.png'),
                            i.name,
                            i.id,
                            "db",
                            chrome.i18n.getMessage("This_script_stores_data"));
        span.appendChild(m);
    }
    if (i.code.search('unsafeWindow') != -1) {
        var m = HtmlUtil.createImage(chrome.extension.getURL('images/resources.png'),
                            i.name,
                            i.id,
                            "resource",
                            chrome.i18n.getMessage("This_script_has_access_to_webpage_scripts"));
        span.appendChild(m);
    }
    for (var o=0; o<i.includes.length; o++) {
        if (i.includes[o].search('https') != -1) {
            var m = HtmlUtil.createImage(chrome.extension.getURL('images/halfencrypted.png'),
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
            var m = HtmlUtil.createImage(chrome.extension.getURL('images/critical.png'),
                                i.name,
                                i.id,
                                "crit",
                                chrome.i18n.getMessage("One_or_more_compatibility_options_are_set"));
            span.appendChild(m);
            break;
        }
    }
    if (i.system) {
        var m = HtmlUtil.createImage(chrome.extension.getURL('images/lock.png'),
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

    var up2 = HtmlUtil.createImage(chrome.extension.getURL('images/2uparrow.png'),
                          i.name,
                          "position",
                          "2up",
                          "2 Up",
                          function() { modifyScriptOption(this.name, this.key, 1); });
    var up1 = HtmlUtil.createImage(chrome.extension.getURL('images/1downarrow.png'),
                          i.name,
                          "position",
                          "1up",
                          "1 Up",
                          function() { modifyScriptOption(this.name, this.key, i.position-1); });
    var down1 = HtmlUtil.createImage(chrome.extension.getURL('images/1downarrow1.png'),
                            i.name,
                            "position",
                            "1down",
                            "1 Down",
                            function() { modifyScriptOption(this.name, this.key, i.position+1); });
    var down2 = HtmlUtil.createImage(chrome.extension.getURL('images/2downarrow.png'),
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
                var img = HtmlUtil.createImage(chrome.extension.getURL('images/web.png'),
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
                    ico.search('http://userscripts.com/') == 0) ico = Helper.staticVars.USOicon;

                var img = HtmlUtil.createImage(ico,
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
        console.log("lU: " + e.message);
    }
};

var saveScript = function(name, code, old_url, new_url, clean, cb) {
    try {
        var ou = old_url ? old_url : "";
        var nu = (new_url && new_url != old_url) ? new_url : "";

        chrome.extension.sendRequest({method: "saveScript",
                                      name: name,
                                      code: code,
                                      clean : clean,
                                      file_url: ou,
                                      force_url: nu },
                                     function(response) {
                                         if (response.items) createOptionsMenu(response.items, name && true);
                                         if (!code) {
                                             Please.hide();
                                         }
                                         if (cb) {
                                             cb(response);
                                         }
                                     });
        Please.wait();
    } catch (e) {
        console.log("sS: " + e.message);
    }
};

var setOption = function(name, value, ignore) {
    try {
        chrome.extension.sendRequest({method: "setOption", name: name, value: value},
                                     function(response) {
                                         if (!ignore) createOptionsMenu(response.items);
                                     });
        Please.wait();
    } catch (e) {
        console.log("sO: " + e.message);
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
        Please.wait();
    } catch (e) {
        console.log("mSo: " + e.message);
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
        Please.wait();
    } catch (e) {
        console.log("mSo: " + e.message);
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
        Please.wait();
    } catch (e) {
        console.log("mSo: " + e.message);
    }
};

var runScriptUpdates = function(id, cb) {
    try {
        var done = function(response) {
            if (cb) cb(response.updatable);
        }
        chrome.extension.sendRequest({method: "runScriptUpdates", scriptid: id}, done);
    } catch (e) {
        console.log("rSu: " + e.message);
    }
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
            Helper.alert(request.msg);
            sendResponse({});
        } else {
            if (V) console.log("o: " + chrome.i18n.getMessage("Unknown_method_0name0" , request.method));
        }
    });

if (V) console.log("Register request listener (options)");

var listener = function() {
    window.removeEventListener('DOMContentLoaded', listener, false);
    window.removeEventListener('load', listener, false);

    var delay = function() {
        modifyScriptOption(null, false);
    };

    window.setTimeout(delay, 500);
    Please.wait();
};

window.addEventListener('DOMContentLoaded', listener, false);
window.addEventListener('load', listener, false);

})();
