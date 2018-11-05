(function() {
    "use strict";
    var twitch = window.Twitch.ext;
    var iframe = document.getElementById("embed");
    twitch.onAuthorized(function() {

    });
    twitch.configuration.onChanged(function() {
        if(twitch.configuration.broadcaster) {
            showVideo(iframe, JSON.parse(twitch.configuration.broadcaster.content));
        }
    });
})();
