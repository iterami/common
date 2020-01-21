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

    let half_size_x = args['size-x'] / 2;
    let half_size_y = args['size-y'] / 2;
    let half_size_z = args['size-z'] / 2;
    let vertices_size_x = Math.abs(half_size_x);
    let vertices_size_y = Math.abs(half_size_y);
    let vertices_size_z = Math.abs(half_size_z);

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
        let properties = {
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
        let properties = {
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
        let properties = {
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
        let properties = {
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
        let properties = {
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
        let properties = {
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

    let latitude_angles = math_degrees_to_radians({
      'degrees': 360 / args['slices-latitude'],
    });
    let longitude_angles = math_degrees_to_radians({
      'degrees': 180 / args['slices-longitude'],
    });
    let longitude_start = math_degrees_to_radians({
      'degrees': -90,
    });

    // Quads.
    let properties = {
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'collision': false,
      'translate-x': args['translate-x'],
      'translate-y': args['translate-y'],
      'translate-z': args['translate-z'],
      'vertex-colors': [
        1, 1, 1, 1,
      ],
      'vertices': [
        0, args['radius-y'], 0, 1,
      ],
    };
    for(let longitude = 0; longitude < args['slices-longitude']; longitude++){
        let pole = 0;
        if(longitude === 0){
            pole = 1;

        }else if(longitude === args['slices-longitude'] - 1){
            pole = -1;
        }

        properties['id'] = args['prefix'] + '-quad-' + longitude;
        properties['vertex-colors'] = [];
        properties['vertices'] = [];

        let longitude_bottom = longitude_start + longitude * longitude_angles;
        let longitude_top = longitude_start + (longitude + 1) * longitude_angles;

        if(pole !== 0){
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

        }else{
            properties['draw-type'] = 'TRIANGLE_STRIP';
        }

        for(let latitude = 0; latitude <= args['slices-latitude']; latitude++){
            let rotation = latitude * latitude_angles;

            let xbottom = args['radius-x'] * Math.sin(rotation) * Math.cos(longitude_bottom);
            let ybottom = args['radius-y'] * Math.sin(longitude_bottom);
            let zbottom = args['radius-z'] * Math.cos(rotation) * Math.cos(longitude_bottom);

            let xtop = args['radius-x'] * Math.sin(rotation) * Math.cos(longitude_top);
            let ytop = args['radius-y'] * Math.sin(longitude_top);
            let ztop = args['radius-z'] * Math.cos(rotation) * Math.cos(longitude_top);

            if(pole !== 0){

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
                }

                continue;
            }

            properties['vertex-colors'].push(
              args['color0'][0], args['color0'][1], args['color0'][2], args['color0'][3],
              args['color1'][0], args['color1'][1], args['color1'][2], args['color1'][3]
            );
            properties['vertices'].push(
              xtop, ytop, ztop, 1,
              xbottom, ybottom, zbottom, 1
            );
        }

        webgl_entity_create({
          'entities': [
            properties,
          ],
        });
    }
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

    let properties = {
      'attach-offset-x': args['translate-x'],
      'attach-offset-y': args['translate-y'],
      'attach-offset-z': args['translate-z'],
      'attach-to': args['character'],
      'attach-type': 'webgl_characters',
      'collision': false,
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

function prefabs_webgl_skybox(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bottom-color-bottom': false,
        'bottom-color-top': false,
        'character': webgl_character_id,
        'prefix': entity_id_count,
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

    let angle = math_degrees_to_radians({
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
        args['top-color-top'][0], args['top-color-top'][1], args['top-color-top'][2], args['top-color-top'][3],
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
          args['top-color-bottom'][0], args['top-color-bottom'][1], args['top-color-bottom'][2], args['top-color-bottom'][3]
        );
        properties['vertices'].push(
          x, 0, z, 1
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
      args['bottom-color-bottom'][0], args['bottom-color-bottom'][1], args['bottom-color-bottom'][2], args['bottom-color-bottom'][3],
    ];
    properties['vertices'] = [
      0, -args['size'], 0, 1,
    ];
    for(let side = 0; side <= args['sides']; side++){
        let rotation = -angle * side;
        let x = Math.cos(rotation) * args['size'];
        let z = Math.sin(rotation) * args['size'];

        properties['vertex-colors'].push(
          args['bottom-color-top'][0], args['bottom-color-top'][1], args['bottom-color-top'][2],args['bottom-color-top'][3]
        );
        properties['vertices'].push(
          x, 0, z, 1
        );
    }
    webgl_entity_create({
      'entities': [
        properties,
      ],
    });
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

    let tile_count = core_random_integer({
      'max': args['tiles-max'] - args['tiles-min'] + 1,
    }) + args['tiles-min'];
    let tile_offset_x = args['translate-x'];
    let tile_offset_y = args['translate-y'];
    let tile_offset_z = args['translate-z'];
    let tile_rotate_x = args['rotate-x'];
    let tile_rotate_y = args['rotate-y'];
    let tile_rotate_z = args['rotate-z'];
    let tiles = args['tiles'].length;

    for(let tile = 0; tile < tile_count; tile++){
        let character_id = args['prefix'] + '-tile-' + tile;
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
        let selected = core_random_integer({
          'max': tiles,
        });

        let entities = args['tiles'][selected]['entities'];
        for(let entity in entities){
            let properties = {
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
