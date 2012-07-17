(function() {
    Registry.require('crcrc');
    
    var cr = Registry.get('crcrc').cr;
    var crc = Registry.get('crcrc').crc;

var createImageText = function(src, name, id, append, title, oc, text) {
    var wrap = cr('div', name, id, append, 'wrap', true);
    var image = cr('image', name, id, append, true);
    var spos;

    image.setAttribute("width", "16px");
    image.setAttribute("height", "16px");
    image.setAttribute("src", src);
    wrap.setAttribute("style", "cursor: pointer;");
    if (title) wrap.title = title;
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

var createImage = function(src, name, id, append, title, oc) {
    var image = cr('image', name, id, append);

    image.setAttribute("width", "16px");
    image.setAttribute("height", "16px");
    image.setAttribute("src", src);
    if (oc) image.setAttribute("style", "cursor: pointer;");
    if (title) image.title = title;
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

var createSearchBox = function(tabURL) {
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

    
Registry.register('htmlutil', {
                          createImageText : createImageText,
                          createImage : createImage,
                          createFileInput : createFileInput,
                          createTextarea : createTextarea,
                          createInput : createInput,
                          createCheckbox : createCheckbox,
                          createDropDown : createDropDown,
                          createScriptStartDropDown : createScriptStartDropDown,
                          createButton : createButton,
                          createPosition : createPosition,
                          createSearchBox : createSearchBox});
})();
