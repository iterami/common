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

    const fence = [
      {
        'color': args['color'],
        'vertices': [
          [
            'moveTo',
            -args['length-half'],
            -20,
          ],
          [
            'lineTo',
            args['length-half'],
            -20,
          ],
          [
            'lineTo',
            args['length-half'],
            -15,
          ],
          [
            'lineTo',
            -args['length-half'],
            -15,
          ],
        ],
        'x': args['x'],
        'y': args['y'],
      },
    ];

    for(let i = 0; i < args['length-half'] * 2; i += args['frequency']){
        fence.push({
          'color': args['color'],
          'vertices': [
            [
              'moveTo',
              -5,
              -25,
            ],
            [
              'lineTo',
              5,
              -25,
            ],
            [
              'lineTo',
              5,
              0,
            ],
            [
              'lineTo',
              -5,
              0,
            ],
          ],
          'y': args['y'],
          'x': args['x'] - args['length-half'] + i,
        });
    }

    return fence;
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

    const half_base = args['width-base'] / 2;
    const half_leaf = args['width-leaf'] / 2;

    return [
      {
        'color': args['color-base'],
        'vertices': [
          [
            'moveTo',
            -half_base,
            -args['height-base'],
          ],
          [
            'lineTo',
            half_base,
            -args['height-base'],
          ],
          [
            'lineTo',
            half_base,
            0,
          ],
          [
            'lineTo',
            -half_base,
            0,
          ],
        ],
        'x': args['x'],
        'y': args['y'],
      },
      {
        'color': args['color-leaf'],
        'vertices': [
          [
            'moveTo',
            -half_leaf,
            -args['height-leaf'],
          ],
          [
            'lineTo',
            half_leaf,
            -args['height-leaf'],
          ],
          [
            'lineTo',
            half_leaf,
            0,
          ],
          [
            'lineTo',
            -half_leaf,
            0,
          ],
        ],
        'x': args['x'],
        'y': args['y'] - args['height-base'],
      },
    ];
}
