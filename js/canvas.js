'use strict';

// Required args: base, entity
// Optional args: offset-x, offset-y
function canvas_attach(args){
    args = core_args({
      'args': args,
      'defaults': {
        'offset-x': 0,
        'offset-y': 0,
      },
    });

    core_entities[args['entity']]['attach'] = {
      'offset': {
        'x': args['offset-x'],
        'y': args['offset-y'],
      },
      'to': args['base'],
    };
}

function canvas_draw(){
    if(core_menu_open){
        return;
    }

    canvas_buffer.clearRect(
      0,
      0,
      canvas_properties['width'],
      canvas_properties['height']
    );

    draw_logic();

    canvas_canvas.clearRect(
      0,
      0,
      canvas_properties['width'],
      canvas_properties['height']
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

    canvas_setproperties({
      'properties': args['properties'],
    });

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

// Optional args: contextmenu
function canvas_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'contextmenu': true,
      },
    });

    canvas_properties = {
      'fillStyle': '#fff',
      'font': canvas_fonts['medium'],
      'height': 0,
      'lineJoin': 'miter',
      'lineWidth': 1,
      'strokeStyle': '#fff',
      'textAlign': 'start',
      'textBaseline': 'alphabetic',
      'width': 0,
    };

    var properties = '';
    if(!args['contextmenu']){
        properties = ' oncontextmenu="return false" ';
    }

    core_html({
      'parent': document.body,
      'properties': {
        'id': 'wrap',
        'innerHTML': '<canvas id=canvas' + properties + '></canvas><canvas id=buffer></canvas>',
      },
    });

    canvas_buffer = document.getElementById('buffer').getContext('2d');
    canvas_canvas = document.getElementById('canvas').getContext('2d');

    window.onresize = canvas_resize;
    canvas_resize();

    core_entity_set({
      'default': true,
      'properties': {
        'attach': false,
        'x': 0,
        'y': 0,
      },
      'type': 'canvas',
    });

    if(!core_menu_open){
        canvas_setmode();
    }
}

function canvas_logicloop(){
    if(core_menu_open){
        return;
    }

    logic();

    core_group_modify({
      'groups': [
        'canvas',
      ],
      'todo': function(entity){
          if(core_entities[entity]['attach'] !== false){
              var attached = core_entities[core_entities[entity]['attach']['id']];
              for(var axis in core_entities[entity]['position']){
                  core_entities[entity]['position'][axis] = attached['position'][axis] + core_entities[entity]['attach']['offset'][axis];
              }
          }
      },
    });
}

function canvas_resize(){
    var buffer = document.getElementById('buffer');
    var canvas = document.getElementById('canvas');

    canvas_properties['height'] = window.innerHeight;
    buffer.height = canvas_properties['height'];
    canvas.height = canvas_properties['height'];
    canvas_y = canvas_properties['height'] / 2;

    canvas_properties['width'] = window.innerWidth;
    buffer.width = canvas_properties['width'];
    canvas.width = canvas_properties['width'];
    canvas_x = canvas_properties['width'] / 2;

    for(var property in canvas_properties){
        canvas_buffer[property] = canvas_properties[property];
    }

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

// Required args: properties
function canvas_setproperties(args){
    for(var property in args['properties']){
        canvas_properties[property] = args['properties'][property];
        canvas_buffer[property] = args['properties'][property];
    }
}

// Optional args: id, quality, type
function canvas_uri(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': 'buffer',
        'quality': 1,
        'type': 'image/png',
      },
    });

    return document.getElementById(args['id']).toDataURL(
      args['type'],
      args['quality']
    );
}

var canvas_animationFrame = 0;
var canvas_buffer = 0;
var canvas_canvas = 0;
var canvas_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
var canvas_interval = 0;
var canvas_properties = {};
var canvas_style = 'fill';
var canvas_x = 0;
var canvas_y = 0;
