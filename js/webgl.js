'use strict';

// Required args: entity, to
// Optional args: offset-x, offset-y, offset-z, type
function webgl_attach(args){
    args = core_args({
      'args': args,
      'defaults': {
        'offset-x': 0,
        'offset-y': 0,
        'offset-z': 0,
        'type': 'entity',
      },
    });

    core_entities[args['entity']]['attach-offset-x'] = args['offset-x'];
    core_entities[args['entity']]['attach-offset-y'] = args['offset-y'];
    core_entities[args['entity']]['attach-offset-z'] = args['offset-z'];
    core_entities[args['entity']]['attach-to'] = args['to'];
    core_entities[args['entity']]['attach-type'] = args['type'];
}

// Required args: entity
// Optional args: axes, character
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
// Optional args: type
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
      || core_mouse['down']){
        webgl_camera_rotate({
          'character': webgl_characters[webgl_character_id]['camera-zoom-max'] === 0 || core_mouse['button'] === 2,
          'x': core_mouse['movement-y'] / 10,
          'y': core_mouse['movement-x'] / 10,
        });
    }
}

// Optional args: camera, character, character-id, x, xlock, y, z
function webgl_camera_rotate(args){
    args = core_args({
      'args': args,
      'defaults': {
        'camera': true,
        'character': true,
        'character-id': webgl_character_id,
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
        webgl_characters[args['character-id']][prefix + axis] = core_clamp({
          'max': 360,
          'min': 0,
          'value': core_round({
            'number': webgl_characters[args['character-id']][prefix + axis] + axes[axis],
          }),
          'wrap': true,
        });
    }

    if(args['xlock']){
        let max = webgl_characters[args['character-id']][prefix + 'x'] > 180
          ? 360
          : 89;
        webgl_characters[args['character-id']][prefix + 'x'] = core_clamp({
          'max': max,
          'min': max - 89,
          'value': webgl_characters[args['character-id']][prefix + 'x'],
        });
    }

    for(let axis in axes){
        webgl_characters[args['character-id']][prefix + 'radians-' + axis] = core_degrees_to_radians({
          'degrees': webgl_characters[args['character-id']][prefix + axis],
        });
    }

    if(args['camera']
      && args['character']){
        if(core_mouse['down']){
            webgl_characters[args['character-id']]['rotate-y'] = webgl_characters[args['character-id']]['camera-rotate-y'];
            webgl_characters[args['character-id']]['rotate-radians-y'] = webgl_characters[args['character-id']]['camera-rotate-radians-y'];

        }else{
            webgl_characters[args['character-id']]['rotate-y'] += args['y'];
            webgl_characters[args['character-id']]['rotate-radians-y'] = core_degrees_to_radians({
              'degrees': webgl_characters[args['character-id']]['rotate-y'],
            });
        }
    }
}

function webgl_camera_zoom(event){
    if(event.deltaY > 0){
        webgl_characters[webgl_character_id]['camera-zoom-current'] = Math.min(
          webgl_characters[webgl_character_id]['camera-zoom-current'] + 1,
          webgl_characters[webgl_character_id]['camera-zoom-max']
        );

    }else{
        webgl_characters[webgl_character_id]['camera-zoom-current'] = Math.max(
          webgl_characters[webgl_character_id]['camera-zoom-current'] - 1,
          0
        );
    }
}

// Optional args: character, damage, delete, kill
function webgl_character_damage(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'damage': '100',
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

    // Unattach all attached entities.
    for(let entity in core_entities){
        if(core_entities[entity]['attach-to'] !== args['character']){
            continue;
        }

        let axes = [
          'x',
          'y',
          'z',
        ];
        let target = webgl_characters[core_entities[entity]['attach-to']];

        for(let axis in axes){
            core_entities[entity]['translate-' + axes[axis]] = target['translate-' + axes[axis]] + core_entities[entity]['attach-offset-' + axes[axis]];
        }

        core_entities[entity]['attach-to'] = false;
    }

    if(args['delete']){
        delete webgl_characters[args['character']];
        return;
    }

    webgl_characters[args['character']]['health-current'] = 0;
}

function webgl_character_home(){
    if(webgl_character_homebase['entities'].length === 0){
        return;
    }

    webgl_level_unload();
    webgl_init({
      'ambient-blue': webgl_character_homebase['properties']['ambient-blue'],
      'ambient-green': webgl_character_homebase['properties']['ambient-green'],
      'ambient-red': webgl_character_homebase['properties']['ambient-red'],
      'clearcolor-blue': webgl_character_homebase['properties']['clearcolor-blue'],
      'clearcolor-green': webgl_character_homebase['properties']['clearcolor-green'],
      'clearcolor-red': webgl_character_homebase['properties']['clearcolor-red'],
      'directional-blue': webgl_character_homebase['properties']['directional-blue'],
      'directional-green': webgl_character_homebase['properties']['directional-green'],
      'directional-red': webgl_character_homebase['properties']['directional-red'],
      'directional-state': webgl_character_homebase['properties']['directional-state'],
      'directional-vector': webgl_character_homebase['properties']['directional-vector'],
      'fog-density': webgl_character_homebase['properties']['fog-density'],
      'fog-state': webgl_character_homebase['properties']['fog-state'],
      'gravity-acceleration': webgl_character_homebase['properties']['gravity-acceleration'],
      'gravity-max': webgl_character_homebase['properties']['gravity-max'],
      'multiplier-jump': webgl_character_homebase['properties']['multiplier-jump'],
      'multiplier-speed': webgl_character_homebase['properties']['multiplier-speed'],
      'spawn-rotate-x': webgl_character_homebase['properties']['spawn-rotate-x'],
      'spawn-rotate-y': webgl_character_homebase['properties']['spawn-rotate-y'],
      'spawn-rotate-z': webgl_character_homebase['properties']['spawn-rotate-z'],
      'spawn-translate-x': webgl_character_homebase['properties']['spawn-translate-x'],
      'spawn-translate-y': webgl_character_homebase['properties']['spawn-translate-y'],
      'spawn-translate-z': webgl_character_homebase['properties']['spawn-translate-z'],
    });
    webgl_entity_create({
      'entities': webgl_character_homebase['entities'],
    });
    webgl_character_spawn();
}

// Optional args: character
function webgl_character_jump(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    if(!webgl_characters[args['character']]['jump-allow']
      || args['character'] !== webgl_character_id
      || !core_keys[32]['state']
      || webgl_characters[webgl_character_id]['health-current'] <= 0){
        return;
    }

    webgl_characters[args['character']]['jump-allow'] = false;
    webgl_characters[args['character']]['dy'] = webgl_characters[args['character']]['jump-height'] * webgl_properties['multiplier-jump'];
}

// Optional args: character
function webgl_character_level(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    if(webgl_characters[args['character']]
      && 'level' in webgl_characters[args['character']]){
        return webgl_characters[args['character']]['level'];

    }else{
        return -2;
    }
}

// Optional args: character
function webgl_character_origin(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    webgl_entity_move_to();
    webgl_characters[args['character']]['camera-rotate-radians-x'] = 0;
    webgl_characters[args['character']]['camera-rotate-radians-y'] = 0;
    webgl_characters[args['character']]['camera-rotate-radians-z'] = 0;
    webgl_characters[args['character']]['camera-rotate-x'] = 0;
    webgl_characters[args['character']]['camera-rotate-y'] = 0;
    webgl_characters[args['character']]['camera-rotate-z'] = 0;
    webgl_characters[args['character']]['dx'] = 0;
    webgl_characters[args['character']]['dy'] = 0;
    webgl_characters[args['character']]['dz'] = 0;
    webgl_characters[args['character']]['rotate-radians-x'] = 0;
    webgl_characters[args['character']]['rotate-radians-y'] = 0;
    webgl_characters[args['character']]['rotate-radians-z'] = 0;
    webgl_characters[args['character']]['rotate-x'] = 0;
    webgl_characters[args['character']]['rotate-y'] = 0;
    webgl_characters[args['character']]['rotate-z'] = 0;
}

// Optional args: character
function webgl_character_spawn(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    webgl_character_origin({
      'character': args['character'],
    });
    webgl_entity_move_to({
      'x': webgl_properties['spawn-translate-x'],
      'y': webgl_properties['spawn-translate-y'],
      'z': webgl_properties['spawn-translate-z'],
    });
    webgl_camera_rotate({
      'x': webgl_properties['spawn-rotate-x'],
      'y': webgl_properties['spawn-rotate-y'],
      'z': webgl_properties['spawn-rotate-z'],
    });

    webgl_characters[args['character']]['jump-allow'] = false;
}

// Optional args: blue, green, red
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

// Required args: target
// Optional args: character, character-id, entity
function webgl_collision(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': true,
        'character-id': webgl_character_id,
        'entity': false,
      },
    });

    let collider = args['character']
      ? webgl_characters[args['character-id']]
      : core_entities[args['entity']];
    let collision = false;
    let collision_sign = 1;
    let target = core_entities[args['target']];

    if(target['normals'][0] !== 0){
        if(target['normals'][0] === 1
          && collider['dx'] < 0){
            if(collider['translate-x'] >= target['translate-x']
              && collider['translate-x'] <= target['translate-x'] + collider['collide-range']
              && collider['translate-y'] > target['translate-y'] + target['vertices'][4] - collider['collide-range']
              && collider['translate-y'] < target['translate-y'] + target['vertices'][0] + collider['collide-range']
              && collider['translate-z'] >= target['translate-z'] + target['vertices'][2] - collider['collide-range']
              && collider['translate-z'] <= target['translate-z'] + target['vertices'][10] + collider['collide-range']){
                collision = 'x';
                collider['dx'] = 0;
            }

        }else if(target['normals'][0] === -1
          && collider['dx'] > 0){
            if(collider['translate-x'] >= target['translate-x'] - collider['collide-range']
              && collider['translate-x'] <= target['translate-x']
              && collider['translate-y'] > target['translate-y'] + target['vertices'][4] - collider['collide-range']
              && collider['translate-y'] < target['translate-y'] + target['vertices'][0] + collider['collide-range']
              && collider['translate-z'] >= target['translate-z'] + target['vertices'][2] - collider['collide-range']
              && collider['translate-z'] <= target['translate-z'] + target['vertices'][10] + collider['collide-range']){
                collision = 'x';
                collision_sign = -1;
                collider['dx'] = 0;
            }
        }
    }

    if(target['normals'][1] !== 0){
        if(target['normals'][1] === 1
          && collider['dy'] < 0){
            if(collider['translate-x'] >= target['translate-x'] + target['vertices'][4] - collider['collide-range']
              && collider['translate-x'] <= target['translate-x'] + target['vertices'][0] + collider['collide-range']
              && collider['translate-y'] >= target['translate-y']
              && collider['translate-y'] <= target['translate-y'] + collider['collide-range']
              && collider['translate-z'] >= target['translate-z'] + target['vertices'][2] - collider['collide-range']
              && collider['translate-z'] <= target['translate-z'] + target['vertices'][10] + collider['collide-range']){
                collision = 'y';
                collider['dy'] = 0;
            }

        }else if(target['normals'][1] === -1
          && collider['dy'] > 0){
            if(collider['translate-x'] >= target['translate-x'] + target['vertices'][4] - collider['collide-range']
              && collider['translate-x'] <= target['translate-x'] + target['vertices'][0] + collider['collide-range']
              && collider['translate-y'] >= target['translate-y'] - collider['collide-range']
              && collider['translate-y'] <= target['translate-y']
              && collider['translate-z'] >= target['translate-z'] + target['vertices'][2] - collider['collide-range']
              && collider['translate-z'] <= target['translate-z'] + target['vertices'][10] + collider['collide-range']){
                collision = 'y';
                collision_sign = -1;
                collider['dy'] = 0;
            }
        }
    }

    if(target['normals'][2] !== 0){
        if(target['normals'][2] === 1
          && collider['dz'] < 0){
            if(collider['translate-x'] >= target['translate-x'] + target['vertices'][4] - collider['collide-range']
              && collider['translate-x'] <= target['translate-x'] + target['vertices'][0] + collider['collide-range']
              && collider['translate-y'] > target['translate-y'] + target['vertices'][2] - collider['collide-range']
              && collider['translate-y'] < target['translate-y'] + target['vertices'][10] + collider['collide-range']
              && collider['translate-z'] >= target['translate-z']
              && collider['translate-z'] <= target['translate-z'] + collider['collide-range']){
                collision = 'z';
                collider['dz'] = 0;
            }

        }else if(target['normals'][2] === -1
          && collider['dz'] > 0){
            if(collider['translate-x'] >= target['translate-x'] + target['vertices'][4] - collider['collide-range']
              && collider['translate-x'] <= target['translate-x'] + target['vertices'][0] + collider['collide-range']
              && collider['translate-y'] > target['translate-y'] + target['vertices'][2] - collider['collide-range']
              && collider['translate-y'] < target['translate-y'] + target['vertices'][10] + collider['collide-range']
              && collider['translate-z'] >= target['translate-z'] - collider['collide-range']
              && collider['translate-z'] <= target['translate-z']){
                collision = 'z';
                collision_sign = -1;
                collider['dz'] = 0;
            }
        }
    }

    if(collision !== false){
        if(args['character']){
            webgl_characters[args['character-id']]['dx'] = collider['dx'];
            webgl_characters[args['character-id']]['dy'] = collider['dy'];
            webgl_characters[args['character-id']]['dz'] = collider['dz'];

            webgl_characters[args['character-id']]['translate-' + collision] = target['translate-' + collision] + (collider['collide-range'] * collision_sign);

            if(webgl_character_level({
                'character': args['character-id']
              }) > -1){
                if(collision === 'y'
                  && collision_sign === 1){
                    webgl_characters[args['character-id']]['jump-allow'] = webgl_characters[args['character-id']]['dy'] === 0;
                }

                if(target['item'] !== false){
                    if(!(target['item'] in webgl_characters[args['character-id']]['inventory'])){
                        webgl_characters[args['character-id']]['inventory'][target['item']] = 0;
                    }

                    webgl_characters[args['character-id']]['inventory'][target['item']]++;

                    core_entity_remove({
                      'entities': [
                        args['target'],
                      ],
                    });

                    return false;
                }

            }else if(target['collide-damage'] !== 0){
                webgl_character_damage({
                  'character': args['character-id'],
                  'damage': target['collide-damage'],
                });
            }

        }else if(core_groups['particles'][args['entity']]){
            core_entity_remove({
              'entities': [
                args['entity'],
              ],
            });

            return false;

        }else{
            core_entities[args['entity']]['dx'] = collider['dx'];
            core_entities[args['entity']]['dy'] = collider['dy'];
            core_entities[args['entity']]['dz'] = collider['dz'];

            core_entities[args['entity']]['translate-' + collision] = target['translate-' + collision] + (collide_range * collision_sign);
        }
    }

    return true;
}

