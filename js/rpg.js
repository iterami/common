'use strict';

function create_npc(properties){
    properties = properties || {};

    properties['color'] = properties['color'] || '#fff';
    properties['friendly'] = properties['friendly'] || false;
    properties['height'] = properties['height'] || 20;
    properties['height-half'] = properties['height'] / 2;
    properties['width'] = properties['width'] || 20;
    properties['width-half'] = properties['width'] / 2;
    properties['x'] = properties['x'] || 0;
    properties['y'] = properties['y'] || 0;

    properties['stats'] = properties['stats'] || {};
      properties['stats']['health'] = properties['stats']['health'] || {};
        properties['stats']['health']['current'] = properties['stats']['health']['current'] || 1;
        properties['stats']['health']['max'] = properties['stats']['health']['max'] || 1;

    properties['selected'] = properties['selected'] || void 0;
    properties['spellbook'] = properties['spellbook'] || {};

    npcs.push(properties);
}

function create_particle(properties){
    properties = properties || {};

    properties['color'] = properties['color'] || '#fff';
    properties['damage'] = properties['damage'] || 1;
    properties['dx'] = properties['dx'] || 0;
    properties['dy'] = properties['dy'] || 0;
    properties['height'] = properties['height'] || 10;
    properties['height-half'] = properties['height'] / 2;
    properties['lifespan'] = properties['lifespan'] || 10;
    properties['owner'] = properties['owner'] === void 0
      ? -1
      : properties['owner'];
    properties['width'] = properties['width'] || 10;
    properties['width-half'] = properties['width'] / 2;
    properties['x'] = properties['x'] || 0;
    properties['y'] = properties['y'] || 0;

    particles.push(properties);
}

function create_player(properties){
    properties = properties || {};

    properties['equipment'] = properties['equipment'] || {
      'feet': void 0,
      'head': void 0,
      'off-hand': void 0,
      'legs': void 0,
      'main-hand': void 0,
      'neck': void 0,
      'torso': void 0,
    };
    properties['inventory'] = properties['inventory'] || [];
    properties['selected'] = properties['selected'] || 1;
    properties['spellbar'] = properties['spellbar'] || {
      0: void 0,
      1: void 0,
      2: void 0,
      3: void 0,
      4: void 0,
      5: void 0,
      6: void 0,
      7: void 0,
      8: void 0,
      9: void 0,
    };
    properties['spellbook'] = properties['spellbook'] || {};
    properties['stats'] = properties['stats'] || {};
    properties['x'] = properties['x'] || 0;
    properties['y'] = properties['y'] || 0;
    properties['y-velocity'] = properties['y-velocity'] || 0;

    player = properties;
}

function create_world_dynamic(properties){
    properties = properties || {};

    properties['collision'] = properties['collision'] == void 0;
    properties['color'] = properties['color'] || '#fff';
    properties['effect'] = properties['effect'] || {};
    properties['effect-stat'] = properties['effect-stat'] || 'health';
    properties['height'] = properties['height'] || 25;
    properties['type'] = properties['type'] || 'stone';
    properties['width'] = properties['width'] || 25;
    properties['x'] = properties['x'] || 0;
    properties['y'] = properties['y'] || 0;

    world_dynamic.push(properties);
}

function effect_player(stat, effect){
    player['stats'][stat]['current'] -= effect;
    if(player['stats'][stat]['current'] <= 0){
        player['stats'][stat]['current'] = 0;

    }else if(player['stats'][stat]['current'] >= player['stats'][stat]['max']){
        player['stats'][stat]['current'] = player['stats'][stat]['max'];
        player['stats'][stat]['regeneration']['current'] = 0;
    }
}

function get_fixed_length_line(x0, y0, x1, y1, length){
    var distance = Math.sqrt(
      Math.pow(
        x1 - x0,
        2
      ) + Math.pow(
        y1 - y0,
        2
      )
    );

    x1 /= distance;
    x1 *= length;
    y1 /= distance;
    y1 *= length;

    return {
      'x': x1,
      'y': y1,
    };
}

function get_movement_speed(x0, y0, x1, y1){
    var angle = Math.atan(Math.abs(y0 - y1) / Math.abs(x0 - x1));
    return [
      Math.cos(angle),
      Math.sin(angle),
    ];
}

function select_spell(id){
    if(id < 1){
        id = 10;

    }else if(id > 10){
        id = 1;
    }

    player['selected'] = id;
    document.getElementById('canvas').style.cursor =
      player['spellbook'][player['spellbar'][id]]['cursor'] || 'auto';
}

var npcs = [];
var particles = [];
var player = {};
var ui = 0;
var world_dynamic = [];
var world_static = [];
