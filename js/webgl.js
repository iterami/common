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

    let entity = core_entities[args['entity']];
    entity['attach-offset-x'] = args['offset-x'];
    entity['attach-offset-y'] = args['offset-y'];
    entity['attach-offset-z'] = args['offset-z'];
    entity['attach-to'] = args['to'];
    entity['attach-type'] = args['type'];
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
        if(webgl_character_level({
            'character': webgl_character_id,
          }) < -1){
            return;
        }

        webgl_camera_rotate({
          'character': webgl_characters[webgl_character_id]['camera-zoom-max'] === 0
            || (core_mouse['button'] === 2
              && webgl_characters[webgl_character_id]['health-current'] > 0),
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

    if(args['camera']
      && args['character']){
        if(core_mouse['down']){
            webgl_characters[args['character-id']]['rotate-y'] = webgl_characters[args['character-id']]['camera-rotate-y'];

        }else{
            webgl_characters[args['character-id']]['rotate-y'] += args['y'];
        }
    }

    webgl_entity_radians({
      'character': true,
      'entity': args['character-id'],
    });
}

function webgl_camera_zoom(event){
    if(webgl_character_level({
        'character': webgl_character_id,
      }) < -1){
        return;
    }

    let character = webgl_characters[webgl_character_id];
    if(event.deltaY > 0){
        character['camera-zoom-current'] = Math.min(
          character['camera-zoom-current'] + 1,
          character['camera-zoom-max']
        );

    }else{
        character['camera-zoom-current'] = Math.max(
          character['camera-zoom-current'] - 1,
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

    // Unattach all attached entities.
    /*
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
    */

    if(args['delete']){
        delete webgl_characters[args['character']];
        webgl_character_count--;
        return;
    }

    webgl_characters[args['character']]['health-current'] = 0;
}

function webgl_character_home(){
    if(!webgl_characters[webgl_character_id]
      || webgl_character_homebase['entities'].length === 0){
        return;
    }

    webgl_level_unload();
    webgl_init(webgl_character_homebase);
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
    webgl_characters[args['character']][webgl_properties['gravity-axis']] = webgl_characters[args['character']]['jump-height'] * webgl_properties['multiplier-jump'];
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

    if(!webgl_characters[webgl_character_id]){
        return;
    }

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

    if(!webgl_characters[webgl_character_id]){
        return;
    }

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
                collision = 'dx';
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
                collision = 'dx';
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
                collision = 'dy';
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
                collision = 'dy';
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
                collision = 'dz';
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
                collision = 'dz';
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

            webgl_characters[args['character-id']]['translate-' + collision[1]] = target['translate-' + collision[1]] + (collider['collide-range'] * collision_sign);

            if(webgl_character_level({
                'character': args['character-id'],
              }) > -1){
                if(target['collide-damage'] !== 0){
                    webgl_character_damage({
                      'character': args['character-id'],
                      'damage': target['collide-damage'],
                    });
                }

                if(target['item-id'] !== false){
                    if(!(target['item-id'] in webgl_characters[args['character-id']]['inventory'])){
                        webgl_item_reset({
                          'character': args['character-id'],
                          'item': target['item-id'],
                        });

                        webgl_characters[args['character-id']]['inventory'][target['item-id']]['entities'] = target['item-entities'].slice();
                        Object.assign(
                          webgl_characters[args['character-id']]['inventory'][target['item-id']]['stats'],
                          target['item-stats']
                        );
                    }

                    webgl_characters[args['character-id']]['inventory'][target['item-id']]['amount'] += target['item-amount'];

                    core_entity_remove({
                      'entities': [
                        args['target'],
                      ],
                    });

                    return false;

                }else if(collision === webgl_properties['gravity-axis']
                  && collision_sign === 1){
                    webgl_characters[args['character-id']]['jump-allow'] = webgl_characters[args['character-id']][webgl_properties['gravity-axis']] === 0;
                }
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

// Optional args: all-alpha, all-collision, all-vertex-colors, back-alpha,
//   back-collision, back-vertex-colors, bottom-alpha, bottom-collision, bottom-vertex-colors,
//   exclude, front-alpha, front-collision, front-vertex-colors, height, left-alpha,
//   left-collision, left-vertex-colors, length, prefix, right-alpha, right-collision,
//   right-vertex-colors, top-alpha, top-collision, top-vertex-colors, translate-x,
//   translate-y, translate-z, width
function webgl_cuboid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'all-alpha': false,
        'all-collision': true,
        'all-vertex-colors': false,
        'back-alpha': 1,
        'back-collision': false,
        'back-vertex-colors': webgl_vertexcolorarray(),
        'bottom-alpha': 1,
        'bottom-collision': false,
        'bottom-vertex-colors': webgl_vertexcolorarray(),
        'exclude': {},
        'front-alpha': 1,
        'front-collision': false,
        'front-vertex-colors': webgl_vertexcolorarray(),
        'height': 1,
        'left-alpha': 1,
        'left-collision': false,
        'left-vertex-colors': webgl_vertexcolorarray(),
        'length': 1,
        'prefix': core_uid(),
        'right-alpha': 1,
        'right-collision': false,
        'right-vertex-colors': webgl_vertexcolorarray(),
        'top-alpha': 1,
        'top-collision': false,
        'top-vertex-colors': webgl_vertexcolorarray(),
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'width': 1,
      },
    });

    let half_height = args['height'] / 2;
    let half_length = args['length'] / 2;
    let half_width = args['width'] / 2;
    let vertices_height = Math.abs(half_height);
    let vertices_length = Math.abs(half_length);
    let vertices_width = Math.abs(half_width);
    let properties = {
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'],
      'translate-z': args['translate-z'],
    };

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
    properties['translate-y'] = args['translate-y'] + half_height;
    properties['vertices'] = [
      vertices_width, 0, -vertices_length, 1,
      -vertices_width, 0, -vertices_length, 1,
      -vertices_width, 0, vertices_length, 1,
      vertices_width, 0, vertices_length, 1
    ];
    if(args['exclude']['top'] !== true){
        properties['alpha'] = args['top-alpha'];
        properties['collision'] = args['top-collision'] || args['all-collision'];
        properties['vertex-colors'] = args['top-vertex-colors'];
        core_entity_create({
          'id': args['prefix'] + '-top',
          'properties': properties,
        });
    }

    // Bottom.
    properties['rotate-x'] = 180;
    properties['translate-y'] = args['translate-y'] - half_height;
    if(args['exclude']['bottom'] !== true){
        properties['alpha'] = args['bottom-alpha'];
        properties['collision'] = args['bottom-collision'] || args['all-collision'];
        properties['vertex-colors'] = args['bottom-vertex-colors'];
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
      vertices_width, 0, -vertices_height, 1,
      -vertices_width, 0, -vertices_height, 1,
      -vertices_width, 0, vertices_height, 1,
      vertices_width, 0, vertices_height, 1
    ];
    if(args['exclude']['front'] !== true){
        properties['alpha'] = args['front-alpha'];
        properties['collision'] = args['front-collision'] || args['all-collision'];
        properties['vertex-colors'] = args['front-vertex-colors'];
        core_entity_create({
          'id': args['prefix'] + '-front',
          'properties': properties,
        });
    }

    // Back.
    properties['rotate-x'] = 270;
    properties['translate-z'] = args['translate-z'] - half_length;
    if(args['exclude']['back'] !== true){
        properties['alpha'] = args['back-alpha'];
        properties['collision'] = args['back-collision'] || args['all-collision'];
        properties['vertex-colors'] = args['back-vertex-colors'];
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
      vertices_height, 0, -vertices_length, 1,
      -vertices_height, 0, -vertices_length, 1,
      -vertices_height, 0, vertices_length, 1,
      vertices_height, 0, vertices_length, 1
    ];
    if(args['exclude']['left'] !== true){
        properties['alpha'] = args['left-alpha'];
        properties['collision'] = args['left-collision'] || args['all-collision'];
        properties['vertex-colors'] = args['left-vertex-colors'];
        core_entity_create({
          'id': args['prefix'] + '-left',
          'properties': properties,
        });
    }

    // Right.
    properties['rotate-z'] = 270;
    properties['translate-x'] = args['translate-x'] + half_width;
    if(args['exclude']['right'] !== true){
        properties['alpha'] = args['right-alpha'];
        properties['collision'] = args['right-collision'] || args['all-collision'];
        properties['vertex-colors'] = args['right-vertex-colors'];
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
      'all-collision': args['collision-trunk'],
      'all-vertex-colors': args['vertex-colors-trunk'],
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
      'width': args['width-trunk'],
    });
    webgl_cuboid({
      'all-collision': args['collision-leaves'],
      'all-vertex-colors': args['vertex-colors-leaves'],
      'height': args['height-leaves'],
      'length': args['length-leaves'],
      'prefix': args['prefix'] + '-leaves',
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'] + args['height-trunk'] + args['height-leaves'] / 2,
      'translate-z': args['translate-z'],
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
    if(core_entities[entity]['attach-to'] !== false
      && core_entities[entity]['billboard'] === false){
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
        let entity_id = core_entity_create({
          'id': args['entities'][entity]['id'],
          'properties': args['entities'][entity],
          'types': args['entities'][entity]['types'],
        });

        let attach = false;
        let attach_type = 'entity';

        if(args['entities'][entity]['skybox'] === true){
            core_group_move({
              'entities': [
                entity_id,
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
              'entity': entity_id,
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
            let entity_id = core_entity_create({
              'id': webgl_characters[character]['entities'][entity]['id'],
              'properties': webgl_characters[character]['entities'][entity],
              'types': webgl_characters[character]['entities'][entity]['types'],
            });

            webgl_attach({
              'entity': entity_id,
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

    args['multiplier'] *= webgl_properties['multiplier-speed'];

    if(args['entity'] === false){
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
          'angle': core_entities[args['entity']]['rotate-' + webgl_properties['gravity-axis'][1]],
          'speed': core_entities[args['entity']]['speed'] * args['multiplier'],
          'strafe': args['strafe'],
        });
        if(webgl_properties['gravity-axis'] === 'dy'){
            core_entities[args['entity']]['dx'] = movement['x'];
            core_entities[args['entity']]['dz'] = movement['z'];

        }else if(webgl_properties['gravity-axis'] === 'dx'){
            core_entities[args['entity']]['dy'] = movement['x'];
            core_entities[args['entity']]['dz'] = movement['z'];

        }else{
            core_entities[args['entity']]['dx'] = movement['x'];
            core_entities[args['entity']]['dy'] = movement['z'];
        }
    }
}

// Optional args: character, entity, x, y, z
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
// Optional args: character
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
      'colorData': core_entities[entity]['vertex-colors'] || webgl_vertexcolorarray(),
      'normalData': core_entities[entity]['normals'],
      'textureData': core_entities[entity]['textureData'],
      'vertexData': core_entities[entity]['vertices'],
    });

    webgl_texture_set({
      'entity': entity,
      'texture': core_entities[entity]['texture'],
    });
}

// Optional args: ambient-blue, ambient-green, ambient-red, clearcolor-blue, clearcolor-green,
//   clearcolor-red, directional-blue, directional-green, directional-red, directional-state,
//   directional-vector, fog-density, fog-state, gravity-acceleration, gravity-axis, gravity-max,
//   jump-movement, multiplier-jump, multiplier-speed, spawn-rotate-x, spawn-rotate-y, spawn-rotate-z,
//   spawn-translate-x, spawn-translate-y, spawn-translate-z
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
        'directional-vector': '0, 1, 0',
        'fog-density': .0001,
        'fog-state': false,
        'gravity-acceleration': -.05,
        'gravity-axis': 'dy',
        'gravity-max': -2,
        'jump-movement': false,
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

    webgl_diagonal = Math.sin(core_degrees_to_radians({
      'degrees': 45,
    })) / Math.sin(core_degrees_to_radians({
      'degrees': 90,
    }));

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
        'item-amount': 1,
        'item-entities': [],
        'item-id': false,
        'item-stats': {},
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
        'texture': '_texture-default',
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

// Optional args: camera-zoom-current, camera-zoom-max, collide-range, collides, dx, dy, dz, entities,
//   experience, health-current, health-max, id, inventory, jump-height, level, rotate-x, rotate-y,
//   rotate-z, speed, talk, trade, translate-x, translate-y, translate-z
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
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'speed': .2,
        'talk': false,
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
      'rotate-x': args['rotate-x'],
      'rotate-y': args['rotate-y'],
      'rotate-z': args['rotate-z'],
      'speed': args['speed'],
      'talk': args['talk'],
      'trade': args['trade'],
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'],
      'translate-z': args['translate-z'],
    };
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
}

// Required args: item
// Optional args: character, equip
function webgl_item_equip(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'equip': true,
      },
    });

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

            core_entity_create({
              'id': entity_id,
              'properties': properties,
            });

            webgl_attach({
              'entity': entity_id,
              'offset-x': properties['attach-offset-x'],
              'offset-y': properties['attach-offset-y'],
              'offset-z': properties['attach-offset-z'],
              'to': args['character'],
              'type': 'character',
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
// Optional args: character
function webgl_item_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
      },
    });

    webgl_characters[args['character']]['inventory'][args['item']] = {
      'amount': 0,
      'entities': [],
      'equipped': false,
      'stats': {},
    };
}