// Optional args: collision, exclude, height, length, prefix, translate-x, translate-y, translate-z,
//   vertex-colors-all, vertex-colors-back, vertex-colors-bottom, vertex-colors-front, vertex-colors-left,
//   vertex-colors-right, vertex-colors-top, width
function webgl_cuboid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'collision': false,
        'exclude': {},
        'height': 1,
        'length': 1,
        'prefix': core_uid(),
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'vertex-colors-all': false,
        'vertex-colors-back': webgl_vertexcolorarray(),
        'vertex-colors-bottom': webgl_vertexcolorarray(),
        'vertex-colors-front': webgl_vertexcolorarray(),
        'vertex-colors-left': webgl_vertexcolorarray(),
        'vertex-colors-right': webgl_vertexcolorarray(),
        'vertex-colors-top': webgl_vertexcolorarray(),
        'width': 1,
      },
    });

    let half_height = args['height'] / 2;
    let half_length = args['length'] / 2;
    let half_width = args['width'] / 2;
    let properties = {
      'collision': args['collision'],
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'],
      'translate-z': args['translate-z'],
    };

    if(args['vertex-colors-all'] !== false){
        args['vertex-colors-back'] = args['vertex-colors-all'];
        args['vertex-colors-bottom'] = args['vertex-colors-all'];
        args['vertex-colors-front'] = args['vertex-colors-all'];
        args['vertex-colors-left'] = args['vertex-colors-all'];
        args['vertex-colors-right'] = args['vertex-colors-all'];
        args['vertex-colors-top'] = args['vertex-colors-all'];
    }

    // Top.
    properties['translate-y'] = args['translate-y'] + half_height;
    properties['vertices'] = [
      half_width, 0, -half_length, 1,
      -half_width, 0, -half_length, 1,
      -half_width, 0, half_length, 1,
      half_width, 0, half_length, 1
    ];
    if(args['exclude']['top'] !== true){
        properties['vertex-colors'] = args['vertex-colors-top'];
        core_entity_create({
          'id': args['prefix'] + '-top',
          'properties': properties,
        });
    }

    // Bottom.
    properties['rotate-x'] = 180;
    properties['translate-y'] = args['translate-y'] - half_height;
    if(args['exclude']['bottom'] !== true){
        properties['vertex-colors'] = args['vertex-colors-bottom'];
        core_entity_create({
          'id': args['prefix'] + '-bottom',
          'properties': properties,
        });
    }

    // Front.
    properties['rotate-x'] = 90;
    properties['translate-y'] = args['translate-y'];
    properties['translate-z'] = args['translate-z'] + half_length;
    properties['vertices'] = [
      half_width, 0, -half_height, 1,
      -half_width, 0, -half_height, 1,
      -half_width, 0, half_height, 1,
      half_width, 0, half_height, 1
    ];
    if(args['exclude']['front'] !== true){
        properties['vertex-colors'] = args['vertex-colors-front'];
        core_entity_create({
          'id': args['prefix'] + '-front',
          'properties': properties,
        });
    }

    // Back.
    properties['rotate-x'] = 270;
    properties['translate-z'] = args['translate-z'] - half_length;
    if(args['exclude']['back'] !== true){
        properties['vertex-colors'] = args['vertex-colors-back'];
        core_entity_create({
          'id': args['prefix'] + '-back',
          'properties': properties,
        });
    }

    // Left.
    properties['rotate-x'] = 0;
    properties['rotate-z'] = 90;
    properties['translate-x'] = args['translate-x'] - half_width;
    properties['translate-z'] = args['translate-z'];
    properties['vertices'] = [
      half_height, 0, -half_length, 1,
      -half_height, 0, -half_length, 1,
      -half_height, 0, half_length, 1,
      half_height, 0, half_length, 1
    ];
    if(args['exclude']['left'] !== true){
        properties['vertex-colors'] = args['vertex-colors-left'];
        core_entity_create({
          'id': args['prefix'] + '-left',
          'properties': properties,
        });
    }

    // Right.
    properties['rotate-z'] = 270;
    properties['translate-x'] = args['translate-x'] + half_width;
    if(args['exclude']['right'] !== true){
        properties['vertex-colors'] = args['vertex-colors-right'];
        core_entity_create({
          'id': args['prefix'] + '-right',
          'properties': properties,
        });
    }
}

