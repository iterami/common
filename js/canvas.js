'use strict';

// Required args: base, entity
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
    if(canvas_properties['clearColor'] === '#000'){
        canvas_buffer.clearRect(
          0,
          0,
          canvas_properties['width'],
          canvas_properties['height']
        );

    }else{
        canvas_setproperties({
          'properties': {
            'fillStyle': canvas_properties['clearColor'],
          },
        });
        canvas_buffer.fillRect(
          0,
          0,
          canvas_properties['width'],
          canvas_properties['height']
        );
    }

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
    if(!core_menu_open){
        canvas_draw();
    }
    core_interval_animationFrame({
      'id': 'canvas-animationFrame',
    });
}

// Required args: vertices
function canvas_draw_path(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
        'style': canvas_properties['style'],
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
    for(let vertex in args['vertices']){
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

    let gradient = canvas_buffer.createLinearGradient(
      args['x'],
      args['y'],
      args['width'],
      args['height']
    );
    for(let step in args['stops']){
        gradient.addColorStop(
          args['stops'][step]['offset'] || 0,
          args['stops'][step]['color'] || '#000'
        );
    }
    return gradient;
}

function canvas_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'contextmenu': true,
      },
    });

    canvas_setproperties({
      'properties': {
        'clearColor': '#000',
        'fillStyle': '#fff',
        'font': canvas_fonts['medium'],
        'height': 0,
        'lineJoin': 'miter',
        'lineWidth': 1,
        'strokeStyle': '#fff',
        'style': 'fill',
        'textAlign': 'start',
        'textBaseline': 'alphabetic',
        'width': 0,
      },
    });

    let properties = {
      'id': 'canvas',
    };
    if(!args['contextmenu']){
        properties['oncontextmenu'] = function(){
            return false;
        };
    }
    core_html({
      'parent': document.body,
      'properties': properties,
      'type': 'canvas',
    });
    core_html({
      'parent': document.body,
      'properties': {
        'id': 'buffer',
      },
      'type': 'canvas',
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

    if(core_type({
        'var': 'logic',
        'type': 'function',
      })){
        core_interval_modify({
          'id': 'canvas-interval',
          'paused': true,
          'todo': canvas_logicloop,
        });
    }
    core_interval_modify({
      'animationFrame': true,
      'id': 'canvas-animationFrame',
      'paused': true,
      'todo': canvas_drawloop,
    });

    if(!core_menu_open){
        canvas_setmode();
    }
}

function canvas_logicloop(){
    logic();

    core_group_modify({
      'groups': [
        'canvas',
      ],
      'todo': function(entity){
          canvas_logicloop_handle_entity(entity);
      },
    });
}

function canvas_logicloop_handle_entity(entity){
    if(core_entities[entity]['attach'] !== false){
        let attached = core_entities[core_entities[entity]['attach']['id']];
        for(let axis in core_entities[entity]['position']){
            core_entities[entity]['position'][axis] = attached['position'][axis] + core_entities[entity]['attach']['offset'][axis];
        }
    }
}

function canvas_resize(){
    let buffer = document.getElementById('buffer');
    let canvas = document.getElementById('canvas');

    canvas_properties['height'] = window.innerHeight;
    canvas_properties['height-half'] = canvas_properties['height'] / 2;
    buffer.height = canvas_properties['height'];
    canvas.height = canvas_properties['height'];

    canvas_properties['width'] = window.innerWidth;
    canvas_properties['width-half'] = canvas_properties['width'] / 2;
    buffer.width = canvas_properties['width'];
    canvas.width = canvas_properties['width'];

    Object.assign(
      canvas_buffer,
      canvas_properties
    );

    core_call({
      'todo': 'resize_logic',
    });
}

function canvas_setmode(args){
    args = core_args({
      'args': args,
      'defaults': {
        'mode': 0,
        'newgame': false,
      },
    });

    core_entity_remove_all();
    core_storage_save();

    core_mode = args['mode'];

    core_call({
      'args': core_mode,
      'todo': 'load_data',
    });

    if(args['newgame']){
        core_escape();
    }

    core_interval_resume_all();
}

// Required args: properties
function canvas_setproperties(args){
    Object.assign(
      canvas_properties,
      args['properties']
    );
    Object.assign(
      canvas_buffer,
      args['properties']
    );
}

window.canvas_buffer = 0;
window.canvas_canvas = 0;
window.canvas_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
window.canvas_properties = {};
