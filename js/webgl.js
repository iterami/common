'use strict';

// Required args: entity
function webgl_billboard(args){
    args = core_args({
      'args': args,
      'defaults': {
        'axes': [
          'y',
        ],
        'character': webgl_character_id,
      },
    });

    for(const axis in args['axes']){
        entity_entities[args['entity']]['rotate-' + args['axes'][axis]]
          = 360 - webgl_characters[args['character']]['camera-rotate-' + args['axes'][axis]];
    }
}

// Required args: colorData, normalData, pickData, textureData, vertexData
function webgl_buffer_set(args){
    return {
      'color': webgl_buffer_set_type({
        'data': args['colorData'],
      }),
      'normal': webgl_buffer_set_type({
        'data': args['normalData'],
      }),
      'pick': webgl_buffer_set_type({
        'data': args['pickData'],
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
function webgl_buffer_set_type(args){
    args = core_args({
      'args': args,
      'defaults': {
        'type': 'Float32Array',
      },
    });

    const buffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      buffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new globalThis[args['type']](args['data']),
      webgl_buffer.STATIC_DRAW
    );

    return buffer;
}

function webgl_camera_handle(){
    if(core_mouse['pointerlock-state']
      || core_mouse['down-0']
      || core_mouse['down-2']){
        const level = webgl_character_level();

        if(level < -1
          || (level !== -1 && webgl_properties['paused'])){
            return;
        }

        webgl_camera_rotate({
          'x': core_mouse['movement-y'] / 10,
          'y': core_mouse['movement-x'] / 10,
        });
    }
}

function webgl_camera_rotate(args){
    args = core_args({
      'args': args,
      'defaults': {
        'camera': true,
        'character': webgl_character_id,
        'mouse': true,
        'set': false,
        'x': false,
        'y': false,
        'z': false,
      },
    });

    const axes = {
      'x': args['x'],
      'y': args['y'],
      'z': args['z'],
    };
    const prefix = args['camera']
      ? 'camera-rotate-'
      : 'rotate-';
    for(const axis in axes){
        let axis_value = axes[axis];
        if(axis_value === false){
            continue;
        }

        if(!args['set']){
            axis_value += webgl_characters[args['character']][prefix + axis];
        }

        webgl_characters[args['character']][prefix + axis] = core_round({
          'number': axis_value,
        });
    }

    if(args['camera']){
        const mouse_check = core_mouse['down-2']
          || (!core_mouse['down-0']
            && !core_mouse['down-2'])
          || !args['mouse'];

        if(webgl_characters[args['character']]['camera-zoom'] === 0
          || (mouse_check
            && webgl_character_level({
              'character': args['character'],
            }) !== 0
            && webgl_characters[args['character']]['health-current'] > 0)){
            webgl_characters[args['character']]['rotate-y'] = core_mouse['down-2']
              ? webgl_characters[args['character']]['camera-rotate-y']
              : webgl_characters[args['character']]['rotate-y'] + (args['set']
                ? 0
                : args['y']);
        }
    }
}

function webgl_camera_zoom(event){
    if(webgl_character_level() < -1){
        return;
    }

    const character = webgl_characters[webgl_character_id];
    if(event.deltaY > 0){
        character['camera-zoom'] = Math.min(
          character['camera-zoom'] + 1,
          webgl_properties['camera-zoom-max']
        );

    }else{
        character['camera-zoom'] = Math.max(
          character['camera-zoom'] - 1,
          0
        );
    }
}

function webgl_character_home(){
    if(webgl_character_homebase['properties'] === void 0){
        return;
    }

    webgl_init(webgl_character_homebase['properties']);
    for(const character in webgl_character_homebase['characters']){
        webgl_character_init(webgl_character_homebase['characters'][character]);
    }
    webgl_entity_create({
      'entities': webgl_character_homebase['world'],
    });
    webgl_character_spawn();
    webgl_entity_create({
      'entities': webgl_character_homebase['entities'],
    });
}

function webgl_character_home_entityupdate(){
    webgl_character_homebase['entities'] = [];
    entity_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          if(entity_entities[entity]['attach-to'] === webgl_character_id
            && entity_groups['skybox'][entity] !== true){
              const properties = {};
              Object.assign(
                properties,
                entity_entities[entity]
              );
              webgl_character_homebase['entities'].push(properties);
          }
      },
    });
}

function webgl_character_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'automove': false,
        'camera-zoom': 50,
        'change': {},
        'collide-range-horizontal': 2,
        'collide-range-vertical': 3,
        'collides': true,
        'entities': [],
        'experience': 0,
        'health-current': 1,
        'health-max': 1,
        'id': webgl_character_id,
        'jump-height': .1,
        'level': 0,
        'path-direction': 1,
        'path-end': 'default',
        'path-id': '',
        'path-point': 0,
        'reticle': '#fff',
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'speed': .1,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    webgl_characters[args['id']] = {
      'automove': args['automove'],
      'camera-rotate-x': 0,
      'camera-rotate-y': 0,
      'camera-rotate-z': 0,
      'camera-x': 0,
      'camera-y': 0,
      'camera-z': 0,
      'camera-zoom': args['camera-zoom'],
      'collide-range-horizontal': args['collide-range-horizontal'],
      'collide-range-vertical': args['collide-range-vertical'],
      'collides': args['collides'],
      'change': args['change'],
      'experience': args['experience'],
      'health-current': Math.max(
        args['health-current'],
        1
      ),
      'health-max': args['health-max'],
      'id': args['id'],
      'jump-allow': false,
      'jump-height': args['jump-height'],
      'level': args['level'],
      'normals': [],
      'path-direction': args['path-direction'],
      'path-end': args['path-end'],
      'path-id': args['path-id'],
      'path-point': args['path-point'],
      'reticle': args['reticle'],
      'rotate-x': args['rotate-x'],
      'rotate-y': args['rotate-y'],
      'rotate-z': args['rotate-z'],
      'speed': args['speed'],
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'],
      'translate-z': args['translate-z'],
    };
    webgl_characters[args['id']]['change']['translate-x'] = args['change']['translate-x'] || 0;
    webgl_characters[args['id']]['change']['translate-y'] = args['change']['translate-y'] || 0;
    webgl_characters[args['id']]['change']['translate-z'] = args['change']['translate-z'] || 0;
    webgl_character_count++;

    webgl_entity_create({
      'character': args['id'],
      'entities': args['entities'],
    });
}

function webgl_character_jump(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    if(webgl_characters[args['character']]['health-current'] <= 0
      || !webgl_characters[args['character']]['jump-allow']){
        return;
    }

    webgl_characters[args['character']]['jump-allow'] = false;
    webgl_characters[args['character']]['change']['translate-' + webgl_properties['gravity-axis']] = webgl_characters[args['character']]['jump-height'] * webgl_properties['multiplier-jump'];
}

function webgl_character_level(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    if(webgl_characters[args['character']]){
        return webgl_characters[args['character']]['level'];
    }

    return -2;
}

function webgl_character_origin(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    if(webgl_characters[args['character']] === void 0){
        return;
    }

    webgl_entity_move_to({
      'entity': webgl_characters[args['character']],
    });
    webgl_characters[args['character']]['camera-rotate-x'] = 0;
    webgl_characters[args['character']]['camera-rotate-y'] = 0;
    webgl_characters[args['character']]['camera-rotate-z'] = 0;
    webgl_characters[args['character']]['change'] = {
      'translate-x': 0,
      'translate-y': 0,
      'translate-z': 0,
    };
    webgl_characters[args['character']]['rotate-x'] = 0;
    webgl_characters[args['character']]['rotate-y'] = 0;
    webgl_characters[args['character']]['rotate-z'] = 0;
}

// Required args: id
function webgl_character_random(args){
    const horizontal = core_random_number({
      'multiplier': 2,
    }) + 2;
    const vertical = core_random_number({
      'multiplier': 5,
    }) + 2;

    webgl_character_init({
      'collide-range-horizontal': horizontal,
      'collide-range-vertical': vertical,
      'id': args['id'],
      'level': 1,
    });

    core_call({
      'args': {
        'all': {
          'collision': false,
        },
        'character': args['id'],
        'random-colors': true,
        'size-x': horizontal * 2,
        'size-y': vertical * 2,
        'size-z': horizontal * 2,
      },
      'todo': 'webgl_primitive_cuboid',
    });
}

// Required args: id
function webgl_character_set(args){
    webgl_character_id = args['id'];

    entity_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          entity_entities[entity]['attach-to'] = webgl_character_id;
      },
    });
}

function webgl_character_spawn(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    if(webgl_characters[args['character']] === void 0){
        return;
    }

    webgl_character_origin({
      'character': args['character'],
    });
    webgl_entity_move_to({
      'entity': webgl_characters[args['character']],
      'x': webgl_properties['spawn-translate-x'],
      'y': webgl_properties['spawn-translate-y'] + webgl_characters[args['character']]['collide-range-vertical'] + 1,
      'z': webgl_properties['spawn-translate-z'],
    });
    webgl_camera_rotate({
      'character': args['character'],
      'x': webgl_properties['spawn-rotate-x'],
      'y': webgl_properties['spawn-rotate-y'],
      'z': webgl_properties['spawn-rotate-z'],
    });

    webgl_characters[args['character']]['jump-allow'] = false;
}

// Required args: entity
function webgl_clamp_rotation(args){
    const axes = [
      'x',
      'y',
      'z',
    ];

    const character = args['entity']['camera-rotate-x'] !== void 0;

    for(const axis in axes){
        const property = 'rotate-' + axes[axis];

        if(character){
            args['entity']['camera-' + property] = math_clamp({
              'max': 360,
              'min': 0,
              'value': args['entity']['camera-' + property],
              'wrap': true,
            });
        }

        args['entity'][property] = math_clamp({
          'max': 360,
          'min': 0,
          'value': args['entity'][property],
          'wrap': true,
        });
    }

    if(character){
        const max = args['entity']['camera-rotate-x'] > 180
          ? 360
          : 90;
        args['entity']['camera-rotate-x'] = math_clamp({
          'max': max,
          'min': max - 90,
          'value': args['entity']['camera-rotate-x'],
        });
    }
}

function webgl_clearcolor_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'blue': 0,
        'green': 0,
        'red': 0,
      },
    });

    webgl_properties['clearcolor-blue'] = args['blue'];
    webgl_properties['clearcolor-green'] = args['green'];
    webgl_properties['clearcolor-red'] = args['red'];
    webgl_buffer.clearColor(
      webgl_properties['clearcolor-red'],
      webgl_properties['clearcolor-green'],
      webgl_properties['clearcolor-blue'],
      1
    );
}

