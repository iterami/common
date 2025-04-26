'use strict';

// Required args: id
function webgl_audio(args){
    args = core_args({
      'args': args,
      'defaults': {
        'audio': false,
        'divider-x': 50,
        'divider-y': 50,
        'divider-z': 50,
        'type': 'webgl_characters',
      },
    });

    if(!audio_audios[args['id']]){
        audio_create?.({
          [args['id']]: args['audio'],
        });
    }

    const character = webgl_characters[webgl_character_id];
    const radians_y = math_degrees_to_radians(character['rotate-y']);
    const target = webgl_get_position(globalThis[args['type']][args['target']]);
    audio_start_at?.({
      'forwardX': Math.sin(-radians_y),
      'forwardY': 0,
      'forwardZ': Math.cos(radians_y),
      'id': args['id'],
      'positionX': (character['position-x'] - target['x']) / args['divider-x'],
      'positionY': (character['position-y'] - target['y']) / args['divider-y'],
      'positionZ': (character['position-z'] - target['z']) / args['divider-z'],
    });
}

function webgl_billboard(id){
    const character = webgl_characters[webgl_character_id];
    const entity = entity_entities[id];
    const position = webgl_get_position(entity);

    entity['rotate-y'] = 360 - math_radians_to_degrees(Math.atan2(
      position['z'] - character['camera-z'],
      position['x'] - character['camera-x'],
    ) + 1.5707963267948966);
}

// Required args: attribute, data, size
function webgl_buffer_set(args){
    webgl.bindBuffer(
      webgl.ARRAY_BUFFER,
      webgl.createBuffer()
    );
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      new Float32Array(args['data']),
      webgl.STATIC_DRAW
    );

    webgl.vertexAttribPointer(
      args['attribute'],
      args['size'],
      webgl.FLOAT,
      false,
      0,
      0
    );
    webgl.enableVertexAttribArray(args['attribute']);
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
    const character = webgl_characters[args['character']];
    const prefix = args['camera']
      ? 'camera-rotate-'
      : 'rotate-';
    for(const axis in axes){
        let axis_value = args[axes[axis]];
        if(axis_value === false){
            continue;
        }

        if(!args['set']){
            axis_value += character[prefix + axes[axis]];
        }
        character[prefix + axes[axis]] = math_clamp({
          'max': 360,
          'min': 0,
          'value': axis_value,
          'wrap': true,
        });
    }

    if(character['vehicle']){
        return;
    }

    let normals = false;
    if(args['camera']){
        const max = character['camera-rotate-x'] > 180
          ? 360
          : 90;
        character['camera-rotate-x'] = math_clamp({
          'max': max,
          'min': max - 90,
          'value': character['camera-rotate-x'],
        });

        if(args['y'] === false){
            return;
        }

        let mouse_0_down = false;
        let mouse_2_down = false;
        if(args['character'] === webgl_character_id){
            mouse_0_down = core_mouse['down-0'];
            mouse_2_down = core_mouse['down-2'];
        }

        const strafe = webgl_character_strafe(character);
        const mouse_check = strafe
          || (!mouse_0_down && !mouse_2_down)
          || !args['mouse'];

        if(character['camera-zoom'] === 0
          || (mouse_check
            && webgl_character_level(character) > -2
            && character['life'] > 0)){
            character['rotate-y'] = strafe
              ? character['camera-rotate-y']
              : args['set']
                ? args['y']
                : character['rotate-y'] + args['y'];
            normals = true;
        }

    }else{
        normals = true;
    }

    if(normals){
        entity_group_modify({
          'groups': [
            'webgl_characters_' + args['character'],
          ],
          'todo': webgl_entity_normals,
        });
    }
}

function webgl_character_hit(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': webgl_character_id,
        'target': webgl_character_id,
        'xz': 1,
        'y': 1,
      },
    });

    const character = webgl_characters[args['id']];
    const target = webgl_characters[args['target']];
    const angle_xz = Math.atan2(
      target['position-z'] - character['position-z'],
      target['position-x'] - character['position-x']
    );
    target['change-position-x'] = Math.cos(angle_xz) * args['xz'];
    target['change-position-y'] = args['y'];
    target['change-position-z'] = Math.sin(angle_xz) * args['xz'];
}

function webgl_character_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'automove': false,
        'camera-lock': true,
        'camera-zoom': 0,
        'collide-bottom': 3,
        'collide-top': 3,
        'collide-xz': 2,
        'collides': false,
        'controls': '',
        'entities': [],
        'gravity': 0,
        'id': webgl_character_id,
        'jump-height': 1,
        'level': -2,
        'level-xp': 0,
        'life': 1,
        'life-max': 1,
        'lives': -1,
        'lock': {},
        'model': false,
        'path-direction': 1,
        'path-end': '',
        'path-id': '',
        'path-point': 0,
        'reticle': '#fff',
        'scale-x': 1,
        'scale-y': 1,
        'scale-z': 1,
        'spawn': {},
        'speed': 1,
        'turn-speed': 5,
        'vehicle': false,
        'vehicle-stats': false,
      },
    });

    const entities = args['entities'];
    const model = args['model'];
    delete args['entities'];
    delete args['model'];

    webgl_characters[args['id']] = {
      'camera-rotate-x': 0,
      'camera-rotate-y': 0,
      'camera-rotate-z': 0,
      'camera-x': 0,
      'camera-y': 0,
      'camera-z': 0,
      'change-position-x': 0,
      'change-position-y': 0,
      'change-position-z': 0,
      'change-rotate-x': 0,
      'change-rotate-y': 0,
      'change-rotate-z': 0,
      'camera-zoom': Math.min(
        webgl_properties['camera-zoom-max'],
        Math.max(
          args['camera-zoom'],
          args['level'] === -1
            ? 0
            : webgl_properties['camera-zoom-min']
        )
      ),
      'jump-allow': false,
      'keys': false,
      'life': Math.max(
        args['life'],
        1
      ),
      'mouse': false,
      'position-x': 0,
      'position-y': 0,
      'position-z': 0,
      'rotate-x': 0,
      'rotate-y': 0,
      'rotate-z': 0,
      'vehicle': false,
      'vehicle-stats': args['vehicle-stats'] === false
        ? false
        : core_args({
            'args': args['vehicle-stats'],
            'defaults': {
              'character': false,
              'lock': 0,
              'speed': 0,
              'speed-backward': -.1,
              'speed-forward': .1,
              'speed-max-backward': -.5,
              'speed-max-forward': 1,
            },
          }),
      ...args,
    };
    webgl_character_count++;

    entity_group_create(['webgl_characters_' + args['id']]);
    webgl_entity_create({
      'character': args['id'],
      'entities': entities,
    });

    if(args['vehicle-stats']
      && args['vehicle-stats']['character']){
        const character = webgl_characters[args['id']]['vehicle-stats']['character'];
        webgl_characters[args['id']]['vehicle-stats']['character'] = false;
        webgl_vehicle_toggle({
          'id': character,
          'vehicle': args['id'],
        });
    }

    if(model){
        webgl_model_create({
          'id': args['id'],
          'model': model,
        });
    }

    webgl_character_spawn(args['id']);
}

function webgl_character_level(character){
    if(character === void 0){
        character = webgl_characters[webgl_character_id];
    }

    if(core_type(character['level']) === 'number'){
        return character['level'];
    }

    return -3;
}

function webgl_character_move(args){
    args = core_args({
      'args': args,
      'defaults': {
        'angle': true,
        'id': webgl_character_id,
        'speed': 1,
        'strafe': false,
        'y': false,
      },
    });

    if(args['y']){
        webgl_characters[args['id']]['change-position-y'] += args['speed'] * (args['strafe']
          ? -1
          : 1);
        return;
    }

    const angle = args['angle'] === true
      ? webgl_characters[args['id']]['rotate-y']
      : args['angle'];
    const movement = math_move_3d({
      'angle': angle,
      'speed': args['speed'],
      'strafe': args['strafe'],
    });

    webgl_characters[args['id']]['change-position-x'] += movement['x'];
    webgl_characters[args['id']]['change-position-z'] += movement['z'];
}

function webgl_character_scale(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': webgl_character_id,
        'set': false,
        'x': false,
        'y': false,
        'z': false,
      },
    });

    const axes = 'xyz';
    const character = webgl_characters[args['id']];
    let scaled = false;
    for(const axis in axes){
        let axis_value = args[axes[axis]];
        if(axis_value === false){
            continue;
        }

        if(!args['set']){
            axis_value += character['scale-' + axes[axis]];
        }
        if(character['scale-' + axes[axis]] !== axis_value){
            scaled = true;
            character['scale-' + axes[axis]] = axis_value;
        }
    }

    if(!scaled){
        return;
    }

    entity_group_modify({
      'groups': [
        'webgl_characters_' + args['id'],
      ],
      'todo': function(entity){
          if(entity_groups['skybox']?.[entity['id']]){
              return;
          }

          webgl_entity_scale({
            'entity': entity['id'],
            'set': true,
            'update': false,
            'x': entity['scale-x'] * character['scale-x'],
            'y': entity['scale-y'] * character['scale-y'],
            'z': entity['scale-z'] * character['scale-z'],
          });
      },
    });
}

function webgl_character_set(id){
    webgl_character_id = id;

    entity_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          entity_group_move({
            'entities': [
              entity['id'],
            ],
            'from': 'webgl_characters_' + entity['attach-to'],
            'to': 'webgl_characters_' + webgl_character_id,
          });
          entity['attach-to'] = webgl_character_id;
      },
    });
}

function webgl_character_spawn(id){
    if(id === void 0){
        id = webgl_character_id;
    }
    const character = webgl_characters[id];
    if(character === void 0
      || character['spawn'] === false
      || character['lives'] === 0){
        return;
    }

    const axes = 'xyz';
    for(const axis in axes){
        character['camera-rotate-' + axes[axis]] = 0;
        character['change-position-' + axes[axis]] = 0;
        character['change-rotate-' + axes[axis]] = 0;
        character['position-' + axes[axis]] = 0;
        character['rotate-' + axes[axis]] = 0;
    }
    character['jump-allow'] = false;
    character['life'] = character['life-max'];

    Object.assign(
      character,
      webgl_properties['spawn'],
      character['spawn']
    );
    if(character['spawn']['path-id']){
        webgl_path_use({
          'id': id,
          'path-id': character['path-id'],
        });
    }
    if(character['vehicle-stats']){
        character['vehicle-stats']['speed'] = 0;
        const driver = character['vehicle-stats']['character'];
        if(driver){
            webgl_character_spawn(driver);
        }
    }
}

function webgl_character_strafe(character){
    const checks = webgl_properties['pointerlock']
      || character['camera-zoom'] === 0
      || character['controls'] === 'arpg'
      || character['controls'] === 'rts';

    if(character['id'] !== webgl_character_id){
        return checks;
    }

    return checks
      || core_mouse['down-2'];
}

function webgl_color_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'blue': false,
        'green': false,
        'red': false,
        'type': 'clear',
      },
    });

    const color = webgl_properties[args['type'] + '-color'];
    if(args['blue'] !== false){
        color[2] = args['blue'];
    }
    if(args['green'] !== false){
        color[1] = args['green'];
    }
    if(args['red'] !== false){
        color[0] = args['red'];
    }

    if(args['type'] === 'clear'){
        webgl.clearColor(
          color[0],
          color[1],
          color[2],
          1
        );
    }

    webgl_uniform_update();
}

