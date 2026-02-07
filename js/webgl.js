'use strict';

// Required args: id
function webgl_audio(args){
    args = core_args({
      'args': args,
      'defaults': {
        'audio': false,
        'divider_x': 50,
        'divider_y': 50,
        'divider_z': 50,
        'type': 'webgl_characters',
      },
    });

    if(!audio_audios[args.id]){
        audio_create?.({
          [args.id]: args.audio,
        });
    }

    const character = webgl_characters[webgl_character_id];
    const radians_y = math_degrees_to_radians(character.rotate_y);
    const target = webgl_get_position(globalThis[args.type][args.target]);
    audio_start_at?.({
      'forwardX': Math.sin(-radians_y),
      'forwardY': 0,
      'forwardZ': Math.cos(radians_y),
      'id': args.id,
      'positionX': (character.position_x - target.x) / args.divider_x,
      'positionY': (character.position_y - target.y) / args.divider_y,
      'positionZ': (character.position_z - target.z) / args.divider_z,
    });
}

function webgl_billboard(id){
    const character = webgl_characters[webgl_character_id];
    const entity = entity_entities[id];
    const position = webgl_get_position(entity);

    entity.rotate_y = 360 - math_radians_to_degrees(Math.atan2(
      position.z - character.camera_z,
      position.x - character.camera_x,
    ) + 1.5707963267948966);
}

// Required args: attribute, data, size
function webgl_buffer_set(args){
    if(args.attribute < 0){
        return;
    }

    webgl.bindBuffer(
      webgl.ARRAY_BUFFER,
      webgl.createBuffer()
    );
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      math_matrix_create(args.data),
      webgl.STATIC_DRAW
    );

    webgl.vertexAttribPointer(
      args.attribute,
      args.size,
      webgl.FLOAT,
      false,
      0,
      0
    );
    webgl.enableVertexAttribArray(args.attribute);
}

function webgl_camera_rotate(args){
    args = core_args({
      'args': args,
      'defaults': {
        'camera': true,
        'character': webgl_character_id,
        'pointer': true,
        'set': false,
        'x': false,
        'y': false,
        'z': false,
      },
    });

    const axes = 'xyz';
    const character = webgl_characters[args.character];
    const prefix = args.camera
      ? 'camera_rotate_'
      : 'rotate_';
    for(const axis of axes){
        let axis_value = args[axis];
        if(axis_value === false){
            continue;
        }

        character[prefix + axis] = args.set
          ? axis_value
          : axis_value + character[prefix + axis];
    }

    if(character.vehicle){
        return;
    }

    let normals = false;
    if(args.camera){
        character.camera_rotate_x = math_clamp({
          'max': 360,
          'min': 0,
          'value': character.camera_rotate_x,
          'wrap': true,
        });
        const max = character.camera_rotate_x > 180
          ? 360
          : 90;
        character.camera_rotate_x = math_clamp({
          'max': max,
          'min': max - 90,
          'value': character.camera_rotate_x,
        });
        character.camera_rotate_y = math_clamp({
          'max': 360,
          'min': 0,
          'value': character.camera_rotate_y,
          'wrap': true,
        });
        character.camera_rotate_z = math_clamp({
          'max': 360,
          'min': 0,
          'value': character.camera_rotate_z,
          'wrap': true,
        });

        if(args.y === false){
            return;
        }

        let pointer_0_down = false;
        let pointer_1_down = false;
        if(args.character === webgl_character_id){
            pointer_0_down = core_pointer.down_0;
            pointer_1_down = core_pointer.down_1;
        }

        const strafe = webgl_character_strafe(character);
        const pointer_check = strafe
          || (!pointer_0_down && !pointer_1_down)
          || !args.pointer;

        if(character.camera_zoom === 0
          || (pointer_check
            && webgl_character_level(character) > -2
            && character.life > 0)){
            character.rotate_y = strafe
              ? character.camera_rotate_y
              : args.set
                ? args.y
                : character.rotate_y + args.y;
            normals = true;
        }

    }else{
        normals = true;
    }

    if(normals){
        entity_group_modify({
          'groups': [
            'webgl_characters_' + args.character,
          ],
          'todo': webgl_entity_normals,
        });
    }
}

function webgl_character_die(id){
    if(!id){
        id = webgl_character_id;
    }
    webgl_stat_modify({
      'set': true,
      'stat': 'life',
      'target': webgl_characters[id],
      'value': 0,
    });
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

    const character = webgl_characters[args.id];
    const target = webgl_characters[args.target];
    const angle_xz = Math.atan2(
      target.position_z - character.position_z,
      target.position_x - character.position_x
    );
    target.change_position_x = Math.cos(angle_xz) * args.xz;
    target.change_position_y = args.y;
    target.change_position_z = Math.sin(angle_xz) * args.xz;
}

function webgl_character_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'automove': false,
        'base': false,
        'camera_lock': true,
        'camera_zoom': 0,
        'collide_bottom': 3,
        'collide_top': 3,
        'collide_xz': 2,
        'collides': false,
        'controls': '',
        'entities': [],
        'gravity': 0,
        'id': webgl_character_id,
        'jump_height': 1,
        'level': -2,
        'level_xp': 0,
        'life_max': 1,
        'lives': -1,
        'lock': {},
        'model': false,
        'path_direction': 1,
        'path_end': '',
        'path_id': '',
        'path_point': 0,
        'scale_x': 1,
        'scale_y': 1,
        'scale_z': 1,
        'spawn': {},
        'speed': 1,
        'turn_speed': 5,
        'vehicle_stats': false,
      },
    });

    const entities = args.entities;
    delete args.entities;
    const model = args.model;
    delete args.model;
    if(args.base){
        webgl_character_base = args.id;
    }
    delete args.base;

    webgl_characters[args.id] = {
      'camera_rotate_x': 0,
      'camera_rotate_y': 0,
      'camera_rotate_z': 0,
      'camera_x': 0,
      'camera_y': 0,
      'camera_z': 0,
      'change_position_x': 0,
      'change_position_y': 0,
      'change_position_z': 0,
      'change_rotate_x': 0,
      'change_rotate_y': 0,
      'change_rotate_z': 0,
      'jump_allow': false,
      'keys': false,
      'life': args.life_max,
      'locked': {},
      'pointer': false,
      'position_x': 0,
      'position_y': 0,
      'position_z': 0,
      'rotate_x': 0,
      'rotate_y': 0,
      'rotate_z': 0,
      ...args,
      'camera_zoom': Math.min(
        webgl_properties.camera_zoom_max,
        Math.max(
          args.camera_zoom,
          args.level === -1
            ? 0
            : webgl_properties.camera_zoom_min
        )
      ),
      'vehicle': false,
      'vehicle_stats': args.vehicle_stats === false
        ? false
        : core_args({
            'args': args.vehicle_stats,
            'defaults': {
              'character': false,
              'lock': 0,
              'speed': 0,
              'speed_backward': -.1,
              'speed_forward': .1,
              'speed_max_backward': -.5,
              'speed_max_forward': 1,
            },
          }),
    };
    webgl_character_count++;

    entity_group_create(['webgl_characters_' + args.id]);
    webgl_entity_create({
      'character': args.id,
      'entities': entities,
    });

    if(args.vehicle_stats
      && args.vehicle_stats.character){
        const character = webgl_characters[args.id].vehicle_stats.character;
        webgl_characters[args.id].vehicle_stats.character = false;
        webgl_vehicle_toggle({
          'id': character,
          'vehicle': args.id,
        });
    }

    if(model){
        webgl_model_create({
          'id': args.id,
          'model': model,
        });
    }

    webgl_character_spawn(args.id);
}

function webgl_character_level(character){
    if(!character){
        character = webgl_characters[webgl_character_id];
    }

    if(core_type(character.level) === 'number'){
        return character.level;
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

    if(args.y){
        webgl_characters[args.id].change_position_y += args.speed * (args.strafe
          ? -1
          : 1);
        return;
    }

    const movement = math_move_3d({
      'angle': args.angle === true
        ? webgl_characters[args.id].rotate_y
        : args.angle,
      'speed': args.speed,
      'strafe': args.strafe,
    });
    webgl_characters[args.id].change_position_x += movement.x;
    webgl_characters[args.id].change_position_z += movement.z;
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
    const character = webgl_characters[args.id];
    let scaled = false;
    for(const axis of axes){
        let axis_value = args[axis];
        if(axis_value === false){
            continue;
        }

        const scale = 'scale_' + axis;
        if(!args.set){
            axis_value += character[scale];
        }
        if(character[scale] !== axis_value){
            scaled = true;
            character[scale] = axis_value;
        }
    }

    if(!scaled){
        return;
    }

    entity_group_modify({
      'groups': [
        'webgl_characters_' + args.id,
      ],
      'todo': function(entity){
          if(entity_groups.skybox?.[entity.id]){
              return;
          }

          webgl_entity_scale({
            'entity': entity.id,
            'set': true,
            'update': false,
            'x': entity.scale_x * character.scale_x,
            'y': entity.scale_y * character.scale_y,
            'z': entity.scale_z * character.scale_z,
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
              entity.id,
            ],
            'from': 'webgl_characters_' + entity.attach_to,
            'to': 'webgl_characters_' + webgl_character_id,
          });
          entity.attach_to = webgl_character_id;
      },
    });
}

function webgl_character_spawn(id){
    if(!id){
        id = webgl_character_id;
    }
    const character = webgl_characters[id];
    if(!character
      || character.spawn === false){
        return;
    }

    const axes = 'xyz';
    for(const axis of axes){
        character['camera_rotate_' + axis] = 0;
        character['change_position_' + axis] = 0;
        character['change_rotate_' + axis] = 0;
        character['position_' + axis] = 0;
        character['rotate_' + axis] = 0;
    }
    character.jump_allow = false;

    Object.assign(
      character,
      character.locked,
      webgl_properties.spawn,
      character.spawn
    );
    if(character.spawn.path_id){
        webgl_path_use({
          'id': id,
          'path_id': character.path_id,
        });
    }
    if(character.vehicle_stats){
        character.vehicle_stats.speed = 0;
        const driver = character.vehicle_stats.character;
        if(driver){
            webgl_character_spawn(driver);
        }
    }

    core_object_reset(character.locked);
    const locked = {};
    for(const property in character.lock){
        locked[property] = character[property];
    }
    for(const property in webgl_properties.lock){
        locked[property] = character[property];
    }
    Object.assign(
      character.locked,
      locked
    );
}

function webgl_character_strafe(character){
    const checks = core_getpointerlock()
      || character.camera_zoom === 0
      || character.controls === 'arpg'
      || character.controls === 'rts';

    if(character.id !== webgl_character_id){
        return checks;
    }

    return checks
      || core_pointer.down_1;
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

    const color = webgl_properties[args.type + '_color'];
    if(args.blue !== false){
        color[2] = args.blue;
    }
    if(args.green !== false){
        color[1] = args.green;
    }
    if(args.red !== false){
        color[0] = args.red;
    }

    webgl_uniform_update();
}

