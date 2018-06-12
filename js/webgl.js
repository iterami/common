'use strict';

// Required args: base, entity
// Optional args: offset-x, offset-y, offset-z
function webgl_attach(args){
    args = core_args({
      'args': args,
      'defaults': {
        'offset-x': 0,
        'offset-y': 0,
        'offset-z': 0,
      },
    });

    core_entities[args['entity']]['attach'] = {
      'offset-x': args['offset-x'],
      'offset-y': args['offset-y'],
      'offset-z': args['offset-z'],
      'to': args['base'],
    };
}

// Required args: entity
// Optional args: axes
function webgl_billboard(args){
    args = core_args({
      'args': args,
      'defaults': {
        'axes': {
          'y': 'y',
        },
      },
    });

    for(var axis in args['axes']){
        core_entities[args['entity']]['rotate-' + axis] = 360 - webgl_character['camera-rotate-' + args['axes'][axis]];
    }
}

// Required args: colorData, normalData, textureData, vertexData
function webgl_buffer_set(args){
    return {
      'color': webgl_buffer_set_type({
        'data': args['colorData'],
      }),
      'normal': webgl_buffer_set_type({
        'data': args['normalData'],
      }),
      'texture': webgl_buffer_set_type({
        'data': args['textureData'],
      }),
      'vertex': webgl_buffer_set_type({
        'data': args['vertexData'],
      }),
    };
}

// Required args: data
// Optional args: type
function webgl_buffer_set_type(args){
    args = core_args({
      'args': args,
      'defaults': {
        'type': 'Float32Array',
      },
    });

    var buffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      buffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new window[args['type']](args['data']),
      webgl_buffer.STATIC_DRAW
    );

    return buffer;
}

function webgl_camera_handle(){
    if(core_mouse['pointerlock-state']
      || core_mouse['down']){
        webgl_camera_rotate({
          'x': core_mouse['movement-y'] / 10,
          'y': core_mouse['movement-x'] / 10,
        });
    }
}

// Optional args: speed, strafe, y
function webgl_camera_move(args){
    args = core_args({
      'args': args,
      'defaults': {
        'speed': 1,
        'strafe': false,
        'y': 0,
      },
    });

    var movement = core_move_3d({
      'angle': webgl_character['camera-rotate-y'],
      'speed': args['speed'],
      'strafe': args['strafe'],
    });

    webgl_character['camera-translate-x'] += movement['x'];
    webgl_character['camera-translate-y'] += args['y'];
    webgl_character['camera-translate-z'] += movement['z'];
}

function webgl_camera_reset(){
    webgl_character['camera-rotate-radians-x'] = 0;
    webgl_character['camera-rotate-radians-y'] = 0;
    webgl_character['camera-rotate-radians-z'] = 0;
    webgl_character['camera-rotate-x'] = 0;
    webgl_character['camera-rotate-y'] = 0;
    webgl_character['camera-rotate-z'] = 0;
    webgl_character['camera-translate-x'] = 0;
    webgl_character['camera-translate-y'] = 0;
    webgl_character['camera-translate-z'] = 0;
}

// Optional args: x, xlock, y, z
function webgl_camera_rotate(args){
    args = core_args({
      'args': args,
      'defaults': {
        'x': 0,
        'xlock': args['xlock'] !== false,
        'y': 0,
        'z': 0,
      },
    });

    var axes = {
      'x': args['x'],
      'y': args['y'],
      'z': args['z'],
    };
    for(var axis in axes){
        webgl_character['camera-rotate-' + axis] = core_clamp({
          'max': 360,
          'min': 0,
          'value': core_round({
            'number': webgl_character['camera-rotate-' + axis] + axes[axis],
          }),
          'wrap': true,
        });
    }

    if(args['xlock']){
        var max = 89;
        if(webgl_character['camera-rotate-x'] > 180){
            max += 271;
        }
        webgl_character['camera-rotate-x'] = core_clamp({
          'max': max,
          'min': max - 89,
          'value': webgl_character['camera-rotate-x'],
        });
    }

    for(var axis in axes){
        webgl_character['camera-rotate-radians-' + axis] = core_degrees_to_radians({
          'degrees': webgl_character['camera-rotate-' + axis],
        });
    }
}

function webgl_camera_zoom(event){
    if(event.deltaY > 0){
        webgl_character['camera-zoom-current'] = Math.min(
          webgl_character['camera-zoom-current'] + 1,
          webgl_character['camera-zoom-max']
        );

    }else{
        webgl_character['camera-zoom-current'] = Math.max(
          webgl_character['camera-zoom-current'] - 1,
          0
        );
    }
}

function webgl_character_level(){
    if('level' in webgl_character){
        return webgl_character['level'];

    }else{
        return -2;
    }
}

// Required args: color
function webgl_clearcolor_set(args){
    webgl_properties['clearcolor'] = args['color'];
    webgl_buffer.clearColor(
      webgl_properties['clearcolor']['red'],
      webgl_properties['clearcolor']['green'],
      webgl_properties['clearcolor']['blue'],
      webgl_properties['clearcolor']['alpha']
    );
}

