'use strict';

function prefabs_webgl_cuboid_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'collision-leaves': true,
        'collision-trunk': true,
        'leaves-size-x': 10,
        'leaves-size-y': 10,
        'leaves-size-z': 10,
        'prefix': entity_id_count,
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

    webgl_primitive_cuboid({
      'all': {
        'collision': args['collision-trunk'],
        'texture-id': 'wood.png',
        'texture-repeat-y': 2,
        'vertex-colors': args['vertex-colors-trunk'],
      },
      'back': {
        'texture-align': [
          1, 0,
          0, 0,
          0, 1,
          1, 1,
        ],
      },
      'bottom': {
        'exclude': true,
      },
      'character': args['character'],
      'front': {
        'texture-align': [
          1, 0,
          0, 0,
          0, 1,
          1, 1,
        ],
      },
      'prefix': args['prefix'] + '-trunk',
      'size-x': args['trunk-size-x'],
      'size-y': args['trunk-size-y'],
      'size-z': args['trunk-size-z'],
      'top': {
        'exclude': true,
      },
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'] + args['trunk-size-y'] / 2,
      'translate-z': args['translate-z'],
    });
    webgl_primitive_cuboid({
      'all': {
        'collision': args['collision-leaves'],
        'texture-id': 'lavaleaf.png',
        'vertex-colors': args['vertex-colors-leaves'],
      },
      'character': args['character'],
      'prefix': args['prefix'] + '-leaves',
      'size-x': args['leaves-size-x'],
      'size-y': args['leaves-size-y'],
      'size-z': args['leaves-size-z'],
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'] + args['trunk-size-y'] + args['leaves-size-y'] / 2,
      'translate-z': args['translate-z'],
    });
}

function prefabs_webgl_humanoid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'prefix': entity_id_count,
        'scale': 1,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    const bodyparts = {
      'head': [
        0, 21, 1, 1,
        0, 18, 1, 1,
        0, 17, 0, 1,
      ],
      'torso': [
        -3, 17, 0, 1,
        3, 17, 0, 1,
        0, 17, 0, 1,
        0, 14, 0, 1,
        0, 11, 0, 1,
        -2, 11, 0, 1,
        2, 11, 0, 1,
      ],
      'arm-left': [
        -3, 17, 0, 1,
        -3, 14, 1, 1,
        -3, 13, 3, 1,
        -3, 12, 4, 1,
      ],
      'arm-right': [
        3, 17, 0, 1,
        3, 14, 1, 1,
        3, 13, 3, 1,
        3, 12, 4, 1,
      ],
      'leg-left': [
        -2, 11, 0, 1,
        -2, 6, 1, 1,
        -2, 0, 0, 1,
        -2, 0, 1, 1,
      ],
      'leg-right': [
        2, 11, 0, 1,
        2, 6, 1, 1,
        2, 0, 0, 1,
        2, 0, 1, 1,
      ],
    };
    for(const part in bodyparts){
        for(let vertex = 0; vertex < bodyparts[part].length; vertex++){
            if(vertex === 0 || (vertex + 1) % 4 !== 0){
                bodyparts[part][vertex] *= args['scale'];
            }
        }

        const properties = {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'draw-type': 'LINE_STRIP',
          'collision': false,
          'id': args['prefix'] + '-' + part,
          'vertex-colors': webgl_vertexcolorarray({
            'random-colors': true,
            'vertexcount': bodyparts[part].length / 4,
          }),
          'vertices': bodyparts[part],
        };

        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }
}

function prefabs_webgl_lines_shrub(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'color-base': [
          0, 0, 0,
        ],
        'color-leaf': [
          1, 1, 1,
        ],
        'draw-type': 'LINE_STRIP',
        'leaf-distance': .5,
        'points': 10,
        'prefix': entity_id_count,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'type': 'range',
        'x-max': 1,
        'x-min': -1,
        'y-max': 1,
        'y-min': -1,
        'z-max': 1,
        'z-min': -1,
      },
    });

    const colors = [
      args['color-base'][0],
      args['color-base'][1],
      args['color-base'][2],
      1,
    ];
    const points = [
      0, 0, 0, 1,
    ];
    let x = 0;
    let y = 0;
    let z = 0;

    for(let i = 1; i < args['points']; i++){
        const random_x = core_random_number({
          'multiplier': args['x-max'] - args['x-min'],
        }) + args['x-min'];
        const random_y = core_random_number({
          'multiplier': args['y-max'] - args['y-min'],
        }) + args['y-min'];
        const random_z = core_random_number({
          'multiplier': args['z-max'] - args['z-min'],
        }) + args['z-min'];

        if(args['type'] === 'range'){
            x = random_x;
            y = random_y;
            z = random_z;

        }else{
            x += random_x;
            y += random_y;
            z += random_z;
        }

        points.push(
          x, y, z, 1
        );
        if(math_distance({
            'x1': x,
            'y1': y,
            'z1': z,
          }) < args['leaf-distance']){
            colors.push(
              args['color-base'][0],
              args['color-base'][1],
              args['color-base'][2],
              1,
            );

        }else{
            colors.push(
              args['color-leaf'][0],
              args['color-leaf'][1],
              args['color-leaf'][2],
              1,
            );
        }
    }
    const properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'draw-type': args['draw-type'],
      'collision': false,
      'id': args['prefix'],
      'vertex-colors': colors,
      'vertices': points,
    };

    webgl_entity_create({
      'entities': [
        properties,
      ],
    });
}