// Required args: change, collider, target
function webgl_collision(args){
    const character = webgl_characters[args.target.attach_to];
    const collider_position = webgl_get_position(args.collider);
    const target_position = webgl_get_position(args.target);
    const diffs_x = args.collider.change_position_x - character.change_position_x;
    const diffs_y = args.collider.change_position_y - character.change_position_y;
    const diffs_z = args.collider.change_position_z - character.change_position_z;
    const normal_x = 1 - Math.abs(args.target.normals[0]);
    const normal_y = 1 - Math.abs(args.target.normals[1]);
    const normal_z = 1 - Math.abs(args.target.normals[2]);
    let range_x_max = 0;
    let range_x_min = 0;
    let range_y_max = 0;
    let range_y_min = 0;
    let range_z_max = 0;
    let range_z_min = 0;
    let collision = '';
    let collision_modifier = 0;
    let collision_sign = 0;

    if(normal_y !== 1){
        collision_sign = Math.sign(args.target.normals[1]);

        if(normal_y !== 0){
            if(normal_x !== 1){
                const radians_z = math_degrees_to_radians(args.target.rotate_z);
                const cos = 1 - Math.cos(radians_z);
                range_x_max -= args.target.vertices[0] * cos;
                range_x_min -= args.target.vertices[3] * cos;
                collision_modifier = (collider_position.x - target_position.x) * -Math.tan(radians_z);

            }else if(normal_z !== 1){
                const radians_x = math_degrees_to_radians(args.target.rotate_x);
                const cos = 1 - Math.cos(radians_x);
                range_z_max -= args.target.vertices[8] * cos;
                range_z_min -= args.target.vertices[2] * cos;
                collision_modifier = (collider_position.z - target_position.z) * Math.tan(radians_x);
            }
            range_y_max -= collision_modifier;
            range_y_min -= collision_modifier;

        }else if(diffs_y === 0
          || Math.sign(diffs_y) === collision_sign){
            return;
        }

        collision = 'y';
        range_x_max += args.target.vertices[0];
        range_x_min += args.target.vertices[3];
        range_z_max += args.target.vertices[8];
        range_z_min += args.target.vertices[2];

    }else if(normal_x !== 1){
        collision_sign = Math.sign(args.target.normals[0]);

        if(diffs_x === 0
          || Math.sign(diffs_x) === collision_sign){
            return;
        }

        collision = 'x';
        range_y_max += args.target.vertices[0];
        range_y_min += args.target.vertices[3];
        range_z_max += args.target.vertices[8];
        range_z_min += args.target.vertices[2];

    }else if(normal_z !== 1){
        collision_sign = Math.sign(args.target.normals[2]);

        if(diffs_z === 0
          || Math.sign(diffs_z) === collision_sign){
            return;
        }

        collision = 'z';
        range_x_max += args.target.vertices[0];
        range_x_min += args.target.vertices[3];
        range_y_max += args.target.vertices[8];
        range_y_min += args.target.vertices[2];
    }

    const range_x = args.collider.collide_xz + Math.abs(diffs_x);
    const range_y_bottom = args.collider.collide_bottom + Math.abs(diffs_y);
    const range_y_top = args.collider.collide_top + Math.abs(diffs_y);
    const range_z = args.collider.collide_xz + Math.abs(diffs_z);
    range_x_max += target_position.x + range_x;
    range_x_min += target_position.x - range_x;
    range_y_max += target_position.y + range_y_bottom;
    range_y_min += target_position.y - range_y_top;
    range_z_max += target_position.z + range_z;
    range_z_min += target_position.z - range_z;

    if(collider_position.x <= range_x_min || collider_position.x >= range_x_max
      || collider_position.y <= range_y_min || collider_position.y >= range_y_max
      || collider_position.z <= range_z_min || collider_position.z >= range_z_max){
        return;
    }

    const change_label = 'change_position_' + collision;
    const collide_label = 'collide_' + (collision !== 'y'
      ? 'xz'
      : collision_sign > 0
        ? 'bottom'
        : 'top');
    const old_change_y = args.collider.change_position_y;

    args.collider['position_' + collision] = target_position[collision]
      + args.collider[collide_label] * collision_sign
      + character[change_label] - collision_modifier;
    args.collider[change_label] = character[change_label];

    if(collision === 'y'){
        if(args.target.normals[1] > .5){
            if(!args.collider.jump_allow){
                args.collider.jump_allow = true;

                if(webgl_properties.gravity_damage
                  && args.collider.level >= 0
                  && old_change_y < webgl_properties.gravity_max / 2){
                    webgl_stat_modify({
                      'stat': 'life',
                      'target': args.collider,
                      'value': Math.floor((old_change_y - webgl_properties.gravity_max / 2) * 10),
                    });
                }
            }

            args.change.x -= character.change_position_x;
            args.change.z -= character.change_position_z;

        }else if(args.target.normals[0] !== 0){
            args.collider.change_position_x = Math.sign(args.target.normals[0]) * .2;

        }else if(args.target.normals[2] !== 0){
            args.collider.change_position_z = Math.sign(args.target.normals[2]) * .2;
        }

    }else{
        args.change[collision] = 0;

        if(args.collider.vehicle_stats){
            const other_axis = collision === 'x'
              ? 'z'
              : 'x';

            args.collider.vehicle_stats.speed = Math.min(
              args.collider.vehicle_stats.speed,
              Math.abs(args.collider['change_position_' + other_axis])
            );
        }
    }

    if(args.target.event_range === 0){
        webgl_event({
          'parent': args.target,
          'target': args.collider,
        });
    }

    return args.change;
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
      || character.life <= 0
      || character.path_id.length !== 0){
        return;
    }

    if(character.vehicle_stats){
        const vehicle = character.vehicle_stats;
        if(vehicle.character
          || !character.jump_allow){
            return;
        }
        let speed = 0;
        if(vehicle.speed >= 0){
            speed = Math.max(
              vehicle.speed + vehicle.speed_backward,
              0
            );

        }else{
            speed = Math.min(
              vehicle.speed + vehicle.speed_forward,
              0
            );
        }
        vehicle.speed = speed;
        if(speed !== 0){
            webgl_character_move({
              'id': character.id,
              'speed': -speed,
            });
        }
        return;
    }

    const controls = character.controls;
    if(controls.length === 0){
        return;
    }

    let back = false;
    let crouch = false;
    let forward = false;
    let jump = false;
    let left = false;
    let pointer_0_down = false;
    let pointer_1_down = false;
    let pointer_x = 0;
    let right = false;

    if(character.id === webgl_character_id){
        pointer_0_down = core_pointer.down_0;
        pointer_1_down = core_pointer.down_1;
        pointer_x = core_pointer.x;

        back = core_keys[core_storage_data.move_down].state;
        crouch = core_keys[core_storage_data.crouch].state;
        forward = core_keys[core_storage_data.move_up].state
          || (pointer_0_down && pointer_1_down);
        jump = core_keys[core_storage_data.jump].state;
        left = core_keys[core_storage_data.move_left].state;
        right = core_keys[core_storage_data.move_right].state;

    }else{
        const pointer = character.pointer;
        if(pointer){
            pointer_0_down = pointer.down_0 || false;
            pointer_1_down = pointer.down_1 || false;
            pointer_x = pointer.x;
        }

        const keys = character.keys;
        if(keys){
            back = keys.move_down || false;
            crouch = keys.crouch || false;
            forward = keys.move_up
              || (pointer_0_down && pointer_1_down);
            jump = keys.jump || false;
            left = keys.move_left || false;
            right = keys.move_right || false;
        }
    }

    if(forward || back){
        character.automove = false;

    }else if(character.automove){
        forward = true;
    }

    if(character.vehicle){
        const vehicle = webgl_characters[character.vehicle];
        let speed = 0;
        let turn = 0;
        if(vehicle.jump_allow){
            if(forward){
                speed = Math.min(
                  vehicle.vehicle_stats.speed + vehicle.vehicle_stats.speed_forward,
                  vehicle.vehicle_stats.speed_max_forward
                );

            }else if(back){
                speed = Math.max(
                  vehicle.vehicle_stats.speed + vehicle.vehicle_stats.speed_backward,
                  vehicle.vehicle_stats.speed_max_backward
                );

            }else if(vehicle.vehicle_stats.speed >= 0){
                speed = Math.max(
                  vehicle.vehicle_stats.speed + vehicle.vehicle_stats.speed_backward,
                  0
                );

            }else{
                speed = Math.min(
                  vehicle.vehicle_stats.speed + vehicle.vehicle_stats.speed_forward,
                  0
                );
            }
            vehicle.vehicle_stats.speed = speed;

            if(pointer_1_down){
                const half = webgl.drawingBufferWidth / 2;
                turn = vehicle.turn_speed * Math.max(
                  Math.min(
                    (pointer_x - half) / half,
                    1
                  ),
                  -1
                );

            }else{
                if(left){
                    turn -= vehicle.turn_speed;
                }
                if(right){
                    turn += vehicle.turn_speed;
                }
            }
        }
        if(pointer_1_down
          || turn !== 0){
            if(speed < 0){
                turn *= -1;
            }
            vehicle.rotate_y += turn;
            if(pointer_1_down){
                character.camera_rotate_y = vehicle.rotate_y;

            }else if(!pointer_0_down){
                character.camera_rotate_y += turn;
            }
        }
        if(speed !== 0){
            webgl_character_move({
              'id': vehicle.id,
              'speed': -speed,
            });
        }

        const axes = 'xyz';
        for(const axis of axes){
            const rotate = 'rotate_' + axis;
            const position = 'position_' + axis;
            character[rotate] = vehicle[rotate];
            character[position] = vehicle[position] + vehicle['change_position_' + axis];
        }
        character.position_y += character.collide_bottom;
        return;
    }

    let leftright = 0;
    const strafe = webgl_character_strafe(character);
    if(left){
        if(strafe){
            leftright -= 1;

        }else{
            webgl_camera_rotate({
              'camera': !pointer_0_down,
              'character': character.id,
              'y': -character.turn_speed,
            });
        }
    }
    if(right){
        if(strafe){
            leftright += 1;

        }else{
            webgl_camera_rotate({
              'camera': !pointer_0_down,
              'character': character.id,
              'y': character.turn_speed,
            });
        }
    }

    if(level > -1 && !character.jump_allow){
        return;
    }

    const arpg = controls === 'arpg';
    let forwardback = forward
      ? -1
      : 0;
    if(back){
        if(arpg || level === -1){
            forwardback += 1;

        }else{
            forwardback = forwardback ? 0 : .5;
            leftright *= .5;
        }
    }
    if(crouch){
        if(level === -1){
            webgl_character_move({
              'id': character.id,
              'speed': character.speed,
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
              'id': character.id,
              'speed': character.speed,
              'y': true,
            });

        }else{
            character.jump_allow = false;
            character.change_position_y = character.jump_height;
        }
    }

    if(level > -1
      && leftright !== 0
      && forwardback !== 0){
        forwardback *= .7;
        leftright *= .7;
    }

    if(leftright !== 0){
        webgl_character_move({
          'angle': arpg ? 0 : true,
          'id': character.id,
          'speed': leftright * character.speed,
          'strafe': true,
        });
    }
    if(forwardback !== 0){
        webgl_character_move({
          'angle': arpg ? 0 : true,
          'id': character.id,
          'speed': forwardback * character.speed,
        });
    }

    if(arpg){
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
        character.rotate_y = angle;
    }
}