function webgl_draw(){
    webgl_buffer.clear(webgl_buffer.COLOR_BUFFER_BIT | webgl_buffer.DEPTH_BUFFER_BIT);

    webgl_buffer.disable(webgl_buffer.DEPTH_TEST);
    core_group_modify({
      'groups': [
        'depthfalse',
      ],
      'todo': function(entity){
          webgl_draw_entity(entity);
      },
    });
    webgl_buffer.enable(webgl_buffer.DEPTH_TEST);
    core_group_modify({
      'groups': [
        'depthtrue',
      ],
      'todo': function(entity){
          if(core_entities[entity]['alpha'] === 1){
              webgl_draw_entity(entity);
          }
      },
    });
    core_group_modify({
      'groups': [
        'depthtrue',
      ],
      'todo': function(entity){
          if(core_entities[entity]['alpha'] < 1){
              webgl_draw_entity(entity);
          }
      },
    });

    webgl_canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    for(var text in webgl_text){
        Object.assign(
          webgl_canvas,
          webgl_text[text]['properties']
        );
        webgl_canvas.fillText(
          webgl_text[text]['text'],
          webgl_text[text]['x'],
          webgl_text[text]['y']
        );
    }

    if(webgl_properties['pointer'] !== false){
        webgl_canvas.fillStyle = webgl_properties['pointer'];
        webgl_canvas.fillRect(
          webgl_canvas_properties['width-half'] - 1,
          webgl_canvas_properties['height-half'] - 1,
          2,
          2
        );
    }
}

function webgl_drawloop(){
    if(!core_menu_open){
        webgl_draw();
    }
    core_interval_animationFrame({
      'id': 'webgl-animationFrame',
    });
}

function webgl_draw_entity(entity){
    if(!core_entities[entity]['draw']){
        return;
    }

    if(core_entities[entity]['billboard']){
        webgl_billboard({
          'entity': entity,
        });
    }

    core_matrix_clone({
      'id': 'camera',
      'to': 'cache',
    });

    core_matrix_translate({
      'dimensions': [
        -core_entities[entity]['translate-x'],
        -core_entities[entity]['translate-y'],
        -core_entities[entity]['translate-z'],
      ],
      'id': 'camera',
    });
    core_matrix_rotate({
      'dimensions': [
        core_entities[entity]['rotate-radians-x'],
        core_entities[entity]['rotate-radians-y'],
        core_entities[entity]['rotate-radians-z'],
      ],
      'id': 'camera',
    });

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      core_entities[entity]['buffer']['normal']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_attributes['vec_vertexNormal'],
      3,
      webgl_buffer.FLOAT,
      false,
      0,
      0
    );

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      core_entities[entity]['buffer']['color']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_attributes['vec_vertexColor'],
      4,
      webgl_buffer.FLOAT,
      false,
      0,
      0
    );

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      core_entities[entity]['buffer']['vertex']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_attributes['vec_vertexPosition'],
      4,
      webgl_buffer.FLOAT,
      false,
      0,
      0
    );

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      core_entities[entity]['buffer']['texture']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_attributes['vec_texturePosition'],
      2,
      webgl_buffer.FLOAT,
      false,
      0,
      0
    );

    webgl_buffer.activeTexture(webgl_buffer.TEXTURE0);
    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      core_entities[entity]['texture']
    );
    webgl_buffer.uniform1i(
      webgl_uniformlocations['sampler'],
      0
    );

    webgl_buffer.uniform1f(
      webgl_uniformlocations['alpha'],
      core_entities[entity]['alpha']
    );
    webgl_buffer.uniformMatrix4fv(
      webgl_uniformlocations['mat_normalMatrix'],
      0,
      core_matrices['perspective']
    );
    webgl_buffer.uniformMatrix4fv(
      webgl_uniformlocations['mat_perspectiveMatrix'],
      0,
      core_matrices['perspective']
    );
    webgl_buffer.uniformMatrix4fv(
      webgl_uniformlocations['mat_cameraMatrix'],
      0,
      core_matrices['camera']
    );

    webgl_buffer.drawArrays(
      webgl_buffer[core_entities[entity]['mode']],
      0,
      core_entities[entity]['vertices-length']
    );

    core_matrix_copy({
      'id': 'cache',
      'to': 'camera',
    });
}

function webgl_entity_todo(entity){
    core_entities[entity]['normals'] = webgl_normals({
      'rotate-x': core_entities[entity]['rotate-x'],
      'rotate-y': core_entities[entity]['rotate-y'],
      'rotate-z': core_entities[entity]['rotate-z'],
    });

    core_entities[entity]['rotate-radians-x'] = core_degrees_to_radians({
      'degrees': core_entities[entity]['rotate-x'],
    });
    core_entities[entity]['rotate-radians-y'] = core_degrees_to_radians({
      'degrees': core_entities[entity]['rotate-y'],
    });
    core_entities[entity]['rotate-radians-z'] = core_degrees_to_radians({
      'degrees': core_entities[entity]['rotate-z'],
    });

    if(!core_entities[entity]['draw']){
        return;
    }
    core_entities[entity]['vertices-length'] = core_entities[entity]['vertices'].length / 4;

    core_entities[entity]['buffer'] = webgl_buffer_set({
      'colorData': core_entities[entity]['vertex-colors'],
      'normalData': core_entities[entity]['normals'],
      'textureData': core_entities[entity]['textureData'],
      'vertexData': core_entities[entity]['vertices'],
    });

    webgl_texture_set({
      'entityid': entity,
      'image': webgl_textures['_default'],
    });
}

