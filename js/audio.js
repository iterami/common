'use strict';

function audio_create(id, properties){
    audio_audio[id] = audio_audio[id] || {};
    audio_audio[id]['gain'] = audio_context.createGain();
    audio_audio[id]['gain']['gain']['value'] = properties['volume'] || audio_volume;
    audio_audio[id]['oscillator'] = audio_context.createOscillator();
    audio_audio[id]['oscillator']['frequency']['value'] = properties['frequency'] || 1000;
    audio_audio[id]['oscillator']['type'] = properties['type'] || 'sine';

    audio_audio[id]['oscillator'].connect(audio_audio[id]['gain']);
    audio_audio[id]['gain'].connect(audio_context.destination);
}

function audio_init(default_volume){
    audio_context = new window.AudioContext();
    audio_volume = default_volume !== void 0
      ? default_value
      : 1;
}

function audio_set_volume(volume){
    audio_audio[id]['gain']['gain']['value'] = volume;
}

function audio_set_volume_all(volume){
    audio_volume = volume;

    for(var id in audio_audio){
        audio_set_volume(id, audio_volume);
    }
}

function audio_start(id){
    audio_audio[id]['oscillator'].start();
}

function audio_stop(id){
    audio_audio[id]['oscillator'].stop();
}

function audio_stop_all(){
    for(var id in audio_audio){
        audio_stop(id);
    }
}

var audio_audio = {};
var audio_context = 0;
var audio_volume = 1;
