/**
 * @filename pingpong.js
 * @author Jan Biniok <jan@biniok.net>
 * @licence GPL v3
 */

(function() {
    var V = false;
    var timeout = 1000;
    var _to = null;
    var _retries = 5;
    
    var ping = function(suc, fail) {
        var clear = function() {
            if (_to != null) {
                window.clearTimeout(_to);
            }
            _to = null;
        };
        
        var timedout = function() {
            clear();
            if (_retries-- > 0) {
                if (V) console.log("pp: ping timed out! retries: " + _retries);
                ping(suc, fail);
                return;
            }
            if (fail) fail();
        };
        
        var response = function() {
            if (V) console.log("pp: ping succed!");
            clear();
            suc();
        };
        
        var req = { method: "ping" };
        try { 
            chrome.extension.sendMessage(req, response);
        } catch (e) {}

        _to = window.setTimeout(timedout, timeout);
    };
    
    Registry.register('pingpong', { ping: ping });
})();
