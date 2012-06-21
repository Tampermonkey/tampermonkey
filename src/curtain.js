/**
 * @filename curtain.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    var curtain = null;
 
    Registry.require('crcrc');
    var CRC = Registry.get('crcrc');
    var cr = CRC.cr;
    var crc = CRC.crc;

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

    var wait = { wait: pleaseWait, hide: hideWait };
    
    Registry.register('curtain', wait);
})();
