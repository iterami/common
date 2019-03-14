'use strict';

// Required args: entity, to
function webgl_attach(args){
    args = core_args({
      'args': args,
      'defaults': {
        'offset-x': 0,
        'offset-y': 0,
        'offset-z': 0,
        'type': 'core_entities',
      },
    });

    let entity = core_entities[args['entity']];
    entity['attach-offset-x'] = args['offset-x'];
    entity['attach-offset-y'] = args['offset-y'];
    entity['attach-offset-z'] = args['offset-z'];
    entity['attach-to'] = args['to'];
    entity['attach-type'] = args['type'];
}

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

    for(let axis in args['axes']){
        core_entities[args['entity']]['rotate-' + args['axes'][axis]]
          = 360 - webgl_characters[args['character']]['camera-rotate-' + args['axes'][axis]];
    }

    webgl_entity_radians({
      'entity': args['entity'],
    });
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
function webgl_buffer_set_type(args){
    args = core_args({
      'args': args,
      'defaults': {
        'type': 'Float32Array',
      },
    });

    let buffer = webgl_buffer.createBuffer();
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
      || core_mouse['down-0']
      || core_mouse['down-2']){
        if(webgl_character_level() < -1){
            return;
        }

        webgl_camera_rotate({
          'character': webgl_properties['camera-zoom-max'] === 0
            || (core_mouse['down-2']
              && webgl_characters[webgl_character_id]['health-current'] > 0),
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
        'character': true,
        'set': false,
        'x': 0,
        'xlock': true,
        'y': 0,
        'z': 0,
      },
    });

    let axes = {
      'x': args['x'],
      'y': args['y'],
      'z': args['z'],
    };
    let prefix = args['camera']
      ? 'camera-rotate-'
      : 'rotate-';
    for(let axis in axes){
        let axis_value = axes[axis];
        if(!args['set']){
            axis_value += webgl_characters[webgl_character_id][prefix + axis];
        }

        webgl_characters[webgl_character_id][prefix + axis] = core_clamp({
          'max': 360,
          'min': 0,
          'value': axis_value,
          'wrap': true,
        });
    }

    if(args['xlock']){
        let max = webgl_characters[webgl_character_id][prefix + 'x'] > 180
          ? 360
          : 89;
        webgl_characters[webgl_character_id][prefix + 'x'] = core_clamp({
          'max': max,
          'min': max - 89,
          'value': webgl_characters[webgl_character_id][prefix + 'x'],
        });
    }

    if(args['camera']
      && args['character']){
        webgl_characters[webgl_character_id]['rotate-y'] = core_mouse['down-2']
          ? webgl_characters[webgl_character_id]['camera-rotate-y']
          : webgl_characters[webgl_character_id]['rotate-y'] + (args['set']
            ? 0
            : args['y']);
    }

    webgl_entity_radians({
      'character': true,
      'entity': webgl_character_id,
    });
}

function webgl_camera_zoom(event){
    if(webgl_character_level() < -1){
        return;
    }

    let character = webgl_characters[webgl_character_id];
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

function webgl_character_damage(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'damage': 100,
        'delete': false,
        'kill': false,
      },
    });

    if(webgl_character_level({
        'character': args['character'],
      }) < 0){
        return;
    }

    webgl_characters[args['character']]['health-current'] -= args['damage'];

    if(webgl_characters[args['character']]['health-current'] > webgl_characters[args['character']]['health-max']){
        webgl_characters[args['character']]['health-current'] = webgl_characters[args['character']]['health-max'];
    }

    if(webgl_characters[args['character']]['health-current'] > 0
      && !args['kill']){
        return;
    }

    if(args['delete']){
        delete webgl_characters[args['character']];
        webgl_character_count--;

        for(let entity in core_entities){
            if(core_entities[entity]['attach-to'] === args['character']){
                core_entities[entity]['attach-to'] = false;
            }
        }

        return;
    }

    webgl_characters[args['character']]['health-current'] = 0;
}

function webgl_character_home(){
    if(webgl_character_homebase['properties'] === void 0){
        return;
    }

    webgl_level_unload();
    webgl_init(webgl_character_homebase['properties']);
    for(let character in webgl_character_homebase['characters']){
        webgl_init_character(webgl_character_homebase['characters'][character]);
    }
    webgl_character_spawn();
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
    webgl_characters[args['character']]['camera-rotate-radians-x'] = 0;
    webgl_characters[args['character']]['camera-rotate-radians-y'] = 0;
    webgl_characters[args['character']]['camera-rotate-radians-z'] = 0;
    webgl_characters[args['character']]['camera-rotate-x'] = 0;
    webgl_characters[args['character']]['camera-rotate-y'] = 0;
    webgl_characters[args['character']]['camera-rotate-z'] = 0;
    webgl_characters[args['character']]['camera-zoom'] = Math.min(
      webgl_characters[args['character']]['camera-zoom'],
      webgl_properties['camera-zoom-max']
    );
    webgl_characters[args['character']]['change'] = {
      'translate-x': 0,
      'translate-y': 0,
      'translate-z': 0,
    };
    webgl_characters[args['character']]['rotate-radians-x'] = 0;
    webgl_characters[args['character']]['rotate-radians-y'] = 0;
    webgl_characters[args['character']]['rotate-radians-z'] = 0;
    webgl_characters[args['character']]['rotate-x'] = 0;
    webgl_characters[args['character']]['rotate-y'] = 0;
    webgl_characters[args['character']]['rotate-z'] = 0;
}

// Required args: id
function webgl_character_set(args){
    webgl_character_id = args['id'];

    webgl_characters[webgl_character_id]['camera-zoom'] = Math.min(
      webgl_characters[webgl_character_id]['camera-zoom'],
      webgl_properties['camera-zoom-max']
    );

    core_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          core_entities[entity]['attach-to'] = webgl_character_id;
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
      'y': webgl_properties['spawn-translate-y'],
      'z': webgl_properties['spawn-translate-z'],
    });
    if(args['character'] === webgl_character_id){
        webgl_camera_rotate({
          'x': webgl_properties['spawn-rotate-x'],
          'y': webgl_properties['spawn-rotate-y'],
          'z': webgl_properties['spawn-rotate-z'],
        });
    }

    webgl_characters[args['character']]['jump-allow'] = false;
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
    let collider_position = webgl_get_translation({
      'entity': args['collider'],
    });
    let collision = false;
    let collision_sign = 1;
    let range = {
      'x': args['collider']['collide-range-horizontal'] + Math.abs(args['collider']['change']['translate-x']),
      'y': args['collider']['collide-range-vertical'] + Math.abs(args['collider']['change']['translate-y']),
      'z': args['collider']['collide-range-horizontal'] + Math.abs(args['collider']['change']['translate-z']),
    };
    let target_position = webgl_get_translation({
      'entity': args['target'],
    });

    if(args['target']['normals'][0] !== 0){
        if(args['target']['normals'][0] === 1
          && (args['collider']['change']['translate-x'] < 0
            || args['target']['change']['translate-x'] > 0)){
            if(collider_position['x'] > target_position['x']
              && collider_position['x'] < target_position['x'] + range['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][4] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][0] + range['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][10] + range['z']){
                collision = 'x';
                args['collider']['change']['translate-x'] = args['target']['change']['translate-x'];
            }

        }else if(args['target']['normals'][0] === -1
          && (args['collider']['change']['translate-x'] > 0
            || args['target']['change']['translate-x'] < 0)){
            if(collider_position['x'] > target_position['x'] - range['x']
              && collider_position['x'] < target_position['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][4] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][0] + range['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][10] + range['z']){
                collision = 'x';
                collision_sign = -1;
                args['collider']['change']['translate-x'] = args['target']['change']['translate-x'];
            }
        }

    }else if(args['target']['normals'][1] !== 0){
        if(args['target']['normals'][1] === 1
          && (args['collider']['change']['translate-y'] < 0
            || args['target']['change']['translate-y'] > 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][4] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y']
              && collider_position['y'] < target_position['y'] + range['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][10] + range['z']){
                collision = 'y';
                args['collider']['change']['translate-y'] = args['target']['change']['translate-y'];
            }

        }else if(args['target']['normals'][1] === -1
          && (args['collider']['change']['translate-y'] > 0
            || args['target']['change']['translate-y'] < 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][4] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y'] - range['y']
              && collider_position['y'] < target_position['y']
              && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
              && collider_position['z'] < target_position['z'] + args['target']['vertices'][10] + range['z']){
                collision = 'y';
                collision_sign = -1;
                args['collider']['change']['translate-y'] = args['target']['change']['translate-y'];
            }
        }

    }else if(args['target']['normals'][2] !== 0){
        if(args['target']['normals'][2] === 1
          && (args['collider']['change']['translate-z'] < 0
            || args['target']['change']['translate-z'] > 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][4] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][2] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][10] + range['y']
              && collider_position['z'] > target_position['z']
              && collider_position['z'] < target_position['z'] + range['z']){
                collision = 'z';
                args['collider']['change']['translate-z'] = args['target']['change']['translate-z'];
            }

        }else if(args['target']['normals'][2] === -1
          && (args['collider']['change']['translate-z'] > 0
            || args['target']['change']['translate-z'] < 0)){
            if(collider_position['x'] > target_position['x'] + args['target']['vertices'][4] - range['x']
              && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
              && collider_position['y'] > target_position['y'] + args['target']['vertices'][2] - range['y']
              && collider_position['y'] < target_position['y'] + args['target']['vertices'][10] + range['y']
              && collider_position['z'] > target_position['z'] - range['z']
              && collider_position['z'] < target_position['z']){
                collision = 'z';
                collision_sign = -1;
                args['collider']['change']['translate-z'] = args['target']['change']['translate-z'];
            }
        }
    }

    if(collision !== false){
        if(args['collider']['attach-to'] === void 0){
            if(webgl_character_level({
                'character': args['character-id'],
              }) > -1){
                if(args['target']['collide-damage'] !== 0){
                    webgl_character_damage({
                      'character': args['character-id'],
                      'damage': args['target']['collide-damage'],
                    });
                }

                if(args['target']['item-id'] !== false){
                    if(!(args['target']['item-id'] in args['collider']['inventory'])){
                        webgl_item_reset({
                          'character': args['character-id'],
                          'entities': args['target']['item-entities'],
                          'item': args['target']['item-id'],
                          'spell': args['target']['item-spellproperties'],
                          'stats': args['target']['item-stats'],
                        });
                    }

                    args['collider']['inventory'][args['target']['item-id']]['amount'] += args['target']['item-amount'];

                    core_entity_remove({
                      'entities': [
                        args['target'],
                      ],
                    });

                    return false;
                }
            }

        }else if(core_groups['particles'][args['collider']['id']]){
            core_entity_remove({
              'entities': [
                args['collider']['id'],
              ],
            });

            return false;
        }

        if(Math.abs(target_position[collision] - collider_position[collision]) < range[collision]){
            let range_axis = collision === 'y'
              ? 'vertical'
              : 'horizontal';

            args['collider']['translate-' + collision] = target_position[collision] + args['collider']['collide-range-' + range_axis] * collision_sign;
            args['collider']['change']['translate-' + collision] = 0;

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

                let axis_first_change = webgl_characters[args['target']['attach-to']]['change'][axis_first];
                if(axis_first_change !== 0){
                    args['collider'][axis_first] += axis_first_change;
                }
                let axis_second_change = webgl_characters[args['target']['attach-to']]['change'][axis_second];
                if(axis_second_change !== 0){
                    args['collider'][axis_second] += axis_second_change;
                }
            }
        }
    }

    return true;
}

