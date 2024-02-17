'use strict';

function webgl_billboard(entity){
    const translation = webgl_get_translation(entity_entities[entity]);

    entity_entities[entity]['rotate-y'] = 360 - math_radians_to_degrees(Math.PI / 2 + Math.atan2(
      translation['z'] - webgl_characters[webgl_character_id]['camera-z'],
      translation['x'] - webgl_characters[webgl_character_id]['camera-x'],
    ));
}

// Required args: attribute, data, size
function webgl_buffer_set(args){
    const buffer = webgl.createBuffer();
    webgl.bindBuffer(
      webgl.ARRAY_BUFFER,
      buffer
    );
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      new Float32Array(args['data']),
      webgl.STATIC_DRAW
    );
    webgl.vertexAttribPointer(
      webgl_attributes[args['attribute']],
      args['size'],
      webgl.FLOAT,
      false,
      0,
      0
    );
    webgl.enableVertexAttribArray(webgl_attributes[args['attribute']]);
    return buffer;
}

function webgl_camera_handle(){
    const level = webgl_character_level();
    if(level < -1){
        return;
    }

    if(core_mouse['pointerlock-state']
      || core_mouse['down-0']
      || core_mouse['down-2']){
        if(level !== -1 && webgl_properties['paused']){
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

    const axes = 'xyz';
    const prefix = args['camera']
      ? 'camera-rotate-'
      : 'rotate-';
    for(const axis in axes){
        let axis_value = args[axes[axis]];
        if(axis_value === false){
            continue;
        }

        if(!args['set']){
            axis_value += webgl_characters[args['character']][prefix + axes[axis]];
        }

        webgl_characters[args['character']][prefix + axes[axis]] = axis_value;
    }

    if(args['camera']){
        const mouse_check = core_mouse['down-2']
          || (!core_mouse['down-0']
            && !core_mouse['down-2'])
          || !args['mouse'];

        if(webgl_characters[args['character']]['camera-zoom'] === 0
          || (mouse_check
            && webgl_character_level(args['character']) > -2
            && webgl_characters[args['character']]['health'] > 0)){
            webgl_characters[args['character']]['rotate-y'] = core_mouse['down-2']
              ? webgl_characters[args['character']]['camera-rotate-y']
              : args['set']
                ? args['y']
                : webgl_characters[args['character']]['rotate-y'] + args['y'];
        }
    }

    for(const entity in entity_entities){
        if(entity_entities[entity]['attach-to'] === args['character']){
            webgl_entity_normals(entity);
        }
    }
}

function webgl_camera_zoom(event){
    if(webgl_character_level() < -1){
        return;
    }

    const character = webgl_characters[webgl_character_id];
    if(event.deltaY > 0){
        character['camera-zoom'] = core_key_shift
          ? webgl_properties['camera-zoom-max']
          : Math.min(
              character['camera-zoom'] + 1,
              webgl_properties['camera-zoom-max']
            );

    }else{
        character['camera-zoom'] = core_key_shift
          ? 0
          : Math.max(
              character['camera-zoom'] - 1,
              0
            );
    }
}

function webgl_character_controls(id){
    const level = webgl_character_level(id);
    if(level < -1){
        return;
    }

    if(webgl_characters[id]['controls'] === 'rpg'){
        if((level === -1 || !webgl_properties['paused'])
          && webgl_characters[id]['health'] > 0
          && webgl_characters[id]['path-id'].length === 0){
            if(id !== webgl_character_id){
                if(webgl_characters[id]['automove']
                  && webgl_characters[id]['jump-allow']){
                    webgl_character_move({
                      'id': id,
                      'multiplier': -1,
                    });
                }

                return;
            }

            let leftright = 0;

            if(core_keys[core_storage_data['move-←']]['state']){
                if(webgl_characters[id]['camera-zoom'] === 0
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
                if(webgl_characters[id]['camera-zoom'] === 0
                  || core_mouse['down-2']){
                    leftright += 1;

                }else{
                    webgl_camera_rotate({
                      'camera': !core_mouse['down-0'],
                      'y': 5,
                    });
                }
            }

            if(level === -1 || webgl_characters[id]['jump-allow']){
                let forwardback = 0;

                if(core_keys[core_storage_data['move-↓']]['state']){
                    webgl_characters[id]['automove'] = false;
                    if(level === -1){
                        forwardback = 1;

                    }else{
                        forwardback = .5;
                        leftright *= .5;
                    }
                }

                if(core_keys[core_storage_data['move-↑']]['state']
                  || (core_mouse['down-0'] && core_mouse['down-2'])){
                    webgl_characters[id]['automove'] = false;
                    forwardback -= 1;

                }else if(webgl_characters[id]['automove']){
                    forwardback -= 1;
                }

                if(core_keys[core_storage_data['crouch']]['state']){
                    if(level === -1){
                        webgl_character_move({
                          'id': id,
                          'strafe': true,
                          'y': true,
                        });

                    }else{
                        forwardback *= .1;
                        leftright *= .1;
                    }
                }

                if(core_keys[core_storage_data['jump']]['state']){
                    if(level === -1){
                        webgl_character_move({
                          'id': id,
                          'y': true,
                        });

                    }else{
                        webgl_character_jump(id);
                    }
                }

                if(forwardback !== 0
                  && leftright !== 0){
                    forwardback *= .7071067811865475;
                    leftright *= .7071067811865475;
                }

                if(forwardback !== 0){
                    webgl_character_move({
                      'id': id,
                      'multiplier': forwardback,
                    });
                }
                if(leftright !== 0){
                    webgl_character_move({
                      'id': id,
                      'multiplier': leftright,
                      'strafe': true,
                    });
                }
            }
        }
    }
}

function webgl_character_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'automove': false,
        'camera-lock': true,
        'camera-zoom': 50,
        'change-rotate-x': 0,
        'change-rotate-y': 0,
        'change-rotate-z': 0,
        'change-translate-x': 0,
        'change-translate-y': 0,
        'change-translate-z': 0,
        'collide-range-xz': 2,
        'collide-range-y': 3,
        'collides': false,
        'controls': '',
        'entities': [],
        'experience': 0,
        'gravity': false,
        'health': 1,
        'health-max': 1,
        'id': webgl_character_id,
        'jump-height': 1,
        'level': -2,
        'lives': -1,
        'path-direction': 1,
        'path-end': '',
        'path-id': '',
        'path-point': 0,
        'reticle': '#fff',
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'speed': 1,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    webgl_characters[args['id']] = {
      'automove': args['automove'],
      'camera-lock': args['camera-lock'],
      'camera-rotate-x': 0,
      'camera-rotate-y': 0,
      'camera-rotate-z': 0,
      'camera-x': args['translate-x'],
      'camera-y': args['translate-y'],
      'camera-z': args['translate-z'],
      'camera-zoom': Math.min(
        args['camera-zoom'],
        webgl_properties['camera-zoom-max']
      ),
      'change-rotate-x': args['change-rotate-x'],
      'change-rotate-y': args['change-rotate-y'],
      'change-rotate-z': args['change-rotate-z'],
      'change-translate-x': args['change-translate-x'],
      'change-translate-y': args['change-translate-y'],
      'change-translate-z': args['change-translate-z'],
      'collide-range-xz': args['collide-range-xz'],
      'collide-range-y': args['collide-range-y'],
      'collides': args['collides'],
      'controls': args['controls'],
      'experience': args['experience'],
      'gravity': args['gravity'],
      'health': Math.max(
        args['health'],
        1
      ),
      'health-max': args['health-max'],
      'id': args['id'],
      'jump-allow': false,
      'jump-height': args['jump-height'],
      'level': args['level'],
      'lives': args['lives'],
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
    webgl_character_count++;

    webgl_entity_create({
      'character': args['id'],
      'entities': args['entities'],
    });
}

function webgl_character_jump(id){
    if(!webgl_characters[id]['jump-allow']
      || webgl_characters[id]['health'] <= 0){
        return;
    }

    webgl_characters[id]['jump-allow'] = false;
    webgl_characters[id]['change-translate-y'] = webgl_characters[id]['jump-height'];
}

function webgl_character_level(id){
    if(id === void 0){
        id = webgl_character_id;
    }

    if(webgl_characters[id]){
        return webgl_characters[id]['level'];
    }

    return -3;
}

function webgl_character_move(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': webgl_character_id,
        'multiplier': 1,
        'strafe': false,
        'y': false,
      },
    });

    if(args['y']){
        webgl_characters[args['id']]['change-translate-y'] += webgl_characters[args['id']]['speed'] * args['multiplier'] * (args['strafe']
          ? -1
          : 1);

    }else{
        const movement = math_move_3d({
          'angle': webgl_characters[args['id']]['rotate-y'],
          'speed': webgl_characters[args['id']]['speed'] * args['multiplier'],
          'strafe': args['strafe'],
        });

        webgl_characters[args['id']]['change-translate-x'] += movement['x'];
        webgl_characters[args['id']]['change-translate-z'] += movement['z'];
    }
}