// Required args: collider, target
function webgl_collision(args){
    const collider_position = webgl_get_translation({
      'entity': args['collider'],
    });
    let collision = false;
    let collision_sign = 1;
    const range = {
      'x': args['collider']['collide-range-horizontal'] + Math.abs(args['collider']['change']['translate-x']),
      'y': args['collider']['collide-range-vertical'] + Math.abs(args['collider']['change']['translate-y']),
      'z': args['collider']['collide-range-horizontal'] + Math.abs(args['collider']['change']['translate-z']),
    };
    const target_position = webgl_get_translation({
      'entity': args['target'],
    });

    if(args['target']['normals'][0] !== 0){
        if(args['target']['normals'][0] === 1
          && (args['collider']['change']['translate-x'] < 0
            || args['target']['change']['translate-x'] > 0)){
            if(collider_position['x'] > target_position['x']
              && collider_position['x'] < target_position['x'] + range['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][3] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][0] + range['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
                collision = 'x';
            }

        }else if(args['target']['normals'][0] === -1
          && (args['collider']['change']['translate-x'] > 0
            || args['target']['change']['translate-x'] < 0)){
            if(collider_position['x'] > target_position['x'] - range['x']
              && collider_position['x'] < target_position['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][3] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][0] + range['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
                collision = 'x';
                collision_sign = -1;
            }
        }

    }else if(args['target']['normals'][1] !== 0){
        if(args['target']['normals'][1] === 1
          && (args['collider']['change']['translate-y'] < 0
            || args['target']['change']['translate-y'] > 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y']
              && collider_position['y'] < target_position['y'] + range['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
                collision = 'y';
            }

        }else if(args['target']['normals'][1] === -1
          && (args['collider']['change']['translate-y'] > 0
            || args['target']['change']['translate-y'] < 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y'] - range['y']
              && collider_position['y'] < target_position['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
                collision = 'y';
                collision_sign = -1;
            }
        }

    }else if(args['target']['normals'][2] !== 0){
        if(args['target']['normals'][2] === 1
          && (args['collider']['change']['translate-z'] < 0
            || args['target']['change']['translate-z'] > 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][2] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][8] + range['y']
              && collider_position['z'] > target_position['z']
              && collider_position['z'] < target_position['z'] + range['z']){
                collision = 'z';
            }

        }else if(args['target']['normals'][2] === -1
          && (args['collider']['change']['translate-z'] > 0
            || args['target']['change']['translate-z'] < 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][2] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][8] + range['y']
              && collider_position['z'] > target_position['z'] - range['z']
              && collider_position['z'] < target_position['z']){
                collision = 'z';
                collision_sign = -1;
            }
        }
    }

    if(collision !== false){
        if(!entity_groups['particles'][args['collider']['id']]
          && Math.abs(target_position[collision] - collider_position[collision]) < range[collision]){
            const range_axis = collision === 'y'
              ? 'vertical'
              : 'horizontal';

            args['collider']['translate-' + collision] = target_position[collision] + args['collider']['collide-range-' + range_axis] * collision_sign;
            args['collider']['change']['translate-' + collision] = args['target']['change']['translate-' + collision];

            if(collision === webgl_properties['gravity-axis']){
                if(args['collider']['jump-allow'] === false
                  && webgl_properties['gravity-max'] / webgl_properties['gravity-max'] === collision_sign){
                    args['collider']['jump-allow'] = true;
                }

                let axis_first = 'translate-x';
                let axis_second = 'translate-z';
                if(collision === 'x'){
                    axis_first = 'translate-y';

                }else if(collision === 'z'){
                    axis_second = 'translate-y';
                }

                const axis_first_change = webgl_characters[args['target']['attach-to']]['change'][axis_first];
                if(axis_first_change !== 0){
                    args['collider'][axis_first] += axis_first_change;
                }
                const axis_second_change = webgl_characters[args['target']['attach-to']]['change'][axis_second];
                if(axis_second_change !== 0){
                    args['collider'][axis_second] += axis_second_change;
                }
            }
        }

        if(args['target']['event-range'] === 0){
            webgl_event({
              'parent': args['target'],
              'target': args['collider'],
            });
        }

        if(entity_groups['particles'][args['collider']['id']]){
            entity_remove({
              'entities': [
                args['collider']['id'],
              ],
            });

            return false;
        }
    }

    return true;
}

function webgl_draw(){
    webgl_buffer.clear(webgl_buffer.COLOR_BUFFER_BIT | webgl_buffer.DEPTH_BUFFER_BIT);

    webgl_buffer.disable(webgl_buffer.DEPTH_TEST);
    entity_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          webgl_draw_entity(entity);
      },
    });
    webgl_buffer.enable(webgl_buffer.DEPTH_TEST);

    entity_group_modify({
      'groups': [
        'particles',
        'foreground',
      ],
      'todo': function(entity){
          if(entity_entities[entity]['alpha'] === 1){
              webgl_draw_entity(entity);
          }
      },
    });
    entity_group_modify({
      'groups': [
        'particles',
        'foreground',
      ],
      'todo': function(entity){
          if(entity_entities[entity]['alpha'] < 1){
              webgl_draw_entity(entity);
          }
      },
    });

    webgl_canvas.drawImage(
      core_elements['buffer'],
      0,
      0
    );

    for(const text in webgl_text){
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

    const character = webgl_characters[webgl_character_id];
    if(character
      && character['reticle'] !== false
      && character['camera-zoom'] === 0){
        webgl_canvas.fillStyle = character['reticle'];
        webgl_canvas.fillRect(
          webgl_properties['canvas']['width-half'] - 1,
          webgl_properties['canvas']['height-half'] - 1,
          2,
          2
        );
    }
}

function webgl_draw_entity(entity){
    if(!entity_entities[entity]['draw']){
        return;
    }

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      entity_entities[entity]['buffer']['normal']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_properties['attributes']['vec_vertexNormal'],
      3,
      webgl_buffer.FLOAT,
      false,
      0,
      0
    );

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      entity_entities[entity]['buffer']['color']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_properties['attributes']['vec_vertexColor'],
      4,
      webgl_buffer.FLOAT,
      false,
      0,
      0
    );

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      entity_entities[entity]['buffer']['pick']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_properties['attributes']['vec_pickColor'],
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
      webgl_properties['attributes']['vec_vertexPosition'],
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
      webgl_properties['attributes']['vec_texturePosition'],
      2,
      webgl_buffer.FLOAT,
      false,
      0,
      0
    );

    webgl_buffer.activeTexture(webgl_buffer.TEXTURE0);
    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      entity_entities[entity]['texture-gl']
    );

    webgl_buffer.uniform1f(
      webgl_properties['shader']['alpha'],
      entity_entities[entity]['alpha']
    );
    webgl_buffer.uniformMatrix4fv(
      webgl_properties['shader']['mat_cameraMatrix'],
      false,
      math_matrices[entity]
    );

    webgl_buffer.drawArrays(
      webgl_buffer[webgl_properties['draw-mode'] || entity_entities[entity]['draw-mode']],
      0,
      entity_entities[entity]['vertices-length']
    );
}

function webgl_drawloop(){
    if(!core_menu_open){
        webgl_draw();
    }
    core_interval_animationFrame({
      'id': 'webgl-animationFrame',
    });
}

function webgl_entity_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': false,
        'entities': [],
      },
    });

    for(const entity in args['entities']){
        const entity_id = entity_create({
          'id': args['entities'][entity]['id'],
          'properties': args['entities'][entity],
          'types': args['entities'][entity]['types'],
        });
        math_matrices[entity_id] = math_matrix_create();

        for(const group in args['entities'][entity]['groups']){
            entity_group_add({
              'entities': [
                entity_id,
              ],
              'group': args['entities'][entity]['groups'][group],
            });
        }
        Reflect.deleteProperty(
          entity_entities[entity_id],
          'groups'
        );

        if(entity_groups['skybox']
          && entity_groups['skybox'][entity_id] === true){
            entity_group_remove({
              'entities': [
                entity_id,
              ],
              'group': 'foreground',
            });
            args['entities'][entity]['attach-to'] = webgl_character_id;
            args['entities'][entity]['attach-type'] = 'webgl_characters';

        }else if(args['character'] !== false){
            args['entities'][entity]['attach-to'] = args['character'];
            args['entities'][entity]['attach-type'] = 'webgl_characters';
        }

        if(args['entities'][entity]['attach-to'] !== void 0){
            entity_attach({
              'entity': entity_id,
              'offset-x': args['entities'][entity]['attach-offset-x'],
              'offset-y': args['entities'][entity]['attach-offset-y'],
              'offset-z': args['entities'][entity]['attach-offset-z'],
              'to': args['entities'][entity]['attach-to'],
              'type': args['entities'][entity]['attach-type'],
            });
        }
    }
}

function webgl_entity_move(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'entity': false,
        'multiplier': 1,
        'strafe': false,
        'y': false,
      },
    });

    args['multiplier'] *= webgl_properties['multiplier-speed'];

    if(args['entity'] === false){
        if(args['y']){
            let dy = webgl_characters[args['character']]['speed'] * args['multiplier'];
            dy *= args['strafe']
              ? -1
              : 1;
            webgl_characters[args['character']]['change']['translate-y'] += dy;

        }else{
            const movement = math_move_3d({
              'angle': webgl_characters[args['character']]['rotate-y'],
              'speed': webgl_characters[args['character']]['speed'] * args['multiplier'],
              'strafe': args['strafe'],
            });
            webgl_characters[args['character']]['change']['translate-x'] += movement['x'];
            webgl_characters[args['character']]['change']['translate-z'] += movement['z'];
        }

        return;
    }

    if(args['y']){
        let dy = entity_entities[args['entity']]['speed'] * args['multiplier'];
        dy *= args['strafe']
          ? -1
          : 1;
        entity_entities[args['entity']]['change']['translate-y'] = dy;

    }else{
        const movement = math_move_3d({
          'angle': entity_entities[args['entity']]['rotate-' + webgl_properties['gravity-axis']],
          'speed': entity_entities[args['entity']]['speed'] * args['multiplier'],
          'strafe': args['strafe'],
        });

        let axis_first = 'translate-x';
        let axis_second = 'translate-z';
        if(webgl_properties['gravity-axis'] === 'x'){
            axis_first = 'y';

        }else if(webgl_properties['gravity-axis'] === 'z'){
            axis_second = 'y';
        }

        entity_entities[args['entity']]['change'][axis_first] = movement['x'];
        entity_entities[args['entity']]['change'][axis_second] = movement['z'];
    }
}

