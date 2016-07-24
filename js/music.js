'use strict';

function iterateTracks(direction){
    // Check if tracks table has any tracks.
    if(!document.getElementById('tracks').firstChild){
        return;
    }

    // If shuffle is on, pick a random track.
    if(document.getElementById('shuffle').checked){
        var number_of_tracks = document.getElementById('tracks').childNodes.length;

        setTrack(
          document.getElementById('tracks').childNodes[random_integer(number_of_tracks)]
        );

        return;
    }

    // Get currently selected track.
    var track = document.getElementsByClassName('playing')[0];

    // Next track.
    if(direction > 0){
        setTrack(
          (track == null
            || !track.nextSibling)
              ? document.getElementById('tracks').firstChild
              : track.nextSibling
        );

    // Previous track.
    }else{
        setTrack(
          (track == null
            || !track.previousSibling)
              ? document.getElementById('tracks').lastChild
              : track.previousSibling
        );
    }
}

function pauseTrack(reset){
    window.clearInterval(interval);

    document.getElementById('play-button').value = 'Play [SPACE]';
    document.getElementById('play-button').onclick = playTrack;

    document.getElementById('audio-player').pause();

    playing = false;
}

function playTrack(){
    window.clearInterval(interval);

    // Check if tracks table has any tracks.
    if(!document.getElementById('tracks').firstChild){
        return;
    }

    // If no tracks are playing, play the first track in the tracks table.
    if(document.getElementsByClassName('playing').length === 0){
        document.getElementById('tracks').firstChild.className = 'playing';
    }

    document.getElementById('play-button').value = 'Pause [SPACE]';
    document.getElementById('play-button').onclick = pauseTrack;

    document.getElementById('audio-player').play();

    playing = true;
    setTitle(document.getElementById('audio-player').src.split('/').pop());
    interval = window.setInterval(
      updateProgress,
      parseFloat(1000 / playbackrate) || 1000
    );

    updateProgress();
}

function resize(){
    width = window.innerWidth;
    document.getElementById('music-display').width = width;

    canvas.fillStyle = '#7a7';
    draw();
}

function setTitle(title){
    title = title || '';

    document.getElementById('title').innerHTML = title;

    if(title.length > 0){
        title += ' - ';
    }

    document.title = title + 'Music-Server.htm';
}

function setTrack(track){
    track = track || document.getElementById('tracks').childNodes[0];

    if(track == void 0){
        return;
    }

    // Pause any playing tracks.
    pauseTrack(true);

    // Remove the `playing` class from all <tbody>s.
    var tracks = document.getElementsByTagName('tbody');
    for(var i = 0; i < tracks.length; i++){
        tracks[i].className = '';
    }

    // Add the `playing` class to the <tbody> of this track.
    track.className = 'playing';
    document.getElementById('audio-player').src =
      document.getElementsByClassName('playing')[0].firstChild.childNodes[0].innerHTML;
    document.getElementById('audio-player').playbackRate = playbackrate;

    percent = 0;

    playTrack();
}

var canvas = document.getElementById('music-display').getContext('2d', {
  'alpha': false,
});
var interval = 0;
var mouse_drag = false;
var percent = 0;
var playbackrate = 1;
var playing = false;
var volume = 1;
var width = 0;

document.getElementById('audio-mute').onclick = function(e){
    document.getElementById('audio-player').volume = document.getElementById('audio-mute').checked
      ? 0
      : volume;
};

document.getElementById('music-display').onmousedown =
  document.getElementById('music-display').ontouchstart = function(e){
    if(!playing){
        playTrack();
    }

    mouse_drag = true;
    percent = e.pageX / width;
    seek(percent);
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

        if(playing){
            pauseTrack(false);

        }else{
            playTrack();
        }

    // Left or Up: previous track
    }else if(key === 37
      || key === 38){
        iterateTracks(-1);

    // Right or Down: next track
    }else if(key === 39
      || key === 40){
        iterateTracks(1);
    }
};

window.onmousemove = function(e){
    if(!playing
      || !mouse_drag){
        return;
    }

    percent = e.pageX / width;
    seek(percent);
    draw();
};

window.onmouseup = function(e){
    mouse_drag = false;
};

window.onresize = resize;
