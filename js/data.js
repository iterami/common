'use strict';

// Optional args: color, frequency, id, length-half, x, y
function data_canvas_fence_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color': '#777',
        'frequency': 60,
        'id': core_uid(),
        'length-half': 25,
        'x': 0,
        'y': 0,
      },
    });

    scenery.push({
      'color': args['color'],
      'vertices': [
        {
          'type': 'moveTo',
          'x': -args['length-half'],
          'y': -20,
        },
        {
          'x': args['length-half'],
          'y': -20,
        },
        {
          'x': args['length-half'],
          'y': -15,
        },
        {
          'x': -args['length-half'],
          'y': -15,
        },
      ],
      'x': args['x'],
      'y': args['y'],
    });

    for(var i = 0; i < args['length-half'] * 2; i += args['frequency']){
        scenery.push({
          'color': args['color'],
          'vertices': [
            {
              'type': 'moveTo',
              'x': -5,
              'y': -25,
            },
            {
              'x': 5,
              'y': -25,
            },
            {
              'x': 5,
            },
            {
              'x': -5,
            },
          ],
          'y': args['y'],
          'x': args['x'] - args['length-half'] + i,
        });
    }
}

// Optional args: color-base, color-leaf, half-base, half-leaf, id, x, y
function data_canvas_tree_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color-base': '#be6400',
        'color-leaf': '#' + core_random_hex(),
        'height-base': 25,
        'height-leaf': 75,
        'id': core_uid(),
        'width-base': 25,
        'width-leaf': 75,
        'x': 0,
        'y': 0,
      },
    });

    var half_base = args['width-base'] / 2;
    var half_leaf = args['width-leaf'] / 2;

    scenery.push({
      'color': args['color-base'],
      'vertices': [
        {
          'type': 'moveTo',
          'x': -half_base,
          'y': -args['height-base'],
        },
        {
          'x': half_base,
          'y': -args['height-base'],
        },
        {
          'x': half_base,
        },
        {
          'x': -half_base,
        },
      ],
      'x': args['x'],
      'y': args['y'],
    },
    {
      'color': args['color-leaf'],
      'vertices': [
        {
          'type': 'moveTo',
          'x': -half_leaf,
          'y': -args['height-leaf'],
        },
        {
          'x': half_leaf,
          'y': -args['height-leaf'],
        },
        {
          'x': half_leaf,
        },
        {
          'x': -half_leaf,
        },
      ],
      'x': args['x'],
      'y': args['y'] - args['height-base'],
    });
}

// Optional args: collision, color, dx, dy, dz, exclude, id, side, x, y, z
function data_webgl_cube_3d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'collision': false,
        'color': webgl_vertexcolorarray(),
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'exclude': [],
        'id': core_uid(),
        'side': 1,
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    var properties = {
      'collision': args['collision'],
      'color': args['color'],
      'dx': args['dx'],
      'dy': args['dy'],
      'dz': args['dz'],
      'position': {
        'x': args['x'],
        'y': args['y'],
        'z': args['z'],
      },
      'rotate': {},
      'vertices': [
        args['side'], 0, -args['side'],
        -args['side'], 0, -args['side'],
        -args['side'], 0, args['side'],
        args['side'], 0, args['side'],
      ],
    };

    var entities = [];

    properties['position']['y'] = args['y'] + args['side'];
    if(args['exclude'].indexOf(0) === -1){
        core_entity_create({
          'id': 'webgl-cube_' + args['id'] + '_0',
          'properties': properties,
        });
        entities.push('webgl-cube_' + args['id'] + '_0');
    }
    properties['position']['y'] = args['y'] - args['side'];
    properties['rotate']['z'] = 180;
    if(args['exclude'].indexOf(1) === -1){
        core_entity_create({
          'id': 'webgl-cube_' + args['id'] + '_1',
          'properties': properties,
        });
        entities.push('webgl-cube_' + args['id'] + '_1');
    }
    properties['position']['x'] = args['x'] + args['side'];
    properties['position']['y'] = args['y'];
    properties['rotate']['z'] = 270;
    if(args['exclude'].indexOf(2) === -1){
        core_entity_create({
          'id': 'webgl-cube_' + args['id'] + '_2',
          'properties': properties,
        });
        entities.push('webgl-cube_' + args['id'] + '_2');
    }
    properties['position']['x'] = args['x'] - args['side'];
    properties['rotate']['z'] = 90;
    if(args['exclude'].indexOf(3) === -1){
        core_entity_create({
          'id': 'webgl-cube_' + args['id'] + '_3',
          'properties': properties,
        });
        entities.push('webgl-cube_' + args['id'] + '_3');
    }
    properties['position']['x'] = args['x'];
    properties['position']['z'] = args['z'] - args['side'];
    properties['rotate']['x'] = 90;
    properties['rotate']['z'] = 0;
    if(args['exclude'].indexOf(4) === -1){
        core_entity_create({
          'id': 'webgl-cube_' + args['id'] + '_4',
          'properties': properties,
        });
        entities.push('webgl-cube_' + args['id'] + '_4');
    }
    properties['position']['z'] = args['z'] + args['side'];
    properties['rotate']['x'] = 270;
    if(args['exclude'].indexOf(5) === -1){
        core_entity_create({
          'id': 'webgl-cube_' + args['id'] + '_5',
          'properties': properties,
        });
        entities.push('webgl-cube_' + args['id'] + '_5');
    }

    core_group_add({
      'entities': entities,
      'group': args['id'],
    });
}

