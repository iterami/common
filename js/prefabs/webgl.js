'use strict';

function prefabs_webgl_cuboid_tree(args){
    core_object_defaults({
      'object': args,
      'defaults': {
        'character': webgl_character_base,
        'groups': [],
        'leaf_collision': true,
        'leaf_color': [0, 1, 0, 1],
        'leaf_size_x': 10,
        'leaf_size_y': 10,
        'leaf_size_z': 10,
        'leaf_texture': 'lavaleaf.png',
        'prefix': entity_id_count,
        'trunk_collision': true,
        'trunk_color': [.8, .4, 0, 1],
        'trunk_size_x': 2,
        'trunk_size_y': 10,
        'trunk_size_z': 2,
        'trunk_texture': 'wood.png',
      },
    });
    const prefab_args = webgl_prefab_args(args);

    webgl_primitive_cuboid({
      ...prefab_args,
      'bottom': false,
      'character': args.character,
      'collision': args.trunk_collision,
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
      'texture': args.trunk_texture,
      'texture_y': 2,
      'top': false,
      'vertex_colors': args.trunk_color,
    });
    webgl_primitive_cuboid({
      ...prefab_args,
      'character': args.character,
      'collision': args.leaf_collision,
      'position_y': prefab_args.position_y + args.trunk_size_y + args.leaf_size_y / 2,
      'prefix': args.prefix + '_leaf',
      'size_x': args.leaf_size_x,
      'size_y': args.leaf_size_y,
      'size_z': args.leaf_size_z,
      'texture': args.leaf_texture,
      'vertex_colors': args.leaf_color,
    });
}