// Optional args: collision-leaves, collision-trunk, height-leaves, height-trunk,
//   length-leaves, length-trunk, prefix, translate-x, translate-y, translate-z,
//   vertex-colors-leaves, vertex-colors-trunk, width-leaves, width-trunk
function webgl_cuboid_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'collision-leaves': false,
        'collision-trunk': false,
        'height-leaves': 10,
        'height-trunk': 10,
        'length-leaves': 10,
        'length-trunk': 2,
        'prefix': core_uid(),
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
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
        'width-leaves': 10,
        'width-trunk': 2,
      },
    });

    webgl_cuboid({
      'collision': args['collision-trunk'],
      'exclude': {
        'bottom': true,
        'top': true,
      },
      'height': args['height-trunk'],
      'length': args['length-trunk'],
      'prefix': args['prefix'] + '-trunk',
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'] + args['height-trunk'] / 2,
      'translate-z': args['translate-z'],
      'vertex-colors-all': args['vertex-colors-trunk'],
      'width': args['width-trunk'],
    });
    webgl_cuboid({
      'collision': args['collision-leaves'],
      'height': args['height-leaves'],
      'length': args['length-leaves'],
      'prefix': args['prefix'] + '-leaves',
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'] + args['height-trunk'] + args['height-leaves'] / 2,
      'translate-z': args['translate-z'],
      'vertex-colors-all': args['vertex-colors-leaves'],
      'width': args['width-leaves'],
    });
}