// Optional args: color, id, length, length-step, width, width-step, x, y, z
function data_webgl_terrain_3d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color': 0.5,
        'id': core_uid(),
        'length': 10,
        'length-step': 1,
        'width': 10,
        'width-step': 1,
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    var color = [];
    var start_x = (-args['length'] / 2) * args['length-step'];
    var start_z = (-args['width'] / 2) * args['width-step'];
    var textureData = [];
    var vertices = [];

    for(var i = 0; i < args['length']; i++){
        var step = i * args['length-step'];
        for(var j = 0; j < args['width']; j++){
            color.push(
              args['color'],
              args['color'],
              args['color'],
              1,
              args['color'],
              args['color'],
              args['color'],
              1
            );
            textureData.push(
              0,
              1,
              0,
              1
            );
            vertices.push(
              start_x + j * args['width-step'],
              args['y'],
              start_z + step,
              start_x + j * args['width-step'],
              args['y'],
              start_z + step + 1
            );
        }
    }

    core_entity_create({
      'id': args['id'],
      'properties': {
        'color': color,
        'position': {
          'x': args['x'],
          'y': args['y'],
          'z': args['z'],
        },
        'mode': 'TRIANGLE_STRIP',
        'textureData': textureData,
        'vertices': vertices,
      },
    });
}

// Optional args: color-base, color-leaf, dx, dy, dz, id, x, y, z
function data_webgl_tree_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color-base': [
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
        ],
        'color-leaf': [
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
        ],
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'id': core_uid(),
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    core_entity_create({
      'id': 'webgl-tree_' + args['id'] + '_base',
      'properties': {
        'color': args['color-base'],
        'dx': args['dx'],
        'dy': args['dy'],
        'dz': args['dz'],
        'position': {
          'x': args['x'],
          'y': args['y'],
          'z': args['z'],
        },
        'rotate': {
          'x': 90,
        },
        'vertices': [
          1, 0, -1,
          -1, 0, -1,
          -1, 0, 0,
          1, 0, 0,
        ],
      },
    });
    core_entity_create({
      'id': 'webgl-tree_' + args['id'] + '_leaf',
      'properties': {
        'color': args['color-leaf'],
        'dx': args['dx'],
        'dy': args['dy'],
        'dz': args['dz'],
        'mode': 'TRIANGLES',
        'position': {
          'x': args['x'],
          'y': args['y'],
          'z': args['z'],
        },
        'rotate': {
          'x': 90,
        },
        'vertices': [
          3, 0, -1,
          0, 0, -5,
          -3, 0, -1,
        ],
      },
    });

    core_group_add({
      'entities': [
        'webgl-tree_' + args['id'] + '_base',
        'webgl-tree_' + args['id'] + '_leaf',
      ],
      'group': args['id'],
    });
}

// Optional args: collision, color-base, color-leaf, dx, dy, dz, id, x, y, z
function data_webgl_tree_3d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'collision': false,
        'color-base': [
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
          0.4, 0.2, 0, 1,
        ],
        'color-leaf': [
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
        ],
        'dx': 0,
        'dy': 0,
        'dz': 0,
        'id': core_uid(),
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    data_webgl_cube_3d({
      'collision': args['collision'],
      'color': args['color-base'],
      'dx': args['dx'],
      'dy': args['dy'],
      'dz': args['dz'],
      'exclude': [
        0,
        1,
      ],
      'id': 'webgl-tree_' + args['id'] + '_base',
      'side': 1,
      'x': args['x'],
      'y': args['y'] + 1,
      'z': args['z'],
    });
    data_webgl_cube_3d({
      'collision': args['collision'],
      'color': args['color-leaf'],
      'dx': args['dx'],
      'dy': args['dy'],
      'dz': args['dz'],
      'id': 'webgl-tree_' + args['id'] + '_leaf',
      'side': 3,
      'x': args['x'],
      'y': args['y'] + 5,
      'z': args['z'],
    });
}