// Required args: entity
function webgl_entity_move_to(args){
    args = core_args({
      'args': args,
      'defaults': {
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    args['entity']['translate-x'] = args['x'];
    args['entity']['translate-y'] = args['y'];
    args['entity']['translate-z'] = args['z'];
}

function webgl_entity_todo(entity){
    entity_entities[entity]['id'] = entity;
    entity_entities[entity]['vertices-length'] = entity_entities[entity]['vertices'].length / 3;

    entity_entities[entity]['normals'] = webgl_normals({
      'rotate-x': entity_entities[entity]['rotate-x'],
      'rotate-y': entity_entities[entity]['rotate-y'],
      'rotate-z': entity_entities[entity]['rotate-z'],
      'vertices-length': entity_entities[entity]['vertices-length'],
    });

    const textureData = [];
    for(let i = 0; i < entity_entities[entity]['vertices-length'] * 2; i += 2){
        textureData.push(
          entity_entities[entity]['texture-align'][i] * entity_entities[entity]['texture-repeat-x'],
          entity_entities[entity]['texture-align'][i + 1] * entity_entities[entity]['texture-repeat-y']
        );
    }

    const pickData = [];
    for(let i = 0; i < entity_entities[entity]['vertices-length'] * 4; i += 4){
        pickData.push(
          entity_entities[entity]['pick-color'][0],
          entity_entities[entity]['pick-color'][1],
          entity_entities[entity]['pick-color'][2],
          1,
        );
    }

    entity_entities[entity]['buffer'] = webgl_buffer_set({
      'colorData': entity_entities[entity]['vertex-colors'],
      'normalData': entity_entities[entity]['normals'],
      'pickData': pickData,
      'textureData': textureData,
      'vertexData': entity_entities[entity]['vertices'],
    });

    webgl_texture_set({
      'entity': entity,
      'texture': entity_entities[entity]['texture-id'],
    });
}

// Required args: parent, target
function webgl_event(args){
    let type = 'entity';
    if(webgl_character_level({
        'character': args['target']['id'],
      }) > -2){
        type = 'character';
    }

    if(args['parent']['event-target-type'] !== type){
        return;
    }

    if(args['parent']['event-target-id'] !== false
      && args['parent']['event-target-id'] !== args['target']['id']){
        return;
    }

    for(const stat in args['parent']['event-modify']){
        const event_modify = args['parent']['event-modify'][stat];
        const target = event_modify['target'] !== void 0
          ? entity_entities[event_modify['target']]
          : event_modify['self']
            ? args['parent']
            : args['target'];

        webgl_stat_modify({
          'set': event_modify['set'],
          'stat': event_modify['stat'],
          'target': target,
          'value': event_modify['value'],
        });
    }
}

// Required args: id
function webgl_extension(args){
    args = core_args({
      'args': args,
      'defaults': {
        'label': args['id'],
      },
    });

    const extension = webgl_buffer.getExtension(args['id']);
    const result = extension !== null;

    if(result){
        webgl_extensions[args['label']] = extension;
    }

    return result;
}

// Required args: entity
function webgl_get_translation(args){
    if(args['entity']['attach-to'] === void 0
      || args['entity']['attach-to'] === false){
        return {
          'x': args['entity']['translate-x'],
          'y': args['entity']['translate-y'],
          'z': args['entity']['translate-z'],
        };
    }

    const target = globalThis[args['entity']['attach-type']][args['entity']['attach-to']];
    return {
      'x': target['translate-x'] + args['entity']['attach-offset-x'],
      'y': target['translate-y'] + args['entity']['attach-offset-y'],
      'z': target['translate-z'] + args['entity']['attach-offset-z'],
    };
}

function webgl_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'ambient-blue': 1,
        'ambient-green': 1,
        'ambient-red': 1,
        'camera-zoom-max': 50,
        'clearcolor-blue': 0,
        'clearcolor-green': 0,
        'clearcolor-red': 0,
        'cursor': 'pointer',
        'directional-blue': 1,
        'directional-green': 1,
        'directional-red': 1,
        'directional-state': true,
        'directional-vector': [0, 1, 0],
        'fog-density': .0001,
        'fog-state': false,
        'gravity-acceleration': -.05,
        'gravity-axis': 'y',
        'gravity-max': -2,
        'groups': [],
        'jump-movement': 0,
        'multiplier-jump': 1,
        'multiplier-speed': 1,
        'paths': {},
        'shader-fragment': 'fragment-0',
        'shader-vertex': 'vertex-0',
        'spawn-rotate-x': 0,
        'spawn-rotate-y': 0,
        'spawn-rotate-z': 0,
        'spawn-translate-x': 0,
        'spawn-translate-y': 0,
        'spawn-translate-z': 0,
        'textures': true,
      },
    });

    webgl_level_unload();

    if(webgl_buffer === 0){
        core_html({
          'parent': document.body,
          'properties': {
            'id': 'canvas',
          },
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

        webgl_buffer = core_elements['buffer'].getContext(
          'webgl2',
          {
            'alpha': false,
            'antialias': true,
            'depth': true,
            'premultipliedAlpha': false,
            'preserveDrawingBuffer': false,
            'stencil': false,
          }
        );
        webgl_canvas = core_elements['canvas'].getContext(
          '2d',
          {
            'alpha': false,
          }
        );
    }
    core_elements['canvas'].style.cursor = args['cursor'];

    webgl_extension({
      'id': 'EXT_texture_filter_anisotropic',
      'label': 'anisotropic',
    });

    entity_id_count = 0;
    webgl_properties = {
      'ambient-blue': args['ambient-blue'],
      'ambient-green': args['ambient-green'],
      'ambient-red': args['ambient-red'],
      'attributes': {},
      'camera-zoom-max': args['camera-zoom-max'],
      'canvas': {
        'fillStyle': '#fff',
        'font': '200% monospace',
        'height': 0,
        'height-half': 0,
        'lineJoin': 'miter',
        'lineWidth': 1,
        'strokeStyle': '#fff',
        'textAlign': 'start',
        'textBaseline': 'alphabetic',
        'width': 0,
        'width-half': 0,
      },
      'clearcolor-blue': args['clearcolor-blue'],
      'clearcolor-green': args['clearcolor-green'],
      'clearcolor-red': args['clearcolor-red'],
      'directional-blue': args['directional-blue'],
      'directional-green': args['directional-green'],
      'directional-red': args['directional-red'],
      'directional-state': args['directional-state'],
      'directional-vector': args['directional-vector'],
      'draw-mode': '',
      'fog-density': args['fog-density'],
      'fog-state': args['fog-state'],
      'gravity-acceleration': args['gravity-acceleration'],
      'gravity-axis': args['gravity-axis'],
      'gravity-max': args['gravity-max'],
      'jump-movement': args['jump-movement'],
      'multiplier-jump': args['multiplier-jump'],
      'multiplier-speed': args['multiplier-speed'],
      'paused': false,
      'picking': false,
      'shader': {},
      'shader-fragment': args['shader-fragment'],
      'shader-vertex': args['shader-vertex'],
      'spawn-rotate-x': args['spawn-rotate-x'],
      'spawn-rotate-y': args['spawn-rotate-y'],
      'spawn-rotate-z': args['spawn-rotate-z'],
      'spawn-translate-x': args['spawn-translate-x'],
      'spawn-translate-y': args['spawn-translate-y'],
      'spawn-translate-z': args['spawn-translate-z'],
      'textures': args['textures'],
    };

    math_matrices['camera'] = math_matrix_create();
    math_matrices['perspective'] = math_matrix_create();

    globalThis.onresize = webgl_resize;
    webgl_resize();

    webgl_clearcolor_set({
      'blue': webgl_properties['clearcolor-blue'],
      'green': webgl_properties['clearcolor-green'],
      'red': webgl_properties['clearcolor-red'],
    });
    webgl_buffer.enable(webgl_buffer.BLEND);
    webgl_buffer.enable(webgl_buffer.CULL_FACE);
    webgl_buffer.enable(webgl_buffer.DEPTH_TEST);

    webgl_buffer.blendFunc(
      webgl_buffer.SRC_ALPHA,
      webgl_buffer.ONE_MINUS_SRC_ALPHA
    );

    webgl_shader_recreate();

    args['groups'].push(
      'foreground',
      'particles',
      'skybox',
      'webgl'
    );
    entity_group_create({
      ids: args['groups'],
    });
    entity_set({
      'default': true,
      'groups': [
        'foreground',
      ],
      'properties': {
        'alpha': 1,
        'attach-offset-x': 0,
        'attach-offset-y': 0,
        'attach-offset-z': 0,
        'attach-to': false,
        'attach-type': 'entity_entities',
        'billboard': false,
        'change': {
          'translate-x': 0,
          'translate-y': 0,
          'translate-z': 0,
        },
        'collide-range-horizontal': 2,
        'collide-range-vertical': 3,
        'collides': false,
        'collision': true,
        'draw': true,
        'draw-mode': 'TRIANGLE_FAN',
        'event-modify': [],
        'event-range': false,
        'event-target-id': false,
        'event-target-type': 'character',
        'gravity': false,
        'normals': [],
        'path-direction': 1,
        'path-end': 'default',
        'path-id': '',
        'path-point': 0,
        'pick-color': [0, 0, 0,],
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'scale-x': 1,
        'scale-y': 1,
        'scale-z': 1,
        'spawn-entity': false,
        'spawn-interval-current': 0,
        'spawn-interval-max': 100,
        'speed': 0,
        'texture-align': [
          1, 1,
          0, 1,
          0, 0,
          1, 0,
        ],
        'texture-id': 'default.png',
        'texture-repeat-x': 1,
        'texture-repeat-y': 1,
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

    webgl_diagonal = Math.sin(math_degrees_to_radians({
      'degrees': 45,
    })) / Math.sin(math_degrees_to_radians({
      'degrees': 90,
    }));
    Object.assign(
      webgl_paths,
      args['paths']
    );

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

function webgl_json_export(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': true,
      },
    });

    const json = {};

    Object.assign(
      json,
      webgl_properties
    );

    delete json['attributes'];
    delete json['canvas'];
    delete json['shader'];

    if(args['character']
      && webgl_character_level() > -1){
        json['character'] = {};
        Object.assign(
          json['character'],
          webgl_characters[webgl_character_id]
        );

        delete json['character']['camera-rotate-x'];
        delete json['character']['camera-rotate-y'];
        delete json['character']['camera-rotate-z'];
        delete json['character']['jump-allow'];
        delete json['character']['rotate-x'];
        delete json['character']['rotate-y'];
        delete json['character']['rotate-z'];
        delete json['character']['translate-x'];
        delete json['character']['translate-y'];
        delete json['character']['translate-z'];

        json['entities'] = [];
        for(const entity in webgl_character_homebase['entities']){
            const entity_json = {};
            entity_json['id'] = webgl_character_homebase['entities'][entity]['id'];

            Object.assign(
              entity_json,
              webgl_character_homebase['entities'][entity]
            );

            delete entity_json['buffer'];
            delete entity_json['normals'];
            delete entity_json['texture-gl'];
            delete entity_json['vertices-length'];

            json['entities'].push(entity_json);
        }

    }else{
        json['entities'] = [];
        for(const entity in entity_entities){
            const entity_json = {};
            entity_json['id'] = entity_entities[entity]['id'];

            Object.assign(
              entity_json,
              entity_entities[entity]
            );

            delete entity_json['buffer'];
            delete entity_json['normals'];
            delete entity_json['texture-gl'];
            delete entity_json['vertices-length'];

            json['entities'].push(entity_json);
        }
    }

    return JSON.stringify(json);
}

// Required args: character
function webgl_level_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'json': false,
      },
    });

    if(args['json'] === false){
        args['json'] = {};
    }

    if(args['character'] === 1){
        if(!args['json']['characters']
          || args['json']['characters'][0]['id'] !== webgl_character_id){
            return;
        }

        Reflect.deleteProperty(
          webgl_characters,
          webgl_character_id
        );

    }else if(args['character'] === 0
      && webgl_character_level() < 0){
        return;
    }

    if(args['json']['randomized']){
        for(const i in args['json']['randomized']){
            const randomized = core_random_number({
              'multiplier': args['json']['randomized'][i]['max'] - args['json']['randomized'][i]['min'],
            }) + args['json']['randomized'][i]['min'];

            for(const id in args['json']['randomized'][i]['ids']){
                const targets = args['json'][args['json']['randomized'][i]['character'] === true
                  ? 'characters'
                  : 'entities'];

                for(const target in targets){
                    if(targets[target]['id'] === args['json']['randomized'][i]['ids'][id]){
                        if(!targets[target][args['json']['randomized'][i]['property']]){
                            targets[target][args['json']['randomized'][i]['property']] = 0;
                        }
                        targets[target][args['json']['randomized'][i]['property']] += randomized;

                        break;
                    }
                }
            }
        }
    }

    webgl_init(args['json']);

    if(args['json']['characters']
      && args['json']['characters'] !== false){
        for(const character in args['json']['characters']){
            if(!webgl_characters[args['json']['characters'][character]['id']]){
                webgl_character_init(args['json']['characters'][character]);
            }
        }
    }

    if(args['character'] === -1){
        webgl_character_init({
          'camera-zoom': 0,
          'entities': [],
          'id': webgl_character_id,
          'level': -1,
          'speed': 1,
        });
        webgl_character_homebase = {};

    }else if(webgl_characters[webgl_character_id] === void 0){
        webgl_character_init({
          'level': args['character'],
        });

    }else{
        webgl_character_init(webgl_characters[webgl_character_id]);
    }

    if(args['character'] === 1){
        webgl_character_homebase['characters'] = {};
        webgl_character_homebase['properties'] = webgl_properties;
        webgl_character_homebase['world'] = [];

        Object.assign(
          webgl_character_homebase['characters'],
          webgl_characters
        );

        for(const character in args['json']['characters']){
            if(character === 0){
                continue;
            }

            const entities = args['json']['characters'][character]['entities'];
            for(const entity in entities){
                const properties = {};
                Object.assign(
                  properties,
                  entities[entity]
                );
                webgl_character_homebase['world'].push(properties);
            }
        }
    }

    webgl_entity_create({
      'entities': webgl_character_homebase['entities'],
    });
    for(const prefab in args['json']['prefabs']){
        core_call({
          'args': args['json']['prefabs'][prefab]['properties'],
          'todo': args['json']['prefabs'][prefab]['type'],
        });
    }

    webgl_character_home_entityupdate();
    webgl_character_spawn();
    core_call({
      'todo': 'repo_level_load',
    });
    webgl_uniform_update();

    if(core_menu_open){
        core_escape();
    }else{
        core_interval_resume_all();
    }
}