function webgl_draw(){
    webgl_buffer.clear(webgl_buffer.COLOR_BUFFER_BIT | webgl_buffer.DEPTH_BUFFER_BIT);

    webgl_buffer.uniformMatrix4fv(
      webgl_properties['shader']['mat_perspectiveMatrix'],
      false,
      core_matrices['perspective']
    );

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

    if(webgl_characters[webgl_character_id]['camera-zoom-current'] === 0){
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

    if(core_entities[entity]['billboard'] !== false){
        webgl_billboard({
          'axes': core_entities[entity]['billboard'],
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
    if(core_entities[entity]['attach-to'] !== false){
        if(core_entities[entity]['attach-type'] === 'character'){
            if(!core_groups['skybox'][entity]){
                core_matrix_rotate({
                  'dimensions': [
                    webgl_characters[core_entities[entity]['attach-to']]['rotate-radians-x'],
                    -webgl_characters[core_entities[entity]['attach-to']]['rotate-radians-y'],
                    webgl_characters[core_entities[entity]['attach-to']]['rotate-radians-z'],
                  ],
                  'id': 'camera',
                });
            }

        }else{
            core_matrix_rotate({
              'dimensions': [
                core_entities[core_entities[entity]['attach-to']]['rotate-radians-x'],
                core_entities[core_entities[entity]['attach-to']]['rotate-radians-y'],
                core_entities[core_entities[entity]['attach-to']]['rotate-radians-z'],
              ],
              'id': 'camera',
            });
        }
    }
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
    webgl_buffer.uniform1f(
      webgl_properties['shader']['point-size'],
      core_entities[entity]['draw-type'] === 'POINTS'
        ? 500 / core_distance({
            'x0': webgl_characters[webgl_character_id]['translate-x'],
            'y0': webgl_characters[webgl_character_id]['translate-y'],
            'z0': webgl_characters[webgl_character_id]['translate-z'],
            'x1': core_entities[entity]['translate-x'],
            'y1': core_entities[entity]['translate-y'],
            'z1': core_entities[entity]['translate-z'],
          })
        : 1
    );
    webgl_buffer.uniformMatrix4fv(
      webgl_properties['shader']['mat_cameraMatrix'],
      false,
      core_matrices['camera']
    );

    webgl_buffer.drawArrays(
      webgl_buffer[core_entities[entity]['draw-type']],
      0,
      core_entities[entity]['vertices-length']
    );

    core_matrix_copy({
      'id': 'cache',
      'to': 'camera',
    });
}

function webgl_drawloop(){
    if(!core_menu_open){
        webgl_draw();
    }
    core_interval_animationFrame({
      'id': 'webgl-animationFrame',
    });
}

// Optional args: entities
function webgl_entity_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'entities': [],
      },
    });

    for(let entity in args['entities']){
        core_entity_create({
          'id': args['entities'][entity]['id'],
          'properties': args['entities'][entity],
          'types': args['entities'][entity]['types'],
        });

        let attach = false;
        let attach_type = 'entity';

        if(args['entities'][entity]['skybox'] === true){
            core_group_move({
              'entities': [
                args['entities'][entity]['id'],
              ],
              'from': 'foreground',
              'to': 'skybox',
            });
            attach = webgl_character_id;
            attach_type = 'character';

        }else if(args['entities'][entity]['attach-to'] !== void 0){
            attach = args['entities'][entity]['attach-to'];
        }

        if(attach !== false){
            webgl_attach({
              'entity': args['entities'][entity]['id'],
              'offset-x': args['entities'][entity]['attach-offset-x'],
              'offset-y': args['entities'][entity]['attach-offset-y'],
              'offset-z': args['entities'][entity]['attach-offset-z'],
              'to': attach,
              'type': attach_type,
            });
        }
    }

    for(let character in webgl_characters){
        if(webgl_characters[character]['health-current'] <= 0){
            webgl_characters[character]['health-current'] = 1;
        }

        for(let entity in webgl_characters[character]['entities']){
            core_entity_create({
              'id': webgl_characters[character]['entities'][entity]['id'],
              'properties': webgl_characters[character]['entities'][entity],
              'types': webgl_characters[character]['entities'][entity]['types'],
            });
            webgl_attach({
              'entity': webgl_characters[character]['entities'][entity]['id'],
              'offset-x': webgl_characters[character]['entities'][entity]['attach-offset-x'],
              'offset-y': webgl_characters[character]['entities'][entity]['attach-offset-y'],
              'offset-z': webgl_characters[character]['entities'][entity]['attach-offset-z'],
              'to': character,
              'type': 'character',
            });
        }
    }
}

// Optional args: entity, multiplier, strafe, y
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

    if(args['entity'] === false){
        if(webgl_character_level({
          'character': args['character'],
        }) > -1){
            args['multiplier'] *= webgl_properties['multiplier-speed'];
        }

        if(args['y']){
            let dy = webgl_characters[args['character']]['speed'] * args['multiplier'];
            dy *= args['strafe']
              ? -1
              : 1;
            webgl_characters[args['character']]['dy'] += dy;

        }else{
            let movement = core_move_3d({
              'angle': webgl_characters[args['character']]['rotate-y'],
              'speed': webgl_characters[args['character']]['speed'] * args['multiplier'],
              'strafe': args['strafe'],
            });
            webgl_characters[args['character']]['dx'] += movement['x'];
            webgl_characters[args['character']]['dz'] += movement['z'];
        }

        return;
    }

    if(args['y']){
        let dy = core_entities[args['entity']]['speed'] * args['multiplier'];
        dy *= args['strafe']
          ? -1
          : 1;
        core_entities[args['entity']]['dy'] = dy;

    }else{
        let movement = core_move_3d({
          'angle': core_entities[args['entity']]['rotate-y'],
          'speed': core_entities[args['entity']]['speed'] * args['multiplier'],
          'strafe': args['strafe'],
        });
        core_entities[args['entity']]['dx'] = movement['x'];
        core_entities[args['entity']]['dz'] = movement['z'];
    }
}

