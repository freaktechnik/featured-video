(function() {
    "use strict";
    var twitch = window.Twitch.ext;
    var iframe = document.getElementById("embed");
    var inputs = document.querySelectorAll("input[name]");
    var videoId = document.querySelector('[name="videoId"]');
    var results = document.getElementById("vodResults");
    var recommendationCount = 5;
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
    function updateVideo() {
        var config = getConfig();
        document.getElementById("noEmbed").className = config.videoId ? 'hidden' : '';
        iframe.className = config.videoId ? '' : 'hidden';
        showVideo(iframe, config);
    }
    function addSuggestion(id, title, thumbnail, viewCount, duration) {
        var root = document.createElement("li");
        var titleEl = document.createElement("h3");
        titleEl.textContent = title;
        var thumb = new Image();
        thumb.src = thumbnail.replace('%{height}', 80).replace('%{width}', 142);
        var description = document.createElement("p");
        var viewCountEl = document.createElement("span");
        viewCountEl.textContent = `Views: ${viewCount}`;
        var contentWrapper = document.createElement("div");
        contentWrapper.className = 'wrapper';
        description.appendChild(viewCountEl);
        if(duration) {
            var durationEl = document.createElement("span");
            durationEl.textContent = `Duration: ${duration}`;
            description.appendChild(durationEl);
        }
        contentWrapper.appendChild(titleEl);
        contentWrapper.appendChild(description);
        root.appendChild(contentWrapper);
        root.appendChild(thumb);
        root.title = `Use ${id}`;

        //TODO add view count and optionally duration

        root.addEventListener("click", (e) => {
            document.querySelector('[name="videoId"]').value = id;
            updateVideo();
        }, false);

        results.appendChild(root);
    }
    function searchVideos() {
        clearResults();
        if(!searchVideos.channelId || !searchVideos.clientId) {
            return;
        }
        if(getType() === "clip") {
            fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${searchVideos.channelId}&first=${recommendationCount}`, {
                headers: {
                    'Client-ID': searchVideos.clientId
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
            fetch(`https://api.twitch.tv/helix/videos?user_id=${searchVideos.channelId}&first=${recommendationCount}`, {
                headers: {
                    'Client-ID': searchVideos.clientId
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
        twitch.configuration.set('broadcaster', '1.0.0', JSON.stringify(getConfig()));
    });
    document.addEventListener("input", function(e) {
        updateVideo();
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
        searchVideos();
    });
    twitch.configuration.onChanged(function() {
        if(twitch.configuration.broadcaster) {
            var config = JSON.parse(twitch.configuration.broadcaster.content);
            for(var k in config) {
                if(config.hasOwnProperty(k)) {
                    if(k == "type") {
                        document.querySelector('input[name="type"][value="'+config[k]+'"]').checked = true;
                        if(config[k] == 'clip') {
                            videoId.pattern = '[A-Za-z]+';
                            videoId.placeholder = 'ClipSlugName';
                        }
                    }
                    else {
                        document.querySelector('input[name="'+k+'"]').value = config[k];
                        if(k == 'videoId') {
                            results.parentElement.open = false;
                        }
                    }
                }
            }
            updateVideo();
        }
    });
    twitch.onContext(function(context) {
        document.body.className = context.theme;
    });
})();
