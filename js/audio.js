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
    const audio_context = new globalThis.AudioContext();
    const oscillator = audio_context.createOscillator();
    const gain = audio_context.createGain();

    oscillator.connect(gain);
    gain.connect(audio_context.destination);

    gain.gain.value = core_storage_data['audio-volume'];
    oscillator.frequency.value = audio_audios[id]['frequency'];
    oscillator.type = audio_audios[id]['type'];

    oscillator.start();
    oscillator.stop(audio_audios[id]['duration']);
}

globalThis.audio_audios = {};
audio_create({
  'boop': true,
});