function webgl_controls_pointer(character){
    if(!character){
        character = webgl_characters[webgl_character_id];
    }
    const controls = character.controls;
    if(controls.length === 0){
        return;
    }
    const level = webgl_character_level(character);
    if(level < -1
      || (level !== -1 && webgl_properties.paused)){
        return;
    }

    let pointer_0_down = false;
    let pointer_1_down = false;
    let movement_x = 0;
    let movement_y = 0;
    let shift_key = false;

    if(character.id === webgl_character_id){
        pointer_0_down = core_pointer.down_0;
        pointer_1_down = core_pointer.down_1;
        movement_x = core_pointer.movement_x;
        movement_y = core_pointer.movement_y;
        shift_key = core_key_shift;

    }else{
        const pointer = character.pointer;
        if(pointer){
            pointer_0_down = pointer.down_0;
            pointer_1_down = pointer.down_1;
            movement_x = pointer.movement_x;
            movement_y = pointer.movement_y;
        }

        const keys = character.keys;
        if(keys){
            shift_key = keys.shift;
        }
    }

    if(controls === 'rts'
      && !shift_key){
        return;
    }

    if(pointer_0_down
      || pointer_1_down
      || core_getpointerlock()){
        webgl_camera_rotate({
          'character': character.id,
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
        character.camera_zoom = core_key_shift
          ? webgl_properties.camera_zoom_max
          : Math.min(
              character.camera_zoom + 1,
              webgl_properties.camera_zoom_max
            );

    }else{
        const min = character.level === -1
          ? 0
          : webgl_properties.camera_zoom_min;

        character.camera_zoom = core_key_shift
          ? min
          : Math.max(
              character.camera_zoom - 1,
              min
            );
    }
}

function webgl_draw(){
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
    if(!entity.draw
      || !entity.visible){
        return;
    }

    webgl.bindVertexArray(entity.vao);

    const uniforms = webgl_shaders[webgl_shader_id].uniforms;
    webgl.bindTexture(
      webgl.TEXTURE_2D,
      webgl_textures[entity.texture].gl
    );
    webgl.uniform1f(
      uniforms.alpha,
      entity.alpha
    );
    webgl.uniform1f(
      uniforms.point_size,
      entity.point_size
    );
    webgl.uniform3fv(
      uniforms.normals,
      entity.normals
    );
    webgl.uniformMatrix4fv(
      uniforms.camera,
      false,
      webgl_matrices[entity.id]
    );
    if(webgl_shader_id === 'picking'){
        webgl.uniform3fv(
          uniforms.pick_color,
          entity.picking === false
           ? [0, 0, 0]
           : entity.picking
        );
    }

    webgl.drawArrays(
      webgl[entity.draw_mode],
      0,
      entity.vertices_length
    );
}

function webgl_drawloop(){
    webgl_draw();
    core_interval_animationFrame('webgl_drawloop');
}

function webgl_draw_picked(args){
    webgl_shader_use('picking');
    webgl.uniform1i(
      webgl_shaders.picking.uniforms.xyz,
      true
    );
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    webgl_draw_entity(args.picked);
    const rgb = webgl_pick_color({
      'x': args.x,
      'y': args.y,
    });
    webgl.uniform1i(
      webgl_shaders.picking.uniforms.xyz,
      false
    );
    webgl_shader_use('default');

    return rgb;
}

function webgl_draw_picking(){
    webgl.clearColor(0, 0, 0, 1);
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    webgl.disable(webgl.DEPTH_TEST);
    entity_group_modify({
      'groups': [
        'skybox',
      ],
      'todo': function(entity){
          if(entity.picking_exclude){
              return;
          }

          webgl_draw_entity(entity);
      },
    });
    webgl.enable(webgl.DEPTH_TEST);

    entity_group_modify({
      'groups': [
        'opaque',
        'transparent',
      ],
      'todo': function(entity){
          if(entity.picking_exclude){
              return;
          }

          webgl_draw_entity(entity);
      },
    });
}

// Required args: id
function webgl_entity_alpha(args){
    args = core_args({
      'args': args,
      'defaults': {
        'alpha': 1,
      },
    });

    const entity = entity_entities[args.id];
    entity.alpha = args.alpha;

    if(args.alpha === 1){
        entity_group_move({
          'entities': [
            entity.id,
          ],
          'from': 'transparent',
          'to': 'opaque',
        });

    }else{
        entity_group_move({
          'entities': [
            entity.id,
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
        'character': webgl_character_base,
        'entities': [],
        'groups': [],
      },
    });

    for(const id of args.entities){
        id.attach_to = args.character;
        const entity = entity_create({
          'id': id.id,
          'properties': id,
          'types': id.types,
        });
        webgl_matrices[entity.id] = math_matrix_create();

        const groups = [
          ...args.groups,
        ];
        if(entity.groups){
            groups.push(entity.groups);
            delete entity.groups;
        }
        for(const group of groups){
            entity_group_add({
              'entities': [
                entity.id,
              ],
              'group': group,
            });
        }

        if(entity_groups.skybox?.[entity.id]){
            entity_group_remove({
              'entities': [
                entity.id,
              ],
              'group': 'opaque',
            });
            entity_group_remove({
              'entities': [
                entity.id,
              ],
              'group': 'transparent',
            });
            entity.attach_to = webgl_character_id;
        }

        if(entity.scale_x !== 1
          || entity.scale_y !== 1
          || entity.scale_z !== 1){
            webgl_entity_scale({
              'init': true,
              'entity': entity.id,
              'set': true,
              'x': entity.scale_x,
              'y': entity.scale_y,
              'z': entity.scale_z,
            });
        }

        entity_attach({
          'entity': entity,
          'to': entity.attach_to,
          'type': entity.attach_type,
          'x': entity.attach_x,
          'y': entity.attach_y,
          'z': entity.attach_z,
        });
        entity_group_add({
          'entities': [
            entity.id,
          ],
          'group': 'webgl_characters_' + entity.attach_to,
        });
        const character = webgl_characters[entity.attach_to];
        webgl_entity_scale({
          'entity': entity.id,
          'set': true,
          'update': false,
          'x': entity.scale_x * character.scale_x,
          'y': entity.scale_y * character.scale_y,
          'z': entity.scale_z * character.scale_z,
        });
    }
}

function webgl_entity_init(entity){
    if(!webgl_textures[entity.texture]){
        webgl_texture_init(entity.texture);
    }

    webgl_entity_alpha({
      'alpha': entity.alpha,
      'id': entity.id,
    });
    entity.vertices_length = entity.vertices.length / 3;
    entity.vertex_colors = webgl_vertexcolorarray({
      'colors': entity.vertex_colors,
      'vertexcount': entity.vertices_length,
    });
    webgl_entity_normals(entity);

    if(entity.picking === true){
        entity.picking = [
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
    const texture_align = entity.texture_align;
    const textureData = [];
    const half_length = texture_align.length / 2;
    for(let i = 0; i < entity.vertices_length; i++){
        const align = i < half_length
          ? i * 2
          : (i % half_length) * 2;
        textureData.push(
          texture_align[align] * entity.texture_x,
          texture_align[align + 1] * entity.texture_y
        );
    }

    const attributes = webgl_shaders.default.attributes;
    entity.vao = webgl.createVertexArray();
    webgl.bindVertexArray(entity.vao);
    webgl_buffer_set({
      'attribute': attributes.vertexColor,
      'data': entity.vertex_colors,
      'size': 4,
    });
    webgl_buffer_set({
      'attribute': attributes.texturePosition,
      'data': textureData,
      'size': 2,
    });
    webgl_buffer_set({
      'attribute': attributes.vertexPosition,
      'data': entity.vertices,
      'size': 3,
    });
}

function webgl_entity_normals(entity){
    const axes = 'xyz';
    for(const axis of axes){
        const rotate = 'rotate_' + axis;
        entity[rotate] = math_clamp({
          'max': 360,
          'min': 0,
          'value': entity[rotate],
          'wrap': true,
        });
    }

    const attached_to = globalThis[entity.attach_type][entity.attach_to];
    const degrees_x = entity.rotate_x + attached_to.rotate_x;
    const degrees_z = entity.rotate_z + attached_to.rotate_z;
    const radians_x = math_degrees_to_radians(degrees_x);
    const radians_y = math_degrees_to_radians(entity.rotate_y + attached_to.rotate_y);
    const radians_z = -math_degrees_to_radians(degrees_z);
    const cos_y = Math.cos(radians_y);

    entity.normals = [
      core_round({
        'number': (degrees_x === 90 || degrees_x === 270)
          ? Math.sin(radians_y)
          : Math.sin(radians_z) * cos_y,
      }),
      core_round({
        'number': Math.cos(radians_x) * Math.cos(radians_z),
      }),
      core_round({
        'number': (degrees_z === 90 || degrees_z === 270)
          ? Math.sin(radians_y)
          : Math.sin(radians_x) * cos_y,
      }),
    ];
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
    const entity = entity_entities[args.entity];
    let offset = 0;
    let scaled = args.init;
    for(const axis of axes){
        let axis_value = args[axis];
        if(axis_value === false){
            continue;
        }

        const scale = 'scale_' + axis;
        const old_scale = entity[scale];
        if(!args.set){
            axis_value += old_scale;
        }
        if(axis_value !== old_scale || args.init){
            scaled = true;

            if(args.update){
                entity[scale] = axis_value;
            }

            for(let i = offset++; i < entity.vertices_length * 3; i += 3){
                if(!args.init){
                    entity.vertices[i] /= old_scale;
                }
                entity.vertices[i] *= axis_value;
            }
            const attach = 'attach_' + axis;
            if(!args.init){
                entity[attach] /= old_scale;
            }
            entity[attach] *= axis_value;
        }
    }

    if(scaled && args.todo){
        webgl.bindVertexArray(entity.vao);
        webgl_buffer_set({
          'attribute': webgl_shaders.default.attributes.vertexPosition,
          'data': entity.vertices,
          'size': 3,
        });
    }
}

// Required args: parent, target
function webgl_event(args){
    const array = core_type(args.parent) === 'array';
    const event_todo = array
      ? args.parent
      : args.parent.event_todo;

    if(!array
      && args.parent.event_limit !== false){
        if(args.parent.event_limit <= 0){
            args.parent.event_range = false;
            return;
        }

        args.parent.event_limit--;
    }

    for(const todo of event_todo){
        const modify = globalThis.structuredClone(todo);
        if(modify.limit !== void 0){
            if(modify.limit <= 0){
                continue;
            }

            todo.limit--;
        }

        if(!array){
            for(const property in modify){
                if(modify[property] === '_target'){
                    modify[property] = args.target.id;

                }else if(modify[property] === '_self'){
                    modify[property] = args.parent.id;

                }else{
                    const type = core_type(modify[property]);

                    if(type === 'object' || type === 'array'){
                        for(const id in modify[property]){
                            if(modify[property][id] === '_target'){
                                modify[property][id] = args.target.id;

                            }else if(modify[property][id] === '_self'){
                                modify[property][id] = args.parent.id;
                            }
                        }
                    }
                }
            }
        }

        const max = modify.random_max || 0;
        const min = modify.random_min || 0;
        if(min !== 0 || max !== 0){
            modify.value += min + core_random_integer(max - min);
        }

        if(modify.type === 'function'){
            globalThis[modify.todo]?.(modify.value);

        }else if(modify.type === 'variable'){
            if(modify.set){
                globalThis[modify.todo] = modify.value;

            }else{
                globalThis[modify.todo] += modify.value;
            }

        }else if(modify.type === 'character'){
            const target = !modify.todo
              ? args.target
              : webgl_characters[modify.todo];
            if(webgl_character_level(target) < -1){
                continue;
            }

            webgl_stat_modify({
              'set': modify.set,
              'stat': modify.stat,
              'target': target,
              'value': modify.value,
            });

        }else{
            const target = !modify.todo
              ? args.target
              : entity_entities[modify.todo];

            webgl_stat_modify({
              'set': modify.set,
              'stat': modify.stat,
              'target': target,
              'value': modify.value,
            });
        }
    }
}

function webgl_framebuffer_init(){
    webgl_shader({
      'id': 'picking',
      'attributes': [],
      'uniforms': [
        'camera',
        'perspective',
        'pick_color',
        'point_size',
        'xyz',
      ],
      'fragment':
`#version 300 es
precision highp float;
in vec4 color;
out vec4 fragment;
void main(void){
    fragment = color;
}`,
      'vertex':
`#version 300 es
layout (location = 0) in vec3 vertexPosition;
out vec4 color;
uniform bool xyz;
uniform float point_size;
uniform mat4 camera;
uniform mat4 perspective;
uniform vec3 pick_color;
void main(void){
    vec4 positionCamera = camera * vec4(vertexPosition, 1.0);
    gl_Position = perspective * positionCamera;
    if(point_size > 0.0){
        gl_PointSize = point_size / length(positionCamera);
    }
    if(xyz){
        color = vec4(
          (normalize(vertexPosition.x) + 1.0) / 2.0,
          (normalize(vertexPosition.y) + 1.0) / 2.0,
          (normalize(vertexPosition.z) + 1.0) / 2.0,
          1
        );
    }else{
        color = vec4(pick_color, 1);
    }
}`,
    });

    webgl_framebuffer = webgl.createTexture();
    webgl_framebuffer_resize();

    const framebuffer = webgl.createFramebuffer();
    webgl.bindFramebuffer(
      webgl.FRAMEBUFFER,
      framebuffer
    );
    webgl.framebufferTexture2D(
      webgl.FRAMEBUFFER,
      webgl.COLOR_ATTACHMENT0,
      webgl.TEXTURE_2D,
      webgl_framebuffer,
      0
    );
    webgl.bindFramebuffer(
      webgl.FRAMEBUFFER,
      null
    );
}

function webgl_framebuffer_resize(){
    if(webgl_framebuffer === 0){
        return;
    }

    webgl_shader_use('picking');

    webgl.bindTexture(
      webgl.TEXTURE_2D,
      webgl_framebuffer
    );
    webgl.texImage2D(
      webgl.TEXTURE_2D,
      0,
      webgl.RGB,
      globalThis.innerWidth,
      globalThis.innerHeight,
      0,
      webgl.RGB,
      webgl.UNSIGNED_BYTE,
      null
    );
    webgl.uniformMatrix4fv(
      webgl_shaders.picking.uniforms.perspective,
      false,
      webgl_matrices.perspective
    );
    webgl.uniform1i(
      webgl_shaders.picking.uniforms.xyz,
      false
    );

    webgl_shader_use('default');
}

function webgl_get_position(entity){
    if(!entity.attach_to){
        return {
          'x': entity.position_x,
          'y': entity.position_y,
          'z': entity.position_z,
        };
    }

    const target = globalThis[entity.attach_type][entity.attach_to];
    return {
      'x': target.position_x + entity.attach_x,
      'y': target.position_y + entity.attach_y,
      'z': target.position_z + entity.attach_z,
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

    webgl_matrices.camera = math_matrix_create();
    webgl_matrices.perspective = math_matrix_create();
    webgl_matrices.perspective[5] = 1;
    webgl_matrices.perspective[10] = -1;
    webgl_matrices.perspective[11] = -1;
    webgl_matrices.perspective[14] = -2;

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

    webgl_shader({
      'id': 'default',
      'attributes': [
        'vertexPosition',
        'vertexColor',
        'texturePosition',
      ],
      'uniforms': [
        'alpha',
        'ambient_color',
        'camera',
        'clear_color',
        'directional',
        'directional_color',
        'directional_vector',
        'fog_end',
        'fog_start',
        'light_color',
        'light_count',
        'light_position',
        'light_range',
        'normals',
        'perspective',
        'point_size',
      ],
      'fragment':
`#version 300 es
precision mediump float;
in vec2 positionTexture;
in vec3 positionVertex;
in vec4 color;
in vec4 positionCamera;
out vec4 fragment;
uniform float fog_end;
uniform float fog_start;
uniform float light_range[16];
uniform int light_count;
uniform sampler2D sampler;
uniform vec3 clear_color;
uniform vec3 light_color[16];
uniform vec3 light_position[16];
void main(void){
    fragment = color;
    if(fog_end > 0.0){
        fragment.rgb = mix(
          fragment.rgb,
          clear_color,
          clamp((length(positionCamera) - fog_start) / (fog_end - fog_start), 0.0, 1.0)
        );
    }
    for(int i = 0; i < light_count; i++) {
        float range = distance(
          light_position[i],
          positionVertex
        );
        if(range < light_range[i]){
            fragment.rgb = mix(
              light_color[i],
              fragment.rgb,
              clamp(range / light_range[i], 0.0, 1.0)
            );
        }
    }
    fragment *= texture(sampler, positionTexture);
}`,
      'vertex':
`#version 300 es
in vec2 texturePosition;
layout (location = 0) in vec3 vertexPosition;
layout (location = 1) in vec4 vertexColor;
out vec2 positionTexture;
out vec3 positionVertex;
out vec4 color;
out vec4 positionCamera;
uniform bool directional;
uniform float alpha;
uniform float point_size;
uniform mat4 camera;
uniform mat4 perspective;
uniform vec3 ambient_color;
uniform vec3 directional_color;
uniform vec3 directional_vector;
uniform vec3 normals;
void main(void){
    positionVertex = vertexPosition;
    positionCamera = camera * vec4(vertexPosition, 1.0);
    gl_Position = perspective * positionCamera;
    if(point_size > 0.0){
        gl_PointSize = point_size / length(positionCamera);
    }
    positionTexture = texturePosition;
    vec4 lighting = vec4(ambient_color, alpha);
    if(directional){
        lighting.rgb += directional_color * max(dot(normals, directional_vector), 0.0);
    }
    color = vertexColor * lighting;
}`,
    });
    webgl_shader_use('default');

    webgl_resize();
    globalThis.onresize = webgl_resize;

    entity_set({
      'default': true,
      'properties': {
        'alpha': 1,
        'attach_to': webgl_character_id,
        'attach_type': 'webgl_characters',
        'attach_x': 0,
        'attach_y': 0,
        'attach_z': 0,
        'billboard': false,
        'change_rotate_x': 0,
        'change_rotate_y': 0,
        'change_rotate_z': 0,
        'collision': true,
        'draw': true,
        'draw_mode': 'TRIANGLE_FAN',
        'draw_range': false,
        'event_limit': false,
        'event_range': false,
        'event_todo': [],
        'light_color': [1, 1, 1,],
        'light_range': 0,
        'normals': [],
        'particle': false,
        'picking': false,
        'picking_exclude': false,
        'picking_range': 0,
        'picking_xyz': false,
        'point_size': 0,
        'position_x': 0,
        'position_y': 0,
        'position_z': 0,
        'rotate_x': 0,
        'rotate_y': 0,
        'rotate_z': 0,
        'scale_x': 1,
        'scale_y': 1,
        'scale_z': 1,
        'texture': webgl_default_texture,
        'texture_align': '11010010',
        'texture_x': 1,
        'texture_y': 1,
        'vertices_length': 0,
        'visible': true,
      },
      'todo': webgl_entity_init,
      'type': 'opaque',
    });

    core_interval_modify({
      'id': 'webgl_logic',
      'paused': true,
      'todo': webgl_logic,
    });
    core_interval_modify({
      'animationFrame': true,
      'id': 'webgl_drawloop',
      'paused': true,
      'todo': webgl_drawloop,
    });
}

// Required args: todo
function webgl_json_function(args){
    args = core_args({
      'args': args,
      'defaults': {
        'args': void 0,
        'spread': true,
      },
    });

    const split = args.todo.split('.');

    let todo = globalThis[split[0]];
    for(let i = 1; i < split.length; i++){
        todo = todo[split[i]];
    }

    if(!args?.args){
        todo();

    }else if(args.spread){
        todo(...args.args);

    }else{
        todo(args.args);
    }
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

    if(args.character === 1){
        if(!args.json.characters
          || args.json.characters.length === 0){
            return;
        }

        let id = 0;
        for(const character in args.json.characters){
            if(args.json.characters[character].id === webgl_character_id){
                id = character;
                break;
            }
        }
        args.character = args.json.characters[id];
        webgl_character_id = args.character.id;

    }else if(args.character === 0
      && args.base.level < -1){
        return;
    }
    webgl_character_base = webgl_character_id;

    const randomized = args.json.randomized;
    if(randomized){
        for(const i in randomized){
            const random = Math.random() * (randomized[i].max - randomized[i].min) + randomized[i].min;

            for(const id in randomized[i].ids){
                const targets = args.json[randomized[i].character
                  ? 'characters'
                  : 'entities'];

                for(const target in targets){
                    if(targets[target].id === randomized[i].ids[id]){
                        if(!targets[target][randomized[i].property]){
                            targets[target][randomized[i].property] = 0;
                        }
                        targets[target][randomized[i].property] += random;

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
      'args': args.json,
      'defaults': {
        'ambient_color': [1, 1, 1],
        'camera_zoom_max': 50,
        'camera_zoom_min': 0,
        'characters': [],
        'clear_color': [0, 0, 0],
        'directional_color': [1, 1, 1],
        'directional_state': false,
        'directional_vector': [0, 1, 0],
        'draw_range': false,
        'fog_end': 0,
        'fog_start': 0,
        'gravity_acceleration': -.05,
        'gravity_damage': false,
        'gravity_max': -2,
        'groups': [],
        'lock': {},
        'paused': false,
        'particles': [],
        'paths': [],
        'picking': 0,
        'pointerlock': false,
        'prefabs': [],
        'reticle': false,
        'spawn': {},
        'textures': false,
        'timers': [],
        'title': false,
        'y_min': false,
      },
    });

    if(level.picking > 0
      && webgl_framebuffer === 0){
        webgl_framebuffer_init();
    }

    entity_id_count = 0;
    core_object_reset(webgl_properties);
    Object.assign(
      webgl_properties,
      {
        'ambient_color': level.ambient_color,
        'camera_zoom_max': level.camera_zoom_max,
        'camera_zoom_min': level.camera_zoom_min,
        'clear_color': level.clear_color,
        'directional_color': level.directional_color,
        'directional_state': level.directional_state,
        'directional_vector': level.directional_vector,
        'draw_range': level.draw_range,
        'fog_end': level.fog_end,
        'fog_start': level.fog_start,
        'gravity_acceleration': level.gravity_acceleration,
        'gravity_damage': level.gravity_damage,
        'gravity_max': level.gravity_max,
        'lock': level.lock,
        'paused': level.paused,
        'picking': level.picking,
        'pointerlock': level.pointerlock,
        'spawn': level.spawn,
        'title': level.title,
        'y_min': level.y_min,
      }
    );

    level.groups.unshift(
      'opaque',
      'transparent',
      'skybox',
    );
    entity_group_create(level.groups);

    if(level.textures !== false){
        Object.assign(
          webgl_uris,
          level.textures
        );
    }

    for(const id in level.particles){
        webgl_particle_create(level.particles[id]);
    }
    for(const id in level.paths){
        const path = level.paths[id];
        webgl_paths[path.id] = {
          ...path,
        };
    }
    for(const timer in level.timers){
        webgl_timer_add(level.timers[timer]);
    }

    if(args.character === -1){
        webgl_character_init({
          'collides': true,
          'controls': 'rpg',
          'level': -1,
        });

    }else if(core_type(args.character) === 'object'){
        webgl_character_init(args.character);

    }else{
        webgl_character_init(args.base);
    }

    for(const id in level.characters){
        webgl_character_init(level.characters[id]);
    }
    for(const prefab in level.prefabs){
        globalThis[level.prefabs[prefab].type](level.prefabs[prefab].properties);
    }

    webgl_color_set({
      'blue': webgl_properties.clear_color[2],
      'green': webgl_properties.clear_color[1],
      'red': webgl_properties.clear_color[0],
    });
    globalThis.repo_level_load?.();

    if(level.reticle){
        const reticle = core_html({
          'parent': core_elements.core_ui,
          'properties': {
            'id': 'reticle',
          },
          'store': 'reticle',
        });
        reticle.setAttribute(
          'style',
          'left:50%;pointer-events:none;position:fixed;top:50%;transform:translate(-50%,-50%);' + (level.reticle === true
            ? 'background:#fff;height:4px;width:4px;'
            : level.reticle)
        );
        reticle.setAttribute(
          'data-height',
          reticle.offsetHeight
        );
        reticle.setAttribute(
          'data-width',
          reticle.offsetWidth
        );
        reticle.style.display = '';

    }else if(core_elements.reticle){
        core_elements.reticle.style.display = 'none';
    }

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

    if(args.json instanceof File){
        core_file({
          'file': args.json,
          'todo': function(event){
              webgl_level_load({
                'character': args.character,
                'json': JSON.parse(event.target.result),
              });
          },
          'type': 'readAsText',
        });
        return true;

    }else if(args.json === null){
        return false;
    }

    core_interval_pause_all();
    webgl_level_init({
      'base': webgl_level_unload(true),
      'character': args.character,
      'json': args.json,
    });

    return true;
}

function webgl_level_unload(base){
    const character = webgl_characters[webgl_character_id];
    const properties = {};
    if(base && character){
        Object.assign(
          properties,
          character,
          character.locked
        );
        delete properties.lock;
        delete properties.locked;
        properties.entities = [];
        for(const id in entity_entities){
            const entity = entity_entities[id];
            if(entity.attach_to === webgl_character_id
              && entity_groups.skybox[id] !== true){
                properties.entities.push(entity);
            }
        }
    }

    entity_remove_all({
      'delete_empty': true,
    });
    core_object_reset(webgl_characters);
    core_object_reset(webgl_particles);
    core_object_reset(webgl_paths);
    core_object_reset(webgl_shader_light_color);
    core_object_reset(webgl_shader_light_position);
    core_object_reset(webgl_shader_light_range);
    core_object_reset(webgl_timers);

    webgl_character_count = 0;
    webgl_timer_count = 0;

    return properties;
}

function webgl_logic(){
    if(webgl === 0){
        return;
    }

    core_object_reset(webgl_shader_light_color);
    core_object_reset(webgl_shader_light_position);
    core_object_reset(webgl_shader_light_range);

    for(const timer in webgl_timers){
        webgl_timer_handle(webgl_timers[timer]);
    }

    if(webgl_properties.pointerlock){
        core_requestpointerlock(webgl.canvas);
    }

    if(!webgl_properties.paused){
        for(const texture in webgl_textures){
            webgl_texture_animate(texture);
        }
    }

    globalThis.repo_logic?.();

    for(const entity in entity_entities){
        webgl_logic_entity(entity_entities[entity]);
    }

    for(const id in webgl_characters){
        const character = webgl_characters[id];
        const level = webgl_character_level(character);
        if(webgl_properties.paused
          && level !== -1){
            continue;
        }

        webgl_controls_keyboard(character);

        if(character.vehicle){
            continue;
        }

        if(character.gravity !== 0){
            character.change_position_y = Math.max(
              character.change_position_y + webgl_properties.gravity_acceleration * character.gravity,
              webgl_properties.gravity_max * character.gravity
            );
        }

        webgl_path_move(character);

        if(character.change_rotate_x !== 0
          || character.change_rotate_y !== 0
          || character.change_rotate_z !== 0){
            webgl_camera_rotate({
              'camera': false,
              'character': id,
              'x': character.change_rotate_x,
              'y': character.change_rotate_y,
              'z': character.change_rotate_z,
            });
        }

        const axes = 'xyz';
        for(const axis of axes){
            const position = 'position_' + axis;
            character[position] += character['change_' + position];

            const rotate = 'rotate_' + axis;
            character[rotate] = math_clamp({
              'max': 360,
              'min': 0,
              'value': character[rotate],
              'wrap': true,
            });
        }

        Object.assign(
           character,
           character.lock,
           webgl_properties.lock
        );

        let change_position_x = character.change_position_x;
        let change_position_z = character.change_position_z;
        if(character.change_position_y !== 0){
            character.jump_allow = false;
        }

        if(character.collides
          && webgl_paths[character.path_id]?.collision !== false){
            for(const id in entity_entities){
                const entity = entity_entities[id];
                if(entity.collision){
                    const change = webgl_collision({
                      'collider': character,
                      'change': {
                        'x': change_position_x,
                        'z': change_position_z,
                      },
                      'target': entity,
                    });
                    if(change){
                        change_position_x = change.x;
                        change_position_z = change.z;
                    }
                }
            }
        }

        if(level <= -1
          && character.path_id.length === 0){
            character.change_position_x = 0;
            character.change_position_y = 0;
            character.change_position_z = 0;
            continue;
        }

        if(character.jump_allow){
            character.change_position_x -= change_position_x;
            character.change_position_z -= change_position_z;
        }

        if(webgl_properties.y_min !== false
          && character.position_y < webgl_properties.y_min){
            webgl_character_die(character.id);

            if(character.lives === 0){
                character.gravity = 0;

                const axes = 'xyz';
                for(const axis of axes){
                    character['change_rotate_' + axis] = 0;
                    character['change_position_' + axis] = 0;
                }
            }
        }
    }

    const character = webgl_characters[webgl_character_id];
    const radians_x = math_degrees_to_radians(character.camera_rotate_x);
    const radians_y = math_degrees_to_radians(character.camera_rotate_y);
    if(character.camera_lock){
        if(character.camera_zoom > 0){
            const zoom_cos_x = character.camera_zoom * Math.cos(radians_x);

            character.camera_x = character.position_x + Math.sin(-radians_y) * zoom_cos_x;
            character.camera_y = character.position_y + Math.sin(radians_x) * character.camera_zoom;
            character.camera_z = character.position_z + Math.cos(radians_y) * zoom_cos_x;

        }else{
            character.camera_x = character.position_x;
            character.camera_y = character.position_y;
            character.camera_z = character.position_z;
        }
    }

    math_matrix_identity(webgl_matrices.camera);
    math_matrix_rotate(
      webgl_matrices.camera,
      radians_x,
      radians_y,
      math_degrees_to_radians(character.camera_rotate_z)
    );
    math_matrix_translate(
      webgl_matrices.camera,
      character.camera_x,
      character.camera_y,
      character.camera_z
    );

    if(webgl_properties.picking === 2){
        webgl_pick_entity(true);
    }

    const uniforms = webgl_shaders.default.uniforms;
    webgl.uniform1i(
      uniforms.light_count,
      webgl_shader_light_range.length
    );
    if(!webgl_shader_light_range.length){
        return;
    }
    while(webgl_shader_light_color.length < 48){
        webgl_shader_light_color.push(0);
    }
    while(webgl_shader_light_position.length < 48){
        webgl_shader_light_position.push(0);
    }
    while(webgl_shader_light_range.length < 16){
        webgl_shader_light_range.push(0);
    }
    webgl.uniform3fv(
      uniforms.light_color,
      webgl_shader_light_color
    );
    webgl.uniform3fv(
      uniforms.light_position,
      webgl_shader_light_position
    );
    webgl.uniform1fv(
      uniforms.light_range,
      webgl_shader_light_range
    );
}

function webgl_logic_entity(entity){
    const target = globalThis[entity.attach_type][entity.attach_to];

    if(entity_groups.skybox[entity.id]){
        entity.position_x = target.camera_x;
        entity.position_y = target.camera_y;
        entity.position_z = target.camera_z;

    }else{
        entity.position_x = target.position_x;
        entity.position_y = target.position_y;
        entity.position_z = target.position_z;
    }

    if(entity.event_range){
        const event_position = webgl_get_position(entity);

        if(core_type(entity.event_range) === 'array'){
            for(const character in webgl_characters){
                if(character === entity.attach_to){
                    continue;
                }

                if(math_cuboid_overlap({
                    'depth0': entity.event_range[2],
                    'depth1': entity.event_range[2],
                    'height0': entity.event_range[1],
                    'height1': entity.event_range[1],
                    'width0': entity.event_range[0],
                    'width1': entity.event_range[0],
                    'x0': webgl_characters[character].position_x,
                    'y0': webgl_characters[character].position_y,
                    'z0': webgl_characters[character].position_z,
                    'x1': event_position.x,
                    'y1': event_position.y,
                    'z1': event_position.z,
                  })){
                    webgl_event({
                      'parent': entity,
                      'target': webgl_characters[character],
                    });
                    if(!entity_entities[entity.id]){
                        return;
                    }
                }
            }

        }else{
            for(const character in webgl_characters){
                if(character === entity.attach_to){
                    continue;
                }

                if(math_distance({
                    'x0': webgl_characters[character].position_x,
                    'y0': webgl_characters[character].position_y,
                    'z0': webgl_characters[character].position_z,
                    'x1': event_position.x,
                    'y1': event_position.y,
                    'z1': event_position.z,
                  }) < entity.event_range){
                    webgl_event({
                      'parent': entity,
                      'target': webgl_characters[character],
                    });
                    if(!entity_entities[entity.id]){
                        return;
                    }
                }
            }
        }
    }

    const draw_range = entity.draw_range || webgl_properties.draw_range;
    if(draw_range){
        const character = webgl_characters[webgl_character_id];
        const position = webgl_get_position(entity);
        entity.visible = math_distance({
            'x0': character.camera_x,
            'y0': character.camera_y,
            'z0': character.camera_z,
            'x1': position.x,
            'y1': position.y,
            'z1': position.z,
          }) <= draw_range;

    }else{
        entity.visible = true;
    }

    const old_rotate_x = entity.rotate_x;
    const old_rotate_y = entity.rotate_y;
    const old_rotate_z = entity.rotate_z;
    const axes = 'xyz';
    for(const axis of axes){
        const rotate = 'rotate_' + axis;
        const rotation = entity['change_' + rotate];
        if(rotation === 0){
            continue;
        }

        entity[rotate] += rotation;
    }
    if(entity.billboard){
        webgl_billboard(entity.id);
    }
    if(entity.rotate_x !== old_rotate_x
      || entity.rotate_y !== old_rotate_y
      || entity.rotate_z !== old_rotate_z){
        webgl_entity_normals(entity);
    }

    if(entity.light_range > 0){
        webgl_shader_light_color.push(...entity.light_color);
        webgl_shader_light_position.push(
          entity.position_x,
          entity.position_y,
          entity.position_z
        );
        webgl_shader_light_range.push(entity.light_range);
    }
    if(entity.particle
      && !webgl_properties.paused){
        webgl_logic_particle(entity);
    }

    Object.assign(
      webgl_matrices[entity.id],
      webgl_matrices.camera
    );
    math_matrix_translate(
      webgl_matrices[entity.id],
      -entity.position_x,
      -entity.position_y,
      -entity.position_z
    );
    if(entity_groups.skybox[entity.id] !== true){
        const target = globalThis[entity.attach_type][entity.attach_to];
        math_matrix_rotate(
          webgl_matrices[entity.id],
          math_degrees_to_radians(target.rotate_x),
          math_degrees_to_radians(-target.rotate_y),
          math_degrees_to_radians(target.rotate_z)
        );
    }
    math_matrix_translate(
      webgl_matrices[entity.id],
      -entity.attach_x,
      -entity.attach_y,
      -entity.attach_z
    );
    math_matrix_rotate(
      webgl_matrices[entity.id],
      math_degrees_to_radians(entity.rotate_x),
      math_degrees_to_radians(entity.rotate_y),
      math_degrees_to_radians(entity.rotate_z)
    );
}

function webgl_logic_particle(entity){
    const particle = webgl_particles[entity.particle];
    const repeat = entity.vertices_length * 3;

    if(particle.randomize){
        for(let vertex = 0; vertex < repeat; vertex += 3){
            const y_vertex = entity.vertices[vertex + 1] + particle.speed_y;
            if(y_vertex < particle.y_min
              || y_vertex > particle.y_max){
                entity.vertices[vertex] = particle.x_min
                  + Math.random() * (particle.x_max - particle.x_min);
                entity.vertices[vertex + 2] = particle.z_min
                  + Math.random() * (particle.z_max - particle.z_min);
            }
        }
    }

    for(let vertex = 0; vertex < repeat; vertex += 3){
        entity.vertices[vertex] = math_clamp({
          'max': particle.x_max,
          'min': particle.x_min,
          'value': entity.vertices[vertex] + particle.speed_x,
          'wrap': true,
        });
        entity.vertices[vertex + 1] = math_clamp({
          'max': particle.y_max,
          'min': particle.y_min,
          'value': entity.vertices[vertex + 1] + particle.speed_y,
          'wrap': true,
        });
        entity.vertices[vertex + 2] = math_clamp({
          'max': particle.z_max,
          'min': particle.z_min,
          'value': entity.vertices[vertex + 2] + particle.speed_z,
          'wrap': true,
        });
    }

    webgl.bindVertexArray(entity.vao);
    webgl_buffer_set({
      'attribute': webgl_shaders.default.attributes.vertexPosition,
      'data': entity.vertices,
      'size': 3,
    });
}

// Required args: id, model
function webgl_model_create(args){
    const character = webgl_characters[args.id];
    const xz = character.collide_xz * 2;

    webgl_primitive_cuboid({
      'all': {
        'collision': false,
        'texture': 'grid.png',
      },
      'character': args.id,
      'prefix': args.id,
      'position_y': (character.collide_top - character.collide_bottom) / 2,
      'size_x': xz,
      'size_y': character.collide_bottom + character.collide_top,
      'size_z': xz,
      ...args.model,
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

    if(args.target){
        args.move.position_x = args.target.position_x;
        args.move.position_y = args.target.position_y;
        args.move.position_z = args.target.position_z;
        return;
    }

    args.move.position_x = args.x;
    args.move.position_y = args.y;
    args.move.position_z = args.z;
}

function webgl_particle_create(particle){
    webgl_particles[particle.id] = {
      ...core_args({
        'args': particle,
        'defaults': {
          'randomize': true,
          'speed_x': 0,
          'speed_y': 0,
          'speed_z': 0,
          'x_max': 100,
          'x_min': -100,
          'y_max': 100,
          'y_min': -100,
          'z_max': 100,
          'z_min': -100,
        },
      }),
    };
}

function webgl_path_move(character){
    if(!webgl_paths[character.path_id]){
        return;
    }

    const path = globalThis.structuredClone(webgl_paths[character.path_id]);
    const point = core_args({
      'args': path.points[character.path_point],
      'defaults': {
        'distance': 0,
        'position_x': character.position_x,
        'position_y': character.position_y,
        'position_z': character.position_z,
        'rotate_x': false,
        'rotate_y': false,
        'rotate_z': false,
      },
    });
    const distance = math_distance({
      'x0': character.position_x,
      'y0': character.position_y,
      'z0': character.position_z,
      'x1': point.position_x,
      'y1': point.position_y,
      'z1': point.position_z,
    });
    const speed = point.speed || path.speed || character.speed;

    if(distance - speed < point.distance){
        if(point.distance === 0){
            character.position_x = point.position_x;
            character.position_y = point.position_y;
            character.position_z = point.position_z;
        }
        webgl_camera_rotate({
          'character': character.id,
          'set': true,
          'x': point.rotate_x,
          'y': point.rotate_y,
          'z': point.rotate_z,
        });
        if(point.event_todo !== void 0){
            webgl_event({
              'parent': webgl_paths[character.path_id].points[character.path_point],
              'target': character,
            });
        }

        const path_end = character.path_end === ''
          ? path.end
          : character.path_end;
        if(character.path_direction > 0){
            if(character.path_point >= path.points.length - 1){
                if(path_end === 'loop'){
                    character.path_point = 0;

                }else if(path_end === 'reverse'){
                    character.path_direction = -1;
                    character.path_point -= 1;

                }else if(path_end === 'warp'){
                    character.path_point = 1;
                    const warp = core_args({
                      'args': path.points[0],
                      'defaults': {
                        'position_x': character.position_x,
                        'position_y': character.position_y,
                        'position_z': character.position_z,
                      },
                    });
                    character.position_x = warp.position_x;
                    character.position_y = warp.position_y;
                    character.position_z = warp.position_z;

                }else{
                    character.path_id = '';
                    character.path_point = 0;
                    if(character.level < -1){
                        character.change_position_x = 0;
                        character.change_position_y = 0;
                        character.change_position_z = 0;
                    }
                }

            }else{
                character.path_point += 1;
                character.change_position_x = 0;
                character.change_position_y = 0;
                character.change_position_z = 0;
            }

        }else if(character.path_point === 0){
            if(path_end === 'loop'){
                character.path_point = path.points.length - 1;

            }else if(path_end === 'reverse'){
                character.path_direction = 1;
                character.path_point = 1;

            }else if(path_end === 'warp'){
                const last = path.points.length - 1;
                character.path_point = last - 1;
                const warp = core_args({
                  'args': path.points[last],
                  'defaults': {
                    'position_x': character.position_x,
                    'position_y': character.position_y,
                    'position_z': character.position_z,
                  },
                });
                character.position_x = warp.position_x;
                character.position_y = warp.position_y;
                character.position_z = warp.position_z;

            }else{
                character.path_id = '';
                character.path_point = 0;
                if(character.level < -1){
                    character.change_position_x = 0;
                    character.change_position_y = 0;
                    character.change_position_z = 0;
                }
            }

        }else{
            character.path_point -= 1;
            character.change_position_x = 0;
            character.change_position_y = 0;
            character.change_position_z = 0;
        }

        return;
    }

    const angle_xz = Math.atan2(
      point.position_z - character.position_z,
      point.position_x - character.position_x
    );
    const angle_y = Math.asin(Math.abs(character.position_y - point.position_y) / distance);
    const cos_y_speed = Math.cos(angle_y) * speed;
    character.change_position_x = core_round({
      'number': Math.cos(angle_xz) * cos_y_speed,
    });
    let change_position_y = Math.sin(angle_y) * speed;
    if(character.position_y > point.position_y){
        change_position_y *= -1;
    }
    character.change_position_y = core_round({
      'number': change_position_y,
    });
    character.change_position_z = core_round({
      'number': Math.sin(angle_xz) * cos_y_speed,
    });
}

function webgl_path_use(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': webgl_character_id,
        'path_id': '',
        'use_path_properties': true,
      },
    });

    const path = webgl_paths[args.path_id];
    if(!path){
        return;
    }

    const character = webgl_characters[args.id];
    character.path_id = args.path_id;

    if(args.use_path_properties){
        character.path_direction = path.direction || 1;
        character.path_end = path.end || '';
        character.path_point = path.point || 0;
    }
}

// Required args: x, y
function webgl_pick_color(args){
    const pixelarray = new Uint8Array(3);
    webgl.readPixels(
      args.x,
      webgl.drawingBufferHeight - args.y,
      1,
      1,
      webgl.RGB,
      webgl.UNSIGNED_BYTE,
      pixelarray
    );
    return pixelarray;
}

function webgl_pick_entity(cursor){
    if(core_menu_open
      || webgl_properties.picking < 1){
        return;
    }

    const character = webgl_characters[webgl_character_id];
    if(character.life <= 0){
        return;
    }

    const level = webgl_character_level(character);
    if(level < -1 || (level >= 0 && webgl_properties.paused)){
        return;
    }

    let picked = false;
    const x = webgl_properties.pointerlock ? Math.floor(globalThis.innerWidth / 2) : core_pointer.x;
    const y = webgl_properties.pointerlock ? Math.floor(globalThis.innerHeight / 2) : core_pointer.y;

    webgl_shader_use('picking');
    const color = webgl_scissor({
      'todo': function(){
          webgl_draw_picking();
          return webgl_pick_color({
            'x': x,
            'y': y,
          });
      },
      'x': x,
      'y': y
    });
    webgl_shader_use('default');

    if(color[0] !== 0
      || color[1] !== 0
      || color[2] !== 0){
        const color_blue = color[2] === 0
          ? 0
          : core_round({
              'decimals': 3,
              'number': color[2] / 255,
            });
        const color_green = color[1] === 0
          ? 0
          : core_round({
              'decimals': 3,
              'number': color[1] / 255,
            });
        const color_red = color[0] === 0
          ? 0
          : core_round({
              'decimals': 3,
              'number': color[0] / 255,
            });

        for(const id in entity_entities){
            const entity = entity_entities[id];

            if(entity.picking
              && color_blue === entity.picking[2]
              && color_green === entity.picking[1]
              && color_red === entity.picking[0]){
                if(entity.picking_range > 0){
                    const position = webgl_get_position(entity);
                    const distance = math_distance({
                      'x0': character.position_x,
                      'y0': character.position_y,
                      'z0': character.position_z,
                      'x1': position.x,
                      'y1': position.y,
                      'z1': position.z,
                    });
                    if(distance > entity.picking_range){
                        break;
                    }
                }

                picked = entity;
                break;
            }
        }
    }

    if(picked){
        if(picked.picking_xyz){
            const rgb = webgl_draw_picked({
              'picked': picked,
              'x': x,
              'y': y,
            });

            const position = webgl_get_position(picked);
            webgl_picked_x = position.x + (rgb[0] / 255 - .5) * (picked.vertices[0] - picked.vertices[3]);
            webgl_picked_y = position.y + (rgb[1] / 255 - .5) * (picked.vertices[1] - picked.vertices[7]);
            webgl_picked_z = position.z + (rgb[2] / 255 - .5) * (picked.vertices[8] - picked.vertices[2]);
        }

        if(cursor === true){
            webgl.canvas.style.cursor = 'pointer';
            if(core_elements.reticle){
                core_elements.reticle.style.height = Math.ceil(core_elements.reticle.dataset.height * 1.5) + 'px';
                core_elements.reticle.style.width = Math.ceil(core_elements.reticle.dataset.width * 1.5) + 'px';
            }

        }else{
            webgl_event({
              'parent': picked,
              'target': webgl_characters[webgl_character_id],
            });
        }

    }else if(cursor === true){
        webgl.canvas.style.cursor = 'auto';
        if(core_elements.reticle){
            core_elements.reticle.style.height = core_elements.reticle.dataset.height + 'px';
            core_elements.reticle.style.width = core_elements.reticle.dataset.width + 'px';
        }
    }

    const clear_color = webgl_properties.clear_color;
    webgl.clearColor(
      clear_color[0],
      clear_color[1],
      clear_color[2],
      1
    );
    webgl_draw();

    return picked;
}

function webgl_prefab_args(args){
    const prefab_args = globalThis.structuredClone(args);
    for(const arg in prefab_args){
        if(entity_info.opaque.default[arg] === void 0){
            delete prefab_args[arg];
        }
    }
    return core_args({
      'args': prefab_args,
      'defaults': entity_info.opaque.default,
    });
}

// Required args: prefab, prefix
function webgl_prefab_remake(args){
    for(const entity in entity_entities){
        if(entity_entities[entity].id.startsWith(args.prefix)){
            entity_remove({
              'entities': [
                entity.id,
              ],
            });
        }
    }

    globalThis[args.prefab.type](args.prefab.properties);
}

// Required args: type
function webgl_prefab_repeat(args){
    args = core_args({
      'args': args,
      'defaults': {
        'characters': false,
        'count': 1,
        'prefix': entity_id_count,
        'properties': {},
        'x_max': 0,
        'x_min': 0,
        'y_max': 0,
        'y_min': 0,
        'z_max': 0,
        'z_min': 0,
      },
    });

    if(args.characters){
        for(let i = 0; i < args.count; i++){
            const prefix = args.prefix + '_' + i;
            webgl_character_init({
              ...args.characters,
              'id': prefix,
              'spawn': {
                'position_x': Math.random() * (args.x_max - args.x_min) + args.x_min,
                'position_y': Math.random() * (args.y_max - args.y_min) + args.y_min,
                'position_z': Math.random() * (args.z_max - args.z_min) + args.z_min,
                ...args.characters.spawn,
              },
            });

            args.properties.character = prefix;
            args.properties.prefix = prefix;

            globalThis[args.type]?.(args.properties);
        }
        return;
    }

    for(let i = 0; i < args.count; i++){
        args.properties.prefix = args.prefix + '_' + i;
        args.properties.position_x = Math.random() * (args.x_max - args.x_min) + args.x_min;
        args.properties.position_y = Math.random() * (args.y_max - args.y_min) + args.y_min;
        args.properties.position_z = Math.random() * (args.z_max - args.z_min) + args.z_min;

        globalThis[args.type](args.properties);
    }
}

function webgl_primitive_cuboid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'all': {},
        'back': {},
        'bottom': {},
        'character': webgl_character_base,
        'front': {},
        'groups': [],
        'left': {},
        'prefix': entity_id_count,
        'right': {},
        'size_x': 1,
        'size_y': 1,
        'size_z': 1,
        'top': {},
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const half_size_x = args.size_x / 2;
    const half_size_y = args.size_y / 2;
    const half_size_z = args.size_z / 2;
    const vertices_size_x = Math.abs(half_size_x);
    const vertices_size_y = Math.abs(half_size_y);
    const vertices_size_z = Math.abs(half_size_z);

    if(args.top.exclude !== true){
        const properties = {
          ...prefab_args,
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y + half_size_y,
          'attach_z': prefab_args.position_z,
          'id': args.prefix + '_top',
          'vertex_colors': webgl_vertexcolorarray({
            'colors': args.top.vertex_colors,
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
          args.all,
          args.top
        );
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }

    if(args.bottom.exclude !== true){
        const properties = {
          ...prefab_args,
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y - half_size_y,
          'attach_z': prefab_args.position_z,
          'id': args.prefix + '_bottom',
          'rotate_x': 180,
          'vertex_colors': webgl_vertexcolorarray({
            'colors': args.bottom.vertex_colors,
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
          args.all,
          args.bottom
        );
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }

    if(args.back.exclude !== true){
        const properties = {
          ...prefab_args,
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z + half_size_z,
          'id': args.prefix + '_back',
          'rotate_x': 90,
          'vertex_colors': webgl_vertexcolorarray({
            'colors': args.back.vertex_colors,
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
          args.all,
          args.back
        );
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }

    if(args.front.exclude !== true){
        const properties = {
          ...prefab_args,
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z - half_size_z,
          'id': args.prefix + '_front',
          'rotate_x': 270,
          'vertex_colors': webgl_vertexcolorarray({
            'colors': args.front.vertex_colors,
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
          args.all,
          args.front
        );
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }

    if(args.left.exclude !== true){
        const properties = {
          ...prefab_args,
          'attach_x': prefab_args.position_x - half_size_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'id': args.prefix + '_left',
          'rotate_z': 90,
          'vertex_colors': webgl_vertexcolorarray({
            'colors': args.left.vertex_colors,
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
          args.all,
          args.left
        );
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }

    if(args.right.exclude !== true){
        const properties = {
          ...prefab_args,
          'attach_x': prefab_args.position_x + half_size_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'id': args.prefix + '_right',
          'rotate_z': 270,
          'vertex_colors': webgl_vertexcolorarray({
            'colors': args.right.vertex_colors,
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
          args.all,
          args.right
        );
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }
}

function webgl_primitive_ellipsoid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'color0': [],
        'color1': [],
        'groups': [],
        'prefix': entity_id_count,
        'radius_x': 5,
        'radius_y': 5,
        'radius_z': 5,
        'slices_latitude': 10,
        'slices_longitude': 10,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    if(args.color0.length === 0){
        args.color0 = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }
    if(args.color1.length === 0){
        args.color1 = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }

    const latitude_angles = math_degrees_to_radians(360 / args.slices_latitude);
    const longitude_angles = math_degrees_to_radians(180 / args.slices_longitude);

    const properties = {
      ...prefab_args,
      'attach_x': prefab_args.position_x,
      'attach_y': prefab_args.position_y,
      'attach_z': prefab_args.position_z,
      'collision': false,
      'draw_mode': 'TRIANGLE_STRIP',
      'id': args.prefix,
      'vertex_colors': [],
      'vertices': [],
    };
    for(let longitude = 0; longitude < args.slices_longitude; longitude++){
        if(longitude === args.slices_longitude / 2){
            [args.color0, args.color1] = [args.color1, args.color0];
        }

        const longitude_bottom = -1.5707963267948966 + longitude * longitude_angles;
        const longitude_top = -1.5707963267948966 + (longitude + 1) * longitude_angles;
        const cos_bottom = Math.cos(longitude_bottom);
        const cos_bottom_x = args.radius_x * cos_bottom;
        const cos_bottom_z = args.radius_z * cos_bottom;
        const cos_top = Math.cos(longitude_top);
        const cos_top_x = args.radius_x * cos_top;
        const cos_top_z = args.radius_z * cos_top;
        const sin_bottom = args.radius_y * Math.sin(longitude_bottom);
        const sin_top = args.radius_y * Math.sin(longitude_top);

        for(let latitude = 0; latitude <= args.slices_latitude; latitude++){
            const rotation = latitude * latitude_angles;
            const cos_rotation = Math.cos(rotation);
            const sin_rotation = Math.sin(rotation);

            properties.vertex_colors.push(
              ...args.color0,
              ...args.color1
            );
            properties.vertices.push(
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
      'character': args.character,
      'entities': [
        properties,
      ],
      'groups': args.groups,
    });
}

function webgl_primitive_frustum(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bottom': true,
        'character': webgl_character_base,
        'color_bottom': [],
        'color_top': [],
        'groups': [],
        'length': 2,
        'middle': true,
        'points': 8,
        'prefix': entity_id_count,
        'size_bottom': 2,
        'size_top': 1,
        'top': true,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    if(args.color_bottom.length === 0){
        args.color_bottom = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }
    if(args.color_top.length === 0){
        args.color_top = webgl_vertexcolorarray({
          'vertexcount': 1,
        });
    }

    const rotation = math_degrees_to_radians(360 / args.points);
    const properties = {
      ...prefab_args,
      'attach_x': prefab_args.position_x,
      'attach_y': prefab_args.position_y,
      'attach_z': prefab_args.position_z,
      'collision': false,
      'draw_mode': 'TRIANGLE_FAN',
    };

    if(args.points === 1
      || (args.size_bottom === 0 && args.size_top === 0)){
        properties.draw_mode = 'LINES';
        properties.id = args.prefix;
        properties.vertex_colors = [
          args.color_top[0], args.color_top[1], args.color_top[2], args.color_top[3],
          args.color_bottom[0], args.color_bottom[1], args.color_bottom[2], args.color_bottom[3],
        ];
        properties.vertices = [
          0, args.length, 0,
          0, 0, 0,
        ];

        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
        return;
    }

    if(args.bottom){
        properties.id = args.prefix + '_bottom';
        properties.vertex_colors = [
          args.color_bottom[0], args.color_bottom[1], args.color_bottom[2], args.color_bottom[3],
        ];
        properties.vertices = [
          0, 0, 0,
        ];
        for(let i = 0; i <= args.points; i++){
            const point_rotation = -i * rotation;
            const cos_rotation = Math.cos(point_rotation);
            const sin_rotation = Math.sin(point_rotation);

            if(args.size_bottom === 0){
                properties.vertex_colors.push(...args.color_top);
                properties.vertices.push(
                  args.size_top * sin_rotation,
                  args.length,
                  args.size_top * cos_rotation
                );

            }else{
                properties.vertex_colors.push(...args.color_bottom);
                properties.vertices.push(
                  args.size_bottom * sin_rotation,
                  0,
                  args.size_bottom * cos_rotation
                );
            }
        }
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }

    if(args.top){
        properties.id = args.prefix + '_top';
        properties.vertex_colors = [
          args.color_top[0], args.color_top[1], args.color_top[2], args.color_top[3],
        ];
        properties.vertices = [
          0, args.length, 0,
        ];
        for(let i = 0; i <= args.points; i++){
            const point_rotation = i * rotation;
            const cos_rotation = Math.cos(point_rotation);
            const sin_rotation = Math.sin(point_rotation);

            if(args.size_top === 0){
                properties.vertex_colors.push(...args.color_bottom);
                properties.vertices.push(
                  args.size_bottom * sin_rotation,
                  0,
                  args.size_bottom * cos_rotation
                );

            }else{
                properties.vertex_colors.push(...args.color_top);
                properties.vertices.push(
                  args.size_top * sin_rotation,
                  args.length,
                  args.size_top * cos_rotation
                );
            }
        }
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }

    if(args.middle
      && args.size_bottom !== 0
      && args.size_top !== 0){
        properties.draw_mode = 'TRIANGLE_STRIP';
        properties.id = args.prefix + '_middle';
        properties.vertex_colors = [
          args.color_top[0], args.color_top[1], args.color_top[2], args.color_top[3],
        ];
        properties.vertices = [
          args.size_top * Math.sin(rotation),
          args.length,
          args.size_top * Math.cos(rotation),
        ];
        for(let i = 0; i <= args.points; i++){
            const point_rotation = i * rotation;
            const next_rotation = (i + 1) * rotation;

            properties.vertex_colors.push(
              ...args.color_bottom,
              ...args.color_top
            );
            properties.vertices.push(
              args.size_bottom * Math.sin(point_rotation),
              0,
              args.size_bottom * Math.cos(point_rotation),
              args.size_top * Math.sin(next_rotation),
              args.length,
              args.size_top * Math.cos(next_rotation)
            );
        }
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });
    }
}

// Required args: id
function webgl_primitive_particle(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'entities': [],
        'groups': [],
        'particle': {},
        'prefix': entity_id_count,
      },
    });

    const particle = {
      'id': args.id,
      ...args.particle,
    };
    webgl_particle_create(particle);

    for(const entity of args.entities){
        const vertices = [];
        const vertexcount = entity.vertex_repeat;
        delete entity.vertex_repeat;
        for(let vertex = 0; vertex <= vertexcount; vertex++){
            vertices.push(
              particle.x_min + Math.random() * (particle.x_max - particle.x_min),
              particle.y_min + Math.random() * (particle.y_max - particle.y_min),
              particle.z_min + Math.random() * (particle.z_max - particle.z_min)
            );
        }

        webgl_entity_create({
          'character': args.character,
          'entities': [
            {
              ...webgl_prefab_args(args),
              ...entity,
              'collision': false,
              'particle': args.id,
              'vertex_colors': entity.vertex_colors || webgl_vertexcolorarray({
                'vertexcount': 1,
              }),
              'vertices': vertices,
            },
          ],
          'groups': args.groups,
        });
    }
}

// Required args: character
function webgl_primitive_projectile(args){
    args = core_args({
      'args': args,
      'defaults': {
        'groups': [],
        'prefix': entity_id_count,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const character = webgl_characters[args.character];
    const properties = {
      'collides': true,
      'gravity': 1,
      'id': args.prefix,
      'level': 0,
      'position_x': character.position_x,
      'position_y': character.position_y,
      'position_z': character.position_z,
      'rotate_y': character.rotate_y,
      'spawn': false,
      'entities': [
        {
          'id': args.prefix,
          'billboard': true,
          'collision': false,
          'vertices': [
            1, 1, 0,
            -1, 1, 0,
            -1, -1, 0,
            1, -1, 0,
          ],
        },
      ],
    };
    webgl_character_init(properties);
}

function webgl_primitive_stars(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'color': [1, 1, 1, 1],
        'groups': [],
        'height_limit': 1,
        'point_size': 500,
        'prefix': entity_id_count,
        'radius': 250,
        'range': 100,
        'stars': 100,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const star_colors = [];
    const star_points = [];
    for(let i = 0; i < args.stars; i++){
        const theta = Math.random() * 6.283185307179586;
        const phi = Math.acos(1 - 2 * Math.random());
        const sin_phi = Math.sin(phi);
        const radius = args.radius - Math.random() * args.range;
        const star_y = radius * sin_phi * Math.sin(theta);
        if(star_y < radius - radius * 2 * args.height_limit){
            continue;
        }
        star_points.push(
          radius * sin_phi * Math.cos(theta),
          star_y,
          radius * Math.cos(phi),
        );
        star_colors.push(...args.color);
    }
    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'collision': false,
          'draw_mode': 'POINTS',
          'id': args.prefix,
          'point_size': args.point_size,
          'vertex_colors': star_colors,
          'vertices': star_points,
        },
      ],
      'groups': args.groups,
    });
}

function webgl_primitive_terrain(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'colors': [],
        'groups': [],
        'height_random': 10,
        'heights': [],
        'prefix': entity_id_count,
        'tiles_x': 10,
        'tiles_x_size': 10,
        'tiles_z': 10,
        'tiles_z_size': 10,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const color_count = args.tiles_x * (args.tiles_z + 1) * 4 + 1;
    while(args.colors.length < color_count){
        args.colors.push(...webgl_vertexcolorarray({
          'vertexcount': 1,
        }));
    }
    const height_count = args.tiles_x * args.tiles_z + args.tiles_x + 1;
    while(args.heights.length < height_count){
        args.heights.push(Math.random() * args.height_random);
    }

    let x_direction = -1;
    const points = [];
    const point_colors = [];
    const z_start = -args.tiles_z_size * (args.tiles_z + 2) / 2;

    for(let tile_z = 0; tile_z <= args.tiles_z; tile_z++){
        const z_tile = tile_z * args.tiles_z * 4;
        const x_start = args.tiles_x_size * args.tiles_x * x_direction / 2;
        const z_offset = z_start + tile_z * args.tiles_z_size;
        point_colors.push(
          args.colors[z_tile], args.colors[z_tile + 1], args.colors[z_tile + 2], args.colors[z_tile + 3],
          args.colors[z_tile], args.colors[z_tile + 1], args.colors[z_tile + 2], args.colors[z_tile + 3],
        );

        for(let tile_x = 0; tile_x <= args.tiles_x; tile_x++){
            const x_tile = z_tile + tile_x * 4;
            const x_offset = x_start + args.tiles_x_size * tile_x * -x_direction;
            if(x_direction === 1){
                points.push(
                  x_offset, args.heights[tile_z * args.tiles_z + tile_x], z_offset + args.tiles_z_size,
                  x_offset, args.heights[(tile_z - 1) * args.tiles_z + tile_x], z_offset,
                );
            }else{
                points.push(
                  x_offset, args.heights[tile_z * args.tiles_z - tile_x], z_offset,
                  x_offset, args.heights[(tile_z + 1) * args.tiles_z - tile_x], z_offset + args.tiles_z_size,
                );
            }
            point_colors.push(
              args.colors[x_tile], args.colors[x_tile + 1], args.colors[x_tile + 2], args.colors[x_tile + 3],
              args.colors[x_tile], args.colors[x_tile + 1], args.colors[x_tile + 2], args.colors[x_tile + 3],
            );
        }

        x_direction *= -1;
    }

    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'collision': false,
          'draw_mode': 'TRIANGLE_STRIP',
          'id': args.prefix,
          'vertex_colors': point_colors,
          'vertices': points,
        },
      ],
      'groups': args.groups,
    });
}

// Required args: projectile
function webgl_projectile(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    if(core_type(args.projectile) === 'string'){
        const character = webgl_characters[args.character];
        const projectile = webgl_characters[args.projectile];

        webgl_move_to({
          'move': projectile,
          'target': character,
        });
        projectile.rotate_y = character.rotate_y;

    }else{
        webgl_primitive_projectile({
          'character': args.character,
        });
    }
}

function webgl_random_vertex(entity){
    const position = webgl_get_position(entity);
    const vertex = core_random_integer(entity.vertices_length) * 3;
    return {
      'x': position.x + entity.vertices[vertex],
      'y': position.y + entity.vertices[vertex + 1],
      'z': position.z + entity.vertices[vertex + 2],
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

    webgl_matrices.perspective[0] = webgl.drawingBufferHeight / webgl.drawingBufferWidth;
    webgl.uniformMatrix4fv(
      webgl_shaders.default.uniforms.perspective,
      false,
      webgl_matrices.perspective
    );
    webgl_framebuffer_resize();

    if(core_menu_open
      && webgl !== 0){
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
      args.x,
      webgl.drawingBufferHeight - args.y,
      args.width,
      args.height
    );
    const result = args.todo();
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
      args.type,
      args.quality
    );
}

// Required args: attributes, fragment, id, uniforms, vertex
function webgl_shader(args){
    const fragment = webgl.createShader(webgl.FRAGMENT_SHADER);
    webgl.shaderSource(
      fragment,
      args.fragment
    );
    webgl.compileShader(fragment);
    const vertex = webgl.createShader(webgl.VERTEX_SHADER);
    webgl.shaderSource(
      vertex,
      args.vertex,
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

    webgl_shaders[args.id] = {
      'attributes': {},
      'program': program,
      'uniforms': {},
    };

    const attributes = webgl_shaders[args.id].attributes;
    for(const attribute of args.attributes){
        attributes[attribute] = webgl.getAttribLocation(
          program,
          attribute
        );
    }
    const uniforms = webgl_shaders[args.id].uniforms;
    for(const uniform of args.uniforms){
        uniforms[uniform] = webgl.getUniformLocation(
          program,
          uniform
        );
    }
}

function webgl_shader_use(shader){
    webgl_shader_id = shader;
    webgl.useProgram(webgl_shaders[shader].program);
}

// Required args: stat, target
function webgl_stat_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'has': true,
        'round': false,
        'set': false,
        'value': 1,
      },
    });

    const target = args.target;
    if(args.stat === 'level_xp' || args.stat === 'life' || args.stat === 'life_max'){
        if(webgl_character_level(target) < 0){
            return;
        }
    }

    if(args.stat.startsWith('rotate_')
      || args.stat.startsWith('camera_rotate_')){
        const rotate_args = {
          'camera': args.stat.startsWith('camera_rotate_'),
          'character': target.id,
          'pointer': false,
          'set': args.set,
        };
        rotate_args[args.stat.at(-1)] = args.value;
        webgl_camera_rotate(rotate_args);

    }else if(args.stat === 'vertex_colors'){
        target.vertex_colors = core_type(args.value) === 'array'
          ? args.value
          : webgl_vertexcolorarray();
        webgl.bindVertexArray(target.vao);
        webgl_buffer_set({
          'attribute': webgl_shaders.default.attributes.vertexColor,
          'data': webgl_vertexcolorarray({
            'colors': target.vertex_colors,
            'vertexcount': target.vertices_length,
          }),
          'size': 4,
        });

    }else{
        if(target[args.stat] === void 0){
            if(args.has){
                return;
            }

            target[args.stat] = 0;
        }

        if(args.set && target[args.stat] === args.value){
            return;
        }

        target[args.stat] = (args.set || core_type(args.value) !== 'number')
          ? args.value
          : (args.round === false
            ? target[args.stat] + args.value
            : core_round({
                'decimals': args.round,
                'number': target[args.stat] + args.value,
              }));

        if(args.stat === 'level_xp'){
            let levels = 0;
            while(target.level_xp >= Math.floor(target.level + 1) * 1e3){
                target.level_xp -= Math.floor(target.level + 1) * 1e3;
                target.level++;
                levels++;
            }
            if(levels){
                args.levels = levels;
                args.stat = 'level';
            }

        }else if((args.stat + '_max') in target){
            target[args.stat] = Math.min(
              target[args.stat],
              target[args.stat + '_max']
            );

        }else if(args.stat.endsWith('_max')){
            const stat = args.stat.substring(0, args.stat.length - 4);
            target[stat] = Math.min(
              target[stat],
              target[args.stat]
            );
        }

        if(target.life <= 0){
            target.life = 0;

            if(target.lives > 0){
                target.lives--;
            }

            if(target.lives !== 0){
                target.life = target.life_max;
                webgl_character_spawn(target.id);
            }
        }
    }

    globalThis.repo_stat_modify?.(args);
}

function webgl_texture_animate(id){
    const texture = webgl_textures[id];
    if(!texture.ready){
        return;
    }

    const image = core_images[texture.image];

    const width = image.width;
    let offset_x = texture.offset_x + texture.speed_x;
    if(offset_x < 0){
        offset_x = width;

    }else if(offset_x >= width){
        offset_x = 0;
    }
    texture.offset_x = offset_x;

    const height = image.height;
    let offset_y = texture.offset_y + texture.speed_y;
    if(offset_y < 0){
        offset_y = height;

    }else if(offset_y >= height){
        offset_y = 0;
    }
    texture.offset_y = offset_y;

    const canvas = core_elements['texture_' + id].getContext('2d');
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
      texture.gl
    );
    webgl.texImage2D(
      webgl.TEXTURE_2D,
      0,
      webgl.RGBA,
      webgl.RGBA,
      webgl.UNSIGNED_BYTE,
      core_elements['texture_' + id]
    );
    webgl.generateMipmap(webgl.TEXTURE_2D);
}

function webgl_texture_init(id){
    const split = id.split(',');
    const image = split[0];

    if(!webgl_textures[id]){
        webgl_textures[id] = {
          'gl': webgl.createTexture(),
        };
        if(split.length > 1){
            webgl_textures[id].ready = false;
        }
        core_image({
          'id': image,
          'src': webgl_uris[image] || webgl_uris[webgl_default_texture],
          'todo': function(){
              webgl_texture_init(id);
          },
        });
        return;
    }

    const texture = webgl_textures[id];

    if(split.length > 1){
        const texture_id = 'texture_' + id;
        core_html({
          'parent': core_html({
            'parent': core_elements.repo_ui,
            'properties': {
              'className': 'hidden',
              'id': 'webgl_animated_textures',
            },
            'type': 'div',
          }),
          'properties': {
            'height': core_images[image].height,
            'id': texture_id,
            'width': core_images[image].width,
          },
          'store': texture_id,
          'type': 'canvas',
        });
        texture.image = image;
        texture.offset_x = 0;
        texture.offset_y = 0;
        texture.speed_x = 0;
        texture.speed_y = 0;
        texture.ready = true;
    }

    webgl.bindTexture(
      webgl.TEXTURE_2D,
      texture.gl
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

    if(texture.ready === true){
        webgl_texture_animate(id);
        texture.speed_x = Number(split[1]);
        texture.speed_y = split.length > 2 ? Number(split[2]) : 0;
    }
}

// Required args: tiles
function webgl_tiles(args){
    args = core_args({
      'args': args,
      'defaults': {
        'order': false,
        'repeat': false,
        'tiles_max': 5,
        'tiles_min': 1,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const tiles = [];
    if(args.order){
        for(const tile in args.order){
            tiles.push(args.order[tile]);
        }

    }else if(args.repeat){
        let all_tiles = [];
        for(let repeat = 0; repeat < args.repeat; repeat++){
            all_tiles = [
              ...all_tiles,
              ...Array.from(Array(args.tiles.length).keys()),
            ];
        }

        const tile_count = args.tiles.length * args.repeat;
        for(let tile = 0; tile < tile_count; tile++){
            const random_tile = core_random_integer(all_tiles.length);

            tiles.push(all_tiles.splice(random_tile, 1)[0]);
        }

    }else{
        const tile_count = core_random_integer(args.tiles_max - args.tiles_min + 1) + args.tiles_min;
        for(let tile = 0; tile < tile_count; tile++){
            tiles.push(core_random_integer(args.tiles.length));
        }
    }

    let tile_offset_x = prefab_args.position_x;
    let tile_offset_y = prefab_args.position_y;
    let tile_offset_z = prefab_args.position_z;
    let tile_rotate_x = prefab_args.rotate_x;
    let tile_rotate_y = prefab_args.rotate_y;
    let tile_rotate_z = prefab_args.rotate_z;

    for(const tile in tiles){
        const prefix = args.prefix + '_' + tile + '_';

        for(const path in args.tiles[tiles[tile]].paths){
            const path_object = {
              ...args.tiles[tiles[tile]].paths[path],
              'points': [],
            };
            const points = args.tiles[tiles[tile]].paths[path].points;
            for(const point in points){
                const point_object = {};
                if(points[point].position_x !== void 0){
                    point_object.position_x = tile_offset_x + points[point].position_x;
                }
                if(points[point].position_y !== void 0){
                    point_object.position_y = tile_offset_y + points[point].position_y;
                }
                if(points[point].position_z !== void 0){
                    point_object.position_z = tile_offset_z + points[point].position_z;
                }
                path_object.points.push(point_object);
            }
            webgl_paths[prefix + path_object.id] = path_object;
        }

        for(const character in args.tiles[tiles[tile]].characters){
            const character_object = args.tiles[tiles[tile]].characters[character];
            const spawn = character_object.spawn || {};
            webgl_character_init({
              ...character_object,
              'id': prefix + character_object.id,
              'path_id': character_object.path_id !== ''
                ? prefix + character_object.path_id
                : '',
              'spawn': {
                'position_x': tile_offset_x + (character_object.position_x || 0),
                'position_y': tile_offset_y + (character_object.position_y || 0),
                'position_z': tile_offset_z + (character_object.position_z || 0),
                ...spawn,
              },
            });
        }

        const entities = args.tiles[tiles[tile]].entities;
        for(const entity in entities){
            webgl_entity_create({
              'character': args.character,
              'entities': [
                {
                  ...prefab_args,
                  ...entities[entity],
                  'attach_x': tile_offset_x + (entities[entity].attach_x || 0),
                  'attach_y': tile_offset_y + (entities[entity].attach_y || 0),
                  'attach_z': tile_offset_z + (entities[entity].attach_z || 0),
                  'id': prefix + entity,
                  'path_id': entities[entity].path_id !== ''
                    ? prefix + entities[entity].path_id
                    : '',
                },
              ],
              'groups': args.groups,
            });
        }

        const prefabs = args.tiles[tiles[tile]].prefabs;
        for(const prefab in prefabs){
            const attached = prefabs[prefab].properties.character !== void 0;

            globalThis[prefabs[prefab].type]({
              ...prefab_args,
              ...prefabs[prefab].properties,
              'character': attached
                ? prefix + prefabs[prefab].properties.character
                : args.character,
              'prefix': prefix + (prefabs[prefab].properties.prefix || entity_id_count),
              'position_x': (prefabs[prefab].properties.position_x || 0) + (attached
                ? 0
                : tile_offset_x),
              'position_y': (prefabs[prefab].properties.position_y || 0) + (attached
                ? 0
                : tile_offset_y),
              'position_z': (prefabs[prefab].properties.position_z || 0) + (attached
                ? 0
                : tile_offset_z),
            });
        }

        if(args.tiles[tiles[tile]].attach_x !== void 0){
            tile_offset_x += args.tiles[tiles[tile]].attach_x;
        }
        if(args.tiles[tiles[tile]].attach_y !== void 0){
            tile_offset_y += args.tiles[tiles[tile]].attach_y;
        }
        if(args.tiles[tiles[tile]].attach_z !== void 0){
            tile_offset_z += args.tiles[tiles[tile]].attach_z;
        }
        if(args.tiles[tiles[tile]].attach_rotate_x !== void 0){
            const max = tile_rotate_x > 180
              ? 360
              : 90;
            tile_rotate_x = math_clamp({
              'max': max,
              'min': max - 90,
              'value': tile_rotate_x + args.tiles[tiles[tile]].attach_rotate_x,
            });
        }
        if(args.tiles[tiles[tile]].attach_rotate_y !== void 0){
            tile_rotate_y = math_clamp({
              'max': 360,
              'min': 0,
              'value': tile_rotate_y + args.tiles[tiles[tile]].attach_rotate_y,
            });
        }
        if(args.tiles[tiles[tile]].attach_rotate_z !== void 0){
            tile_rotate_z = math_clamp({
              'max': 360,
              'min': 0,
              'value': tile_rotate_z + args.tiles[tiles[tile]].attach_rotate_z,
            });
        }
    }
}

function webgl_timer_add(args){
    args = core_args({
      'args': args,
      'defaults': {
        'active': true,
        'event_end': void 0,
        'event_repeat': void 0,
        'frames_max': 100,
        'frames_random': 0,
        'id': webgl_timer_count,
        'repeat': 0,
      },
    });

    let max = args.frames_max;
    if(args.frames_random){
        max += core_random_integer(args.frames_random);
    }
    webgl_timers[args.id] = {
      'frames': max,
      ...args,
    };
    webgl_timer_count++;
}

function webgl_timer_handle(timer){
    if(!timer.active){
        return;
    }

    timer.frames--;
    if(timer.frames > 0){
        return;
    }

    if(timer.repeat !== 0){
        if(timer.repeat > 0){
            timer.repeat--;
        }
        let max = timer.frames_max;
        if(timer.frames_random){
            max += core_random_integer(timer.frames_random);
        }
        timer.frames = max;

        if(timer.event_repeat){
            webgl_event({
              'parent': timer.event_repeat,
            });
        }

    }else{
        if(timer.event_end){
            webgl_event({
              'parent': timer.event_end,
            });
        }
        delete webgl_timers[timer.id];
    }
}

function webgl_timer_toggle(id){
    if(!webgl_timers[id]){
        return;
    }

    webgl_timers[id].active = !webgl_timers[id].active;
}

function webgl_uniform_update(){
    const uniforms = webgl_shaders.default.uniforms;
    webgl.uniform3fv(
      uniforms.ambient_color,
      webgl_properties.ambient_color
    );
    const clear_color = webgl_properties.clear_color;
    webgl.uniform3fv(
      uniforms.clear_color,
      clear_color
    );
    webgl.clearColor(
      clear_color[0],
      clear_color[1],
      clear_color[2],
      1
    );
    webgl.uniform1i(
      uniforms.directional,
      webgl_properties.directional_state
    );
    webgl.uniform3fv(
      uniforms.directional_color,
      webgl_properties.directional_color
    );
    webgl.uniform3fv(
      uniforms.directional_vector,
      webgl_properties.directional_vector
    );
    webgl.uniform1f(
      uniforms.fog_end,
      webgl_properties.fog_end
    );
    webgl.uniform1f(
      uniforms.fog_start,
      webgl_properties.fog_start
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

    const vehicle = webgl_characters[args.vehicle];
    if(vehicle?.vehicle_stats.lock === 3){
        return;
    }

    const current = webgl_characters[args.id].vehicle;
    if(current){
        if(webgl_characters[current].vehicle_stats.lock === 2){
            return;
        }
        webgl_characters[args.id].vehicle = false;
        vehicle.vehicle_stats.character = false;
        webgl_characters[args.id].camera_rotate_y = webgl_characters[args.id].rotate_y;
    }
    if(current !== args.vehicle){
        if(args.vehicle === false
          || vehicle.vehicle_stats === false
          || vehicle.vehicle_stats.lock === 1
          || vehicle.vehicle_stats.character){
            return;
        }

        webgl_characters[args.id].vehicle = args.vehicle;
        vehicle.vehicle_stats.character = args.id;
        const axes = 'xyz';
        for(const axis of axes){
            webgl_characters[args.id]['change_rotate_' + axis] = 0;
            webgl_characters[args.id]['change_position_' + axis] = 0;
        }
        webgl_characters[args.id].camera_rotate_y = vehicle.rotate_y;
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

    if(args.colors.length === 0){
        args.colors.push(
          Math.random(),
          Math.random(),
          Math.random(),
          1
        );
    }

    const color = [];
    for(let i = 0; i < args.vertexcount; i++){
        const index = args.colors[i * 4] !== void 0
          ? i * 4
          : 0;

        color.push(
          args.colors[index],
          args.colors[index + 1],
          args.colors[index + 2],
          args.colors[index + 3]
        );
    }
    return color;
}

globalThis.webgl_default_texture = 'default.png';
globalThis.webgl_uris = globalThis.uris || {
  [webgl_default_texture]: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
};
delete globalThis.uris;
globalThis.webgl = 0;
globalThis.webgl_character_count = 0;
globalThis.webgl_character_id = '_me';
globalThis.webgl_character_base = webgl_character_id;
globalThis.webgl_characters = {};
globalThis.webgl_framebuffer = 0;
globalThis.webgl_matrices = {};
globalThis.webgl_particles = {};
globalThis.webgl_paths = {};
globalThis.webgl_picked_x = 0;
globalThis.webgl_picked_y = 0;
globalThis.webgl_picked_z = 0;
globalThis.webgl_properties = {};
globalThis.webgl_shader_id = 'default';
globalThis.webgl_shader_light_color = [];
globalThis.webgl_shader_light_position = [];
globalThis.webgl_shader_light_range = [];
globalThis.webgl_shaders = {};
globalThis.webgl_textures = {};
globalThis.webgl_timer_count = 0;
globalThis.webgl_timers = {};