// Required args: character-0, character-1, item-0-amount, item-0-id, item-1-amount, item-1-id
function webgl_item_trade(args){
    let inventory_0 = webgl_characters[args['character-0']]['inventory'];
    let inventory_1 = webgl_characters[args['character-1']]['inventory'];

    if(!webgl_characters[args['character-0']]
      || !webgl_characters[args['character-1']]
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
          'item': args['item-1-id'],
        });

        inventory_0[args['item-1-id']]['entities'] = inventory_1[args['item-1-id']]['entities'].slice();
        Object.assign(
          inventory_0[args['item-1-id']]['stats'],
          inventory_1[args['item-1-id']]['stats']
        );
    }
    if(!inventory_1[args['item-0-id']]){
        webgl_item_reset({
          'character': args['character-1'],
          'item': args['item-0-id'],
        });

        inventory_1[args['item-0-id']]['entities'] = inventory_0[args['item-0-id']]['entities'].slice();
        Object.assign(
          inventory_1[args['item-0-id']]['stats'],
          inventory_0[args['item-0-id']]['stats']
        );
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

    if(args['character'] === 1){
        if(!args['json']['characters']
          || args['json']['characters'][0]['id'] !== webgl_character_id){
            return;
        }

    }else if(args['character'] === 0
      && webgl_character_level() < 0){
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

    if(args['character'] === -1){
        webgl_init_character({
          'camera-zoom-current': 0,
          'camera-zoom-max': 0,
          'entities': [],
          'id': webgl_character_id,
        });
        webgl_character_homebase['entities'] = {};
        webgl_character_homebase['properties'] = {};
    }

    if(args['json']['characters']
      && args['json']['characters'] !== false){
        for(let character in args['json']['characters']){
            if(args['json']['characters'][character]['id'] === webgl_character_id
              && args['character'] !== 1
              && webgl_character_level() > -2){
                continue;
            }

            webgl_init_character(args['json']['characters'][character]);

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
              'collision-leaves': args['json']['cuboids'][cuboid]['all-collision'],
              'collision-trunk': args['json']['cuboids'][cuboid]['all-collision'],
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

            continue;
        }

        webgl_cuboid(args['json']['cuboids'][cuboid]);
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
    webgl_character_count = 0;
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

        if((webgl_characters[webgl_character_id]['jump-allow']
            && webgl_characters[webgl_character_id][webgl_properties['gravity-axis']] === 0)
          || webgl_character_level() === -1
          || webgl_properties['jump-movement']){
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

    let npc_talk = '';
    let npc_trade = '';
    for(let character in webgl_characters){
        if(webgl_character_level({
            'character': character,
          }) > -1){
            webgl_characters[character][webgl_properties['gravity-axis']] = Math.max(
              webgl_characters[character][webgl_properties['gravity-axis']] + webgl_properties['gravity-acceleration'],
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
              }) < 15){
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

    }else if((webgl_characters[webgl_character_id]['jump-allow']
        && webgl_characters[webgl_character_id][webgl_properties['gravity-axis']] === 0)
      || webgl_properties['jump-movement']){
        webgl_characters[webgl_character_id]['dx'] = 0;
        webgl_characters[webgl_character_id]['dz'] = 0;

    }else if(webgl_characters[webgl_character_id][webgl_properties['gravity-axis']] !== 0){
        webgl_characters[webgl_character_id]['jump-allow'] = false;
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
        core_entities[entity][webgl_properties['gravity-axis']] = Math.max(
          core_entities[entity][webgl_properties['gravity-axis']] + webgl_properties['gravity-acceleration'],
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
        let id = core_entity_create({
          'id': '_particle-' + core_uid(),
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
            +     'gl_FragColor = (fog == 1'
            +       '? mix('
            +           'vec4('
            +             webgl_properties['clearcolor-red'] + ','
            +             webgl_properties['clearcolor-green'] + ','
            +             webgl_properties['clearcolor-blue'] + ','
            +             '1'
            +           '),'
            +           'vec_fragmentColor,'
            +           'clamp(exp(' + webgl_properties['fog-density'] + ' * float_fogDistance * -float_fogDistance), 0.0, 1.0)'
            +         ')'
            +       ': vec_fragmentColor) * texture2D(sampler, vec_textureCoord) * vec4(vec_lighting, 1.0) * alpha;'
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
            +         'vec_lighting += vec3('
            +           webgl_properties['directional-red'] + ','
            +           webgl_properties['directional-green'] + ','
            +           webgl_properties['directional-blue']
            +         ') * max(dot(transformedNormal.xyz, normalize(vec3(' + webgl_properties['directional-vector'] + '))), 0.0);'
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

// Required args: entity
// Optional args: texture
function webgl_texture_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'texture': '_texture-default',
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
window.webgl_character_count = 0;
window.webgl_character_homebase = {};
window.webgl_character_id = '_me';
window.webgl_character_trading = '';
window.webgl_characters = {};
window.webgl_diagonal = 0;
window.webgl_properties = {};
window.webgl_text = {};