function webgl_character_origin(id){
    if(id === void 0){
        id = webgl_character_id;
    }
    if(webgl_characters[id] === void 0){
        return;
    }

    webgl_characters[id]['camera-rotate-x'] = 0;
    webgl_characters[id]['camera-rotate-y'] = 0;
    webgl_characters[id]['camera-rotate-z'] = 0;
    webgl_characters[id]['change-rotate-x'] = 0;
    webgl_characters[id]['change-rotate-y'] = 0;
    webgl_characters[id]['change-rotate-z'] = 0;
    webgl_characters[id]['change-translate-x'] = 0;
    webgl_characters[id]['change-translate-y'] = 0;
    webgl_characters[id]['change-translate-z'] = 0;
    webgl_characters[id]['jump-allow'] = false;
    webgl_characters[id]['rotate-x'] = 0;
    webgl_characters[id]['rotate-y'] = 0;
    webgl_characters[id]['rotate-z'] = 0;

    webgl_entity_move_to({
      'entity': webgl_characters[id],
    });
}

function webgl_character_random(args){
    args = core_args({
      'args': args,
      'defaults': {
        'height-base': 2,
        'height-random': 5,
        'id': webgl_character_count,
        'jump-height': 1,
        'level': 0,
        'lives': -1,
        'speed': 1,
        'width-base': 2,
        'width-random': 2,
      },
    });

    const xz = Math.random() * args['width-random'] + args['width-base'];
    const y = Math.random() * args['height-random'] + args['height-base'];

    webgl_character_init({
      'collide-range-xz': xz,
      'collide-range-y': y,
      'collides': true,
      'controls': 'rpg',
      'gravity': true,
      'id': args['id'],
      'jump-height': args['jump-height'],
      'level': args['level'],
      'lives': args['lives'],
      'speed': args['speed'],
    });
    webgl_primitive_cuboid({
      'all': {
        'collision': false,
      },
      'character': args['id'],
      'size-x': xz * 2,
      'size-y': y * 2,
      'size-z': xz * 2,
    });
    webgl_character_spawn();
}

function webgl_character_set(id){
    webgl_character_id = id;

    entity_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          entity_entities[entity]['attach-to'] = webgl_character_id;
      },
    });
}

function webgl_character_spawn(id){
    if(id === void 0){
        id = webgl_character_id;
    }
    if(webgl_characters[id] === void 0
      || webgl_characters[id]['lives'] === 0){
        return;
    }

    webgl_characters[id]['health'] = webgl_characters[id]['health-max'];

    webgl_character_origin(id);
    webgl_entity_move_to({
      'entity': webgl_characters[id],
      'x': webgl_properties['spawn-translate-x'],
      'y': webgl_properties['spawn-translate-y'] + webgl_characters[id]['collide-range-y'] + 1,
      'z': webgl_properties['spawn-translate-z'],
    });
    webgl_camera_rotate({
      'character': id,
      'set': true,
      'x': webgl_properties['spawn-rotate-x'],
      'y': webgl_properties['spawn-rotate-y'],
      'z': webgl_properties['spawn-rotate-z'],
    });
    if(webgl_properties['spawn-path-id'].length > 0){
        webgl_path_use({
          'id': id,
          'path-id': webgl_properties['spawn-path-id'],
        });
    }
}

function webgl_clamp_rotation(entity){
    const axes = 'xyz';
    const character = entity['camera-rotate-x'] !== void 0;

    for(const axis in axes){
        const property = 'rotate-' + axes[axis];

        if(character){
            entity['camera-' + property] = math_clamp({
              'max': 360,
              'min': 0,
              'value': entity['camera-' + property],
              'wrap': true,
            });
        }

        entity[property] = math_clamp({
          'max': 360,
          'min': 0,
          'value': entity[property],
          'wrap': true,
        });
    }

    if(character){
        const max = entity['camera-rotate-x'] > 180
          ? 360
          : 90;
        entity['camera-rotate-x'] = math_clamp({
          'max': max,
          'min': max - 90,
          'value': entity['camera-rotate-x'],
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
    webgl.clearColor(
      webgl_properties['clearcolor-red'],
      webgl_properties['clearcolor-green'],
      webgl_properties['clearcolor-blue'],
      1
    );
}

// Required args: collider, target
function webgl_collision(args){
    const collider_position = webgl_get_translation(args['collider']);
    let collision = false;
    let collision_sign = 1;
    const range = {
      'x': args['collider']['collide-range-xz'] + Math.abs(args['collider']['change-translate-x']),
      'y': args['collider']['collide-range-y'] + Math.abs(args['collider']['change-translate-y']),
      'z': args['collider']['collide-range-xz'] + Math.abs(args['collider']['change-translate-z']),
    };
    const target_position = webgl_get_translation(args['target']);

    if(args['target']['normals'][0] !== 0){
        const normal_sign = Math.sign(args['target']['normals'][0]);
        if(args['target']['normals'][0] % 1 === 0
          && normal_sign !== Math.sign(args['collider']['change-translate-x'])
          && collider_position['x'] > target_position['x'] - (normal_sign === -1 ? range['x'] : 0)
          && collider_position['x'] < target_position['x'] + (normal_sign === 1 ? range['x'] : 0)
          && collider_position['y'] > target_position['y'] + args['target']['vertices'][3] - range['y']
          && collider_position['y'] < target_position['y'] + args['target']['vertices'][0] + range['y']
          && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
          && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
            collision = 'x';
            collision_sign = normal_sign;
        }

    }else if(args['target']['normals'][1] !== 0){
        const normal_sign = Math.sign(args['target']['normals'][1]);
        if(args['target']['normals'][1] % 1 === 0
          && normal_sign !== Math.sign(args['collider']['change-translate-y'])
          && collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
          && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
          && collider_position['y'] > target_position['y'] - (normal_sign === -1 ? range['y'] : 0)
          && collider_position['y'] < target_position['y'] + (normal_sign === 1 ? range['y'] : 0)
          && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
          && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
            collision = 'y';
            collision_sign = normal_sign;
        }

    }else if(args['target']['normals'][2] !== 0){
        const normal_sign = Math.sign(args['target']['normals'][2]);
        if(args['target']['normals'][2] % 1 === 0
          && normal_sign !== Math.sign(args['collider']['change-translate-z'])
          && collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
          && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
          && collider_position['y'] > target_position['y'] + args['target']['vertices'][2] - range['y']
          && collider_position['y'] < target_position['y'] + args['target']['vertices'][8] + range['y']
          && collider_position['z'] > target_position['z'] - (normal_sign === -1 ? range['z'] : 0)
          && collider_position['z'] < target_position['z'] + (normal_sign === 1 ? range['z'] : 0)){
            collision = 'z';
            collision_sign = normal_sign;
        }
    }

    if(collision !== false){
        if(Math.abs(target_position[collision] - collider_position[collision]) < range[collision]){
            const range_axis = collision === 'y'
              ? 'y'
              : 'xz';

            args['collider']['translate-' + collision] = target_position[collision] + args['collider']['collide-range-' + range_axis] * collision_sign;
            args['collider']['change-translate-' + collision] = 0;

            if(collision === 'y'){
                if(args['collider']['jump-allow'] === false
                  && webgl_properties['gravity-max'] / webgl_properties['gravity-max'] === collision_sign){
                    args['collider']['jump-allow'] = true;
                }

                if(args['target']['attach-to']){
                    args['collider']['change-translate-x'] += webgl_characters[args['target']['attach-to']]['change-translate-x'];
                    args['collider']['change-translate-z'] += webgl_characters[args['target']['attach-to']]['change-translate-z'];
                }
            }
        }

        if(args['target']['event-range'] === 0){
            webgl_event({
              'parent': args['target'],
              'target': args['collider'],
            });
        }
    }
}

function webgl_context(id){
    return document.getElementById(id).getContext(
      'webgl2',
      {
        'alpha': false,
        'antialias': true,
        'depth': true,
        'desynchronized': false,
        'failIfMajorPerformanceCaveat': false,
        'powerPreference': 'low-power',
        'premultipliedAlpha': false,
        'preserveDrawingBuffer': false,
        'stencil': false,
      }
    );
}

function webgl_context_lost(event){
    event.preventDefault();
    webgl_context_valid = false;

    core_interval_pause_all();
    webgl = 0;
    webgl_shader = {};
    webgl_textures = {};
    webgl_textures_animated = {};
}

function webgl_context_restored(event){
    webgl_init();
    webgl_uniform_update();

    for(const entity in entity_entities){
        webgl_entity_init(entity);
    }

    webgl_context_valid = true;

    if(core_menu_open){
        core_escape();

    }else{
        core_interval_resume_all();
    }
}

function webgl_cursor_set(cursor){
    webgl_properties['cursor'] = cursor;
    webgl.canvas.style.cursor = cursor;
}

function webgl_draw(){
    if(!webgl_context_valid
      || webgl === 0){
        return;
    }

    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    webgl.disable(webgl.DEPTH_TEST);
    entity_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          webgl_draw_entity(entity);
      },
    });
    webgl.enable(webgl.DEPTH_TEST);

    entity_group_modify({
      'groups': [
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
        'foreground',
      ],
      'todo': function(entity){
          if(entity_entities[entity]['alpha'] < 1){
              webgl_draw_entity(entity);
          }
      },
    });
}