// Optional args: entity, x, y, z
function webgl_entity_move_to(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'entity': false,
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    if(args['entity'] === false){
        webgl_characters[args['character']]['translate-x'] = args['x'];
        webgl_characters[args['character']]['translate-y'] = args['y'];
        webgl_characters[args['character']]['translate-z'] = args['z'];

        return;
    }

    core_entities[args['entity']]['translate-x'] = args['x'];
    core_entities[args['entity']]['translate-y'] = args['y'];
    core_entities[args['entity']]['translate-z'] = args['z'];
}

// Required args: entity
function webgl_entity_radians(args){
    core_entities[args['entity']]['rotate-radians-x'] = core_degrees_to_radians({
      'degrees': core_entities[args['entity']]['rotate-x'],
    });
    core_entities[args['entity']]['rotate-radians-y'] = core_degrees_to_radians({
      'degrees': core_entities[args['entity']]['rotate-y'],
    });
    core_entities[args['entity']]['rotate-radians-z'] = core_degrees_to_radians({
      'degrees': core_entities[args['entity']]['rotate-z'],
    });
}

function webgl_entity_todo(entity){
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

    if(!core_entities[entity]['draw']){
        return;
    }

    core_entities[entity]['buffer'] = webgl_buffer_set({
      'colorData': core_entities[entity]['vertex-colors'],
      'normalData': core_entities[entity]['normals'],
      'textureData': core_entities[entity]['textureData'],
      'vertexData': core_entities[entity]['vertices'],
    });

    webgl_texture_set({
      'entityid': entity,
      'image': webgl_textures[core_entities[entity]['texture']],
    });
}

// Optional args: ambient-blue, ambient-green, ambient-red,
//   clearcolor-blue, clearcolor-green, clearcolor-red, directional-blue, directional-green,
//   directional-red, directional-state, directional-vector, fog-density, fog-state,
//   gravity-acceleration, gravity-max, multiplier-jump, multiplier-speed, spawn-rotate-x,
//   spawn-rotate-y, spawn-rotate-z, spawn-translate-x, spawn-translate-y, spawn-translate-z
function webgl_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'ambient-blue': 1,
        'ambient-green': 1,
        'ambient-red': 1,
        'clearcolor-blue': 0,
        'clearcolor-green': 0,
        'clearcolor-red': 0,
        'directional-blue': 1,
        'directional-green': 1,
        'directional-red': 1,
        'directional-state': true,
        'directional-vector': "0, 1, 0",
        'fog-density': .0001,
        'fog-state': false,
        'gravity-acceleration': -.05,
        'gravity-max': -1,
        'multiplier-jump': 1,
        'multiplier-speed': 1,
        'spawn-rotate-x': 0,
        'spawn-rotate-y': 0,
        'spawn-rotate-z': 0,
        'spawn-translate-x': 0,
        'spawn-translate-y': 0,
        'spawn-translate-z': 0,
      },
    });

    webgl_properties = {
      'ambient-blue': args['ambient-blue'],
      'ambient-green': args['ambient-green'],
      'ambient-red': args['ambient-red'],
      'attributes': {},
      'canvas': {
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
      'gravity-max': args['gravity-max'],
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

    webgl_diagonal = Math.sin(core_degrees_to_radians({
      'degrees': 45,
    })) / Math.sin(core_degrees_to_radians({
      'degrees': 90,
    }))

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

    webgl_shader_update();

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
        'attach-type': 'entity',
        'billboard': false,
        'collide-damage': 0,
        'collide-range': 2.5,
        'collides': false,
        'collision': false,
        'draw': true,
        'draw-type': 'TRIANGLE_FAN',
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'gravity': false,
        'item': false,
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
        'spawn-entity': false,
        'spawn-interval-current': 0,
        'spawn-interval-max': 100,
        'speed': .2,
        'texture': '_default',
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

// Optional args: camera-zoom-current, camera-zoom-max, collide-range, collides, dx, dy, dz,
//   entities, experience, health-current, health-max, id, inventory, jump-height, level, speed
function webgl_init_character(args){
    args = core_args({
      'args': args,
      'defaults': {
        'camera-zoom-current': 20,
        'camera-zoom-max': 50,
        'collide-range': 2.5,
        'collides': true,
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'entities': [],
        'experience': 0,
        'health-current': 100,
        'health-max': 100,
        'id': webgl_character_id,
        'inventory': false,
        'jump-height': .6,
        'level': -1,
        'speed': .2,
      },
    });

    webgl_characters[args['id']] = {
      'camera-rotate-radians-x': 0,
      'camera-rotate-radians-y': 0,
      'camera-rotate-radians-z': 0,
      'camera-rotate-x': 0,
      'camera-rotate-y': 0,
      'camera-rotate-z': 0,
      'camera-zoom-current': args['camera-zoom-current'],
      'camera-zoom-max': args['camera-zoom-max'],
      'collide-range': args['collide-range'],
      'collides': args['collides'],
      'dx': args['dx'],
      'dy': args['dy'],
      'dz': args['dz'],
      'entities': args['entities'],
      'experience': args['experience'],
      'health-current': args['health-current'],
      'health-max': args['health-max'],
      'inventory': {},
      'jump-allow': false,
      'jump-height': args['jump-height'],
      'level': args['level'],
      'rotate-radians-x': 0,
      'rotate-radians-y': 0,
      'rotate-radians-z': 0,
      'rotate-x': 0,
      'rotate-y': 0,
      'rotate-z': 0,
      'speed': args['speed'],
      'translate-x': 0,
      'translate-y': 0,
      'translate-z': 0,
    };
    if(args['inventory'] !== false){
        Object.assign(
          webgl_characters[args['id']]['inventory'],
          args['inventory']
        );
    }
}

// Optional args: character, target
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
            delete entity_json['image'];
            delete entity_json['normals'];
            delete entity_json['rotate-radians-x'];
            delete entity_json['rotate-radians-y'];
            delete entity_json['rotate-radians-z'];
            delete entity_json['texture-gl'];
            delete entity_json['textureData'];
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
            delete entity_json['image'];
            delete entity_json['normals'];
            delete entity_json['rotate-radians-x'];
            delete entity_json['rotate-radians-y'];
            delete entity_json['rotate-radians-z'];
            delete entity_json['texture-gl'];
            delete entity_json['textureData'];
            delete entity_json['vertices-length'];

            json['entities'].push(entity_json);
        }
    }

    document.getElementById(args['target']).value = JSON.stringify(json);
}

