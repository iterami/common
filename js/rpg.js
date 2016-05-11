'use strict';

function create_npc(properties){
    properties = properties || {};

    properties['color'] = properties['color'] || '#fff';
    properties['height'] = properties['height'] !== void 0
      ? properties['height']
      : 20;
    properties['height-half'] = properties['height'] / 2;
    properties['team'] = properties['team'] !== void 0
      ? properties['team']
      : 1;
    properties['width'] = properties['width'] !== void 0
      ? properties['width']
      : 20;
    properties['width-half'] = properties['width'] / 2;
    properties['x'] = properties['x'] || 0;
    properties['y'] = properties['y'] || 0;

    properties['stats'] = properties['stats'] || {};
      properties['stats']['health'] = properties['stats']['health'] || {};
        properties['stats']['health']['current'] = properties['stats']['health']['current'] === void 0
          ? properties['stats']['health']['current']
          : 1;
        properties['stats']['health']['max'] = properties['stats']['health']['max'] || 1;

    properties['selected'] = properties['selected'] || void 0;
    properties['spellbook'] = properties['spellbook'] || {};

    npcs.push(properties);
}

function create_particle(properties){
    properties = properties || {};

    properties['color'] = properties['color'] || '#fff';
    properties['damage'] = properties['damage'] || 0;
    properties['dx'] = properties['dx'] || 0;
    properties['dy'] = properties['dy'] || 0;
    properties['height'] = properties['height'] !== void 0
      ? properties['height']
      : 10;
    properties['height-half'] = properties['height'] / 2;
    properties['lifespan'] = properties['lifespan'] !== void 0
      ? properties['lifespan']
      : 10;
    properties['owner'] = properties['owner'] !== void 0
      ? properties['owner']
      : -1;
    properties['speed-x'] = properties['speed-x'] !== void 0
      ? properties['speed-x']
      : 1;
    properties['speed-y'] = properties['speed-y'] !== void 0
      ? properties['speed-y']
      : 1;
    properties['width'] = properties['width'] !== void 0
      ? properties['width']
      : 10;
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
    properties['height'] = properties['height'] !== void 0
      ? properties['height']
      : 25;
    properties['type'] = properties['type'] || 'stone';
    properties['width'] = properties['width'] !== void 0
      ? properties['width']
      : 25;
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

function handle_npcs(){
    for(var npc in npcs){
        if(npcs[npc]['selected'] == void 0){
            continue;
        }

        for(var spell in npcs[npc]['spellbook']){
            if(npcs[npc]['spellbook'][spell]['current'] < npcs[npc]['spellbook'][spell]['reload']){
                npcs[npc]['spellbook'][spell]['current'] += 1;
                continue;
            }

            if(npcs[npc]['selected'] !== spell){
                continue;
            }

            npcs[npc]['spellbook'][spell]['current'] = 0;

            // Create NPC-created particle.
            var speeds = get_movement_speed(
              npcs[npc]['x'],
              npcs[npc]['y'],
              player['x'],
              player['y']
            );
            var particle = {};
            for(var property in npcs[npc]['spellbook'][spell]){
                particle[property] = npcs[npc]['spellbook'][spell][property];
            }
            particle['dx'] = player['x'] > npcs[npc]['x'] ? speeds[0] : -speeds[0];
            particle['dy'] = player['y'] > npcs[npc]['y'] ? speeds[1] : -speeds[1];
            particle['owner'] = npc;
            particle['x'] = npcs[npc]['x'];
            particle['y'] = npcs[npc]['y'];

            create_particle(particle);
            break;
        }
    }
}

function handle_particles(){
    particleloop:
    for(var particle in particles){
        particles[particle]['x'] += particles[particle]['dx'] * particles[particle]['speed-x'];
        particles[particle]['y'] += particles[particle]['dy'] * particles[particle]['speed-y'];

        if(particles[particle]['lifespan'] < 0){
            particles.splice(
              particle,
              1
            );
            continue;
        }
        particles[particle]['lifespan'] -= 1;

        for(var object in world_dynamic){
            if(!world_dynamic[object]['collision']
              || particles[particle]['x'] <= world_dynamic[object]['x']
              || particles[particle]['x'] >= world_dynamic[object]['x'] + world_dynamic[object]['width']
              || particles[particle]['y'] <= world_dynamic[object]['y']
              || particles[particle]['y'] >= world_dynamic[object]['y'] + world_dynamic[object]['height']){
                continue;
            }

            particles.splice(
              particle,
              1
            );
            continue particleloop;
        }

        // Handle particles not owned by player.
        if(particles[particle]['owner'] > -1){
            if(particles[particle]['x'] > player['x'] - 17
              && particles[particle]['x'] < player['x'] + 17
              && particles[particle]['y'] > player['y'] - 17
              && particles[particle]['y'] < player['y'] + 17){
                effect_player(
                  'health',
                  particles[particle]['damage']
                );

                particles.splice(
                  particle,
                  1
                );
            }

            continue;
        }

        // Handle particles owned by player.
        for(var npc in npcs){
            if(npcs[npc]['team'] === 0
              || particles[particle]['x'] <= npcs[npc]['x'] - npcs[npc]['width'] / 2
              || particles[particle]['x'] >= npcs[npc]['x'] + npcs[npc]['width'] / 2
              || particles[particle]['y'] <= npcs[npc]['y'] - npcs[npc]['height'] / 2
              || particles[particle]['y'] >= npcs[npc]['y'] + npcs[npc]['height'] / 2){
                continue;
            }

            npcs[npc]['stats']['health']['current'] -= particles[particle]['damage'];
            if(npcs[npc]['stats']['health']['current'] <= 0){
                npcs.splice(
                  npc,
                  1
                );
            }

            particles.splice(
              particle,
              1
            );
            continue particleloop;
        }
    }
}

function handle_player(){
    // Regenerate player health and mana.
    if(player['stats']['health']['current'] < player['stats']['health']['max']){
        player['stats']['health']['regeneration']['current'] += 1;
        if(player['stats']['health']['regeneration']['current'] >= player['stats']['health']['regeneration']['max']){
            player['stats']['health']['current'] += 1;
            player['stats']['health']['regeneration']['current'] = 0;
        }
    }

    if(player['stats']['mana']['current'] < player['stats']['mana']['max']){
        player['stats']['mana']['regeneration']['current'] += 1;
        if(player['stats']['mana']['regeneration']['current'] >= player['stats']['mana']['regeneration']['max']){
            player['stats']['mana']['current'] += 1;
            player['stats']['mana']['regeneration']['current'] = 0;
        }
    }

    // Update player spells.
    for(var spell in player['spellbook']){
        if(player['spellbook'][spell]['current'] < player['spellbook'][spell]['reload']){
            player['spellbook'][spell]['current'] += 1;
        }
    }

    // Check if player wants to fire selected spell
    //   and fire it if they do and it can be fired.
    var selected = player['spellbar'][player['selected']];

    if(mouse_lock_x > -1
      && player['spellbook'][selected]['current'] >= player['spellbook'][selected]['reload']
      && player['stats'][player['spellbook'][selected]['costs']]['current'] >= player['spellbook'][selected]['cost']){
        player['spellbook'][selected]['current'] = 0;
        player['stats'][player['spellbook'][selected]['costs']]['current'] = Math.max(
          player['stats'][player['spellbook'][selected]['costs']]['current'] - player['spellbook'][selected]['cost'],
          0
        );

        // Handle particle-creating spells.
        if(player['spellbook'][selected]['type'] === 'particle'){
            var speeds = get_movement_speed(
              player['x'],
              player['y'],
              player['x'] + mouse_x - x,
              player['y'] + mouse_y - y
            );
            var particle = {};
            for(var property in player['spellbook'][selected]['particle']){
                particle[property] = player['spellbook'][selected]['particle'][property];
            }
            particle['dx'] = mouse_x > x ? speeds[0] : -speeds[0];
            particle['dy'] = mouse_y > y ? speeds[1] : -speeds[1];
            particle['x'] = player['x'];
            particle['y'] = player['y'];

            create_particle(particle);

        }else if(player['spellbook'][selected]['type'] === 'stat'){
            effect_player(
              player['spellbook'][selected]['effect']['stat'],
              player['spellbook'][selected]['effect']['damage']
            );

        }else if(player['spellbook'][selected]['type'] === 'world-dynamic'){
            var worlddynamic = {};
            for(var property in player['spellbook'][selected]['world-dynamic']){
                worlddynamic[property] = player['spellbook'][selected]['world-dynamic'][property];
            }
            worlddynamic['x'] = player['x'] + mouse_x - x;
            worlddynamic['y'] = player['y'] + mouse_y - y;

            create_world_dynamic(worlddynamic);
        }
    }

    if(player['stats']['health']['current'] <= 0){
        game_running = false;
    }
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

var game_running = false;
var npcs = [];
var particles = [];
var player = {};
var ui = 0;
var world_dynamic = [];
var world_static = [];