function webgl_level_load(args){
    args = core_args({
      'args': args,
      'defaults': {
        'cache': false,
        'character': 0,
        'json': false,
      },
    });

    if(args['json'] instanceof File){
        core_file({
          'file': args['json'],
          'todo': function(event){
              webgl_level_init({
                'character': args['character'],
                'json': JSON.parse(event.target.result),
              });
          },
          'type': 'readAsText',
        });

        return;
    }

    if(args['cache'] !== false){
        webgl_levelcache['id'] = args['cache'];
        webgl_levelcache['json'] = Object.assign(
          {},
          args['json']
        );
    }

    webgl_level_init({
      'character': args['character'],
      'json': args['json'],
    });
}

function webgl_level_unload(){
    if(webgl_character_homebase['properties'] !== void 0){
        Object.assign(
          webgl_character_homebase['characters'][webgl_character_id],
          webgl_characters[webgl_character_id]
        );
    }

    webgl_character_home_entityupdate();
    for(const character in webgl_characters){
        if(character !== webgl_character_id){
            Reflect.deleteProperty(
              webgl_characters,
              character
            );
        }
    }
    webgl_character_count = 0;
    entity_remove_all();
    webgl_paths = {};
    core_storage_save();
}

function webgl_logicloop(){
    const level = webgl_character_level();

    if(level !== 0
      && (level === -1 || !webgl_properties['paused'])
      && webgl_characters[webgl_character_id]['health-current'] > 0){
        let leftright = 0;

        if(core_keys[core_storage_data['move-←']]['state']){
            if(webgl_characters[webgl_character_id]['camera-zoom'] === 0
              || core_mouse['down-2']){
                leftright -= 1;

            }else{
                webgl_camera_rotate({
                  'camera': !core_mouse['down-0'],
                  'y': -5,
                });
            }
        }

        if(core_keys[core_storage_data['move-→']]['state']){
            if(webgl_characters[webgl_character_id]['camera-zoom'] === 0
              || core_mouse['down-2']){
                leftright += 1;

            }else{
                webgl_camera_rotate({
                  'camera': !core_mouse['down-0'],
                  'y': 5,
                });
            }
        }

        if(webgl_characters[webgl_character_id]['path-id'].length === 0 &&
          ((webgl_characters[webgl_character_id]['jump-allow']
            && webgl_characters[webgl_character_id]['change']['translate-' + webgl_properties['gravity-axis']] === 0)
          || level === -1
          || webgl_properties['jump-movement'] > 0)){
            let forwardback = 0;

            if(core_keys[core_storage_data['move-↓']]['state']){
                webgl_characters[webgl_character_id]['automove'] = false;
                if(level < 0){
                    forwardback = 1;

                }else{
                    forwardback = .5;
                    leftright *= .5;
                }
            }

            if(core_keys[core_storage_data['move-↑']]['state']){
                webgl_characters[webgl_character_id]['automove'] = false;
                forwardback = forwardback === 0
                  ? -1
                  : 0;

            }else if(webgl_characters[webgl_character_id]['automove']){
                forwardback = forwardback === 0
                  ? -1
                  : 0;
            }

            if(level === -1){
                if(core_keys[core_storage_data['jump']]['state']){
                    webgl_entity_move({
                      'y': true,
                    });
                }

                if(core_keys[core_storage_data['crouch']]['state']){
                    webgl_entity_move({
                      'strafe': true,
                      'y': true,
                    });
                }

            }else if(core_keys[core_storage_data['jump']]['state']){
                webgl_character_jump();
            }

            if(forwardback !== 0
              && leftright !== 0){
                forwardback *= webgl_diagonal;
                leftright *= webgl_diagonal;
            }

            if(!webgl_characters[webgl_character_id]['jump-allow']
              && webgl_properties['jump-movement'] > 0){
                forwardback *= webgl_properties['jump-movement'];
                leftright *= webgl_properties['jump-movement'];
            }

            if(forwardback !== 0){
                webgl_entity_move({
                  'multiplier': forwardback,
                });
            }
            if(leftright !== 0){
                webgl_entity_move({
                  'multiplier': leftright,
                  'strafe': true,
                });
            }
        }
    }

    core_call({
      'todo': 'repo_logic',
    });

    entity_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          webgl_logicloop_handle_entity(entity);
      },
    });

    if(!webgl_properties['paused']){
        entity_group_modify({
          'groups': [
            'particles',
          ],
          'todo': function(entity){
              webgl_entity_move({
                'entity': entity,
                'multiplier': -1,
              });

              let remove = false;

              entity_entities[entity]['lifespan'] -= 1;
              if(entity_entities[entity]['lifespan'] <= 0){
                  remove = true;

              }else{
                  for(const character in webgl_characters){
                      if(entity_entities[entity]['parent'] === character
                        || webgl_character_level({
                          'character': character,
                        }) < 0){
                          continue;
                      }

                      if(math_distance({
                          'x0': webgl_characters[character]['translate-x'],
                          'y0': webgl_characters[character]['translate-y'],
                          'z0': webgl_characters[character]['translate-z'],
                          'x1': entity_entities[entity]['translate-x'],
                          'y1': entity_entities[entity]['translate-y'],
                          'z1': entity_entities[entity]['translate-z'],
                        }) < Math.max(
                          webgl_characters[character]['collide-range-horizontal'],
                          webgl_characters[character]['collide-range-vertical']
                        )){
                          webgl_event({
                            'parent': entity_entities[entity],
                            'target': webgl_characters[character],
                          });
                          remove = true;
                          break;
                      }
                  }
              }

              if(remove){
                  entity_remove({
                    'entities': [
                      entity,
                    ],
                  });
              }
          },
        });
    }

    for(const character in webgl_characters){
        const character_level = webgl_character_level({
          'character': character,
        });

        if(webgl_properties['paused']){
            if(character_level !== -1
              || character !== webgl_character_id){
                continue;
            }
        }

        if(character_level > 0){
            webgl_characters[character]['change']['translate-' + webgl_properties['gravity-axis']] = Math.max(
              webgl_characters[character]['change']['translate-' + webgl_properties['gravity-axis']] + webgl_properties['gravity-acceleration'],
              webgl_properties['gravity-max']
            );
        }

        if(webgl_characters[character]['collides']){
            for(const entity in entity_entities){
                if(entity_entities[entity]['collision']){
                    webgl_collision({
                      'collider': webgl_characters[character],
                      'target': entity_entities[entity],
                    });
                }
            }
        }

        webgl_path_move({
          'entity': webgl_characters[character],
        });

        for(const change in webgl_characters[character]['change']){
            webgl_characters[character][change] = core_round({
              'number': webgl_characters[character][change] + webgl_characters[character]['change'][change],
            });
        }

        webgl_characters[character]['camera-x'] = webgl_characters[character]['translate-x'];
        webgl_characters[character]['camera-y'] = webgl_characters[character]['translate-y'];
        webgl_characters[character]['camera-z'] = webgl_characters[character]['translate-z'];

        if(webgl_characters[character]['camera-zoom'] > 0){
            const radians_x = math_degrees_to_radians({
              'degrees': webgl_characters[character]['camera-rotate-x'],
            });
            const radians_y = math_degrees_to_radians({
              'degrees': webgl_characters[character]['camera-rotate-y'],
            });
            const cos = Math.cos(radians_x);

            webgl_characters[character]['camera-x'] += Math.sin(-radians_y) * webgl_characters[character]['camera-zoom'] * cos;
            webgl_characters[character]['camera-y'] += Math.sin(radians_x) * webgl_characters[character]['camera-zoom'];
            webgl_characters[character]['camera-z'] += Math.cos(radians_y) * webgl_characters[character]['camera-zoom'] * cos;
        }

        webgl_clamp_rotation({
          'entity': webgl_characters[character],
        });
        webgl_characters[character]['normals'] = webgl_normals({
          'rotate-x': webgl_characters[character]['rotate-x'],
          'rotate-y': webgl_characters[character]['rotate-y'],
          'rotate-z': webgl_characters[character]['rotate-z'],
        });
    }

    if(level === -1){
        webgl_characters[webgl_character_id]['change']['translate-x'] = 0;
        webgl_characters[webgl_character_id]['change']['translate-y'] = 0;
        webgl_characters[webgl_character_id]['change']['translate-z'] = 0;

    }else{
        if(webgl_characters[webgl_character_id]['change']['translate-' + webgl_properties['gravity-axis']] !== 0){
            webgl_characters[webgl_character_id]['jump-allow'] = false;
        }

        if(webgl_characters[webgl_character_id]['jump-allow']
          || webgl_properties['jump-movement'] > 0){
            webgl_characters[webgl_character_id]['change']['translate-x'] = 0;
            webgl_characters[webgl_character_id]['change']['translate-z'] = 0;
        }
    }

    math_matrix_identity({
      'id': 'camera',
    });
    math_matrix_rotate({
      'dimensions': [
        math_degrees_to_radians({
          'degrees': webgl_characters[webgl_character_id]['camera-rotate-x'],
        }),
        math_degrees_to_radians({
          'degrees': webgl_characters[webgl_character_id]['camera-rotate-y'],
        }),
        math_degrees_to_radians({
          'degrees': webgl_characters[webgl_character_id]['camera-rotate-z'],
        }),
      ],
      'id': 'camera',
    });
    math_matrix_translate({
      'dimensions': [
        webgl_characters[webgl_character_id]['camera-x'],
        webgl_characters[webgl_character_id]['camera-y'],
        webgl_characters[webgl_character_id]['camera-z'],
      ],
      'id': 'camera',
    });
}