// Optional args: ambient-blue, ambient-green, ambient-red, clearcolor-alpha,
//   clearcolor-blue, clearcolor-green, clearcolor-red, contextmenu, direction-blue,
//   direction-green, direction-red, direction-vector, fog, gravity-acceleration, gravity-max
function webgl_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'ambient-blue': 1,
        'ambient-green': 1,
        'ambient-red': 1,
        'clearcolor-alpha': 1,
        'clearcolor-blue': 0,
        'clearcolor-green': 0,
        'clearcolor-red': 0,
        'contextmenu': true,
        'direction-blue': 1,
        'direction-green': 1,
        'direction-red': 1,
        'direction-vector': false,
        'fog': -0.0001,
        'gravity-acceleration': -0.05,
        'gravity-max': -1,
      },
    });

    webgl_canvas_properties = {
      'fillStyle': '#fff',
      'font': webgl_fonts['medium'],
      'height': 0,
      'height-half': 0,
      'lineJoin': 'miter',
      'lineWidth': 1,
      'strokeStyle': '#fff',
      'textAlign': 'start',
      'textBaseline': 'alphabetic',
      'width': 0,
      'width-half': 0,
    };
    webgl_properties = {
      'ambientlighting': {
        'blue': args['ambient-blue'],
        'green': args['ambient-green'],
        'red': args['ambient-red'],
      },
      'clearcolor': {
        'alpha': args['clearcolor-alpha'],
        'blue': args['clearcolor-blue'],
        'green': args['clearcolor-green'],
        'red': args['clearcolor-red'],
      },
      'collision-range': 2.5,
      'directionlighting': {
        'blue': args['direction-blue'],
        'green': args['direction-green'],
        'red': args['direction-red'],
        'vector': args['direction-vector'],
      },
      'fog': args['fog'],
      'gravity': {
        'acceleration': args['gravity-acceleration'],
        'max': args['gravity-max'],
      },
      'pointer': false,
    };

    var properties = {
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

    core_matrices['camera'] = core_matrix_create();
    core_matrices['perspective'] = core_matrix_create();

    webgl_buffer = document.getElementById('buffer').getContext(
      'webgl',
      {
        'alpha': false,
        'antialias': true,
        'depth': true,
        'premultipliedAlpha': false,
        'preserveDrawingBuffer': false,
        'stencil': false,
      }
    );
    webgl_canvas = document.getElementById('canvas').getContext(
      '2d',
      {
        'alpha': false,
      }
    );

    window.onresize = webgl_resize;
    webgl_resize();

    webgl_clearcolor_set({
      'color': {
        'alpha': webgl_properties['clearcolor']['alpha'],
        'blue': webgl_properties['clearcolor']['blue'],
        'green': webgl_properties['clearcolor']['green'],
        'red': webgl_properties['clearcolor']['red'],
      },
    });
    webgl_buffer.enable(webgl_buffer.BLEND);
    webgl_buffer.enable(webgl_buffer.CULL_FACE);
    webgl_buffer.enable(webgl_buffer.DEPTH_TEST);

    webgl_buffer.blendFunc(
      webgl_buffer.SRC_ALPHA,
      webgl_buffer.ONE_MINUS_SRC_ALPHA
    );

    webgl_shader_update();

    core_entity_set({
      'default': true,
      'groups': [
        'depthtrue',
      ],
      'properties': {
        'alpha': 1,
        'attach': false,
        'billboard': false,
        'collides': false,
        'collision': false,
        'draw': true,
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'gravity': false,
        'mode': 'TRIANGLE_FAN',
        'normals': [],
        'rotate-radians-x': 0,
        'rotate-radians-y': 0,
        'rotate-radians-z': 0,
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'scale-x': 1,
        'scale-y': 1,
        'scale-z': 1,
        'textureData': [
          0, 1,
          0, 0,
          1, 0,
          1, 1,
        ],
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'vertices-length': 0,
      },
      'todo': function(entity){
          webgl_entity_todo(entity);
      },
      'type': 'webgl',
    });

    core_interval_modify({
      'id': 'webgl-interval',
      'paused': true,
      'todo': webgl_logicloop,
    });
    core_interval_modify({
      'animationFrame': true,
      'id': 'webgl-animationFrame',
      'paused': true,
      'todo': webgl_drawloop,
    });
}

