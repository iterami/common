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

function audio_play({
  id,
  loop = false,
  time = 0,
} = {}){
    const audio = audio_audios[id].element;
    audio.pause();

    if(loop !== 0){
        audio.loop = loop;
    }
    if(time >= 0){
        audio.currentTime = time;
    }
    audio.volume = core_storage_data.audio_volume;

    if(core_storage_data.audio_enabled){
        audio.play().catch(error => {});
    }
}

function audio_start(id){
    if(!core_storage_data.audio_enabled){
        return;
    }

    if(audio_context === 0){
        audio_context = new globalThis.AudioContext();

    }else if(audio_context.state === 'suspended'){
        return;
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

function audio_state(id, state){
    const element = audio_audios[id].element;

    if(element.ended
      || element.currentTime === 0){
        return;
    }

    if(state){
        audio_play({
          'id': id,
          'loop': 0,
          'time': -1,
        });

    }else{
        element.pause();
    }
}

function audio_state_all(state){
    if(audio_context !== 0){
        if(state
          && core_storage_data.audio_enabled){
            audio_context.resume();

        }else{
            audio_context.suspend();
        }
    }

    for(const id in audio_audios){
        const audio = audio_audios[id];
        if(audio.element){
            audio_state(id, state);
        }
    }
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
      'content': '<table><tr><td><input class=mini id=audio_volume min=0 step=.001 type=number><td><label>Volume <input id=audio_enabled type=checkbox></label></table>'
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
