'use strict';

// Required args: id,
function data_canvas_fence_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color': '#777',
        'frequency': 60,
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

// Required args: id
function data_canvas_tree_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'color-base': '#be6400',
        'color-leaf': '#' + core_random_hex(),
        'height-base': 25,
        'height-leaf': 75,
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

// Required args: id,
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
