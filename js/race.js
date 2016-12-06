'use strict';

// Optional args: properties
function race_racer_create(args){
    args = args || {};
    args['properties'] = args['properties'] || {};

    for(var property in race_racer_default){
        args['properties'][property] = args['properties'][property] || race_racer_default[property];
    }

    race_racers.push(args['properties']);
}

var race_checkpoints = [];
var race_racer_default = {
  'acceleration': .01,
  'angle': 0,
  'color': '#fff',
  'lap': 0,
  'speed': 0,
  'speed-max': 2,
  'target': 0,
  'turn': .04,
  'x': 0,
  'y': 0,
  'z': 0,
};
var race_racers = [];
var race_walls = [];