// Optional args: character, json
function webgl_level_load(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': 0,
        'json': false,
      },
    });

    if(typeof args['json'] === 'object'){
        let filereader = new FileReader();
        filereader.onload = function(event){
            webgl_level_init({
              'character': args['character'],
              'json': JSON.parse(event.target.result),
            });
        };
        filereader.readAsText(args['json']);

        return;
    }

    webgl_level_init({
      'character': args['character'],
      'json': JSON.parse(args['json']),
    });
}

// Required args: character
// Optional args: json
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

    if(args['character'] === 1
      && (!args['json']['characters']
        || args['json']['characters'][0]['id'] !== webgl_character_id)){
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

    webgl_init({
      'ambient-blue': args['json']['ambient-blue'],
      'ambient-green': args['json']['ambient-green'],
      'ambient-red': args['json']['ambient-red'],
      'clearcolor-blue': args['json']['clearcolor-blue'],
      'clearcolor-green': args['json']['clearcolor-green'],
      'clearcolor-red': args['json']['clearcolor-red'],
      'directional-blue': args['json']['directional-blue'],
      'directional-green': args['json']['directional-green'],
      'directional-red': args['json']['directional-red'],
      'directional-state': args['json']['directional-state'],
      'directional-vector': args['json']['directional-vector'],
      'fog-density': args['json']['fog-density'],
      'fog-state': args['json']['fog-state'],
      'gravity-acceleration': args['json']['gravity-acceleration'],
      'gravity-max': args['json']['gravity-max'],
      'multiplier-jump': args['json']['multiplier-jump'],
      'multiplier-speed': args['json']['multiplier-speed'],
      'spawn-rotate-x': args['json']['spawn-rotate-x'],
      'spawn-rotate-y': args['json']['spawn-rotate-y'],
      'spawn-rotate-z': args['json']['spawn-rotate-z'],
      'spawn-translate-x': args['json']['spawn-translate-x'],
      'spawn-translate-y': args['json']['spawn-translate-y'],
      'spawn-translate-z': args['json']['spawn-translate-z'],
    });

    if(args['character'] === -1){
        webgl_init_character({
          'camera-zoom-current': 0,
          'camera-zoom-max': 0,
          'entities': [],
          'id': webgl_character_id,
        });
        webgl_character_homebase = {};
    }

    if(args['json']['characters']
      && args['json']['characters'] !== false){
        for(let character in args['json']['characters']){
            if(args['json']['characters'][character]['id'] === webgl_character_id
              && args['character'] !== 1
              && webgl_character_level() > -2){
                continue;
            }

            webgl_init_character({
              'camera-zoom-current': args['json']['characters'][character]['camera-zoom-current'],
              'camera-zoom-max': args['json']['characters'][character]['camera-zoom-max'],
              'collide-range': args['json']['characters'][character]['collide-range'],
              'collides': args['json']['characters'][character]['collides'],
              'dx': args['json']['characters'][character]['dx'],
              'dy': args['json']['characters'][character]['dy'],
              'dz': args['json']['characters'][character]['dz'],
              'entities': args['json']['characters'][character]['entities'],
              'experience': args['json']['characters'][character]['experience'],
              'health-current': args['json']['characters'][character]['health-current'],
              'health-max': args['json']['characters'][character]['health-max'],
              'id': args['json']['characters'][character]['id'],
              'inventory': args['json']['characters'][character]['inventory'],
              'jump-height': args['json']['characters'][character]['jump-height'],
              'level': args['json']['characters'][character]['level'],
              'speed': args['json']['characters'][character]['speed'],
            });

            if(args['json']['characters'][character]['id'] === webgl_character_id){
                webgl_character_homebase['entities'] = args['json']['entities'];
                webgl_character_homebase['properties'] = webgl_properties;
            }
        }

    }else if(!webgl_characters[webgl_character_id]){
        webgl_init_character({
          'level': args['character'],
        });
    }

    for(let cuboid in args['json']['cuboids']){
        if(args['json']['cuboids'][cuboid]['tree'] === true){
            webgl_cuboid_tree({
              'collision-leaves': args['json']['cuboids'][cuboid]['collision'],
              'collision-trunk': args['json']['cuboids'][cuboid]['collision'],
              'height-leaves': args['json']['cuboids'][cuboid]['height'],
              'height-trunk': args['json']['cuboids'][cuboid]['height'],
              'length-leaves': args['json']['cuboids'][cuboid]['length'],
              'length-trunk': args['json']['cuboids'][cuboid]['length'] / 5,
              'prefix': args['json']['cuboids'][cuboid]['prefix'],
              'translate-x': args['json']['cuboids'][cuboid]['translate-x'],
              'translate-y': args['json']['cuboids'][cuboid]['translate-y'],
              'translate-z': args['json']['cuboids'][cuboid]['translate-z'],
              'width-leaves': args['json']['cuboids'][cuboid]['width'],
              'width-trunk': args['json']['cuboids'][cuboid]['width'] / 5,
            });

        }else{
            webgl_cuboid({
              'collision': args['json']['cuboids'][cuboid]['collision'],
              'exclude': args['json']['cuboids'][cuboid]['exclude'],
              'height': args['json']['cuboids'][cuboid]['height'],
              'length': args['json']['cuboids'][cuboid]['length'],
              'prefix': args['json']['cuboids'][cuboid]['prefix'],
              'translate-x': args['json']['cuboids'][cuboid]['translate-x'],
              'translate-y': args['json']['cuboids'][cuboid]['translate-y'],
              'translate-z': args['json']['cuboids'][cuboid]['translate-z'],
              'vertex-colors-all': args['json']['cuboids'][cuboid]['vertex-colors-all'],
              'vertex-colors-back': args['json']['cuboids'][cuboid]['vertex-colors-back'],
              'vertex-colors-bottom': args['json']['cuboids'][cuboid]['vertex-colors-bottom'],
              'vertex-colors-front': args['json']['cuboids'][cuboid]['vertex-colors-front'],
              'vertex-colors-left': args['json']['cuboids'][cuboid]['vertex-colors-left'],
              'vertex-colors-right': args['json']['cuboids'][cuboid]['vertex-colors-right'],
              'vertex-colors-top': args['json']['cuboids'][cuboid]['vertex-colors-top'],
              'width': args['json']['cuboids'][cuboid]['width'],
            });
        }
    }

    webgl_entity_create({
      'entities': args['json']['entities'],
    });

    webgl_character_spawn();
    core_call({
      'todo': 'repo_level_load',
    });
    core_escape();
}