function webgl_draw_entity(entity){
    if(!entity_entities[entity]['draw']){
        return;
    }

    webgl.bindVertexArray(entity_entities[entity]['vao']);

    webgl.bindTexture(
      webgl.TEXTURE_2D,
      entity_entities[entity]['texture-animated']
        ? webgl_textures_animated[entity_entities[entity]['texture-id']]['gl']
        : webgl_textures[entity_entities[entity]['texture-id']]
    );
    webgl.uniform1f(
      webgl_shader['alpha'],
      entity_entities[entity]['alpha']
    );
    webgl.uniformMatrix4fv(
      webgl_shader['mat_cameraMatrix'],
      false,
      math_matrices[entity]
    );

    webgl.drawArrays(
      webgl[entity_entities[entity]['draw-mode']],
      0,
      entity_entities[entity]['vertices-length']
    );
}

function webgl_drawloop(){
    webgl_draw();
    core_interval_animationFrame('webgl-animationFrame');
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
        delete entity_entities[entity_id]['groups'];

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

        if(args['entities'][entity]['attach-to'] !== false){
            entity_attach({
              'entity': entity_id,
              'to': args['entities'][entity]['attach-to'],
              'type': args['entities'][entity]['attach-type'],
              'x': args['entities'][entity]['attach-x'],
              'y': args['entities'][entity]['attach-y'],
              'z': args['entities'][entity]['attach-z'],
            });
        }
    }
}

function webgl_entity_init(entity){
    webgl_texture_init({
      'animated': entity_entities[entity]['texture-animated'],
      'id': entity_entities[entity]['texture-id'],
    });

    entity_entities[entity]['id'] = entity;
    entity_entities[entity]['vertices-length'] = entity_entities[entity]['vertices'].length / 3;
    entity_entities[entity]['normals'] = webgl_normals({
      'rotate-x': entity_entities[entity]['rotate-x'],
      'rotate-y': entity_entities[entity]['rotate-y'],
      'rotate-z': entity_entities[entity]['rotate-z'],
      'vertices-length': entity_entities[entity]['vertices-length'],
    });

    const pickData = [];
    const textureData = [];
    for(let i = 0; i < entity_entities[entity]['vertices-length']; i++){
        pickData.push(
          entity_entities[entity]['pick-color'][0],
          entity_entities[entity]['pick-color'][1],
          entity_entities[entity]['pick-color'][2],
        );
        textureData.push(
          entity_entities[entity]['texture-align'][i * 2] * entity_entities[entity]['texture-repeat-x'],
          entity_entities[entity]['texture-align'][i * 2 + 1] * entity_entities[entity]['texture-repeat-y']
        );
    }

    entity_entities[entity]['vao'] = webgl.createVertexArray();
    webgl.bindVertexArray(entity_entities[entity]['vao']);

    webgl_buffer_set({
      'attribute': 'vec_vertexColor',
      'data': webgl_vertexcolorarray({
        'colors': entity_entities[entity]['vertex-colors'],
        'vertexcount': entity_entities[entity]['vertices-length'],
      }),
      'size': 4,
    });
    webgl_buffer_set({
      'attribute': 'vec_vertexNormal',
      'data': entity_entities[entity]['normals'],
      'size': 3,
    });
    webgl_buffer_set({
      'attribute': 'vec_pickColor',
      'data': pickData,
      'size': 3,
    });
    webgl_buffer_set({
      'attribute': 'vec_texturePosition',
      'data': textureData,
      'size': 2,
    });

    webgl_scale({
      'entity': entity,
      'todo': false,
      'x': entity_entities[entity]['scale-x'] === 1 ? false : entity_entities[entity]['scale-x'],
      'y': entity_entities[entity]['scale-y'] === 1 ? false : entity_entities[entity]['scale-y'],
      'z': entity_entities[entity]['scale-z'] === 1 ? false : entity_entities[entity]['scale-z'],
    });
    webgl_buffer_set({
      'attribute': 'vec_vertexPosition',
      'data': entity_entities[entity]['vertices'],
      'size': 3,
    });
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

function webgl_entity_normals(entity){
    let rotate_x = entity_entities[entity]['rotate-x'];
    let rotate_y = entity_entities[entity]['rotate-y'];
    let rotate_z = entity_entities[entity]['rotate-z'];
    if(entity_entities[entity]['attach-to'] !== false){
        const attached_to = globalThis[entity_entities[entity]['attach-type']][entity_entities[entity]['attach-to']];
        rotate_x += attached_to['rotate-x'];
        rotate_y += attached_to['rotate-y'];
        rotate_z += attached_to['rotate-z'];
    }
    entity_entities[entity]['normals'] = webgl_normals({
      'rotate-x': rotate_x,
      'rotate-y': rotate_y,
      'rotate-z': rotate_z,
      'vertices-length': entity_entities[entity]['vertices-length'],
    });

    webgl.bindVertexArray(entity_entities[entity]['vao']);
    webgl_buffer_set({
      'attribute': 'vec_vertexNormal',
      'data': entity_entities[entity]['normals'],
      'size': 3,
    });
}

// Required args: parent, target
function webgl_event(args){
    if(args['parent']['event-target-id'] !== false
      && args['parent']['event-target-id'] !== args['target']['id']){
        return;
    }

    if(args['parent']['event-target-type'] === 'character'){
        if(webgl_character_level(args['target']['id']) < -1){
            return;
        }
    }

    if(args['parent']['event-limit'] !== false){
        args['parent']['event-limit']--;

        if(args['parent']['event-limit'] <= 0){
            args['parent']['event-range'] = false;
        }
    }

    for(const stat in args['parent']['event-modify']){
        const event_modify = args['parent']['event-modify'][stat];
        const event_type = event_modify['type'] || 'entity_entities';

        const target = event_modify['target'] !== void 0
          ? globalThis[event_type][event_modify['target']]
          : args['target'];

        webgl_stat_modify({
          'set': event_modify['set'],
          'stat': event_modify['stat'],
          'target': target,
          'value': event_modify['value'],
        });
    }

    if(args['parent']['event-todo'] !== false){
        const todo_args = args['parent']['event-todo-args'] === void 0
          ? void 0
          : args['parent']['event-todo-args'];

        if(core_type(globalThis[args['parent']['event-todo']]) === 'function'){
            globalThis[args['parent']['event-todo']](todo_args);

        }else{
            globalThis[args['parent']['event-todo']] = todo_args;
        }
    }
}

function webgl_get_translation(entity){
    if(entity['attach-to'] === void 0
      || entity['attach-to'] === false){
        return {
          'x': entity['translate-x'],
          'y': entity['translate-y'],
          'z': entity['translate-z'],
        };
    }

    const target = globalThis[entity['attach-type']][entity['attach-to']];
    return {
      'x': target['translate-x'] + entity['attach-x'],
      'y': target['translate-y'] + entity['attach-y'],
      'z': target['translate-z'] + entity['attach-z'],
    };
}

function webgl_init(){
    const canvas = core_html({
      'parent': document.body,
      'properties': {
        'id': 'canvas',
      },
      'type': 'canvas',
    });
    canvas.addEventListener(
      'webglcontextlost',
      webgl_context_lost,
      false
    );
    canvas.addEventListener(
      'webglcontextrestored',
      webgl_context_restored,
      false
    );
    webgl = webgl_context('canvas');

    math_matrices['camera'] = math_matrix_create();
    math_matrices['perspective'] = math_matrix_create();
    math_matrices['perspective'][5] = 1;
    math_matrices['perspective'][10] = -1;
    math_matrices['perspective'][11] = -1;
    math_matrices['perspective'][14] = -2;

    webgl.enable(webgl.BLEND);
    webgl.enable(webgl.CULL_FACE);
    webgl.enable(webgl.DEPTH_TEST);

    webgl.blendFunc(
      webgl.SRC_ALPHA,
      webgl.ONE_MINUS_SRC_ALPHA
    );

    entity_set({
      'default': true,
      'groups': [
        'foreground',
      ],
      'properties': {
        'alpha': 1,
        'attach-to': false,
        'attach-type': 'entity_entities',
        'attach-x': 0,
        'attach-y': 0,
        'attach-z': 0,
        'billboard': false,
        'change-rotate-x': 0,
        'change-rotate-y': 0,
        'change-rotate-z': 0,
        'collide-range-xz': 2,
        'collide-range-y': 3,
        'collision': true,
        'draw': true,
        'draw-mode': 'TRIANGLE_FAN',
        'event-limit': false,
        'event-modify': [],
        'event-range': false,
        'event-target-id': false,
        'event-target-type': 'character',
        'event-todo': false,
        'normals': [],
        'pick-color': [0, 0, 0,],
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'scale-x': 1,
        'scale-y': 1,
        'scale-z': 1,
        'texture-align': [
          1, 1,
          0, 1,
          0, 0,
          1, 0,
        ],
        'texture-animated': false,
        'texture-id': webgl_default_texture,
        'texture-repeat-x': 1,
        'texture-repeat-y': 1,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'vertices-length': 0,
      },
      'todo': function(entity){
          webgl_entity_init(entity);
      },
      'type': 'webgl',
    });

    webgl_shader_remake();
    globalThis.onresize = webgl_resize;
    webgl_resize();

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

function webgl_level_export(){
    if(webgl_character_level() < -1){
        return;
    }

    const json = {};
    Object.assign(
      json,
      webgl_properties
    );

    delete json['paused'];

    json['characters'] = {};
    json['paths'] = {};

    for(const id in webgl_characters){
        if(id === webgl_character_id){
            continue;
        }

        json['characters'][id] = webgl_characters[id];
        json['characters'][id]['entities'] = [];
    }
    for(const path in webgl_paths){
        json['paths'][path] = webgl_paths[path];
    }

    for(const entity in entity_entities){
        const entity_json = {};
        entity_json['id'] = entity_entities[entity]['id'];

        Object.assign(
          entity_json,
          entity_entities[entity]
        );

        delete entity_json['normals'];
        delete entity_json['vao'];
        delete entity_json['vertices-length'];

        json['characters'][entity_json['attach-to']]['entities'].push(entity_json);
    }

    return JSON.stringify(json);
}

// Required args: character
function webgl_level_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'json': {},
      },
    });

    if(args['character'] === 1){
        if(!args['json']['characters']
          || args['json']['characters'][0]['id'] !== webgl_character_id){
            return;
        }
        delete webgl_characters[webgl_character_id];

    }else if(args['character'] === 0
      && webgl_character_level() < -1){
        return;
    }

    if(args['json']['randomized']){
        for(const i in args['json']['randomized']){
            const randomized = Math.random() * (args['json']['randomized'][i]['max'] - args['json']['randomized'][i]['min']) + args['json']['randomized'][i]['min'];

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

    if(webgl === 0){
        webgl_init();

    }else{
        webgl_level_unload();
    }

    const level = core_args({
      'args': args['json'],
      'defaults': {
        'ambient-blue': 1,
        'ambient-green': 1,
        'ambient-red': 1,
        'camera-zoom-max': 50,
        'characters': [],
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
        'gravity-max': -2,
        'groups': [],
        'paths': {},
        'prefabs': [],
        'spawn-path-id': '',
        'spawn-rotate-x': 0,
        'spawn-rotate-y': 0,
        'spawn-rotate-z': 0,
        'spawn-translate-x': 0,
        'spawn-translate-y': 0,
        'spawn-translate-z': 0,
        'title': false,
      },
    });

    entity_id_count = 0;
    webgl_properties = {
      'ambient-blue': level['ambient-blue'],
      'ambient-green': level['ambient-green'],
      'ambient-red': level['ambient-red'],
      'camera-zoom-max': level['camera-zoom-max'],
      'clearcolor-blue': level['clearcolor-blue'],
      'clearcolor-green': level['clearcolor-green'],
      'clearcolor-red': level['clearcolor-red'],
      'cursor': level['cursor'],
      'directional-blue': level['directional-blue'],
      'directional-green': level['directional-green'],
      'directional-red': level['directional-red'],
      'directional-state': level['directional-state'],
      'directional-vector': level['directional-vector'],
      'fog-density': level['fog-density'],
      'fog-state': level['fog-state'],
      'gravity-acceleration': level['gravity-acceleration'],
      'gravity-max': level['gravity-max'],
      'paused': false,
      'spawn-path-id': level['spawn-path-id'],
      'spawn-rotate-x': level['spawn-rotate-x'],
      'spawn-rotate-y': level['spawn-rotate-y'],
      'spawn-rotate-z': level['spawn-rotate-z'],
      'spawn-translate-x': level['spawn-translate-x'],
      'spawn-translate-y': level['spawn-translate-y'],
      'spawn-translate-z': level['spawn-translate-z'],
      'title': level['title'],
    };

    webgl_clearcolor_set({
      'blue': webgl_properties['clearcolor-blue'],
      'green': webgl_properties['clearcolor-green'],
      'red': webgl_properties['clearcolor-red'],
    });
    webgl_cursor_set(level['cursor']);

    level['groups'].push(
      'foreground',
      'skybox',
      'webgl'
    );
    entity_group_create(level['groups']);

    Object.assign(
      webgl_paths,
      level['paths']
    );

    for(const id in level['characters']){
        webgl_character_init(level['characters'][id]);
    }

    if(args['character'] === -1){
        webgl_character_base_entities = [];
        webgl_character_base_properties = {};
        webgl_character_init({
          'camera-zoom': 0,
          'collides': true,
          'controls': 'rpg',
          'entities': [],
          'id': webgl_character_id,
          'level': -1,
          'speed': 1,
        });

    }else{
        webgl_character_init(webgl_character_base_properties);
        webgl_entity_create({
          'entities': webgl_character_base_entities,
        });
    }

    for(const prefab in level['prefabs']){
        core_call({
          'args': level['prefabs'][prefab]['properties'],
          'todo': level['prefabs'][prefab]['type'],
        });
    }

    webgl_uniform_update();
    webgl_character_spawn();
    core_call({
      'todo': 'repo_level_load',
    });

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
        'character': 0,
        'json': {},
      },
    });

    if(args['json'] === null){
        return false;
    }

    if(args['json'] instanceof File){
        core_file({
          'file': args['json'],
          'todo': function(event){
              webgl_level_load({
                'character': args['character'],
                'json': JSON.parse(event.target.result),
              });
          },
          'type': 'readAsText',
        });
        return true;
    }

    webgl_level_init({
      'character': args['character'],
      'json': args['json'],
    });
    return true;
}

