(function() {
    "use strict";
    var twitch = window.Twitch.ext;
    var video = document.getElementById("player");
    var loadState = {
        clientId: null,
        config: null,
        addValue: function(type, value) {
            this[type] = value;
            if(this.clientId && this.config) {
                showVideo(video, this.config, this.clientId);
            }
        }
    };
    twitch.onAuthorized(function(info) {
        loadState.addValue('clientId', info.clientId);
    });
    twitch.configuration.onChanged(function() {
        if(twitch.configuration.broadcaster) {
            loadState.addValue('config', JSON.parse(twitch.configuration.broadcaster.content));
        }
    });
})();