function webgl_level_unload(){
    for(let character in webgl_characters){
        if(character !== webgl_character_id){
            delete webgl_characters[character];
        }
    }
    core_entity_remove_all();
    core_storage_save();
}

function webgl_logicloop(){
    if(webgl_character_level() > -2
      && webgl_characters[webgl_character_id]['health-current'] > 0){
        let leftright = 0;

        if(core_keys[core_storage_data['move-←']]['state']){
            if(webgl_characters[webgl_character_id]['camera-zoom-max'] === 0
              || (core_mouse['down']
              && core_mouse['button'] === 2)){
                leftright -= 1;

            }else{
                webgl_camera_rotate({
                  'camera': !(core_mouse['down']
                    && core_mouse['button'] === 0),
                  'y': -5,
                });
            }
        }

        if(core_keys[core_storage_data['move-→']]['state']){
            if(webgl_characters[webgl_character_id]['camera-zoom-max'] === 0
              || (core_mouse['down']
              && core_mouse['button'] === 2)){
                leftright += 1;

            }else{
                webgl_camera_rotate({
                  'camera': !(core_mouse['down']
                    && core_mouse['button'] === 0),
                  'y': 5,
                });
            }
        }

        if(webgl_character_level() === -1
          || (webgl_characters[webgl_character_id]['jump-allow']
            && webgl_characters[webgl_character_id]['dy'] === 0)){
            let forwardback = 0;

            if(core_keys[core_storage_data['move-↓']]['state']){
                forwardback = .5;
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
            }

            if(forwardback !== 0
              && leftright !== 0){
                forwardback *= webgl_diagonal;
                leftright *= webgl_diagonal;
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

    for(let character in webgl_characters){
        if(webgl_character_level({
          'character': character
        }) > -1){
            webgl_characters[character]['dy'] = Math.max(
              webgl_characters[character]['dy'] + webgl_properties['gravity-acceleration'],
              webgl_properties['gravity-max']
            );

            webgl_character_jump({
              'character': character,
            });
        }

        if(webgl_characters[character]['collides']){
            for(let entity in core_entities){
                if(core_entities[entity]['collision']){
                    webgl_collision({
                      'character': true,
                      'character-id': character,
                      'target': entity,
                    });
                }
            }
        }
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
                      'character': character
                    }) < 0){
                      continue;
                  }

                  if(core_distance({
                    'x0': webgl_characters[character]['translate-x'],
                    'y0': webgl_characters[character]['translate-y'],
                    'z0': webgl_characters[character]['translate-z'],
                    'x1': core_entities[entity]['translate-x'],
                    'y1': core_entities[entity]['translate-y'],
                    'z1': core_entities[entity]['translate-z'],
                  }) < webgl_characters[character]['collide-range']){
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
        webgl_characters[character]['translate-x'] = core_round({
          'number': webgl_characters[character]['translate-x'] + webgl_characters[character]['dx'],
        });
        webgl_characters[character]['translate-y'] = core_round({
          'number': webgl_characters[character]['translate-y'] + webgl_characters[character]['dy'],
        });
        webgl_characters[character]['translate-z'] = core_round({
          'number': webgl_characters[character]['translate-z'] + webgl_characters[character]['dz'],
        });
    }

    if(webgl_character_level() === -1){
        webgl_characters[webgl_character_id]['dx'] = 0;
        webgl_characters[webgl_character_id]['dy'] = 0;
        webgl_characters[webgl_character_id]['dz'] = 0;

    }else if(webgl_characters[webgl_character_id]['jump-allow']
      && webgl_characters[webgl_character_id]['dy'] === 0){
        webgl_characters[webgl_character_id]['dx'] = 0;
        webgl_characters[webgl_character_id]['dz'] = 0;
    }

    core_matrix_identity({
      'id': 'camera',
    });
    core_matrix_translate({
      'dimensions': [
        0,
        0,
        webgl_characters[webgl_character_id]['camera-zoom-current'],
      ],
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
        webgl_characters[webgl_character_id]['translate-x'],
        webgl_characters[webgl_character_id]['translate-y'],
        webgl_characters[webgl_character_id]['translate-z'],
      ],
      'id': 'camera',
    });
}

function webgl_logicloop_handle_entity(entity){
    if(core_entities[entity]['logic']){
        core_entities[entity]['logic']();
    }

    if(core_entities[entity]['attach-to'] !== false){
        let target = core_entities[entity]['attach-type'] === 'character'
          ? webgl_characters[core_entities[entity]['attach-to']]
          : core_entities[core_entities[entity]['attach-to']];

        core_entities[entity]['translate-x'] = target['translate-x'] + target['dx']
          + core_entities[entity]['attach-offset-x'];
        core_entities[entity]['translate-y'] = target['translate-y'] + target['dy']
          + core_entities[entity]['attach-offset-y'];
        core_entities[entity]['translate-z'] = target['translate-z'] + target['dz']
          + core_entities[entity]['attach-offset-z'];

        return;
    }

    if(core_entities[entity]['gravity']){
        core_entities[entity]['dy'] = Math.max(
          core_entities[entity]['dy'] + webgl_properties['gravity-acceleration'],
          webgl_properties['gravity-max']
        );
    }

    if(core_entities[entity]['collides']){
        for(let other_entity in core_entities){
            if(core_entities[other_entity]['collision']
              && entity !== other_entity){
                if(!webgl_collision({
                  'character': false,
                  'entity': entity,
                  'target': other_entity,
                })){
                    return;
                }
            }
        }
    }

    core_entities[entity]['translate-x'] = core_round({
      'number': core_entities[entity]['translate-x'] + core_entities[entity]['dx'],
    });
    core_entities[entity]['translate-y'] = core_round({
      'number': core_entities[entity]['translate-y'] + core_entities[entity]['dy'],
    });
    core_entities[entity]['translate-z'] = core_round({
      'number': core_entities[entity]['translate-z'] + core_entities[entity]['dz'],
    });

    if(core_entities[entity]['spawn-entity'] !== false){
        core_entities[entity]['spawn-interval-current']++;

        if(core_entities[entity]['spawn-interval-current'] >= core_entities[entity]['spawn-interval-max']){
            core_entities[entity]['spawn-interval-current'] = 0;

            webgl_particles_create({
              'rotate-x': core_entities[entity]['rotate-x'],
              'rotate-y': core_entities[entity]['rotate-y'],
              'rotate-z': core_entities[entity]['rotate-z'],
              'translate-x': core_entities[entity]['translate-x'],
              'translate-y': core_entities[entity]['translate-y'],
              'translate-z': core_entities[entity]['translate-z'],
            });
        }
    }
}

// Optional args: rotate-x, rotate-y, rotate-z, vertices-length
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