function webgl_logicloop_handle_entity(entity){
    if(entity_entities[entity]['logic']){
        entity_entities[entity]['logic']();
    }

    if(entity_entities[entity]['event-range'] > 0){
        const event_position = webgl_get_translation({
          'entity': entity_entities[entity],
        });

        if(entity_entities[entity]['event-target-type'] === 'character'){
            if(entity_entities[entity]['event-target-id'] !== false){
                const character = webgl_characters[entity_entities[entity]['event-target-id']];

                if(math_distance({
                    'x0': character['translate-x'],
                    'y0': character['translate-y'],
                    'z0': character['translate-z'],
                    'x1': event_position['x'],
                    'y1': event_position['y'],
                    'z1': event_position['z'],
                  }) < entity_entities[entity]['event-range']){
                    webgl_event({
                      'parent': entity_entities[entity],
                      'target': character,
                    });
                }

            }else{
                for(const character in webgl_characters){
                    if(character === entity_entities[entity]['attach-to']){
                        continue;
                    }

                    if(math_distance({
                        'x0': webgl_characters[character]['translate-x'],
                        'y0': webgl_characters[character]['translate-y'],
                        'z0': webgl_characters[character]['translate-z'],
                        'x1': event_position['x'],
                        'y1': event_position['y'],
                        'z1': event_position['z'],
                      }) < entity_entities[entity]['event-range']){
                        webgl_event({
                          'parent': entity_entities[entity],
                          'target': webgl_characters[character],
                        });
                    }
                }
            }

        }else{
            if(entity_entities[entity]['event-target-id'] !== false){
                const target_position = webgl_get_translation({
                  'entity': entity_entities[entity_entities[entity]['event-target-id']],
                });

                if(math_distance({
                    'x0': target_position['x'],
                    'y0': target_position['y'],
                    'z0': target_position['z'],
                    'x1': event_position['x'],
                    'y1': event_position['y'],
                    'z1': event_position['z'],
                  }) < entity_entities[entity]['event-range']){
                    webgl_event({
                      'parent': entity_entities[entity],
                      'target': entity_entities[entity_entities[entity]['event-target-id']],
                    });
                }

            }else{
                for(const target in entity_entities){
                    if(target === entity){
                        continue;
                    }

                    if(math_distance({
                        'x0': entity_entities[target]['translate-x'],
                        'y0': entity_entities[target]['translate-y'],
                        'z0': entity_entities[target]['translate-z'],
                        'x1': event_position['x'],
                        'y1': event_position['y'],
                        'z1': event_position['z'],
                      }) < entity_entities[entity]['event-range']){
                        webgl_event({
                          'parent': entity_entities[entity],
                          'target': entity_entities[target],
                        });
                    }
                }
            }
        }
    }

    for(const change in entity_entities[entity]['change']){
        entity_entities[entity][change] = core_round({
          'number': entity_entities[entity][change] + entity_entities[entity]['change'][change],
        });
    }

    if(entity_entities[entity]['attach-to'] !== false){
        const target = globalThis[entity_entities[entity]['attach-type']][entity_entities[entity]['attach-to']];

        let x = target['translate-x'];
        let y = target['translate-y'];
        let z = target['translate-z'];
        if(entity_groups['skybox'][entity] === true){
            x = target['camera-x'];
            y = target['camera-y'];
            z = target['camera-z'];
        }

        entity_entities[entity]['translate-x'] = x;
        entity_entities[entity]['translate-y'] = y;
        entity_entities[entity]['translate-z'] = z;

    }else{
        webgl_path_move({
          'entity': entity_entities[entity],
        });

        if(entity_entities[entity]['gravity']){
            entity_entities[entity]['change']['translate-' + webgl_properties['gravity-axis']] = Math.max(
              entity_entities[entity]['change']['translate-' + webgl_properties['gravity-axis']] + webgl_properties['gravity-acceleration'],
              webgl_properties['gravity-max']
            );
        }
    }

    if(entity_entities[entity]['billboard'] !== false){
        webgl_billboard({
          'axes': entity_entities[entity]['billboard'],
          'entity': entity,
        });
    }

    if(entity_entities[entity]['collides']){
        for(const other_entity in entity_entities){
            if(entity_entities[other_entity]['collision']
              && entity !== other_entity
              && entity_entities[entity]['attach-to'] === false){
                if(!webgl_collision({
                    'collider': entity_entities[entity],
                    'target': entity_entities[other_entity],
                  })){
                    return;
                }
            }
        }
    }

    if(entity_entities[entity]['spawn-entity'] !== false){
        entity_entities[entity]['spawn-interval-current']++;

        if(entity_entities[entity]['spawn-interval-current'] >= entity_entities[entity]['spawn-interval-max']){
            entity_entities[entity]['spawn-interval-current'] = 0;

            webgl_particles_create({
              'parent': entity_entities[entity],
              'rotate-x': entity_entities[entity]['rotate-x'],
              'rotate-y': entity_entities[entity]['rotate-y'],
              'rotate-z': entity_entities[entity]['rotate-z'],
              'translate-x': entity_entities[entity]['translate-x'],
              'translate-y': entity_entities[entity]['translate-y'],
              'translate-z': entity_entities[entity]['translate-z'],
            });
        }
    }

    webgl_clamp_rotation({
      'entity': entity_entities[entity],
    });
    entity_entities[entity]['normals'] = webgl_normals({
      'rotate-x': entity_entities[entity]['rotate-x'],
      'rotate-y': entity_entities[entity]['rotate-y'],
      'rotate-z': entity_entities[entity]['rotate-z'],
      'vertices-length': entity_entities[entity]['vertices-length'],
    });

    math_matrix_clone({
      'id': 'camera',
      'to': entity,
    });
    math_matrix_translate({
      'dimensions': [
        -entity_entities[entity]['translate-x'],
        -entity_entities[entity]['translate-y'],
        -entity_entities[entity]['translate-z'],
      ],
      'id': entity,
    });
    if(entity_entities[entity]['attach-to'] !== false){
        if(entity_groups['skybox'][entity] !== true){
            const target = globalThis[entity_entities[entity]['attach-type']][entity_entities[entity]['attach-to']];
            math_matrix_rotate({
              'dimensions': [
                math_degrees_to_radians({
                  'degrees': target['rotate-x'],
                }),
                math_degrees_to_radians({
                  'degrees': -target['rotate-y'],
                }),
                math_degrees_to_radians({
                  'degrees': target['rotate-z'],
                }),
              ],
              'id': entity,
            });
        }
        math_matrix_translate({
          'dimensions': [
            -entity_entities[entity]['attach-offset-x'],
            -entity_entities[entity]['attach-offset-y'],
            -entity_entities[entity]['attach-offset-z'],
          ],
          'id': entity,
        });
    }
    math_matrix_rotate({
      'dimensions': [
        math_degrees_to_radians({
          'degrees': entity_entities[entity]['rotate-x'],
        }),
        math_degrees_to_radians({
          'degrees': entity_entities[entity]['rotate-y'],
        }),
        math_degrees_to_radians({
          'degrees': entity_entities[entity]['rotate-z'],
        }),
      ],
      'id': entity,
    });
}

function webgl_normals(args){
    args = core_args({
      'args': args,
      'defaults': {
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'vertices-length': 1,
      },
    });

    const radians_x = math_degrees_to_radians({
      'degrees': args['rotate-x'],
    });
    const radians_y = math_degrees_to_radians({
      'degrees': args['rotate-y'],
    });
    const radians_z = -math_degrees_to_radians({
      'degrees': args['rotate-z'],
    });

    const normal_x = core_round({
      'number': Math.cos(radians_y) * Math.sin(radians_z),
    });
    const normal_y = core_round({
      'number': Math.cos(radians_x) * Math.cos(radians_z),
    });
    const normal_z = core_round({
      'number': Math.sin(radians_x) * Math.cos(radians_y),
    });

    const normals = [];
    for(let i = 0; i < args['vertices-length']; i++){
        normals.push(
          normal_x,
          normal_y,
          normal_z
        );
    }

    return normals;
}

// Required args: parent
function webgl_particles_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'collide-range': 1,
        'collides': true,
        'color': [1, 1, 1, 1],
        'count': 1,
        'gravity': true,
        'lifespan': 100,
        'rotate-x': webgl_characters[webgl_character_id]['rotate-x'],
        'rotate-y': webgl_characters[webgl_character_id]['rotate-y'],
        'rotate-z': webgl_characters[webgl_character_id]['rotate-z'],
        'speed': 1,
        'translate-x': webgl_characters[webgl_character_id]['translate-x'],
        'translate-y': webgl_characters[webgl_character_id]['translate-y'],
        'translate-z': webgl_characters[webgl_character_id]['translate-z'],
      },
    });

    for(let i = 0; i < args['count']; i++){
        const position = webgl_get_translation({
          'entity': args['parent'],
        });

        const id = entity_create({
          'properties': {
            'collide-range-horizontal': args['collide-range'],
            'collide-range-vertical': args['collide-range'],
            'collides': args['collides'],
            'draw-mode': 'POINTS',
            'gravity': args['gravity'],
            'lifespan': args['lifespan'],
            'normals': [0, 1, 0],
            'parent': args['parent']['id'],
            'rotate-x': args['rotate-x'],
            'rotate-y': args['rotate-y'],
            'rotate-z': args['rotate-z'],
            'speed': args['speed'],
            'translate-x': position['x'],
            'translate-y': position['y'],
            'translate-z': position['z'],
            'vertex-colors': args['color'],
            'vertices': [0, 0, 0],
          },
        });
        math_matrices[id] = math_matrix_create();
        entity_group_move({
          'entities': [
            id,
          ],
          'from': 'foreground',
          'to': 'particles',
        });
    }
}

