'use strict';

function race_racer_create(properties){
    properties = properties || {};

    properties['acceleration'] = properties['acceleration'] || .01;
    properties['angle'] = properties['angle'] || 0;
    properties['color'] = properties['color'] || '#fff';
    properties['lap'] = properties['lap'] || 0;
    properties['speed'] = properties['speed'] || 0;
    properties['speed-max'] = properties['speed-max'] || 2;
    properties['target'] = properties['target'] || 0;
    properties['turn'] = properties['turn'] || .04;
    properties['x'] = properties['x'] || 0;
    properties['y'] = properties['y'] || 0;
    properties['z'] = properties['z'] || 0;

    race_racers.push(properties);
}

var race_checkpoints = [];
var race_racers = [];
var race_walls = [];
