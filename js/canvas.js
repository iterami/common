'use strict';

function canvas_draw(){
    canvas_buffer.clearRect(
      0,
      0,
      canvas_width,
      canvas_height
    );

    draw_logic();

    if(canvas_menu){
        canvas_buffer.save();

        canvas_buffer.fillStyle = '#111';
        canvas_buffer.fillRect(
          canvas_x - 125,
          canvas_y - 50,
          250,
          100
        );

        canvas_buffer.fillStyle = '#fff';
        canvas_buffer.font = canvas_fonts['medium'];
        canvas_buffer.textAlign = 'center';
        canvas_buffer.textBaseline = 'middle';
        canvas_buffer.fillText(
          canvas_resume,
          canvas_x,
          canvas_y - 25
        );
        canvas_buffer.fillText(
          canvas_quit,
          canvas_x,
          canvas_y + 25
        );

        canvas_buffer.restore();
    }

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

// Required args: vertices
// Optional args: properties, style
function canvas_draw_path(args){
    args['properties'] = args['properties'] || {};
    args['style'] = args['style'] || canvas_style;

    canvas_buffer.beginPath();
    for(var vertex in args['vertices']){
        canvas_buffer[args['vertices'][vertex]['type'] || 'lineTo'](
          args['vertices'][vertex]['x'],
          args['vertices'][vertex]['y'],
          args['vertices'][vertex]['radius'],
          args['vertices'][vertex]['startAngle'],
          args['vertices'][vertex]['endAngle'],
          args['vertices'][vertex]['antiClockwise']
        );
    }
    canvas_buffer.closePath();

    for(var property in args['properties']){
        canvas_buffer[property] = args['properties'][property];
    }

    canvas_buffer[args['style']]();
}

function canvas_init(){
    canvas_resize();
    canvas_setmode({
      'mode': 0,
    });
}

function canvas_menu_quit(){
    if(canvas_menu){
        canvas_setmode({
          'mode': 0,
        });
    }
}

function canvas_menu_toggle(){
    canvas_menu = !canvas_menu;
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

// Required args: mode
// Optional args: newgame
function canvas_setmode(args){
    args['newgame'] = args['newgame'] || false;

    window.cancelAnimationFrame(canvas_animationFrame);
    window.clearInterval(canvas_interval);

    canvas_menu = false;
    canvas_mode = args['mode'];

    if(typeof setmode_logic === 'function'){
        setmode_logic(args['newgame']);

    }else{
        canvas_mode = 1;
        args['newgame'] = true;
    }

    // Main menu mode.
    if(canvas_mode === 0){
        canvas_buffer = 0;
        canvas_canvas = 0;
        return;
    }

    // Simulation modes.
    if(args['newgame']){
        var properties = '';

        if(!canvas_oncontextmenu){
            properties = ' oncontextmenu="return false" ';
        }

        document.body.innerHTML =
          '<canvas id=canvas' + properties + '></canvas><canvas id=buffer></canvas>';

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
          canvas_interval_ms
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
var canvas_interval_ms = 25;
var canvas_menu = false;
var canvas_mode = 0;
var canvas_oncontextmenu = true;
var canvas_quit = 'Q = Main Menu';
var canvas_resume = 'ESC = Resume';
var canvas_style = 'fill';
var canvas_width = 0;
var canvas_x = 0;
var canvas_y = 0;

window.onresize = canvas_resize;
