/**
 * @filename crc.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {

    Registry.require('helper');
    var Helper = Registry.get('helper');

    var cr = function(tag, name, id, append, replace) {
        return crc(tag, null, name, id, append, replace);
    };

    var crc = function(tag, clas, name, id, append, replace) {
        try {
            var uid = tag + '_' + Helper.createUniqueId(name, id);
            if (append != undefined) uid += '_' + append;
            var e = document.getElementById(uid);
            if (e && replace) {
                var f = document.createElement(tag);
                f.setAttribute('id', uid);
                var p = e.parentNode;
                p.insertBefore(f, e);
                p.removeChild(e);
                e = f;
            } else if (e) {
                e.inserted = true;
            } else {
                e = document.createElement(tag);
                e.setAttribute('id', uid);
            }
            if (clas) e.setAttribute("class", clas);
            if (!e.__removeChild) {
                e.__removeChild = e.removeChild;
                e.removeChild = function(elem) {
                    delete elem.inserted;
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
            console.log("options: Error:" + err.message);
        }
        return e;
    };

    Registry.register('crcrc', { cr: cr, crc: crc});

 })();