// Required args: collider, target
function webgl_collision(args){
    const character = args['target']['attach-to']
      ? webgl_characters[args['target']['attach-to']]
      : false;
    let collision = '';
    const collider_position = webgl_get_position(args['collider']);
    const collision_sign = [];
    const diffs = {
      'x': args['collider']['change-position-x'] - character?.['change-position-x'],
      'y': args['collider']['change-position-y'] - character?.['change-position-y'],
      'z': args['collider']['change-position-z'] - character?.['change-position-z'],
    };
    const range = {
      'x': args['collider']['collide-xz'] + Math.abs(diffs['x']),
      'y-bottom': args['collider']['collide-bottom'] + Math.abs(diffs['y']),
      'y-top': args['collider']['collide-top'] + Math.abs(diffs['y']),
      'z': args['collider']['collide-xz'] + Math.abs(diffs['z']),
    };
    const target_position = webgl_get_position(args['target']);

    let sign = Math.sign(args['target']['normals'][0]);
    if(sign !== 0
      && sign !== Math.sign(diffs['x'])
      && collider_position['x'] > target_position['x'] - range['x']
      && collider_position['x'] < target_position['x'] + range['x']
      && collider_position['y'] > target_position['y'] + args['target']['vertices'][3] - range['y-top']
      && collider_position['y'] < target_position['y'] + args['target']['vertices'][0] + range['y-bottom']
      && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
      && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
        collision += 'x';
        collision_sign.push(sign);
    }
    sign = Math.sign(args['target']['normals'][2]);
    if(sign !== 0
      && sign !== Math.sign(diffs['z'])
      && collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
      && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
      && collider_position['y'] > target_position['y'] + args['target']['vertices'][2] - range['y-top']
      && collider_position['y'] < target_position['y'] + args['target']['vertices'][8] + range['y-bottom']
      && collider_position['z'] > target_position['z'] - range['z']
      && collider_position['z'] < target_position['z'] + range['z']){
        collision += 'z';
        collision_sign.push(sign);
    }
    sign = Math.sign(args['target']['normals'][1]);
    if(sign !== 0
      && sign !== Math.sign(diffs['y'])
      && collider_position['x'] > target_position['x'] + args['target']['vertices'][3] - range['x']
      && collider_position['x'] < target_position['x'] + args['target']['vertices'][0] + range['x']
      && collider_position['y'] > target_position['y'] - range['y-top']
      && collider_position['y'] < target_position['y'] + range['y-bottom']
      && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
      && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
        collision += 'y';
        collision_sign.push(sign);
    }

    if(collision.length === 0){
        return;
    }

    for(const axis in collision){
        const change_position = character
          ? character['change-position-' + collision[axis]]
          : 0;
        const label = collision[axis] !== 'y'
          ? 'xz'
          : collision_sign[axis] > 0
            ? 'bottom'
            : 'top';

        args['collider']['position-' + collision[axis]] = target_position[collision[axis]]
          + args['collider']['collide-' + label] * collision_sign[axis]
          + change_position;
        args['collider']['change-position-' + collision[axis]] = change_position;

        if(collision[axis] === 'y'){
            if(!args['collider']['jump-allow']){
                args['collider']['jump-allow'] = collision_sign[axis] !== Math.sign(webgl_properties['gravity-max']);

                const change = args['collider']['change-position-' + collision[axis]];
                if(webgl_properties['gravity-damage']
                  && args['collider']['level'] >= 0
                  && change < webgl_properties['gravity-max'] / 2){
                    webgl_stat_modify({
                      'stat': 'life',
                      'target': args['collider'],
                      'value': Math.floor((change - webgl_properties['gravity-max'] / 2) * 10),
                    });
                }
            }

            if(character){
                args['collider']['change-position-x'] += character['change-position-x'];
                args['collider']['change-position-z'] += character['change-position-z'];
            }

        }else if(args['collider']['vehicle-stats']){
            const other_axis = collision[axis] === 'x'
              ? 'z'
              : 'x';

            args['collider']['vehicle-stats']['speed'] = Math.min(
              args['collider']['vehicle-stats']['speed'],
              Math.abs(args['collider']['change-position-' + other_axis])
            );
        }
    }

    if(args['target']['event-range'] === 0){
        webgl_event({
          'parent': args['target'],
          'target': args['collider'],
        });
    }
}

function webgl_context_lost(event){
    event.preventDefault();
    core_interval_pause_all();
    webgl = 0;
}

function webgl_context_restored(){
    core_object_reset(webgl_textures);
    webgl_init();
    webgl_uniform_update();
    for(const entity in entity_entities){
        webgl_entity_init(entity_entities[entity]);
    }

    if(core_menu_open){
        webgl_draw();

    }else{
        core_interval_resume_all();
    }
}

function webgl_controls_keyboard(character){
    const level = webgl_character_level(character);
    if(level < -1
      || character['life'] <= 0
      || character['path-id'].length !== 0){
        return;
    }

    if(character['vehicle-stats']){
        const vehicle = character['vehicle-stats'];
        if(vehicle['character']
          || !character['jump-allow']){
            return;
        }
        let speed = 0;
        if(vehicle['speed'] >= 0){
            speed = Math.max(
              vehicle['speed'] + vehicle['speed-backward'],
              0
            );

        }else{
            speed = Math.min(
              vehicle['speed'] + vehicle['speed-forward'],
              0
            );
        }
        vehicle['speed'] = speed;
        if(speed !== 0){
            webgl_character_move({
              'id': character['id'],
              'speed': -speed,
            });
        }
        return;

    }
    const controls = character['controls'];
    if(controls.length === 0){
        return;
    }

    let back = false;
    let crouch = false;
    let forward = false;
    let jump = false;
    let left = false;
    let mouse_0_down = false;
    let mouse_2_down = false;
    let mouse_x = 0;
    let right = false;

    if(character['id'] === webgl_character_id){
        mouse_0_down = core_mouse['down-0'];
        mouse_2_down = core_mouse['down-2'];
        mouse_x = core_mouse['x'];

        back = core_keys[core_storage_data['move-↓']]['state'];
        crouch = core_keys[core_storage_data['crouch']]['state'];
        forward = core_keys[core_storage_data['move-↑']]['state']
          || (mouse_0_down && mouse_2_down);
        jump = core_keys[core_storage_data['jump']]['state'];
        left = core_keys[core_storage_data['move-←']]['state'];
        right = core_keys[core_storage_data['move-→']]['state'];

    }else{
        const mouse = character['mouse'];
        if(mouse){
            mouse_0_down = mouse['0-down'] || false;
            mouse_2_down = mouse['2-down'] || false;
            mouse_x = mouse['x'];
        }

        const keys = character['keys'];
        if(keys){
            back = keys['move-↓'] || false;
            crouch = keys['crouch'] || false;
            forward = keys['move-↑']
              || (mouse_0_down && mouse_2_down);
            jump = keys['jump'] || false;
            left = keys['move-←'] || false;
            right = keys['move-→'] || false;
        }
    }

    if(forward || back){
        character['automove'] = false;
    }

    if(character['vehicle']){
        const vehicle = webgl_characters[character['vehicle']];
        let speed = 0;
        let turn = 0;
        if(vehicle['jump-allow']){
            if(forward || character['automove']){
                speed = Math.min(
                  vehicle['vehicle-stats']['speed'] + vehicle['vehicle-stats']['speed-forward'],
                  vehicle['vehicle-stats']['speed-max-forward']
                );

            }else if(back){
                speed = Math.max(
                  vehicle['vehicle-stats']['speed'] + vehicle['vehicle-stats']['speed-backward'],
                  vehicle['vehicle-stats']['speed-max-backward']
                );

            }else if(vehicle['vehicle-stats']['speed'] >= 0){
                speed = Math.max(
                  vehicle['vehicle-stats']['speed'] + vehicle['vehicle-stats']['speed-backward'],
                  0
                );

            }else{
                speed = Math.min(
                  vehicle['vehicle-stats']['speed'] + vehicle['vehicle-stats']['speed-forward'],
                  0
                );
            }
            vehicle['vehicle-stats']['speed'] = speed;

            if(mouse_2_down){
                const half = webgl.drawingBufferWidth / 2;
                turn = vehicle['turn-speed'] * Math.max(
                  Math.min(
                    (mouse_x - half) / half * core_storage_data['mouse-horizontal'],
                    1
                  ),
                  -1
                );

            }else{
                if(left){
                    turn -= vehicle['turn-speed'];
                }
                if(right){
                    turn += vehicle['turn-speed'];
                }
            }
        }
        if(turn !== 0
          || mouse_2_down){
            if(speed < 0){
                turn *= -1;
            }
            vehicle['rotate-y'] += turn;
            if(mouse_2_down){
                character['camera-rotate-y'] = vehicle['rotate-y'];

            }else if(!mouse_0_down){
                character['camera-rotate-y'] += turn;
            }
        }
        if(speed !== 0){
            webgl_character_move({
              'id': vehicle['id'],
              'speed': -speed,
            });
        }

        const axes = 'xyz';
        for(const axis in axes){
            character['rotate-' + axes[axis]] = vehicle['rotate-' + axes[axis]];
            character['position-' + axes[axis]] = vehicle['position-' + axes[axis]] + vehicle['change-position-' + axes[axis]];
        }
        character['position-y'] += character['collide-bottom'];
        return;
    }

    let leftright = 0;
    const strafe = webgl_character_strafe(character);
    if(left){
        if(strafe){
            leftright -= 1;

        }else{
            webgl_camera_rotate({
              'camera': !mouse_0_down,
              'character': character['id'],
              'y': -character['turn-speed'],
            });
        }
    }
    if(right){
        if(strafe){
            leftright += 1;

        }else{
            webgl_camera_rotate({
              'camera': !mouse_0_down,
              'character': character['id'],
              'y': character['turn-speed'],
            });
        }
    }

    if(level === -1 || character['jump-allow']){
        let forwardback = 0;
        if(forward || character['automove']){
            forwardback = -1;
        }
        if(back){
            if(level === -1
              || controls === 'arpg'){
                forwardback += 1;

            }else{
                forwardback = forwardback ? 0 : .5;
                leftright *= .5;
            }
        }

        if(crouch){
            if(level === -1){
                webgl_character_move({
                  'id': character['id'],
                  'speed': character['speed'],
                  'strafe': true,
                  'y': true,
                });

            }else{
                forwardback *= .1;
                leftright *= .1;
            }
        }
        if(jump){
            if(level === -1){
                webgl_character_move({
                  'id': character['id'],
                  'speed': character['speed'],
                  'y': true,
                });

            }else{
                character['jump-allow'] = false;
                character['change-position-y'] = character['jump-height'];
            }
        }

        if(level !== -1
          && leftright !== 0
          && forwardback !== 0){
            forwardback *= .7;
            leftright *= .7;
        }

        if(leftright !== 0){
            webgl_character_move({
              'angle': controls === 'arpg'
                ? 0
                : true,
              'id': character['id'],
              'speed': leftright * character['speed'],
              'strafe': true,
            });
        }
        if(forwardback !== 0){
            webgl_character_move({
              'angle': controls === 'arpg'
                ? 0
                : true,
              'id': character['id'],
              'speed': forwardback * character['speed'],
            });
        }

        if(controls === 'arpg'){
            let angle = 0;
            if(forwardback === 0){
                if(leftright > 0){
                    angle = 90;

                }else if(leftright < 0){
                    angle = 270;

                }else{
                    return;
                }

            }else if(forwardback < 0){
                if(leftright > 0){
                    angle = 45;

                }else if(leftright < 0){
                    angle = 315;
                }

            }else if(leftright > 0){
                angle = 135;

            }else if(leftright < 0){
                angle = 225;

            }else{
                angle = 180;
            }
            character['rotate-y'] = angle;
        }
    }
}