function webgl_level_unload(){
    Object.assign(
      webgl_character_base_properties,
      webgl_characters[webgl_character_id]
    );
    webgl_character_base_entities = [];
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
              webgl_character_base_entities.push(properties);
          }
      },
    });

    for(const id in webgl_characters){
        delete webgl_characters[id];
    }
    webgl_character_count = 0;
    entity_remove_all();
    webgl_paths = {};
    webgl_textures_animated = {};
    core_storage_save();
}

function webgl_logicloop(){
    if(!webgl_context_valid
      || webgl === 0){
        return;
    }

    for(const texture in webgl_textures_animated){
        webgl_texture_animate(texture);
    }

    repo_logic();

    entity_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          webgl_logicloop_handle_entity(entity);
      },
    });

    for(const id in webgl_characters){
        const level = webgl_character_level(id);

        if(webgl_properties['paused']
          && level !== -1){
            continue;
        }

        if(level >= 0
          && webgl_characters[id]['gravity']){
            webgl_characters[id]['change-translate-y'] = Math.max(
              webgl_characters[id]['change-translate-y'] + webgl_properties['gravity-acceleration'],
              webgl_properties['gravity-max']
            );
        }

        webgl_path_move(id);
        webgl_character_controls(id);

        if(webgl_characters[id]['collides']){
            for(const entity in entity_entities){
                if(entity_entities[entity]['collision']){
                    webgl_collision({
                      'collider': webgl_characters[id],
                      'target': entity_entities[entity],
                    });
                }
            }
        }

        if(webgl_characters[id]['change-rotate-x'] !== 0
          || webgl_characters[id]['change-rotate-y'] !== 0
          || webgl_characters[id]['change-rotate-z'] !== 0){
            webgl_camera_rotate({
              'camera': false,
              'character': id,
              'x': webgl_characters[id]['change-rotate-x'],
              'y': webgl_characters[id]['change-rotate-y'],
              'z': webgl_characters[id]['change-rotate-z'],
            });
        }
        webgl_clamp_rotation(webgl_characters[id]);

        const axes = 'xyz';
        for(const axis in axes){
            const translate_axis = 'translate-' + axes[axis];
            webgl_characters[id][translate_axis] += webgl_characters[id]['change-' + translate_axis];
        }

        if(level <= -1){
            if(webgl_characters[id]['path-id'].length === 0){
                webgl_characters[id]['change-translate-x'] = 0;
                webgl_characters[id]['change-translate-y'] = 0;
                webgl_characters[id]['change-translate-z'] = 0;
            }

        }else{
            if(webgl_characters[id]['change-translate-y'] !== 0){
                webgl_characters[id]['jump-allow'] = false;
            }

            if(webgl_characters[id]['jump-allow']){
                webgl_characters[id]['change-translate-x'] = 0;
                webgl_characters[id]['change-translate-z'] = 0;
            }
        }
    }

    if(webgl_characters[webgl_character_id]['camera-lock']){
        if(webgl_characters[webgl_character_id]['camera-zoom'] > 0){
            const radians_x = math_degrees_to_radians(webgl_characters[webgl_character_id]['camera-rotate-x']);
            const radians_y = math_degrees_to_radians(webgl_characters[webgl_character_id]['camera-rotate-y']);
            const cos_x = Math.cos(radians_x);

            webgl_characters[webgl_character_id]['camera-x'] = webgl_characters[webgl_character_id]['translate-x']
              + Math.sin(-radians_y) * webgl_characters[webgl_character_id]['camera-zoom'] * cos_x;
            webgl_characters[webgl_character_id]['camera-y'] = webgl_characters[webgl_character_id]['translate-y']
              + Math.sin(radians_x) * webgl_characters[webgl_character_id]['camera-zoom'];
            webgl_characters[webgl_character_id]['camera-z'] = webgl_characters[webgl_character_id]['translate-z']
              + Math.cos(radians_y) * webgl_characters[webgl_character_id]['camera-zoom'] * cos_x;

        }else{
            webgl_characters[webgl_character_id]['camera-x'] = webgl_characters[webgl_character_id]['translate-x'];
            webgl_characters[webgl_character_id]['camera-y'] = webgl_characters[webgl_character_id]['translate-y'];
            webgl_characters[webgl_character_id]['camera-z'] = webgl_characters[webgl_character_id]['translate-z'];
        }
    }

    math_matrix_identity('camera');
    math_matrix_rotate({
      'dimensions': [
        math_degrees_to_radians(webgl_characters[webgl_character_id]['camera-rotate-x']),
        math_degrees_to_radians(webgl_characters[webgl_character_id]['camera-rotate-y']),
        math_degrees_to_radians(webgl_characters[webgl_character_id]['camera-rotate-z']),
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
    if(entity_entities[entity]['event-range'] > 0){
        const event_position = webgl_get_translation(entity_entities[entity]);

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

        }else if(entity_entities[entity]['event-target-id'] !== false){
            const target_position = webgl_get_translation(entity_entities[entity_entities[entity]['event-target-id']]);

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

    const target = globalThis[entity_entities[entity]['attach-type']][entity_entities[entity]['attach-to']];
    if(target){
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
    }

    const old_rotate_x = entity_entities[entity]['rotate-x'];
    const old_rotate_y = entity_entities[entity]['rotate-y'];
    const old_rotate_z = entity_entities[entity]['rotate-z'];
    if(entity_entities[entity]['billboard']){
        webgl_billboard(entity);

    }else{
        const axes = 'xyz';
        for(const axis in axes){
            const rotate_axis = 'rotate-' + axes[axis];
            entity_entities[entity][rotate_axis] += entity_entities[entity]['change-' + rotate_axis];
        }
    }
    if(entity_entities[entity]['rotate-x'] !== old_rotate_x
      || entity_entities[entity]['rotate-y'] !== old_rotate_y
      || entity_entities[entity]['rotate-z'] !== old_rotate_z){
        webgl_clamp_rotation(entity_entities[entity]);
        webgl_entity_normals(entity);
    }

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
                math_degrees_to_radians(target['rotate-x']),
                math_degrees_to_radians(-target['rotate-y']),
                math_degrees_to_radians(target['rotate-z']),
              ],
              'id': entity,
            });
        }
        math_matrix_translate({
          'dimensions': [
            -entity_entities[entity]['attach-x'],
            -entity_entities[entity]['attach-y'],
            -entity_entities[entity]['attach-z'],
          ],
          'id': entity,
        });
    }
    math_matrix_rotate({
      'dimensions': [
        math_degrees_to_radians(entity_entities[entity]['rotate-x']),
        math_degrees_to_radians(entity_entities[entity]['rotate-y']),
        math_degrees_to_radians(entity_entities[entity]['rotate-z']),
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

    const radians_x = math_degrees_to_radians(args['rotate-x']);
    const radians_y = math_degrees_to_radians(args['rotate-y']);
    const radians_z = -math_degrees_to_radians(args['rotate-z']);
    const cos_y = Math.cos(radians_y);

    const normal_x = core_round({
      'number': cos_y * Math.sin(radians_z),
    });
    const normal_y = core_round({
      'number': Math.cos(radians_x) * Math.cos(radians_z),
    });
    const normal_z = core_round({
      'number': Math.sin(radians_x) * cos_y,
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

function webgl_path_move(id){
    const character = webgl_characters[id];
    if(webgl_paths[character['path-id']] === void 0){
        return;
    }

    const path = webgl_paths[character['path-id']];
    const point = core_handle_defaults({
      'default': {
        'rotate-x': false,
        'rotate-y': false,
        'rotate-z': false,
        'translate-x': character['translate-x'],
        'translate-y': character['translate-y'],
        'translate-z': character['translate-z'],
      },
      'var': path['points'][character['path-point']],
    });
    const distance = math_distance({
      'x0': character['translate-x'],
      'y0': character['translate-y'],
      'z0': character['translate-z'],
      'x1': point['translate-x'],
      'y1': point['translate-y'],
      'z1': point['translate-z'],
    });
    const speed = point['speed'] || path['speed'] || character['speed'];

    if(distance < speed){
        character['change-translate-x'] = 0;
        character['change-translate-y'] = 0;
        character['change-translate-z'] = 0;
        character['translate-x'] = point['translate-x'];
        character['translate-y'] = point['translate-y'];
        character['translate-z'] = point['translate-z'];
        webgl_camera_rotate({
          'character': character['id'],
          'set': true,
          'x': point['rotate-x'],
          'y': point['rotate-y'],
          'z': point['rotate-z'],
        });

        const path_end = character['path-end'] === ''
          ? path['end']
          : character['path-end'];
        if(character['path-direction'] > 0){
            if(character['path-point'] >= path['points'].length - 1){
                if(path_end === 'loop'){
                    character['path-point'] = 0;

                }else if(path_end === 'exit'){
                    character['path-id'] = '';
                    character['path-point'] = 0;

                }else if(path_end === 'reverse'){
                    character['path-direction'] = -1;
                    character['path-point'] -= 1;

                }else if(path_end === 'warp'){
                    character['path-point'] = 1;
                    const warp_point = core_handle_defaults({
                      'default': {
                        'translate-x': character['translate-x'],
                        'translate-y': character['translate-y'],
                        'translate-z': character['translate-z'],
                      },
                      'var': path['points'][0],
                    });
                    character['translate-x'] = warp_point['translate-x'];
                    character['translate-y'] = warp_point['translate-y'];
                    character['translate-z'] = warp_point['translate-z'];
                }

            }else{
                character['path-point'] += 1;
            }

        }else if(character['path-point'] === 0){
            if(path_end === 'loop'){
                character['path-point'] = path['points'].length - 1;

            }else if(path_end === 'reverse'){
                character['path-direction'] = 1;
                character['path-point'] = 1;

            }else if(path_end === 'exit'){
                character['path-id'] = '';
                character['path-point'] = 0;

            }else if(path_end === 'warp'){
                const last = path['points'].length - 1;
                character['path-point'] = last - 1;
                const warp_point = core_handle_defaults({
                  'default': {
                    'translate-x': character['translate-x'],
                    'translate-y': character['translate-y'],
                    'translate-z': character['translate-z'],
                  },
                  'var': path['points'][last],
                });
                character['translate-x'] = warp_point['translate-x'];
                character['translate-y'] = warp_point['translate-y'];
                character['translate-z'] = warp_point['translate-z'];
            }

        }else{
            character['path-point'] -= 1;
        }

        return;
    }

    const angle_xz = Math.atan2(
      point['translate-z'] - character['translate-z'],
      point['translate-x'] - character['translate-x']
    );
    const angle_y = Math.asin(Math.abs(character['translate-y'] - point['translate-y']) / distance);
    const cos_y = Math.cos(angle_y);
    character['change-translate-x'] = core_round({
      'number': Math.cos(angle_xz) * cos_y * speed,
    });
    character['change-translate-y'] = core_round({
      'number': Math.sin(angle_y) * speed,
    });
    character['change-translate-z'] = core_round({
      'number': Math.sin(angle_xz) * cos_y * speed,
    });
    if(character['translate-y'] > point['translate-y']){
        character['change-translate-y'] *= -1;
    }
}

function webgl_path_use(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': webgl_character_id,
        'path-id': '',
        'use-path-properties': true,
      },
    });

    const character = webgl_characters[args['id']];
    character['path-id'] = args['path-id'];

    if(args['use-path-properties']
      && webgl_paths[args['path-id']]){
        character['path-direction'] = webgl_paths[args['path-id']]['direction'] || 1;
        character['path-end'] = webgl_paths[args['path-id']]['end'] || '';
        character['path-point'] = webgl_paths[args['path-id']]['point'] || 0;
    }
}

// Required args: x, y
function webgl_pick_color(args){
    const pixelarray = new Uint8Array(4);
    webgl.readPixels(
      args['x'],
      webgl.drawingBufferHeight - args['y'],
      1,
      1,
      webgl.RGBA,
      webgl.UNSIGNED_BYTE,
      pixelarray
    );
    return pixelarray;
}

function webgl_pick_entity(args){
    const level = webgl_character_level();
    if(core_menu_open
      || level < -1
      || webgl === 0
      || (level >= 0 && webgl_properties['paused'])
      || webgl_characters[webgl_character_id]['health'] <= 0){
        return;
    }

    args = core_args({
      'args': args,
      'defaults': {
        'x': core_mouse['x'],
        'y': core_mouse['y'],
      },
    });

    webgl.uniform1i(
      webgl_shader['picking'],
      true
    );
    webgl_draw();
    const color = webgl_pick_color({
      'x': args['x'],
      'y': args['y'],
    });
    webgl.uniform1i(
      webgl_shader['picking'],
      false
    );

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
        if(entity_entities[entity]['event-range'] === false){
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

function webgl_prefab_args(args){
    return core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'groups': [],
        'prefix': entity_id_count,
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'scale-x': 1,
        'scale-y': 1,
        'scale-z': 1,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });
}

// Required args: prefab, prefix
function webgl_prefab_remake(args){
    for(const entity in entity_entities){
        if(entity_entities[entity]['id'].startsWith(args['prefix'])){
            entity_remove({
              'entities': [
                entity,
              ],
            });
        }
    }

    core_call({
      'args': args['prefab']['properties'],
      'todo': args['prefab']['type'],
    });
}

// Required args: properties, type
function webgl_prefab_repeat(args){
    args = core_args({
      'args': args,
      'defaults': {
        'count': 1,
        'x-max': 0,
        'x-min': 0,
        'y-max': 0,
        'y-min': 0,
        'z-max': 0,
        'z-min': 0,
      },
    });

    for(let i = 0; i < args['count']; i++){
        args['properties']['prefix'] = args['prefix'] + '-' + i;
        args['properties']['translate-x'] = Math.random() * (args['x-max'] - args['x-min']) + args['x-min'];
        args['properties']['translate-y'] = Math.random() * (args['y-max'] - args['y-min']) + args['y-min'];
        args['properties']['translate-z'] = Math.random() * (args['z-max'] - args['z-min']) + args['z-min'];

        core_call({
          'args': args['properties'],
          'todo': args['type'],
        });
    }
}

function webgl_primitive_cuboid(args){
    args = core_args({
      'args': webgl_prefab_args(args),
      'defaults': {
        'all': {},
        'back': {},
        'bottom': {},
        'front': {},
        'left': {},
        'right': {},
        'size-x': 1,
        'size-y': 1,
        'size-z': 1,
        'top': {},
      },
    });

    const half_size_x = args['size-x'] / 2;
    const half_size_y = args['size-y'] / 2;
    const half_size_z = args['size-z'] / 2;
    const vertices_size_x = Math.abs(half_size_x);
    const vertices_size_y = Math.abs(half_size_y);
    const vertices_size_z = Math.abs(half_size_z);

    if(args['top']['exclude'] !== true){
        const properties = {
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'],
          'attach-y': args['translate-y'] + half_size_y,
          'attach-z': args['translate-z'],
          'id': args['prefix'] + '-top',
          'vertex-colors': webgl_vertexcolorarray({
            'colors': args['top']['vertex-colors'],
          }),
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
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'],
          'attach-y': args['translate-y'] - half_size_y,
          'attach-z': args['translate-z'],
          'id': args['prefix'] + '-bottom',
          'rotate-x': 180,
          'vertex-colors': webgl_vertexcolorarray({
            'colors': args['bottom']['vertex-colors'],
          }),
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
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'],
          'attach-y': args['translate-y'],
          'attach-z': args['translate-z'] + half_size_z,
          'id': args['prefix'] + '-front',
          'rotate-x': 90,
          'vertex-colors': webgl_vertexcolorarray({
            'colors': args['front']['vertex-colors'],
          }),
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
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'],
          'attach-y': args['translate-y'],
          'attach-z': args['translate-z'] - half_size_z,
          'id': args['prefix'] + '-back',
          'rotate-x': 270,
          'vertex-colors': webgl_vertexcolorarray({
            'colors': args['back']['vertex-colors'],
          }),
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
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'] - half_size_x,
          'attach-y': args['translate-y'],
          'attach-z': args['translate-z'],
          'id': args['prefix'] + '-left',
          'rotate-z': 90,
          'vertex-colors': webgl_vertexcolorarray({
            'colors': args['left']['vertex-colors'],
          }),
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
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'] + half_size_x,
          'attach-y': args['translate-y'],
          'attach-z': args['translate-z'],
          'id': args['prefix'] + '-right',
          'rotate-z': 270,
          'vertex-colors': webgl_vertexcolorarray({
            'colors': args['right']['vertex-colors'],
          }),
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
      'args': webgl_prefab_args(args),
      'defaults': {
        'color0': [],
        'color1': [],
        'groups': [],
        'radius-x': 5,
        'radius-y': 5,
        'radius-z': 5,
        'slices-latitude': 10,
        'slices-longitude': 10,
      },
    });

    if(args['color0'].length === 0){
        args['color0'] = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }
    if(args['color1'].length === 0){
        args['color1'] = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }

    const latitude_angles = math_degrees_to_radians(360 / args['slices-latitude']);
    const longitude_angles = math_degrees_to_radians(180 / args['slices-longitude']);
    const longitude_start = -1.5707963267948966;

    const properties = {
      ...args,
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'attach-x': args['translate-x'],
      'attach-y': args['translate-y'],
      'attach-z': args['translate-z'],
      'collision': false,
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
            const cos_bottom = Math.cos(longitude_bottom);
            const cos_rotation = Math.cos(rotation);
            const cos_top = Math.cos(longitude_top);
            const sin_rotation = Math.sin(rotation);

            const xbottom = args['radius-x'] * sin_rotation * cos_bottom;
            const ybottom = args['radius-y'] * Math.sin(longitude_bottom);
            const zbottom = args['radius-z'] * cos_rotation * cos_bottom;

            const xtop = args['radius-x'] * sin_rotation * cos_top;
            const ytop = args['radius-y'] * Math.sin(longitude_top);
            const ztop = args['radius-z'] * cos_rotation * cos_top;

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
      'args': webgl_prefab_args(args),
      'defaults': {
        'bottom': true,
        'color-bottom': [],
        'color-top': [],
        'length': 2,
        'middle': true,
        'points': 8,
        'size-bottom': 2,
        'size-top': 1,
        'top': true,
      },
    });

    if(args['color-bottom'].length === 0){
        args['color-bottom'] = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }
    if(args['color-top'].length === 0){
        args['color-top'] = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }

    const rotation = math_degrees_to_radians(360 / args['points']);
    const properties = {
      ...args,
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'attach-x': args['translate-x'],
      'attach-y': args['translate-y'],
      'attach-z': args['translate-z'],
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
            const cos_rotation = Math.cos(point_rotation);
            const sin_rotation = Math.sin(point_rotation);

            if(args['size-bottom'] === 0){
                properties['vertex-colors'].push(
                  args['color-top'][0], args['color-top'][1], args['color-top'][2], args['color-top'][3]
                );
                properties['vertices'].push(
                  args['size-top'] * sin_rotation,
                  args['length'],
                  args['size-top'] * cos_rotation
                );

            }else{
                properties['vertex-colors'].push(
                  args['color-bottom'][0], args['color-bottom'][1], args['color-bottom'][2], args['color-bottom'][3]
                );
                properties['vertices'].push(
                  args['size-bottom'] * sin_rotation,
                  0,
                  args['size-bottom'] * cos_rotation
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
            const cos_rotation = Math.cos(point_rotation);
            const sin_rotation = Math.sin(point_rotation);

            if(args['size-top'] === 0){
                properties['vertex-colors'].push(
                  args['color-bottom'][0], args['color-bottom'][1], args['color-bottom'][2], args['color-bottom'][3]
                );
                properties['vertices'].push(
                  args['size-bottom'] * sin_rotation,
                  0,
                  args['size-bottom'] * cos_rotation
                );

            }else{
                properties['vertex-colors'].push(
                  args['color-top'][0], args['color-top'][1], args['color-top'][2], args['color-top'][3]
                );
                properties['vertices'].push(
                  args['size-top'] * sin_rotation,
                  args['length'],
                  args['size-top'] * cos_rotation
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

function webgl_primitive_stars(args){
    args = core_args({
      'args': webgl_prefab_args(args),
      'defaults': {
        'color': [1, 1, 1, 1],
        'height-limit': 1,
        'radius': 250,
        'range': 100,
        'stars': 100,
      },
    });

    const star_colors = [];
    const star_points = [];
    for(let i = 0; i < args['stars']; i++){
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(1 - 2 * Math.random());
        const sin_phi = Math.sin(phi);
        const radius = args['radius'] - Math.random() * args['range'];
        const star_y = radius * sin_phi * Math.sin(theta);
        if(star_y < radius - radius * 2 * args['height-limit']){
            continue;
        }
        star_points.push(
          radius * sin_phi * Math.cos(theta),
          star_y,
          radius * Math.cos(phi),
        );
        star_colors.push(
          args['color'][0],
          args['color'][1],
          args['color'][2],
          args['color'][3]
        );
    }
    webgl_entity_create({
      'entities': [
        {
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'],
          'attach-y': args['translate-y'],
          'attach-z': args['translate-z'],
          'collision': false,
          'draw-mode': 'POINTS',
          'id': args['prefix'],
          'vertex-colors': star_colors,
          'vertices': star_points,
        },
      ],
    });
}

function webgl_primitive_terrain(args){
    args = core_args({
      'args': webgl_prefab_args(args),
      'defaults': {
        'colors': [],
        'heights': [],
        'tiles-x': 10,
        'tiles-x-size': 10,
        'tiles-z': 10,
        'tiles-z-size': 10,
      },
    });

    while(args['colors'].length < args['tiles-x'] * (args['tiles-z'] + 1) * 4 + 1){
        const random_color = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
        args['colors'].push(
          random_color[0], random_color[1], random_color[2], random_color[3],
        );
    }
    while(args['heights'].length < args['tiles-x'] * args['tiles-z'] + args['tiles-x'] + 1){
        args['heights'].push(Math.random() * 10);
    }

    let x_direction = -1;
    const points = [];
    const point_colors = [];
    const z_start = -args['tiles-z-size'] * (args['tiles-z'] + 2) / 2;

    for(let tile_z = 0; tile_z <= args['tiles-z']; tile_z++){
        const z_tile = tile_z * args['tiles-z'] * 4;
        const x_start = args['tiles-x-size'] * args['tiles-x'] * x_direction / 2;
        const z_offset = z_start + tile_z * args['tiles-z-size'];
        point_colors.push(
          args['colors'][z_tile], args['colors'][z_tile + 1], args['colors'][z_tile + 2], args['colors'][z_tile + 3],
          args['colors'][z_tile], args['colors'][z_tile + 1], args['colors'][z_tile + 2], args['colors'][z_tile + 3],
        );

        for(let tile_x = 0; tile_x <= args['tiles-x']; tile_x++){
            const x_tile = z_tile + tile_x * 4;
            const x_offset = x_start + args['tiles-x-size'] * tile_x * -x_direction;
            if(x_direction === 1){
                points.push(
                  x_offset, args['heights'][tile_z * args['tiles-z'] + tile_x], z_offset + args['tiles-z-size'],
                  x_offset, args['heights'][(tile_z - 1) * args['tiles-z'] + tile_x], z_offset,
                );
            }else{
                points.push(
                  x_offset, args['heights'][tile_z * args['tiles-z'] - tile_x], z_offset,
                  x_offset, args['heights'][(tile_z + 1) * args['tiles-z'] - tile_x], z_offset + args['tiles-z-size'],
                );
            }
            point_colors.push(
              args['colors'][x_tile], args['colors'][x_tile + 1], args['colors'][x_tile + 2], args['colors'][x_tile + 3],
              args['colors'][x_tile], args['colors'][x_tile + 1], args['colors'][x_tile + 2], args['colors'][x_tile + 3],
            );
        }

        x_direction *= -1;
    }

    webgl_entity_create({
      'entities': [
        {
          ...args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': args['translate-x'],
          'attach-y': args['translate-y'],
          'attach-z': args['translate-z'],
          'collision': false,
          'draw-mode': 'TRIANGLE_STRIP',
          'id': args['prefix'],
          'vertex-colors': point_colors,
          'vertices': points,
        },
      ],
    });
}

function webgl_program_create(shaders){
    const program = webgl.createProgram();
    for(const shader in shaders){
        webgl.attachShader(
          program,
          shaders[shader]
        );
    }
    webgl.linkProgram(program);
    webgl.useProgram(program);
    return program;
}

function webgl_resize(){
    const height = globalThis.innerHeight;
    const width = globalThis.innerWidth;
    webgl.canvas.height = height;
    webgl.canvas.width = width;

    webgl.viewport(
      0,
      0,
      width,
      height
    );

    math_matrices['perspective'][0] = webgl.drawingBufferHeight / webgl.drawingBufferWidth;
    webgl.uniformMatrix4fv(
      webgl_shader['mat_perspectiveMatrix'],
      false,
      math_matrices['perspective']
    );
    if(core_menu_open){
        webgl_draw();
    }
}

// Required args: entity
function webgl_scale(args){
    args = core_args({
      'args': args,
      'defaults': {
        'todo': true,
        'x': false,
        'y': false,
        'z': false,
      },
    });

    const axes = 'xyz';
    for(const axis in axes){
        if(args[axes[axis]] === false){
            continue;
        }

        const old_scale = entity_entities[args['entity']]['scale-' + axes[axis]];
        entity_entities[args['entity']]['scale-' + axes[axis]] = args[axes[axis]];

        for(let i = Number(axis); i < entity_entities[args['entity']]['vertices-length'] * 3; i += 3){
            entity_entities[args['entity']]['vertices'][i] /= old_scale;
            entity_entities[args['entity']]['vertices'][i] *= args[axes[axis]];
        }
    }

    if(args['todo']){
        webgl.bindVertexArray(entity_entities[args['entity']]['vao']);
        webgl_buffer_set({
          'attribute': 'vec_vertexPosition',
          'data': entity_entities[args['entity']]['vertices'],
          'size': 3,
        });
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

    webgl.enable(webgl.SCISSOR_TEST);
    webgl.scissor(
      args['x'],
      webgl.drawingBufferHeight - args['y'],
      args['width'],
      args['height']
    );

    const result = args['todo']();
    webgl.disable(webgl.SCISSOR_TEST);
    return result;
}

function webgl_screenshot(args){
    if(webgl === 0){
        return;
    }

    args = core_args({
      'args': args,
      'defaults': {
        'quality': 1,
        'type': 'image/png',
      },
    });

    webgl_draw();
    webgl.canvas.toBlob(
      function(blob){
          globalThis.open(
            URL.createObjectURL(blob),
            '_blank'
          );
      },
      args['type'],
      args['quality']
    );
}

// Required args: source, type
function webgl_shader_create(args){
    const shader = webgl.createShader(args['type']);
    webgl.shaderSource(
      shader,
      args['source']
    );
    webgl.compileShader(shader);
    return shader;
}

function webgl_shader_remake(){
    const fragment_shader = `#version 300 es
precision lowp float;
uniform bool fog;
uniform bool picking;
uniform float float_fogDensity;
uniform sampler2D sampler;
uniform vec3 vec_clearColor;
in vec2 vec_textureCoord;
in vec4 vec_fragmentColor;
in vec4 vec_lighting;
in vec4 vec_position;
out vec4 fragColor;
void main(void){
    if(picking){
        fragColor = vec_fragmentColor;
    }else{
        fragColor = vec_fragmentColor * vec_lighting * texture(sampler, vec_textureCoord);
        if(fog){
            float distance = length(vec_position.xyz);
            fragColor.rgb = vec3(mix(
              vec_clearColor,
              fragColor.rgb,
              clamp(exp(float_fogDensity * distance * -distance), 0.0, 1.0)
            ));
        }
    }
}`;
    const vertex_shader = `#version 300 es
in vec2 vec_texturePosition;
in vec3 vec_vertexNormal;
in vec4 vec_pickColor;
in vec4 vec_vertexColor;
in vec3 vec_vertexPosition;
uniform bool directional;
uniform bool picking;
uniform float alpha;
uniform mat4 mat_cameraMatrix;
uniform mat4 mat_perspectiveMatrix;
uniform vec3 vec_ambientColor;
uniform vec3 vec_directionalColor;
uniform vec3 vec_directionalVector;
out vec2 vec_textureCoord;
out vec4 vec_fragmentColor;
out vec4 vec_lighting;
out vec4 vec_position;
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
}`;

    if(webgl_shader['program'] !== 0){
        webgl.deleteProgram(webgl_shader['program']);
    }

    webgl_shader['program'] = webgl_program_create([
      webgl_shader_create({
        'source': fragment_shader,
        'type': webgl.FRAGMENT_SHADER,
      }),
      webgl_shader_create({
        'source': vertex_shader,
        'type': webgl.VERTEX_SHADER,
      }),
    ]);

    webgl_vertexattribarray_set({
      'attributes': [
        'vec_pickColor',
        'vec_texturePosition',
        'vec_vertexColor',
        'vec_vertexNormal',
        'vec_vertexPosition',
      ],
      'program': webgl_shader['program'],
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
    };
    for(const location in locations){
        webgl_shader[location] = webgl.getUniformLocation(
          webgl_shader['program'],
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
        rotate_args[args['stat'].at(-1)] = args['value'];
        webgl_camera_rotate(rotate_args);
        return;

    }else if(args['stat'] === 'vertex-colors'){
        args['target']['vertex-colors'] = webgl_vertexcolorarray();
        webgl.bindVertexArray(args['target']['vao']);
        webgl_buffer_set({
          'attribute': 'vec_vertexColor',
          'data': webgl_vertexcolorarray({
            'colors': args['target']['vertex-colors'],
            'vertexcount': args['target']['vertices-length'],
          }),
          'size': 4,
        });
        return;

    }else if(args['target'][args['stat']] === void 0){
        if(args['has']){
            return;
        }

        args['target'][args['stat']] = 0;
    }

    args['target'][args['stat']] = (args['set'] || core_type(args['value']) !== 'number')
      ? args['value']
      : args['target'][args['stat']] + args['value'];

    if(args['stat'] === 'health'){
        if(webgl_character_level(args['target']['id']) === -1){
            args['target']['health'] = args['target']['health-max'];

        }else if(args['target']['health'] <= 0){
            args['target']['health'] = 0;

            if(args['target']['lives'] > 0){
                args['target']['lives']--;
            }

            if(args['target']['lives'] === 0){
                for(const entity in entity_entities){
                    if(entity_entities[entity]['attach-to'] === args['character']){
                       entity_entities[entity]['attach-to'] = false;
                    }
                }
            }

        }else{
            args['target']['health'] = Math.min(
              args['target']['health'],
              args['target']['health-max']
            );
        }
    }
}

function webgl_texture_animate(id){
    if(!webgl_textures_animated[id]['ready']){
        return;
    }

    const canvas = core_elements['texture-' + id].getContext('2d');
    const height = core_images[id]['height'];
    const width = core_images[id]['width'];

    let offset_x = webgl_textures_animated[id]['offset-x'] + webgl_textures_animated[id]['speed-x'];
    if(offset_x <= 0){
        offset_x = width;

    }else if(offset_x >= width){
        offset_x = 0;
    }
    webgl_textures_animated[id]['offset-x'] = offset_x;
    let offset_y = webgl_textures_animated[id]['offset-y'] + webgl_textures_animated[id]['speed-y'];
    if(offset_y <= 0){
        offset_y = height;

    }else if(offset_y >= height){
        offset_y = 0;
    }
    webgl_textures_animated[id]['offset-y'] = offset_y;

    canvas.save();
    canvas.fillStyle = canvas.createPattern(
      core_images[id],
      'repeat'
    );
    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.translate(
      offset_x,
      offset_y
    );
    canvas.fillRect(
      -width,
      -height,
      width * 2,
      height * 2,
    );
    canvas.restore();

    entity_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          if(entity_entities[entity]['texture-animated']
            && entity_entities[entity]['texture-id'] === id){
              webgl.bindTexture(
                webgl.TEXTURE_2D,
                webgl_textures_animated[entity_entities[entity]['texture-id']]['gl']
              );
              webgl.texImage2D(
                webgl.TEXTURE_2D,
                0,
                webgl.RGBA,
                webgl.RGBA,
                webgl.UNSIGNED_BYTE,
                core_elements['texture-' + entity_entities[entity]['texture-id']]
              );
              webgl.generateMipmap(webgl.TEXTURE_2D);
          }
      },
    });
}

// Required args: gl, id
function webgl_texture_animate_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'speed-x': 0.1,
        'speed-y': 0,
      },
    });

    core_html({
      'parent': document.getElementById('repo-ui'),
      'properties': {
        'className': 'hidden',
        'id': 'webgl-animated-textures',
      },
      'type': 'div',
    });

    const id = 'texture-' + args['id'];
    core_html({
      'parent': document.getElementById('webgl-animated-textures'),
      'properties': {
        'height': core_images[args['id']]['height'],
        'id': id,
        'width': core_images[args['id']]['width'],
      },
      'store': id,
      'type': 'canvas',
    });

    webgl_textures_animated[args['id']] = {
      'gl': args['gl'],
      'offset-x': 0,
      'offset-y': 0,
      'ready': true,
      'speed-x': args['speed-x'],
      'speed-y': args['speed-y'],
    };
}

// Required args: id
function webgl_texture_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'animated': false,
        'loading': false,
      },
    });

    if(!args['loading']
      && !args['animated']
      && webgl_textures[args['id']]){
        return;
    }

    let texture_complete = false;
    let texture_id = webgl_default_texture;
    if(core_images[args['id']]
      && core_images[args['id']].complete){
        texture_complete = true;
        texture_id = args['id'];
    }
    const texture = core_images[texture_id];
    const texture_gl = webgl.createTexture();

    webgl.bindTexture(
      webgl.TEXTURE_2D,
      texture_gl
    );
    webgl.texImage2D(
      webgl.TEXTURE_2D,
      0,
      webgl.RGBA,
      webgl.RGBA,
      webgl.UNSIGNED_BYTE,
      texture
    );
    webgl.texParameterf(
      webgl.TEXTURE_2D,
      webgl.TEXTURE_MAG_FILTER,
      webgl.LINEAR
    );
    webgl.texParameterf(
      webgl.TEXTURE_2D,
      webgl.TEXTURE_MIN_FILTER,
      webgl.NEAREST_MIPMAP_LINEAR
    );
    webgl.generateMipmap(webgl.TEXTURE_2D);

    if(!texture_complete
      && !args['loading']){
        if(args['animated']){
            webgl_textures_animated[args['id']] = {
              'gl': texture_gl,
              'ready': false,
            };
        }else{
            webgl_textures[args['id']] = texture_gl;
        }
        core_image({
          'id': args['id'],
          'src': uris[args['id']],
          'todo': function(){
              webgl_texture_init({
                'animated': args['animated'],
                'id': args['id'],
                'loading': true,
              });
          },
        });

    }else if(args['animated']){
        webgl_texture_animate_init({
          'gl': texture_gl,
          'id': args['id'],
        });

    }else{
        webgl_textures[args['id']] = texture_gl;
    }
}