function prefabs_webgl_lines_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'prefix': entity_id_count,
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

    const properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'collision': false,
      'vertex-colors': args['vertex-colors-trunk'],
    };

    // Create trunk section.
    const trunk_count = core_random_integer({
      'max': args['trunk-count-max'] - args['trunk-count-min'] + 1,
    }) + args['trunk-count-min'];
    let trunk_width = args['trunk-width-max'] / 2;
    const trunk_width_decrease = (trunk_width - args['trunk-width-min'] / 2) / (trunk_count / 2);
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
        const branch_count = core_random_integer({
          'max': args['trunk-branch-max'] - args['trunk-branch-min'] + 1,
        }) + args['trunk-branch-min'];
        const branch_length = args['trunk-length'] / 2;
        const branch_width = trunk_width / 2;
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

// Required args: tiles
function prefabs_webgl_tiles(args){
    args = core_args({
      'args': args,
      'defaults': {
        'prefix': entity_id_count,
        'rotate-x': 0,
        'rotate-y': 0,
        'rotate-z': 0,
        'tiles-max': 5,
        'tiles-min': 1,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    const tile_count = core_random_integer({
      'max': args['tiles-max'] - args['tiles-min'] + 1,
    }) + args['tiles-min'];
    let tile_offset_x = args['translate-x'];
    let tile_offset_y = args['translate-y'];
    let tile_offset_z = args['translate-z'];
    let tile_rotate_x = args['rotate-x'];
    let tile_rotate_y = args['rotate-y'];
    let tile_rotate_z = args['rotate-z'];
    const tiles = args['tiles'].length;

    for(let tile = 0; tile < tile_count; tile++){
        const character_id = args['prefix'] + '-tile-' + tile;
        webgl_character_init({
          'collides': false,
          'id': character_id,
          'rotate-x': tile_rotate_x,
          'rotate-y': tile_rotate_y,
          'rotate-z': tile_rotate_z,
          'translate-x': tile_offset_x,
          'translate-y': tile_offset_y,
          'translate-z': tile_offset_z,
        });
        const selected = core_random_integer({
          'max': tiles,
        });

        const entities = args['tiles'][selected]['entities'];
        for(const entity in entities){
            const properties = {
              'attach-to': character_id,
              'attach-type': 'webgl_characters',
              'id': args['prefix'] + '-' + tile + '-' + entity,
            };

            Object.assign(
              properties,
              entities[entity]
            );

            webgl_entity_create({
              'entities': [
                properties,
              ],
            });
        }

        if(args['tiles'][selected]['attach-offset-x'] !== void 0){
            tile_offset_x += args['tiles'][selected]['attach-offset-x'];
        }
        if(args['tiles'][selected]['attach-offset-y'] !== void 0){
            tile_offset_y += args['tiles'][selected]['attach-offset-y'];
        }
        if(args['tiles'][selected]['attach-offset-z'] !== void 0){
            tile_offset_z += args['tiles'][selected]['attach-offset-z'];
        }
        if(args['tiles'][selected]['attach-rotate-x'] !== void 0){
            tile_rotate_x += args['tiles'][selected]['attach-rotate-x'];
        }
        if(args['tiles'][selected]['attach-rotate-y'] !== void 0){
            tile_rotate_y += args['tiles'][selected]['attach-rotate-y'];
        }
        if(args['tiles'][selected]['attach-rotate-z'] !== void 0){
            tile_rotate_z += args['tiles'][selected]['attach-rotate-z'];
        }
    }
}

function prefabs_webgl_tree_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'billboard': 'y',
        'character': webgl_character_id,
        'color-base': [
          .4, .2, 0, 1,
          .4, .2, 0, 1,
          .4, .2, 0, 1,
        ],
        'color-leaf': [
          .1, .3, .1, 1,
          .1, .3, .1, 1,
          .1, .3, .1, 1,
        ],
        'prefix': entity_id_count,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
      },
    });

    webgl_entity_create({
      'entities': [
        {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'billboard': args['billboard'],
          'collision': false,
          'id': args['prefix'] + '_base',
          'vertex-colors': args['color-base'],
          'vertices': [
            1, 0, -.01, 1,
            0, 4, -.01, 1,
            -1, 0, -.01, 1,
          ],
        },
        {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'billboard': args['billboard'],
          'collision': false,
          'draw-type': 'TRIANGLES',
          'id': args['prefix'] + '_leaf',
          'vertex-colors': args['color-leaf'],
          'vertices': [
            3, 1, 0, 1,
            0, 5, 0, 1,
            -3, 1, 0, 1,
          ],
        },
      ],
    });
}