function webgl_controls_mouse(character){
    if(character === void 0){
        character = webgl_characters[webgl_character_id];
    }
    const controls = character['controls'];
    if(controls.length === 0){
        return;
    }
    const level = webgl_character_level(character);
    if(level < -1
      || (level !== -1 && webgl_properties['paused'])){
        return;
    }

    let mouse_0_down = false;
    let mouse_2_down = false;
    let movement_x = 0;
    let movement_y = 0;
    let shift_key = false;

    if(character['id'] === webgl_character_id){
        mouse_0_down = core_mouse['down-0'];
        mouse_2_down = core_mouse['down-2'];
        movement_x = core_mouse['movement-x'];
        movement_y = core_mouse['movement-y'];
        shift_key = core_key_shift;

    }else{
        const mouse = character['mouse'];
        if(mouse){
            mouse_0_down = mouse['down-0'];
            mouse_2_down = mouse['down-2'];
            movement_x = mouse['movement-x'];
            movement_y = mouse['movement-y'];
        }

        const keys = character['keys'];
        if(keys){
            shift_key = keys['shift'];
        }
    }

    if(controls === 'rts'
      && !shift_key){
        return;
    }

    if(mouse_0_down
      || mouse_2_down
      || webgl_properties['pointerlock']){
        webgl_camera_rotate({
          'character': character['id'],
          'x': movement_y / 10,
          'y': movement_x / 10,
        });
    }
}

function webgl_controls_wheel(event){
    const character = webgl_characters[webgl_character_id];
    if(webgl_character_level(character) < -1){
        return;
    }

    if(event.deltaY > 0){
        character['camera-zoom'] = core_key_shift
          ? webgl_properties['camera-zoom-max']
          : Math.min(
              character['camera-zoom'] + 1,
              webgl_properties['camera-zoom-max']
            );

    }else{
        const min = character['level'] === -1
          ? 0
          : webgl_properties['camera-zoom-min'];

        character['camera-zoom'] = core_key_shift
          ? min
          : Math.max(
              character['camera-zoom'] - 1,
              min
            );
    }
}

function webgl_cursor(cursor){
    webgl_properties['cursor'] = cursor;
    webgl.canvas.style.cursor = cursor;
}

function webgl_draw(){
    if(webgl === 0){
        return;
    }

    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    webgl.disable(webgl.DEPTH_TEST);
    entity_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': webgl_draw_entity,
    });
    webgl.enable(webgl.DEPTH_TEST);

    entity_group_modify({
      'groups': [
        'opaque',
        'transparent',
      ],
      'todo': webgl_draw_entity,
    });
}

function webgl_draw_entity(entity){
    if(!entity['draw']
      || !entity['visible']){
        return;
    }

    webgl.bindVertexArray(entity['vao']);

    webgl.bindTexture(
      webgl.TEXTURE_2D,
      webgl_textures[entity['texture']]['gl']
    );
    webgl.uniform1f(
      webgl_shader_uniforms['alpha'],
      entity['alpha']
    );
    webgl.uniform1f(
      webgl_shader_uniforms['point-size'],
      entity['point-size']
    );
    webgl.uniformMatrix4fv(
      webgl_shader_uniforms['cameraMatrix'],
      false,
      math_matrices[entity['id']]
    );

    webgl.drawArrays(
      webgl[entity['draw-mode']],
      0,
      entity['vertices-length']
    );
}

function webgl_drawloop(){
    webgl_draw();
    core_interval_animationFrame('webgl-animationFrame');
}

// Required args: id
function webgl_entity_alpha(args){
    args = core_args({
      'args': args,
      'defaults': {
        'alpha': 1,
      },
    });

    const entity = entity_entities[args['id']];
    entity['alpha'] = args['alpha'];

    if(args['alpha'] === 1){
        entity_group_move({
          'entities': [
            entity['id'],
          ],
          'from': 'transparent',
          'to': 'opaque',
        });

    }else{
        entity_group_move({
          'entities': [
            entity['id'],
          ],
          'from': 'opaque',
          'to': 'transparent',
        });
    }
}

function webgl_entity_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': false,
        'entities': [],
        'groups': [],
      },
    });

    for(const id in args['entities']){
        const entity = entity_create({
          'id': args['entities'][id]['id'],
          'properties': args['entities'][id],
          'types': args['entities'][id]['types'],
        });
        math_matrices[entity['id']] = math_matrix_create();

        const groups = [
          ...args['groups'],
        ];
        if(entity['groups']){
            groups.push(entity['groups']);
            delete entity['groups'];
        }
        for(const group in groups){
            entity_group_add({
              'entities': [
                entity['id'],
              ],
              'group': groups[group],
            });
        }

        if(entity_groups['skybox']?.[entity['id']]){
            entity_group_remove({
              'entities': [
                entity['id'],
              ],
              'group': 'opaque',
            });
            entity_group_remove({
              'entities': [
                entity['id'],
              ],
              'group': 'transparent',
            });
            entity['attach-to'] = webgl_character_id;
            entity['attach-type'] = 'webgl_characters';

        }else if(args['character']){
            entity['attach-to'] = args['character'];
            entity['attach-type'] = 'webgl_characters';
        }

        if(entity['scale-x'] !== 1
          || entity['scale-y'] !== 1
          || entity['scale-z'] !== 1){
            webgl_entity_scale({
              'init': true,
              'entity': entity['id'],
              'set': true,
              'x': entity['scale-x'],
              'y': entity['scale-y'],
              'z': entity['scale-z'],
            });
        }

        if(entity['attach-to']){
            entity_attach({
              'entity': entity,
              'to': entity['attach-to'],
              'type': entity['attach-type'],
              'x': entity['attach-x'],
              'y': entity['attach-y'],
              'z': entity['attach-z'],
            });
            entity_group_add({
              'entities': [
                entity['id'],
              ],
              'group': 'webgl_characters_' + entity['attach-to'],
            });
            const character = webgl_characters[entity['attach-to']];
            webgl_entity_scale({
              'entity': entity['id'],
              'set': true,
              'update': false,
              'x': entity['scale-x'] * character['scale-x'],
              'y': entity['scale-y'] * character['scale-y'],
              'z': entity['scale-z'] * character['scale-z'],
            });
        }
    }
}

function webgl_entity_init(entity){
    if(!webgl_textures[entity['texture']]){
        webgl_texture_init({
          'id': entity['texture'],
        });
    }

    webgl_entity_alpha({
      'alpha': entity['alpha'],
      'id': entity['id'],
    });
    entity['vertices-length'] = entity['vertices'].length / 3;
    entity['vertex-colors'] = webgl_vertexcolorarray({
      'colors': entity['vertex-colors'],
      'vertexcount': entity['vertices-length'],
    });

    if(entity['picking'] === true){
        entity['picking'] = [
          core_round({
            'decimals': 3,
            'number': (entity_id_count % 255) / 255,
          }),
          core_round({
            'decimals': 3,
            'number': Math.floor(entity_id_count / 255) / 255,
          }),
          core_round({
            'decimals': 3,
            'number': Math.floor(entity_id_count / 65025) / 255,
          }),
        ];
    }
    const pickData = [];
    const picking = entity['picking'] || [0, 0, 0];
    const texture_align = entity['texture-align'];
    const textureData = [];
    const half_length = texture_align.length / 2;
    for(let i = 0; i < entity['vertices-length']; i++){
        pickData.push(...picking);
        const align = i < half_length
          ? i * 2
          : (i % half_length) * 2;
        textureData.push(
          texture_align[align] * entity['texture-x'],
          texture_align[align + 1] * entity['texture-y']
        );
    }

    entity['vao'] = webgl.createVertexArray();
    webgl_entity_normals(entity);
    webgl_buffer_set({
      'attribute': webgl_shader_attributes['vertexColor'],
      'data': entity['vertex-colors'],
      'size': 4,
    });
    webgl_buffer_set({
      'attribute': webgl_shader_attributes['pickColor'],
      'data': pickData,
      'size': 3,
    });
    webgl_buffer_set({
      'attribute': webgl_shader_attributes['texturePosition'],
      'data': textureData,
      'size': 2,
    });
    webgl_buffer_set({
      'attribute': webgl_shader_attributes['vertexPosition'],
      'data': entity['vertices'],
      'size': 3,
    });
}

function webgl_entity_normals(entity){
    let rotate_x = entity['rotate-x'];
    let rotate_y = entity['rotate-y'];
    let rotate_z = entity['rotate-z'];
    if(entity['attach-to']){
        const attached_to = globalThis[entity['attach-type']][entity['attach-to']];
        rotate_x += attached_to['rotate-x'];
        rotate_y += attached_to['rotate-y'];
        rotate_z += attached_to['rotate-z'];
    }
    entity['normals'] = webgl_normals({
      'rotate-x': rotate_x,
      'rotate-y': rotate_y,
      'rotate-z': rotate_z,
    });

    const normals = [];
    for(let i = 0; i < entity['vertices-length']; i++){
        normals.push(...entity['normals']);
    }
    webgl.bindVertexArray(entity['vao']);
    webgl_buffer_set({
      'attribute': webgl_shader_attributes['vertexNormal'],
      'data': normals,
      'size': 3,
    });
}

// Required args: entity
function webgl_entity_scale(args){
    args = core_args({
      'args': args,
      'defaults': {
        'init': false,
        'set': false,
        'todo': true,
        'update': true,
        'x': false,
        'y': false,
        'z': false,
      },
    });

    const axes = 'xyz';
    const entity = entity_entities[args['entity']];
    let scaled = args['init'];
    for(const axis in axes){
        let axis_value = args[axes[axis]];
        if(axis_value === false){
            continue;
        }

        const old_scale = entity['scale-' + axes[axis]];
        if(!args['set']){
            axis_value += old_scale;
        }
        if(axis_value !== old_scale || args['init']){
            scaled = true;

            if(args['update']){
                entity['scale-' + axes[axis]] = axis_value;
            }

            for(let i = Number(axis); i < entity['vertices-length'] * 3; i += 3){
                if(!args['init']){
                    entity['vertices'][i] /= old_scale;
                }
                entity['vertices'][i] *= axis_value;
            }
            if(entity['attach-to']){
                if(!args['init']){
                    entity['attach-' + axes[axis]] /= old_scale;
                }
                entity['attach-' + axes[axis]] *= axis_value;
            }
        }
    }

    if(scaled && args['todo']){
        webgl.bindVertexArray(entity['vao']);
        webgl_buffer_set({
          'attribute': webgl_shader_attributes['vertexPosition'],
          'data': entity['vertices'],
          'size': 3,
        });
    }
}

