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

globalThis.audio_audios = {};
audio_create({
  'boop': true,
});
