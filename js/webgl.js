'use strict';

// Required args: entity
function webgl_billboard(args){
    entity_entities[args['entity']]['rotate']['z'] = math_radians_to_degrees({
      'radians': math_point_angle({
        'x0': entity_entities['_webgl-camera']['position']['x'],
        'y0': entity_entities['_webgl-camera']['position']['z'],
        'x1': entity_entities[args['entity']]['position']['x'],
        'y1': entity_entities[args['entity']]['position']['z'],
      }),
    });
}

// Required args: colorData, indexData, textureData, vertexData
function webgl_buffer_set(args){
    return {
      'color': webgl_buffer_set_type({
        'data': args['colorData'],
      }),
      'index': webgl_buffer_set_type({
        'data': args['indexData'],
        'type': 'Uint16Array',
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

// Required args: speed, y
// Optional args: strafe
function webgl_camera_move(args){
    args = core_args({
      'args': args,
      'defaults': {
        'strafe': false,
      },
    });

    var movement = math_move_3d({
      'angle': entity_entities['_webgl-camera']['rotate']['y'],
      'speed': args['speed'],
      'strafe': args['strafe'],
    });

    entity_entities['_webgl-camera']['dx'] += movement['x'];
    entity_entities['_webgl-camera']['dy'] += args['y'];
    entity_entities['_webgl-camera']['dz'] += movement['z'];
}

// Required args: x, y, z
// Optional args: xlock
function webgl_camera_rotate(args){
    args['xlock'] = args['xlock'] !== false;

    var axes = {
      'x': args['x'],
      'y': args['y'],
      'z': args['z'],
    };
    for(var axis in axes){
        entity_entities['_webgl-camera']['rotate'][axis] = math_clamp({
          'max': 360,
          'min': 0,
          'value': math_round({
            'number': entity_entities['_webgl-camera']['rotate'][axis] + axes[axis],
          }),
          'wrap': true,
        });
    }

    if(args['xlock']){
        var max = 89;
        if(entity_entities['_webgl-camera']['rotate']['x'] > 180){
            max += 271;
        }
        entity_entities['_webgl-camera']['rotate']['x'] = math_clamp({
          'max': max,
          'min': max - 89,
          'value': entity_entities['_webgl-camera']['rotate']['x'],
        });
    }
}

// Required args: color
function webgl_clearcolor_set(args){
    webgl_clearcolor = args['color'];
    webgl_buffer.clearColor(
      webgl_clearcolor['red'],
      webgl_clearcolor['green'],
      webgl_clearcolor['blue'],
      webgl_clearcolor['alpha']
    );
}

// Required args: id
// Optional args: color, dx, dy, dz, exclude, side, x, y, z
function webgl_cube(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color': [
          .2, .2, .2, 1,
          .1, .1, .1, 1,
          .2, .2, .2, 1,
          .1, .1, .1, 1,
        ],
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'exclude': [],
        'side': 1,
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    var entities = [];
    for(var i = 0; i < 6; i++){
        if(args['exclude'].indexOf(i) > -1){
            continue;
        }

        var x = i * 90;
        var y = 0;
        var z = 0;

        if(i > 3){
            x = 0;
            y = (5 - i) * 180;
            z = 90;
        }

        var id = '_webgl-cube_' + args['id'] + '_' + i;
        entity_create({
          'id': id,
          'properties': {
            'color': args['color'],
            'dx': args['dx'],
            'dy': args['dy'],
            'dz': args['dz'],
            'position': {
              'x': args['x'],
              'y': args['y'],
              'z': args['z'],
            },
            'rotate': {
              'x': x,
              'y': y,
              'z': z,
            },
            'vertices': [
              args['side'], args['side'], -args['side'],
              -args['side'], args['side'], -args['side'],
              -args['side'], args['side'], args['side'],
              args['side'], args['side'], args['side'],
            ],
          },
        });

        entities.push(id);
    }

    entity_group_add({
      'entities': entities,
      'group': args['id'],
    });
}

function webgl_draw(){
    webgl_buffer.viewport(
      0,
      0,
      webgl_buffer.viewportWidth,
      webgl_buffer.viewportHeight
    );
    webgl_buffer.clear(webgl_buffer.COLOR_BUFFER_BIT | webgl_buffer.DEPTH_BUFFER_BIT);

    math_matrix_identity({
      'id': 'camera',
    });
    math_matrix_rotate({
      'dimensions': [
        math_degrees_to_radians({
          'degrees': entity_entities['_webgl-camera']['rotate']['x'],
        }),
        math_degrees_to_radians({
          'degrees': entity_entities['_webgl-camera']['rotate']['y'],
        }),
        math_degrees_to_radians({
          'degrees': entity_entities['_webgl-camera']['rotate']['z'],
        }),
      ],
      'id': 'camera',
    });
    math_matrix_translate({
      'dimensions': [
        entity_entities['_webgl-camera']['position']['x'],
        entity_entities['_webgl-camera']['position']['y'],
        entity_entities['_webgl-camera']['position']['z'],
      ],
      'id': 'camera',
    });

    draw_logic();

    for(var entity in entity_entities){
        if(entity_entities[entity]['draw'] === false){
            continue;
        }

        if(entity_entities[entity]['billboard'] === true){
            webgl_billboard({
              'entity': entity,
            });
        }

        math_matrix_clone({
          'id': 'camera',
          'newid': 'cache',
        });

        if(entity_entities[entity]['depth-ignore']){
            webgl_buffer.disable(webgl_buffer.DEPTH_TEST);
        }

        math_matrix_translate({
          'dimensions': [
            -entity_entities[entity]['position']['x'],
            -entity_entities[entity]['position']['y'],
            entity_entities[entity]['position']['z'],
          ],
          'id': 'camera',
        });
        math_matrix_rotate({
          'dimensions': [
            math_degrees_to_radians({
              'degrees': entity_entities[entity]['rotate']['x'],
            }),
            math_degrees_to_radians({
              'degrees': entity_entities[entity]['rotate']['y'],
            }),
            math_degrees_to_radians({
              'degrees': entity_entities[entity]['rotate']['z'],
            }),
          ],
          'id': 'camera',
        });

        webgl_buffer.bindBuffer(
          webgl_buffer.ARRAY_BUFFER,
          entity_entities[entity]['buffer']['color']
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
          entity_entities[entity]['buffer']['vertex']
        );
        webgl_buffer.vertexAttribPointer(
          webgl_attributes['vec_vertexPosition'],
          3,
          webgl_buffer.FLOAT,
          false,
          0,
          0
        );

        webgl_buffer.bindBuffer(
          webgl_buffer.ARRAY_BUFFER,
          entity_entities[entity]['buffer']['texture']
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
          entity_entities[entity]['texture']
        );
        webgl_buffer.uniform1i(
          webgl_buffer.getUniformLocation(
            webgl_programs['shaders'],
            'sampler'
          ),
          0
        );

        webgl_buffer.bindBuffer(
          webgl_buffer.ARRAY_BUFFER,
          entity_entities[entity]['buffer']['index']
        );

        webgl_buffer.uniformMatrix4fv(
          webgl_buffer.getUniformLocation(
            webgl_programs['shaders'],
            'mat_perspectiveMatrix'
          ),
          0,
          math_matrices['perspective']
        );
        webgl_buffer.uniformMatrix4fv(
          webgl_buffer.getUniformLocation(
            webgl_programs['shaders'],
            'mat_cameraMatrix'
          ),
          0,
          math_matrices['camera']
        );

        webgl_buffer.drawArrays(
          webgl_buffer[entity_entities[entity]['mode']],
          0,
          entity_entities[entity]['vertices'].length / 3
        );

        if(entity_entities[entity]['depth-ignore']){
            webgl_buffer.enable(webgl_buffer.DEPTH_TEST);
        }

        math_matrix_copy({
          'id': 'cache',
          'newid': 'camera',
        });
    }

    webgl_canvas.clearRect(
      0,
      0,
      webgl_width,
      webgl_height
    );
    webgl_canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    for(var text in webgl_text){
        for(var property in webgl_text[text]['properties']){
            webgl_canvas[property] = webgl_text[text]['properties'][property];
        }
        webgl_canvas.fillText(
          webgl_text[text]['text'],
          webgl_text[text]['x'],
          webgl_text[text]['y']
        );
    }

    if(webgl_menu){
        webgl_canvas.save();

        webgl_canvas.fillStyle = '#111';
        webgl_canvas.fillRect(
          webgl_x - 125,
          webgl_y - 50,
          250,
          100
        );

        webgl_canvas.fillStyle = '#fff';
        webgl_canvas.font = webgl_fonts['medium'];
        webgl_canvas.textAlign = 'center';
        webgl_canvas.textBaseline = 'middle';
        webgl_canvas.fillText(
          webgl_resume,
          webgl_x,
          webgl_y - 25
        );
        webgl_canvas.fillText(
          webgl_quit,
          webgl_x,
          webgl_y + 25
        );

        webgl_canvas.restore();

    }else if(webgl_pointer !== false){
        webgl_canvas.fillStyle = webgl_pointer;
        webgl_canvas.fillRect(
          webgl_x - 1,
          webgl_y - 1,
          2,
          2
        );
    }
}

function webgl_drawloop(){
    webgl_draw();
    webgl_animationFrame = window.requestAnimationFrame(webgl_drawloop);
}

function webgl_init(){
    webgl_resize();

    webgl_clearcolor = {
      'alpha': 1,
      'blue': 0,
      'green': 0,
      'red': 0,
    };

    entity_set({
      'properties': {
        'collides': false,
        'collision': false,
        'color': [],
        'depth-ignore': false,
        'draw': true,
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'index': [],
        'mode': 'TRIANGLE_FAN',
        'normals': [],
        'position': {
          'x': 0,
          'y': 0,
          'z': 0,
        },
        'rotate': {
          'x': 0,
          'y': 0,
          'z': 0,
        },
        'scale': {
          'x': 1,
          'y': 1,
          'z': 1,
        },
        'textureData': [],
      },
      'todo': function(entity){
          entity_entities[entity]['normals'] = webgl_normals({
            'x-rotation': entity_entities[entity]['rotate']['x'],
            'y-rotation': entity_entities[entity]['rotate']['y'],
            'z-rotation': entity_entities[entity]['rotate']['z'],
          });

          if(entity_entities[entity]['draw'] === false){
              return;
          }

          entity_entities[entity]['index'] = [
            0, 1,
            2, 0,
            2, 3,
          ];
          entity_entities[entity]['textureData'] = [
            0, 1,
            0, 0,
            1, 0,
            1, 1,
          ];

          entity_entities[entity]['buffer'] = webgl_buffer_set({
            'colorData': entity_entities[entity]['color'],
            'indexData': entity_entities[entity]['index'],
            'normalData': entity_entities[entity]['normals'],
            'textureData': entity_entities[entity]['textureData'],
            'vertexData': entity_entities[entity]['vertices'],
          });

          webgl_texture_set({
            'entityid': entity,
            'image': webgl_textures['_default'],
          });
      },
      'type': '_webgl',
    });
    entity_types_default = [
      '_webgl',
    ];

    entity_create({
      'id': '_webgl-camera',
      'properties': {
        'collides': true,
        'draw': false,
      },
    });

    webgl_setmode({
      'newmode': 0,
    });
}

function webgl_logicloop(){
    entity_entities['_webgl-camera']['dx'] = 0;
    entity_entities['_webgl-camera']['dy'] = 0;
    entity_entities['_webgl-camera']['dz'] = 0;

    logic();

    for(var entity in entity_entities){
        if(entity_entities[entity]['logic']){
            entity_entities[entity]['logic']();
        }

        if(entity_entities[entity]['collides']){
            for(var other_entity in entity_entities){
                if(entity !== other_entity
                  && entity_entities[other_entity]['collision']){
                    webgl_normals_collision({
                      'entity0id': entity,
                      'entity1id': other_entity,
                    });
                }
            }
        }

        for(var axis in entity_entities[entity]['position']){
            entity_entities[entity]['position'][axis] += entity_entities[entity]['d' + axis];
        }
    }
}

function webgl_menu_quit(){
    if(webgl_menu){
        webgl_setmode({
          'newmode': 0,
        });
    }
}

function webgl_menu_toggle(){
    webgl_menu = !webgl_menu;
}

// Optional args: x-rotation, y-rotation, z-rotation
function webgl_normals(args){
    args = core_args({
      'args': args,
      'defaults': {
        'x-rotation': 0,
        'y-rotation': 0,
        'z-rotation': 0,
      },
    });

    var normal_x = 0;
    var normal_y = 0;
    var normal_z = 0;

    if(args['x-rotation'] !== 0){
        normal_x = 0;
        normal_y = 0;
        normal_z = math_round({
          'number': Math.sin(math_degrees_to_radians({
            'degrees': args['x-rotation'],
          })),
        });

    }else if(args['z-rotation'] !== 0){
        normal_x = -math_round({
          'number': Math.sin(math_degrees_to_radians({
            'degrees': args['z-rotation'],
          })),
        });
        normal_y = 0;
        normal_z = 0;

    }else{
        normal_y = math_round({
          'number': Math.cos(math_degrees_to_radians({
            'degrees': args['y-rotation'],
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
    var entity0 = entity_entities[args['entity0id']];
    var entity1 = entity_entities[args['entity1id']];

    if(entity1['normals'][0] !== 0){
        if(entity1['normals'][0] === 1
          && entity0['dx'] < 0){
            if(entity0['position']['x'] >= entity1['position']['x']
              && entity0['position']['x'] <= entity1['position']['x'] + 2
              && entity0['position']['y'] >= entity1['position']['y'] + entity1['vertices'][3] - 2
              && entity0['position']['y'] <= entity1['position']['y'] + entity1['vertices'][0] + 2
              && entity0['position']['z'] >= -entity1['position']['z'] + entity1['vertices'][2] - 1
              && entity0['position']['z'] <= -entity1['position']['z'] + entity1['vertices'][8] + 1){
                entity0['dx'] = 0;
            }

        }else if(entity1['normals'][0] === -1
          && entity0['dx'] > 0){
            if(entity0['position']['x'] >= entity1['position']['x'] - 2
              && entity0['position']['x'] <= entity1['position']['x']
              && entity0['position']['y'] >= entity1['position']['y'] + entity1['vertices'][3] - 2
              && entity0['position']['y'] <= entity1['position']['y'] + entity1['vertices'][0] + 2
              && entity0['position']['z'] >= -entity1['position']['z'] + entity1['vertices'][2] - 1
              && entity0['position']['z'] <= -entity1['position']['z'] + entity1['vertices'][8] + 1){
                entity0['dx'] = 0;
            }
        }
    }

    if(entity1['normals'][1] !== 0){
        if(entity1['normals'][1] === 1
          && entity0['dy'] < 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - 2
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + 2
              && entity0['position']['y'] >= entity1['position']['y']
              && entity0['position']['y'] <= entity1['position']['y'] + 2
              && entity0['position']['z'] >= -entity1['position']['z'] + entity1['vertices'][2] - 2
              && entity0['position']['z'] <= -entity1['position']['z'] + entity1['vertices'][8] + 2){
                entity0['dy'] = 0;
            }

        }else if(entity1['normals'][1] === -1
          && entity0['dy'] > 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - 2
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + 2
              && entity0['position']['y'] >= entity1['position']['y'] - 2
              && entity0['position']['y'] <= entity1['position']['y']
              && entity0['position']['z'] >= -entity1['position']['z'] + entity1['vertices'][2] - 2
              && entity0['position']['z'] <= -entity1['position']['z'] + entity1['vertices'][8] + 2){
                entity0['dy'] = 0;
            }
        }
    }

    if(entity1['normals'][2] !== 0){
        if(entity1['normals'][2] === 1
          && entity0['dz'] < 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - 1
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + 1
              && entity0['position']['y'] >= entity1['position']['y'] + entity1['vertices'][2] - 2
              && entity0['position']['y'] <= entity1['position']['y'] + entity1['vertices'][8] + 2
              && entity0['position']['z'] >= -entity1['position']['z']
              && entity0['position']['z'] <= -entity1['position']['z'] + 2){
                entity0['dz'] = 0;
            }

        }else if(entity1['normals'][2] === -1
          && entity0['dz'] > 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - 1
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + 1
              && entity0['position']['y'] >= entity1['position']['y'] + entity1['vertices'][2] - 2
              && entity0['position']['y'] <= entity1['position']['y'] + entity1['vertices'][8] + 2
              && entity0['position']['z'] >= -entity1['position']['z'] - 2
              && entity0['position']['z'] <= -entity1['position']['z']){
                entity0['dz'] = 0;
            }
        }
    }
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

    webgl_programs[args['id']] = program;
}

function webgl_resize(){
    if(webgl_mode <= 0){
        return;
    }

    webgl_height = window.innerHeight;
    document.getElementById('buffer').height = webgl_height;
    document.getElementById('canvas').height = webgl_height;
    webgl_y = webgl_height / 2;

    webgl_width = window.innerWidth;
    document.getElementById('buffer').width = webgl_width;
    document.getElementById('canvas').width = webgl_width;
    webgl_x = webgl_width / 2;

    webgl_buffer.viewportHeight = webgl_height;
    webgl_buffer.viewportWidth = webgl_width;
    webgl_buffer.viewport(0, 0, webgl_height, webgl_width);

    webgl_buffer.font = webgl_fonts['medium'];

    core_call({
      'todo': 'resize_logic',
    });
}

// Required args: newmode
// Optional args: newgame
function webgl_setmode(args){
    args = core_args({
      'args': args,
      'defaults': {
        'newgame': false,
      },
    });

    window.cancelAnimationFrame(webgl_animationFrame);
    window.clearInterval(webgl_interval);

    entity_entities['_webgl-camera']['position']['x'] = 0;
    entity_entities['_webgl-camera']['position']['y'] = 0;
    entity_entities['_webgl-camera']['position']['z'] = 0;
    entity_entities['_webgl-camera']['rotate']['x'] = 0;
    entity_entities['_webgl-camera']['rotate']['y'] = 0;
    entity_entities['_webgl-camera']['rotate']['z'] = 0;

    webgl_menu = false;
    webgl_mode = args['newmode'];
    var msperframe = 0;
    webgl_programs = {};
    webgl_shaders = {};

    if(core_type({
      'var': 'setmode_logic',
      'type': 'function',
    })){
        setmode_logic(args['newgame']);

    }else{
        webgl_mode = 1;
        args['newgame'] = true;
        msperframe = 33;
    }

    // Main menu mode.
    if(webgl_mode === 0){
        webgl_buffer = 0;
        webgl_canvas = 0;
        return;
    }

    // Simulation modes.
    if(args['newgame']){
        var properties = '';

        if(!webgl_oncontextmenu){
            properties = ' oncontextmenu="return false" ';
        }

        document.body.innerHTML =
          '<canvas id=canvas' + properties + '></canvas><canvas id=buffer></canvas>';

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
        webgl_canvas = document.getElementById('canvas').getContext('2d');

        webgl_resize();

        webgl_clearcolor_set({
          'color': webgl_clearcolor,
        });
        webgl_buffer.clearDepth(webgl_cleardepth);
        webgl_buffer.enable(webgl_buffer.CULL_FACE);
        webgl_buffer.enable(webgl_buffer.DEPTH_TEST);
        webgl_buffer.depthFunc(webgl_buffer.LEQUAL);

        webgl_shader_create({
          'id': 'fragment',
          'source': 'precision mediump float;'
          //+ 'varying float float_fogDistance;'
            + 'uniform sampler2D sampler;'
            + 'varying vec4 vec_fragmentColor;'
            + 'varying vec2 vec_textureCoord;'
            + 'void main(void){'
          /*+   'gl_FragColor = mix('
            +     'vec4('
            +       webgl_clearcolor['red'] + ','
            +       webgl_clearcolor['green'] + ','
            +       webgl_clearcolor['blue'] + ','
            +       webgl_clearcolor['alpha']
            +     '),'
            +     'vec_fragmentColor,'
            +     'clamp(exp(-0.001 * float_fogDistance * float_fogDistance), 0.0, 1.0)'
            +   ') * vec_fragmentColor;'
          */+   'gl_FragColor = texture2D('
            +     'sampler,'
            +     'vec_textureCoord'
            +   ') * vec_fragmentColor;'
            + '}',
          'type': webgl_buffer.FRAGMENT_SHADER,
        });
        webgl_shader_create({
          'id': 'vertex',
          'source': 'attribute vec3 vec_vertexPosition;'
          //+ 'varying float float_fogDistance;'
            + 'uniform mat4 mat_cameraMatrix;'
            + 'uniform mat4 mat_perspectiveMatrix;'
            + 'varying vec4 vec_fragmentColor;'
            + 'attribute vec4 vec_vertexColor;'
            + 'varying vec2 vec_textureCoord;'
            + 'attribute vec2 vec_texturePosition;'
            + 'void main(void){'
            +   'gl_Position = mat_perspectiveMatrix * mat_cameraMatrix * vec4(vec_vertexPosition, 1.0);'
            +   'vec_fragmentColor = vec_vertexColor;'
          //+   'float_fogDistance = length(gl_Position.xyz);'
            +   'vec_textureCoord = vec_texturePosition;'
            + '}',
          'type': webgl_buffer.VERTEX_SHADER,
        });

        webgl_program_create({
          'id': 'shaders',
          'shaderlist': [
            webgl_shaders['fragment'],
            webgl_shaders['vertex'],
          ],
        });

        webgl_vertexattribarray_set({
          'attribute': 'vec_vertexColor',
        });
        webgl_vertexattribarray_set({
          'attribute': 'vec_vertexPosition',
        });
        webgl_vertexattribarray_set({
          'attribute': 'vec_texturePosition',
        });
    }

    math_matrices['camera'] = math_matrix_create();
    math_matrix_perspective();

    core_call({
      'args': webgl_mode,
      'todo': 'load_level',
    });

    webgl_animationFrame = window.requestAnimationFrame(webgl_drawloop);
    webgl_interval = window.setInterval(
      webgl_logicloop,
      msperframe || storage_data['ms-per-frame']
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

    webgl_shaders[args['id']] = shader;
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

    entity_entities[args['entityid']]['texture'] = webgl_buffer.createTexture();
    entity_entities[args['entityid']]['image'] = images_new({
      'id': args['entityid'] + '-texture',
      'src': args['image'],
      'todo': function(){
          webgl_buffer.bindTexture(
            webgl_buffer.TEXTURE_2D,
            entity_entities[args['entityid']]['texture']
          );
          webgl_buffer.texImage2D(
            webgl_buffer.TEXTURE_2D,
            0,
            webgl_buffer.RGBA,
            webgl_buffer.RGBA,
            webgl_buffer.UNSIGNED_BYTE,
            entity_entities[args['entityid']]['image']
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
      },
    });
}

// Required args: id
// Optional args: color-base, color-leaf, dx, dy, dz, x, y, z
function webgl_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color-base': [
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
        ],
        'color-leaf': [
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
        ],
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    entity_create({
      'id': '_webgl-tree_' + args['id'] + '_base',
      'properties': {
        'color': args['color-base'],
        'dx': args['dx'],
        'dy': args['dy'],
        'dz': args['dz'],
        'position': {
          'x': args['x'],
          'y': args['y'],
          'z': args['z'],
        },
        'rotate': {
          'x': 90,
        },
        'vertices': [
          1, 0, -1,
          -1, 0, -1,
          -1, 0, 0,
          1, 0, 0,
        ],
      },
    });
    entity_create({
      'id': '_webgl-tree_' + args['id'] + '_leaf',
      'properties': {
        'color': args['color-leaf'],
        'dx': args['dx'],
        'dy': args['dy'],
        'dz': args['dz'],
        'mode': 'TRIANGLES',
        'position': {
          'x': args['x'],
          'y': args['y'],
          'z': args['z'],
        },
        'rotate': {
          'x': 90,
        },
        'vertices': [
          3, 0, -1,
          0, 0, -5,
          -3, 0, -1,
        ],
      },
    });

    entity_group_add({
      'entities': [
        '_webgl-tree_' + args['id'] + '_base',
        '_webgl-tree_' + args['id'] + '_leaf',
      ],
      'group': args['id'],
    });
}

// Required args: attribute
function webgl_vertexattribarray_set(args){
    webgl_attributes[args['attribute']] = webgl_buffer.getAttribLocation(
      webgl_programs['shaders'],
      args['attribute']
    );
    webgl_buffer.enableVertexAttribArray(webgl_attributes[args['attribute']]);
}

var webgl_animationFrame = 0;
var webgl_attributes = {};
var webgl_buffer = 0;
var webgl_canvas = 0;
var webgl_clearcolor = {};
var webgl_cleardepth = 1;
var webgl_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
var webgl_height = 0;
var webgl_interval = 0;
var webgl_menu = false;
var webgl_mode = 0;
var webgl_oncontextmenu = true;
var webgl_pointer = false;
var webgl_programs = {};
var webgl_quit = 'Q = Main Menu';
var webgl_resume = 'ESC = Resume';
var webgl_shaders = {};
var webgl_text = {};
var webgl_textures = {
  '_debug': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAP8A/wD/AAAAAAD///8hKtLYAAAAIklEQVQoz2NwQQMMTkoQIAgBIiNMwIEBAowhwGSECaAnBwAdPj4tFnzwQgAAAABJRU5ErkJggg==',
  '_default': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
};
var webgl_width = 0;
var webgl_x = 0;
var webgl_y = 0;

window.onresize = webgl_resize;