// Optional args: camera-rotate-x, camera-rotate-y, camera-rotate-z, camera-speed,
//   camera-translate-x, camera-translate-y, camera-translate-z, camera-type,
//   camera-zoom-current, camera-zoom-max, experience, level
function webgl_init_character(args){
    args = core_args({
      'args': args,
      'defaults': {
        'camera-rotate-x': 0,
        'camera-rotate-y': 0,
        'camera-rotate-z': 0,
        'camera-speed': .1,
        'camera-translate-x': 0,
        'camera-translate-y': 0,
        'camera-translate-z': 0,
        'camera-type': 'gravity',
        'camera-zoom-current': 0,
        'camera-zoom-max': 0,
        'experience': 0,
        'level': -1,
      },
    });

    webgl_character = {
      'camera-rotate-radians-x': 0,
      'camera-rotate-radians-y': 0,
      'camera-rotate-radians-z': 0,
      'camera-rotate-x': args['camera-rotate-x'],
      'camera-rotate-y': args['camera-rotate-y'],
      'camera-rotate-z': args['camera-rotate-z'],
      'camera-speed': args['camera-speed'],
      'camera-translate-x': args['camera-translate-x'],
      'camera-translate-y': args['camera-translate-y'],
      'camera-translate-z': args['camera-translate-z'],
      'camera-type': args['camera-type'],
      'camera-zoom-current': args['camera-zoom-current'],
      'camera-zoom-max': args['camera-zoom-max'],
      'experience': args['experience'],
      'level': args['level'],
    };
}

// Required args: json
// Optional args: character
function webgl_load_level(args){
    if(args['json'] === false){
        return;
    }

    args = core_args({
      'args': args,
      'defaults': {
        'character': 0,
      },
    });

    if(typeof args['json'] === 'object'){
        var filereader = new FileReader();
        filereader.onload = function(event){
            webgl_load_level_init({
              'character': args['character'],
              'json': JSON.parse(event.target.result),
            });
        };
        filereader.readAsText(args['json']);

    }else{
        webgl_load_level_init({
          'character': args['character'],
          'json': JSON.parse(args['json']),
        });
    }
}

// Required args: character, json
function webgl_load_level_init(args){
    if(args['character'] === 1){
        if(!args['json']['character']
          || args['json']['character'] === false){
            return;
        }
    }

    core_storage_save();
    core_entity_remove_all();

    if(args['character'] === -1){
        args['json']['character'] = false;
        webgl_init_character({
          'camera-type': 'free',
        });

    }else if(webgl_character_level() < 0){
        if(args['json']['character']
          && args['json']['character'] !== false){
            webgl_init_character({
              'camera-rotate-x': args['json']['character']['camera-rotate-x'],
              'camera-rotate-y': args['json']['character']['camera-rotate-y'],
              'camera-rotate-z': args['json']['character']['camera-rotate-z'],
              'camera-speed': args['json']['character']['camera-speed'],
              'camera-translate-x': args['json']['character']['camera-translate-x'],
              'camera-translate-y': args['json']['character']['camera-translate-y'],
              'camera-translate-z': args['json']['character']['camera-translate-z'],
              'camera-type': args['json']['character']['camera-type'],
              'experience': args['json']['character']['experience'],
              'level': args['json']['character']['level'],
            });

        }else{
            webgl_init_character({
              'level': args['character'],
            });
        }
    }

    webgl_init({
      'ambient-blue': args['json']['ambient-blue'],
      'ambient-green': args['json']['ambient-green'],
      'ambient-red': args['json']['ambient-red'],
      'clearcolor-alpha': args['json']['clearcolor-alpha'],
      'clearcolor-blue': args['json']['clearcolor-blue'],
      'clearcolor-green': args['json']['clearcolor-green'],
      'clearcolor-red': args['json']['clearcolor-red'],
      'contextmenu': args['json']['contextmenu'],
      'direction-blue': args['json']['direction-blue'],
      'direction-green': args['json']['direction-green'],
      'direction-red': args['json']['direction-red'],
      'direction-vector': args['json']['direction-vector'],
      'fog': args['json']['fog'],
      'gravity-acceleration': args['json']['gravity-acceleration'],
      'gravity-max': args['json']['gravity-max'],
    });

    for(var entity in args['json']['entities']){
        core_entity_create({
          'id': args['json']['entities'][entity]['id'],
          'properties': args['json']['entities'][entity],
          'types': args['json']['entities'][entity]['types'],
       });
    }

    webgl_camera_reset();
    core_escape();
}

function webgl_logicloop(){
    if(webgl_character['camera-type'] !== false){
        if(core_keys[core_storage_data['move-←']]['state']){
            webgl_camera_move({
              'speed': -webgl_character['camera-speed'],
              'strafe': true,
            });
        }

        if(core_keys[core_storage_data['move-→']]['state']){
            webgl_camera_move({
              'speed': webgl_character['camera-speed'],
              'strafe': true,
            });
        }

        if(core_keys[core_storage_data['move-↓']]['state']){
            webgl_camera_move({
              'speed': webgl_character['camera-speed'],
            });
        }

        if(core_keys[core_storage_data['move-↑']]['state']){
            webgl_camera_move({
              'speed': -webgl_character['camera-speed'],
            });
        }

        if(webgl_character['camera-type'] === 'free'){
            if(core_keys[32]['state']){
                webgl_camera_move({
                  'speed': 0,
                  'y': webgl_character['camera-speed'],
                });
            }

            if(core_keys[67]['state']){
                webgl_camera_move({
                  'speed': 0,
                  'y': -webgl_character['camera-speed'],
                });
            }
        }
    }

    logic();

    core_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          webgl_logicloop_handle_entity(entity);
      },
    });

    core_matrix_identity({
      'id': 'camera',
    });
    core_matrix_translate({
      'dimensions': [
        0,
        0,
        webgl_character['camera-zoom-current'],
      ],
      'id': 'camera',
    });
    core_matrix_rotate({
      'dimensions': [
        webgl_character['camera-rotate-radians-x'],
        webgl_character['camera-rotate-radians-y'],
        webgl_character['camera-rotate-radians-z'],
      ],
      'id': 'camera',
    });
    core_matrix_translate({
      'dimensions': [
        webgl_character['camera-translate-x'],
        webgl_character['camera-translate-y'],
        webgl_character['camera-translate-z'],
      ],
      'id': 'camera',
    });
}

