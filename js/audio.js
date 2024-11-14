'use strict';

function audio_start(id){
    const audio_context = new globalThis.AudioContext();

    let oscillator = audio_context.createOscillator();
    let gain = audio_context.createGain();

    oscillator.connect(gain);
    gain.connect(audio_context.destination);

    gain.gain.value = core_storage_data['audio-volume'];
    oscillator.frequency.value = 100;
    oscillator.type = 'sine';

    oscillator.start();
    oscillator.stop(.1);
}
