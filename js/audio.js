'use strict';

function audio_create(audios){
    for(const audio in audios){
        audio_audios[audio] = {
          'duration': .1,
          'frequency': 100,
          'panner': false,
          'type': 'sine',
          ...audios[audio],
        };
    }
}

function audio_start(id){
    const context = new globalThis.AudioContext();

    const gain = context.createGain();
    gain.gain.value = core_storage_data['audio-volume'];

    const oscillator = context.createOscillator();
    oscillator.frequency.value = audio_audios[id]['frequency'];
    oscillator.type = audio_audios[id]['type'];
    oscillator.connect(gain);

    if(audio_audios[id]['panner'] !== false){
        if(!context.listener.forwardX){
            context.listener.setOrientation(
              audio_listener['forwardX'],
              audio_listener['forwardY'],
              audio_listener['forwardZ'],
              0, 1, 0
            );

        }else{
            context.listener.forwardX.value = audio_listener['forwardX'];
            context.listener.forwardY.value = audio_listener['forwardY'];
            context.listener.forwardZ.value = audio_listener['forwardZ'];
        }
        const panner = new PannerNode(
          context,
          audio_audios[id]['panner']
        );
        gain.connect(panner).connect(context.destination);

    }else{
        gain.connect(context.destination);
    }

    oscillator.start();
    oscillator.stop(audio_audios[id]['duration']);
}

// Required args: id
function audio_start_at(args){
    args = core_args({
      'args': args,
      'defaults': {
        'forwardX': audio_listener['forwardX'],
        'forwardY': audio_listener['forwardY'],
        'forwardZ': audio_listener['forwardZ'],
        'positionX': 0,
        'positionY': 0,
        'positionZ': 0,
      },
    });

    audio_listener['forwardX'] = args['forwardX'];
    audio_listener['forwardY'] = args['forwardY'];
    audio_listener['forwardZ'] = args['forwardZ'];

    const audio = audio_audios[args['id']];
    if(!audio['panner']){
        audio['panner'] = {};
    }
    audio['panner']['positionX'] = args['positionX'];
    audio['panner']['positionY'] = args['positionY'];
    audio['panner']['positionZ'] = args['positionZ'];

    audio_start(args['id']);
}

globalThis.audio_audios = {};
globalThis.audio_listener = {
  'forwardX': 0,
  'forwardY': 0,
  'forwardZ': -1,
};
audio_create({
  'boop': true,
});