function webgl_logicloop_handle_entity(entity){
    if(core_entities[entity]['logic']){
        core_entities[entity]['logic']();
    }

    core_entities[entity]['rotate-radians-x'] = core_degrees_to_radians({
      'degrees': core_entities[entity]['rotate-x'],
    });
    core_entities[entity]['rotate-radians-y'] = core_degrees_to_radians({
      'degrees': core_entities[entity]['rotate-y'],
    });
    core_entities[entity]['rotate-radians-z'] = core_degrees_to_radians({
      'degrees': core_entities[entity]['rotate-z'],
    });

    if(core_entities[entity]['gravity']){
        core_entities[entity]['dy'] = Math.max(
          core_entities[entity]['dy'] + webgl_properties['gravity']['acceleration'],
          webgl_properties['gravity']['max']
        );
    }

    if(core_entities[entity]['collides']){
        for(var other_entity in core_entities){
            if(entity !== other_entity
              && core_entities[other_entity]['collision']){
                webgl_normals_collision({
                  'entity0id': entity,
                  'entity1id': other_entity,
                });
            }
        }
    }

    if(core_entities[entity]['attach'] !== false){
        var attachto = core_entities[core_entities[entity]['attach']['to']];
        core_entities[entity]['translate-x'] = attachto['translate-x'] + core_entities[entity]['attach']['offset-x'];
        core_entities[entity]['translate-y'] = attachto['translate-y'] + core_entities[entity]['attach']['offset-y'];
        core_entities[entity]['translate-z'] = attachto['translate-z'] + core_entities[entity]['attach']['offset-z'];

    }else{
        core_entities[entity]['translate-x'] += core_entities[entity]['dx'];
        core_entities[entity]['translate-y'] += core_entities[entity]['dy'];
        core_entities[entity]['translate-z'] += core_entities[entity]['dz'];
    }
}

// Optional args: rotate-x, rotate-y, rotate-z
function webgl_normals(args){
    args = core_args({
      'args': args,
      'defaults': {
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
      },
    });

    var normal_x = 0;
    var normal_y = 0;
    var normal_z = 0;

    if(args['rotate-x'] !== 0){
        normal_z = core_round({
          'number': Math.sin(core_degrees_to_radians({
            'degrees': args['rotate-x'],
          })),
        });

    }else if(args['rotate-z'] !== 0){
        normal_x = -core_round({
          'number': Math.sin(core_degrees_to_radians({
            'degrees': args['rotate-z'],
          })),
        });

    }else{
        normal_y = core_round({
          'number': Math.cos(core_degrees_to_radians({
            'degrees': args['rotate-y'],
          })),
        });
    }

    return [
      normal_x, normal_y, normal_z,
      normal_x, normal_y, normal_z,
      normal_x, normal_y, normal_z,
      normal_x, normal_y, normal_z,
    ];
}

