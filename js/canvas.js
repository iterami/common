'use strict';

function canvas_draw(){
    canvas_buffer.clearRect(
      0,
      0,
      canvas_width,
      canvas_height
    );

    draw_logic();

    canvas_canvas.clearRect(
      0,
      0,
      canvas_width,
      canvas_height
    );
    canvas_canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );
}

function canvas_drawloop(){
    canvas_draw();
    canvas_animationFrame = window.requestAnimationFrame(canvas_drawloop);
}

function canvas_image_new(src, todo){
    var image = new Image();
    image.onload = todo || function(){};
    image.src = src;
    return image;
}

function canvas_init(){
    canvas_resize();
    canvas_setmode(0);
}

function canvas_resize(){
    if(canvas_mode <= 0){
        return;
    }

    canvas_height = window.innerHeight;
    document.getElementById('buffer').height = canvas_height;
    document.getElementById('canvas').height = canvas_height;
    canvas_y = canvas_height / 2;

    canvas_width = window.innerWidth;
    document.getElementById('buffer').width = canvas_width;
    document.getElementById('canvas').width = canvas_width;
    canvas_x = canvas_width / 2;

    canvas_buffer.font = canvas_fonts['medium'];

    if(typeof resize_logic === 'function'){
        resize_logic();
    }
}

function canvas_setmode(newmode, newgame){
    window.cancelAnimationFrame(canvas_animationFrame);
    window.clearInterval(canvas_interval);

    canvas_mode = newmode;
    var msperframe = 0;
    newgame = newgame || false;

    if(typeof setmode_logic === 'function'){
        setmode_logic(newgame);

    }else{
        canvas_mode = 1;
        newgame = true;
        msperframe = 33;
    }

    // Main menu mode.
    if(canvas_mode === 0){
        canvas_buffer = 0;
        canvas_canvas = 0;
        return;
    }

    // Simulation modes.
    if(newgame){
        var properties = '';

        if(!canvas_oncontextmenu){
            properties = ' oncontextmenu="return false" ';
        }

        document.body.innerHTML =
          '<canvas id=canvas ' + properties + '></canvas><canvas id=buffer></canvas>';

        canvas_buffer = document.getElementById('buffer').getContext('2d');
        canvas_canvas = document.getElementById('canvas').getContext('2d');

        canvas_resize();
    }

    if(typeof load_level === 'function'){
        load_level(canvas_mode);
    }

    if(typeof draw_logic === 'function'){
        canvas_animationFrame = window.requestAnimationFrame(canvas_drawloop);
    }

    if(typeof logic === 'function'){
        canvas_interval = window.setInterval(
          logic,
          msperframe || settings_settings['ms-per-frame']
        );
    }
}

var canvas_animationFrame = 0;
var canvas_buffer = 0;
var canvas_canvas = 0;
var canvas_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
var canvas_height = 0;
var canvas_interval = 0;
var canvas_mode = 0;
var canvas_oncontextmenu = true;
var canvas_width = 0;
var canvas_x = 0;
var canvas_y = 0;

window.onresize = canvas_resize;
