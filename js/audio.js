'use strict';

function audio_create(id, properties){
    audio_audio[id] = audio_audio[id] || {};
    for(var property in properties){
        audio_audio[id][property] = properties[property];
    }
}

function audio_create_oscillator(id){
    audio_oscillators[id] = {};
    audio_oscillators[id]['duration'] = audio_audio[id]['duration'] || 0;
    audio_oscillators[id]['gain'] = audio_context.createGain();
    audio_oscillators[id]['gain']['gain']['value'] = audio_audio[id]['volume'] || audio_volume;
    audio_oscillators[id]['oscillator'] = audio_context.createOscillator();
    audio_oscillators[id]['oscillator']['frequency']['value'] = audio_audio[id]['frequency'] || 100;
    audio_oscillators[id]['oscillator']['id'] = id;
    audio_oscillators[id]['oscillator']['onended'] = function(){
    audio_oscillators[id]['start'] = audio_audio[id]['start'] || 0;
        audio_onended(this);
    };
    audio_oscillators[id]['oscillator']['type'] = audio_audio[id]['type'] || 'sine';

    audio_oscillators[id]['oscillator'].connect(audio_oscillators[id]['gain']);
    audio_oscillators[id]['gain'].connect(audio_context.destination);
}

function audio_init(default_volume){
    audio_context = new window.AudioContext();
    audio_volume = default_volume !== void 0
      ? default_value
      : 1;
}

function audio_onended(that){
    delete audio_oscillators[that.id];
}

function audio_start(id){
    audio_create_oscillator(id);

    audio_oscillators[id]['oscillator'].start(audio_oscillators[id]['start']);
    audio_oscillators[id]['oscillator'].stop(audio_oscillators[id]['duration']);
}

function audio_stop(id, when){
    audio_oscillators[id]['oscillator'].stop(when);
    delete audio_oscillators[id];
}

function audio_stop_all(){
    for(var id in audio_oscillators){
        audio_stop(id);
    }
}

var audio_audio = {};
var audio_context = 0;
var audio_oscillators = {};
var audio_volume = 1;