// Optional args: collide-range, collides, color, count, gravity, lifespan,
//   rotate-x, rotate-y, rotate-z, speed, translate-x, translate-y, translate-z
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
        let id = '_particle-' + core_uid();

        core_entity_create({
          'id': id,
          'properties': {
            'collide-range': args['collide-range'],
            'collides': args['collides'],
            'draw-type': 'POINTS',
            'gravity': args['gravity'],
            'lifespan': args['lifespan'],
            'normals': [0, 1, 0],
            'rotate-x': args['rotate-x'],
            'rotate-y': args['rotate-y'],
            'rotate-z': args['rotate-z'],
            'speed': args['speed'],
            'translate-x': args['translate-x'],
            'translate-y': args['translate-y'],
            'translate-z': args['translate-z'],
            'vertex-colors': args['color'],
            'vertices': [0, 0, 0, 1],
          },
        });
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

function webgl_shader_update(){
    if(webgl_properties['shader']['program'] !== 0){
        webgl_buffer.deleteProgram(webgl_properties['shader']['program']);
    }

    webgl_properties['shader']['program'] = webgl_program_create({
      'shaders': [
        webgl_shader_create({
          'source':
              'uniform lowp float alpha;'
            + 'uniform lowp float float_fog;'
            + 'uniform int fog;'
            + 'uniform sampler2D sampler;'
            + 'varying mediump float float_fogDistance;'
            + 'varying mediump vec2 vec_textureCoord;'
            + 'varying mediump vec3 vec_lighting;'
            + 'varying lowp vec4 vec_fragmentColor;'
            + 'void main(void){'
            +     'if(fog == 1){'
            +         'gl_FragColor = mix('
            +           'vec4('
            +             webgl_properties['clearcolor-red'] + ','
            +             webgl_properties['clearcolor-green'] + ','
            +             webgl_properties['clearcolor-blue'] + ','
            +             '1'
            +           '),'
            +           'vec_fragmentColor,'
            +           'clamp(exp(' + webgl_properties['fog-density'] + ' * float_fogDistance * -float_fogDistance), 0.0, 1.0)'
            +         ') * texture2D(sampler, vec_textureCoord) * vec4(vec_lighting, 1.0) * alpha;'
            +     '}else{'
            +         'gl_FragColor = vec_fragmentColor * texture2D(sampler, vec_textureCoord) * vec4(vec_lighting, 1.0) * alpha;'
            +     '}'
            + '}',
          'type': webgl_buffer.FRAGMENT_SHADER,
        }),
        webgl_shader_create({
          'source':
              'attribute vec2 vec_texturePosition;'
            + 'attribute vec3 vec_vertexNormal;'
            + 'attribute vec4 vec_vertexColor;'
            + 'attribute vec4 vec_vertexPosition;'
            + 'uniform int directional;'
            + 'uniform mat4 mat_cameraMatrix;'
            + 'uniform mat4 mat_perspectiveMatrix;'
            + 'uniform float pointSize;'
            + 'varying float float_fogDistance;'
            + 'varying vec2 vec_textureCoord;'
            + 'varying vec3 vec_lighting;'
            + 'varying vec4 vec_fragmentColor;'
            + 'void main(void){'
            +     'gl_PointSize = pointSize;'
            +     'gl_Position = mat_perspectiveMatrix * mat_cameraMatrix * vec_vertexPosition;'
            +     'float_fogDistance = length(gl_Position.xyz);'
            +     'vec_fragmentColor = vec_vertexColor;'
            +     'vec_textureCoord = vec_texturePosition;'
            +     'vec_lighting = vec3('
            +       webgl_properties['ambient-red'] + ','
            +       webgl_properties['ambient-green'] + ','
            +       webgl_properties['ambient-blue']
            +     ');'
            +     'if(directional == 1){'
            +         'vec4 transformedNormal = mat_perspectiveMatrix * vec4(vec_vertexNormal, 1.0);'
            +         'vec_lighting += (vec3('
            +           webgl_properties['directional-red'] + ','
            +           webgl_properties['directional-green'] + ','
            +           webgl_properties['directional-blue']
            +         ') * max(dot(transformedNormal.xyz, normalize(vec3(' + webgl_properties['directional-vector'] + '))), 0.0));'
            +     '}'
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
      'directional': 'directional',
      'fog-density': 'float_fog',
      'fog-state': 'fog',
      'mat_cameraMatrix': 'mat_cameraMatrix',
      'mat_perspectiveMatrix': 'mat_perspectiveMatrix',
      'point-size': 'pointSize',
      'sampler': 'sampler',
    };
    for(let location in locations){
        webgl_properties['shader'][location] = webgl_buffer.getUniformLocation(
          webgl_properties['shader']['program'],
          locations[location]
        );
    }

    webgl_buffer.uniform1i(
      webgl_properties['shader']['directional'],
      webgl_properties['directional-state']
        ? 1
        : 0
    );
    webgl_buffer.uniform1f(
      webgl_properties['shader']['fog-density'],
      webgl_properties['fog-density']
    );
    webgl_buffer.uniform1i(
      webgl_properties['shader']['fog-state'],
      webgl_properties['fog-state']
        ? 1
        : 0
    );
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

    core_entities[args['entityid']]['texture-gl'] = webgl_buffer.createTexture();
    core_entities[args['entityid']]['image'] = core_image({
      'id': args['entityid'] + '-texture',
      'src': args['image'],
      'todo': function(){
          webgl_texture_set_todo(args);
      },
    });
}

function webgl_texture_set_todo(args){
    if(!core_entities[args['entityid']]){
        return;
    }

    webgl_buffer.bindTexture(
      webgl_buffer.TEXTURE_2D,
      core_entities[args['entityid']]['texture-gl']
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

    let color = [];
    for(let i = 0; i < args['vertexcount']; i++){
        color.push(
          args['rgbarray'][i]['red'] / 256,
          args['rgbarray'][i]['green'] / 256,
          args['rgbarray'][i]['blue'] / 256,
          1
        );
    }

    return color;
}

window.webgl_buffer = 0;
window.webgl_canvas = 0;
window.webgl_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
window.webgl_characters = {};
window.webgl_character_homebase = {};
window.webgl_character_id = '_me';
window.webgl_diagonal = 0;
window.webgl_properties = {};
window.webgl_text = {};
window.webgl_textures = {
  '_debug': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAP8A/wD/AAAAAAD///8hKtLYAAAAIklEQVQoz2NwQQMMTkoQIAgBIiNMwIEBAowhwGSECaAnBwAdPj4tFnzwQgAAAABJRU5ErkJggg==',
  '_default': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
};
