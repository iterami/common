'use strict';

function canvas_context(element){
    return element.getContext(
      '2d',
      {
        'alpha': false,
      }
    );
}

function canvas_context_lost(event){
    event.preventDefault();

    core_interval_pause_all();
    canvas = 0;
}

function canvas_context_restored(event){
    canvas_init();

    if(core_menu_open){
        core_escape();

    }else{
        core_interval_resume_all();
    }
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
          'fillStyle': canvas_properties['clearColor'],
        });
        canvas.fillRect(
          0,
          0,
          canvas_properties['width'],
          canvas_properties['height']
        );
    }

    globalThis['repo_drawlogic']?.();
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
        const data = [...args['vertices'][vertex]];
        canvas[data.shift()](...data);
    }
    canvas.closePath();

    canvas_setproperties(args['properties']);
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
    });

    const properties = {
      'id': 'canvas',
    };
    if(!args['contextmenu']){
        properties['oncontextmenu'] = function(){
            return false;
        };
    }
    const canvas_element = core_html({
      'parent': document.body,
      'properties': properties,
      'type': 'canvas',
    });
    canvas_element.addEventListener(
      'contextlost',
      canvas_context_lost,
      false
    );
    canvas_element.addEventListener(
      'contextrestored',
      canvas_context_restored,
      false
    );
    canvas = canvas_context(canvas_element);
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

    globalThis['repo_resizelogic']?.();
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

    globalThis['load_data']?.(core_mode);

    if(core_menu_open){
        core_escape();

    }else{
        core_interval_resume_all();
    }
}

function canvas_setproperties(properties){
    Object.assign(
      canvas_properties,
      properties
    );
    Object.assign(
      canvas,
      properties
    );
}

globalThis.canvas = 0;
globalThis.canvas_properties = {};