// Required args: tiles
function webgl_tiles(args){
    args = core_args({
      'args': webgl_prefab_args(args),
      'defaults': {
        'repeat': false,
        'tiles-max': 5,
        'tiles-min': 1,
      },
    });

    const tiles = [];
    if(args['repeat'] !== false){
        let all_tiles = [];
        for(let repeat = 0; repeat < args['repeat']; repeat++){
            all_tiles = [
              ...all_tiles,
              ...Array.from(Array(args['tiles'].length).keys()),
            ];
        }

        const tile_count = args['tiles'].length * args['repeat'];
        for(let tile = 0; tile < tile_count; tile++){
            const random_tile = core_random_integer({
              'max': all_tiles.length,
            });

            tiles.push(all_tiles.splice(random_tile, 1)[0]);
        }

    }else{
        const tile_count = core_random_integer({
          'max': args['tiles-max'] - args['tiles-min'] + 1,
        }) + args['tiles-min'];
        for(let tile = 0; tile < tile_count; tile++){
            tiles.push(core_random_integer({
              'max': args['tiles'].length,
            }));
        }
    }

    let tile_offset_x = args['translate-x'];
    let tile_offset_y = args['translate-y'];
    let tile_offset_z = args['translate-z'];
    let tile_rotate_x = args['rotate-x'];
    let tile_rotate_y = args['rotate-y'];
    let tile_rotate_z = args['rotate-z'];

    for(const tile in tiles){
        Object.assign(
          webgl_paths,
          args['tiles'][tiles[tile]]['paths']
        );

        const entities = args['tiles'][tiles[tile]]['entities'];
        for(const entity in entities){
            if(!webgl_characters[args['character']]){
                webgl_character_init(args['tiles'][tiles[tile]]['characters'][args['character']]);
            }

            const properties = {
              ...args,
              ...entities[entity],
              'attach-to': args['character'],
              'attach-type': 'webgl_characters',
              'attach-x': tile_offset_x + (entities[entity]['attach-x'] || 0),
              'attach-y': tile_offset_y + (entities[entity]['attach-y'] || 0),
              'attach-z': tile_offset_z + (entities[entity]['attach-z'] || 0),
              'id': args['prefix'] + '-' + tile + '-' + entity,
            };

            webgl_entity_create({
              'entities': [
                properties,
              ],
            });
        }

        if(args['tiles'][tiles[tile]]['attach-x'] !== void 0){
            tile_offset_x += args['tiles'][tiles[tile]]['attach-x'];
        }
        if(args['tiles'][tiles[tile]]['attach-y'] !== void 0){
            tile_offset_y += args['tiles'][tiles[tile]]['attach-y'];
        }
        if(args['tiles'][tiles[tile]]['attach-z'] !== void 0){
            tile_offset_z += args['tiles'][tiles[tile]]['attach-z'];
        }
        if(args['tiles'][tiles[tile]]['attach-rotate-x'] !== void 0){
            const max = tile_rotate_x > 180
              ? 360
              : 90;
            tile_rotate_x = math_clamp({
              'max': max,
              'min': max - 90,
              'value': tile_rotate_x + args['tiles'][tiles[tile]]['attach-rotate-x'],
            });
        }
        if(args['tiles'][tiles[tile]]['attach-rotate-y'] !== void 0){
            tile_rotate_y = math_clamp({
              'max': 360,
              'min': 0,
              'value': tile_rotate_y + args['tiles'][tiles[tile]]['attach-rotate-y'],
            });
        }
        if(args['tiles'][tiles[tile]]['attach-rotate-z'] !== void 0){
            tile_rotate_z = math_clamp({
              'max': 360,
              'min': 0,
              'value': tile_rotate_z + args['tiles'][tiles[tile]]['attach-rotate-z'],
            });
        }
    }
}

