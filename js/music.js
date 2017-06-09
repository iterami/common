'use strict';

function music_init(){
    document.getElementById('audio-mute').onclick = function(event){
        document.getElementById('audio-player').volume = document.getElementById('audio-mute').checked
          ? 0
          : music_volume;
    };

    document.getElementById('music-display').onmousedown =
      document.getElementById('music-display').ontouchstart = function(event){
        if(!music_playing){
            music_playTrack();
        }

        music_mouse_drag = true;
        music_percent = event.pageX / music_width;
        seek(music_percent);
        updateProgress();
    };

    document.getElementById('audio-volume').oninput = function(event){
        music_volume = document.getElementById('audio-volume').value;
        document.getElementById('audio-player').volume = music_volume;

        if(music_volume < 1){
            window.localStorage.setItem(
              core_storage_prefix + '-audio-volume',
              music_volume
            );

        }else{
            window.localStorage.removeItem(core_storage_prefix + '-audio-volume');
        }

        document.getElementById('audio-mute').checked = false;
    };

    document.getElementById('autoplay').onchange = function(event){
        var state = document.getElementById('autoplay').checked;

        if(!state){
            window.localStorage.setItem(
              core_storage_prefix + '-autoplay',
              1
            );

        }else{
            window.localStorage.removeItem(core_storage_prefix + '-autoplay');
        }
    };

    document.getElementById('playbackrate').oninput = function(event){
        music_playbackrate = parseFloat(document.getElementById('playbackrate').value) || 1;

        if(music_playbackrate != 1){
            window.localStorage.setItem(
              core_storage_prefix + '-playbackrate',
              music_playbackrate
            );

        }else{
            window.localStorage.removeItem(core_storage_prefix + '-playbackrate');
        }

        document.getElementById('audio-player').playbackRate = music_playbackrate;

        window.clearInterval(music_interval);
        music_interval = window.setInterval(
          updateProgress,
          parseFloat(1000 / music_playbackrate) || 1000
        );
    };

    document.getElementById('shuffle').onchange = function(event){
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

    window.onkeydown = function(event){
        var key = event.keyCode || event.which;

        // Space: pause or play
        if(key === 32){
            event.preventDefault();

            if(music_playing){
                music_pauseTrack();

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

    window.onmousemove = function(event){
        if(!music_playing
          || !music_mouse_drag){
            return;
        }

        music_percent = event.pageX / music_width;
        seek(music_percent);
        draw();
    };

    window.onmouseup = function(event){
        music_mouse_drag = false;
    };

    window.onresize = music_resize;
}

// Optional args: back
function music_iterateTracks(args){
    args = core_args({
      'args': args,
      'defaults': {
        'back': false,
      },
    });

    // Check if tracks table has any tracks.
    if(!document.getElementById('tracks').firstChild){
        return;
    }

    // If shuffle is on, pick a random track.
    if(document.getElementById('shuffle').checked){
        var number_of_tracks = document.getElementById('tracks').childNodes.length;

        music_setTrack({
          'track': document.getElementById('tracks').childNodes[core_random_integer({
            'max': number_of_tracks,
          })],
        });

        return;
    }

    // Get currently selected track.
    var track = document.getElementsByClassName('playing')[0];

    // Next track.
    if(args['back']){
        music_setTrack({
          'track': (track == null
            || !track.nextSibling)
              ? document.getElementById('tracks').firstChild
              : track.nextSibling,
        });

    // Previous track.
    }else{
        music_setTrack({
          'track': (track == null
            || !track.previousSibling)
              ? document.getElementById('tracks').lastChild
              : track.previousSibling,
        });
    }
}

function music_pauseTrack(){
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
    music_setTitle({
      'title': document.getElementById('audio-player').src.split('/').pop(),
    });
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

// Optional args: title
function music_setTitle(args){
    args = core_args({
      'args': args,
      'defaults': {
        'title': '',
      },
    });

    document.getElementById('title').innerHTML = args['title'];

    if(args['title'].length > 0){
        args['title'] += ' - ';
    }

    document.title = args['title'] + core_storage_prefix;
}

// Optional args: track
function music_setTrack(args){
    args = core_args({
      'args': args,
      'defaults': {
        'track': document.getElementById('tracks').childNodes[0],
      },
    });

    if(args['track'] === void 0){
        return;
    }

    // Pause any playing tracks.
    music_pauseTrack();

    // Remove the `playing` class from all <tbody>s.
    var tracks = document.getElementsByTagName('tbody');
    for(var i = 0; i < tracks.length; i++){
        tracks[i].className = '';
    }

    // Add the `playing` class to the <tbody> of this track.
    args['track'].className = 'playing';
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
