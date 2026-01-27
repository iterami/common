'use strict';

function prefabs_webgl_cuboid_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'groups': [],
        'leaf_collision': true,
        'leaf_color': [
          0, 1, 0, 1,
        ],
        'leaf_size_x': 10,
        'leaf_size_y': 10,
        'leaf_size_z': 10,
        'leaf_texture': 'lavaleaf.png',
        'prefix': entity_id_count,
        'trunk_collision': true,
        'trunk_color': [
          .8, .4, 0, 1,
        ],
        'trunk_size_x': 2,
        'trunk_size_y': 10,
        'trunk_size_z': 2,
        'trunk_texture': 'wood.png',
      },
    });

    const prefab_args = webgl_prefab_args(args);
    webgl_primitive_cuboid({
      ...prefab_args,
      'all': {
        'collision': args.trunk_collision,
        'texture': args.trunk_texture,
        'texture_y': 2,
        'vertex_colors': args.trunk_color,
      },
      'bottom': {
        'exclude': true,
      },
      'character': args.character,
      'left': {
        'texture_align': '10110100',
      },
      'position_x': prefab_args.position_x,
      'position_y': prefab_args.position_y + args.trunk_size_y / 2,
      'position_z': prefab_args.position_z,
      'prefix': args.prefix + '_trunk',
      'right': {
        'texture_align': '10110100',
      },
      'size_x': args.trunk_size_x,
      'size_y': args.trunk_size_y,
      'size_z': args.trunk_size_z,
      'top': {
        'exclude': true,
      },
    });
    webgl_primitive_cuboid({
      ...prefab_args,
      'all': {
        'collision': args.leaf_collision,
        'texture': args.leaf_texture,
        'vertex_colors': args.leaf_color,
      },
      'character': args.character,
      'position_y': prefab_args.position_y + args.trunk_size_y + args.leaf_size_y / 2,
      'prefix': args.prefix + '_leaf',
      'size_x': args.leaf_size_x,
      'size_y': args.leaf_size_y,
      'size_z': args.leaf_size_z,
    });
}

function prefabs_webgl_frustum_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bottom': false,
        'character': webgl_character_base,
        'groups': [],
        'height': 20,
        'height_range': 0,
        'leaf_color_bottom': [
          .05, .15, .05, 1,
        ],
        'leaf_color_top': [
          .1, .3, .1, 1,
        ],
        'leaf_count': 3,
        'leaf_points': 3,
        'leaf_separate': 4,
        'leaf_size': 4,
        'prefix': entity_id_count,
        'trunk_color': [
          .4, .2, 0, 1,
        ],
        'trunk_points': 4,
        'trunk_size': 1,
      },
    });

    const height = Math.random() * args.height_range + args.height;
    const prefab_args = webgl_prefab_args(args);

    webgl_primitive_frustum({
      ...prefab_args,
      'character': args.character,
      'color_bottom': args.trunk_color,
      'color_top': args.trunk_color,
      'length': height,
      'points': args.trunk_points,
      'prefix': args.prefix + '_trunk',
      'size_bottom': args.trunk_size,
      'size_top': 0,
    });

    const leaf_height = height / args.leaf_count;
    for(let i = 0; i < args.leaf_count; i++){
        webgl_primitive_frustum({
          ...prefab_args,
          'bottom': args.bottom,
          'character': args.character,
          'color_bottom': args.leaf_color_bottom,
          'color_top': args.leaf_color_top,
          'length': leaf_height,
          'points': args.leaf_points,
          'position_x': prefab_args.position_x,
          'position_y': prefab_args.position_y + height - leaf_height - (args.leaf_separate * i),
          'position_z': prefab_args.position_z,
          'prefix': args.prefix + '_leaf_' + i,
          'size_bottom': args.leaf_size,
          'size_top': 0,
        });
    }
}

function prefabs_webgl_humanoid(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'groups': [],
        'prefix': entity_id_count,
        'scale': 1,
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
      'arm_left': [
        -3, 17, 0,
        -3, 14, 1,
        -3, 13, 3,
        -3, 12, 4,
      ],
      'arm_right': [
        3, 17, 0,
        3, 14, 1,
        3, 13, 3,
        3, 12, 4,
      ],
      'leg_left': [
        -2, 11, 0,
        -2, 6, 1,
        -2, 0, 0,
        -2, 0, 1,
      ],
      'leg_right': [
        2, 11, 0,
        2, 6, 1,
        2, 0, 0,
        2, 0, 1,
      ],
    };
    for(const part in bodyparts){
        for(let vertex = 0; vertex < bodyparts[part].length; vertex++){
            if(vertex === 0 || (vertex + 1) % 3 !== 0){
                bodyparts[part][vertex] *= args.scale;
            }
        }

        const prefab_args = webgl_prefab_args(args);
        webgl_entity_create({
          'character': args.character,
          'entities': [
            {
              ...prefab_args,
              'attach_type': 'webgl_characters',
              'attach_x': prefab_args.position_x,
              'attach_y': prefab_args.position_y,
              'attach_z': prefab_args.position_z,
              'draw_mode': 'LINE_STRIP',
              'collision': false,
              'id': args.prefix + '_' + part,
              'vertex_colors': webgl_vertexcolorarray({
                'vertexcount': bodyparts[part].length / 3,
              }),
              'vertices': bodyparts[part],
            },
          ],
          'groups': args.groups,
        });
    }
}

