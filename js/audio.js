'use strict';

// Required args: audios
function audio_create(args){
    for(const audio in args['audios']){
        audio_audios[audio] = {
          'playing': false,
        };

        audio_audios[audio] = core_args({
          'args': args['audios'][audio],
          'defaults': audio_audios[audio],
        });

        audio_audios[audio]['connections'] = args['audios'][audio]['connections'] || [
          {
            'frequency': {
              'value': audio_audios[audio]['frequency'] || 100,
            },
            'label': 'Oscillator',
            'type': audio_audios[audio]['type'] || 'sine',
          },
          {
            'gain': {
              'value': args['audios'][audio]['volume'] || core_storage_data['audio-volume'],
            },
            'label': 'Gain',
          },
        ];

        audio_audios[audio]['connections'][0]['id'] = audio;
        audio_audios[audio]['connections'][0]['onended'] = function(){
            audio_onended(this.id);
        };
    }
}

function audio_init(){
    audio_context = new globalThis.AudioContext();
    audio_create({
      'audios': {
        'boop': {
          'duration': .1,
        },
      },
    });
}

function audio_node_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': false,
        'properties': {
          'label': 'Oscillator',
        },
      },
    });

    const source = audio_context['create' + args['properties']['label']](
      args['properties']['arg0'],
      args['properties']['arg1'],
      args['properties']['arg2']
    );

    for(const property in args['properties']){
        if(core_type(args['properties'][property]) === 'object'){
            for(const subproperty in args['properties'][property]){
                source[property][subproperty] = args['properties'][property][subproperty];
            }

        }else{
            source[property] = args['properties'][property];
        }
    }

    if(args['id'] === false){
        return source;
    }

    audio_sources[args['id']][args['properties']['label']] = source;
}

function audio_onended(id){
    audio_audios[id]['playing'] = false;

    if(audio_audios[id]['repeat']){
        if(audio_audios[id]['timeout'] <= 0){
            audio_start(id);

        }else{
            globalThis.setTimeout(
              'audio_start(' + id + ');',
              audio_audios[id]['duration'] * audio_audios[id]['timeout']
            );
        }
    }

    delete audio_sources[id];
}

function audio_source_create(id){
    audio_sources[id] = {
      'duration': audio_audios[id]['duration'] || 0,
      'start': audio_audios[id]['start'] || 0,
      'timeout': audio_audios[id]['timeout'] || 1000,
    };

    const connections_length = audio_audios[id]['connections'].length;
    for(let i = 0; i < connections_length; i++){
        audio_node_create({
          'id': id,
          'properties': audio_audios[id]['connections'][i],
        });

        if(audio_audios[id]['connections'][i]['label'] === 'Gain'){
            audio_sources[id]['Gain']['gain']['value'] =
              audio_audios[id]['volume'] || core_storage_data['audio-volume'];
        }
    }

    for(let i = 0; i < connections_length - 1; i++){
        audio_sources[id][audio_audios[id]['connections'][i]['label']].connect(
          audio_sources[id][audio_audios[id]['connections'][i + 1]['label']]
        );
    }
    audio_sources[id][audio_audios[id]['connections'][connections_length - 1]['label']].connect(
      audio_context.destination
    );
}

function audio_start(id){
    if(audio_context === false){
        audio_init();
    }

    if(audio_audios[id]['playing']){
        audio_stop({
          'id': id,
        });
    }

    audio_source_create(id);

    const startTime = audio_context.currentTime + audio_sources[id]['start'];
    audio_audios[id]['playing'] = true;
    audio_sources[id][audio_audios[id]['connections'][0]['label']].start(startTime);
    audio_stop({
      'id': id,
      'when': startTime + audio_sources[id]['duration'],
    });
}

// Required args: id
function audio_stop(args){
    args = core_args({
      'args': args,
      'defaults': {
        'when': void 0,
      },
    });

    audio_sources[args['id']][audio_audios[args['id']]['connections'][0]['label']].stop(args['when']);
}

function audio_stop_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'when': void 0,
      },
    });

    for(const id in audio_sources){
        audio_stop({
          'id': id,
          'when': args['when'],
        });
    }
}

globalThis.audio_audios = {};
globalThis.audio_context = false;
globalThis.audio_sources = {};
