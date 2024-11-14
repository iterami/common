'use strict';

function audio_create(audios){
    for(const audio in audios){
        audio_audios[audio] = {
          'duration': .1,
          'frequency': 100,
          'type': 'sine',
          ...audios[audio],
        };
    }
}

function audio_start(id){
    const context = new globalThis.AudioContext();

    const gain = context.createGain();
    gain.gain.value = core_storage_data['audio-volume'];
    gain.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.frequency.value = audio_audios[id]['frequency'];
    oscillator.type = audio_audios[id]['type'];
    oscillator.connect(gain);

    oscillator.start();
    oscillator.stop(audio_audios[id]['duration']);
}

globalThis.audio_audios = {};
audio_create({
  'boop': true,
});
