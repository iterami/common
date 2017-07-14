'use strict';

function canvas_draw(){
    if(core_menu_open){
        return;
    }

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

// Required args: vertices
// Optional args: properties, style, type, x, y
function canvas_draw_path(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
        'style': canvas_style,
        'translate': false,
        'type': 'lineTo',
        'x': 0,
        'y': 0,
      },
    });

    if(args['translate']){
        canvas_buffer.save();
        canvas_buffer.translate(
          args['x'],
          args['y']
        );
    }

    canvas_buffer.beginPath();
    for(var vertex in args['vertices']){
        canvas_buffer[args['vertices'][vertex]['type'] || args['type']](
          args['vertices'][vertex]['x'] || 0,
          args['vertices'][vertex]['y'] || 0,
          args['vertices'][vertex]['radius'],
          args['vertices'][vertex]['startAngle'],
          args['vertices'][vertex]['endAngle'],
          args['vertices'][vertex]['antiClockwise']
        );
    }
    canvas_buffer.closePath();

    for(var property in args['properties']){
        canvas_buffer[property] = core_handle_defaults({
          'default': canvas_buffer,
          'var': args['properties'][property],
        });
    }

    canvas_buffer[args['style']]();

    if(args['translate']){
        canvas_buffer.restore();
    }
}

// Required args: stops
// Optional args: height, width, x, y
function canvas_gradient(args){
    args = core_args({
      'args': args,
      'defaults': {
        'height': 0,
        'width': 0,
        'x': 0,
        'y': 0,
      },
    });

    var gradient = canvas_buffer.createLinearGradient(
      args['x'],
      args['y'],
      args['width'],
      args['height']
    );
    for(var step in args['stops']){
        gradient.addColorStop(
          args['stops'][step]['offset'] || 0,
          args['stops'][step]['color'] || '#000'
        );
    }
    return gradient;
}

function canvas_init(){
    var properties = '';
    if(!canvas_oncontextmenu){
        properties = ' oncontextmenu="return false" ';
    }

    document.body.appendChild(core_html({
      'properties': {
        'id': 'wrap',
        'innerHTML': '<canvas id=canvas' + properties + '></canvas><canvas id=buffer></canvas>',
      },
    }));

    canvas_buffer = document.getElementById('buffer').getContext('2d');
    canvas_canvas = document.getElementById('canvas').getContext('2d');

    canvas_resize();

    core_entity_set({
      'default': true,
      'properties': {
        'x': 0,
        'y': 0,
      },
      'type': '_canvas',
    });

    canvas_setmode();
}

function canvas_logicloop(){
    if(core_menu_open){
        return;
    }

    logic();
}

function canvas_resize(){
    canvas_height = window.innerHeight;
    document.getElementById('buffer').height = canvas_height;
    document.getElementById('canvas').height = canvas_height;
    canvas_y = canvas_height / 2;

    canvas_width = window.innerWidth;
    document.getElementById('buffer').width = canvas_width;
    document.getElementById('canvas').width = canvas_width;
    canvas_x = canvas_width / 2;

    canvas_buffer.font = canvas_fonts['medium'];

    core_call({
      'todo': 'resize_logic',
    });
}

// Optional args: mode, newgame
function canvas_setmode(args){
    args = core_args({
      'args': args,
      'defaults': {
        'mode': 0,
        'newgame': false,
      },
    });

    core_storage_save();

    window.cancelAnimationFrame(canvas_animationFrame);
    window.clearInterval(canvas_interval);
    core_entity_remove_all();

    canvas_resize();

    core_mode = args['mode'];

    core_call({
      'args': core_mode,
      'todo': 'load_data',
    });

    if(args['newgame']){
        core_escape();
    }

    canvas_animationFrame = window.requestAnimationFrame(canvas_drawloop);
    if(core_type({
      'var': 'logic',
      'type': 'function',
    })){
        canvas_interval = window.setInterval(
          canvas_logicloop,
          core_storage_data['frame-ms']
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
var canvas_oncontextmenu = true;
var canvas_style = 'fill';
var canvas_width = 0;
var canvas_x = 0;
var canvas_y = 0;

window.onresize = canvas_resize;
