'use strict';

function audio_create(id, properties){
    audio_audio[id] = {};
    audio_audio[id]['playing'] = false;

    for(var property in properties){
        audio_audio[id][property] = properties[property];
    }
}

function audio_init(default_volume){
    audio_context = new window.AudioContext();
    audio_volume = default_volume !== void 0
      ? default_volume
      : 1;
}

function audio_onended(that){
    audio_audio[that.id]['playing'] = false;

    if(audio_audio[that.id]['repeat']){
        window.setTimeout(
          'audio_start("' + that.id + '");',
          audio_audio[that.id]['duration'] * audio_audio[that.id]['timeout']
        );
    }

    delete audio_oscillators[that.id];
}

function audio_oscillator_create(id, connections, volume_multiplier){
    connections = connections || [
      'oscillator',
      'gain',
    ];

    var volume = audio_audio[id]['volume'] || audio_volume;
    volume_multiplier = volume_multiplier !== void 0
      ? volume_multiplier
      : false;
    if(volume_multiplier !== false){
        volume *= volume_multiplier;
    }

    audio_oscillators[id] = {
      'duration': audio_audio[id]['duration'] || 0,
      'gain': audio_context.createGain(),
      'oscillator': audio_context.createOscillator(),
      'start': audio_audio[id]['start'] || 0,
      'timeout': audio_audio[id]['timeout'] || 1000,
    };
    audio_oscillators[id]['gain']['gain']['value'] = volume;
    audio_oscillators[id]['oscillator']['frequency']['value'] = audio_audio[id]['frequency'] || 100;
    audio_oscillators[id]['oscillator']['id'] = id;
    audio_oscillators[id]['oscillator']['onended'] = function(){
        audio_onended(this);
    };
    audio_oscillators[id]['oscillator']['type'] = audio_audio[id]['type'] || 'sine';

    for(var i = 0; i < connections.length - 1; i++){
        audio_oscillators[id][connections[i]].connect(audio_oscillators[id][connections[i + 1]]);
    }
    audio_oscillators[id][connections[connections.length - 1]].connect(audio_context.destination);
}

function audio_start(id, volume_multiplier){
    if(volume_multiplier === 0){
        return;
    }

    if(audio_audio[id]['playing']){
        audio_stop(id);
    }

    audio_oscillator_create(
      id,
      audio_audio[id]['connections'],
      volume_multiplier
    );

    var startTime = audio_context.currentTime + audio_oscillators[id]['start'];
    audio_audio[id]['playing'] = true;
    audio_oscillators[id]['oscillator'].start(startTime);
    audio_stop(
      id,
      startTime + audio_oscillators[id]['duration']
    );
}

function audio_stop(id, when){
    audio_oscillators[id]['oscillator'].stop(when || void 0);
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
