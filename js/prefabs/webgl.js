'use strict';

function prefabs_webgl_cuboid(args){
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

    // Top.
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
            vertices_size_x, 0, -vertices_size_z, 1,
            -vertices_size_x, 0, -vertices_size_z, 1,
            -vertices_size_x, 0, vertices_size_z, 1,
            vertices_size_x, 0, vertices_size_z, 1
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

    // Bottom.
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
            vertices_size_x, 0, -vertices_size_z, 1,
            -vertices_size_x, 0, -vertices_size_z, 1,
            -vertices_size_x, 0, vertices_size_z, 1,
            vertices_size_x, 0, vertices_size_z, 1
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

    // Front.
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
            vertices_size_x, 0, -vertices_size_y, 1,
            -vertices_size_x, 0, -vertices_size_y, 1,
            -vertices_size_x, 0, vertices_size_y, 1,
            vertices_size_x, 0, vertices_size_y, 1
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

    // Back.
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
            vertices_size_x, 0, -vertices_size_y, 1,
            -vertices_size_x, 0, -vertices_size_y, 1,
            -vertices_size_x, 0, vertices_size_y, 1,
            vertices_size_x, 0, vertices_size_y, 1
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

    // Left.
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
            vertices_size_y, 0, -vertices_size_z, 1,
            -vertices_size_y, 0, -vertices_size_z, 1,
            -vertices_size_y, 0, vertices_size_z, 1,
            vertices_size_y, 0, vertices_size_z, 1
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

    // Right.
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
            vertices_size_y, 0, -vertices_size_z, 1,
            -vertices_size_y, 0, -vertices_size_z, 1,
            -vertices_size_y, 0, vertices_size_z, 1,
            vertices_size_y, 0, vertices_size_z, 1
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

    prefabs_webgl_cuboid({
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
    prefabs_webgl_cuboid({
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

function prefabs_webgl_ellipsoid(args){
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
            properties['draw-type'] = 'TRIANGLE_STRIP';

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
              0, args['radius-y'] * pole, 0, 1
            );
            properties['draw-type'] = 'TRIANGLE_FAN';
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
                  xtop, -ytop, ztop, 1
                );

            }else if(pole === -1){
                properties['vertex-colors'].push(
                  args['color0'][0], args['color0'][1], args['color0'][2], args['color0'][3]
                );
                properties['vertices'].splice(
                  4,
                  0,
                  xbottom, -ybottom, zbottom, 1
                );

            }else{
                properties['vertex-colors'].push(
                  args['color0'][0], args['color0'][1], args['color0'][2], args['color0'][3],
                  args['color1'][0], args['color1'][1], args['color1'][2], args['color1'][3]
                );
                properties['vertices'].push(
                  xtop, ytop, ztop, 1,
                  xbottom, ybottom, zbottom, 1
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

function prefabs_webgl_lines_shrub(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_id,
        'color': [
          1, 1, 1,
        ],
        'id': entity_id_count,
        'points': 10,
        'translate-x': 0,
        'translate-y': 0,
        'translate-z': 0,
        'type': 'range',
        'x-max': 0,
        'x-min': 0,
        'y-max': 0,
        'y-min': 0,
        'z-max': 0,
        'z-min': 0,
      },
    });

    const colors = [
      args['color'][0],
      args['color'][1],
      args['color'][2],
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
        colors.push(
          args['color'][0],
          args['color'][1],
          args['color'][2],
          1,
        );
    }
    const properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'draw-type': 'LINE_STRIP',
      'collision': false,
      'id': args['id'],
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

// Required args: id,
function prefabs_webgl_tree_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'billboard': false,
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
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    entity_create({
      'id': 'webgl-tree_' + args['id'] + '_base',
      'properties': {
        'billboard': args['billboard'],
        'dx': args['dx'],
        'dy': args['dy'],
        'dz': args['dz'],
        'translate-x': args['x'],
        'translate-y': args['y'],
        'translate-z': args['z'],
        'vertex-colors': args['color-base'],
        'vertices': [
          1, 0, -.01, 1,
          0, 4, -.01, 1,
          -1, 0, -.01, 1,
        ],
      },
    });
    entity_create({
      'id': 'webgl-tree_' + args['id'] + '_leaf',
      'properties': {
        'billboard': args['billboard'],
        'draw-type': 'TRIANGLES',
        'dx': args['dx'],
        'dy': args['dy'],
        'dz': args['dz'],
        'translate-x': args['x'],
        'translate-y': args['y'],
        'translate-z': args['z'],
        'vertex-colors': args['color-leaf'],
        'vertices': [
          3, 1, 0, 1,
          0, 5, 0, 1,
          -3, 1, 0, 1,
        ],
      },
    });

    entity_group_add({
      'entities': [
        'webgl-tree_' + args['id'] + '_base',
        'webgl-tree_' + args['id'] + '_leaf',
      ],
      'group': args['id'],
    });
}
