function showVideo(iframe, config) {
    if(config.videoId) {
        if(config.type == "video") {
            iframe.src = "https://player.twitch.tv/?video=" + config.videoId + "&autoplay=false";
        }
        else if(config.type == "clip") {
            iframe.src = "https://clips.twitch.tv/embed?clip=" + config.videoId + "&autoplay=false";
        }
    }
}