function webgl_uniform_update(){
    webgl.uniform3f(
      webgl_shader['ambient-color'],
      webgl_properties['ambient-red'],
      webgl_properties['ambient-green'],
      webgl_properties['ambient-blue']
    );
    webgl.uniform3f(
      webgl_shader['clear-color'],
      webgl_properties['clearcolor-red'],
      webgl_properties['clearcolor-green'],
      webgl_properties['clearcolor-blue']
    );
    webgl.uniform1i(
      webgl_shader['directional'],
      webgl_properties['directional-state']
    );
    webgl.uniform3f(
      webgl_shader['directional-color'],
      webgl_properties['directional-red'],
      webgl_properties['directional-green'],
      webgl_properties['directional-blue']
    );
    webgl.uniform3fv(
      webgl_shader['directional-vector'],
      webgl_properties['directional-vector']
    );
    webgl.uniform1f(
      webgl_shader['fog-density'],
      webgl_properties['fog-density']
    );
    webgl.uniform1i(
      webgl_shader['fog-state'],
      webgl_properties['fog-state']
    );
}

// Required args: attributes, program
function webgl_vertexattribarray_set(args){
    for(const attribute in args['attributes']){
        webgl_attributes[args['attributes'][attribute]] = webgl.getAttribLocation(
          args['program'],
          args['attributes'][attribute]
        );
        webgl.enableVertexAttribArray(webgl_attributes[args['attributes'][attribute]]);
    }
}

