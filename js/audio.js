'use strict';

function play_audio(id){
    //if(settings['audio-volume'] <= 0){
    //    return;
    //}

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}
