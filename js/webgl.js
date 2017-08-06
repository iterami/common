'use strict';

// Required args: base
// Optional args: entity, offset-x, offset-y, offset-z
function webgl_attach(args){
    args = core_args({
      'args': args,
      'defaults': {
        'entity': '_webgl-camera',
        'offset-x': 0,
        'offset-y': 0,
        'offset-z': 0,
      },
    });

    core_entities[args['entity']]['attach'] = {
      'offset': {
        'x': args['offset-x'],
        'y': args['offset-y'],
        'z': args['offset-z'],
      },
      'to': args['base'],
    };
}

// Required args: entity
function webgl_billboard(args){
    var axis = 'z';

    if(core_entities[args['entity']]['normals'][0] !== 0){
        axis = 'y';
    }

    core_entities[args['entity']]['rotate'][axis] = math_radians_to_degrees({
      'radians': math_point_angle({
        'x0': core_entities['_webgl-camera']['position']['x'],
        'x1': core_entities[args['entity']]['position']['x'],
        'y0': core_entities['_webgl-camera']['position']['z'],
        'y1': core_entities[args['entity']]['position']['z'],
      }),
    });
}

// Required args: colorData, indexData, textureData, vertexData
function webgl_buffer_set(args){
    return {
      'color': webgl_buffer_set_type({
        'data': args['colorData'],
      }),
      /*
      'index': webgl_buffer_set_type({
        'data': args['indexData'],
        'type': 'Uint16Array',
      }),
      */
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

    var movement = math_move_3d({
      'angle': core_entities['_webgl-camera']['rotate']['y'],
      'speed': args['speed'],
      'strafe': args['strafe'],
    });

    core_entities['_webgl-camera']['dx'] += movement['x'];
    core_entities['_webgl-camera']['dy'] += args['y'];
    core_entities['_webgl-camera']['dz'] += movement['z'];
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
        core_entities['_webgl-camera']['rotate'][axis] = math_clamp({
          'max': 360,
          'min': 0,
          'value': math_round({
            'number': core_entities['_webgl-camera']['rotate'][axis] + axes[axis],
          }),
          'wrap': true,
        });
    }

    if(args['xlock']){
        var max = 89;
        if(core_entities['_webgl-camera']['rotate']['x'] > 180){
            max += 271;
        }
        core_entities['_webgl-camera']['rotate']['x'] = math_clamp({
          'max': max,
          'min': max - 89,
          'value': core_entities['_webgl-camera']['rotate']['x'],
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

function webgl_draw(){
    if(core_menu_open){
        return;
    }

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
          'degrees': core_entities['_webgl-camera']['rotate']['x'],
        }),
        math_degrees_to_radians({
          'degrees': core_entities['_webgl-camera']['rotate']['y'],
        }),
        math_degrees_to_radians({
          'degrees': core_entities['_webgl-camera']['rotate']['z'],
        }),
      ],
      'id': 'camera',
    });
    math_matrix_translate({
      'dimensions': [
        core_entities['_webgl-camera']['position']['x'],
        core_entities['_webgl-camera']['position']['y'],
        core_entities['_webgl-camera']['position']['z'],
      ],
      'id': 'camera',
    });

    draw_logic();

    core_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          if(core_entities[entity]['draw'] === false){
              return;
          }

          if(core_entities[entity]['billboard'] === true){
              webgl_billboard({
                'entity': entity,
              });
          }

          math_matrix_clone({
            'id': 'camera',
            'newid': 'cache',
          });

          if(core_entities[entity]['depth-ignore']){
              webgl_buffer.disable(webgl_buffer.DEPTH_TEST);
          }

          math_matrix_translate({
            'dimensions': [
              -core_entities[entity]['position']['x'],
              -core_entities[entity]['position']['y'],
              -core_entities[entity]['position']['z'],
            ],
            'id': 'camera',
          });
          math_matrix_rotate({
            'dimensions': [
              math_degrees_to_radians({
                'degrees': core_entities[entity]['rotate']['x'],
              }),
              math_degrees_to_radians({
                'degrees': core_entities[entity]['rotate']['y'],
              }),
              math_degrees_to_radians({
                'degrees': core_entities[entity]['rotate']['z'],
              }),
            ],
            'id': 'camera',
          });

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
            3,
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
            webgl_buffer.getUniformLocation(
              webgl_programs['shaders'],
              'sampler'
            ),
            0
          );

          /*
          webgl_buffer.bindBuffer(
            webgl_buffer.ARRAY_BUFFER,
            core_entities[entity]['buffer']['index']
          );
          */

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
            webgl_buffer[core_entities[entity]['mode']],
            0,
            core_entities[entity]['vertices'].length / 3
          );

          if(core_entities[entity]['depth-ignore']){
              webgl_buffer.enable(webgl_buffer.DEPTH_TEST);
          }

          math_matrix_copy({
            'id': 'cache',
            'newid': 'camera',
          });
      },
    });

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

    if(webgl_pointer !== false){
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
    var properties = '';
    if(!webgl_oncontextmenu){
        properties = ' oncontextmenu="return false" ';
    }

    document.body.appendChild(core_html({
      'properties': {
        'id': 'wrap',
        'innerHTML': '<canvas id=canvas' + properties + '></canvas><canvas id=buffer></canvas>',
      },
    }));

    math_matrices['camera'] = math_matrix_create();
    math_matrix_perspective();

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
      'color': {
        'alpha': 1,
        'blue': 0,
        'green': 0,
        'red': 0,
      },
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

    core_entity_set({
      'default': true,
      'properties': {
        'attach': false,
        'collides': false,
        'collision': false,
        'color': [],
        'depth-ignore': false,
        'draw': true,
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'gravity': false,
        /*
        'index': [
          0, 1,
          2, 0,
          2, 3,
        ],
        */
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
        'textureData': [
          0, 1,
          0, 0,
          1, 0,
          1, 1,
        ],
      },
      'todo': function(entity){
          core_entities[entity]['normals'] = webgl_normals({
            'x-rotation': core_entities[entity]['rotate']['x'],
            'y-rotation': core_entities[entity]['rotate']['y'],
            'z-rotation': core_entities[entity]['rotate']['z'],
          });

          if(core_entities[entity]['draw'] === false){
              return;
          }

          core_entities[entity]['buffer'] = webgl_buffer_set({
            'colorData': core_entities[entity]['color'],
            //'indexData': core_entities[entity]['index'],
            'normalData': core_entities[entity]['normals'],
            'textureData': core_entities[entity]['textureData'],
            'vertexData': core_entities[entity]['vertices'],
          });

          webgl_texture_set({
            'entityid': entity,
            'image': webgl_textures['_default'],
          });
      },
      'type': 'webgl',
    });

    core_entity_create({
      'id': '_webgl-camera',
      'properties': {
        'collides': true,
        'draw': false,
      },
    });

    if(!core_menu_open){
        webgl_setmode();
    }
}

