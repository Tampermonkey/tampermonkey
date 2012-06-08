
function MirrorFrame(place, options) {
    this.edit = document.createElement("div");
    this.home = document.createElement("div");
    
    this.edit.setAttribute('class', "CodeMirror-menu");
    this.home.setAttribute('class', "CodeMirror-editor");
    
    if (place.appendChild && place.insertBefore && place.firstChild) {
        place.insertBefore(this.home, place.firstChild);
        place.appendChild(this.edit);
    } else if (place.appendChild) {
        place.appendChild(this.home);
        place.appendChild(this.edit);
    } else {
        place(this.home);
    }

    var self = this;
    function makeButton(name, action) {
        var button = document.createElement("input");
        button.type = "button";
        button.value = name;
        self.home.appendChild(button);
        button.onclick = function(){self[action].call(self);};
    }

    if (!options.noButtons) {
        makeButton("Search", "search");
        makeButton("Replace", "replace");
        makeButton("Jump to line", "jump");
        makeButton("Insert constructor", "macro");
        makeButton("Auto-Indent all", "reindent");
    }

    this.mirror = new CodeMirror(this.edit, options);
}

MirrorFrame.prototype = {
    toTextArea: function() {
    },
    search: function(text) {
        var first = false;
        var wrap;
        var cursor;
        
        if (text == undefined) {
            text = prompt("Enter search term:", "");
            if (!text) return;
            first = true;
        }

        cursor = this.mirror.getSearchCursor(text, this.mirror.getCursor());

        do {
            wrap = false;
            if (!cursor.findNext()) {
                wrap = confirm("End of document reached. Start over?")
                if (wrap) {
                    cursor = this.mirror.getSearchCursor(text);
                }
            } else {
                this.mirror.setSelection(cursor.pos.from, cursor.pos.to);
            }
        } while (wrap);

        return text;
    },

    replace: function() {
        // This is a replace-all, but it is possible to implement a
        // prompting replace.
        var from = prompt("Enter search string:", ""), to;
        if (from) to = prompt("What should it be replaced with?", "");
        if (to == null) return;

        var cursor = this.mirror.getSearchCursor(from, false);
        while (cursor.findNext())
            cursor.replace(to);
    },

    jump: function() {
        var line = prompt("Jump to line:", "");
        if (line && !isNaN(Number(line-1)))
            this.mirror.setCursor(Number(line-1));
        this.mirror.focus();
    },

    line: function() {
        alert("The cursor is currently at line " + this.mirror.currentLine());
        this.mirror.focus();
    },

    macro: function() {
        var name = prompt("Name your constructor:", "");
        if (name)
            this.mirror.replaceSelection("function " + name + "() {\n  \n}\n\n" + name + ".prototype = {\n  \n};\n");
    },

    reindent: function() {
        this.mirror.autoIndentRange({ line: 0 }, { line: this.mirror.lineCount() - 1 });
    }
};