function webgl_vertexcolorarray(args){
    args = core_args({
      'args': args,
      'defaults': {
        'colors': [],
        'vertexcount': 4,
      },
    });

    if(args['colors'].length === 0){
        args['colors'].push(
          Math.random(),
          Math.random(),
          Math.random(),
          1
        );
    }

    const color = [];
    for(let i = 0; i < args['vertexcount']; i++){
        const index = args['colors'][i * 4] !== void 0
          ? i * 4
          : 0;

        color.push(
          args['colors'][index],
          args['colors'][index + 1],
          args['colors'][index + 2],
          args['colors'][index + 3]
        );
    }
    return color;
}

globalThis.webgl = 0;
globalThis.webgl_attributes = {};
globalThis.webgl_character_base_entities = [];
globalThis.webgl_character_base_properties = {};
globalThis.webgl_character_count = 0;
globalThis.webgl_character_id = '_me';
globalThis.webgl_characters = {};
globalThis.webgl_context_valid = true;
globalThis.webgl_default_texture = 'default.png';
globalThis.webgl_paths = {};
globalThis.webgl_properties = {};
globalThis.webgl_shader = {};
globalThis.webgl_textures = {};
globalThis.webgl_textures_animated = {};

core_image({
  'id': webgl_default_texture,
  'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
});