// Required args: entity
function webgl_path_move(args){
    if(webgl_paths[args['entity']['path-id']] === void 0){
        return;
    }

    const path = core_handle_defaults({
      'default': {
        'speed': 1,
      },
      'var': webgl_paths[args['entity']['path-id']],
    });
    const point = core_handle_defaults({
      'default': {
        'speed': 1,
        'translate-x': args['entity']['translate-x'],
        'translate-y': args['entity']['translate-y'],
        'translate-z': args['entity']['translate-z'],
      },
      'var': path['points'][args['entity']['path-point']],
    });

    const angle_xz = math_point_angle({
      'x0': args['entity']['translate-x'],
      'x1': point['translate-x'],
      'y0': args['entity']['translate-z'],
      'y1': point['translate-z'],
    });
    const angle_y = math_point_angle({
      'x0': args['entity']['translate-x'],
      'x1': point['translate-x'],
      'y0': args['entity']['translate-y'],
      'y1': point['translate-y'],
    });

    const speed = args['entity']['speed'] * webgl_properties['multiplier-speed'] * point['speed'] * path['speed'];

    args['entity']['change']['translate-x'] = core_round({
      'number': Math.cos(angle_xz) * Math.cos(angle_y) * speed,
    });
    args['entity']['change']['translate-y'] = core_round({
      'number': Math.sin(angle_y) * speed,
    });
    args['entity']['change']['translate-z'] = core_round({
      'number': Math.sin(angle_xz) * Math.cos(angle_y) * speed,
    });

    if(args['entity']['translate-x'] > point['translate-x']){
        args['entity']['change']['translate-x'] *= -1;
    }
    if(args['entity']['translate-y'] > point['translate-y']){
        args['entity']['change']['translate-y'] *= -1;
    }
    if(args['entity']['translate-z'] > point['translate-z']){
        args['entity']['change']['translate-z'] *= -1;
    }

    if(math_distance({
        'x0': args['entity']['translate-x'],
        'y0': args['entity']['translate-y'],
        'z0': args['entity']['translate-z'],
        'x1': point['translate-x'],
        'y1': point['translate-y'],
        'z1': point['translate-z'],
      }) < speed){
        args['entity']['change']['translate-x'] = 0;
        args['entity']['change']['translate-y'] = 0;
        args['entity']['change']['translate-z'] = 0;
        args['entity']['translate-x'] = point['translate-x'];
        args['entity']['translate-y'] = point['translate-y'];
        args['entity']['translate-z'] = point['translate-z'];

        let entity_path_end = args['entity']['path-end'];
        if(entity_path_end === 'default'){
            entity_path_end = path['end'];
        }
        if(args['entity']['path-direction'] > 0){
            if(args['entity']['path-point'] >= path['points'].length - 1){
                if(entity_path_end === 'loop'){
                    args['entity']['path-point'] = 0;

                }else if(entity_path_end === 'exit'){
                    args['entity']['path-id'] = '';
                    args['entity']['path-point'] = 0;

                }else if(entity_path_end === 'reverse'){
                    args['entity']['path-direction'] = -1;
                    args['entity']['path-point'] -= 1;

                }else if(entity_path_end === 'warp'){
                    args['entity']['path-point'] = 1;
                    args['entity']['translate-x'] = path['points'][0]['translate-x'];
                    args['entity']['translate-y'] = path['points'][0]['translate-y'];
                    args['entity']['translate-z'] = path['points'][0]['translate-z'];
                }

            }else{
                args['entity']['path-point'] += 1;
            }

        }else if(args['entity']['path-point'] === 0){
            if(entity_path_end === 'loop'){
                args['entity']['path-point'] = path['points'].length - 1;

            }else if(entity_path_end === 'reverse'){
                args['entity']['path-direction'] = 1;
                args['entity']['path-point'] = 1;

            }else if(entity_path_end === 'exit'){
                args['entity']['path-id'] = '';
                args['entity']['path-point'] = 0;

            }else if(entity_path_end === 'warp'){
                const last = path['points'].length - 1;
                args['entity']['path-point'] = last - 1;
                args['entity']['translate-x'] = path['points'][last]['translate-x'];
                args['entity']['translate-y'] = path['points'][last]['translate-y'];
                args['entity']['translate-z'] = path['points'][last]['translate-z'];
            }

        }else{
            args['entity']['path-point'] -= 1;
        }
    }
}

// Required args: entity
function webgl_path_use(args){
    args = core_args({
      'args': args,
      'defaults': {
        'path-id': '',
        'use-path-properties': true,
      },
    });

    args['entity']['path-id'] = args['path-id'];

    if(args['use-path-properties']
      && webgl_paths[args['path-id']]){
        args['entity']['path-direction'] = webgl_paths[args['path-id']]['path-direction'];
        args['entity']['path-end'] = webgl_paths[args['path-id']]['path-end'];
        args['entity']['path-point'] = webgl_paths[args['path-id']]['path-point'];
    }
}

function webgl_perspective(){
    math_matrices['perspective'][0] = webgl_properties['canvas']['height'] / webgl_properties['canvas']['width'];
    math_matrices['perspective'][5] = 1;
    math_matrices['perspective'][10] = -1;
    math_matrices['perspective'][11] = -1;
    math_matrices['perspective'][14] = -2;
}

// Required args: x, y
function webgl_pick_color(args){
    const pixelarray = new Uint8Array(4);

    webgl_buffer.readPixels(
      args['x'],
      globalThis.innerHeight - args['y'],
      1,
      1,
      webgl_buffer.RGBA,
      webgl_buffer.UNSIGNED_BYTE,
      pixelarray
    );

    return pixelarray;
}

// Required args: x, y
function webgl_pick_entity(args){
    const level = webgl_character_level();
    if(core_menu_open
      || level < -1
      || (level !== -1 && webgl_properties['paused'])
      || webgl_characters[webgl_character_id]['health-current'] <= 0){
        return;
    }

    webgl_properties['picking'] = true;
    webgl_uniform_update();
    webgl_draw();

    const color = webgl_pick_color({
      'x': args['x'],
      'y': args['y'],
    });

    webgl_properties['picking'] = false;
    webgl_uniform_update();
    webgl_draw();

    const color_blue = core_round({
      'decimals': 1,
      'number': color[2] / 255,
    });
    const color_green = core_round({
      'decimals': 1,
      'number': color[1] / 255,
    });
    const color_red = core_round({
      'decimals': 1,
      'number': color[0] / 255,
    });

    if(color_blue === 0
      && color_green === 0
      && color_red === 0){
        return;
    }

    for(const entity in entity_entities){
        if(entity_entities[entity]['event-modify'].length === 0){
            continue;
        }

        const entity_color = entity_entities[entity]['pick-color'];

        if(color_blue === entity_color[2]
          && color_green === entity_color[1]
          && color_red === entity_color[0]){
            webgl_event({
              'parent': entity_entities[entity],
              'target': webgl_characters[webgl_character_id],
            });
            break;
        }
    }
}

