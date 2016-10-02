'use strict';

function audio_create(id, properties){
    audio_audio[id] = {};
    audio_audio[id]['id'] = id;
    audio_audio[id]['onended'] = function(){
        audio_onended(this);
    };
    audio_audio[id]['playing'] = false;

    for(var property in properties){
        audio_audio[id][property] = properties[property];
    }

    audio_audio[id]['connections'] = properties['connections'] || [
      {
        'frequency': {
          'value': audio_audio[id]['frequency'] || 100,
        },
        'label': 'Oscillator',
        'type': audio_audio[id]['type'] || 'sine',
      },
      {
        'gain': {
          'value': properties['volume'] || audio_volume,
        },
        'label': 'Gain',
      },
    ];
}

function audio_init(default_volume){
    audio_context = new window.AudioContext();
    audio_volume = default_volume !== void 0
      ? default_volume
      : 1;
}

function audio_node_create(id, properties){
    var source = audio_context['create' + properties['label']](
      properties['arg0'],
      properties['arg1'],
      properties['arg2']
    );

    for(var property in properties){
        if(typeof properties[property] === 'object'){
            for(var subproperty in properties[property]){
                source[property][subproperty] = properties[property][subproperty];
            }

        }else{
            source[property] = properties[property];
        }
    }

    audio_sources[id][properties['label']] = source;
}

function audio_onended(that){
    audio_audio[that.id]['playing'] = false;

    if(audio_audio[that.id]['repeat']){
        if(audio_audio[that.id]['timeout'] <= 0){
            audio_start(that.id);
f
        }else{
            window.setTimeout(
              'audio_start("' + that.id + '");',
              audio_audio[that.id]['duration'] * audio_audio[that.id]['timeout']
            );
        }
    }

    delete audio_sources[that.id];
}

function audio_source_create(id, volume_multiplier){
    audio_sources[id] = {
      'duration': audio_audio[id]['duration'] || 0,
      'start': audio_audio[id]['start'] || 0,
      'timeout': audio_audio[id]['timeout'] || 1000,
    };

    // Create audio nodes.
    var connections_length = audio_audio[id]['connections'].length;
    for(var i = 0; i < connections_length; i++){
        audio_node_create(
          id,
          audio_audio[id]['connections'][i]
        );

        if(audio_audio[id]['connections'][i]['label'] === 'Gain'){
            var volume = audio_audio[id]['volume'] || audio_volume;
            volume_multiplier = volume_multiplier !== void 0
              ? volume_multiplier
              : false;
            if(volume_multiplier !== false){
                volume *= volume_multiplier;
            }
            audio_sources[id]['Gain']['gain']['value'] = volume;
        }
    }

    // Connect audio nodes.
    for(i = 0; i < connections_length - 1; i++){
        audio_sources[id][audio_audio[id]['connections'][i]['label']].connect(audio_sources[id][audio_audio[id]['connections'][i + 1]['label']]);
    }
    audio_sources[id][audio_audio[id]['connections'][connections_length - 1]['label']].connect(audio_context.destination);
}

function audio_start(id, volume_multiplier){
    if(volume_multiplier === 0){
        return;
    }

    if(audio_audio[id]['playing']){
        audio_stop(id);
    }

    audio_source_create(
      id,
      volume_multiplier
    );

    var startTime = audio_context.currentTime + audio_sources[id]['start'];
    audio_audio[id]['playing'] = true;
    audio_sources[id][audio_audio[id]['connections'][0]['label']].start(startTime);
    audio_stop(
      id,
      startTime + audio_sources[id]['duration']
    );
}

function audio_stop(id, when){
    audio_sources[id][audio_audio[id]['connections'][0]['label']].stop(when || void 0);
}

function audio_stop_all(){
    for(var id in audio_sources){
        audio_stop(id);
    }
}

var audio_audio = {};
var audio_context = 0;
var audio_sources = {};
var audio_volume = 1;