function webgl_logicloop(){
    if(core_menu_open){
        return;
    }

    core_entities['_webgl-camera']['dx'] = 0;
    core_entities['_webgl-camera']['dz'] = 0;
    if(!core_entities['_webgl-camera']['gravity']){
        core_entities['_webgl-camera']['dy'] = 0;
    }

    logic();

    core_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          if(core_entities[entity]['logic']){
              core_entities[entity]['logic']();
          }

          if(core_entities[entity]['gravity']){
              core_entities[entity]['dy'] = Math.max(
                core_entities[entity]['dy'] + webgl_gravity['acceleration'],
                webgl_gravity['max']
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
              for(var axis in core_entities[entity]['position']){
                  core_entities[entity]['position'][axis] = attachto['position'][axis] + core_entities[entity]['attach']['offset'][axis];
              }

          }else{
              for(var axis in core_entities[entity]['position']){
                  core_entities[entity]['position'][axis] += core_entities[entity]['d' + axis];
              }
          }
      },
    });
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
    var entity0 = core_entities[args['entity0id']];
    var entity1 = core_entities[args['entity1id']];

    if(entity1['normals'][0] !== 0){
        if(entity1['normals'][0] === 1
          && entity0['dx'] < 0){
            if(entity0['position']['x'] >= entity1['position']['x']
              && entity0['position']['x'] <= entity1['position']['x'] + webgl_collision_range
              && entity0['position']['y'] > entity1['position']['y'] + entity1['vertices'][3] - webgl_collision_range
              && entity0['position']['y'] < entity1['position']['y'] + entity1['vertices'][0] + webgl_collision_range
              && entity0['position']['z'] >= entity1['position']['z'] + entity1['vertices'][2] - webgl_collision_range + 1
              && entity0['position']['z'] <= entity1['position']['z'] + entity1['vertices'][8] + webgl_collision_range - 1){
                entity0['dx'] = 0;
                entity0['position']['x'] = entity1['position']['x'] + webgl_collision_range;
            }

        }else if(entity1['normals'][0] === -1
          && entity0['dx'] > 0){
            if(entity0['position']['x'] >= entity1['position']['x'] - webgl_collision_range
              && entity0['position']['x'] <= entity1['position']['x']
              && entity0['position']['y'] > entity1['position']['y'] + entity1['vertices'][3] - webgl_collision_range
              && entity0['position']['y'] < entity1['position']['y'] + entity1['vertices'][0] + webgl_collision_range
              && entity0['position']['z'] >= entity1['position']['z'] + entity1['vertices'][2] - webgl_collision_range + 1
              && entity0['position']['z'] <= entity1['position']['z'] + entity1['vertices'][8] + webgl_collision_range - 1){
                entity0['dx'] = 0;
                entity0['position']['x'] = entity1['position']['x'] - webgl_collision_range;
            }
        }
    }

    if(entity1['normals'][1] !== 0){
        if(entity1['normals'][1] === 1
          && entity0['dy'] < 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - webgl_collision_range
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + webgl_collision_range
              && entity0['position']['y'] >= entity1['position']['y']
              && entity0['position']['y'] <= entity1['position']['y'] + webgl_collision_range
              && entity0['position']['z'] >= entity1['position']['z'] + entity1['vertices'][2] - webgl_collision_range
              && entity0['position']['z'] <= entity1['position']['z'] + entity1['vertices'][8] + webgl_collision_range){
                entity0['dy'] = 0;
                entity0['position']['y'] = entity1['position']['y'] + webgl_collision_range;
            }

        }else if(entity1['normals'][1] === -1
          && entity0['dy'] > 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - webgl_collision_range
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + webgl_collision_range
              && entity0['position']['y'] >= entity1['position']['y'] - webgl_collision_range
              && entity0['position']['y'] <= entity1['position']['y']
              && entity0['position']['z'] >= entity1['position']['z'] + entity1['vertices'][2] - webgl_collision_range
              && entity0['position']['z'] <= entity1['position']['z'] + entity1['vertices'][8] + webgl_collision_range){
                entity0['dy'] = 0;
                entity0['position']['y'] = entity1['position']['y'] - webgl_collision_range;
            }
        }
    }

    if(entity1['normals'][2] !== 0){
        if(entity1['normals'][2] === 1
          && entity0['dz'] < 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - webgl_collision_range + 1
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + webgl_collision_range - 1
              && entity0['position']['y'] > entity1['position']['y'] + entity1['vertices'][2] - webgl_collision_range
              && entity0['position']['y'] < entity1['position']['y'] + entity1['vertices'][8] + webgl_collision_range
              && entity0['position']['z'] >= entity1['position']['z']
              && entity0['position']['z'] <= entity1['position']['z'] + webgl_collision_range){
                entity0['dz'] = 0;
                entity0['position']['z'] = entity1['position']['z'] + webgl_collision_range;
            }

        }else if(entity1['normals'][2] === -1
          && entity0['dz'] > 0){
            if(entity0['position']['x'] >= entity1['position']['x'] + entity1['vertices'][3] - webgl_collision_range + 1
              && entity0['position']['x'] <= entity1['position']['x'] + entity1['vertices'][0] + webgl_collision_range - 1
              && entity0['position']['y'] > entity1['position']['y'] + entity1['vertices'][2] - webgl_collision_range
              && entity0['position']['y'] < entity1['position']['y'] + entity1['vertices'][8] + webgl_collision_range
              && entity0['position']['z'] >= entity1['position']['z'] - webgl_collision_range
              && entity0['position']['z'] <= entity1['position']['z']){
                entity0['dz'] = 0;
                entity0['position']['z'] = entity1['position']['z'] - webgl_collision_range;
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

// Optional args: mode, newgame
function webgl_setmode(args){
    args = core_args({
      'args': args,
      'defaults': {
        'mode': 0,
        'newgame': false,
      },
    });

    core_storage_save();

    window.cancelAnimationFrame(webgl_animationFrame);
    window.clearInterval(webgl_interval);
    core_entity_remove_all();

    webgl_resize();

    core_entities['_webgl-camera']['position']['x'] = 0;
    core_entities['_webgl-camera']['position']['y'] = 0;
    core_entities['_webgl-camera']['position']['z'] = 0;
    core_entities['_webgl-camera']['rotate']['x'] = 0;
    core_entities['_webgl-camera']['rotate']['y'] = 0;
    core_entities['_webgl-camera']['rotate']['z'] = 0;

    core_mode = args['mode'];

    core_call({
      'args': core_mode,
      'todo': 'load_data',
    });

    if(args['newgame']){
        core_escape();
    }

    webgl_animationFrame = window.requestAnimationFrame(webgl_drawloop);
    webgl_interval = window.setInterval(
      webgl_logicloop,
      core_storage_data['frame-ms']
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

    core_entities[args['entityid']]['texture'] = webgl_buffer.createTexture();
    core_entities[args['entityid']]['image'] = core_image({
      'id': args['entityid'] + '-texture',
      'src': args['image'],
      'todo': function(){
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
      },
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

var webgl_animationFrame = 0;
var webgl_attributes = {};
var webgl_buffer = 0;
var webgl_canvas = 0;
var webgl_clearcolor = {};
var webgl_cleardepth = 1;
var webgl_collision_range = 2.5;
var webgl_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
var webgl_gravity = {
  'acceleration': -.05,
  'max': -1,
};
var webgl_height = 0;
var webgl_interval = 0;
var webgl_oncontextmenu = true;
var webgl_pointer = false;
var webgl_programs = {};
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
