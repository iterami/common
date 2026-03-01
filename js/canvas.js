'use strict';

function canvas_context_lost(event){
    event.preventDefault();
    core_interval_pause_all();
    canvas = 0;
}

function canvas_context_restored(){
    canvas_init(canvas_properties.args);
    if(canvas !== 0){
        canvas_draw();
    }

    if(!core_menu_open){
        core_interval_resume_all();
    }
}

function canvas_draw(){
    if(canvas_properties.clearColor === '#000'){
        canvas.clearRect(
          0,
          0,
          canvas_properties.width,
          canvas_properties.height
        );

    }else{
        canvas_setproperties({
          'fillStyle': canvas_properties.clearColor,
        });
        canvas.fillRect(
          0,
          0,
          canvas_properties.width,
          canvas_properties.height
        );
    }

    globalThis.repo_drawlogic?.();
}

function canvas_drawloop(){
    canvas_draw();
    core_interval_animationFrame('canvas_drawloop');
}

function canvas_draw_path({
  properties = {},
  style = canvas_properties.style,
  translate = false,
  vertices,
  x = 0,
  y = 0,
} = {}){
    if(translate){
        canvas.save();
        canvas.translate(
          x,
          y
        );
    }

    canvas.beginPath();
    for(const vertex of vertices){
        const data = [...vertex];
        canvas[data.shift()](...data);
    }
    canvas.closePath();

    canvas_setproperties(properties);
    canvas[style]();

    if(translate){
        canvas.restore();
    }
}

function canvas_gradient({
  args,
  stops,
  type = 'createLinearGradient',
} = {}){
    const gradient = canvas[type](...args);
    for(const step of stops){
        gradient.addColorStop(
          step.offset || 0,
          step.color || '#000'
        );
    }
    return gradient;
}

function canvas_init({
  contextmenu = true,
  cursor = 'default',
  interval = true,
} = {}){
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
    if(!contextmenu){
        properties.oncontextmenu = function(){
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
    canvas = canvas_element.getContext(
      '2d',
      {
        'alpha': false,
      }
    );
    canvas.canvas.style.cursor = cursor;

    globalThis.onresize = canvas_resize;
    canvas_resize();

    entity_set({
      'defaults': true,
      'properties': {
        'x': 0,
        'y': 0,
      },
      'type': 'canvas',
    });

    if(interval){
        core_interval_modify({
          'id': 'repo_logic',
          'interval': 1000 / 60,
          'paused': true,
          'todo': globalThis.repo_logic,
        });
        core_interval_modify({
          'id': 'canvas_drawloop',
          'interval': -1,
          'paused': true,
          'todo': canvas_drawloop,
        });
    }

    if(!core_menu_open){
        canvas_setmode();
    }
}

function canvas_resize(){
    const draw = canvas !== 0 && canvas_properties.width_half;

    canvas_properties.height = globalThis.innerHeight;
    canvas_properties.height_half = canvas_properties.height / 2;
    canvas.canvas.height = canvas_properties.height;

    canvas_properties.width = globalThis.innerWidth;
    canvas_properties.width_half = canvas_properties.width / 2;
    canvas.canvas.width = canvas_properties.width;

    Object.assign(
      canvas,
      canvas_properties
    );

    globalThis.repo_resizelogic?.();
    if(draw){
        canvas_draw();
    }
}

function canvas_setmode(mode){
    entity_remove_all();

    core_mode = mode === void 0
      ? 0
      : mode;

    globalThis.repo_load?.(core_mode);

    if(core_menu_open){
        core_escape();

    }else{
        canvas_draw();
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
