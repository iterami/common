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

    for(let i = 0; i < args['length-half'] * 2; i += args['frequency']){
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

    let half_base = args['width-base'] / 2;
    let half_leaf = args['width-leaf'] / 2;

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

// Optional args: color
function data_webgl_skybox(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color': webgl_vertexcolorarray(),
      },
    });

    core_entity_create({
      'id': 'skybox-back',
      'properties': {
        'rotate-x': 270,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'entity': 'skybox-back',
      'offset-z': 5,
      'to': '_me',
      'type': 'character',
    });
    core_entity_create({
      'id': 'skybox-bottom',
      'properties': {
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'entity': 'skybox-bottom',
      'offset-y': -5,
      'to': '_me',
      'type': 'character',
    });
    core_entity_create({
      'id': 'skybox-front',
      'properties': {
        'rotate-x': 90,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'entity': 'skybox-front',
      'offset-z': -5,
      'to': '_me',
      'type': 'character',
    });
    core_entity_create({
      'id': 'skybox-left',
      'properties': {
        'rotate-z': 270,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'entity': 'skybox-left',
      'offset-x': -5,
      'to': '_me',
      'type': 'character',
    });
    core_entity_create({
      'id': 'skybox-right',
      'properties': {
        'rotate-z': 90,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'entity': 'skybox-right',
      'offset-x': 5,
      'to': '_me',
      'type': 'character',
    });
    core_entity_create({
      'id': 'skybox-top',
      'properties': {
        'rotate-x': 180,
        'vertex-colors': args['color'],
        'vertices': [
          5, 0, -5, 1,
          -5, 0, -5, 1,
          -5, 0, 5, 1,
          5, 0, 5, 1,
        ],
      },
    });
    webgl_attach({
      'entity': 'skybox-top',
      'offset-y': 5,
      'to': '_me',
      'type': 'character',
    });

    core_group_move({
      'entities': [
        'skybox-back',
        'skybox-bottom',
        'skybox-front',
        'skybox-left',
        'skybox-right',
        'skybox-top',
      ],
      'from': 'foreground',
      'to': 'skybox',
    });
}


// Optional args: color, id, length, length-step, width, width-step, x, y, z
function data_webgl_terrain_3d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color': .5,
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

    let color = [];
    let start_x = (-args['length'] / 2) * args['width-step'];
    let start_z = (-args['width'] / 2) * args['length-step'];
    let textureData = [];
    let vertices = [];

    for(let i = 0; i < args['length']; i++){
        let step = i * args['length-step'];
        for(let j = 0; j < args['width']; j++){
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
              1,
              start_x + j * args['width-step'],
              args['y'],
              start_z + step + args['length-step'],
              1
            );
        }
    }

    core_entity_create({
      'id': args['id'],
      'properties': {
        'draw-type': 'TRIANGLE_STRIP',
        'textureData': textureData,
        'translate-x': args['x'],
        'translate-y': args['y'],
        'translate-z': args['z'],
        'vertex-colors': color,
        'vertices': vertices,
      },
    });
}

// Optional args: billboard, color-base, color-leaf, dx, dy, dz, id, x, y, z
function data_webgl_tree_2d(args){
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
        'id': core_uid(),
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    core_entity_create({
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
    core_entity_create({
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
          .4, .2, 0, 1,
          .4, .2, 0, 1,
          .4, .2, 0, 1,
          .4, .2, 0, 1,
        ],
        'color-leaf': [
          .1, .3, .1, 1,
          .1, .3, .1, 1,
          .1, .3, .1, 1,
          .1, .3, .1, 1,
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
