'use strict';

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

    core_call({
      'todo': 'repo_drawlogic',
    });

    canvas_canvas.clearRect(
      0,
      0,
      canvas_properties['width'],
      canvas_properties['height']
    );
    canvas_canvas.drawImage(
      core_elements['buffer'],
      0,
      0
    );
}

function canvas_drawloop(){
    canvas_draw();
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
    for(const vertex in args['vertices']){
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

// Required args: id
function canvas_getContext(args){
    return core_elements[args['id']].getContext(
      '2d',
      {
        'alpha': false,
      }
    );
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

    const gradient = canvas_buffer.createLinearGradient(
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
      'store': 'canvas',
      'type': 'canvas',
    });
    core_html({
      'parent': document.body,
      'properties': {
        'id': 'buffer',
      },
      'store': 'buffer',
      'type': 'canvas',
    });
    core_elements['canvas'].style.cursor = args['cursor'];

    canvas_buffer = canvas_getContext({
      'id': 'buffer',
    });
    canvas_canvas = canvas_getContext({
      'id': 'canvas',
    });

    globalThis.onresize = canvas_resize;
    canvas_resize();

    entity_set({
      'default': true,
      'properties': {
        'attach-offset-x': 0,
        'attach-offset-y': 0,
        'attach-offset-z': 0,
        'attach-to': false,
        'attach-type': 'entity_entities',
        'x': 0,
        'y': 0,
      },
      'type': 'canvas',
    });

    if(core_type({
        'var': 'repo_logic',
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
    core_call({
      'todo': 'repo_logic',
    });

    entity_group_modify({
      'groups': [
        'canvas',
      ],
      'todo': function(entity){
          canvas_logicloop_handle_entity(entity);
      },
    });
}

function canvas_logicloop_handle_entity(entity){
    if(entity_entities[entity]['attach-to'] !== false){
        const attached = entity_entities[entity_entities[entity]['attach-to']];
        for(const axis in entity_entities[entity]['position']){
            entity_entities[entity]['position'][axis] = attached['position'][axis] + entity_entities[entity]['attach-offset-' + axis];
        }
    }
}

function canvas_resize(){
    canvas_properties['height'] = globalThis.innerHeight;
    canvas_properties['height-half'] = canvas_properties['height'] / 2;
    core_elements['buffer'].height = canvas_properties['height'];
    core_elements['canvas'].height = canvas_properties['height'];

    canvas_properties['width'] = globalThis.innerWidth;
    canvas_properties['width-half'] = canvas_properties['width'] / 2;
    core_elements['buffer'].width = canvas_properties['width'];
    core_elements['canvas'].width = canvas_properties['width'];

    Object.assign(
      canvas_buffer,
      canvas_properties
    );

    core_call({
      'todo': 'repo_resizelogic',
    });
    if(core_menu_open){
        canvas_draw();
    }
}

function canvas_setmode(args){
    args = core_args({
      'args': args,
      'defaults': {
        'mode': 0,
      },
    });

    entity_remove_all();
    core_storage_save();

    core_mode = args['mode'];

    core_call({
      'args': core_mode,
      'todo': 'load_data',
    });

    if(core_menu_open){
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

globalThis.canvas_buffer = 0;
globalThis.canvas_canvas = 0;
globalThis.canvas_properties = {};