// Required args: parent, target
function webgl_event(args){
    if(args['parent']['event-limit'] !== false){
        if(args['parent']['event-limit'] <= 0){
            args['parent']['event-range'] = false;
            return;
        }

        args['parent']['event-limit']--;
    }

    for(const todo in args['parent']['event-todo']){
        const modify = args['parent']['event-todo'][todo];

        if(modify['limit'] !== void 0){
            if(modify['limit'] <= 0){
                continue;
            }

            modify['limit']--;
        }

        if(modify['target']){
            if(modify['value'] === '_target'){
                modify['value'] = args['target']['id'];

            }else if(core_type(modify['value']) === 'object'
              || core_type(modify['value']) === 'array'){
                for(const value in modify['value']){
                    if(modify['value'][value] === '_target'){
                        modify['value'][value] = args['target']['id'];
                    }
                }
            }
        }

        if(modify['type'] === 'function'){
            globalThis[modify['todo']]?.(modify['value']);

        }else if(modify['type'] === 'variable'){
            if(modify['set']){
                globalThis[modify['todo']] = modify['value'];

            }else{
                globalThis[modify['todo']] += modify['value'];
            }

        }else if(modify['type'] === 'character'){
            const target = modify['todo'] === void 0
              ? args['target']
              : webgl_characters[modify['todo']];
            if(webgl_character_level(target) < -1){
                continue;
            }

            webgl_stat_modify({
              'set': modify['set'],
              'stat': modify['stat'],
              'target': target,
              'value': modify['value'],
            });

        }else{
            const target = modify['todo'] === void 0
              ? args['target']
              : entity_entities[modify['todo']];

            webgl_stat_modify({
              'set': modify['set'],
              'stat': modify['stat'],
              'target': target,
              'value': modify['value'],
            });
        }
    }
}

