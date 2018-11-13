function showPlayerInEmbed(embed, src, poster) {
    var video = embed.querySelector("video");
    video.src = src;
    video.poster = poster || '';
    video.className = '';
    embed.querySelector("a").className = 'hidden';
}

function showPreviewInEmbed(embed, src, link) {
    var image = embed.querySelector("a");
    image.href = link;
    image.querySelector("img").src = src;
    image.className = '';
    embed.querySelector("video").className = 'hidden';
}

function showVideo(video, config, clientId) {
    if(config.videoId) {
        if(config.type == "video") {
            fetch(`https://api.twitch.tv/helix/videos?id=${config.videoId}`, {
                headers: {
                    'Client-ID': clientId
                }
            })
                .then((res) => {
                    if(res.ok) {
                        return res.json();
                    }
                    throw new Error(`Could not load video details for ${config.videoId}`)
                })
                .then((json) => {
                    showPreviewInEmbed(video, json.data[0].thumbnail_url.replace('%{width}', video.clientWidth).replace('%{height}', video.clientHeight), json.data[0].url);
                })
                .catch(console.error);
        }
        else if(config.type == "clip") {
            fetch(`https://api.twitch.tv/helix/clips?id=${config.videoId}`, {
                headers: {
                    'Client-ID': clientId
                }
            })
                .then((res) => {
                    if(res.ok) {
                        return res.json();
                    }
                    throw new Error(`Could not load clip details for ${config.videoId}`);
                })
                .then((json) => {
                    if(config.embed === "player") {
                        showPlayerInEmbed(video, json.data[0].thumbnail_url.replace(/-preview-\d+x\d+\.[a-z]+$/, '.mp4'), json.data[0].thumbnail_url);
                    }
                    else {
                        showPreviewInEmbed(video, json.data[0].thumbnail_url, json.data[0].url);
                    }
                })
                .catch(console.error);
        }
    }
}
