(function() {
    "use strict";
    var twitch = window.Twitch.ext;
    var iframe = document.getElementById("embed");
    var inputs = document.querySelectorAll("input[name]");
    var videoId = document.querySelector('[name="videoId"]');
    var results = document.getElementById("vodResults");
    function getConfig() {
        var config = {};
        for(var i of inputs) {
            if(i.type !== "radio" || i.checked) {
                config[i.name] = i.value;
            }
        }
        return config;
    }
    function clearResults() {
        while(results.firstElementChild) {
            results.firstElementChild.remove();
        }
    }
    function getType() {
        return document.querySelector('input[name="type"]:checked').value;
    }
    function addSuggestion(id, title, thumbnail, viewCount, duration) {
        var root = document.createElement("li");
        var title = document.createElement("h3");
        title.textContent = title;
        var thumb = new Image();
        thumb.src = thumbnail;
        root.appendChild(title);
        root.appendChild(thumb);
        root.title = `Use ${id}`;

        //TODO add view count and optionally duration

        root.addEventListener("click", (e) => {
            document.querySelector('[name="videoId"]').value = id;
        }, false);

        results.appendChild(root);
    }
    function searchVideos() {
        clearResults();
        if(!this.channelId || this.clientId) {
            return;
        }
        if(getType() === "clip") {
            fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${this.channelId}`, {
                headers: {
                    'Client-ID': this.clientId
                }
            }).then((res) => {
                return res.json();
            }).then((result) => {
                for(const clip of result.data) {
                    addSuggestion(clip.id, clip.title, clip.thumbnail_url, clip.view_count);
                }
            })
        }
        else { // VOD
            fetch(`https://api.twitch.tv/helix/videos?user_id=${this.channelId}`, {
                headers: {
                    'Client-ID': this.clientId
                }
            }).then((res) => {
                return res.json();
            }).then((result) => {
                for(const vod of result.data) {
                    addSuggestion(`v${vod.id}`, vod.title, vod.thumbnail_url, vod.view_count, vod.duration);
                }
            });
        }
    }
    document.querySelector("form").addEventListener("submit", function(e) {
        e.preventDefault();
        twitch.configuration.set('broadcaster', '1.0.0', JSON.stringify(getConifg()));
    });
    document.addEventListener("input", function(e) {
        showVideo(iframe, getConfig());
        if(e.target.name === "type" && e.target.checked) {
            searchVideos();
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
    twitch.onAuthorized(function(info) {
        searchVideos.channelId = info.channelId;
        searchVideos.clientId = info.clientId;
    });
    twitch.configuration.onChanged(function() {
        if(twitch.configuration.broadcaster) {
            var config = JSON.parse(twitch.configuration.broadcaster.content);
            for(var k in config) {
                if(config.hasOwnProperty(k)) {
                    if(k == "type") {
                        document.querySelector('input[name="type"][value="'+config[k]+'"]').checked = true;
                    }
                    else {
                        document.querySelector('input[name="'+k+'"]').value = config[k];
                    }
                }
            }
            showVideo(iframe, getConfig());
        }
    });
})();