function webgl_get_position(entity){
    if(entity['attach-to']){
        const target = globalThis[entity['attach-type']][entity['attach-to']];
        return {
          'x': target['position-x'] + entity['attach-x'],
          'y': target['position-y'] + entity['attach-y'],
          'z': target['position-z'] + entity['attach-z'],
        };
    }

    return {
      'x': entity['position-x'],
      'y': entity['position-y'],
      'z': entity['position-z'],
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
    webgl = canvas.getContext(
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

    math_matrices['cache'] = math_matrix_create();
    math_matrices['camera'] = math_matrix_create();
    math_matrices['perspective'] = math_matrix_create();
    math_matrices['perspective'][5] = 1;
    math_matrices['perspective'][10] = -1;
    math_matrices['perspective'][11] = -1;
    math_matrices['perspective'][14] = -2;

    webgl.enable(webgl.BLEND);
    webgl.blendFunc(
      webgl.SRC_ALPHA,
      webgl.ONE_MINUS_SRC_ALPHA
    );
    webgl.enable(webgl.CULL_FACE);
    webgl.enable(webgl.DEPTH_TEST);
    webgl.hint(
      webgl.GENERATE_MIPMAP_HINT,
      webgl.FASTEST
    );

    entity_set({
      'default': true,
      'properties': {
        'alpha': 1,
        'attach-to': false,
        'attach-type': 'webgl_characters',
        'attach-x': 0,
        'attach-y': 0,
        'attach-z': 0,
        'billboard': false,
        'change-rotate-x': 0,
        'change-rotate-y': 0,
        'change-rotate-z': 0,
        'collision': true,
        'draw': true,
        'draw-mode': 'TRIANGLE_FAN',
        'draw-range': false,
        'event-limit': false,
        'event-range': false,
        'event-todo': [],
        'light-color': [1, 1, 1,],
        'light-range': 0,
        'normals': [],
        'particle': false,
        'picking': false,
        'point-size': 0,
        'position-x': 0,
        'position-y': 0,
        'position-z': 0,
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'scale-x': 1,
        'scale-y': 1,
        'scale-z': 1,
        'texture': webgl_default_texture,
        'texture-align': '11010010',
        'texture-x': 1,
        'texture-y': 1,
        'vertices-length': 0,
        'visible': true,
      },
      'todo': webgl_entity_init,
      'type': 'opaque',
    });

    const fragment = webgl.createShader(webgl.FRAGMENT_SHADER);
    webgl.shaderSource(
      fragment,
      `#version 300 es
precision mediump float;
in vec2 textureCoord;
in vec3 position;
in vec4 fragmentColor;
in vec4 lighting;
out vec4 fragColor;
uniform bool picking;
uniform float fogEnd;
uniform float fogStart;
uniform float lightRange;
uniform sampler2D sampler;
uniform vec3 clearColor;
uniform vec3 lightColor;
uniform vec3 lightPosition;
void main(void){
    if(picking){
        fragColor = fragmentColor;
        return;
    }
    vec4 light = lighting;
    if(lightRange > 0.0){
        float range = distance(
          lightPosition,
          position
        );
        if(range < lightRange){
            light.rgb = mix(
              light.rgb,
              lightColor,
              1.0 - clamp(range / lightRange, 0.0, 1.0)
            );
        }
    }
    fragColor = fragmentColor * light * texture(sampler, textureCoord);
    if(fogEnd > 0.0){
        float range = length(position);
        fragColor.rgb = mix(
          clearColor,
          fragColor.rgb,
          1.0 - clamp((range - fogStart) / (fogEnd - fogStart), 0.0, 1.0)
        );
    }
}`
    );
    webgl.compileShader(fragment);
    const vertex = webgl.createShader(webgl.VERTEX_SHADER);
    webgl.shaderSource(
      vertex,
      `#version 300 es
in vec2 texturePosition;
in vec3 vertexNormal;
in vec3 vertexPosition;
in vec4 pickColor;
in vec4 vertexColor;
out vec2 textureCoord;
out vec3 position;
out vec4 fragmentColor;
out vec4 lighting;
uniform bool directional;
uniform bool picking;
uniform float alpha;
uniform float pointSize;
uniform mat4 cameraMatrix;
uniform mat4 perspectiveMatrix;
uniform vec3 ambientColor;
uniform vec3 directionalColor;
uniform vec3 directionalVector;
void main(void){
    position = vertexPosition;
    gl_Position = perspectiveMatrix * cameraMatrix * vec4(position, 1.0);
    if(pointSize > 0.0){
        gl_PointSize = pointSize / length(position);
    }
    if(picking){
        fragmentColor = pickColor;
        return;
    }
    fragmentColor = vertexColor;
    textureCoord = texturePosition;
    lighting = vec4(ambientColor, alpha);
    if(directional){
        vec4 normal = perspectiveMatrix * vec4(vertexNormal, 1.0);
        lighting.rgb += directionalColor * max(dot(normal.xyz, normalize(directionalVector)), -0.5);
    }
}`
    );
    webgl.compileShader(vertex);

    const program = webgl.createProgram();
    webgl.attachShader(
      program,
      fragment
    );
    webgl.attachShader(
      program,
      vertex
    );
    webgl.linkProgram(program);
    webgl.useProgram(program);

    const attributes = [
      'pickColor',
      'texturePosition',
      'vertexColor',
      'vertexNormal',
      'vertexPosition',
    ];
    for(const attribute in attributes){
        webgl_shader_attributes[attributes[attribute]] = webgl.getAttribLocation(
          program,
          attributes[attribute]
        );
        webgl.enableVertexAttribArray(webgl_shader_attributes[attributes[attribute]]);
    }
    const uniforms = {
      'alpha': 'alpha',
      'ambient-color': 'ambientColor',
      'cameraMatrix': 'cameraMatrix',
      'clear-color': 'clearColor',
      'directional': 'directional',
      'directional-color': 'directionalColor',
      'directional-vector': 'directionalVector',
      'fog-end': 'fogEnd',
      'fog-start': 'fogStart',
      'light-color': 'lightColor',
      'light-position': 'lightPosition',
      'light-range': 'lightRange',
      'perspectiveMatrix': 'perspectiveMatrix',
      'picking': 'picking',
      'point-size': 'pointSize',
    };
    for(const uniform in uniforms){
        webgl_shader_uniforms[uniform] = webgl.getUniformLocation(
          program,
          uniforms[uniform]
        );
    }

    webgl_resize();
    globalThis.onresize = webgl_resize;

    core_interval_modify({
      'id': 'webgl-interval',
      'paused': true,
      'todo': webgl_logic,
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

    const json = {
      ...webgl_properties,
      'characters': {},
    };
    const groups = ['skybox'];
    for(const id in entity_groups){
        if(['_length', 'opaque', 'skybox', 'transparent'].includes(id)
          || id.startsWith('webgl_')){
            continue;
        }

        if(!json['groups']){
            json['groups'] = [];
        }

        json['groups'].push(id);
        groups.push(id);
    }
    for(const id in webgl_particles){
        if(!json['particles']){
            json['particles'] = {};
        }

        json['particles'][id] = webgl_particles[id];
    }
    for(const id in webgl_paths){
        if(!json['paths']){
            json['paths'] = {};
        }

        json['paths'][id] = webgl_paths[id];
    }
    for(const id in webgl_characters){
        json['characters'][id] = {
          ...webgl_characters[id],
          'entities': [],
        };
    }
    for(const id in entity_entities){
        const entity_json = {
          ...entity_entities[id],
        };
        delete entity_json['normals'];
        delete entity_json['vao'];
        delete entity_json['vertices-length'];
        for(const property in entity_json){
            if(entity_json[property] === entity_info['opaque']['default'][property]){
                delete entity_json[property];
            }
        }

        for(const group in groups){
            if(entity_groups[groups[group]][id] !== true){
                continue;
            }

            if(!entity_json['groups']){
                entity_json['groups'] = [];
            }

            entity_json['groups'].push(groups[group]);
        }

        json['characters'][entity_json['attach-to']]['entities'].push(entity_json);
    }
    for(const id in webgl_textures){
        if(id === 'default.png'){
            continue;
        }

        if(!json['textures']){
            json['textures'] = {};
        }

        json['textures'][id] = webgl_uris[id];
    }

    return JSON.stringify(json);
}

// Required args: character
function webgl_level_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'base': {},
        'json': {},
      },
    });

    if(args['character'] === 1){
        if(!args['json']['characters']
          || args['json']['characters'].length === 0){
            return;
        }

        let id = 0;
        for(const character in args['json']['characters']){
            if(args['json']['characters'][character]['id'] === webgl_character_id){
                id = character;
                break;
            }
        }
        args['character'] = args['json']['characters'][id];
        webgl_character_id = args['character']['id'];

    }else if(args['character'] === 0
      && args['base']['level'] < -1){
        return;
    }

    if(args['json']['randomized']){
        for(const i in args['json']['randomized']){
            const randomized = Math.random() * (args['json']['randomized'][i]['max'] - args['json']['randomized'][i]['min']) + args['json']['randomized'][i]['min'];

            for(const id in args['json']['randomized'][i]['ids']){
                const targets = args['json'][args['json']['randomized'][i]['character']
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
    }

    const level = core_args({
      'args': args['json'],
      'defaults': {
        'ambient-color': [1, 1, 1],
        'camera-zoom-max': 50,
        'camera-zoom-min': 0,
        'characters': [],
        'clear-color': [0, 0, 0],
        'cursor': 'pointer',
        'directional-color': [1, 1, 1],
        'directional-state': true,
        'directional-vector': [0, 1, 0],
        'draw-range': false,
        'fog-end': 0,
        'fog-start': 0,
        'gravity-acceleration': -.05,
        'gravity-damage': false,
        'gravity-max': -2,
        'groups': [],
        'lock': {},
        'paused': false,
        'particles': {},
        'paths': {},
        'pointerlock': false,
        'prefabs': [],
        'spawn': {},
        'textures': false,
        'title': false,
        'y-min': false,
      },
    });

    entity_id_count = 0;
    core_object_reset(webgl_properties);
    Object.assign(
      webgl_properties,
      {
        'ambient-color': level['ambient-color'],
        'camera-zoom-max': level['camera-zoom-max'],
        'camera-zoom-min': level['camera-zoom-min'],
        'clear-color': level['clear-color'],
        'cursor': level['cursor'],
        'directional-color': level['directional-color'],
        'directional-state': level['directional-state'],
        'directional-vector': level['directional-vector'],
        'draw-range': level['draw-range'],
        'fog-end': level['fog-end'],
        'fog-start': level['fog-start'],
        'gravity-acceleration': level['gravity-acceleration'],
        'gravity-damage': level['gravity-damage'],
        'gravity-max': level['gravity-max'],
        'lock': level['lock'],
        'paused': level['paused'],
        'pointerlock': level['pointerlock'],
        'spawn': level['spawn'],
        'title': level['title'],
        'y-min': level['y-min'],
      }
    );

    webgl_cursor(webgl_properties['cursor']);

    level['groups'].unshift(
      'opaque',
      'transparent',
      'skybox',
    );
    entity_group_create(level['groups']);

    if(level['textures'] !== false){
        Object.assign(
          webgl_uris,
          level['textures']
        );
    }

    for(const id in level['particles']){
        webgl_particle_create(id, level['particles'][id]);
    }
    Object.assign(
      webgl_paths,
      level['paths']
    );

    if(args['character'] === -1){
        webgl_character_init({
          'collides': true,
          'controls': 'rpg',
          'level': -1,
        });

    }else if(core_type(args['character']) === 'object'){
        webgl_character_init(args['character']);

    }else{
        webgl_character_init(args['base']);
    }

    for(const id in level['characters']){
        webgl_character_init(level['characters'][id]);
    }
    for(const prefab in level['prefabs']){
        globalThis[level['prefabs'][prefab]['type']]?.(level['prefabs'][prefab]['properties']);
    }

    webgl_color_set({
      'blue': webgl_properties['clear-color'][2],
      'green': webgl_properties['clear-color'][1],
      'red': webgl_properties['clear-color'][0],
    });
    globalThis['repo_level_load']?.();

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

    core_interval_pause_all();
    webgl_level_init({
      'base': webgl_level_unload(true),
      'character': args['character'],
      'json': args['json'],
    });
    return true;
}

function webgl_level_unload(base){
    const character = {};
    if(base === true){
        Object.assign(
          character,
          webgl_characters[webgl_character_id]
        );
        character['entities'] = [];
        for(const id in entity_entities){
            const entity = entity_entities[id];
            if(entity['attach-to'] === webgl_character_id
              && entity_groups['skybox'][id] !== true){
                character['entities'].push(entity);
            }
        }
    }

    entity_remove_all({
      'delete-empty': true,
    });
    core_object_reset(webgl_characters);
    webgl_character_count = 0;
    core_object_reset(webgl_particles);
    core_object_reset(webgl_paths);

    return character;
}

function webgl_logic(){
    if(webgl === 0){
        return;
    }

    if(webgl_properties['pointerlock']){
        core_requestpointerlock(webgl.canvas);
    }

    if(!webgl_properties['paused']){
        for(const texture in webgl_textures){
            webgl_texture_animate(texture);
        }
    }

    globalThis['repo_logic']?.();

    for(const entity in entity_entities){
        webgl_logic_entity(entity_entities[entity]);
    }

    for(const id in webgl_characters){
        const character = webgl_characters[id];
        const level = webgl_character_level(character);
        if(webgl_properties['paused']
          && level !== -1){
            continue;
        }

        webgl_controls_keyboard(character);

        if(character['vehicle']){
            continue;
        }

        if(character['gravity'] !== 0){
            character['change-position-y'] = Math.max(
              character['change-position-y'] + webgl_properties['gravity-acceleration'] * character['gravity'],
              webgl_properties['gravity-max'] * character['gravity']
            );
        }

        webgl_path_move(character);

        if(character['change-rotate-x'] !== 0
          || character['change-rotate-y'] !== 0
          || character['change-rotate-z'] !== 0){
            webgl_camera_rotate({
              'camera': false,
              'character': id,
              'x': character['change-rotate-x'],
              'y': character['change-rotate-y'],
              'z': character['change-rotate-z'],
            });
        }

        const axes = 'xyz';
        for(const axis in axes){
            const position_axis = 'position-' + axes[axis];
            character[position_axis] += character['change-' + position_axis];
        }

        Object.assign(
           character,
           character['lock'],
           webgl_properties['lock']
        );

        const change_position_x = character['change-position-x'];
        const change_position_z = character['change-position-z'];
        if(character['change-position-y'] !== 0){
            character['jump-allow'] = false;
        }

        if(character['collides']
          && webgl_paths[character['path-id']]?.['collision'] !== false){
            for(const id in entity_entities){
                const entity = entity_entities[id];
                if(entity['collision']){
                    webgl_collision({
                      'collider': character,
                      'target': entity,
                    });
                }
            }
        }

        if(level <= -1
          && character['path-id'].length === 0){
            character['change-position-x'] = 0;
            character['change-position-y'] = 0;
            character['change-position-z'] = 0;
            continue;
        }

        if(character['jump-allow']){
            character['change-position-x'] -= change_position_x;
            character['change-position-z'] -= change_position_z;
        }

        if(webgl_properties['y-min'] !== false
          && character['position-y'] < webgl_properties['y-min']){
            webgl_stat_modify({
              'set': true,
              'stat': 'life',
              'target': character,
              'value': 0,
            });
        }
    }

    const character = webgl_characters[webgl_character_id];
    const radians_x = math_degrees_to_radians(character['camera-rotate-x']);
    const radians_y = math_degrees_to_radians(character['camera-rotate-y']);
    if(character['camera-lock']){
        if(character['camera-zoom'] > 0){
            const zoom_cos_x = character['camera-zoom'] * Math.cos(radians_x);

            character['camera-x'] = character['position-x'] + Math.sin(-radians_y) * zoom_cos_x;
            character['camera-y'] = character['position-y'] + Math.sin(radians_x) * character['camera-zoom'];
            character['camera-z'] = character['position-z'] + Math.cos(radians_y) * zoom_cos_x;

        }else{
            character['camera-x'] = character['position-x'];
            character['camera-y'] = character['position-y'];
            character['camera-z'] = character['position-z'];
        }
    }

    math_matrix_identity('camera');
    math_matrix_rotate({
      'dimensions': [
        radians_x,
        radians_y,
        math_degrees_to_radians(character['camera-rotate-z']),
      ],
      'id': 'camera',
    });
    math_matrix_translate({
      'dimensions': [
        character['camera-x'],
        character['camera-y'],
        character['camera-z'],
      ],
      'id': 'camera',
    });
}

function webgl_logic_entity(entity){
    if(entity['attach-to']){
        const target = globalThis[entity['attach-type']][entity['attach-to']];

        if(entity_groups['skybox'][entity['id']]){
            entity['position-x'] = target['camera-x'];
            entity['position-y'] = target['camera-y'];
            entity['position-z'] = target['camera-z'];

        }else{
            entity['position-x'] = target['position-x'];
            entity['position-y'] = target['position-y'];
            entity['position-z'] = target['position-z'];
        }
    }

    if(entity['event-range'] !== false
      && entity['event-range'] !== 0){
        const event_position = webgl_get_position(entity);

        if(core_type(entity['event-range']) === 'array'){
            for(const character in webgl_characters){
                if(character === entity['attach-to']){
                    continue;
                }

                if(math_cuboid_overlap({
                    'depth-0': entity['event-range'][2],
                    'depth-1': entity['event-range'][2],
                    'height-0': entity['event-range'][1],
                    'height-1': entity['event-range'][1],
                    'width-0': entity['event-range'][0],
                    'width-1': entity['event-range'][0],
                    'x-0': webgl_characters[character]['position-x'],
                    'y-0': webgl_characters[character]['position-y'],
                    'z-0': webgl_characters[character]['position-z'],
                    'x-1': event_position['x'],
                    'y-1': event_position['y'],
                    'z-1': event_position['z'],
                  })){
                    webgl_event({
                      'parent': entity,
                      'target': webgl_characters[character],
                    });
                    if(!entity_entities[entity['id']]){
                        return;
                    }
                }
            }

        }else{
            for(const character in webgl_characters){
                if(character === entity['attach-to']){
                    continue;
                }

                if(math_distance({
                    'x0': webgl_characters[character]['position-x'],
                    'y0': webgl_characters[character]['position-y'],
                    'z0': webgl_characters[character]['position-z'],
                    'x1': event_position['x'],
                    'y1': event_position['y'],
                    'z1': event_position['z'],
                  }) < entity['event-range']){
                    webgl_event({
                      'parent': entity,
                      'target': webgl_characters[character],
                    });
                    if(!entity_entities[entity['id']]){
                        return;
                    }
                }
            }
        }
    }

    const draw_range = entity['draw-range'] || webgl_properties['draw-range'];
    if(draw_range){
        const character = webgl_characters[webgl_character_id];
        const position = webgl_get_position(entity);
        entity['visible'] = math_distance({
            'x0': character['camera-x'],
            'y0': character['camera-y'],
            'z0': character['camera-z'],
            'x1': position['x'],
            'y1': position['y'],
            'z1': position['z'],
          }) <= draw_range;

    }else{
        entity['visible'] = true;
    }

    const old_rotate_x = entity['rotate-x'];
    const old_rotate_y = entity['rotate-y'];
    const old_rotate_z = entity['rotate-z'];
    const axes = 'xyz';
    for(const axis in axes){
        const rotate_axis = 'rotate-' + axes[axis];
        if(entity['change-' + rotate_axis] === 0){
            continue;
        }

        entity[rotate_axis] = math_clamp({
          'max': 360,
          'min': 0,
          'value': entity[rotate_axis] + entity['change-' + rotate_axis],
          'wrap': true,
        });
    }
    if(entity['billboard']){
        webgl_billboard(entity['id']);
    }
    if(entity['rotate-x'] !== old_rotate_x
      || entity['rotate-y'] !== old_rotate_y
      || entity['rotate-z'] !== old_rotate_z){
        webgl_entity_normals(entity);
    }

    if(entity['light-range'] > 0){
        webgl.uniform3fv(
          webgl_shader_uniforms['light-color'],
          entity['light-color']
        );
        webgl.uniform1f(
          webgl_shader_uniforms['light-range'],
          entity['light-range']
        );
        webgl.uniform3f(
          webgl_shader_uniforms['light-position'],
          entity['position-x'],
          entity['position-y'],
          entity['position-z']
        );
    }
    if(entity['particle']){
        webgl_logic_particle(entity);
    }

    math_matrix_copy({
      'id': 'camera',
      'to': entity['id'],
    });
    math_matrix_translate({
      'dimensions': [
        -entity['position-x'],
        -entity['position-y'],
        -entity['position-z'],
      ],
      'id': entity['id'],
    });
    if(entity['attach-to']){
        if(entity_groups['skybox'][entity['id']] !== true){
            const target = globalThis[entity['attach-type']][entity['attach-to']];
            math_matrix_rotate({
              'dimensions': [
                math_degrees_to_radians(target['rotate-x']),
                math_degrees_to_radians(-target['rotate-y']),
                math_degrees_to_radians(target['rotate-z']),
              ],
              'id': entity['id'],
            });
        }
        math_matrix_translate({
          'dimensions': [
            -entity['attach-x'],
            -entity['attach-y'],
            -entity['attach-z'],
          ],
          'id': entity['id'],
        });
    }
    math_matrix_rotate({
      'dimensions': [
        math_degrees_to_radians(entity['rotate-x']),
        math_degrees_to_radians(entity['rotate-y']),
        math_degrees_to_radians(entity['rotate-z']),
      ],
      'id': entity['id'],
    });
}

function webgl_logic_particle(entity){
    const particle = webgl_particles[entity['particle']];
    const repeat = entity['vertices-length'] * 3;
    const vertices = entity['vertices'];

    if(particle['randomize']){
        for(let vertex = 0; vertex < repeat; vertex += 3){
            const y_vertex = vertices[vertex + 1] + particle['speed-y'];
            if(y_vertex < particle['y-min']
              || y_vertex > particle['y-max']){
                vertices[vertex] = particle['x-min']
                  + Math.random() * (particle['x-max'] - particle['x-min']);
                vertices[vertex + 2] = particle['z-min']
                  + Math.random() * (particle['z-max'] - particle['z-min']);
            }
        }
    }

    for(let vertex = 0; vertex < repeat; vertex += 3){
        vertices[vertex] = math_clamp({
          'max': particle['x-max'],
          'min': particle['x-min'],
          'value': vertices[vertex] + particle['speed-x'],
          'wrap': true,
        });
        vertices[vertex + 1] = math_clamp({
          'max': particle['y-max'],
          'min': particle['y-min'],
          'value': vertices[vertex + 1] + particle['speed-y'],
          'wrap': true,
        });
        vertices[vertex + 2] = math_clamp({
          'max': particle['z-max'],
          'min': particle['z-min'],
          'value': vertices[vertex + 2] + particle['speed-z'],
          'wrap': true,
        });
    }

    webgl.bindVertexArray(entity['vao']);
    webgl_buffer_set({
      'attribute': webgl_shader_attributes['vertexPosition'],
      'data': vertices,
      'size': 3,
    });
}

// Required args: id, model
function webgl_model_create(args){
    const character = webgl_characters[args['id']];
    const xz = character['collide-xz'] * 2;

    webgl_primitive_cuboid({
      'all': {
        'collision': false,
        'texture': 'grid.png',
      },
      'character': args['id'],
      'prefix': args['id'],
      'position-y': (character['collide-top'] - character['collide-bottom']) / 2,
      'size-x': xz,
      'size-y': character['collide-bottom'] + character['collide-top'],
      'size-z': xz,
      ...args['model'],
    });
}

// Required args: move
function webgl_move_to(args){
    args = core_args({
      'args': args,
      'defaults': {
        'target': false,
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    if(args['target']){
        args['move']['position-x'] = args['target']['position-x'];
        args['move']['position-y'] = args['target']['position-y'];
        args['move']['position-z'] = args['target']['position-z'];
        return;
    }

    args['move']['position-x'] = args['x'];
    args['move']['position-y'] = args['y'];
    args['move']['position-z'] = args['z'];
}

function webgl_normals(args){
    args = core_args({
      'args': args,
      'defaults': {
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
      },
    });

    const radians_x = math_degrees_to_radians(args['rotate-x']);
    const radians_y = math_degrees_to_radians(args['rotate-y']);
    const radians_z = -math_degrees_to_radians(args['rotate-z']);
    const cos_y = Math.cos(radians_y);

    return [
      core_round({
        'number': Math.sin(radians_z) * cos_y,
      }),
      core_round({
        'number': Math.cos(radians_x) * Math.cos(radians_z),
      }),
      core_round({
        'number': Math.sin(radians_x) * cos_y,
      }),
    ];
}

function webgl_particle_create(id, args){
    webgl_particles[id] = {
      ...core_args({
        'args': args,
        'defaults': {
          'randomize': true,
          'speed-x': 0,
          'speed-y': 0,
          'speed-z': 0,
          'x-max': 100,
          'x-min': -100,
          'y-max': 100,
          'y-min': -100,
          'z-max': 100,
          'z-min': -100,
        },
      }),
    };
}

function webgl_path_move(character){
    if(webgl_paths[character['path-id']] === void 0){
        return;
    }

    const path = globalThis.structuredClone(webgl_paths[character['path-id']]);
    const point = core_args({
      'args': path['points'][character['path-point']],
      'defaults': {
        'distance': 0,
        'position-x': character['position-x'],
        'position-y': character['position-y'],
        'position-z': character['position-z'],
        'rotate-x': false,
        'rotate-y': false,
        'rotate-z': false,
      },
    });
    const distance = math_distance({
      'x0': character['position-x'],
      'y0': character['position-y'],
      'z0': character['position-z'],
      'x1': point['position-x'],
      'y1': point['position-y'],
      'z1': point['position-z'],
    });
    const speed = point['speed'] || path['speed'] || character['speed'];

    if(distance - speed < point['distance']){
        if(point['distance'] === 0){
            character['position-x'] = point['position-x'];
            character['position-y'] = point['position-y'];
            character['position-z'] = point['position-z'];
        }
        webgl_camera_rotate({
          'character': character['id'],
          'set': true,
          'x': point['rotate-x'],
          'y': point['rotate-y'],
          'z': point['rotate-z'],
        });
        if(point['event-todo'] !== void 0){
            webgl_event({
              'parent': webgl_paths[character['path-id']]['points'][character['path-point']],
              'target': character,
            });
        }

        const path_end = character['path-end'] === ''
          ? path['end']
          : character['path-end'];
        if(character['path-direction'] > 0){
            if(character['path-point'] >= path['points'].length - 1){
                if(path_end === 'loop'){
                    character['path-point'] = 0;

                }else if(path_end === 'reverse'){
                    character['path-direction'] = -1;
                    character['path-point'] -= 1;

                }else if(path_end === 'warp'){
                    character['path-point'] = 1;
                    const warp = core_args({
                      'args': path['points'][0],
                      'defaults': {
                        'position-x': character['position-x'],
                        'position-y': character['position-y'],
                        'position-z': character['position-z'],
                      },
                    });
                    character['position-x'] = warp['position-x'];
                    character['position-y'] = warp['position-y'];
                    character['position-z'] = warp['position-z'];

                }else{
                    character['path-id'] = '';
                    character['path-point'] = 0;
                    if(character['level'] < -1){
                        character['change-position-x'] = 0;
                        character['change-position-y'] = 0;
                        character['change-position-z'] = 0;
                    }
                }

            }else{
                character['path-point'] += 1;
                character['change-position-x'] = 0;
                character['change-position-y'] = 0;
                character['change-position-z'] = 0;
            }

        }else if(character['path-point'] === 0){
            if(path_end === 'loop'){
                character['path-point'] = path['points'].length - 1;

            }else if(path_end === 'reverse'){
                character['path-direction'] = 1;
                character['path-point'] = 1;

            }else if(path_end === 'warp'){
                const last = path['points'].length - 1;
                character['path-point'] = last - 1;
                const warp = core_args({
                  'args': path['points'][last],
                  'defaults': {
                    'position-x': character['position-x'],
                    'position-y': character['position-y'],
                    'position-z': character['position-z'],
                  },
                });
                character['position-x'] = warp['position-x'];
                character['position-y'] = warp['position-y'];
                character['position-z'] = warp['position-z'];

            }else{
                character['path-id'] = '';
                character['path-point'] = 0;
                if(character['level'] < -1){
                    character['change-position-x'] = 0;
                    character['change-position-y'] = 0;
                    character['change-position-z'] = 0;
                }
            }

        }else{
            character['path-point'] -= 1;
            character['change-position-x'] = 0;
            character['change-position-y'] = 0;
            character['change-position-z'] = 0;
        }

        return;
    }

    const angle_xz = Math.atan2(
      point['position-z'] - character['position-z'],
      point['position-x'] - character['position-x']
    );
    const angle_y = Math.asin(Math.abs(character['position-y'] - point['position-y']) / distance);
    const cos_y_speed = Math.cos(angle_y) * speed;
    character['change-position-x'] = core_round({
      'number': Math.cos(angle_xz) * cos_y_speed,
    });
    let change_position_y = Math.sin(angle_y) * speed;
    if(character['position-y'] > point['position-y']){
        change_position_y *= -1;
    }
    character['change-position-y'] = core_round({
      'number': change_position_y,
    });
    character['change-position-z'] = core_round({
      'number': Math.sin(angle_xz) * cos_y_speed,
    });
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

    const path = webgl_paths[args['path-id']];
    if(!path){
        return;
    }

    const character = webgl_characters[args['id']];
    character['path-id'] = args['path-id'];

    if(args['use-path-properties']){
        character['path-direction'] = path['direction'] || 1;
        character['path-end'] = path['end'] || '';
        character['path-point'] = path['point'] || 0;
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
    if(core_menu_open
      || webgl === 0){
        return;
    }

    const level = webgl_character_level();
    if(level < -1
      || (level >= 0 && webgl_properties['paused'])
      || webgl_characters[webgl_character_id]['life'] <= 0){
        return false;
    }

    args = core_args({
      'args': args,
      'defaults': {
        'x': core_mouse['x'],
        'y': core_mouse['y'],
      },
    });

    webgl.uniform1i(
      webgl_shader_uniforms['picking'],
      true
    );
    webgl_draw();
    const color = webgl_pick_color({
      'x': args['x'],
      'y': args['y'],
    });
    webgl.uniform1i(
      webgl_shader_uniforms['picking'],
      false
    );

    const color_blue = core_round({
      'decimals': 3,
      'number': color[2] / 255,
    });
    const color_green = core_round({
      'decimals': 3,
      'number': color[1] / 255,
    });
    const color_red = core_round({
      'decimals': 3,
      'number': color[0] / 255,
    });

    if(color_blue !== 0
      || color_green !== 0
      || color_red !== 0){
        for(const id in entity_entities){
            const entity = entity_entities[id];
            const entity_color = entity['picking'];

            if(entity_color
              && color_blue === entity_color[2]
              && color_green === entity_color[1]
              && color_red === entity_color[0]){
                webgl_event({
                  'parent': entity,
                  'target': webgl_characters[webgl_character_id],
                });
                return true;
            }
        }
    }

    return false;
}

function webgl_prefab_args(args){
    const prefab_args = {...args};
    for(const arg in prefab_args){
        if(entity_info['opaque']['default'][arg] === void 0){
            delete prefab_args[arg];
        }
    }
    return core_args({
      'args': prefab_args,
      'defaults': entity_info['opaque']['default'],
    });
}

// Required args: prefab, prefix
function webgl_prefab_remake(args){
    for(const entity in entity_entities){
        if(entity_entities[entity]['id'].startsWith(args['prefix'])){
            entity_remove({
              'entities': [
                entity['id'],
              ],
            });
        }
    }

    globalThis[args['prefab']['type']]?.(args['prefab']['properties']);
}

function webgl_prefab_repeat(args){
    args = core_args({
      'args': args,
      'defaults': {
        'characters': false,
        'count': 1,
        'prefix': entity_id_count,
        'properties': {},
        'type': '',
        'x-max': 0,
        'x-min': 0,
        'y-max': 0,
        'y-min': 0,
        'z-max': 0,
        'z-min': 0,
      },
    });

    if(args['characters']){
        for(let i = 0; i < args['count']; i++){
            const prefix = args['prefix'] + '-' + i;
            webgl_character_init({
              ...args['characters'],
              'id': prefix,
              'spawn': {
                'position-x': Math.random() * (args['x-max'] - args['x-min']) + args['x-min'],
                'position-y': Math.random() * (args['y-max'] - args['y-min']) + args['y-min'],
                'position-z': Math.random() * (args['z-max'] - args['z-min']) + args['z-min'],
                ...args['characters']['spawn'],
              },
            });

            args['properties']['character'] = prefix;
            args['properties']['prefix'] = prefix;

            globalThis[args['type']]?.(args['properties']);
        }
        return;
    }

    for(let i = 0; i < args['count']; i++){
        args['properties']['prefix'] = args['prefix'] + '-' + i;
        args['properties']['position-x'] = Math.random() * (args['x-max'] - args['x-min']) + args['x-min'];
        args['properties']['position-y'] = Math.random() * (args['y-max'] - args['y-min']) + args['y-min'];
        args['properties']['position-z'] = Math.random() * (args['z-max'] - args['z-min']) + args['z-min'];

        globalThis[args['type']]?.(args['properties']);
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
    const prefab_args = webgl_prefab_args(args);

    if(args['top']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'],
          'attach-y': prefab_args['position-y'] + half_size_y,
          'attach-z': prefab_args['position-z'],
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
          args['all'],
          args['top']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
          'groups': args['groups'],
        });
    }

    if(args['bottom']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'],
          'attach-y': prefab_args['position-y'] - half_size_y,
          'attach-z': prefab_args['position-z'],
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
          args['all'],
          args['bottom']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
          'groups': args['groups'],
        });
    }

    if(args['back']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'],
          'attach-y': prefab_args['position-y'],
          'attach-z': prefab_args['position-z'] + half_size_z,
          'id': args['prefix'] + '-back',
          'rotate-x': 90,
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
          args['all'],
          args['back']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
          'groups': args['groups'],
        });
    }

    if(args['front']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'],
          'attach-y': prefab_args['position-y'],
          'attach-z': prefab_args['position-z'] - half_size_z,
          'id': args['prefix'] + '-front',
          'rotate-x': 270,
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
          args['all'],
          args['front']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
          'groups': args['groups'],
        });
    }

    if(args['left']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'] - half_size_x,
          'attach-y': prefab_args['position-y'],
          'attach-z': prefab_args['position-z'],
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
          args['all'],
          args['left']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
          'groups': args['groups'],
        });
    }

    if(args['right']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'] + half_size_x,
          'attach-y': prefab_args['position-y'],
          'attach-z': prefab_args['position-z'],
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
          args['all'],
          args['right']
        );
        webgl_entity_create({
          'entities': [
            properties,
          ],
          'groups': args['groups'],
        });
    }
}

