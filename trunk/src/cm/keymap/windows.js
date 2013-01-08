(function() {
    CodeMirror.keyMap.windows = {
        "Ctrl-Q": "close",
        "F3": "findNext",
        "F4": "findPrev",
        "Ctrl-R": "replace",
        "Ctrl-J": "jump",
        "ESC": "close",
        fallthrough: ["default"]
    };
})();
