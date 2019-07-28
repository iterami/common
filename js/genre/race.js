'use strict';

function race_init(){
    entity_set({
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
      'type': 'racer',
    });
}

// Required args: id
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
      'types': [
        'racer',
      ],
    });
}

function race_unload(){
    race_checkpoints.length = 0;
    entity_entities.length = 0;
}

window.race_checkpoints = [];
