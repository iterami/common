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
        ],
        'vertex-colors-trunk': [
          1, .5, 0, 1,
        ],
      },
    });

    if(args['vertex-colors-leaves'].length === 4){
        args['vertex-colors-leaves'] = args['vertex-colors-leaves'].concat(args['vertex-colors-leaves']);
        args['vertex-colors-leaves'] = args['vertex-colors-leaves'].concat(args['vertex-colors-leaves']);
    }
    if(args['vertex-colors-trunk'].length === 4){
        args['vertex-colors-trunk'] = args['vertex-colors-trunk'].concat(args['vertex-colors-trunk']);
        args['vertex-colors-trunk'] = args['vertex-colors-trunk'].concat(args['vertex-colors-trunk']);
    }

    webgl_primitive_cuboid({
      'all': {
        'collision': args['collision-trunk'],
        'texture-id': 'wood.png',
        'texture-repeat-y': 2,
        'vertex-colors': args['vertex-colors-trunk'],
      },
      'bottom': {
        'exclude': true,
      },
      'character': args['character'],
      'left': {
        'texture-align': [
          1, 0,
          1, 1,
          0, 1,
          0, 0,
        ],
      },
      'prefix': args['prefix'] + '-trunk',
      'right': {
        'texture-align': [
          1, 0,
          1, 1,
          0, 1,
          0, 0,
        ],
      },
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
        0, 21, 1,
        0, 18, 1,
        0, 17, 0,
      ],
      'torso': [
        -3, 17, 0,
        3, 17, 0,
        0, 17, 0,
        0, 14, 0,
        0, 11, 0,
        -2, 11, 0,
        2, 11, 0,
      ],
      'arm-left': [
        -3, 17, 0,
        -3, 14, 1,
        -3, 13, 3,
        -3, 12, 4,
      ],
      'arm-right': [
        3, 17, 0,
        3, 14, 1,
        3, 13, 3,
        3, 12, 4,
      ],
      'leg-left': [
        -2, 11, 0,
        -2, 6, 1,
        -2, 0, 0,
        -2, 0, 1,
      ],
      'leg-right': [
        2, 11, 0,
        2, 6, 1,
        2, 0, 0,
        2, 0, 1,
      ],
    };
    for(const part in bodyparts){
        for(let vertex = 0; vertex < bodyparts[part].length; vertex++){
            if(vertex === 0 || (vertex + 1) % 3 !== 0){
                bodyparts[part][vertex] *= args['scale'];
            }
        }

        const properties = {
          'attach-offset-x': args['translate-x'],
          'attach-offset-y': args['translate-y'],
          'attach-offset-z': args['translate-z'],
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'draw-mode': 'LINE_STRIP',
          'collision': false,
          'id': args['prefix'] + '-' + part,
          'vertex-colors': webgl_vertexcolorarray({
            'vertexcount': bodyparts[part].length / 3,
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

// Required args: path
function prefabs_webgl_lines_path(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'color': [1, 1, 1],
        'prefix': entity_id_count,
      },
    });

    if(!webgl_paths[args['path']]){
        return;
    }

    let x = 0;
    let y = 0;
    let z = 0;
    const vertices = [];
    const vertex_colors = [];

    for(const point in webgl_paths[args['path']]['points']){
        const point_x = webgl_paths[args['path']]['points'][point]['translate-x'];
        if(point_x !== void 0){
            x = point_x;
        }
        const point_y = webgl_paths[args['path']]['points'][point]['translate-y'];
        if(point_y !== void 0){
            y = point_y;
        }
        const point_z = webgl_paths[args['path']]['points'][point]['translate-z'];
        if(point_z !== void 0){
            z = point_z;
        }

        vertices.push(x, y, z);
        vertex_colors.push(
          args['color'][0],
          args['color'][1],
          args['color'][2],
          1
        );
    }

    webgl_entity_create({
      'entities': [
        {
          'attach-to': args['character'],
          'attach-type': 'webgl_characters',
          'draw-mode': 'LINE_LOOP',
          'collision': false,
          'id': args['prefix'],
          'vertex-colors': vertex_colors,
          'vertices': vertices,
        },
      ],
    });
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
        'draw-mode': 'LINE_STRIP',
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
      0, 0, 0,
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
          x, y, z
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
      'draw-mode': args['draw-mode'],
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
        'billboard': 'y',
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
        ],
        'vertex-colors-trunk': [
          .4, .2, 0, 1,
        ],
      },
    });

    if(args['vertex-colors-leaves'].length === 4){
        args['vertex-colors-leaves'] = args['vertex-colors-leaves'].concat(args['vertex-colors-leaves']);
        args['vertex-colors-leaves'] = args['vertex-colors-leaves'].concat(args['vertex-colors-leaves']);
    }
    if(args['vertex-colors-trunk'].length === 4){
        args['vertex-colors-trunk'] = args['vertex-colors-trunk'].concat(args['vertex-colors-trunk']);
        args['vertex-colors-trunk'] = args['vertex-colors-trunk'].concat(args['vertex-colors-trunk']);
    }

    const properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'collision': false,
      'vertex-colors': args['vertex-colors-trunk'],
    };

    const trunk_count = core_random_integer({
      'max': args['trunk-count-max'] - args['trunk-count-min'] + 1,
    }) + args['trunk-count-min'];
    let trunk_width = args['trunk-width-max'] / 2;
    const trunk_width_decrease = (trunk_width - args['trunk-width-min'] / 2) / (trunk_count / 2);
    for(let trunk = 0; trunk < trunk_count; trunk++){
        properties['id'] = args['prefix'] + '-trunk-' + trunk;
        properties['billboard'] = args['billboard'];
        properties['rotate-x'] = 0;
        properties['rotate-z'] = 0;
        properties['vertices'] = [
          trunk_width, args['trunk-length'], 0,
          -trunk_width, args['trunk-length'], 0,
          -trunk_width, 0, 0,
          trunk_width, 0, 0,
        ];
        webgl_entity_create({
          'entities': [
            properties,
          ],
        });

        properties['attach-offset-y'] += 10;
        trunk_width -= trunk_width_decrease;

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
              branch_width, branch_length, 0,
              -branch_width, branch_length, 0,
              -branch_width, 0, 0,
              branch_width, 0, 0,
            ];

            webgl_entity_create({
              'entities': [
                properties,
              ],
            });
        }
    }
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
        ],
        'color-leaf': [
          .1, .3, .1, 1,
        ],
        'height': 5,
        'height-range': 0,
        'leaf-bottom': 1,
        'prefix': entity_id_count,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'width-base': 1,
        'width-leaf': 6,
      },
    });

    if(args['color-base'].length === 4){
        args['color-base'] = args['color-base'].concat(args['color-base']);
        args['color-base'] = args['color-base'].concat(args['color-base']);
    }
    if(args['color-leaf'].length === 4){
        args['color-leaf'] = args['color-leaf'].concat(args['color-leaf']);
        args['color-leaf'] = args['color-leaf'].concat(args['color-leaf']);
    }
    const height = args['height'] + core_random_number({
      'multiplier': args['height-range'],
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
          'id': args['prefix'] + '-base',
          'vertex-colors': args['color-base'],
          'vertices': [
            args['width-base'] / 2, 0, -.01,
            0, height * .9, -.01,
            -args['width-base'] / 2, 0, -.01,
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
          'draw-mode': 'TRIANGLES',
          'id': args['prefix'] + '-leaf',
          'vertex-colors': args['color-leaf'],
          'vertices': [
            args['width-leaf'] / 2, args['leaf-bottom'], 0,
            0, height, 0,
            -args['width-leaf'] / 2, args['leaf-bottom'], 0,
          ],
        },
      ],
    });
}