// Required args: path
function prefabs_webgl_lines_path(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'colors': [],
        'groups': [],
        'prefix': entity_id_count,
      },
    });

    if(!webgl_paths[args.path]){
        return;
    }

    if(args.colors.length === 0){
        args.colors.push([1, 1, 1, 1]);
    }

    let color = -1;
    let x = 0;
    let y = 0;
    let z = 0;
    const vertices = [];
    const vertex_colors = [];

    for(const point in webgl_paths[args.path].points){
        const point_x = webgl_paths[args.path].points[point].position_x;
        if(point_x !== void 0){
            x = point_x;
        }
        const point_y = webgl_paths[args.path].points[point].position_y;
        if(point_y !== void 0){
            y = point_y;
        }
        const point_z = webgl_paths[args.path].points[point].position_z;
        if(point_z !== void 0){
            z = point_z;
        }

        vertices.push(x, y, z);
        color++;
        if(color >= args.colors.length){
            color = 0;
        }
        vertex_colors.push(...args.colors[color]);
    }

    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...webgl_prefab_args(args),
          'attach_type': 'webgl_characters',
          'draw_mode': vertices.length === 3
            ? 'POINTS'
            : (webgl_paths[args.path].end !== 'loop'
              ? 'LINE_STRIP'
              : 'LINE_LOOP'),
          'collision': false,
          'id': args.prefix,
          'vertex_colors': vertex_colors,
          'vertices': vertices,
        },
      ],
      'groups': args.groups,
    });
}

function prefabs_webgl_lines_shrub(args){
    args = core_args({
      'args': args,
      'defaults': {
        'base_color': [
          .3, .15, 0, 1,
        ],
        'character': webgl_character_base,
        'draw_mode': 'LINE_STRIP',
        'groups': [],
        'leaf_color': [
          0, 1, 0, 1,
        ],
        'leaf_distance': 5,
        'points': 100,
        'prefix': entity_id_count,
        'type': 'range',
        'x_max': 5,
        'x_min': -5,
        'y_max': 5,
        'y_min': 0,
        'z_max': 5,
        'z_min': -5,
      },
    });

    const colors = [...args.base_color];
    const points = [
      0, 0, 0,
    ];
    let x = 0;
    let y = 0;
    let z = 0;

    for(let i = 1; i < args.points; i++){
        const random_x = Math.random() * (args.x_max - args.x_min) + args.x_min;
        const random_y = Math.random() * (args.y_max - args.y_min) + args.y_min;
        const random_z = Math.random() * (args.z_max - args.z_min) + args.z_min;

        if(args.type === 'range'){
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
          }) < args.leaf_distance){
            colors.push(...args.base_color);

        }else{
            colors.push(...args.leaf_color);
        }
    }

    const prefab_args = webgl_prefab_args(args);
    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
          'attach_type': 'webgl_characters',
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'draw_mode': prefab_args.draw_mode,
          'collision': false,
          'id': args.prefix,
          'vertex_colors': colors,
          'vertices': points,
        },
      ],
      'groups': args.groups,
    });
}

function prefabs_webgl_lines_tree(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'groups': [],
        'leaf_color': [
          0, .5, 0, 1,
        ],
        'prefix': entity_id_count,
        'trunk_branch_max': 4,
        'trunk_branch_min': 0,
        'trunk_color': [
          .4, .2, 0, 1,
        ],
        'trunk_count_max': 10,
        'trunk_count_min': 1,
        'trunk_length': 10,
        'trunk_width_max': 2,
        'trunk_width_min': 1,
      },
    });

    const prefab_args = webgl_prefab_args(args);
    const properties = {
      ...prefab_args,
      'attach_type': 'webgl_characters',
      'attach_x': prefab_args.position_x,
      'attach_y': prefab_args.position_y,
      'attach_z': prefab_args.position_z,
      'collision': false,
      'vertex_colors': args.trunk_color,
    };

    const trunk_count = core_random_integer(args.trunk_count_max - args.trunk_count_min + 1) + args.trunk_count_min;
    let trunk_width = args.trunk_width_max / 2;
    const trunk_width_decrease = (trunk_width - args.trunk_width_min / 2) / (trunk_count / 2);
    for(let trunk = 0; trunk < trunk_count; trunk++){
        properties.id = args.prefix + '_trunk_' + trunk;
        properties.billboard = args.billboard;
        properties.rotate_x = 0;
        properties.rotate_z = 0;
        properties.vertices = [
          trunk_width, args.trunk_length, 0,
          -trunk_width, args.trunk_length, 0,
          -trunk_width, 0, 0,
          trunk_width, 0, 0,
        ];
        webgl_entity_create({
          'character': args.character,
          'entities': [
            properties,
          ],
          'groups': args.groups,
        });

        properties.attach_y += 10;
        trunk_width -= trunk_width_decrease;

        const branch_count = core_random_integer(args.trunk_branch_max - args.trunk_branch_min + 1) + args.trunk_branch_min;
        const branch_length = args.trunk_length / 2;
        const branch_width = trunk_width / 2;
        for(let branch = 0; branch < branch_count; branch++){
            properties.id = args.prefix + '_trunk_' + trunk + '_branch_' + branch;
            properties.billboard = false;
            properties.rotate_x = Math.random() * 45 + 90;
            properties.rotate_z = Math.random() * 360;
            properties.vertices = [
              branch_width, branch_length, 0,
              -branch_width, branch_length, 0,
              -branch_width, 0, 0,
              branch_width, 0, 0,
            ];

            webgl_entity_create({
              'character': args.character,
              'entities': [
                properties,
              ],
              'groups': args.groups,
            });
        }
    }
}

