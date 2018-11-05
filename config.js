(function() {
    "use strict";
    var twitch = window.Twitch.ext;
    var iframe = document.getElementById("embed");
    var inputs = document.querySelectorAll("input");
    var videoId = document.querySelector('[name="videoId"]');
    function getConfig() {
        var config = {};
        for(var i of inputs) {
            if(i.type !== "radio" || i.checked) {
                config[i.name] = i.value;
            }
        }
        return config;
    }
    document.querySelector("form").addEventListener("submit", function(e) {
        e.preventDefault();
        twitch.configuration.set('broadcaster', '1.0.0', JSON.stringify(getConifg()));
    });
    document.addEventListener("input", function(e) {
        showVideo(iframe, getConfig());
        if(e.target.name === "type" && e.target.checked) {
            if(e.target.value === "video") {
                videoId.pattern = 'v[0-9]+';
                videoId.placeholder = 'v123456789';
            }
            else {
                videoId.pattern = '[A-Za-z]+';
                videoId.placeholder = 'ClipSlugName';
            }
        }
    }, true);
    twitch.onAuthorized(function() {
    });
    twitch.configuration.onChanged(function() {
        if(twitch.configuration.broadcaster) {
            var config = JSON.parse(twitch.configuration.broadcaster.content);
            for(var k in config) {
                if(config.hasOwnProperty(k)) {
                    if(k == "type") {
                        document.querySelector('[name="type"][value="'+config[k]+'"]').checked = true;
                    }
                    else {
                        document.querySelector('[name="'+k+'"]').value = config[k];
                    }
                }
            }
            showVideo(iframe, getConfig());
        }
    });
})();
