'use strict';

function canvas_context(id){
    return document.getElementById(id).getContext(
      '2d',
      {
        'alpha': false,
      }
    );
}

function canvas_draw(){
    if(canvas_properties['clearColor'] === '#000'){
        canvas.clearRect(
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
        canvas.fillRect(
          0,
          0,
          canvas_properties['width'],
          canvas_properties['height']
        );
    }

    core_call({
      'todo': 'repo_drawlogic',
    });
}

function canvas_drawloop(){
    canvas_draw();
    core_interval_animationFrame('canvas-animationFrame');
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
        canvas.save();
        canvas.translate(
          args['x'],
          args['y']
        );
    }

    canvas.beginPath();
    for(const vertex in args['vertices']){
        canvas[args['vertices'][vertex]['type'] || args['type']](
          args['vertices'][vertex]['x'] || 0,
          args['vertices'][vertex]['y'] || 0,
          args['vertices'][vertex]['radius'],
          args['vertices'][vertex]['startAngle'],
          args['vertices'][vertex]['endAngle'],
          args['vertices'][vertex]['antiClockwise']
        );
    }
    canvas.closePath();

    canvas_setproperties({
      'properties': args['properties'],
    });

    canvas[args['style']]();

    if(args['translate']){
        canvas.restore();
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

    const gradient = canvas.createLinearGradient(
      args['x'],
      args['y'],
      args['width'],
      args['height']
    );
    for(const step in args['stops']){
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
        'cursor': 'default',
      },
    });

    canvas_setproperties({
      'properties': {
        'clearColor': '#000',
        'fillStyle': '#fff',
        'font': '200% monospace',
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

    const properties = {
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
    canvas = canvas_context('canvas');
    canvas.canvas.style.cursor = args['cursor'];

    globalThis.onresize = canvas_resize;
    canvas_resize();

    entity_set({
      'default': true,
      'properties': {
        'x': 0,
        'y': 0,
      },
      'type': 'canvas',
    });

    core_interval_modify({
      'id': 'canvas-interval',
      'paused': true,
      'todo': canvas_logicloop,
    });
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
    repo_logic();
}

function canvas_resize(){
    canvas_properties['height'] = globalThis.innerHeight;
    canvas_properties['height-half'] = canvas_properties['height'] / 2;
    canvas.canvas.height = canvas_properties['height'];

    canvas_properties['width'] = globalThis.innerWidth;
    canvas_properties['width-half'] = canvas_properties['width'] / 2;
    canvas.canvas.width = canvas_properties['width'];

    Object.assign(
      canvas,
      canvas_properties
    );

    core_call({
      'todo': 'repo_resizelogic',
    });
    if(core_menu_open){
        canvas_draw();
    }
}

function canvas_setmode(mode){
    if(mode === void 0){
        mode = 0;
    }

    entity_remove_all();
    core_storage_save();

    core_mode = mode;

    core_call({
      'args': core_mode,
      'todo': 'load_data',
    });

    if(core_menu_open){
        core_escape();

    }else{
        core_interval_resume_all();
    }
}

// Required args: properties
function canvas_setproperties(args){
    Object.assign(
      canvas_properties,
      args['properties']
    );
    Object.assign(
      canvas,
      args['properties']
    );
}

globalThis.canvas = 0;
globalThis.canvas_properties = {};
