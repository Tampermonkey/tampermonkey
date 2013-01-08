/**
 * @filename tabview.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    Registry.require('crcrc');
    Registry.require('helper');
    var Helper = Registry.get('helper');
    
    var cr = Registry.get('crcrc').cr;
    var crc = Registry.get('crcrc').crc;

    var tvCache = {};

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
                "tv_tabs_fill" : 'tv_tabs_fill',
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
        var tabs_fill = crc('div', style.tv_tabs_fill, 'tv_tabs_fill' + prefix);
        var tabs_table = crc('div', style.tv_tabs_table, 'tv_tabs_table' + prefix);
        var tabs = crc('div', style.tv_tabs_align, 'tv_tabs_align' + prefix);

        var ctr = crc('tr', style.tr_content, 'content' + parent.id + prefix);
        var ctd = crc('td', style.td_content, 'content' + prefix);
        var content = crc('table', style.tv_contents + ' noborder', 'tv_content' + prefix);

        tabs_table.appendChild(tabs);
        tabs_fill.appendChild(tabs_table);
        ptd.appendChild(tabs_fill);
        ptr.appendChild(ptd);
        table.appendChild(ptr);

        ctd.appendChild(content);
        ctr.appendChild(ctd);
        table.appendChild(ctr);
        container.appendChild(table);

        parent.appendChild(container);

        var setHtmlVisible = function(elem, vis, move) {
            if (vis) {
                elem.setAttribute('style', move ? Helper.staticVars.visible_move : Helper.staticVars.visible);
            } else {
                elem.setAttribute('style', move ? Helper.staticVars.invisible_move : Helper.staticVars.invisible);
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

    Registry.register('tabview', { create : createTabView });
})();

    