function prefabs_webgl_football_pitch(args){
    core_object_defaults({
      'object': args,
      'defaults': {
        'character': webgl_character_base,
        'circle_radius': 9.15,
        'corner_radius': 1,
        'flag_color': [1, 1, 1, 1],
        'flag_height': 1.5,
        'goal_color': [1, 1, 1, 1],
        'goal_height': 2.44,
        'goal_width': 7.32,
        'goalbox_length': 5.5,
        'goalbox_width': 18.32,
        'grass_color': [0, .3, 0, 1],
        'groups': [],
        'line_color': [1, 1, 1, 1],
        'line_height': .03,
        'line_width': .12,
        'penalty_distance': 11,
        'penaltybox_length': 16.5,
        'penaltybox_width': 40.32,
        'pitch_length': 105,
        'pitch_width': 64,
        'prefix': entity_id_count,
        'scaling': 1,
        'spot_radius': .15,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const circle_radius = args.circle_radius * args.scaling;
    const corner_radius = args.corner_radius * args.scaling;
    const flag_height = args.flag_height * args.scaling;
    const goal_height = args.goal_height * args.scaling;
    const goal_width_half = (args.goal_width / 2) * args.scaling;
    const goalbox_length = args.goalbox_length * args.scaling;
    const goalbox_width_half = (args.goalbox_width / 2) * args.scaling;
    const half_length = (args.pitch_length / 2) * args.scaling;
    const half_width = (args.pitch_width / 2) * args.scaling;
    const line_height = args.line_height;
    const line_width = args.line_width * args.scaling;
    const line_width_half = line_width / 2;
    const penalty_distance = half_length - args.penalty_distance * args.scaling;
    const penaltybox_length = args.penaltybox_length * args.scaling;
    const penaltybox_width_half = (args.penaltybox_width / 2) * args.scaling;
    const penaltyarc_width_half = Math.sqrt(circle_radius ** 2 - (penaltybox_length - args.penalty_distance * args.scaling) ** 2);
    const spot_radius = args.spot_radius * args.scaling;

    const flag_properties = {
      ...prefab_args,
      //'billboard': true,
      'collision': false,
      'draw_mode': 'TRIANGLE_FAN',
      'vertex_colors': args.flag_color,
    };
    const goal_properties = {
      ...prefab_args,
      'collision': false,
      'draw_mode': 'LINE_STRIP',
      'vertex_colors': args.goal_color,
    };
    const line_properties = {
      ...prefab_args,
      'collision': false,
      'draw_mode': 'TRIANGLE_STRIP',
      'vertex_colors': args.line_color,
    };

    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
          'id': args.prefix + '_grass',
          'vertex_colors': args.grass_color,
          'vertices': [
            half_length, 0, -half_width,
            -half_length, 0, -half_width,
            -half_length, 0, half_width,
            half_length, 0, half_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_outer',
          'vertices': [
            half_length - line_width, line_height, -half_width + line_width,
            half_length, line_height, -half_width,
            -half_length + line_width, line_height, -half_width + line_width,
            -half_length, line_height, -half_width,
            -half_length + line_width, line_height, half_width - line_width,
            -half_length, line_height, half_width,
            half_length - line_width, line_height, half_width - line_width,
            half_length, line_height, half_width,
            half_length - line_width, line_height, -half_width + line_width,
            half_length, line_height, -half_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_half',
          'vertices': [
            line_width_half, line_height, -half_width + line_width,
            -line_width_half, line_height, -half_width + line_width,
            line_width_half, line_height, half_width - line_width,
            -line_width_half, line_height, half_width - line_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_circle_centre',
          'vertices': [
            circle_radius - line_width, line_height, -circle_radius + line_width,
            circle_radius, line_height, -circle_radius,
            -circle_radius + line_width, line_height, -circle_radius + line_width,
            -circle_radius, line_height, -circle_radius,
            -circle_radius + line_width, line_height, circle_radius - line_width,
            -circle_radius, line_height, circle_radius,
            circle_radius - line_width, line_height, circle_radius - line_width,
            circle_radius, line_height, circle_radius,
            circle_radius - line_width, line_height, -circle_radius + line_width,
            circle_radius, line_height, -circle_radius,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_spot_centre',
          'vertices': [
            spot_radius, line_height, -spot_radius,
            -spot_radius, line_height, -spot_radius,
            spot_radius, line_height, spot_radius,
            -spot_radius, line_height, spot_radius,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_goalbox_0',
          'vertices': [
            -half_length + line_width, line_height, -goalbox_width_half,
            -half_length + line_width, line_height, -goalbox_width_half + line_width,
            -half_length + goalbox_length, line_height, -goalbox_width_half,
            -half_length + goalbox_length - line_width, line_height, -goalbox_width_half + line_width,
            -half_length + goalbox_length, line_height, goalbox_width_half,
            -half_length + goalbox_length - line_width, line_height, goalbox_width_half - line_width,
            -half_length + line_width, line_height, goalbox_width_half,
            -half_length + line_width, line_height, goalbox_width_half - line_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_goalbox_1',
          'vertices': [
            half_length - line_width, line_height, -goalbox_width_half + line_width,
            half_length - line_width, line_height, -goalbox_width_half,
            half_length - goalbox_length + line_width, line_height, -goalbox_width_half + line_width,
            half_length - goalbox_length, line_height, -goalbox_width_half,
            half_length - goalbox_length + line_width, line_height, goalbox_width_half - line_width,
            half_length - goalbox_length, line_height, goalbox_width_half,
            half_length - line_width, line_height, goalbox_width_half - line_width,
            half_length - line_width, line_height, goalbox_width_half,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_penaltybox_0',
          'vertices': [
            -half_length + line_width, line_height, -penaltybox_width_half,
            -half_length + line_width, line_height, -penaltybox_width_half + line_width,
            -half_length + penaltybox_length, line_height, -penaltybox_width_half,
            -half_length + penaltybox_length - line_width, line_height, -penaltybox_width_half + line_width,
            -half_length + penaltybox_length, line_height, penaltybox_width_half,
            -half_length + penaltybox_length - line_width, line_height, penaltybox_width_half - line_width,
            -half_length + line_width, line_height, penaltybox_width_half,
            -half_length + line_width, line_height, penaltybox_width_half - line_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_penaltybox_1',
          'vertices': [
            half_length - line_width, line_height, -penaltybox_width_half + line_width,
            half_length - line_width, line_height, -penaltybox_width_half,
            half_length - penaltybox_length + line_width, line_height, -penaltybox_width_half + line_width,
            half_length - penaltybox_length, line_height, -penaltybox_width_half,
            half_length - penaltybox_length + line_width, line_height, penaltybox_width_half - line_width,
            half_length - penaltybox_length, line_height, penaltybox_width_half,
            half_length - line_width, line_height, penaltybox_width_half - line_width,
            half_length - line_width, line_height, penaltybox_width_half,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_penaltyarc_0',
          'vertices': [
            -half_length + penaltybox_length, line_height, -penaltyarc_width_half,
            -half_length + penaltybox_length, line_height, -penaltyarc_width_half + line_width,
            -penalty_distance + circle_radius, line_height, -penaltyarc_width_half,
            -penalty_distance + circle_radius - line_width, line_height, -penaltyarc_width_half + line_width,
            -penalty_distance + circle_radius, line_height, penaltyarc_width_half,
            -penalty_distance + circle_radius - line_width, line_height, penaltyarc_width_half - line_width,
            -half_length + penaltybox_length, line_height, penaltyarc_width_half,
            -half_length + penaltybox_length, line_height, penaltyarc_width_half - line_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_penaltyarc_1',
          'vertices': [
            half_length - penaltybox_length, line_height, -penaltyarc_width_half + line_width,
            half_length - penaltybox_length, line_height, -penaltyarc_width_half,
            penalty_distance - circle_radius + line_width, line_height, -penaltyarc_width_half + line_width,
            penalty_distance - circle_radius, line_height, -penaltyarc_width_half,
            penalty_distance - circle_radius + line_width, line_height, penaltyarc_width_half - line_width,
            penalty_distance - circle_radius, line_height, penaltyarc_width_half,
            half_length - penaltybox_length, line_height, penaltyarc_width_half - line_width,
            half_length - penaltybox_length, line_height, penaltyarc_width_half,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_spot_penalty_0',
          'vertices': [
            -penalty_distance + spot_radius, line_height, -spot_radius,
            -penalty_distance - spot_radius, line_height, -spot_radius,
            -penalty_distance + spot_radius, line_height, spot_radius,
            -penalty_distance - spot_radius, line_height, spot_radius,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_spot_penalty_1',
          'vertices': [
            penalty_distance + spot_radius, line_height, -spot_radius,
            penalty_distance - spot_radius, line_height, -spot_radius,
            penalty_distance + spot_radius, line_height, spot_radius,
            penalty_distance - spot_radius, line_height, spot_radius,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_corner_00',
          'vertices': [
            -half_length + corner_radius, line_height, -half_width + line_width,
            -half_length + corner_radius - line_width, line_height, -half_width + line_width,
            -half_length + corner_radius, line_height, -half_width + corner_radius,
            -half_length + corner_radius - line_width, line_height, -half_width + corner_radius - line_width,
            -half_length + line_width, line_height, -half_width + corner_radius,
            -half_length + line_width, line_height, -half_width + corner_radius - line_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_corner_01',
          'vertices': [
            -half_length + line_width, line_height, half_width - corner_radius,
            -half_length + line_width, line_height, half_width - corner_radius + line_width,
            -half_length + corner_radius, line_height, half_width - corner_radius,
            -half_length + corner_radius - line_width, line_height, half_width - corner_radius + line_width,
            -half_length + corner_radius, line_height, half_width - line_width,
            -half_length + corner_radius - line_width, line_height, half_width - line_width,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_corner_10',
          'vertices': [
            half_length - corner_radius + line_width, line_height, -half_width + line_width,
            half_length - corner_radius, line_height, -half_width + line_width,
            half_length - corner_radius + line_width, line_height, -half_width + corner_radius - line_width,
            half_length - corner_radius, line_height, -half_width + corner_radius,
            half_length - line_width, line_height, -half_width + corner_radius - line_width,
            half_length - line_width, line_height, -half_width + corner_radius,
          ],
        },
        {
          ...line_properties,
          'id': args.prefix + '_line_corner_11',
          'vertices': [
            half_length - line_width, line_height, half_width - corner_radius + line_width,
            half_length - line_width, line_height, half_width - corner_radius,
            half_length - corner_radius + line_width, line_height, half_width - corner_radius + line_width,
            half_length - corner_radius, line_height, half_width - corner_radius,
            half_length - corner_radius + line_width, line_height, half_width - line_width,
            half_length - corner_radius, line_height, half_width - line_width,
          ],
        },
        {
          ...flag_properties,
          'id': args.prefix + '_flag_corner_00',
          'vertices': [
            -half_length, flag_height * .8, -half_width,
            -half_length + flag_height * .2, flag_height * .9, -half_width,
            -half_length, flag_height, -half_width,
            -half_length - flag_height * .02, 0, -half_width,
            -half_length + flag_height * .02, 0, -half_width,
          ],
        },
        {
          ...flag_properties,
          'id': args.prefix + '_flag_corner_01',
          'vertices': [
            -half_length, flag_height * .8, half_width,
            -half_length + flag_height * .2, flag_height * .9, half_width,
            -half_length, flag_height, half_width,
            -half_length - flag_height * .02, 0, half_width,
            -half_length + flag_height * .02, 0, half_width,
          ],
        },
        {
          ...flag_properties,
          'id': args.prefix + '_flag_corner_10',
          'vertices': [
            half_length, flag_height * .8, -half_width,
            half_length + flag_height * .2, flag_height * .9, -half_width,
            half_length, flag_height, -half_width,
            half_length - flag_height * .02, 0, -half_width,
            half_length + flag_height * .02, 0, -half_width,
          ],
        },
        {
          ...flag_properties,
          'id': args.prefix + '_flag_corner_11',
          'vertices': [
            half_length, flag_height * .8, half_width,
            half_length + flag_height * .2, flag_height * .9, half_width,
            half_length, flag_height, half_width,
            half_length - flag_height * .02, 0, half_width,
            half_length + flag_height * .02, 0, half_width,
          ],
        },
        {
          ...goal_properties,
          'id': args.prefix + '_goal_0',
          'vertices': [
            -half_length, 0, -goal_width_half,
            -half_length, goal_height, -goal_width_half,
            -half_length, goal_height, goal_width_half,
            -half_length, 0, goal_width_half,
          ],
        },
        {
          ...goal_properties,
          'id': args.prefix + '_goal_1',
          'vertices': [
            half_length, 0, -goal_width_half,
            half_length, goal_height, -goal_width_half,
            half_length, goal_height, goal_width_half,
            half_length, 0, goal_width_half,
          ],
        },
      ],
      'groups': args.groups,
    });
}

function prefabs_webgl_frustum_tree(args){
    core_object_defaults({
      'object': args,
      'defaults': {
        'bottom': false,
        'character': webgl_character_base,
        'groups': [],
        'height': 20,
        'height_range': 0,
        'leaf_color_bottom': [.05, .15, .05, 1],
        'leaf_color_top': [.1, .3, .1, 1],
        'leaf_count': 3,
        'leaf_points': 3,
        'leaf_separate': 4,
        'leaf_size': 4,
        'prefix': entity_id_count,
        'trunk_color': [.4, .2, 0, 1],
        'trunk_points': 4,
        'trunk_size': 1,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const height = Math.random() * args.height_range + args.height;
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
    core_object_defaults({
      'object': args,
      'defaults': {
        'character': webgl_character_base,
        'groups': [],
        'prefix': entity_id_count,
        'scale': 1,
      },
    });
    const prefab_args = webgl_prefab_args(args);

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

        webgl_entity_create({
          'character': args.character,
          'entities': [
            {
              ...prefab_args,
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
    core_object_defaults({
      'object': args,
      'defaults': {
        'character': webgl_character_base,
        'colors': [],
        'groups': [],
        'prefix': entity_id_count,
      },
    });
    const prefab_args = webgl_prefab_args(args);

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
        if(++color >= args.colors.length){
            color = 0;
        }
        vertex_colors.push(...args.colors[color]);
    }

    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
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
    core_object_defaults({
      'object': args,
      'defaults': {
        'base_color': [.3, .15, 0, 1],
        'character': webgl_character_base,
        'draw_mode': 'LINE_STRIP',
        'groups': [],
        'leaf_color': [0, 1, 0, 1],
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
    const prefab_args = webgl_prefab_args(args);

    const colors = [...args.base_color];
    const points = [0, 0, 0];
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

        points.push(x, y, z);
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

    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
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
    core_object_defaults({
      'object': args,
      'defaults': {
        'character': webgl_character_base,
        'groups': [],
        'leaf_color': [0, .5, 0, 1],
        'prefix': entity_id_count,
        'trunk_branch_max': 4,
        'trunk_branch_min': 0,
        'trunk_color': [.4, .2, 0, 1],
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
          'entities': [properties],
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
              'entities': [properties],
              'groups': args.groups,
            });
        }
    }
}

function prefabs_webgl_trap(args){
    core_object_defaults({
      'object': args,
      'defaults': {
        'character': webgl_character_base,
        'color_active': [1, 0, 0, 1],
        'color_inactive': [0, 0, 1, 1],
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
    core_object_defaults({
      'object': args,
      'defaults': {
        'base_color': [.4, .2, 0, 1],
        'character': webgl_character_base,
        'groups': [],
        'height': 5,
        'height_range': 0,
        'leaf_color': [.1, .3, .1, 1],
        'prefix': entity_id_count,
        'width_base': 1,
        'width_leaf': 6,
      },
    });
    const prefab_args = webgl_prefab_args(args);

    const height = Math.random() * args.height_range + args.height;
    webgl_entity_create({
      'character': args.character,
      'entities': [
        {
          ...prefab_args,
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
