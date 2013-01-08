
function MirrorFrame(place, options, handlers) {
    this.edit = document.createElement("div");
    this.home = document.createElement("div");
    
    this.home.setAttribute('class', "CodeMirror-menu");
    this.edit.setAttribute('class', "CodeMirror-editor");
    
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
    var commands = {};
    
    function makeButton(name, action, dont) {
        if (dont === undefined) dont = true;

        var button = document.createElement("input");
        button.type = "button";
        button.value = name;
        self.home.appendChild(button);
        var doit = function(){self[action].call(self);};
        button.onclick = doit;
        if (dont) commands[action] = doit;
    }

    if (!options.noButtons) {
        makeButton("Search", "search", false);
        makeButton("Replace", "replace");
        makeButton("Jump to line", "jump");
        makeButton("Insert constructor", "macro");
        makeButton("Auto-Indent all", "reindentall");
    }

    this.mirror = new CodeMirror(this.edit, options);
    for (var k in commands) {
        this.mirror.setCommand(k, commands[k]);
    }
    
    if (handlers) {
        for (var k in handlers) {
            this.mirror.setCommand(k, handlers[k]);
        }
    }
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

    reindentall: function() {
        this.mirror.autoIndentRange({ line: 0 }, { line: this.mirror.lineCount() - 1 });
    }
};
