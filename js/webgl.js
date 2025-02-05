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

    const radians_y = math_degrees_to_radians(webgl_characters[webgl_character_id]['rotate-y']);
    const target = webgl_get_translation(globalThis[args['type']][args['target']]);
    audio_start_at?.({
      'forwardX': Math.sin(-radians_y),
      'forwardY': 0,
      'forwardZ': Math.cos(radians_y),
      'id': args['id'],
      'positionX': (webgl_characters[webgl_character_id]['translate-x'] - target['x']) / args['divider-x'],
      'positionY': (webgl_characters[webgl_character_id]['translate-y'] - target['y']) / args['divider-y'],
      'positionZ': (webgl_characters[webgl_character_id]['translate-z'] - target['z']) / args['divider-z'],
    });
}

function webgl_billboard(entity){
    const translation = webgl_get_translation(entity_entities[entity]);

    entity_entities[entity]['rotate-y'] = 360 - math_radians_to_degrees(Math.atan2(
      translation['z'] - webgl_characters[webgl_character_id]['camera-z'],
      translation['x'] - webgl_characters[webgl_character_id]['camera-x'],
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

    const attributes = webgl_shaders[webgl_shader_active]['attributes'];
    webgl.vertexAttribPointer(
      attributes[args['attribute']],
      args['size'],
      webgl.FLOAT,
      false,
      0,
      0
    );
    webgl.enableVertexAttribArray(attributes[args['attribute']]);
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

    if(webgl_characters[args['character']]['vehicle']){
        return;
    }

    let normals = false;
    if(args['camera']){
        if(args['y'] === false){
            return;
        }

        const strafe = webgl_character_strafe(args['character']);
        const mouse_check = strafe
          || (!core_mouse['down-0']
            && !core_mouse['down-2'])
          || !args['mouse'];

        if(webgl_characters[args['character']]['camera-zoom'] === 0
          || (mouse_check
            && webgl_character_level(args['character']) > -2
            && webgl_characters[args['character']]['life'] > 0)){
            webgl_characters[args['character']]['rotate-y'] = strafe
              ? webgl_characters[args['character']]['camera-rotate-y']
              : args['set']
                ? args['y']
                : webgl_characters[args['character']]['rotate-y'] + args['y'];
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

function webgl_character_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'automove': false,
        'camera-lock': true,
        'camera-rotate-x': 0,
        'camera-rotate-y': 0,
        'camera-rotate-z': 0,
        'camera-zoom': 0,
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
        'gravity': 0,
        'id': webgl_character_id,
        'jump-height': 1,
        'level': -2,
        'level-xp': 0,
        'life': 1,
        'life-max': 1,
        'lives': -1,
        'lock': {},
        'path-direction': 1,
        'path-end': '',
        'path-id': '',
        'path-point': 0,
        'randomize': false,
        'reticle': '#fff',
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'speed': 1,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'turn-speed': 5,
        'vehicle': false,
        'vehicle-stats': false,
      },
    });

    webgl_characters[args['id']] = {
      'automove': args['automove'],
      'camera-lock': args['camera-lock'],
      'camera-rotate-x': args['camera-rotate-x'],
      'camera-rotate-y': args['camera-rotate-y'],
      'camera-rotate-z': args['camera-rotate-z'],
      'camera-x': args['translate-x'],
      'camera-y': args['translate-y'],
      'camera-z': args['translate-z'],
      'camera-zoom': Math.min(
        webgl_properties['camera-zoom-max'],
        Math.max(
          args['camera-zoom'],
          args['level'] === -1
            ? 0
            : webgl_properties['camera-zoom-min']
        )
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
      'gravity': args['gravity'],
      'id': args['id'],
      'jump-allow': false,
      'jump-height': args['jump-height'],
      'level': args['level'],
      'level-xp': args['level-xp'],
      'life': Math.max(
        args['life'],
        1
      ),
      'life-max': args['life-max'],
      'lives': args['lives'],
      'lock': args['lock'],
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
      'turn-speed': args['turn-speed'],
      'vehicle': false,
      'vehicle-stats': args['vehicle-stats'] === false
        ? false
        : core_args({
            'args': args['vehicle-stats'],
            'defaults': {
              'character': false,
              'lock': 0,
              'speed': 0,
              'speed-acceleration': .1,
              'speed-deceleration': -.1,
              'speed-max': 1,
            },
          }),
    };
    webgl_character_count++;

    entity_group_create(['webgl_characters_' + args['id']]);
    webgl_entity_create({
      'character': args['id'],
      'entities': args['entities'],
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

    if(args['randomize']){
        const xz = webgl_characters[args['id']]['collide-range-xz'] * 2;

        webgl_primitive_cuboid({
          'all': {
            'collision': false,
            'texture': 'grid.png',
          },
          'character': args['id'],
          'prefix': args['id'],
          'size-x': xz,
          'size-y': webgl_characters[args['id']]['collide-range-y'] * 2,
          'size-z': xz,
        });
    }
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
        'angle': true,
        'id': webgl_character_id,
        'speed': 1,
        'strafe': false,
        'y': false,
      },
    });

    if(args['y']){
        webgl_characters[args['id']]['change-translate-y'] += args['speed'] * (args['strafe']
          ? -1
          : 1);

    }else{
        const angle = args['angle'] === true
          ? webgl_characters[args['id']]['rotate-y']
          : args['angle'];
        const movement = math_move_3d({
          'angle': angle,
          'speed': args['speed'],
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

    const axes = 'xyz';
    for(const axis in axes){
        webgl_characters[id]['camera-rotate-' + axes[axis]] = 0;
        webgl_characters[id]['change-rotate-' + axes[axis]] = 0;
        webgl_characters[id]['change-translate-' + axes[axis]] = 0;
        webgl_characters[id]['rotate-' + axes[axis]] = 0;
    }
    webgl_characters[id]['jump-allow'] = false;

    webgl_move_to({
      'move': webgl_characters[id],
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
              entity,
            ],
            'from': 'webgl_characters_' + entity_entities[entity]['attach-to'],
            'to': 'webgl_characters_' + args['id'],
          });
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

    webgl_characters[id]['life'] = webgl_characters[id]['life-max'];

    webgl_character_origin(id);
    webgl_move_to({
      'move': webgl_characters[id],
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
    if(webgl_characters[id]['vehicle-stats']){
        webgl_characters[id]['vehicle-stats']['speed'] = 0;
        const character = webgl_characters[id]['vehicle-stats']['character'];
        if(character){
            webgl_character_spawn(character);
        }
    }
}

function webgl_character_strafe(id){
    const checks = webgl_properties['pointerlock']
      || webgl_characters[id]['camera-zoom'] === 0
      || webgl_characters[id]['controls'] === 'arpg'
      || webgl_characters[id]['controls'] === 'rts';

    if(id !== webgl_character_id){
        return checks;
    }

    return checks
      || core_mouse['down-2'];
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
    const character = args['target']['attach-to']
      ? webgl_characters[args['target']['attach-to']]
      : false;
    let collision = '';
    const collider_position = webgl_get_translation(args['collider']);
    const collision_sign = [];
    const diffs = {
      'x': args['collider']['change-translate-x'] - character?.['change-translate-x'],
      'y': args['collider']['change-translate-y'] - character?.['change-translate-y'],
      'z': args['collider']['change-translate-z'] - character?.['change-translate-z'],
    };
    const range = {
      'x': args['collider']['collide-range-xz'] + Math.abs(diffs['x']),
      'y': args['collider']['collide-range-y'] + Math.abs(diffs['y']),
      'z': args['collider']['collide-range-xz'] + Math.abs(diffs['z']),
    };
    const target_position = webgl_get_translation(args['target']);

    let sign = Math.sign(args['target']['normals'][0]);
    if(sign !== 0
      && sign !== Math.sign(diffs['x'])
      && collider_position['x'] > target_position['x'] - range['x']
      && collider_position['x'] < target_position['x'] + range['x']
      && collider_position['y'] > target_position['y'] + args['target']['vertices'][3] - range['y']
      && collider_position['y'] < target_position['y'] + args['target']['vertices'][0] + range['y']
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
      && collider_position['y'] > target_position['y'] + args['target']['vertices'][2] - range['y']
      && collider_position['y'] < target_position['y'] + args['target']['vertices'][8] + range['y']
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
      && collider_position['y'] > target_position['y'] - range['y']
      && collider_position['y'] < target_position['y'] + range['y']
      && collider_position['z'] > target_position['z'] + args['target']['vertices'][2] - range['z']
      && collider_position['z'] < target_position['z'] + args['target']['vertices'][8] + range['z']){
        collision += 'y';
        collision_sign.push(sign);
    }

    if(collision.length === 0){
        return;
    }

    for(const axis in collision){
        const change_translate = character
          ? character['change-translate-' + collision[axis]]
          : 0;

        args['collider']['translate-' + collision[axis]] = target_position[collision[axis]]
          + args['collider']['collide-range-' + (collision[axis] === 'y' ? 'y' : 'xz')] * collision_sign[axis]
          + change_translate;
        args['collider']['change-translate-' + collision[axis]] = change_translate;

        if(collision[axis] === 'y'){
            if(args['collider']['jump-allow'] === false){
                args['collider']['jump-allow'] = collision_sign[axis] !== Math.sign(webgl_properties['gravity-max']);

                const change = args['collider']['change-translate-' + collision[axis]];
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
                args['collider']['change-translate-x'] += character['change-translate-x'];
                args['collider']['change-translate-z'] += character['change-translate-z'];
            }

        }else if(args['collider']['vehicle-stats']){
            const other_axis = collision[axis] === 'x'
              ? 'z'
              : 'x';

            args['collider']['vehicle-stats']['speed'] = Math.min(
              args['collider']['vehicle-stats']['speed'],
              Math.abs(args['collider']['change-translate-' + other_axis])
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

function webgl_context(element){
    return element.getContext(
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
    webgl_textures = {};
}

function webgl_context_restored(event){
    webgl_init();
    webgl_uniform_update();
    for(const entity in entity_entities){
        webgl_entity_init(entity);
    }
    webgl_context_valid = true;

    if(core_menu_open){
        webgl_draw();

    }else{
        core_interval_resume_all();
    }
}

function webgl_controls_keyboard(id){
    const level = webgl_character_level(id);
    if(level < -1
      || webgl_characters[id]['life'] <= 0
      || webgl_characters[id]['path-id'].length !== 0){
        return;
    }

    if(webgl_characters[id]['vehicle-stats']){
        const vehicle = webgl_characters[id]['vehicle-stats'];
        if(vehicle['character']
          || !webgl_characters[id]['jump-allow']){
            return;
        }
        let speed = 0;
        if(vehicle['speed'] >= 0){
            speed = Math.max(
              vehicle['speed'] + vehicle['speed-deceleration'],
              0
            );

        }else{
            speed = Math.min(
              vehicle['speed'] - vehicle['speed-deceleration'],
              0
            );
        }
        vehicle['speed'] = speed;
        if(speed !== 0){
            webgl_character_move({
              'id': id,
              'speed': -speed,
            });
        }
        return;

    }
    const controls = webgl_characters[id]['controls'];
    if(controls.length === 0){
        return;
    }

    let back = false;
    let crouch = false;
    let forward = false;
    let jump = false;
    let left = false;
    let right = false;

    if(id === webgl_character_id){
        back = core_keys[core_storage_data['move-↓']]['state'];
        crouch = core_keys[core_storage_data['crouch']]['state'];
        forward = core_keys[core_storage_data['move-↑']]['state']
          || (core_mouse['down-0'] && core_mouse['down-2']);
        jump = core_keys[core_storage_data['jump']]['state'];
        left = core_keys[core_storage_data['move-←']]['state'];
        right = core_keys[core_storage_data['move-→']]['state'];
    }

    if(forward || back){
        webgl_characters[id]['automove'] = false;
    }

    if(webgl_characters[id]['vehicle']){
        const vehicle = webgl_characters[webgl_characters[id]['vehicle']];
        let speed = 0;
        let turn = 0;
        if(vehicle['jump-allow']){
            if(forward || webgl_characters[id]['automove']){
                speed = Math.min(
                  vehicle['vehicle-stats']['speed'] + vehicle['vehicle-stats']['speed-acceleration'],
                  vehicle['vehicle-stats']['speed-max']
                );

            }else if(back){
                speed = Math.max(
                  vehicle['vehicle-stats']['speed'] - vehicle['vehicle-stats']['speed-acceleration'],
                  -vehicle['vehicle-stats']['speed-max'] / 2
                );

            }else if(vehicle['vehicle-stats']['speed'] >= 0){
                speed = Math.max(
                  vehicle['vehicle-stats']['speed'] + vehicle['vehicle-stats']['speed-deceleration'],
                  0
                );

            }else{
                speed = Math.min(
                  vehicle['vehicle-stats']['speed'] - vehicle['vehicle-stats']['speed-deceleration'],
                  0
                );
            }
            vehicle['vehicle-stats']['speed'] = speed;

            if(core_mouse['down-2']){
                const half = webgl.drawingBufferWidth / 2;
                turn = vehicle['turn-speed'] * Math.max(
                  Math.min(
                    (core_mouse['x'] - half) / half * core_storage_data['mouse-horizontal'],
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
          || core_mouse['down-2']){
            if(speed < 0){
                turn *= -1;
            }
            vehicle['rotate-y'] += turn;
            if(core_mouse['down-2']){
                webgl_characters[id]['camera-rotate-y'] = vehicle['rotate-y'];

            }else if(!core_mouse['down-0']){
                webgl_characters[id]['camera-rotate-y'] += turn;
            }
            webgl_clamp_rotation(vehicle);
            webgl_clamp_rotation(webgl_characters[id]);
        }
        if(speed !== 0){
            webgl_character_move({
              'id': vehicle['id'],
              'speed': -speed,
            });
        }

        const axes = 'xyz';
        for(const axis in axes){
            webgl_characters[id]['rotate-' + axes[axis]] = vehicle['rotate-' + axes[axis]];
            webgl_characters[id]['translate-' + axes[axis]] = vehicle['translate-' + axes[axis]] + vehicle['change-translate-' + axes[axis]];
        }
        webgl_characters[id]['translate-y'] += webgl_characters[id]['collide-range-y'];
        return;
    }

    let leftright = 0;
    const strafe = webgl_character_strafe(id);
    if(left){
        if(strafe){
            leftright -= 1;

        }else{
            webgl_camera_rotate({
              'camera': !core_mouse['down-0'],
              'character': id,
              'y': -webgl_characters[id]['turn-speed'],
            });
        }
    }
    if(right){
        if(strafe){
            leftright += 1;

        }else{
            webgl_camera_rotate({
              'camera': !core_mouse['down-0'],
              'character': id,
              'y': webgl_characters[id]['turn-speed'],
            });
        }
    }

    if(level === -1 || webgl_characters[id]['jump-allow']){
        let forwardback = 0;
        if(forward || webgl_characters[id]['automove']){
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
                  'id': id,
                  'speed': webgl_characters[id]['speed'],
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
                  'id': id,
                  'speed': webgl_characters[id]['speed'],
                  'y': true,
                });

            }else{
                webgl_characters[id]['jump-allow'] = false;
                webgl_characters[id]['change-translate-y'] = webgl_characters[id]['jump-height'];
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
              'id': id,
              'speed': leftright * webgl_characters[id]['speed'],
              'strafe': true,
            });
        }
        if(forwardback !== 0){
            webgl_character_move({
              'angle': controls === 'arpg'
                ? 0
                : true,
              'id': id,
              'speed': forwardback * webgl_characters[id]['speed'],
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
            webgl_characters[id]['rotate-y'] = angle;
        }
    }
}

function webgl_controls_mouse(id){
    const level = webgl_character_level(id);
    if(level < -1){
        return;
    }
    const controls = webgl_characters[id]['controls'];
    if(controls.length === 0){
        return;
    }

    let mouse_0_down = false;
    let mouse_2_down = false;
    let movement_x = 0;
    let movement_y = 0;
    if(id === webgl_character_id){
        mouse_0_down = core_mouse['down-0'];
        mouse_2_down = core_mouse['down-2'];
        movement_x = core_mouse['movement-x'];
        movement_y = core_mouse['movement-y'];
    }

    if(webgl_properties['pointerlock']
      || mouse_2_down
      || (mouse_0_down && controls !== 'rts')){
        if(level !== -1 && webgl_properties['paused']){
            return;
        }

        webgl_camera_rotate({
          'character': id,
          'x': movement_y / 10,
          'y': movement_x / 10,
        });
    }
}

function webgl_controls_wheel(id, deltaY){
    if(webgl_character_level(id) < -1){
        return;
    }

    const character = webgl_characters[id];
    if(deltaY > 0){
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
    if(!entity_entities[entity]['draw']
      || !entity_entities[entity]['visible']){
        return;
    }

    webgl.bindVertexArray(entity_entities[entity]['vao']);

    webgl.bindTexture(
      webgl.TEXTURE_2D,
      webgl_textures[entity_entities[entity]['texture']]['gl']
    );
    const uniforms = webgl_shaders[webgl_shader_active]['uniforms'];
    webgl.uniform1f(
      uniforms['alpha'],
      entity_entities[entity]['alpha']
    );
    webgl.uniform1f(
      uniforms['point-size'],
      entity_entities[entity]['point-size']
    );
    webgl.uniformMatrix4fv(
      uniforms['mat_cameraMatrix'],
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

// Required args: id
function webgl_entity_alpha(args){
    args = core_args({
      'args': args,
      'defaults': {
        'alpha': 1,
      },
    });

    entity_entities[args['id']]['alpha'] = args['alpha'];

    if(args['alpha'] === 1){
        entity_group_move({
          'entities': [
            args['id'],
          ],
          'from': 'transparent',
          'to': 'opaque',
        });

    }else{
        entity_group_move({
          'entities': [
            args['id'],
          ],
          'from': 'opaque',
          'to': 'transparent',
        });
    }
}

function webgl_entity_buffer(entity){
    if(entity_entities[entity]['picking'] === true){
        entity_entities[entity]['picking'] = [
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
    const picking = entity_entities[entity]['picking'] || [0, 0, 0];
    const texture_align = entity_entities[entity]['texture-align'];
    const textureData = [];
    const half_length = texture_align.length / 2;
    for(let i = 0; i < entity_entities[entity]['vertices-length']; i++){
        pickData.push(...picking);
        const align = i < half_length
          ? i * 2
          : (i % half_length) * 2;
        textureData.push(
          texture_align[align] * entity_entities[entity]['texture-x'],
          texture_align[align + 1] * entity_entities[entity]['texture-y']
        );
    }

    webgl.bindVertexArray(entity_entities[entity]['vao']);

    webgl_buffer_set({
      'attribute': 'vec_vertexColor',
      'data': entity_entities[entity]['vertex-colors'],
      'size': 4,
    });
    const normals = [];
    for(let i = 0; i < entity_entities[entity]['vertices-length']; i++){
        normals.push(...entity_entities[entity]['normals']);
    }
    webgl_buffer_set({
      'attribute': 'vec_vertexNormal',
      'data': normals,
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

function webgl_entity_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': false,
        'entities': [],
        'groups': [],
      },
    });

    for(const entity in args['entities']){
        const entity_id = entity_create({
          'id': args['entities'][entity]['id'],
          'properties': args['entities'][entity],
          'types': args['entities'][entity]['types'],
        });
        math_matrices[entity_id] = math_matrix_create();

        const groups = [
          ...args['groups'],
        ];
        if(entity_entities[entity_id]['groups']){
            groups.push(entity_entities[entity_id]['groups']);
            delete entity_entities[entity_id]['groups'];
        }
        for(const group in groups){
            entity_group_add({
              'entities': [
                entity_id,
              ],
              'group': groups[group],
            });
        }

        if(entity_groups['skybox']?.[entity_id] === true){
            entity_group_remove({
              'entities': [
                entity_id,
              ],
              'group': 'opaque',
            });
            entity_group_remove({
              'entities': [
                entity_id,
              ],
              'group': 'transparent',
            });
            entity_entities[entity_id]['attach-to'] = webgl_character_id;
            entity_entities[entity_id]['attach-type'] = 'webgl_characters';

        }else if(args['character']){
            entity_entities[entity_id]['attach-to'] = args['character'];
            entity_entities[entity_id]['attach-type'] = 'webgl_characters';
        }

        if(entity_entities[entity_id]['attach-to']){
            entity_attach({
              'entity': entity_id,
              'to': entity_entities[entity_id]['attach-to'],
              'type': entity_entities[entity_id]['attach-type'],
              'x': entity_entities[entity_id]['attach-x'],
              'y': entity_entities[entity_id]['attach-y'],
              'z': entity_entities[entity_id]['attach-z'],
            });
            entity_group_add({
              'entities': [
                entity_id,
              ],
              'group': 'webgl_characters_' + entity_entities[entity_id]['attach-to'],
            });
        }
    }
}

function webgl_entity_init(entity){
    webgl_texture_init({
      'id': entity_entities[entity]['texture'],
    });

    entity_entities[entity]['id'] = entity;
    entity_entities[entity]['vertices-length'] = entity_entities[entity]['vertices'].length / 3;
    entity_entities[entity]['vertex-colors'] = webgl_vertexcolorarray({
      'colors': entity_entities[entity]['vertex-colors'],
      'vertexcount': entity_entities[entity]['vertices-length'],
    });
    entity_entities[entity]['normals'] = webgl_normals({
      'rotate-x': entity_entities[entity]['rotate-x'],
      'rotate-y': entity_entities[entity]['rotate-y'],
      'rotate-z': entity_entities[entity]['rotate-z'],
    });
    entity_entities[entity]['vao'] = webgl.createVertexArray();

    webgl_entity_alpha({
      'alpha': entity_entities[entity]['alpha'],
      'id': entity,
    });
    webgl_entity_buffer(entity);
}

function webgl_entity_normals(entity){
    let rotate_x = entity_entities[entity]['rotate-x'];
    let rotate_y = entity_entities[entity]['rotate-y'];
    let rotate_z = entity_entities[entity]['rotate-z'];
    if(entity_entities[entity]['attach-to']){
        const attached_to = globalThis[entity_entities[entity]['attach-type']][entity_entities[entity]['attach-to']];
        rotate_x += attached_to['rotate-x'];
        rotate_y += attached_to['rotate-y'];
        rotate_z += attached_to['rotate-z'];
    }
    entity_entities[entity]['normals'] = webgl_normals({
      'rotate-x': rotate_x,
      'rotate-y': rotate_y,
      'rotate-z': rotate_z,
    });

    const normals = [];
    for(let i = 0; i < entity_entities[entity]['vertices-length']; i++){
        normals.push(...entity_entities[entity]['normals']);
    }
    webgl.bindVertexArray(entity_entities[entity]['vao']);
    webgl_buffer_set({
      'attribute': 'vec_vertexNormal',
      'data': normals,
      'size': 3,
    });
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
            if(webgl_character_level(target['id']) < -1){
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
    webgl = webgl_context(canvas);

    math_matrices['cache'] = math_matrix_create();
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
        'draw-range': false,
        'event-limit': false,
        'event-range': false,
        'event-todo': [],
        'normals': [],
        'particle': false,
        'picking': false,
        'point-size': 500,
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
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'vertices-length': 0,
        'visible': true,
      },
      'todo': webgl_entity_init,
      'type': 'opaque',
    });

    webgl_shader_create({
      'attributes': [
        'vec_pickColor',
        'vec_texturePosition',
        'vec_vertexColor',
        'vec_vertexNormal',
        'vec_vertexPosition',
      ],
      'fragment': `#version 300 es
precision mediump float;
uniform bool fog;
uniform float float_fogDensity;
uniform bool picking;
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
}`,
      'id': 'default',
      'uniforms': {
        'alpha': 'alpha',
        'point-size': 'pointSize',
        'ambient-color': 'vec_ambientColor',
        'clear-color': 'vec_clearColor',
        'directional': 'directional',
        'directional-color': 'vec_directionalColor',
        'directional-vector': 'vec_directionalVector',
        'fog-density': 'float_fogDensity',
        'fog-state': 'fog',
        'mat_cameraMatrix': 'mat_cameraMatrix',
        'mat_perspectiveMatrix': 'mat_perspectiveMatrix',
        'picking': 'picking',
        'sampler': 'sampler',
      },
      'vertex': `#version 300 es
in vec4 vec_pickColor;
in vec2 vec_texturePosition;
in vec3 vec_vertexNormal;
in vec4 vec_vertexColor;
in vec3 vec_vertexPosition;
uniform float alpha;
uniform float pointSize;
uniform bool directional;
uniform mat4 mat_cameraMatrix;
uniform mat4 mat_perspectiveMatrix;
uniform bool picking;
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
    gl_PointSize = pointSize / length(vec_position.xyz);
    if(picking){
        vec_fragmentColor = vec_pickColor;
    }else{
        vec_textureCoord = vec_texturePosition;
        vec3 lighting = vec_ambientColor;
        if(directional){
            vec4 transformedNormal = mat_perspectiveMatrix * vec4(vec_vertexNormal, 1.0);
            lighting += vec_directionalColor * max(dot(transformedNormal.xyz, normalize(vec_directionalVector)), -0.5);
        }
        vec_lighting = vec4(lighting, alpha);
        vec_fragmentColor = vec_vertexColor;
    }
}`,
    });
    webgl_shader_use('default');
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
      && webgl_character_level() < -1){
        return;
    }

    core_interval_pause_all();

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
        'camera-zoom': 25,
        'camera-zoom-max': 50,
        'camera-zoom-min': 0,
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
        'draw-range': false,
        'fog-density': .0001,
        'fog-state': false,
        'gravity-acceleration': -.05,
        'gravity-damage': false,
        'gravity-max': -2,
        'groups': [],
        'lock': {},
        'paused': false,
        'paths': {},
        'pointerlock': false,
        'prefabs': [],
        'spawn-path-id': '',
        'spawn-rotate-x': 0,
        'spawn-rotate-y': 0,
        'spawn-rotate-z': 0,
        'spawn-translate-x': 0,
        'spawn-translate-y': 0,
        'spawn-translate-z': 0,
        'textures': false,
        'title': false,
        'y-min': false,
      },
    });

    entity_id_count = 0;
    webgl_properties = {
      'ambient-blue': level['ambient-blue'],
      'ambient-green': level['ambient-green'],
      'ambient-red': level['ambient-red'],
      'camera-zoom': level['camera-zoom'],
      'camera-zoom-max': level['camera-zoom-max'],
      'camera-zoom-min': level['camera-zoom-min'],
      'clearcolor-blue': level['clearcolor-blue'],
      'clearcolor-green': level['clearcolor-green'],
      'clearcolor-red': level['clearcolor-red'],
      'cursor': level['cursor'],
      'directional-blue': level['directional-blue'],
      'directional-green': level['directional-green'],
      'directional-red': level['directional-red'],
      'directional-state': level['directional-state'],
      'directional-vector': level['directional-vector'],
      'draw-range': level['draw-range'],
      'fog-density': level['fog-density'],
      'fog-state': level['fog-state'],
      'gravity-acceleration': level['gravity-acceleration'],
      'gravity-damage': level['gravity-damage'],
      'gravity-max': level['gravity-max'],
      'lock': level['lock'],
      'paused': level['paused'],
      'pointerlock': level['pointerlock'],
      'spawn-path-id': level['spawn-path-id'],
      'spawn-rotate-x': level['spawn-rotate-x'],
      'spawn-rotate-y': level['spawn-rotate-y'],
      'spawn-rotate-z': level['spawn-rotate-z'],
      'spawn-translate-x': level['spawn-translate-x'],
      'spawn-translate-y': level['spawn-translate-y'],
      'spawn-translate-z': level['spawn-translate-z'],
      'title': level['title'],
      'y-min': level['y-min'],
    };

    webgl_clearcolor_set({
      'blue': webgl_properties['clearcolor-blue'],
      'green': webgl_properties['clearcolor-green'],
      'red': webgl_properties['clearcolor-red'],
    });
    webgl_cursor(webgl_properties['cursor']);

    level['groups'].push(
      'opaque',
      'skybox',
      'transparent',
    );
    entity_group_create(level['groups']);

    if(level['textures'] !== false){
        Object.assign(
          uris,
          level['textures']
        );
    }

    Object.assign(
      webgl_paths,
      level['paths']
    );

    if(args['character'] === -1){
        webgl_character_base_entities = [];
        webgl_character_base_properties = {};
        webgl_character_init({
          'collides': true,
          'controls': 'rpg',
          'entities': [],
          'id': webgl_character_id,
          'level': -1,
          'speed': 1,
        });

    }else if(core_type(args['character']) === 'object'){
        webgl_character_base_entities = [];
        webgl_character_base_properties = {};
        webgl_character_init(args['character']);

    }else{
        webgl_character_init(webgl_character_base_properties);
        webgl_entity_create({
          'entities': webgl_character_base_entities,
        });
    }

    for(const id in level['characters']){
        webgl_character_init(level['characters'][id]);
    }
    for(const prefab in level['prefabs']){
        globalThis[level['prefabs'][prefab]['type']]?.(level['prefabs'][prefab]['properties']);
    }

    webgl_uniform_update();
    webgl_character_spawn();
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
    for(const entity in entity_entities){
        if(entity_entities[entity]['attach-to'] === webgl_character_id
          && entity_groups['skybox'][entity] !== true){
            const properties = {};
            Object.assign(
              properties,
              entity_entities[entity]
            );
            webgl_character_base_entities.push(properties);
        }
    }

    for(const id in webgl_characters){
        delete webgl_characters[id];
    }
    webgl_character_count = 0;
    entity_remove_all({
      'delete-empty': true,
    });
    webgl_particles = {};
    webgl_paths = {};
    core_storage_save();
}

function webgl_logic(){
    if(!webgl_context_valid
      || webgl === 0){
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
        webgl_logic_entity(entity);
    }

    for(const id in webgl_characters){
        const level = webgl_character_level(id);
        if(webgl_properties['paused']
          && level !== -1){
            continue;
        }

        webgl_controls_keyboard(id);

        const character = webgl_characters[id];
        if(character['vehicle']){
            continue;
        }

        if(character['gravity'] !== 0){
            character['change-translate-y'] = Math.max(
              character['change-translate-y'] + webgl_properties['gravity-acceleration'] * character['gravity'],
              webgl_properties['gravity-max'] * character['gravity']
            );
        }

        webgl_path_move(id);

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
        webgl_clamp_rotation(character);

        const axes = 'xyz';
        for(const axis in axes){
            const translate_axis = 'translate-' + axes[axis];
            character[translate_axis] += character['change-' + translate_axis];
        }

        Object.assign(
           character,
           character['lock'],
           webgl_properties['lock']
        );

        const change_translate_x = character['change-translate-x'];
        const change_translate_z = character['change-translate-z'];
        if(character['change-translate-y'] !== 0){
            character['jump-allow'] = false;
        }

        if(character['collides']
          && webgl_paths[character['path-id']]?.['collision'] !== false){
            for(const entity in entity_entities){
                if(entity_entities[entity]['collision']){
                    webgl_collision({
                      'collider': character,
                      'target': entity_entities[entity],
                    });
                }
            }
        }

        if(level <= -1){
            if(character['path-id'].length === 0){
                character['change-translate-x'] = 0;
                character['change-translate-y'] = 0;
                character['change-translate-z'] = 0;
            }

        }else{
            if(character['jump-allow']){
                character['change-translate-x'] -= change_translate_x;
                character['change-translate-z'] -= change_translate_z;
            }

            if(webgl_properties['y-min'] !== false
              && character['translate-y'] < webgl_properties['y-min']){
                webgl_stat_modify({
                  'set': true,
                  'stat': 'life',
                  'target': character,
                  'value': 0,
                });
                webgl_character_spawn(id);
            }
        }
    }

    const character = webgl_characters[webgl_character_id];
    if(character['camera-lock']){
        if(character['camera-zoom'] > 0){
            const radians_x = math_degrees_to_radians(character['camera-rotate-x']);
            const radians_y = math_degrees_to_radians(character['camera-rotate-y']);
            const zoom_cos_x = character['camera-zoom'] * Math.cos(radians_x);

            character['camera-x'] = character['translate-x'] + Math.sin(-radians_y) * zoom_cos_x;
            character['camera-y'] = character['translate-y'] + Math.sin(radians_x) * character['camera-zoom'];
            character['camera-z'] = character['translate-z'] + Math.cos(radians_y) * zoom_cos_x;

        }else{
            character['camera-x'] = character['translate-x'];
            character['camera-y'] = character['translate-y'];
            character['camera-z'] = character['translate-z'];
        }
    }

    math_matrix_identity('camera');
    math_matrix_rotate({
      'dimensions': [
        math_degrees_to_radians(character['camera-rotate-x']),
        math_degrees_to_radians(character['camera-rotate-y']),
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
    const draw_range = entity_entities[entity]['draw-range'] || webgl_properties['draw-range'];
    if(draw_range){
        const translation = webgl_get_translation(entity_entities[entity]);
        entity_entities[entity]['visible'] = math_distance({
            'x0': webgl_characters[webgl_character_id]['camera-x'],
            'y0': webgl_characters[webgl_character_id]['camera-y'],
            'z0': webgl_characters[webgl_character_id]['camera-z'],
            'x1': translation['x'],
            'y1': translation['y'],
            'z1': translation['z'],
          }) <= draw_range;

    }else{
        entity_entities[entity]['visible'] = true;
    }

    if(entity_entities[entity]['event-range'] > 0){
        const event_position = webgl_get_translation(entity_entities[entity]);

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
                if(!entity_entities[entity]){
                    return;
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

    if(entity_entities[entity]['particle']){
        webgl_logic_particle(entity);

        webgl.bindVertexArray(entity_entities[entity]['vao']);
        webgl_buffer_set({
          'attribute': 'vec_vertexPosition',
          'data': entity_entities[entity]['vertices'],
          'size': 3,
        });
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
    if(entity_entities[entity]['attach-to']){
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
        args['move']['translate-x'] = args['target']['translate-x'];
        args['move']['translate-y'] = args['target']['translate-y'];
        args['move']['translate-z'] = args['target']['translate-z'];
        return;
    }

    args['move']['translate-x'] = args['x'];
    args['move']['translate-y'] = args['y'];
    args['move']['translate-z'] = args['z'];
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

function webgl_logic_particle(entity){
    const particle = entity_entities[entity]['particle'];
    const repeat = entity_entities[entity]['vertices-length'] * 3;
    const vertices = entity_entities[entity]['vertices'];

    if(webgl_particles[particle]['randomize']){
        for(let vertex = 0; vertex < repeat; vertex += 3){
            const y_vertex = vertices[vertex + 1] + webgl_particles[particle]['speed-y'];
            if(y_vertex < webgl_particles[particle]['y-min']
              || y_vertex > webgl_particles[particle]['y-max']){
                vertices[vertex] = webgl_particles[particle]['x-min']
                  + Math.random() * (webgl_particles[particle]['x-max'] - webgl_particles[particle]['x-min']);
                vertices[vertex + 2] = webgl_particles[particle]['z-min']
                  + Math.random() * (webgl_particles[particle]['z-max'] - webgl_particles[particle]['z-min']);
            }
        }
    }

    for(let vertex = 0; vertex < repeat; vertex += 3){
        vertices[vertex] = math_clamp({
          'max': webgl_particles[particle]['x-max'],
          'min': webgl_particles[particle]['x-min'],
          'value': vertices[vertex] + webgl_particles[particle]['speed-x'],
          'wrap': true,
        });
        vertices[vertex + 1] = math_clamp({
          'max': webgl_particles[particle]['y-max'],
          'min': webgl_particles[particle]['y-min'],
          'value': vertices[vertex + 1] + webgl_particles[particle]['speed-y'],
          'wrap': true,
        });
        vertices[vertex + 2] = math_clamp({
          'max': webgl_particles[particle]['z-max'],
          'min': webgl_particles[particle]['z-min'],
          'value': vertices[vertex + 2] + webgl_particles[particle]['speed-z'],
          'wrap': true,
        });
    }
}

function webgl_path_move(id){
    const character = webgl_characters[id];
    if(webgl_paths[character['path-id']] === void 0){
        return;
    }

    const path = globalThis.structuredClone(webgl_paths[character['path-id']]);
    const point = core_args({
      'args': path['points'][character['path-point']],
      'defaults': {
        'rotate-x': false,
        'rotate-y': false,
        'rotate-z': false,
        'translate-x': character['translate-x'],
        'translate-y': character['translate-y'],
        'translate-z': character['translate-z'],
      },
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
                    const warp_point = core_args({
                      'args': path['points'][0],
                      'defaults': {
                        'translate-x': character['translate-x'],
                        'translate-y': character['translate-y'],
                        'translate-z': character['translate-z'],
                      },
                    });
                    character['translate-x'] = warp_point['translate-x'];
                    character['translate-y'] = warp_point['translate-y'];
                    character['translate-z'] = warp_point['translate-z'];

                }else{
                    character['path-id'] = '';
                    character['path-point'] = 0;
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

            }else if(path_end === 'warp'){
                const last = path['points'].length - 1;
                character['path-point'] = last - 1;
                const warp_point = core_args({
                  'args': path['points'][last],
                  'defaults': {
                    'translate-x': character['translate-x'],
                    'translate-y': character['translate-y'],
                    'translate-z': character['translate-z'],
                  },
                });
                character['translate-x'] = warp_point['translate-x'];
                character['translate-y'] = warp_point['translate-y'];
                character['translate-z'] = warp_point['translate-z'];

            }else{
                character['path-id'] = '';
                character['path-point'] = 0;
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
    const cos_y_speed = Math.cos(angle_y) * speed;
    character['change-translate-x'] = core_round({
      'number': Math.cos(angle_xz) * cos_y_speed,
    });
    character['change-translate-y'] = core_round({
      'number': Math.sin(angle_y) * speed,
    });
    character['change-translate-z'] = core_round({
      'number': Math.sin(angle_xz) * cos_y_speed,
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
    const uniforms = webgl_shaders[webgl_shader_active]['uniforms'];

    webgl.uniform1i(
      uniforms['picking'],
      true
    );
    webgl_draw();
    const color = webgl_pick_color({
      'x': args['x'],
      'y': args['y'],
    });
    webgl.uniform1i(
      uniforms['picking'],
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
        for(const entity in entity_entities){
            const entity_color = entity_entities[entity]['picking'];

            if(entity_color
              && color_blue === entity_color[2]
              && color_green === entity_color[1]
              && color_red === entity_color[0]){
                webgl_event({
                  'parent': entity_entities[entity],
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
                entity,
              ],
            });
        }
    }

    globalThis[args['prefab']['type']]?.(args['prefab']['properties']);
}

// Required args: properties, type
function webgl_prefab_repeat(args){
    args = core_args({
      'args': args,
      'defaults': {
        'characters': false,
        'count': 1,
        'prefix': entity_id_count,
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
              'translate-x': Math.random() * (args['x-max'] - args['x-min']) + args['x-min'],
              'translate-y': Math.random() * (args['y-max'] - args['y-min']) + args['y-min'],
              'translate-z': Math.random() * (args['z-max'] - args['z-min']) + args['z-min'],
            });

            args['properties']['character'] = prefix;
            args['properties']['prefix'] = prefix;

            globalThis[args['type']]?.(args['properties']);
        }
        return;
    }

    for(let i = 0; i < args['count']; i++){
        args['properties']['prefix'] = args['prefix'] + '-' + i;
        args['properties']['translate-x'] = Math.random() * (args['x-max'] - args['x-min']) + args['x-min'];
        args['properties']['translate-y'] = Math.random() * (args['y-max'] - args['y-min']) + args['y-min'];
        args['properties']['translate-z'] = Math.random() * (args['z-max'] - args['z-min']) + args['z-min'];

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
          'attach-x': prefab_args['translate-x'],
          'attach-y': prefab_args['translate-y'] + half_size_y,
          'attach-z': prefab_args['translate-z'],
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
          'attach-x': prefab_args['translate-x'],
          'attach-y': prefab_args['translate-y'] - half_size_y,
          'attach-z': prefab_args['translate-z'],
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

    if(args['front']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['translate-x'],
          'attach-y': prefab_args['translate-y'],
          'attach-z': prefab_args['translate-z'] + half_size_z,
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

    if(args['back']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['translate-x'],
          'attach-y': prefab_args['translate-y'],
          'attach-z': prefab_args['translate-z'] - half_size_z,
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

    if(args['left']['exclude'] !== true){
        const properties = {
          ...prefab_args,
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'attach-x': prefab_args['translate-x'] - half_size_x,
          'attach-y': prefab_args['translate-y'],
          'attach-z': prefab_args['translate-z'],
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
          'attach-x': prefab_args['translate-x'] + half_size_x,
          'attach-y': prefab_args['translate-y'],
          'attach-z': prefab_args['translate-z'],
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
      'attach-x': prefab_args['translate-x'],
      'attach-y': prefab_args['translate-y'],
      'attach-z': prefab_args['translate-z'],
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
      'attach-x': prefab_args['translate-x'],
      'attach-y': prefab_args['translate-y'],
      'attach-z': prefab_args['translate-z'],
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
        'draw-mode': 'POINTS',
        'entities': [],
        'groups': [],
        'prefix': entity_id_count,
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
    });

    webgl_particles[args['id']] = {
      'draw-mode': args['draw-mode'],
      'randomize': args['randomize'],
      'speed-x': args['speed-x'],
      'speed-y': args['speed-y'],
      'speed-z': args['speed-z'],
      'x-max': args['x-max'],
      'x-min': args['x-min'],
      'y-max': args['y-max'],
      'y-min': args['y-min'],
      'z-max': args['z-max'],
      'z-min': args['z-min'],
    };

    for(const entity in args['entities']){
        const vertices = [];
        const vertexcount = args['entities'][entity]['vertex-repeat'];
        delete args['entities'][entity]['vertex-repeat'];
        for(let vertex = 0; vertex <= vertexcount; vertex++){
            vertices.push(
              args['x-min'] + Math.random() * (args['x-max'] - args['x-min']),
              args['y-min'] + Math.random() * (args['y-max'] - args['y-min']),
              args['z-min'] + Math.random() * (args['z-max'] - args['z-min'])
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
              'draw-mode': webgl_particles[args['id']]['draw-mode'],
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
          'attach-x': prefab_args['translate-x'],
          'attach-y': prefab_args['translate-y'],
          'attach-z': prefab_args['translate-z'],
          'collision': false,
          'draw-mode': 'POINTS',
          'id': args['prefix'],
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
          'attach-x': prefab_args['translate-x'],
          'attach-y': prefab_args['translate-y'],
          'attach-z': prefab_args['translate-z'],
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

function webgl_random_vertex(id){
    const entity = entity_entities[id];
    const translation = webgl_get_translation(entity);
    const vertex = core_random_integer({
      'max': entity['vertices-length'],
    });
    return {
      'x': translation['x'] + entity['vertices'][vertex * 3],
      'y': translation['y'] + entity['vertices'][vertex * 3 + 1],
      'z': translation['z'] + entity['vertices'][vertex * 3 + 2],
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
      webgl_shaders[webgl_shader_active]['uniforms']['mat_perspectiveMatrix'],
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

// Required args: attributes, fragment, id, uniforms, vertex
function webgl_shader_create(args){
    const fragment = webgl.createShader(webgl.FRAGMENT_SHADER);
    webgl.shaderSource(
      fragment,
      args['fragment']
    );
    webgl.compileShader(fragment);
    const vertex = webgl.createShader(webgl.VERTEX_SHADER);
    webgl.shaderSource(
      vertex,
      args['vertex']
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
    const shader = {
      'attributes': {},
      'program': program,
      'uniforms': {},
    };

    for(const attribute in args['attributes']){
        shader['attributes'][args['attributes'][attribute]] = webgl.getAttribLocation(
          program,
          args['attributes'][attribute]
        );
        webgl.enableVertexAttribArray(shader[args['attributes'][attribute]]);
    }
    for(const uniform in args['uniforms']){
        shader['uniforms'][uniform] = webgl.getUniformLocation(
          program,
          args['uniforms'][uniform]
        );
    }

    webgl_shaders[args['id']] = shader;
}

function webgl_shader_use(id){
    webgl_shader_active = id;
    webgl.useProgram(webgl_shaders[id]['program']);
    webgl_resize();

    for(const entity in entity_entities){
        webgl_entity_buffer(entity);
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

    if(webgl_character_level(args['target']['id']) < 0
      && (args['stat'] === 'level-xp' || args['stat'] === 'life')){
        return;
    }

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
        args['target']['vertex-colors'] = core_type(args['value']) === 'array'
          ? args['value']
          : webgl_vertexcolorarray();
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

    if(args['stat'] === 'level-xp'){
        while(args['target']['level-xp'] >= Math.floor(args['target']['level'] + 1) * 1e3){
            args['target']['level-xp'] -= Math.floor(args['target']['level'] + 1) * 1e3;
            args['target']['level']++;
        }

    }else if(args['stat'] === 'life'){
        if(args['target']['life'] <= 0){
            args['target']['life'] = 0;

            if(args['target']['lives'] > 0){
                args['target']['lives']--;
            }

            if(args['target']['lives'] === 0){
                const axes = 'xyz';
                for(const axis in axes){
                    args['target']['change-rotate-' + axes[axis]] = 0;
                    args['target']['change-translate-' + axes[axis]] = 0;
                }
                args['target']['gravity'] = 0;
                entity_group_modify({
                  'groups': [
                    'webgl_characters_' + args['target']['id'],
                  ],
                  'todo': function(entity){
                       if(entity_groups['skybox'][entity]){
                           return;
                       }

                       entity_entities[entity]['attach-to'] = false;
                       for(const axis in axes){
                           entity_entities[entity]['translate-' + axes[axis]] = args['target']['translate-' + axes[axis]];
                       }
                  },
                });

            }else{
                webgl_character_spawn(args['target']['id']);
            }

        }else{
            args['target']['life'] = Math.min(
              args['target']['life'],
              args['target']['life-max']
            );
        }
    }
}

function webgl_texture_animate(id){
    if(!webgl_textures[id]['ready']){
        return;
    }

    const image = core_images[webgl_textures[id]['image']];
    const canvas = core_elements['texture-' + id].getContext('2d');
    const height = image['height'];
    const width = image['width'];

    let offset_x = webgl_textures[id]['offset-x'] + webgl_textures[id]['speed-x'];
    if(offset_x <= 0){
        offset_x = width;

    }else if(offset_x >= width){
        offset_x = 0;
    }
    webgl_textures[id]['offset-x'] = offset_x;
    let offset_y = webgl_textures[id]['offset-y'] + webgl_textures[id]['speed-y'];
    if(offset_y <= 0){
        offset_y = height;

    }else if(offset_y >= height){
        offset_y = 0;
    }
    webgl_textures[id]['offset-y'] = offset_y;

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

    for(const entity in entity_entities){
        if(entity_entities[entity]['texture'] === id){
            webgl.bindTexture(
              webgl.TEXTURE_2D,
              webgl_textures[entity_entities[entity]['texture']]['gl']
            );
            webgl.texImage2D(
              webgl.TEXTURE_2D,
              0,
              webgl.RGBA,
              webgl.RGBA,
              webgl.UNSIGNED_BYTE,
              core_elements['texture-' + entity_entities[entity]['texture']]
            );
            webgl.generateMipmap(webgl.TEXTURE_2D);
        }
    }
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
            webgl_textures[args['id']]['ready'] = false;
        }
        core_image({
          'id': image,
          'src': uris[image],
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
        webgl_textures[args['id']]['image'] = image;
        webgl_textures[args['id']]['offset-x'] = 0;
        webgl_textures[args['id']]['offset-y'] = 0;
        webgl_textures[args['id']]['speed-x'] = Number(split[1]);
        webgl_textures[args['id']]['speed-y'] = split.length > 2 ? Number(split[2]) : 0;
        webgl_textures[args['id']]['ready'] = true;
    }

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
    webgl_textures[args['id']]['gl'] = texture_gl;
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
    let tile_offset_x = prefab_args['translate-x'];
    let tile_offset_y = prefab_args['translate-y'];
    let tile_offset_z = prefab_args['translate-z'];
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
                if(points[point]['translate-x'] !== void 0){
                    point_object['translate-x'] = tile_offset_x + points[point]['translate-x'];
                }
                if(points[point]['translate-y'] !== void 0){
                    point_object['translate-y'] = tile_offset_y + points[point]['translate-y'];
                }
                if(points[point]['translate-z'] !== void 0){
                    point_object['translate-z'] = tile_offset_z + points[point]['translate-z'];
                }
                path_object['points'].push(point_object);
            }
            webgl_paths[prefix + path] = path_object;
        }

        for(const character in args['tiles'][tiles[tile]]['characters']){
            const character_object = args['tiles'][tiles[tile]]['characters'][character];
            webgl_character_init({
              ...character_object,
              'id': prefix + character_object['id'],
              'path-id': character_object['path-id'] !== ''
                ? prefix + character_object['path-id']
                : '',
              'translate-x': tile_offset_x + (character_object['translate-x'] || 0),
              'translate-y': tile_offset_y + (character_object['translate-y'] || 0),
              'translate-z': tile_offset_z + (character_object['translate-z'] || 0),
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
              'translate-x': (prefabs[prefab]['properties']['translate-x'] || 0) + (attached
                ? 0
                : tile_offset_x),
              'translate-y': (prefabs[prefab]['properties']['translate-y'] || 0) + (attached
                ? 0
                : tile_offset_y),
              'translate-z': (prefabs[prefab]['properties']['translate-z'] || 0) + (attached
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
    const uniforms = webgl_shaders['default']['uniforms'];
    webgl.uniform3f(
      uniforms['ambient-color'],
      webgl_properties['ambient-red'],
      webgl_properties['ambient-green'],
      webgl_properties['ambient-blue']
    );
    webgl.uniform3f(
      uniforms['clear-color'],
      webgl_properties['clearcolor-red'],
      webgl_properties['clearcolor-green'],
      webgl_properties['clearcolor-blue']
    );
    webgl.uniform1i(
      uniforms['directional'],
      webgl_properties['directional-state']
    );
    webgl.uniform3f(
      uniforms['directional-color'],
      webgl_properties['directional-red'],
      webgl_properties['directional-green'],
      webgl_properties['directional-blue']
    );
    webgl.uniform3fv(
      uniforms['directional-vector'],
      webgl_properties['directional-vector']
    );
    webgl.uniform1f(
      uniforms['fog-density'],
      webgl_properties['fog-density']
    );
    webgl.uniform1i(
      uniforms['fog-state'],
      webgl_properties['fog-state']
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
            webgl_characters[args['id']]['change-translate-' + axes[axis]] = 0;
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
core_image({
  'id': webgl_default_texture,
  'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
});
globalThis.webgl = 0;
globalThis.webgl_character_base_entities = [];
globalThis.webgl_character_base_properties = {};
globalThis.webgl_character_count = 0;
globalThis.webgl_character_id = '_me';
globalThis.webgl_characters = {};
globalThis.webgl_context_valid = true;
globalThis.webgl_particles = {};
globalThis.webgl_paths = {};
globalThis.webgl_properties = {};
globalThis.webgl_shader_active = false;
globalThis.webgl_shaders = {};
globalThis.webgl_textures = {};
