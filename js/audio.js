'use strict';

function create_audio(id, properties){
    for(var property in properties){
        audio[id] = properties[property];
    }
}

function play_audio(id){
    //if(settings['audio-volume'] <= 0){
    //    return;
    //}

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}

var audio = {};