function prefabs_webgl_trap(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': webgl_character_base,
        'color_active': [1, 0, 0, 1,],
        'color_inactive': [0, 0, 1, 1,],
        'frames_max_active': 50,
        'frames_max_inactive': 150,
        'frames_random_active': 0,
        'frames_random_inactive': 0,
        'groups': [],
        'prefix': entity_id_count,
        'size_x': 10,
        'size_y': 10,
        'size_z': 10,
      },
    });

    const prefab_args = webgl_prefab_args(args);

    const id_trap = args.prefix + '_trap';
    const half_x = args.size_x / 2;
    const half_z = args.size_z / 2;
    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
          'id': id_trap,
          'attach_type': 'webgl_characters',
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'event_todo': [
            {
              'stat': 'life',
              'todo': '_target',
              'type': 'character',
              'value': -1,
            },
          ],
          'vertex_colors': args.color_inactive,
          'vertices': [
            half_x, 0, -half_z,
            -half_x, 0, -half_z,
            -half_x, 0, half_z,
            half_x, 0, half_z
          ],
        },
      ],
      'groups': args.groups,
    });

    const id_active = args.prefix + '_active';
    const id_inactive = args.prefix + '_inactive';
    webgl_timer_add({
      'id': id_inactive,
      'frames_max': args.frames_max_inactive,
      'frames_random': args.frames_random_inactive,
      'repeat': -1,
      'event_repeat': [
        {
          'todo': 'webgl_timer_toggle',
          'type': 'function',
          'value': id_inactive,
        },
        {
          'stat': 'event_range',
          'todo': id_trap,
          'value': [half_x, args.size_y, half_z],
        },
        {
          'stat': 'vertex_colors',
          'todo': id_trap,
          'value': args.color_active,
        },
        {
          'todo': 'webgl_timer_toggle',
          'type': 'function',
          'value': id_active,
        },
      ],
    });
    webgl_timer_add({
      'id': id_active,
      'active': false,
      'frames_max': args.frames_max_active,
      'frames_random': args.frames_random_active,
      'repeat': -1,
      'event_repeat': [
        {
          'todo': 'webgl_timer_toggle',
          'type': 'function',
          'value': id_active,
        },
        {
          'stat': 'event_range',
          'todo': id_trap,
          'value': false,
        },
        {
          'stat': 'vertex_colors',
          'todo': id_trap,
          'value': args.color_inactive,
        },
        {
          'todo': 'webgl_timer_toggle',
          'type': 'function',
          'value': id_inactive,
        },
      ],
    });
}

function prefabs_webgl_tree_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'base_color': [
          .4, .2, 0, 1,
        ],
        'character': webgl_character_base,
        'groups': [],
        'height': 5,
        'height_range': 0,
        'leaf_color': [
          .1, .3, .1, 1,
        ],
        'prefix': entity_id_count,
        'width_base': 1,
        'width_leaf': 6,
      },
    });

    const height = Math.random() * args.height_range + args.height;
    const prefab_args = webgl_prefab_args(args);
    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
          'attach_type': 'webgl_characters',
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'billboard': prefab_args.billboard,
          'collision': false,
          'id': args.prefix + '_base',
          'vertex_colors': args.base_color,
          'vertices': [
            args.width_base / 2, 0, -.1,
            0, height * .9, -.1,
            -args.width_base / 2, 0, -.1,
          ],
        },
        {
          ...prefab_args,
          'attach_type': 'webgl_characters',
          'attach_x': prefab_args.position_x,
          'attach_y': prefab_args.position_y,
          'attach_z': prefab_args.position_z,
          'billboard': prefab_args.billboard,
          'collision': false,
          'draw_mode': 'TRIANGLES',
          'id': args.prefix + '_leaf',
          'vertex_colors': args.leaf_color,
          'vertices': [
            args.width_leaf / 2, height * .1, 0,
            0, height, 0,
            -args.width_leaf / 2, height * .1, 0,
          ],
        },
      ],
      'groups': args.groups,
    });
}
