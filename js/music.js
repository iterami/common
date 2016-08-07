'use strict';

function music_iterateTracks(direction){
    // Check if tracks table has any tracks.
    if(!document.getElementById('tracks').firstChild){
        return;
    }

    // If shuffle is on, pick a random track.
    if(document.getElementById('shuffle').checked){
        var number_of_tracks = document.getElementById('tracks').childNodes.length;

        music_setTrack(
          document.getElementById('tracks').childNodes[random_integer(number_of_tracks)]
        );

        return;
    }

    // Get currently selected track.
    var track = document.getElementsByClassName('playing')[0];

    // Next track.
    if(direction > 0){
        music_setTrack(
          (track == null
            || !track.nextSibling)
              ? document.getElementById('tracks').firstChild
              : track.nextSibling
        );

    // Previous track.
    }else{
        music_setTrack(
          (track == null
            || !track.previousSibling)
              ? document.getElementById('tracks').lastChild
              : track.previousSibling
        );
    }
}

function music_pauseTrack(reset){
    window.clearInterval(music_interval);

    document.getElementById('play-button').value = 'Play [SPACE]';
    document.getElementById('play-button').onclick = music_playTrack;

    document.getElementById('audio-player').pause();

    music_playing = false;
}

function music_playTrack(){
    window.clearInterval(music_interval);

    // Check if tracks table has any tracks.
    if(!document.getElementById('tracks').firstChild){
        return;
    }

    // If no tracks are playing, play the first track in the tracks table.
    if(document.getElementsByClassName('playing').length === 0){
        document.getElementById('tracks').firstChild.className = 'playing';
    }

    document.getElementById('play-button').value = 'Pause [SPACE]';
    document.getElementById('play-button').onclick = music_pauseTrack;

    document.getElementById('audio-player').play();

    music_playing = true;
    music_setTitle(document.getElementById('audio-player').src.split('/').pop());
    music_interval = window.setInterval(
      updateProgress,
      parseFloat(1000 / music_playbackrate) || 1000
    );

    updateProgress();
}

function music_resize(){
    music_width = window.innerWidth;
    document.getElementById('music-display').width = music_width;

    music_canvas.fillStyle = '#7a7';
    draw();
}

function music_setTitle(title){
    title = title || '';

    document.getElementById('title').innerHTML = title;

    if(title.length > 0){
        title += ' - ';
    }

    document.title = title + 'Music-Server.htm';
}

function music_setTrack(track){
    track = track || document.getElementById('tracks').childNodes[0];

    if(track == void 0){
        return;
    }

    // Pause any playing tracks.
    music_pauseTrack(true);

    // Remove the `playing` class from all <tbody>s.
    var tracks = document.getElementsByTagName('tbody');
    for(var i = 0; i < tracks.length; i++){
        tracks[i].className = '';
    }

    // Add the `playing` class to the <tbody> of this track.
    track.className = 'playing';
    document.getElementById('audio-player').src =
      document.getElementsByClassName('playing')[0].firstChild.childNodes[0].innerHTML;
    document.getElementById('audio-player').playbackRate = music_playbackrate;

    music_percent = 0;

    music_playTrack();
}

var music_canvas = document.getElementById('music-display').getContext('2d', {
  'alpha': false,
});
var music_interval = 0;
var music_mouse_drag = false;
var music_percent = 0;
var music_playbackrate = 1;
var music_playing = false;
var music_volume = 1;
var music_width = 0;

document.getElementById('audio-mute').onclick = function(e){
    document.getElementById('audio-player').volume = document.getElementById('audio-mute').checked
      ? 0
      : music_volume;
};

document.getElementById('music-display').onmousedown =
  document.getElementById('music-display').ontouchstart = function(e){
    if(!music_playing){
        music_playTrack();
    }

    music_mouse_drag = true;
    music_percent = e.pageX / music_width;
    seek(music_percent);
    updateProgress();
};

document.getElementById('shuffle').onchange = function(e){
    var state = document.getElementById('shuffle').checked;

    if(!state){
        window.localStorage.setItem(
          'Music-Local.htm-shuffle',
          1
        );

    }else{
        window.localStorage.removeItem('Music-Local.htm-shuffle');
    }
};

window.onkeydown = function(e){
    var key = e.keyCode || e.which;

    // Space: pause or play
    if(key === 32){
        e.preventDefault();

        if(music_playing){
            music_pauseTrack(false);

        }else{
            music_playTrack();
        }

    // Left or Up: previous track
    }else if(key === 37
      || key === 38){
        music_iterateTracks(-1);

    // Right or Down: next track
    }else if(key === 39
      || key === 40){
        music_iterateTracks(1);
    }
};

window.onmousemove = function(e){
    if(!music_playing
      || !music_mouse_drag){
        return;
    }

    music_percent = e.pageX / music_width;
    seek(music_percent);
    draw();
};

window.onmouseup = function(e){
    music_mouse_drag = false;
};

window.onresize = music_resize;