function webgl_draw(){
    webgl_buffer.clear(webgl_buffer.COLOR_BUFFER_BIT | webgl_buffer.DEPTH_BUFFER_BIT);

    webgl_buffer.disable(webgl_buffer.DEPTH_TEST);
    core_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          webgl_draw_entity(entity);
      },
    });
    webgl_buffer.enable(webgl_buffer.DEPTH_TEST);

    core_group_modify({
      'groups': [
        'particles',
        'foreground',
      ],
      'todo': function(entity){
          if(core_entities[entity]['alpha'] === 1){
              webgl_draw_entity(entity);
          }
      },
    });
    core_group_modify({
      'groups': [
        'particles',
        'foreground',
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

    for(let text in webgl_text){
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

    if(webgl_characters[webgl_character_id]['camera-zoom'] === 0){
        webgl_canvas.fillStyle = '#fff';
        webgl_canvas.fillRect(
          webgl_properties['canvas']['width-half'] - 1,
          webgl_properties['canvas']['height-half'] - 1,
          2,
          2
        );
    }
}

function webgl_draw_entity(entity){
    if(!core_entities[entity]['draw']){
        return;
    }

    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      core_entities[entity]['buffer']['normal']
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
      core_entities[entity]['buffer']['color']
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
      core_entities[entity]['buffer']['vertex']
    );
    webgl_buffer.vertexAttribPointer(
      webgl_properties['attributes']['vec_vertexPosition'],
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
      core_entities[entity]['texture-gl']
    );

    webgl_buffer.uniform1f(
      webgl_properties['shader']['alpha'],
      core_entities[entity]['alpha']
    );
    webgl_buffer.uniformMatrix4fv(
      webgl_properties['shader']['mat_cameraMatrix'],
      false,
      core_matrices[entity]
    );

    webgl_buffer.drawArrays(
      webgl_buffer[core_entities[entity]['draw-type']],
      0,
      core_entities[entity]['vertices-length']
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

    for(let entity in args['entities']){
        let entity_id = core_entity_create({
          'id': args['entities'][entity]['id'],
          'properties': args['entities'][entity],
          'types': args['entities'][entity]['types'],
        });
        core_matrices[entity_id] = core_matrix_create();

        for(let group in args['entities'][entity]['groups']){
            core_group_add({
              'entities': [
                entity_id,
              ],
              'group': args['entities'][entity]['groups'][group],
            });
        }
        delete core_entities[entity_id]['groups'];

        if(core_groups['skybox'][entity_id] === true){
            core_group_remove({
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
            webgl_attach({
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
            let movement = core_move_3d({
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
        let dy = core_entities[args['entity']]['speed'] * args['multiplier'];
        dy *= args['strafe']
          ? -1
          : 1;
        core_entities[args['entity']]['change']['translate-y'] = dy;

    }else{
        let movement = core_move_3d({
          'angle': core_entities[args['entity']]['rotate-' + webgl_properties['gravity-axis']],
          'speed': core_entities[args['entity']]['speed'] * args['multiplier'],
          'strafe': args['strafe'],
        });

        let axis_first = 'translate-x';
        let axis_second = 'translate-z';
        if(webgl_properties['gravity-axis'] === 'x'){
            axis_first = 'y';

        }else if(webgl_properties['gravity-axis'] === 'z'){
            axis_second = 'y';
        }

        core_entities[args['entity']]['change'][axis_first] = movement['x'];
        core_entities[args['entity']]['change'][axis_second] = movement['z'];
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

// Required args: entity
function webgl_entity_radians(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': false,
      },
    });

    let target = args['character']
      ? webgl_characters[args['entity']]
      : core_entities[args['entity']];

    target['rotate-x'] = core_round({
      'number': target['rotate-x'],
    });
    target['rotate-y'] = core_round({
      'number': target['rotate-y'],
    });
    target['rotate-z'] = core_round({
      'number': target['rotate-z'],
    });
    target['rotate-radians-x'] = core_degrees_to_radians({
      'degrees': target['rotate-x'],
    });
    target['rotate-radians-y'] = core_degrees_to_radians({
      'degrees': target['rotate-y'],
    });
    target['rotate-radians-z'] = core_degrees_to_radians({
      'degrees': target['rotate-z'],
    });

    if(args['character']){
        target['camera-rotate-x'] = core_round({
          'number': target['camera-rotate-x'],
        });
        target['camera-rotate-y'] = core_round({
          'number': target['camera-rotate-y'],
        });
        target['camera-rotate-z'] = core_round({
          'number': target['camera-rotate-z'],
        });
        target['camera-rotate-radians-x'] = core_degrees_to_radians({
          'degrees': target['camera-rotate-x'],
        });
        target['camera-rotate-radians-y'] = core_degrees_to_radians({
          'degrees': target['camera-rotate-y'],
        });
        target['camera-rotate-radians-z'] = core_degrees_to_radians({
          'degrees': target['camera-rotate-z'],
        });
    }
}

function webgl_entity_todo(entity){
    core_entities[entity]['id'] = entity;
    core_entities[entity]['vertices-length'] = core_entities[entity]['vertices'].length / 4;

    core_entities[entity]['normals'] = webgl_normals({
      'rotate-x': core_entities[entity]['rotate-x'],
      'rotate-y': core_entities[entity]['rotate-y'],
      'rotate-z': core_entities[entity]['rotate-z'],
      'vertices-length': core_entities[entity]['vertices-length'],
    });

    webgl_entity_radians({
      'entity': entity,
    });

    let textureData = [
      core_entities[entity]['texture-repeat-x'], core_entities[entity]['texture-repeat-y'],
      core_entities[entity]['texture-repeat-x'], 0,
      0, 0,
      0, core_entities[entity]['texture-repeat-y'],
    ];

    while(textureData.length < core_entities[entity]['vertices-length'] * 2){
        textureData.push(
          core_entities[entity]['texture-repeat-x'],
          core_entities[entity]['texture-repeat-y']
        );
    }

    core_entities[entity]['buffer'] = webgl_buffer_set({
      'colorData': core_entities[entity]['vertex-colors'],
      'normalData': core_entities[entity]['normals'],
      'textureData': textureData,
      'vertexData': core_entities[entity]['vertices'],
    });

    webgl_texture_set({
      'entity': entity,
      'texture': core_entities[entity]['texture-id'],
    });
}

// Required args: id
function webgl_extension(args){
    args = core_args({
      'args': args,
      'defaults': {
        'label': args['id'],
      },
    });

    let extension = webgl_buffer.getExtension(args['id']);
    let result = extension !== null;

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

    return {
      'x': window[args['entity']['attach-type']][args['entity']['attach-to']]['translate-x'] + args['entity']['attach-offset-x'],
      'y': window[args['entity']['attach-type']][args['entity']['attach-to']]['translate-y'] + args['entity']['attach-offset-y'],
      'z': window[args['entity']['attach-type']][args['entity']['attach-to']]['translate-z'] + args['entity']['attach-offset-z'],
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
        'jump-movement': 0,
        'multiplier-jump': 1,
        'multiplier-speed': 1,
        'paths': {},
        'spawn-rotate-x': 0,
        'spawn-rotate-y': 0,
        'spawn-rotate-z': 0,
        'spawn-translate-x': 0,
        'spawn-translate-y': 0,
        'spawn-translate-z': 0,
      },
    });

    if(webgl_buffer === 0){
        core_html({
          'parent': document.body,
          'properties': {
            'id': 'canvas',
          },
          'type': 'canvas',
        });
        core_html({
          'parent': document.body,
          'properties': {
            'id': 'buffer',
          },
          'type': 'canvas',
        });

        webgl_buffer = document.getElementById('buffer').getContext(
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
        webgl_canvas = document.getElementById('canvas').getContext(
          '2d',
          {
            'alpha': false,
          }
        );
    }

    // Init extensions.
    webgl_extension({
      'id': 'EXT_texture_filter_anisotropic',
      'label': 'anisotropic',
    });

    core_id_count = 0;
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
      'fog-density': args['fog-density'],
      'fog-state': args['fog-state'],
      'gravity-acceleration': args['gravity-acceleration'],
      'gravity-axis': args['gravity-axis'],
      'gravity-max': args['gravity-max'],
      'jump-movement': args['jump-movement'],
      'multiplier-jump': args['multiplier-jump'],
      'multiplier-speed': args['multiplier-speed'],
      'shader': {},
      'spawn-rotate-x': args['spawn-rotate-x'],
      'spawn-rotate-y': args['spawn-rotate-y'],
      'spawn-rotate-z': args['spawn-rotate-z'],
      'spawn-translate-x': args['spawn-translate-x'],
      'spawn-translate-y': args['spawn-translate-y'],
      'spawn-translate-z': args['spawn-translate-z'],
    };

    core_matrices['camera'] = core_matrix_create();
    core_matrices['perspective'] = core_matrix_create();

    window.onresize = webgl_resize;
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

    core_group_create({
      ids: [
        'foreground',
        'particles',
        'skybox',
        'webgl',
      ],
    });
    core_entity_set({
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
        'attach-type': 'core_entities',
        'billboard': false,
        'change': {
          'translate-x': 0,
          'translate-y': 0,
          'translate-z': 0,
        },
        'collide-damage': 0,
        'collide-range-horizontal': 2,
        'collide-range-vertical': 3,
        'collides': false,
        'collision': true,
        'draw': true,
        'draw-type': 'TRIANGLE_FAN',
        'gravity': false,
        'item-amount': 1,
        'item-entities': [],
        'item-id': false,
        'item-spell': false,
        'item-spellproperties': {},
        'item-stats': {},
        'normals': [],
        'path-direction': 1,
        'path-end': false,
        'path-id': false,
        'path-point': 0,
        'rotate-radians-x': 0,
        'rotate-radians-y': 0,
        'rotate-radians-z': 0,
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'scale-x': 1,
        'scale-y': 1,
        'scale-z': 1,
        'spawn-entity': false,
        'spawn-interval-current': 0,
        'spawn-interval-max': 100,
        'speed': .2,
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

    webgl_diagonal = Math.sin(core_degrees_to_radians({
      'degrees': 45,
    })) / Math.sin(core_degrees_to_radians({
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

function webgl_init_character(args){
    args = core_args({
      'args': args,
      'defaults': {
        'camera-zoom': 50,
        'change': {},
        'collide-range-horizontal': 2,
        'collide-range-vertical': 3,
        'collides': true,
        'entities': [],
        'experience': 0,
        'health-current': 100,
        'health-max': 100,
        'id': webgl_character_id,
        'inventory': false,
        'jump-height': .6,
        'level': -1,
        'path-direction': 1,
        'path-end': false,
        'path-id': false,
        'path-point': 0,
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'speed': .2,
        'talk': false,
        'talk-range': 15,
        'trade': [],
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    webgl_characters[args['id']] = {
      'camera-rotate-radians-x': 0,
      'camera-rotate-radians-y': 0,
      'camera-rotate-radians-z': 0,
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
      'entities': args['entities'],
      'experience': args['experience'],
      'health-current': Math.max(
        args['health-current'],
        1
      ),
      'health-max': args['health-max'],
      'id': args['id'],
      'inventory': {},
      'jump-allow': false,
      'jump-height': args['jump-height'],
      'level': args['level'],
      'path-direction': args['path-direction'],
      'path-end': args['path-end'],
      'path-id': args['path-id'],
      'path-point': args['path-point'],
      'rotate-radians-x': 0,
      'rotate-radians-y': 0,
      'rotate-radians-z': 0,
      'rotate-x': args['rotate-x'],
      'rotate-y': args['rotate-y'],
      'rotate-z': args['rotate-z'],
      'speed': args['speed'],
      'talk': args['talk'],
      'talk-range': args['talk-range'],
      'trade': args['trade'],
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'],
      'translate-z': args['translate-z'],
    };
    webgl_characters[args['id']]['change']['translate-x'] = args['change']['translate-x'] || 0;
    webgl_characters[args['id']]['change']['translate-y'] = args['change']['translate-y'] || 0;
    webgl_characters[args['id']]['change']['translate-z'] = args['change']['translate-z'] || 0;
    webgl_entity_radians({
      'character': true,
      'entity': args['id'],
    });
    if(args['inventory'] !== false){
        Object.assign(
          webgl_characters[args['id']]['inventory'],
          args['inventory']
        );
    }
    webgl_character_count++;

    webgl_entity_create({
      'character': args['id'],
      'entities': webgl_characters[args['id']]['entities'],
    });
}

// Required args: item
function webgl_item_equip(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'equip': true,
      },
    });

    if(webgl_characters[args['character']]['health-current'] <= 0){
        return;
    }

    let item = webgl_characters[args['character']]['inventory'][args['item']];

    if(!item
      || item['equipped'] === args['equip']){
        return;
    }

    item['equipped'] = args['equip'];

    let stats = item['stats'];
    for(let stat in stats){
        let dstat = stats[stat];
        if(!args['equip']){
            dstat *= -1;
        }

        webgl_characters[args['character']][stat] += dstat;
    }

    for(let entity in item['entities']){
        let entity_id = '_item-' + args['character'] + '-' + args['item'] + '-' + entity;

        if(args['equip']){
            let properties = {};
            Object.assign(
              properties,
              item['entities'][entity]
            );
            properties['id'] = entity_id;

            webgl_entity_create({
              'character': args['character'],
              'entities': [
                properties,
              ],
            });

            webgl_characters[args['character']]['entities'].push(properties);

            continue;
        }

        core_entity_remove({
          'entities': [
            entity_id,
          ],
        });

        for(let character_entity in webgl_characters[args['character']]['entities']){
            if(webgl_characters[args['character']]['entities'][character_entity]['id'] === entity_id){
                webgl_characters[args['character']]['entities'].splice(
                  character_entity,
                  1
                );

                break;
            }
        }
    }
}

// Required args: item
function webgl_item_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'entities': [],
        'spell': false,
        'spellproperties': {},
        'stats': {},
      },
    });

    let properties = {
      'amount': 0,
      'entities': args['entities'].slice(),
      'equipped': false,
      'spell': args['spell'],
      'spellproperties': {},
      'stats': {},
    };

    Object.assign(
      properties['spellproperties'],
      args['spellproperties']
    );
    Object.assign(
      properties['stats'],
      args['stats']
    );

    webgl_characters[args['character']]['inventory'][args['item']] = properties;
}

// Required args: character-0, character-1, item-0-amount, item-0-id, item-1-amount, item-1-id
function webgl_item_trade(args){
    let inventory_0 = webgl_characters[args['character-0']]['inventory'];
    let inventory_1 = webgl_characters[args['character-1']]['inventory'];

    if(webgl_characters[args['character-0']] === void 0
      || webgl_characters[args['character-1']] === void 0
      || webgl_characters[args['character-0']]['health-current'] <= 0
      || webgl_characters[args['character-1']]['health-current'] <= 0
      || !inventory_0[args['item-0-id']]
      || !inventory_1[args['item-1-id']]
      || inventory_0[args['item-0-id']]['amount'] < args['item-0-amount']
      || inventory_1[args['item-1-id']]['amount'] < args['item-1-amount']){
        return;
    }

    if(inventory_0[args['item-0-id']]['equipped']){
        webgl_item_equip({
          'character': args['character-0'],
          'equip': false,
          'item': args['item-0-id'],
        });
    }
    if(inventory_1[args['item-1-id']]['equipped']){
        webgl_item_equip({
          'character': args['character-1'],
          'equip': false,
          'item': args['item-1-id'],
        });
    }

    inventory_0[args['item-0-id']]['amount'] -= args['item-0-amount'];
    inventory_1[args['item-1-id']]['amount'] -= args['item-1-amount'];

    if(!inventory_0[args['item-1-id']]){
        webgl_item_reset({
          'character': args['character-0'],
          'entities': inventory_1[args['item-1-id']]['entities'],
          'item': args['item-1-id'],
          'spell': inventory_1[args['item-1-id']]['spell'],
          'stats': inventory_1[args['item-1-id']]['stats'],
        });
    }
    if(!inventory_1[args['item-0-id']]){
        webgl_item_reset({
          'character': args['character-1'],
          'entities': inventory_0[args['item-0-id']]['entities'],
          'item': args['item-0-id'],
          'spell': inventory_0[args['item-0-id']]['spell'],
          'stats': inventory_0[args['item-0-id']]['stats'],
        });
    }
    inventory_0[args['item-1-id']]['amount'] += args['item-1-amount'];
    inventory_1[args['item-0-id']]['amount'] += args['item-0-amount'];

    if(inventory_0[args['item-0-id']]['amount'] === 0){
        delete inventory_0[args['item-0-id']];
    }
    if(inventory_1[args['item-1-id']]['amount'] === 0){
        delete inventory_1[args['item-1-id']];
    }
}

function webgl_json_export(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': true,
        'target': 'exported',
      },
    });

    let json = {};

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

        delete json['character']['camera-rotate-radians-x'];
        delete json['character']['camera-rotate-radians-y'];
        delete json['character']['camera-rotate-radians-z'];
        delete json['character']['camera-rotate-x'];
        delete json['character']['camera-rotate-y'];
        delete json['character']['camera-rotate-z'];
        delete json['character']['jump-allow'];
        delete json['character']['rotate-radians-x'];
        delete json['character']['rotate-radians-y'];
        delete json['character']['rotate-radians-z'];
        delete json['character']['rotate-x'];
        delete json['character']['rotate-y'];
        delete json['character']['rotate-z'];
        delete json['character']['translate-x'];
        delete json['character']['translate-y'];
        delete json['character']['translate-z'];

        json['entities'] = [];
        for(let entity in webgl_character_homebase['entities']){
            let entity_json = {};
            entity_json['id'] = webgl_character_homebase['entities'][entity]['id'];

            Object.assign(
              entity_json,
              webgl_character_homebase['entities'][entity]
            );

            delete entity_json['buffer'];
            delete entity_json['normals'];
            delete entity_json['rotate-radians-x'];
            delete entity_json['rotate-radians-y'];
            delete entity_json['rotate-radians-z'];
            delete entity_json['texture-gl'];
            delete entity_json['vertices-length'];

            json['entities'].push(entity_json);
        }

    }else{
        json['entities'] = [];
        for(let entity in core_entities){
            let entity_json = {};
            entity_json['id'] = core_entities[entity]['id'];

            Object.assign(
              entity_json,
              core_entities[entity]
            );

            delete entity_json['buffer'];
            delete entity_json['normals'];
            delete entity_json['rotate-radians-x'];
            delete entity_json['rotate-radians-y'];
            delete entity_json['rotate-radians-z'];
            delete entity_json['texture-gl'];
            delete entity_json['vertices-length'];

            json['entities'].push(entity_json);
        }
    }

    document.getElementById(args['target']).value = JSON.stringify(json);
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

    }else if(args['character'] === 0
      && webgl_character_level() < -1){
        return;
    }

    if(args['json']['randomized']){
        for(let i in args['json']['randomized']){
            let randomized = core_random_number({
              'multiplier': args['json']['randomized'][i]['max'] - args['json']['randomized'][i]['min'],
            }) + args['json']['randomized'][i]['min'];

            for(let id in args['json']['randomized'][i]['ids']){
                let targets = args['json'][args['json']['randomized'][i]['character'] === true
                  ? 'characters'
                  : 'entities'];

                for(let target in targets){
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

    webgl_level_unload();

    webgl_init(args['json']);

    if(args['json']['characters']
      && args['json']['characters'] !== false){
        for(let character in args['json']['characters']){
            webgl_init_character(args['json']['characters'][character]);
        }
    }

    if(args['character'] === -1){
        webgl_init_character({
          'camera-zoom': 0,
          'entities': [],
          'id': webgl_character_id,
        });
        webgl_character_homebase = {};
        webgl_properties['camera-zoom-max'] = 0;

    }else if(webgl_characters[webgl_character_id] === void 0){
        webgl_init_character({
          'level': args['character'],
        });

    }else{
        webgl_init_character(webgl_characters[webgl_character_id]);
    }

    if(args['character'] === 1){
        webgl_character_homebase['characters'] = {};
        Object.assign(
          webgl_character_homebase['characters'],
          webgl_characters
        );
        webgl_character_homebase['properties'] = webgl_properties;
    }

    webgl_entity_create({
      'entities': args['json']['entities'],
    });
    for(let prefab in args['json']['prefabs']){
        window['webgl_prefab_' + args['json']['prefabs'][prefab]['type']](args['json']['prefabs'][prefab]['properties']);
    }

    webgl_character_spawn();
    core_call({
      'todo': 'repo_level_load',
    });
    core_escape();
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

    if(typeof args['json'] === 'object'){
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

    webgl_level_init({
      'character': args['character'],
      'json': JSON.parse(args['json']),
    });

    if(args['cache'] !== false){
        webgl_levelcache['id'] = args['cache'];
        webgl_levelcache['json'] = args['json'];
    }
}

function webgl_level_unload(){
    if(webgl_character_homebase['properties'] !== void 0){
        Object.assign(
          webgl_character_homebase['characters'][webgl_character_id],
          webgl_characters[webgl_character_id]
        );
    }

    for(let character in webgl_characters){
        if(character !== webgl_character_id){
            delete webgl_characters[character];
        }
    }
    webgl_character_count = 0;
    core_entity_remove_all();
    webgl_paths = {};
    core_storage_save();
}

function webgl_logicloop(){
    if(webgl_character_level() > -2
      && webgl_characters[webgl_character_id]['health-current'] > 0
      && webgl_characters[webgl_character_id]['path-id'] === false){
        let leftright = 0;

        if(core_keys[core_storage_data['move-←']]['state']){
            if(webgl_properties['camera-zoom-max'] === 0
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
            if(webgl_properties['camera-zoom-max'] === 0
              || core_mouse['down-2']){
                leftright += 1;

            }else{
                webgl_camera_rotate({
                  'camera': !core_mouse['down-0'],
                  'y': 5,
                });
            }
        }

        if((webgl_characters[webgl_character_id]['jump-allow']
            && webgl_characters[webgl_character_id]['change']['translate-' + webgl_properties['gravity-axis']] === 0)
          || webgl_character_level() === -1
          || webgl_properties['jump-movement'] > 0){
            let forwardback = 0;

            if(core_keys[core_storage_data['move-↓']]['state']){
                forwardback = .5;
                leftright *= .5;
            }

            if(core_keys[core_storage_data['move-↑']]['state']){
                forwardback = forwardback === 0
                  ? -1
                  : 0;
            }

            if(webgl_character_level() === -1){
                if(core_keys[32]['state']){
                    webgl_entity_move({
                      'y': true,
                    });
                }

                if(core_keys[67]['state']){
                    webgl_entity_move({
                      'strafe': true,
                      'y': true,
                    });
                }

            }else if(core_keys[32]['state']){
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

    repo_logic();

    let npc_talk = '';
    let npc_trade = '';
    for(let character in webgl_characters){
        if(webgl_character_level({
            'character': character,
          }) > -1){
            webgl_characters[character]['change']['translate-' + webgl_properties['gravity-axis']] = Math.max(
              webgl_characters[character]['change']['translate-' + webgl_properties['gravity-axis']] + webgl_properties['gravity-acceleration'],
              webgl_properties['gravity-max']
            );
        }

        if(webgl_characters[character]['collides']){
            for(let entity in core_entities){
                if(core_entities[entity]['collision']){
                    webgl_collision({
                      'collider': webgl_characters[character],
                      'target': core_entities[entity],
                    });
                }
            }
        }

        if(character !== webgl_character_id
          && (webgl_characters[character]['talk'] !== false
            || webgl_characters[character]['trade'].length > 0)){
            if(core_distance({
                'x0': webgl_characters[webgl_character_id]['translate-x'],
                'y0': webgl_characters[webgl_character_id]['translate-y'],
                'z0': webgl_characters[webgl_character_id]['translate-z'],
                'x1': webgl_characters[character]['translate-x'],
                'y1': webgl_characters[character]['translate-y'],
                'z1': webgl_characters[character]['translate-z'],
              }) < webgl_characters[character]['talk-range']){
                if(webgl_characters[character]['talk'] !== false){
                    npc_talk = webgl_characters[character]['talk'];
                }
                if(webgl_characters[character]['trade'].length > 0){
                    npc_trade = character;
                }
            }
        }
    }
    core_ui_update({
      'ids': {
        'npc-talk': npc_talk,
      },
    });

    if(npc_trade === ''){
        webgl_character_trading = '';
        core_ui_update({
          'ids': {
            'npc-trade': '',
          },
        });

    }else if(npc_trade !== webgl_character_trading){
        webgl_character_trading = npc_trade;
        let npc_trades = webgl_characters[npc_trade]['trade'];

        let elements = {};
        npc_trade = '<table>';
        for(let trade in npc_trades){
            if(webgl_characters[webgl_character_trading]['inventory'][npc_trades[trade]['give-id']]['amount'] < npc_trades[trade]['give-amount']){
                continue;
            }

            npc_trade += '<tr><td><input id=npc-trade-' + trade + ' type=button value=Trade>'
              + '<td>[' + npc_trades[trade]['get-amount'] + ' ' + npc_trades[trade]['get-id']
                + '] for [' + npc_trades[trade]['give-amount'] + ' ' + npc_trades[trade]['give-id'] + ']';

            elements['npc-trade-' + trade] = {
              'onclick': function(){
                  webgl_item_trade({
                    'character-0': webgl_character_id,
                    'character-1': webgl_character_trading,
                    'item-0-amount': npc_trades[trade]['get-amount'],
                    'item-0-id': npc_trades[trade]['get-id'],
                    'item-1-amount': npc_trades[trade]['give-amount'],
                    'item-1-id': npc_trades[trade]['give-id'],
                  });
              },
            }
        }
        npc_trade += '</table>';

        core_ui_update({
          'ids': {
            'npc-trade': npc_trade,
          },
        });

        core_events_bind({
          'elements': elements,
        });
    }

    core_group_modify({
      'groups': [
        'webgl',
      ],
      'todo': function(entity){
          webgl_logicloop_handle_entity(entity);
      },
    });

    core_group_modify({
      'groups': [
        'particles',
      ],
      'todo': function(entity){
          webgl_entity_move({
            'entity': entity,
            'multiplier': -1,
          });

          let remove = false;

          core_entities[entity]['lifespan'] -= 1;
          if(core_entities[entity]['lifespan'] <= 0){
              remove = true;

          }else{
              for(let character in webgl_characters){
                  if(webgl_character_level({
                      'character': character,
                    }) < 0
                    || core_entities[entity]['parent'] === character){
                      continue;
                  }

                  if(core_distance({
                      'x0': webgl_characters[character]['translate-x'],
                      'y0': webgl_characters[character]['translate-y'],
                      'z0': webgl_characters[character]['translate-z'],
                      'x1': core_entities[entity]['translate-x'],
                      'y1': core_entities[entity]['translate-y'],
                      'z1': core_entities[entity]['translate-z'],
                    }) < Math.max(
                      webgl_characters[character]['collide-range-horizontal'],
                      webgl_characters[character]['collide-range-vertical']
                    )){
                      webgl_character_damage({
                        'character': character,
                        'damage': core_entities[entity]['collide-damage'],
                      });
                      remove = true;
                      break;
                  }
              }
          }

          if(remove){
              core_entity_remove({
                'entities': [
                  entity,
                ],
              });
          }
      },
    });

    for(let character in webgl_characters){
        webgl_path_move({
          'entity': webgl_characters[character],
        });

        for(let change in webgl_characters[character]['change']){
            webgl_characters[character][change] = core_round({
              'number': webgl_characters[character][change] + webgl_characters[character]['change'][change],
            });
        }

        webgl_characters[character]['camera-x'] = webgl_characters[character]['translate-x'];
        webgl_characters[character]['camera-y'] = webgl_characters[character]['translate-y'];
        webgl_characters[character]['camera-z'] = webgl_characters[character]['translate-z'];

        if(webgl_characters[character]['camera-zoom'] > 0){
            let cos = Math.cos(webgl_characters[character]['camera-rotate-radians-x']);

            webgl_characters[character]['camera-x'] += Math.sin(-webgl_characters[character]['camera-rotate-radians-y']) * webgl_characters[character]['camera-zoom'] * cos;
            webgl_characters[character]['camera-y'] += Math.sin(webgl_characters[character]['camera-rotate-radians-x']) * webgl_characters[character]['camera-zoom'];
            webgl_characters[character]['camera-z'] += Math.cos(webgl_characters[character]['camera-rotate-radians-y']) * webgl_characters[character]['camera-zoom'] * cos;
        }
    }

    if(webgl_character_level() === -1){
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

    core_matrix_identity({
      'id': 'camera',
    });
    core_matrix_rotate({
      'dimensions': [
        webgl_characters[webgl_character_id]['camera-rotate-radians-x'],
        webgl_characters[webgl_character_id]['camera-rotate-radians-y'],
        webgl_characters[webgl_character_id]['camera-rotate-radians-z'],
      ],
      'id': 'camera',
    });
    core_matrix_translate({
      'dimensions': [
        webgl_characters[webgl_character_id]['camera-x'],
        webgl_characters[webgl_character_id]['camera-y'],
        webgl_characters[webgl_character_id]['camera-z'],
      ],
      'id': 'camera',
    });

    webgl_buffer.uniformMatrix4fv(
      webgl_properties['shader']['mat_perspectiveMatrix'],
      false,
      core_matrices['perspective']
    );
}

function webgl_logicloop_handle_entity(entity){
    if(core_entities[entity]['logic']){
        core_entities[entity]['logic']();
    }

    if(core_entities[entity]['attach-to'] !== false){
        let target = core_entities[entity]['attach-type'] === 'webgl_characters'
          ? webgl_characters[core_entities[entity]['attach-to']]
          : core_entities[core_entities[entity]['attach-to']];

        let x = target['translate-x'];
        let y = target['translate-y'];
        let z = target['translate-z'];
        if(core_groups['skybox'][entity] === true){
            x = target['camera-x'];
            y = target['camera-y'];
            z = target['camera-z'];
        }

        core_entities[entity]['translate-x'] = x;
        core_entities[entity]['translate-y'] = y;
        core_entities[entity]['translate-z'] = z;

    }else{
        webgl_path_move({
          'entity': core_entities[entity],
        });

        if(core_entities[entity]['gravity']){
            core_entities[entity]['change']['translate-' + webgl_properties['gravity-axis']] = Math.max(
              core_entities[entity]['change']['translate-' + webgl_properties['gravity-axis']] + webgl_properties['gravity-acceleration'],
              webgl_properties['gravity-max']
            );
        }

        for(let change in core_entities[entity]['change']){
            core_entities[entity][change] = core_round({
              'number': core_entities[entity][change] + core_entities[entity]['change'][change],
            });
        }
    }

    if(core_entities[entity]['billboard'] !== false){
        webgl_billboard({
          'axes': core_entities[entity]['billboard'],
          'entity': entity,
        });
    }

    if(core_entities[entity]['collides']){
        for(let other_entity in core_entities){
            if(core_entities[other_entity]['collision']
              && entity !== other_entity){
                if(!webgl_collision({
                    'collider': core_entities[entity],
                    'target': core_entities[other_entity],
                  })){
                    return;
                }
            }
        }
    }

    if(core_entities[entity]['spawn-entity'] !== false){
        core_entities[entity]['spawn-interval-current']++;

        if(core_entities[entity]['spawn-interval-current'] >= core_entities[entity]['spawn-interval-max']){
            core_entities[entity]['spawn-interval-current'] = 0;

            webgl_particles_create({
              'parent': core_entities[entity],
              'rotate-x': core_entities[entity]['rotate-x'],
              'rotate-y': core_entities[entity]['rotate-y'],
              'rotate-z': core_entities[entity]['rotate-z'],
              'translate-x': core_entities[entity]['translate-x'],
              'translate-y': core_entities[entity]['translate-y'],
              'translate-z': core_entities[entity]['translate-z'],
            });
        }
    }

    core_matrix_clone({
      'id': 'camera',
      'to': entity,
    });
    core_matrix_translate({
      'dimensions': [
        -core_entities[entity]['translate-x'],
        -core_entities[entity]['translate-y'],
        -core_entities[entity]['translate-z'],
      ],
      'id': entity,
    });
    if(core_entities[entity]['attach-to'] !== false
      && core_entities[entity]['billboard'] === false){
        if(core_entities[entity]['attach-type'] === 'webgl_characters'){
            if(!core_groups['skybox'][entity]){
                core_matrix_rotate({
                  'dimensions': [
                    webgl_characters[core_entities[entity]['attach-to']]['rotate-radians-x'],
                    -webgl_characters[core_entities[entity]['attach-to']]['rotate-radians-y'],
                    webgl_characters[core_entities[entity]['attach-to']]['rotate-radians-z'],
                  ],
                  'id': entity,
                });
            }

        }else{
            core_matrix_rotate({
              'dimensions': [
                core_entities[core_entities[entity]['attach-to']]['rotate-radians-x'],
                core_entities[core_entities[entity]['attach-to']]['rotate-radians-y'],
                core_entities[core_entities[entity]['attach-to']]['rotate-radians-z'],
              ],
              'id': entity,
            });
        }

        core_matrix_translate({
          'dimensions': [
            -core_entities[entity]['attach-offset-x'],
            -core_entities[entity]['attach-offset-y'],
            -core_entities[entity]['attach-offset-z'],
          ],
          'id': entity,
        });
    }
    core_matrix_rotate({
      'dimensions': [
        core_entities[entity]['rotate-radians-x'],
        core_entities[entity]['rotate-radians-y'],
        core_entities[entity]['rotate-radians-z'],
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

    let normal_x = 0;
    let normal_y = 0;
    let normal_z = 0;

    if(args['rotate-x'] !== 0){
        normal_z = core_round({
          'number': Math.sin(core_degrees_to_radians({
            'degrees': args['rotate-x'],
          })),
        });
        normal_y = core_round({
          'number': Math.cos(core_degrees_to_radians({
            'degrees': args['rotate-x'],
          })),
        });

    }else if(args['rotate-z'] !== 0){
        normal_x = -core_round({
          'number': Math.sin(core_degrees_to_radians({
            'degrees': args['rotate-z'],
          })),
        });
        normal_y = core_round({
          'number': Math.cos(core_degrees_to_radians({
            'degrees': args['rotate-z'],
          })),
        });

    }else{
        normal_y = 1;
    }

    let normals = [];
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
        let position = webgl_get_translation({
          'entity': args['parent'],
        });

        let id = core_entity_create({
          'properties': {
            'collide-range-horizontal': args['collide-range'],
            'collide-range-vertical': args['collide-range'],
            'collides': args['collides'],
            'draw-type': 'POINTS',
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
            'vertices': [0, 0, 0, 1],
          },
        });
        core_matrices[id] = core_matrix_create();
        webgl_entity_radians({
          'entity': id,
        });
        core_group_move({
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
    if(args['entity']['path-id'] === false
      || webgl_paths[args['entity']['path-id']] === void 0){
        return;
    }

    let path = webgl_paths[args['entity']['path-id']];
    let point = core_handle_defaults({
      'default': {
        'speed': 1,
        'translate-x': args['entity']['translate-x'],
        'translate-y': args['entity']['translate-y'],
        'translate-z': args['entity']['translate-z'],
      },
      'var': path['points'][args['entity']['path-point']],
    });

    let angle_xz = core_point_angle({
      'x0': args['entity']['translate-x'],
      'x1': point['translate-x'],
      'y0': args['entity']['translate-z'],
      'y1': point['translate-z'],
    });
    let angle_y = core_point_angle({
      'x0': args['entity']['translate-x'],
      'x1': point['translate-x'],
      'y0': args['entity']['translate-y'],
      'y1': point['translate-y'],
    });

    let speed = args['entity']['speed'] * point['speed'];

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

    if(core_distance({
        'x0': args['entity']['translate-x'],
        'y0': args['entity']['translate-y'],
        'z0': args['entity']['translate-z'],
        'x1': point['translate-x'],
        'y1': point['translate-y'],
        'z1': point['translate-z'],
      }) < Math.max(
         args['entity']['collide-range-horizontal'],
         args['entity']['collide-range-vertical']
      )){
        args['entity']['change']['translate-x'] = 0;
        args['entity']['change']['translate-y'] = 0;
        args['entity']['change']['translate-z'] = 0;
        args['entity']['translate-x'] = point['translate-x'];
        args['entity']['translate-y'] = point['translate-y'];
        args['entity']['translate-z'] = point['translate-z'];

        if(args['entity']['path-direction'] > 0){
            if(args['entity']['path-point'] >= path['points'].length - 1){
                let end = args['entity']['path-end'] !== false
                  ? args['entity']['path-end']
                  : path['end'];

                if(end === 2){
                    args['entity']['path-point'] = 1;
                    args['entity']['translate-x'] = path['points'][0]['translate-x'];
                    args['entity']['translate-y'] = path['points'][0]['translate-y'];
                    args['entity']['translate-z'] = path['points'][0]['translate-z'];

                }else if(end === 1){
                    args['entity']['path-point'] = 0;

                }else if(end === -1){
                    args['entity']['path-direction'] = -1;
                    args['entity']['path-point'] -= 1;

                }else{
                    args['entity']['path-id'] = false;
                    args['entity']['path-point'] = 0;
                }

            }else{
                args['entity']['path-point'] += 1;
            }

        }else if(args['entity']['path-point'] <= 0){
            let end = args['entity']['path-end'] !== false
              ? args['entity']['path-end']
              : path['end'];

            if(end === 2){
                args['entity']['path-point'] = path['points'].length - 2;
                args['entity']['translate-x'] = path['points'][args['entity']['path-point']]['translate-x'];
                args['entity']['translate-y'] = path['points'][args['entity']['path-point']]['translate-y'];
                args['entity']['translate-z'] = path['points'][args['entity']['path-point']]['translate-z'];

            }else if(end === 1){
                args['entity']['path-point'] = path['points'].length - 1;

            }else if(end === -1){
                args['entity']['path-direction'] = 1;
                args['entity']['path-point'] += 1;

            }else{
                args['entity']['path-id'] = false;
                args['entity']['path-point'] = 0;
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
        'path-direction': 1,
        'path-end': false,
        'path-id': false,
        'path-point': 0,
      },
    });

    args['entity']['path-direction'] = args['path-direction'];
    args['entity']['path-end'] = args['path-end'];
    args['entity']['path-id'] = args['path-id'];
    args['entity']['path-point'] = args['path-point'];
}

function webgl_perspective(){
    core_matrices['perspective'][0] = webgl_properties['canvas']['height'] / webgl_properties['canvas']['width'];
    core_matrices['perspective'][5] = 1;
    core_matrices['perspective'][10] = -1;
    core_matrices['perspective'][11] = -1;
    core_matrices['perspective'][14] = -2;
}

// Required args: x, y
function webgl_pick_color(args){
    let pixelarray = new Uint8Array(4);

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

function webgl_prefab_cuboid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'all-alpha': false,
        'all-collision': true,
        'all-vertex-colors': false,
        'back-alpha': 1,
        'back-collision': false,
        'back-vertex-colors': false,
        'bottom-alpha': 1,
        'bottom-collision': false,
        'bottom-vertex-colors': false,
        'character': webgl_character_id,
        'exclude': {},
        'front-alpha': 1,
        'front-collision': false,
        'front-vertex-colors': false,
        'groups': [],
        'left-alpha': 1,
        'left-collision': false,
        'left-vertex-colors': false,
        'prefix': core_id_count,
        'properties': {},
        'random-colors': false,
        'right-alpha': 1,
        'right-collision': false,
        'right-vertex-colors': false,
        'size-x': 1,
        'size-y': 1,
        'size-z': 1,
        'top-alpha': 1,
        'top-collision': false,
        'top-vertex-colors': false,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    let half_size_x = args['size-x'] / 2;
    let half_size_y = args['size-y'] / 2;
    let half_size_z = args['size-z'] / 2;
    let vertices_size_x = Math.abs(half_size_x);
    let vertices_size_y = Math.abs(half_size_y);
    let vertices_size_z = Math.abs(half_size_z);
    let properties = {
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'groups': args['groups'],
    };
    for(let property in args['properties']){
        properties[property] = args['properties'][property];
    }

    if(args['all-alpha'] !== false){
        args['back-alpha'] = args['all-alpha'];
        args['bottom-alpha'] = args['all-alpha'];
        args['front-alpha'] = args['all-alpha'];
        args['left-alpha'] = args['all-alpha'];
        args['right-alpha'] = args['all-alpha'];
        args['top-alpha'] = args['all-alpha'];
    }
    if(args['all-vertex-colors'] !== false){
        args['back-vertex-colors'] = args['all-vertex-colors'];
        args['bottom-vertex-colors'] = args['all-vertex-colors'];
        args['front-vertex-colors'] = args['all-vertex-colors'];
        args['left-vertex-colors'] = args['all-vertex-colors'];
        args['right-vertex-colors'] = args['all-vertex-colors'];
        args['top-vertex-colors'] = args['all-vertex-colors'];
    }

    // Top.
    properties['vertices'] = [
      vertices_size_x, 0, -vertices_size_z, 1,
      -vertices_size_x, 0, -vertices_size_z, 1,
      -vertices_size_x, 0, vertices_size_z, 1,
      vertices_size_x, 0, vertices_size_z, 1
    ];
    if(args['exclude']['top'] !== true){
        properties['alpha'] = args['top-alpha'];
        properties['attach-offset-y'] = args['translate-y'] + half_size_y;
        properties['collision'] = args['top-collision'] || args['all-collision'];
        properties['id'] = args['prefix'] + '-top';
        properties['vertex-colors'] = args['top-vertex-colors'] || webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    // Bottom.
    properties['rotate-x'] = 180;
    if(args['exclude']['bottom'] !== true){
        properties['alpha'] = args['bottom-alpha'];
        properties['attach-offset-y'] = args['translate-y'] - half_size_y;
        properties['collision'] = args['bottom-collision'] || args['all-collision'];
        properties['id'] = args['prefix'] + '-bottom';
        properties['vertex-colors'] = args['bottom-vertex-colors'] || webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    // Front.
    properties['attach-offset-y'] = 0;
    properties['rotate-x'] = 90;
    properties['vertices'] = [
      vertices_size_x, 0, -vertices_size_y, 1,
      -vertices_size_x, 0, -vertices_size_y, 1,
      -vertices_size_x, 0, vertices_size_y, 1,
      vertices_size_x, 0, vertices_size_y, 1
    ];
    if(args['exclude']['front'] !== true){
        properties['alpha'] = args['front-alpha'];
        properties['attach-offset-y'] = args['translate-y'];
        properties['attach-offset-z'] = args['translate-z'] + half_size_z;
        properties['collision'] = args['front-collision'] || args['all-collision'];
        properties['id'] = args['prefix'] + '-front';
        properties['vertex-colors'] = args['front-vertex-colors'] || webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    // Back.
    properties['rotate-x'] = 270;
    if(args['exclude']['back'] !== true){
        properties['alpha'] = args['back-alpha'];
        properties['attach-offset-z'] = args['translate-z'] - half_size_z;
        properties['collision'] = args['back-collision'] || args['all-collision'];
        properties['id'] = args['prefix'] + '-back';
        properties['vertex-colors'] = args['back-vertex-colors'] || webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    // Left.
    properties['attach-offset-z'] = 0;
    properties['rotate-x'] = 0;
    properties['rotate-z'] = 90;
    properties['vertices'] = [
      vertices_size_y, 0, -vertices_size_z, 1,
      -vertices_size_y, 0, -vertices_size_z, 1,
      -vertices_size_y, 0, vertices_size_z, 1,
      vertices_size_y, 0, vertices_size_z, 1
    ];
    if(args['exclude']['left'] !== true){
        properties['alpha'] = args['left-alpha'];
        properties['attach-offset-x'] = args['translate-x'] - half_size_x;
        properties['attach-offset-z'] = args['translate-z'];
        properties['collision'] = args['left-collision'] || args['all-collision'];
        properties['id'] = args['prefix'] + '-left';
        properties['vertex-colors'] = args['left-vertex-colors'] || webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }

    // Right.
    properties['rotate-z'] = 270;
    if(args['exclude']['right'] !== true){
        properties['alpha'] = args['right-alpha'];
        properties['attach-offset-x'] = args['translate-x'] + half_size_x;
        properties['collision'] = args['right-collision'] || args['all-collision'];
        properties['id'] = args['prefix'] + '-right';
        properties['vertex-colors'] = args['right-vertex-colors'] || webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }
}

// Required args: prefix
function webgl_prefab_cuboid_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'collision-leaves': true,
        'collision-trunk': true,
        'leaves-size-x': 10,
        'leaves-size-y': 10,
        'leaves-size-z': 10,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'trunk-size-x': 2,
        'trunk-size-y': 10,
        'trunk-size-z': 2,
        'vertex-colors-leaves': [
          0, 1, 0, 1,
          0, 1, 0, 1,
          0, 1, 0, 1,
          0, 1, 0, 1,
        ],
        'vertex-colors-trunk': [
          1, .5, 0, 1,
          1, .5, 0, 1,
          1, .5, 0, 1,
          1, .5, 0, 1,
        ],
      },
    });

    webgl_prefab_cuboid({
      'all-collision': args['collision-trunk'],
      'all-vertex-colors': args['vertex-colors-trunk'],
      'character': args['character'],
      'exclude': {
        'bottom': true,
        'top': true,
      },
      'prefix': args['prefix'] + '-trunk',
      'properties': {
        'texture-id': 'wood.png',
        'texture-repeat-y': 2,
      },
      'size-x': args['trunk-size-x'],
      'size-y': args['trunk-size-y'],
      'size-z': args['trunk-size-z'],
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'] + args['trunk-size-y'] / 2,
      'translate-z': args['translate-z'],
    });
    webgl_prefab_cuboid({
      'all-collision': args['collision-leaves'],
      'all-vertex-colors': args['vertex-colors-leaves'],
      'character': args['character'],
      'prefix': args['prefix'] + '-leaves',
      'properties': {
        'texture-id': 'lavaleaf.png',
      },
      'size-x': args['leaves-size-x'],
      'size-y': args['leaves-size-y'],
      'size-z': args['leaves-size-z'],
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'] + args['trunk-size-y'] + args['leaves-size-y'] / 2,
      'translate-z': args['translate-z'],
    });
}

// Required args: prefix
function webgl_prefab_lines_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'trunk-branch-max': 4,
        'trunk-branch-min': 0,
        'trunk-count-max': 10,
        'trunk-count-min': 1,
        'trunk-length': 10,
        'trunk-width-max': 2,
        'trunk-width-min': 1,
        'vertex-colors-leaves': [
          0, .5, 0, 1,
          0, .5, 0, 1,
          0, .5, 0, 1,
          0, .5, 0, 1,
        ],
        'vertex-colors-trunk': [
          .4, .2, 0, 1,
          .4, .2, 0, 1,
          .4, .2, 0, 1,
          .4, .2, 0, 1,
        ],
      },
    });

    let properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'vertex-colors': args['vertex-colors-trunk'],
    };

    // Create trunk section.
    let trunk_count = core_random_integer({
      'max': args['trunk-count-max'] - args['trunk-count-min'] + 1,
    }) + args['trunk-count-min'];
    let trunk_width = args['trunk-width-max'] / 2;
    let trunk_width_decrease = (trunk_width - args['trunk-width-min'] / 2) / (trunk_count / 2);
    for(let trunk = 0; trunk < trunk_count; trunk++){
        properties['id'] = args['prefix'] + '-trunk-' + trunk;
        properties['billboard'] = [
          'y',
        ];
        properties['rotate-x'] = 0;
        properties['rotate-z'] = 0;
        properties['vertices'] = [
          trunk_width, args['trunk-length'], 0, 1,
          -trunk_width, args['trunk-length'], 0, 1,
          -trunk_width, 0, 0, 1,
          trunk_width, 0, 0, 1
        ];
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });

        properties['attach-offset-y'] += 10;
        trunk_width -= trunk_width_decrease;

        // Add branches.
        let branch_count = core_random_integer({
          'max': args['trunk-branch-max'] - args['trunk-branch-min'] + 1,
        }) + args['trunk-branch-min'];
        let branch_length = args['trunk-length'] / 2;
        let branch_width = trunk_width / 2;
        for(let branch = 0; branch < branch_count; branch++){
            properties['id'] = args['prefix'] + '-trunk-' + trunk + '-branch-' + branch;
            properties['billboard'] = false;
            properties['rotate-x'] = core_random_number({
              'multiplier': 45,
            }) + 90;
            properties['rotate-z'] = core_random_number({
              'multiplier': 360,
            });
            properties['vertices'] = [
              branch_width, branch_length, 0, 1,
              -branch_width, branch_length, 0, 1,
              -branch_width, 0, 0, 1,
              branch_width, 0, 0, 1
            ];

            webgl_entity_create({
              'entities': [
                properties,
              ],
            });
        }
    }

    // Create leaves.
}

// Required args: prefix
function webgl_prefab_skybox(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bottom-color-bottom': false,
        'bottom-color-top': false,
        'character': webgl_character_id,
        'random-colors': false,
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'sides': 3,
        'size': 99,
        'top-color-bottom': false,
        'top-color-top': false,
      },
    });

    if(args['bottom-color-bottom'] === false){
        args['bottom-color-bottom'] = webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
    }
    if(args['bottom-color-top'] === false){
        args['bottom-color-top'] = webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
    }
    if(args['top-color-bottom'] === false){
        args['top-color-bottom'] = webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
    }
    if(args['top-color-top'] === false){
        args['top-color-top'] = webgl_vertexcolorarray({
          'random-colors': args['random-colors'],
        });
    }

    let angle = core_degrees_to_radians({
      'degrees': 360 / args['sides'],
    });

    // Top half.
    let properties = {
      'collision': false,
      'draw-type': 'TRIANGLE_FAN',
      'groups': [
        'skybox',
      ],
      'id': args['prefix'] + '-top',
      'rotate-x': args['rotate-x'],
      'rotate-y': args['rotate-y'],
      'rotate-z': args['rotate-z'],
      'vertex-colors': [
        args['top-color-top'][0],
        args['top-color-top'][1],
        args['top-color-top'][2],
        args['top-color-top'][3],
      ],
      'vertices': [
        0, args['size'], 0, 1,
      ],
    };
    for(let side = 0; side <= args['sides']; side++){
        let rotation = angle * side;
        let x = Math.cos(rotation) * args['size'];
        let z = Math.sin(rotation) * args['size'];

        properties['vertex-colors'].push(
          args['top-color-bottom'][0],
          args['top-color-bottom'][1],
          args['top-color-bottom'][2],
          args['top-color-bottom'][3]
        );
        properties['vertices'].push(
          x,
          0,
          z,
          1
        );
    }
    webgl_entity_create({
      'entities': [
        properties,
      ],
    });

    // Bottom half.
    properties['id'] = args['prefix'] + '-bottom';
    properties['vertex-colors'] = [
      args['bottom-color-bottom'][0],
      args['bottom-color-bottom'][1],
      args['bottom-color-bottom'][2],
      args['bottom-color-bottom'][3],
    ];
    properties['vertices'] = [
      0, -args['size'], 0, 1,
    ];
    for(let side = 0; side <= args['sides']; side++){
        let rotation = -angle * side;
        let x = Math.cos(rotation) * args['size'];
        let z = Math.sin(rotation) * args['size'];

        properties['vertex-colors'].push(
          args['bottom-color-top'][0],
          args['bottom-color-top'][1],
          args['bottom-color-top'][2],
          args['bottom-color-top'][3]
        );
        properties['vertices'].push(
          x,
          0,
          z,
          1
        );
    }
    webgl_entity_create({
      'entities': [
        properties,
      ],
    });
}

// Required args: shaders
function webgl_program_create(args){
    let program = webgl_buffer.createProgram();
    for(let shader in args['shaders']){
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
    let buffer = document.getElementById('buffer');
    let canvas = document.getElementById('canvas');

    webgl_properties['canvas']['height'] = window.innerHeight;
    webgl_properties['canvas']['height-half'] = webgl_properties['canvas']['height'] / 2;
    buffer.height = webgl_properties['canvas']['height'];
    canvas.height = webgl_properties['canvas']['height'];

    webgl_properties['canvas']['width'] = window.innerWidth;
    webgl_properties['canvas']['width-half'] = webgl_properties['canvas']['width'] / 2;
    buffer.width = webgl_properties['canvas']['width'];
    canvas.width = webgl_properties['canvas']['width'];

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
}

function webgl_settings_init(){
    core_tab_create({
      'content': '<table><tr><td><input id=anisotropic><td>Anisotropic Filtering</table>',
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
}

// Required args: source, type
function webgl_shader_create(args){
    let shader = webgl_buffer.createShader(args['type']);
    webgl_buffer.shaderSource(
      shader,
      args['source']
    );
    webgl_buffer.compileShader(shader);

    return shader;
}

function webgl_shader_recreate(){
    if(webgl_properties['shader']['program'] !== 0){
        webgl_buffer.deleteProgram(webgl_properties['shader']['program']);
    }

    webgl_properties['shader']['program'] = webgl_program_create({
      'shaders': [
        webgl_shader_create({
          'source':
              'precision lowp float;'
            + 'uniform bool fog;'
            + 'uniform float float_fogDensity;'
            + 'uniform sampler2D sampler;'
            + 'uniform vec3 vec_clearColor;'
            + 'varying vec2 vec_textureCoord;'
            + 'varying vec4 vec_fragmentColor;'
            + 'varying vec4 vec_lighting;'
            + 'varying vec4 vec_position;'
            + 'void main(void){'
            +     'vec4 fragment_color = vec_fragmentColor * vec_lighting * texture2D(sampler, vec_textureCoord);'
            +     'if(fog){'
            +         'float distance = length(vec_position.xyz);'
            +         'fragment_color = vec4('
            +           'mix('
            +             'vec_clearColor,'
            +             'fragment_color.rgb,'
            +             'clamp(exp(float_fogDensity * distance * -distance), 0.0, 1.0)'
            +           '),'
            +           'fragment_color.a'
            +         ');'
            +     '}'
            +     'gl_FragColor = fragment_color;'
            + '}',
          'type': webgl_buffer.FRAGMENT_SHADER,
        }),
        webgl_shader_create({
          'source':
              'attribute vec2 vec_texturePosition;'
            + 'attribute vec3 vec_vertexNormal;'
            + 'attribute vec4 vec_vertexColor;'
            + 'attribute vec4 vec_vertexPosition;'
            + 'uniform bool directional;'
            + 'uniform float alpha;'
            + 'uniform mat4 mat_cameraMatrix;'
            + 'uniform mat4 mat_perspectiveMatrix;'
            + 'uniform vec3 vec_ambientColor;'
            + 'uniform vec3 vec_directionalColor;'
            + 'uniform vec3 vec_directionalVector;'
            + 'varying vec2 vec_textureCoord;'
            + 'varying vec4 vec_fragmentColor;'
            + 'varying vec4 vec_lighting;'
            + 'varying vec4 vec_position;'
            + 'void main(void){'
            +     'vec_position = mat_cameraMatrix * vec_vertexPosition;'
            +     'gl_Position = mat_perspectiveMatrix * vec_position;'
            +     'gl_PointSize = 500. / length(vec_position.xyz);'
            +     'vec_textureCoord = vec_texturePosition;'
            +     'vec3 lighting = vec_ambientColor;'
            +     'if(directional){'
            +         'vec4 transformedNormal = mat_perspectiveMatrix * vec4(vec_vertexNormal, 1.0);'
            +         'lighting += vec_directionalColor * max(dot(transformedNormal.xyz, normalize(vec_directionalVector)), 0.0);'
            +     '}'
            +     'vec_lighting = vec4(lighting, alpha);'
            +     'vec_fragmentColor = vec_vertexColor;'
            + '}',
          'type': webgl_buffer.VERTEX_SHADER,
        }),
      ],
    });

    webgl_vertexattribarray_set({
      'attributes': [
        'vec_vertexColor',
        'vec_vertexNormal',
        'vec_vertexPosition',
        'vec_texturePosition',
      ],
      'program': webgl_properties['shader']['program'],
    });

    let locations = {
      'alpha': 'alpha',
      'ambient-color': 'vec_ambientColor',
      'clear-color': 'vec_clearColor',
      'directional': 'directional',
      'directional-color': 'vec_directionalColor',
      'directional-vector': 'vec_directionalVector',
      'fog-density': 'float_fogDensity',
      'fog-state': 'fog',
      'mat_cameraMatrix': 'mat_cameraMatrix',
      'mat_perspectiveMatrix': 'mat_perspectiveMatrix',
      'sampler': 'sampler',
    };
    for(let location in locations){
        webgl_properties['shader'][location] = webgl_buffer.getUniformLocation(
          webgl_properties['shader']['program'],
          locations[location]
        );
    }

    webgl_shader_update();
}

function webgl_shader_update(){
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
}

// Required args: entity
function webgl_texture_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'texture': 'default.png',
      },
    });

    core_entities[args['entity']]['texture-gl'] = webgl_buffer.createTexture();

    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      core_entities[args['entity']]['texture-gl']
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

// Required args: attributes, program
function webgl_vertexattribarray_set(args){
    for(let attribute in args['attributes']){
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

    while(args['rgbarray'].length < args['vertexcount']){
        args['rgbarray'].push(args['rgbarray'][0]);
    }

    let color = [];
    for(let i = 0; i < args['vertexcount']; i++){
        color.push(
          args['rgbarray'][i]['red'] / 255,
          args['rgbarray'][i]['green'] / 255,
          args['rgbarray'][i]['blue'] / 255,
          1
        );
    }

    return color;
}

window.webgl_buffer = 0;
window.webgl_canvas = 0;
window.webgl_character_count = 0;
window.webgl_character_homebase = {};
window.webgl_character_id = '_me';
window.webgl_character_trading = '';
window.webgl_characters = {};
window.webgl_diagonal = 0;
window.webgl_extensions = {};
window.webgl_levelcache = {};
window.webgl_paths = {};
window.webgl_properties = {};
window.webgl_text = {};
