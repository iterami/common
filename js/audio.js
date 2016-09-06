'use strict';

function audio_create(id, properties){
    audio_audio[id] = audio_audio[id] || {};
    for(var property in properties){
        audio_audio[id][property] = properties[property];
    }
}

function audio_html(id){
    var html = '<audio'
      + ' id="' + id + '"'
      + ' src="' + audio_audio[id]['src'] + '"'
      + '></audio>';
    return html;
}

function audio_init(default_volume){
    audio_volume = default_volume !== void 0
      ? default_value
      : 1;
}

function audio_play(id){
    if(audio_volume <= 0){
        return;
    }

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}

var audio_audio = {};
var audio_volume = 1;