// Required args: entity0id, entity1id
function webgl_normals_collision(args){
    var entity0 = core_entities[args['entity0id']];
    var entity1 = core_entities[args['entity1id']];

    if(entity1['normals'][0] !== 0){
        if(entity1['normals'][0] === 1
          && entity0['dx'] < 0){
            if(entity0['translate-x'] >= entity1['translate-x']
              && entity0['translate-x'] <= entity1['translate-x'] + webgl_properties['collision-range']
              && entity0['translate-y'] > entity1['translate-y'] + entity1['vertices'][4] - webgl_properties['collision-range']
              && entity0['translate-y'] < entity1['translate-y'] + entity1['vertices'][0] + webgl_properties['collision-range']
              && entity0['translate-z'] >= entity1['translate-z'] + entity1['vertices'][2] - webgl_properties['collision-range'] + 1
              && entity0['translate-z'] <= entity1['translate-z'] + entity1['vertices'][10] + webgl_properties['collision-range'] - 1){
                entity0['dx'] = 0;
                entity0['translate-x'] = entity1['translate-x'] + webgl_properties['collision-range'];
            }

        }else if(entity1['normals'][0] === -1
          && entity0['dx'] > 0){
            if(entity0['translate-x'] >= entity1['translate-x'] - webgl_properties['collision-range']
              && entity0['translate-x'] <= entity1['translate-x']
              && entity0['translate-y'] > entity1['translate-y'] + entity1['vertices'][4] - webgl_properties['collision-range']
              && entity0['translate-y'] < entity1['translate-y'] + entity1['vertices'][0] + webgl_properties['collision-range']
              && entity0['translate-z'] >= entity1['translate-z'] + entity1['vertices'][2] - webgl_properties['collision-range'] + 1
              && entity0['translate-z'] <= entity1['translate-z'] + entity1['vertices'][10] + webgl_properties['collision-range'] - 1){
                entity0['dx'] = 0;
                entity0['translate-x'] = entity1['translate-x'] - webgl_properties['collision-range'];
            }
        }
    }

    if(entity1['normals'][1] !== 0){
        if(entity1['normals'][1] === 1
          && entity0['dy'] < 0){
            if(entity0['translate-x'] >= entity1['translate-x'] + entity1['vertices'][3] - webgl_properties['collision-range']
              && entity0['translate-x'] <= entity1['translate-x'] + entity1['vertices'][0] + webgl_properties['collision-range']
              && entity0['translate-y'] >= entity1['translate-y']
              && entity0['translate-y'] <= entity1['translate-y'] + webgl_properties['collision-range']
              && entity0['translate-z'] >= entity1['translate-z'] + entity1['vertices'][2] - webgl_properties['collision-range']
              && entity0['translate-z'] <= entity1['translate-z'] + entity1['vertices'][10] + webgl_properties['collision-range']){
                entity0['dy'] = 0;
                entity0['translate-y'] = entity1['translate-y'] + webgl_properties['collision-range'];
            }

        }else if(entity1['normals'][1] === -1
          && entity0['dy'] > 0){
            if(entity0['translate-x'] >= entity1['translate-x'] + entity1['vertices'][4] - webgl_properties['collision-range']
              && entity0['translate-x'] <= entity1['translate-x'] + entity1['vertices'][0] + webgl_properties['collision-range']
              && entity0['translate-y'] >= entity1['translate-y'] - webgl_properties['collision-range']
              && entity0['translate-y'] <= entity1['translate-y']
              && entity0['translate-z'] >= entity1['translate-z'] + entity1['vertices'][2] - webgl_properties['collision-range']
              && entity0['translate-z'] <= entity1['translate-z'] + entity1['vertices'][10] + webgl_properties['collision-range']){
                entity0['dy'] = 0;
                entity0['translate-y'] = entity1['translate-y'] - webgl_properties['collision-range'];
            }
        }
    }

    if(entity1['normals'][2] !== 0){
        if(entity1['normals'][2] === 1
          && entity0['dz'] < 0){
            if(entity0['translate-x'] >= entity1['translate-x'] + entity1['vertices'][4] - webgl_properties['collision-range'] + 1
              && entity0['translate-x'] <= entity1['translate-x'] + entity1['vertices'][0] + webgl_properties['collision-range'] - 1
              && entity0['translate-y'] > entity1['translate-y'] + entity1['vertices'][2] - webgl_properties['collision-range']
              && entity0['translate-y'] < entity1['translate-y'] + entity1['vertices'][10] + webgl_properties['collision-range']
              && entity0['translate-z'] >= entity1['translate-z']
              && entity0['translate-z'] <= entity1['translate-z'] + webgl_properties['collision-range']){
                entity0['dz'] = 0;
                entity0['translate-z'] = entity1['translate-z'] + webgl_properties['collision-range'];
            }

        }else if(entity1['normals'][2] === -1
          && entity0['dz'] > 0){
            if(entity0['translate-x'] >= entity1['translate-x'] + entity1['vertices'][4] - webgl_properties['collision-range'] + 1
              && entity0['translate-x'] <= entity1['translate-x'] + entity1['vertices'][0] + webgl_properties['collision-range'] - 1
              && entity0['translate-y'] > entity1['translate-y'] + entity1['vertices'][2] - webgl_properties['collision-range']
              && entity0['translate-y'] < entity1['translate-y'] + entity1['vertices'][10] + webgl_properties['collision-range']
              && entity0['translate-z'] >= entity1['translate-z'] - webgl_properties['collision-range']
              && entity0['translate-z'] <= entity1['translate-z']){
                entity0['dz'] = 0;
                entity0['translate-z'] = entity1['translate-z'] - webgl_properties['collision-range'];
            }
        }
    }
}

function webgl_perspective(){
    core_matrices['perspective'][0] = webgl_canvas_properties['height'] / webgl_canvas_properties['width'];
    core_matrices['perspective'][5] = 1;
    core_matrices['perspective'][10] = -1;
    core_matrices['perspective'][11] = -1;
    core_matrices['perspective'][14] = -2;
}

// Required args: x, y
function webgl_pick_color(args){
    var pixelarray = new Uint8Array(4);

    webgl_buffer.readPixels(
      args['x'],
      window.innerHeight - args['y'],
      1,
      1,
      webgl_buffer.RGBA,
      webgl_buffer.UNSIGNED_BYTE,
      pixelarray
    );

    return pixelarray;
}

// Required args: id, shaderlist
function webgl_program_create(args){
    var program = webgl_buffer.createProgram();
    for(var shader in args['shaderlist']){
        webgl_buffer.attachShader(
          program,
          args['shaderlist'][shader]
        );
    }
    webgl_buffer.linkProgram(program);
    webgl_buffer.useProgram(program);

    return program;
}