function webgl_primitive_cuboid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'all': {},
        'back': {},
        'bottom': {},
        'character': webgl_character_id,
        'front': {},
        'groups': [],
        'left': {},
        'prefix': entity_id_count,
        'random-colors': false,
        'right': {},
        'size-x': 1,
        'size-y': 1,
        'size-z': 1,
        'top': {},
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    const half_size_x = args['size-x'] / 2;
    const half_size_y = args['size-y'] / 2;
    const half_size_z = args['size-z'] / 2;
    const vertices_size_x = Math.abs(half_size_x);
    const vertices_size_y = Math.abs(half_size_y);
    const vertices_size_z = Math.abs(half_size_z);

    if(args['random-colors']){
        args['back']['vertex-colors'] = webgl_vertexcolorarray({
          'random-colors': true,
        });
        args['bottom']['vertex-colors'] = webgl_vertexcolorarray({
          'random-colors': true,
        });
        args['front']['vertex-colors'] = webgl_vertexcolorarray({
          'random-colors': true,
        });
        args['left']['vertex-colors'] = webgl_vertexcolorarray({
          'random-colors': true,
        });
        args['right']['vertex-colors'] = webgl_vertexcolorarray({
          'random-colors': true,
        });
        args['top']['vertex-colors'] = webgl_vertexcolorarray({
          'random-colors': true,
        });
    }

    if(args['top']['exclude'] !== true){
        const properties = {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'] + half_size_y,
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'groups': args['groups'],
          'id': args['prefix'] + '-top',
          'vertices': [
            vertices_size_x, 0, -vertices_size_z,
            -vertices_size_x, 0, -vertices_size_z,
            -vertices_size_x, 0, vertices_size_z,
            vertices_size_x, 0, vertices_size_z,
          ],
        };
        Object.assign(
          properties,
          args['all']
        );
        Object.assign(
          properties,
          args['top']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    if(args['bottom']['exclude'] !== true){
        const properties = {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'] - half_size_y,
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'groups': args['groups'],
          'id': args['prefix'] + '-bottom',
          'rotate-x': 180,
          'vertices': [
            vertices_size_x, 0, -vertices_size_z,
            -vertices_size_x, 0, -vertices_size_z,
            -vertices_size_x, 0, vertices_size_z,
            vertices_size_x, 0, vertices_size_z,
          ],
        };
        Object.assign(
          properties,
          args['all']
        );
        Object.assign(
          properties,
          args['bottom']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    if(args['front']['exclude'] !== true){
        const properties = {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'] + half_size_z,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'groups': args['groups'],
          'id': args['prefix'] + '-front',
          'rotate-x': 90,
          'vertices': [
            vertices_size_x, 0, -vertices_size_y,
            -vertices_size_x, 0, -vertices_size_y,
            -vertices_size_x, 0, vertices_size_y,
            vertices_size_x, 0, vertices_size_y,
          ],
        };
        Object.assign(
          properties,
          args['all']
        );
        Object.assign(
          properties,
          args['front']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    if(args['back']['exclude'] !== true){
        const properties = {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'] - half_size_z,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'groups': args['groups'],
          'id': args['prefix'] + '-back',
          'rotate-x': 270,
          'vertices': [
            vertices_size_x, 0, -vertices_size_y,
            -vertices_size_x, 0, -vertices_size_y,
            -vertices_size_x, 0, vertices_size_y,
            vertices_size_x, 0, vertices_size_y,
          ],
        };
        Object.assign(
          properties,
          args['all']
        );
        Object.assign(
          properties,
          args['back']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    if(args['left']['exclude'] !== true){
        const properties = {
          'attach-offset-x': args['translate-x'] - half_size_x,
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'groups': args['groups'],
          'id': args['prefix'] + '-left',
          'rotate-z': 90,
          'vertices': [
            vertices_size_y, 0, -vertices_size_z,
            -vertices_size_y, 0, -vertices_size_z,
            -vertices_size_y, 0, vertices_size_z,
            vertices_size_y, 0, vertices_size_z,
          ],
        };
        Object.assign(
          properties,
          args['all']
        );
        Object.assign(
          properties,
          args['left']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    if(args['right']['exclude'] !== true){
        const properties = {
          'attach-offset-x': args['translate-x'] + half_size_x,
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'groups': args['groups'],
          'id': args['prefix'] + '-right',
          'rotate-z': 270,
          'vertices': [
            vertices_size_y, 0, -vertices_size_z,
            -vertices_size_y, 0, -vertices_size_z,
            -vertices_size_y, 0, vertices_size_z,
            vertices_size_y, 0, vertices_size_z,
          ],
        };
        Object.assign(
          properties,
          args['all']
        );
        Object.assign(
          properties,
          args['right']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }
}

function webgl_primitive_ellipsoid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'color0': [
          1, 1, 1, 1,
        ],
        'color1': [
          0, 1, 0, 1,
        ],
        'groups': [],
        'prefix': entity_id_count,
        'radius-x': 5,
        'radius-y': 5,
        'radius-z': 5,
        'slices-latitude': 10,
        'slices-longitude': 10,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    const latitude_angles = math_degrees_to_radians({
      'degrees': 360 / args['slices-latitude'],
    });
    const longitude_angles = math_degrees_to_radians({
      'degrees': 180 / args['slices-longitude'],
    });
    const longitude_start = math_degrees_to_radians({
      'degrees': -90,
    });

    const properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'collision': false,
      'groups': args['groups'],
    };
    for(let longitude = 0; longitude < args['slices-longitude']; longitude++){
        if(longitude === args['slices-longitude'] / 2){
            const temp_blue = args['color0'][2];
            const temp_green = args['color0'][1];
            const temp_red = args['color0'][0];

            args['color0'][0] = args['color1'][0];
            args['color0'][1] = args['color1'][1];
            args['color0'][2] = args['color1'][2];

            args['color1'][0] = temp_red;
            args['color1'][1] = temp_green;
            args['color1'][2] = temp_blue;
        }

        let pole = 0;
        if(longitude === 0){
            pole = 1;

        }else if(longitude === args['slices-longitude'] - 1){
            pole = -1;
        }

        properties['id'] = args['prefix'] + '-quad-' + longitude;
        properties['vertex-colors'] = [];
        properties['vertices'] = [];

        const longitude_bottom = longitude_start + longitude * longitude_angles;
        const longitude_top = longitude_start + (longitude + 1) * longitude_angles;

        if(pole === 0){
            properties['draw-mode'] = 'TRIANGLE_STRIP';

        }else{
            if(pole === 1){
                properties['vertex-colors'].push(
                  args['color0'][0], args['color0'][1], args['color0'][2], args['color0'][3]
                );

            }else{
                properties['vertex-colors'].push(
                  args['color1'][0], args['color1'][1], args['color1'][2], args['color1'][3]
                );
            }

            properties['vertices'].push(
              0, args['radius-y'] * pole, 0
            );
            properties['draw-mode'] = 'TRIANGLE_FAN';
        }

        for(let latitude = 0; latitude <= args['slices-latitude']; latitude++){
            const rotation = latitude * latitude_angles;

            const xbottom = args['radius-x'] * Math.sin(rotation) * Math.cos(longitude_bottom);
            const ybottom = args['radius-y'] * Math.sin(longitude_bottom);
            const zbottom = args['radius-z'] * Math.cos(rotation) * Math.cos(longitude_bottom);

            const xtop = args['radius-x'] * Math.sin(rotation) * Math.cos(longitude_top);
            const ytop = args['radius-y'] * Math.sin(longitude_top);
            const ztop = args['radius-z'] * Math.cos(rotation) * Math.cos(longitude_top);

            if(pole === 1){
                properties['vertex-colors'].push(
                  args['color1'][0], args['color1'][1], args['color1'][2], args['color1'][3]
                );
                properties['vertices'].push(
                  xtop, -ytop, ztop
                );

            }else if(pole === -1){
                properties['vertex-colors'].push(
                  args['color0'][0], args['color0'][1], args['color0'][2], args['color0'][3]
                );
                properties['vertices'].splice(
                  3,
                  0,
                  xbottom, -ybottom, zbottom
                );

            }else{
                properties['vertex-colors'].push(
                  args['color0'][0], args['color0'][1], args['color0'][2], args['color0'][3],
                  args['color1'][0], args['color1'][1], args['color1'][2], args['color1'][3]
                );
                properties['vertices'].push(
                  xtop, ytop, ztop,
                  xbottom, ybottom, zbottom
                );
            }
        }

        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }
}

function webgl_primitive_frustum(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bottom': true,
        'character': webgl_character_id,
        'color-bottom': [
          1, 1, 1, 1,
        ],
        'color-top': [
          0, 1, 0, 1,
        ],
        'length': 2,
        'middle': true,
        'points': 8,
        'prefix': entity_id_count,
        'size-bottom': 2,
        'size-top': 1,
        'top': true,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    const rotation = math_degrees_to_radians({
      'degrees': 360 / args['points'],
    });
    const properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'collision': false,
      'draw-mode': 'TRIANGLE_FAN',
    };

    if(args['points'] === 1
      || (args['size-bottom'] === 0 && args['size-top'] === 0)){
        properties['draw-mode'] = 'LINES';
        properties['id'] = args['prefix'];
        properties['vertex-colors'] = [
          args['color-top'][0], args['color-top'][1], args['color-top'][2], args['color-top'][3],
          args['color-bottom'][0], args['color-bottom'][1], args['color-bottom'][2], args['color-bottom'][3],
        ];
        properties['vertices'] = [
          0, args['length'], 0,
          0, 0, 0,
        ];

        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
        return;
    }

    if(args['bottom']){
        properties['id'] = args['prefix'] + '-bottom';
        properties['vertex-colors'] = [
          args['color-bottom'][0], args['color-bottom'][1], args['color-bottom'][2], args['color-bottom'][3],
        ];
        properties['vertices'] = [
          0, 0, 0,
        ];
        for(let i = 0; i <= args['points']; i++){
            const point_rotation = -i * rotation;

            if(args['size-bottom'] === 0){
                properties['vertex-colors'].push(
                  args['color-top'][0], args['color-top'][1], args['color-top'][2], args['color-top'][3]
                );
                properties['vertices'].push(
                  args['size-top'] * Math.sin(point_rotation),
                  args['length'],
                  args['size-top'] * Math.cos(point_rotation)
                );

            }else{
                properties['vertex-colors'].push(
                  args['color-bottom'][0], args['color-bottom'][1], args['color-bottom'][2], args['color-bottom'][3]
                );
                properties['vertices'].push(
                  args['size-bottom'] * Math.sin(point_rotation),
                  0,
                  args['size-bottom'] * Math.cos(point_rotation)
                );
            }
        }
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    if(args['top']){
        properties['id'] = args['prefix'] + '-top';
        properties['vertex-colors'] = [
          args['color-top'][0], args['color-top'][1], args['color-top'][2], args['color-top'][3],
        ];
        properties['vertices'] = [
          0, args['length'], 0,
        ];
        for(let i = 0; i <= args['points']; i++){
            const point_rotation = i * rotation;

            if(args['size-top'] === 0){
                properties['vertex-colors'].push(
                  args['color-bottom'][0], args['color-bottom'][1], args['color-bottom'][2], args['color-bottom'][3]
                );
                properties['vertices'].push(
                  args['size-bottom'] * Math.sin(point_rotation),
                  0,
                  args['size-bottom'] * Math.cos(point_rotation)
                );

            }else{
                properties['vertex-colors'].push(
                  args['color-top'][0], args['color-top'][1], args['color-top'][2], args['color-top'][3]
                );
                properties['vertices'].push(
                  args['size-top'] * Math.sin(point_rotation),
                  args['length'],
                  args['size-top'] * Math.cos(point_rotation)
                );
            }
        }
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    if(args['middle']
      && args['size-bottom'] !== 0
      && args['size-top'] !== 0){
        properties['draw-mode'] = 'TRIANGLE_STRIP';
        properties['id'] = args['prefix'] + '-middle';
        properties['vertex-colors'] = [
          args['color-top'][0], args['color-top'][1], args['color-top'][2],args['color-top'][3],
        ];
        properties['vertices'] = [
          args['size-top'] * Math.sin(rotation),
          args['length'],
          args['size-top'] * Math.cos(rotation),
        ];
        for(let i = 0; i <= args['points']; i++){
            const point_rotation = i * rotation;
            const next_rotation = (i + 1) * rotation;

            properties['vertex-colors'].push(
              args['color-bottom'][0], args['color-bottom'][1], args['color-bottom'][2], args['color-bottom'][3],
              args['color-top'][0], args['color-top'][1], args['color-top'][2], args['color-top'][3]
            );
            properties['vertices'].push(
              args['size-bottom'] * Math.sin(point_rotation),
              0,
              args['size-bottom'] * Math.cos(point_rotation),
              args['size-top'] * Math.sin(next_rotation),
              args['length'],
              args['size-top'] * Math.cos(next_rotation)
            );
        }
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }
}

// Required args: shaders
function webgl_program_create(args){
    const program = webgl_buffer.createProgram();
    for(const shader in args['shaders']){
        webgl_buffer.attachShader(
          program,
          args['shaders'][shader]
        );
    }
    webgl_buffer.linkProgram(program);
    webgl_buffer.useProgram(program);

    return program;
}

function webgl_resize(){
    webgl_properties['canvas']['height'] = globalThis.innerHeight;
    webgl_properties['canvas']['height-half'] = webgl_properties['canvas']['height'] / 2;
    core_elements['buffer'].height = webgl_properties['canvas']['height'];
    core_elements['canvas'].height = webgl_properties['canvas']['height'];

    webgl_properties['canvas']['width'] = globalThis.innerWidth;
    webgl_properties['canvas']['width-half'] = webgl_properties['canvas']['width'] / 2;
    core_elements['buffer'].width = webgl_properties['canvas']['width'];
    core_elements['canvas'].width = webgl_properties['canvas']['width'];

    webgl_buffer.viewportHeight = webgl_properties['canvas']['height'];
    webgl_buffer.viewportWidth = webgl_properties['canvas']['width'];
    webgl_buffer.viewport(
      0,
      0,
      webgl_properties['canvas']['width'],
      webgl_properties['canvas']['height']
    );

    Object.assign(
      webgl_buffer,
      webgl_properties['canvas']
    );

    webgl_perspective();
    webgl_uniform_update();
    if(core_menu_open){
        webgl_draw();
    }
}

// Required args: todo, x, y
function webgl_scissor(args){
    args = core_args({
      'args': args,
      'defaults': {
        'height': 1,
        'width': 1,
      },
    });

    webgl_buffer.enable(webgl_buffer.SCISSOR_TEST);
    webgl_buffer.scissor(
      args['x'],
      globalThis.innerHeight - args['y'],
      args['width'],
      args['height']
    );

    const result = args['todo']();

    webgl_buffer.disable(webgl_buffer.SCISSOR_TEST);

    return result;
}

// Required args: source, type
function webgl_shader_create(args){
    const shader = webgl_buffer.createShader(args['type']);
    webgl_buffer.shaderSource(
      shader,
      args['source']
    );
    webgl_buffer.compileShader(shader);

    return shader;
}

function webgl_shader_recreate(){
    if(webgl_shaders === false){
        webgl_shaders = {
          'fragment-0': `
precision lowp float;
uniform bool fog;
uniform bool picking;
uniform bool textures;
uniform float float_fogDensity;
uniform sampler2D sampler;
uniform vec3 vec_clearColor;
varying vec2 vec_textureCoord;
varying vec4 vec_fragmentColor;
varying vec4 vec_lighting;
varying vec4 vec_position;
void main(void){
    if(picking){
        gl_FragColor = vec_fragmentColor;
    }else{
        gl_FragColor = vec_fragmentColor * vec_lighting;
        if(textures){
            gl_FragColor *= texture2D(sampler, vec_textureCoord);
        }
        if(fog){
            float distance = length(vec_position.xyz);
            gl_FragColor.rgb = vec3(mix(
              vec_clearColor,
              gl_FragColor.rgb,
              clamp(exp(float_fogDensity * distance * -distance), 0.0, 1.0)
            ));
        }
    }
}`,

          'vertex-0': `
attribute vec2 vec_texturePosition;
attribute vec3 vec_vertexNormal;
attribute vec4 vec_pickColor;
attribute vec4 vec_vertexColor;
attribute vec3 vec_vertexPosition;
uniform bool directional;
uniform bool picking;
uniform bool textures;
uniform float alpha;
uniform mat4 mat_cameraMatrix;
uniform mat4 mat_perspectiveMatrix;
uniform vec3 vec_ambientColor;
uniform vec3 vec_directionalColor;
uniform vec3 vec_directionalVector;
varying vec2 vec_textureCoord;
varying vec4 vec_fragmentColor;
varying vec4 vec_lighting;
varying vec4 vec_position;
void main(void){
    vec_position = mat_cameraMatrix * vec4(vec_vertexPosition, 1.0);
    gl_Position = mat_perspectiveMatrix * vec_position;
    gl_PointSize = 500. / length(vec_position.xyz);
    vec_textureCoord = vec_texturePosition;
    vec3 lighting = vec_ambientColor;
    if(directional){
        vec4 transformedNormal = mat_perspectiveMatrix * vec4(vec_vertexNormal, 1.0);
        lighting += vec_directionalColor * max(dot(transformedNormal.xyz, normalize(vec_directionalVector)), 0.0);
    }
    vec_lighting = vec4(lighting, alpha);
    if(picking){
        vec_fragmentColor = vec_pickColor;
    }else{
        vec_fragmentColor = vec_vertexColor;
    }
}`,
        };
    }

    if(webgl_properties['shader']['program'] !== 0){
        webgl_buffer.deleteProgram(webgl_properties['shader']['program']);
    }

    webgl_properties['shader']['program'] = webgl_program_create({
      'shaders': [
        webgl_shader_create({
          'source': webgl_shaders[webgl_properties['shader-fragment']],
          'type': webgl_buffer.FRAGMENT_SHADER,
        }),
        webgl_shader_create({
          'source': webgl_shaders[webgl_properties['shader-vertex']],
          'type': webgl_buffer.VERTEX_SHADER,
        }),
      ],
    });

    webgl_vertexattribarray_set({
      'attributes': [
        'vec_pickColor',
        'vec_texturePosition',
        'vec_vertexColor',
        'vec_vertexNormal',
        'vec_vertexPosition',
      ],
      'program': webgl_properties['shader']['program'],
    });

    const locations = {
      'alpha': 'alpha',
      'ambient-color': 'vec_ambientColor',
      'clear-color': 'vec_clearColor',
      'directional': 'directional',
      'directional-color': 'vec_directionalColor',
      'directional-vector': 'vec_directionalVector',
      'fog-density': 'float_fogDensity',
      'fog-state': 'fog',
      'picking': 'picking',
      'mat_cameraMatrix': 'mat_cameraMatrix',
      'mat_perspectiveMatrix': 'mat_perspectiveMatrix',
      'sampler': 'sampler',
      'textures': 'textures',
    };
    for(const location in locations){
        webgl_properties['shader'][location] = webgl_buffer.getUniformLocation(
          webgl_properties['shader']['program'],
          locations[location]
        );
    }
}

// Required args: stat, target
function webgl_stat_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'has': true,
        'set': false,
        'value': 1,
      },
    });

    if(args['stat'].startsWith('rotate-')
      || args['stat'].startsWith('camera-rotate-')){
        const rotate_args = {
          'camera': args['stat'].startsWith('camera-rotate-'),
          'character': args['target']['id'],
          'mouse': false,
          'set': args['set'],
        };
        rotate_args[args['stat'].slice(args['stat'].length - 1)] = args['value'];
        webgl_camera_rotate(rotate_args);
        return;

    }else if(args['stat'] === 'vertex-colors'){
        args['target']['vertex-colors'] = webgl_vertexcolorarray({
          'random-colors': true,
        });
        webgl_entity_todo(args['target']['id']);
        return;

    }else if(args['target'][args['stat']] === void 0){
        if(args['has']){
            return;
        }

        args['target'][args['stat']] = 0;
    }

    args['target'][args['stat']] = (args['set'] || typeof args['value'] === 'string')
      ? args['value']
      : args['target'][args['stat']] + args['value'];

    if(args['stat'] === 'health-current'){
        if(webgl_character_level({
            'character': args['target']['id'],
          }) === -1){
            args['target']['health-current'] = args['target']['health-max'];

            return;
        }

        if(args['target']['health-current'] <= 0){
            args['target']['health-current'] = 0;

            for(const entity in entity_entities){
                if(entity_entities[entity]['attach-to'] === args['character']){
                   entity_entities[entity]['attach-to'] = false;
                }
            }

        }else if(args['target']['health-current'] > args['target']['health-max']){
            args['target']['health-current'] = args['target']['health-max'];

        }
    }
}

function webgl_storage_init(){
    core_tab_create({
      'content': '<table><tr><td><input class=mini id=anisotropic min=0 step=any type=number><td>Anisotropic Filtering</table>'
        + '<input id=storage-reset-webgl type=button value="Reset WebGL localStorage">',
      'group': 'core-menu',
      'id': 'webgl',
      'label': 'WebGL',
    });

    core_storage_add({
      'prefix': 'webgl-',
      'storage': {
        'anisotropic': 16,
      },
    });
    core_storage_update();

    core_events_bind({
      'elements': {
        'storage-reset-webgl': {
          'onclick': function(){
              core_storage_reset({
                'label': 'WebGL',
                'prefix': 'webgl-',
              });
          },
        },
      },
    });
}

// Required args: entity
function webgl_texture_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'texture': 'default.png',
      },
    });

    if(!core_images[args['texture']]){
        core_image({
          'id': args['texture'],
          'src': uris[args['texture']],
        });
    }

    entity_entities[args['entity']]['texture-gl'] = webgl_buffer.createTexture();

    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      entity_entities[args['entity']]['texture-gl']
    );
    webgl_buffer.texImage2D(
      webgl_buffer.TEXTURE_2D,
      0,
      webgl_buffer.RGBA,
      webgl_buffer.RGBA,
      webgl_buffer.UNSIGNED_BYTE,
      core_images[args['texture']]
    );

    webgl_buffer.texParameterf(
      webgl_buffer.TEXTURE_2D,
      webgl_extensions['anisotropic'].TEXTURE_MAX_ANISOTROPY_EXT,
      core_storage_data['anisotropic']
    );

    webgl_buffer.generateMipmap(webgl_buffer.TEXTURE_2D);

    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      void 0
    );
}

