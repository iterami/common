'use strict';

function draw(){
    buffer.viewport(
      0,
      0,
      buffer.viewportWidth,
      buffer.viewportHeight
    );
    buffer.clear(buffer.COLOR_BUFFER_BIT | buffer.DEPTH_BUFFER_BIT);

    matrix_identity('camera');

    draw_logic();

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );
}

function drawloop(){
    draw();
    animationFrame = window.requestAnimationFrame(drawloop);
}

function init_webgl(){
    resize();
    setmode(0);
}

function matrix_clone(id, newid){
}

function matrix_copy(id, newid){
}

function matrix_create(id){
}

function matrix_identity(id){
    for(var key in matricies[id]){
        matricies[id][key] =
          key % (matricies[id]['width'] + 1) === 0
            ? 1
            : 0;
    }
}

function matrix_rotate(id, dimensions){
}

function matrix_translate(id, dimensions){
}

function resize(){
    if(mode <= 0){
        return;
    }

    height = window.innerHeight;
    document.getElementById('buffer').height = height;
    document.getElementById('canvas').height = height;
    y = height / 2;

    width = window.innerWidth;
    document.getElementById('buffer').width = width;
    document.getElementById('canvas').width = width;
    x = width / 2;

    if(typeof resize_logic == 'function'){
        resize_logic();
    }
}

function setmode(newmode, newgame){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    mode = newmode;
    newgame = newgame || false;

    setmode_logic(newgame);

    if(mode === 0){
        // Main menu mode.
        buffer = 0;
        canvas = 0;

    }else{
        if(newgame){
            document.body.innerHTML =
              '<canvas id=canvas></canvas><canvas id=buffer></canvas>';

            buffer = document.getElementById('buffer').getContext('webgl');
            canvas = document.getElementById('canvas').getContext('2d');

            resize();
        }

        if(typeof load_level == 'function'){
            load_level(mode);
        }

        if(typeof draw_logic == 'function'){
            animationFrame = window.requestAnimationFrame(drawloop);
        }

        if(typeof logic == 'function'){
            interval = window.setInterval(
              logic,
              settings['ms-per-frame']
            );
        }
    }
}

var animationFrame = 0;
var buffer = 0;
var canvas = 0;
var height = 0;
var interval = 0;
var matricies = {};
var mode = 0;
var width = 0;
var x = 0;
var y = 0;

window.onresize = resize;
