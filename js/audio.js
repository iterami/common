'use strict';

// Required args: audios
function audio_create(args){
    for(const audio in args['audios']){
        audio_audios[audio] = {
          'playing': false,
        };

        for(const property in args['audios'][audio]){
            audio_audios[audio][property] = core_handle_defaults({
              'default': audio_audios[audio],
              'var': args['audios'][audio][property],
            });
        }

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
            audio_onended({
              'id': this.id,
            });
        };
    }
}

function audio_init(){
    audio_context = new window.AudioContext();
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

    if(audio_context === false){
        audio_init();
    }

    const source = audio_context['create' + args['properties']['label']](
      args['properties']['arg0'],
      args['properties']['arg1'],
      args['properties']['arg2']
    );

    for(const property in args['properties']){
        if(core_type({
            'type': 'object',
            'var': args['properties'][property],
          })){
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

// Required args: id
function audio_onended(args){
    audio_audios[args['id']]['playing'] = false;

    if(audio_audios[args['id']]['repeat']){
        if(audio_audios[args['id']]['timeout'] <= 0){
            audio_start({
              'id': args['id'],
            });

        }else{
            window.setTimeout(
              'audio_start({id:"' + args['id'] + '"});',
              audio_audios[args['id']]['duration'] * audio_audios[args['id']]['timeout']
            );
        }
    }

    Reflect.deleteProperty(
      audio_sources,
      args['id']
    );
}

// Required args: id
function audio_source_create(args){
    if(audio_context === false){
        audio_init();
    }

    audio_sources[args['id']] = {
      'duration': audio_audios[args['id']]['duration'] || 0,
      'start': audio_audios[args['id']]['start'] || 0,
      'timeout': audio_audios[args['id']]['timeout'] || 1000,
    };

    // Create audio nodes.
    const connections_length = audio_audios[args['id']]['connections'].length;
    for(let i = 0; i < connections_length; i++){
        audio_node_create({
          'id': args['id'],
          'properties': audio_audios[args['id']]['connections'][i],
        });

        if(audio_audios[args['id']]['connections'][i]['label'] === 'Gain'){
            audio_sources[args['id']]['Gain']['gain']['value'] =
              audio_audios[args['id']]['volume'] || core_storage_data['audio-volume'];
        }
    }

    // Connect audio nodes.
    for(let i = 0; i < connections_length - 1; i++){
        audio_sources[args['id']][audio_audios[args['id']]['connections'][i]['label']].connect(
          audio_sources[args['id']][audio_audios[args['id']]['connections'][i + 1]['label']]
        );
    }
    audio_sources[args['id']][audio_audios[args['id']]['connections'][connections_length - 1]['label']].connect(
      audio_context.destination
    );
}

// Required args: id
function audio_start(args){
    if(audio_audios[args['id']]['playing']){
        audio_stop({
          'id': args['id'],
        });
    }

    audio_source_create({
      'id': args['id'],
    });

    const startTime = audio_context.currentTime + audio_sources[args['id']]['start'];
    audio_audios[args['id']]['playing'] = true;
    audio_sources[args['id']][audio_audios[args['id']]['connections'][0]['label']].start(startTime);
    audio_stop({
      'id': args['id'],
      'when': startTime + audio_sources[args['id']]['duration'],
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

window.audio_audios = {};
window.audio_context = false;
window.audio_sources = {};
