'use strict';

function draw(){
    buffer.clearRect(
      0,
      0,
      width,
      height
    );

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

function init_canvas(){
    resize();
    setmode(0);
}

function new_image(src, todo){
    var image = new Image();
    image.onload = todo || function(){};
    image.src = src;
    return image;
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

    buffer.font = fonts['medium'];

    if(typeof resize_logic === 'function'){
        resize_logic();
    }
}

function setmode(newmode, newgame){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    mode = newmode;
    var msperframe = 0;
    newgame = newgame || false;

    if(typeof setmode_logic === 'function'){
        setmode_logic(newgame);

    }else{
        mode = 1;
        newgame = true;
        msperframe = 33;
    }

    // Main menu mode.
    if(mode === 0){
        buffer = 0;
        canvas = 0;

    // Simulation modes.
    }else{
        if(newgame){
            document.body.innerHTML =
              '<canvas id=canvas></canvas><canvas id=buffer></canvas>';

            buffer = document.getElementById('buffer').getContext('2d');
            canvas = document.getElementById('canvas').getContext('2d');

            resize();
        }

        if(typeof load_level === 'function'){
            load_level(mode);
        }

        if(typeof draw_logic === 'function'){
            animationFrame = window.requestAnimationFrame(drawloop);
        }

        if(typeof logic === 'function'){
            interval = window.setInterval(
              logic,
              msperframe || settings['ms-per-frame']
            );
        }
    }
}

var animationFrame = 0;
var buffer = 0;
var canvas = 0;
var fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
var height = 0;
var interval = 0;
var mode = 0;
var width = 0;
var x = 0;
var y = 0;

window.onresize = resize;
