'use strict';

function race_init(){
    entity_set({
      'default': true,
      'properties': {
        'acceleration': .01,
        'ai': true,
        'angle': 0,
        'color': '#fff',
        'lap': 0,
        'speed': 0,
        'speed-max': 2,
        'target': 0,
        'turn': .02,
        'x': 0,
        'y': 0,
        'z': 0,
      },
      'type': '_racer',
    });
}

// Required args: id
// Optional args: properties
function race_racer_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
      },
    });

    entity_create({
      'id': args['id'],
      'properties': args['properties'],
    });
}

var race_checkpoints = [];