function webgl_primitive_ellipsoid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'color0': [],
        'color1': [],
        'groups': [],
        'prefix': entity_id_count,
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
    const prefab_args = webgl_prefab_args(args);

    const properties = {
      ...prefab_args,
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'attach-x': prefab_args['position-x'],
      'attach-y': prefab_args['position-y'],
      'attach-z': prefab_args['position-z'],
      'collision': false,
      'draw-mode': 'TRIANGLE_STRIP',
      'id': args['prefix'],
      'vertex-colors': [],
      'vertices': [],
    };
    for(let longitude = 0; longitude < args['slices-longitude']; longitude++){
        if(longitude === args['slices-longitude'] / 2){
            [args['color0'], args['color1']] = [args['color1'], args['color0']];
        }

        const longitude_bottom = -1.5707963267948966 + longitude * longitude_angles;
        const longitude_top = -1.5707963267948966 + (longitude + 1) * longitude_angles;
        const cos_bottom = Math.cos(longitude_bottom);
        const cos_bottom_x = args['radius-x'] * cos_bottom;
        const cos_bottom_z = args['radius-z'] * cos_bottom;
        const cos_top = Math.cos(longitude_top);
        const cos_top_x = args['radius-x'] * cos_top;
        const cos_top_z = args['radius-z'] * cos_top;
        const sin_bottom = args['radius-y'] * Math.sin(longitude_bottom);
        const sin_top = args['radius-y'] * Math.sin(longitude_top);

        for(let latitude = 0; latitude <= args['slices-latitude']; latitude++){
            const rotation = latitude * latitude_angles;
            const cos_rotation = Math.cos(rotation);
            const sin_rotation = Math.sin(rotation);

            properties['vertex-colors'].push(
              ...args['color0'],
              ...args['color1']
            );
            properties['vertices'].push(
              cos_top_x * sin_rotation,
              sin_top,
              cos_top_z * cos_rotation,
              cos_bottom_x * sin_rotation,
              sin_bottom,
              cos_bottom_z * cos_rotation,
            );
        }
    }

    webgl_entity_create({
      'entities': [
        properties,
      ],
      'groups': args['groups'],
    });
}

