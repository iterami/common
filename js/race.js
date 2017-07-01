'use strict';

function race_init(){
    core_entity_set({
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

    core_entity_create({
      'id': args['id'],
      'properties': args['properties'],
    });
}

function race_unload(){
    race_checkpoints.length = 0;
    core_entities.length = 0;
}

var race_checkpoints = [];
