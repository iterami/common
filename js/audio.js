'use strict';

function audio_create(id, properties){
    for(var property in properties){
        audio[id] = properties[property];
    }
}

function audio_play(id){
    //if(settings['audio-volume'] <= 0){
    //    return;
    //}

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}

var audio_audio = {};