function webgl_primitive_frustum(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bottom': true,
        'character': webgl_character_id,
        'color-bottom': [],
        'color-top': [],
        'groups': [],
        'length': 2,
        'middle': true,
        'points': 8,
        'prefix': entity_id_count,
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
    const prefab_args = webgl_prefab_args(args);
    const properties = {
      ...prefab_args,
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'attach-x': prefab_args['position-x'],
      'attach-y': prefab_args['position-y'],
      'attach-z': prefab_args['position-z'],
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
          'groups': args['groups'],
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
                properties['vertex-colors'].push(...args['color-top']);
                properties['vertices'].push(
                  args['size-top'] * sin_rotation,
                  args['length'],
                  args['size-top'] * cos_rotation
                );

            }else{
                properties['vertex-colors'].push(...args['color-bottom']);
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
          'groups': args['groups'],
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
                properties['vertex-colors'].push(...args['color-bottom']);
                properties['vertices'].push(
                  args['size-bottom'] * sin_rotation,
                  0,
                  args['size-bottom'] * cos_rotation
                );

            }else{
                properties['vertex-colors'].push(...args['color-top']);
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
          'groups': args['groups'],
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
              ...args['color-bottom'],
              ...args['color-top']
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
          'groups': args['groups'],
        });
    }
}

// Required args: id
function webgl_primitive_particle(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'entities': [],
        'groups': [],
        'particle': {},
        'prefix': entity_id_count,
      },
    });

    const particle = args['particle'];
    webgl_particle_create(args['id'], particle);

    for(const entity in args['entities']){
        const vertices = [];
        const vertexcount = args['entities'][entity]['vertex-repeat'];
        delete args['entities'][entity]['vertex-repeat'];
        for(let vertex = 0; vertex <= vertexcount; vertex++){
            vertices.push(
              particle['x-min'] + Math.random() * (particle['x-max'] - particle['x-min']),
              particle['y-min'] + Math.random() * (particle['y-max'] - particle['y-min']),
              particle['z-min'] + Math.random() * (particle['z-max'] - particle['z-min'])
            );
        }

        webgl_entity_create({
          'entities': [
            {
              ...webgl_prefab_args(args),
              ...args['entities'][entity],
              'attach-to': args['character'],
              'attach-type': 'webgl_characters',
              'collision': false,
              'particle': args['id'],
              'vertex-colors': args['entities'][entity]['vertex-colors'] || webgl_vertexcolorarray({
                'vertexcount': 1,
              }),
              'vertices': vertices,
            },
          ],
          'groups': args['groups'],
        });
    }
}

function webgl_primitive_stars(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'color': [1, 1, 1, 1],
        'groups': [],
        'height-limit': 1,
        'point-size': 500,
        'prefix': entity_id_count,
        'radius': 250,
        'range': 100,
        'stars': 100,
      },
    });

    const star_colors = [];
    const star_points = [];
    for(let i = 0; i < args['stars']; i++){
        const theta = Math.random() * 6.283185307179586;
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
        star_colors.push(...args['color']);
    }
    const prefab_args = webgl_prefab_args(args);
    webgl_entity_create({
      'entities': [
        {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'],
          'attach-y': prefab_args['position-y'],
          'attach-z': prefab_args['position-z'],
          'collision': false,
          'draw-mode': 'POINTS',
          'id': args['prefix'],
          'point-size': args['point-size'],
          'vertex-colors': star_colors,
          'vertices': star_points,
        },
      ],
      'groups': args['groups'],
    });
}

function webgl_primitive_terrain(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'colors': [],
        'groups': [],
        'height-random': 10,
        'heights': [],
        'prefix': entity_id_count,
        'tiles-x': 10,
        'tiles-x-size': 10,
        'tiles-z': 10,
        'tiles-z-size': 10,
      },
    });

    const color_count = args['tiles-x'] * (args['tiles-z'] + 1) * 4 + 1;
    while(args['colors'].length < color_count){
        args['colors'].push(...webgl_vertexcolorarray({
          'vertexcount': 1,
        }));
    }
    const height_count = args['tiles-x'] * args['tiles-z'] + args['tiles-x'] + 1;
    while(args['heights'].length < height_count){
        args['heights'].push(Math.random() * args['height-random']);
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

    const prefab_args = webgl_prefab_args(args);
    webgl_entity_create({
      'entities': [
        {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['position-x'],
          'attach-y': prefab_args['position-y'],
          'attach-z': prefab_args['position-z'],
          'collision': false,
          'draw-mode': 'TRIANGLE_STRIP',
          'id': args['prefix'],
          'vertex-colors': point_colors,
          'vertices': points,
        },
      ],
      'groups': args['groups'],
    });
}

function webgl_random_vertex(entity){
    const position = webgl_get_position(entity);
    const vertex = core_random_integer({
      'max': entity['vertices-length'],
    }) * 3;
    return {
      'x': position['x'] + entity['vertices'][vertex],
      'y': position['y'] + entity['vertices'][vertex + 1],
      'z': position['z'] + entity['vertices'][vertex + 2],
    };
}