function webgl_uniform_update(){
    webgl_buffer.uniform3f(
      webgl_properties['shader']['ambient-color'],
      webgl_properties['ambient-red'],
      webgl_properties['ambient-green'],
      webgl_properties['ambient-blue']
    );
    webgl_buffer.uniform3f(
      webgl_properties['shader']['clear-color'],
      webgl_properties['clearcolor-red'],
      webgl_properties['clearcolor-green'],
      webgl_properties['clearcolor-blue']
    );
    webgl_buffer.uniform1i(
      webgl_properties['shader']['directional'],
      webgl_properties['directional-state']
    );
    webgl_buffer.uniform3f(
      webgl_properties['shader']['directional-color'],
      webgl_properties['directional-red'],
      webgl_properties['directional-green'],
      webgl_properties['directional-blue']
    );
    webgl_buffer.uniform3fv(
      webgl_properties['shader']['directional-vector'],
      webgl_properties['directional-vector']
    );
    webgl_buffer.uniform1f(
      webgl_properties['shader']['fog-density'],
      webgl_properties['fog-density']
    );
    webgl_buffer.uniform1i(
      webgl_properties['shader']['fog-state'],
      webgl_properties['fog-state']
    );
    webgl_buffer.uniformMatrix4fv(
      webgl_properties['shader']['mat_perspectiveMatrix'],
      false,
      math_matrices['perspective']
    );
    webgl_buffer.uniform1i(
      webgl_properties['shader']['picking'],
      webgl_properties['picking']
    );
    webgl_buffer.uniform1i(
      webgl_properties['shader']['textures'],
      webgl_properties['textures']
    );
}

// Required args: attributes, program
function webgl_vertexattribarray_set(args){
    for(const attribute in args['attributes']){
        webgl_properties['attributes'][args['attributes'][attribute]] = webgl_buffer.getAttribLocation(
          args['program'],
          args['attributes'][attribute]
        );
        webgl_buffer.enableVertexAttribArray(webgl_properties['attributes'][args['attributes'][attribute]]);
    }
}

function webgl_vertexcolorarray(args){
    args = core_args({
      'args': args,
      'defaults': {
        'random-colors': false,
        'rgbarray': [],
        'vertexcount': 4,
      },
    });

    if(args['rgbarray'].length === 0){
        args['rgbarray'].push(args['random-colors']
          ? core_random_rgb()
          : {
              'blue': 255,
              'green': 255,
              'red': 255,
            }
        );
    }

    const color = [];
    for(let i = 0; i < args['vertexcount']; i++){
        const index = args['rgbarray'][i] !== void 0
          ? i
          : 0;

        color.push(
          args['rgbarray'][index]['red'] / 255,
          args['rgbarray'][index]['green'] / 255,
          args['rgbarray'][index]['blue'] / 255,
          1
        );
    }

    return color;
}

globalThis.webgl_buffer = 0;
globalThis.webgl_canvas = 0;
globalThis.webgl_character_count = 0;
globalThis.webgl_character_homebase = {};
globalThis.webgl_character_id = '_me';
globalThis.webgl_characters = {};
globalThis.webgl_diagonal = 0;
globalThis.webgl_extensions = {};
globalThis.webgl_levelcache = {};
globalThis.webgl_paths = {};
globalThis.webgl_properties = {};
globalThis.webgl_shaders = false;
globalThis.webgl_text = {};