function webgl_resize(){
    var buffer = document.getElementById('buffer');
    var canvas = document.getElementById('canvas');

    webgl_canvas_properties['height'] = window.innerHeight;
    webgl_canvas_properties['height-half'] = webgl_canvas_properties['height'] / 2;
    buffer.height = webgl_canvas_properties['height'];
    canvas.height = webgl_canvas_properties['height'];

    webgl_canvas_properties['width'] = window.innerWidth;
    webgl_canvas_properties['width-half'] = webgl_canvas_properties['width'] / 2;
    buffer.width = webgl_canvas_properties['width'];
    canvas.width = webgl_canvas_properties['width'];

    webgl_buffer.viewportHeight = webgl_canvas_properties['height'];
    webgl_buffer.viewportWidth = webgl_canvas_properties['width'];
    webgl_buffer.viewport(
      0,
      0,
      webgl_canvas_properties['width'],
      webgl_canvas_properties['height']
    );

    Object.assign(
      webgl_buffer,
      webgl_canvas_properties
    );

    webgl_perspective();

    core_call({
      'todo': 'resize_logic',
    });
}

// Required args: properties
function webgl_setcanvasproperties(args){
    Object.assign(
      webgl_canvas_properties,
      args['properties']
    );
    Object.assign(
      webgl_buffer,
      args['properties']
    );
}

// Required args: id, source, type
function webgl_shader_create(args){
    var shader = webgl_buffer.createShader(args['type']);
    webgl_buffer.shaderSource(
      shader,
      args['source']
    );
    webgl_buffer.compileShader(shader);

    return shader;
}

function webgl_shader_update(){
    var fogstring = webgl_properties['fog'] !== false
      ? ('mix('
        + 'vec4('
        +   webgl_properties['clearcolor']['red'] + ','
        +   webgl_properties['clearcolor']['green'] + ','
        +   webgl_properties['clearcolor']['blue'] + ','
        +   webgl_properties['clearcolor']['alpha']
        + '),'
        + 'vec_fragmentColor,'
        + 'clamp(exp(' + webgl_properties['fog'] + ' * float_fogDistance * float_fogDistance), 0.0, 1.0)'
        + ')')
      : 'vec_fragmentColor';
    var fragment_shader = webgl_shader_create({
      'id': 'fragment',
      'source':
          'uniform lowp float alpha;'
        + 'uniform sampler2D sampler;'
        + 'varying mediump float float_fogDistance;'
        + 'varying mediump vec2 vec_textureCoord;'
        + 'varying mediump vec3 vec_lighting;'
        + 'varying lowp vec4 vec_fragmentColor;'
        + 'void main(void){'
        +     'gl_FragColor = ' + fogstring + ' * texture2D(sampler, vec_textureCoord) * vec4(vec_lighting, 1.0) * alpha;'
        + '}',
      'type': webgl_buffer.FRAGMENT_SHADER,
    });
    var directionstring = webgl_properties['directionlighting']['vector'] !== false
      ? (' + (vec3('
        +   webgl_properties['directionlighting']['red'] + ','
        +   webgl_properties['directionlighting']['green'] + ','
        +   webgl_properties['directionlighting']['blue']
        + ') * max(dot(transformedNormal.xyz, normalize(vec3(' + webgl_properties['directionlighting']['vector'] + '))),0.0));')
      : ';';
    var vertex_shader = webgl_shader_create({
      'id': 'vertex',
      'source':
          'attribute vec2 vec_texturePosition;'
        + 'attribute vec3 vec_vertexNormal;'
        + 'attribute vec4 vec_vertexColor;'
        + 'attribute vec4 vec_vertexPosition;'
        + 'uniform mat4 mat_cameraMatrix;'
        + 'uniform mat4 mat_normalMatrix;'
        + 'uniform mat4 mat_perspectiveMatrix;'
        + 'varying float float_fogDistance;'
        + 'varying vec2 vec_textureCoord;'
        + 'varying vec3 vec_lighting;'
        + 'varying vec4 vec_fragmentColor;'
        + 'void main(void){'
        +     'gl_Position = mat_perspectiveMatrix * mat_cameraMatrix * vec_vertexPosition;'
        +     'float_fogDistance = length(gl_Position.xyz);'
        +     'vec_fragmentColor = vec_vertexColor;'
        +     'vec_textureCoord = vec_texturePosition;'
        +     'vec4 transformedNormal = mat_normalMatrix * vec4(vec_vertexNormal, 1.0);'
        +     'vec_lighting = vec3('
        +       webgl_properties['ambientlighting']['red'] + ','
        +       webgl_properties['ambientlighting']['green'] + ','
        +       webgl_properties['ambientlighting']['blue']
        +     ')' + directionstring
        + '}',
      'type': webgl_buffer.VERTEX_SHADER,
    });

    var program = webgl_program_create({
      'id': 'shaders',
      'shaderlist': [
        fragment_shader,
        vertex_shader,
      ],
    });

    webgl_vertexattribarray_set({
      'attribute': 'vec_vertexColor',
      'program': program,
    });
    webgl_vertexattribarray_set({
      'attribute': 'vec_vertexNormal',
      'program': program,
    });
    webgl_vertexattribarray_set({
      'attribute': 'vec_vertexPosition',
      'program': program,
    });
    webgl_vertexattribarray_set({
      'attribute': 'vec_texturePosition',
      'program': program,
    });

    webgl_uniformlocations = {
      'alpha': webgl_buffer.getUniformLocation(
        program,
        'alpha'
      ),
      'mat_cameraMatrix': webgl_buffer.getUniformLocation(
        program,
        'mat_cameraMatrix'
      ),
      'mat_normalMatrix': webgl_buffer.getUniformLocation(
        program,
        'mat_normalMatrix'
      ),
      'mat_perspectiveMatrix': webgl_buffer.getUniformLocation(
        program,
        'mat_perspectiveMatrix'
      ),
      'sampler': webgl_buffer.getUniformLocation(
        program,
        'sampler'
      ),
    };

    webgl_buffer.deleteProgram(program);
}