function webgl_resize(){
    webgl.canvas.height = globalThis.innerHeight;
    webgl.canvas.width = globalThis.innerWidth;
    webgl.viewport(
      0,
      0,
      webgl.drawingBufferWidth,
      webgl.drawingBufferHeight
    );

    math_matrices['perspective'][0] = webgl.drawingBufferHeight / webgl.drawingBufferWidth;
    webgl.uniformMatrix4fv(
      webgl_shader_uniforms['perspectiveMatrix'],
      false,
      math_matrices['perspective']
    );

    if(core_menu_open
      && webgl_textures[webgl_default_texture]){
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

    const target = args['target'];
    if(webgl_character_level(target) < 0
      && (args['stat'] === 'level-xp' || args['stat'] === 'life')){
        return;
    }

    if(args['stat'].startsWith('rotate-')
      || args['stat'].startsWith('camera-rotate-')){
        const rotate_args = {
          'camera': args['stat'].startsWith('camera-rotate-'),
          'character': target['id'],
          'mouse': false,
          'set': args['set'],
        };
        rotate_args[args['stat'].at(-1)] = args['value'];
        webgl_camera_rotate(rotate_args);

    }else if(args['stat'] === 'vertex-colors'){
        target['vertex-colors'] = core_type(args['value']) === 'array'
          ? args['value']
          : webgl_vertexcolorarray();
        webgl.bindVertexArray(target['vao']);
        webgl_buffer_set({
          'attribute': webgl_shader_attributes['vertexColor'],
          'data': webgl_vertexcolorarray({
            'colors': target['vertex-colors'],
            'vertexcount': target['vertices-length'],
          }),
          'size': 4,
        });

    }else{
        if(target[args['stat']] === void 0){
            if(args['has']){
                return;
            }

            target[args['stat']] = 0;
        }

        if(args['set'] && target[args['stat']] === args['value']){
            return;
        }

        target[args['stat']] = (args['set'] || core_type(args['value']) !== 'number')
          ? args['value']
          : target[args['stat']] + args['value'];

        if(args['stat'] === 'level-xp'){
            while(target['level-xp'] >= Math.floor(target['level'] + 1) * 1e3){
                target['level-xp'] -= Math.floor(target['level'] + 1) * 1e3;
                target['level']++;
            }

        }else if(args['stat'] === 'life'){
            if(target['life'] <= 0){
                target['life'] = 0;

                if(target['lives'] > 0){
                    target['lives']--;
                }

                if(target['lives'] === 0){
                    target['gravity'] = 0;

                    const axes = 'xyz';
                    for(const axis in axes){
                        target['change-rotate-' + axes[axis]] = 0;
                        target['change-position-' + axes[axis]] = 0;
                    }

                }else{
                    webgl_character_spawn(target['id']);
                }

            }else{
                target['life'] = Math.min(
                  target['life'],
                  target['life-max']
                );
            }
        }
    }

    globalThis['repo_stat_modify']?.(args);
}

function webgl_texture_animate(id){
    const texture = webgl_textures[id];
    if(!texture['ready']){
        return;
    }

    const image = core_images[texture['image']];

    const width = image['width'];
    let offset_x = texture['offset-x'] + texture['speed-x'];
    if(offset_x < 0){
        offset_x = width;

    }else if(offset_x >= width){
        offset_x = 0;
    }
    texture['offset-x'] = offset_x;

    const height = image['height'];
    let offset_y = texture['offset-y'] + texture['speed-y'];
    if(offset_y < 0){
        offset_y = height;

    }else if(offset_y >= height){
        offset_y = 0;
    }
    texture['offset-y'] = offset_y;

    const canvas = core_elements['texture-' + id].getContext('2d');
    canvas.save();
    canvas.fillStyle = canvas.createPattern(
      image,
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

    webgl.bindTexture(
      webgl.TEXTURE_2D,
      texture['gl']
    );
    webgl.texImage2D(
      webgl.TEXTURE_2D,
      0,
      webgl.RGBA,
      webgl.RGBA,
      webgl.UNSIGNED_BYTE,
      core_elements['texture-' + id]
    );
    webgl.generateMipmap(webgl.TEXTURE_2D);
}

// Required args: id
function webgl_texture_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'loading': false,
      },
    });

    if(!webgl_textures[args['id']]){
        webgl_textures[args['id']] = {};
    }
    const texture = webgl_textures[args['id']];

    const split = args['id'].split(',');
    const image = split[0];
    let texture_complete = false;
    let texture_id = webgl_default_texture;
    if(core_images[image]?.complete){
        texture_complete = true;
        texture_id = image;
    }

    if(!texture_complete
      && !args['loading']){
        if(split.length > 1){
            texture['ready'] = false;
        }
        core_image({
          'id': image,
          'src': webgl_uris[image],
          'todo': function(){
              webgl_texture_init({
                'id': args['id'],
                'loading': true,
              });
          },
        });
        return;
    }

    if(split.length > 1){
        const id = 'texture-' + args['id'];
        core_html({
          'parent': core_html({
            'parent': core_elements['repo-ui'],
            'properties': {
              'className': 'hidden',
              'id': 'webgl-animated-textures',
            },
            'type': 'div',
          }),
          'properties': {
            'height': core_images[image]['height'],
            'id': id,
            'width': core_images[image]['width'],
          },
          'store': id,
          'type': 'canvas',
        });
        texture['image'] = image;
        texture['offset-x'] = 0;
        texture['offset-y'] = 0;
        texture['speed-x'] = 0;
        texture['speed-y'] = 0;
        texture['ready'] = true;
    }

    texture['gl'] = webgl.createTexture();
    webgl.bindTexture(
      webgl.TEXTURE_2D,
      texture['gl']
    );
    webgl.texImage2D(
      webgl.TEXTURE_2D,
      0,
      webgl.RGBA,
      webgl.RGBA,
      webgl.UNSIGNED_BYTE,
      core_images[image]
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

    if(texture['ready'] === true){
        webgl_texture_animate(args['id']);
        texture['speed-x'] = Number(split[1]);
        texture['speed-y'] = split.length > 2 ? Number(split[2]) : 0;
    }
}

// Required args: tiles
function webgl_tiles(args){
    args = core_args({
      'args': args,
      'defaults': {
        'order': false,
        'repeat': false,
        'tiles-max': 5,
        'tiles-min': 1,
      },
    });

    const tiles = [];
    if(args['order']){
        for(const tile in args['order']){
            tiles.push(args['order'][tile]);
        }

    }else if(args['repeat']){
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

    const prefab_args = webgl_prefab_args(args);
    let tile_offset_x = prefab_args['position-x'];
    let tile_offset_y = prefab_args['position-y'];
    let tile_offset_z = prefab_args['position-z'];
    let tile_rotate_x = prefab_args['rotate-x'];
    let tile_rotate_y = prefab_args['rotate-y'];
    let tile_rotate_z = prefab_args['rotate-z'];

    for(const tile in tiles){
        const prefix = args['prefix'] + '-' + tile + '-';

        for(const path in args['tiles'][tiles[tile]]['paths']){
            const path_object = {
              ...args['tiles'][tiles[tile]]['paths'][path],
              'points': [],
            };
            const points = args['tiles'][tiles[tile]]['paths'][path]['points'];
            for(const point in points){
                const point_object = {};
                if(points[point]['position-x'] !== void 0){
                    point_object['position-x'] = tile_offset_x + points[point]['position-x'];
                }
                if(points[point]['position-y'] !== void 0){
                    point_object['position-y'] = tile_offset_y + points[point]['position-y'];
                }
                if(points[point]['position-z'] !== void 0){
                    point_object['position-z'] = tile_offset_z + points[point]['position-z'];
                }
                path_object['points'].push(point_object);
            }
            webgl_paths[prefix + path] = path_object;
        }

        for(const character in args['tiles'][tiles[tile]]['characters']){
            const character_object = args['tiles'][tiles[tile]]['characters'][character];
            const spawn = character_object['spawn'] || {};
            webgl_character_init({
              ...character_object,
              'id': prefix + character_object['id'],
              'path-id': character_object['path-id'] !== ''
                ? prefix + character_object['path-id']
                : '',
              'spawn': {
                'position-x': tile_offset_x + (character_object['position-x'] || 0),
                'position-y': tile_offset_y + (character_object['position-y'] || 0),
                'position-z': tile_offset_z + (character_object['position-z'] || 0),
                ...spawn,
              },
            });
        }

        const entities = args['tiles'][tiles[tile]]['entities'];
        for(const entity in entities){
            webgl_entity_create({
              'entities': [
                {
                  ...prefab_args,
                  ...entities[entity],
                  'attach-to': args['character'],
                  'attach-type': 'webgl_characters',
                  'attach-x': tile_offset_x + (entities[entity]['attach-x'] || 0),
                  'attach-y': tile_offset_y + (entities[entity]['attach-y'] || 0),
                  'attach-z': tile_offset_z + (entities[entity]['attach-z'] || 0),
                  'id': prefix + entity,
                  'path-id': entities[entity]['path-id'] !== ''
                    ? prefix + entities[entity]['path-id']
                    : '',
                },
              ],
              'groups': args['groups'],
            });
        }

        const prefabs = args['tiles'][tiles[tile]]['prefabs'];
        for(const prefab in prefabs){
            const attached = prefabs[prefab]['properties']['character'] !== void 0;

            globalThis[prefabs[prefab]['type']]?.({
              ...prefab_args,
              ...prefabs[prefab]['properties'],
              'character': attached
                ? prefix + prefabs[prefab]['properties']['character']
                : args['character'],
              'prefix': prefix + (prefabs[prefab]['properties']['prefix'] || entity_id_count),
              'position-x': (prefabs[prefab]['properties']['position-x'] || 0) + (attached
                ? 0
                : tile_offset_x),
              'position-y': (prefabs[prefab]['properties']['position-y'] || 0) + (attached
                ? 0
                : tile_offset_y),
              'position-z': (prefabs[prefab]['properties']['position-z'] || 0) + (attached
                ? 0
                : tile_offset_z),
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
    webgl.uniform3fv(
      webgl_shader_uniforms['ambient-color'],
      webgl_properties['ambient-color']
    );
    webgl.uniform3fv(
      webgl_shader_uniforms['clear-color'],
      webgl_properties['clear-color']
    );
    webgl.uniform1i(
      webgl_shader_uniforms['directional'],
      webgl_properties['directional-state']
    );
    webgl.uniform3fv(
      webgl_shader_uniforms['directional-color'],
      webgl_properties['directional-color']
    );
    webgl.uniform3fv(
      webgl_shader_uniforms['directional-vector'],
      webgl_properties['directional-vector']
    );
    webgl.uniform1f(
      webgl_shader_uniforms['fog-end'],
      webgl_properties['fog-end']
    );
    webgl.uniform1f(
      webgl_shader_uniforms['fog-start'],
      webgl_properties['fog-start']
    );
}

function webgl_vehicle_toggle(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': webgl_character_id,
        'vehicle': false,
      },
    });

    const vehicle = webgl_characters[args['vehicle']];
    if(vehicle?.['vehicle-stats']['lock'] === 3){
        return;
    }

    const current = webgl_characters[args['id']]['vehicle'];
    if(current){
        if(webgl_characters[current]['vehicle-stats']['lock'] === 2){
            return;
        }
        webgl_characters[args['id']]['vehicle'] = false;
        vehicle['vehicle-stats']['character'] = false;
        webgl_characters[args['id']]['camera-rotate-y'] = webgl_characters[args['id']]['rotate-y'];
    }
    if(current !== args['vehicle']){
        if(args['vehicle'] === false
          || vehicle['vehicle-stats'] === false
          || vehicle['vehicle-stats']['lock'] === 1
          || vehicle['vehicle-stats']['character']){
            return;
        }

        webgl_characters[args['id']]['vehicle'] = args['vehicle'];
        vehicle['vehicle-stats']['character'] = args['id'];
        const axes = 'xyz';
        for(const axis in axes){
            webgl_characters[args['id']]['change-rotate-' + axes[axis]] = 0;
            webgl_characters[args['id']]['change-position-' + axes[axis]] = 0;
        }
        webgl_characters[args['id']]['camera-rotate-y'] = vehicle['rotate-y'];
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

globalThis.webgl_default_texture = 'default.png';
globalThis.webgl_uris = globalThis.uris || {
  [webgl_default_texture]: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
};
core_image({
  'id': webgl_default_texture,
  'src': webgl_uris[webgl_default_texture],
});
delete globalThis.uris;
globalThis.webgl = 0;
globalThis.webgl_character_count = 0;
globalThis.webgl_character_id = '_me';
globalThis.webgl_characters = {};
globalThis.webgl_particles = {};
globalThis.webgl_paths = {};
globalThis.webgl_properties = {};
globalThis.webgl_shader_attributes = {};
globalThis.webgl_shader_uniforms = {};
globalThis.webgl_textures = {};
