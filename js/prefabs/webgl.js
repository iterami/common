'use strict';

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
