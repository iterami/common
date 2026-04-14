'use strict';

function audio_create(audios){
    for(const id in audios){
        audio_audios[id] = {
          'duration': .15,
          'frequency': 100,
          'panner': false,
          'type': 'sine',
          ...audios[id],
        };
    }
}

function audio_file({
  id,
  path,
} = {}){
    const audio = new Audio(path);
    audio.oncanplay = function(event){
        audio_audios[id] = {
          'element': audio,
        };
    };
}

function audio_play(id, music){
    if(!core_storage_data.audio_enabled){
        return;
    }

    const audio = audio_audios[id].element;
    audio.pause();

    audio.currentTime = 0;
    audio.loop = music === true;
    audio.volume = core_storage_data.audio_volume;

    audio.play().catch(error => {});
}

function audio_start(id){
    if(!core_storage_data.audio_enabled){
        return;
    }

    if(audio_context === 0){
        audio_context = new globalThis.AudioContext();
    }

    const audio = audio_audios[id];
    const start = audio_context.currentTime + audio_context.outputLatency;
    const duration = start + audio.duration;

    const gain = audio_context.createGain();
    gain.gain.value = core_storage_data.audio_volume;
    gain.gain.linearRampToValueAtTime(0, duration);

    const oscillator = audio_context.createOscillator();
    oscillator.type = audio.type;
    oscillator.frequency.value = audio.frequency;
    oscillator.connect(gain);

    if(audio.panner !== false){
        if(!audio_context.listener.forwardX){
            audio_context.listener.setOrientation(
              audio_listener.forwardX,
              audio_listener.forwardY,
              audio_listener.forwardZ,
              0, 1, 0
            );

        }else{
            audio_context.listener.forwardX.value = audio_listener.forwardX;
            audio_context.listener.forwardY.value = audio_listener.forwardY;
            audio_context.listener.forwardZ.value = audio_listener.forwardZ;
        }
        const panner = new PannerNode(
          audio_context,
          audio.panner
        );
        gain.connect(panner).connect(audio_context.destination);

    }else{
        gain.connect(audio_context.destination);
    }

    oscillator.start(start);
    oscillator.stop(duration);
}

function audio_start_at({
  forwardX = audio_listener.forwardX,
  forwardY = audio_listener.forwardY,
  forwardZ = audio_listener.forwardZ,
  id,
  positionX = 0,
  positionY = 0,
  positionZ = 0,
} = {}){
    audio_listener.forwardX = forwardX;
    audio_listener.forwardY = forwardY;
    audio_listener.forwardZ = forwardZ;

    const audio = audio_audios[id];
    if(!audio.panner){
        audio.panner = {};
    }
    audio.panner.positionX = positionX;
    audio.panner.positionY = positionY;
    audio.panner.positionZ = positionZ;

    audio_start(id);
}

globalThis.audio_audios = {};
globalThis.audio_context = 0;
globalThis.audio_listener = {
  'forwardX': 0,
  'forwardY': 0,
  'forwardZ': -1,
};

core_init_todo.push(function(){
    core_tab_create({
      'content': '<table><tr><td class=right><input id=audio_enabled type=checkbox><td>Audio Enabled'
        + '<tr><td><input class=mini id=audio_volume min=0 step=.001 type=number><td>Audio Volume</table>'
        + '<button id=storage_reset_audio type=button>Reset Audio Settings</button>',
      'group': 'core_menu',
      'id': 'audio',
      'label': 'Audio',
    });
    core_storage_add({
      'prefix': 'audio_',
      'storage': {
        'audio_enabled': true,
        'audio_volume': 1,
      },
    });
    core_events_bind({
      'elements': {
        'storage_reset_audio': {
          'onclick': function(){
              core_storage_reset({
                'label': 'audio',
                'prefix': 'audio_',
              });
          },
        },
      },
    });
    core_storage_update([
      'audio_enabled',
      'audio_volume',
    ]);

    audio_create({
      'boop': true,
    });
});