// Optional args: color
function webgl_skybox(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color': webgl_vertexcolorarray(),
      },
    });

    core_entity_create({
      'id': 'skybox-back',
      'properties': {
        'rotate-x': 270,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'base': '_webgl-camera',
      'entity': 'skybox-back',
      'offset-z': 5,
    });
    core_entity_create({
      'id': 'skybox-front',
      'properties': {
        'rotate-x': 90,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'base': '_webgl-camera',
      'entity': 'skybox-front',
      'offset-z': -5,
    });
    core_entity_create({
      'id': 'skybox-left',
      'properties': {
        'rotate-z': 270,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'base': '_webgl-camera',
      'entity': 'skybox-left',
      'offset-x': -5,
    });
    core_entity_create({
      'id': 'skybox-right',
      'properties': {
        'rotate-z': 90,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'base': '_webgl-camera',
      'entity': 'skybox-right',
      'offset-x': 5,
    });
    core_entity_create({
      'id': 'skybox-top',
      'properties': {
        'rotate-x': 180,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'base': '_webgl-camera',
      'entity': 'skybox-top',
      'offset-y': 5,
    });

    core_group_move({
      'entities': [
        'skybox-back',
        'skybox-front',
        'skybox-left',
        'skybox-right',
        'skybox-top',
      ],
      'from': 'depthtrue',
      'to': 'depthfalse',
    });
}

// Required args: entityid
// Optional args: image
function webgl_texture_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'image': webgl_textures['_default'],
      },
    });

    core_entities[args['entityid']]['texture'] = webgl_buffer.createTexture();
    core_entities[args['entityid']]['image'] = core_image({
      'id': args['entityid'] + '-texture',
      'src': args['image'],
      'todo': function(){
          webgl_texture_set_todo(args);
      },
    });
}

function webgl_texture_set_todo(args){
    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      core_entities[args['entityid']]['texture']
    );
    webgl_buffer.texImage2D(
      webgl_buffer.TEXTURE_2D,
      0,
      webgl_buffer.RGBA,
      webgl_buffer.RGBA,
      webgl_buffer.UNSIGNED_BYTE,
      core_entities[args['entityid']]['image']
    );
    webgl_buffer.texParameteri(
      webgl_buffer.TEXTURE_2D,
      webgl_buffer.TEXTURE_MAG_FILTER,
      webgl_buffer.NEAREST
    );
    webgl_buffer.texParameteri(
      webgl_buffer.TEXTURE_2D,
      webgl_buffer.TEXTURE_MIN_FILTER,
      webgl_buffer.NEAREST
    );
    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      void 0
    );
}

// Required args: attribute, program
function webgl_vertexattribarray_set(args){
    webgl_attributes[args['attribute']] = webgl_buffer.getAttribLocation(
      args['program'],
      args['attribute']
    );
    webgl_buffer.enableVertexAttribArray(webgl_attributes[args['attribute']]);
}

// Optional args: rgbarray, vertexcount
function webgl_vertexcolorarray(args){
    args = core_args({
      'args': args,
      'defaults': {
        'rgbarray': [
          core_random_rgb(),
          core_random_rgb(),
          core_random_rgb(),
          core_random_rgb(),
        ],
        'vertexcount': 4,
      },
    });

    while(args['rgbarray'].length < args['vertexcount']){
        args['rgbarray'].push(args['rgbarray'][0]);
    }

    var color = [];
    for(var i = 0; i < args['vertexcount']; i++){
        color.push(
          args['rgbarray'][i]['red'] / 256,
          args['rgbarray'][i]['green'] / 256,
          args['rgbarray'][i]['blue'] / 256,
          1,
        );
    }

    return color;
}

var webgl_attributes = {};
var webgl_buffer = 0;
var webgl_canvas = 0;
var webgl_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
var webgl_canvas_properties = {};
var webgl_character = {};
var webgl_properties = {};
var webgl_text = {};
var webgl_textures = {
  '_debug': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAP8A/wD/AAAAAAD///8hKtLYAAAAIklEQVQoz2NwQQMMTkoQIAgBIiNMwIEBAowhwGSECaAnBwAdPj4tFnzwQgAAAABJRU5ErkJggg==',
  '_default': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
};
var webgl_uniformlocations = {};
