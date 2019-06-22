'use strict';

// Required args: id,
function prefabs_canvas_fence_2d(args){
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
function prefabs_canvas_tree_2d(args){
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
