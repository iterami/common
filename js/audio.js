'use strict';

function audio_create(id, properties){
    for(var property in properties){
        audio[id] = properties[property];
    }
}

function audio_init(default_volume){
    audio_volume = default_volume;
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
