'use strict';

function rpg_npc_create(properties){
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

    rpg_npcs.push(properties);
}

function rpg_npc_handle(){
    for(var npc in rpg_npcs){
        if(rpg_npcs[npc]['selected'] === void 0){
            continue;
        }

        for(var spell in rpg_npcs[npc]['spellbook']){
            if(rpg_npcs[npc]['spellbook'][spell]['current'] < rpg_npcs[npc]['spellbook'][spell]['reload']){
                rpg_npcs[npc]['spellbook'][spell]['current'] += 1;
                continue;
            }

            if(rpg_npcs[npc]['selected'] !== spell){
                continue;
            }

            rpg_npcs[npc]['spellbook'][spell]['current'] = 0;

            // Create NPC-created particle.
            var speeds = math_movement_speed(
              rpg_npcs[npc]['x'],
              rpg_npcs[npc]['y'],
              rpg_player['x'],
              rpg_player['y']
            );
            var particle = {};
            for(var property in rpg_npcs[npc]['spellbook'][spell]){
                particle[property] = rpg_npcs[npc]['spellbook'][spell][property];
            }
            particle['dx'] = rpg_player['x'] > rpg_npcs[npc]['x'] ? speeds[0] : -speeds[0];
            particle['dy'] = rpg_player['y'] > rpg_npcs[npc]['y'] ? speeds[1] : -speeds[1];
            particle['owner'] = npc;
            particle['x'] = rpg_npcs[npc]['x'];
            particle['y'] = rpg_npcs[npc]['y'];

            rpg_particle_create(particle);
            break;
        }
    }
}

function rpg_particle_create(properties){
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

    rpg_particles.push(properties);
}

function rpg_particle_handle(){
    particleloop:
    for(var particle in rpg_particles){
        rpg_particles[particle]['x'] += rpg_particles[particle]['dx'] * rpg_particles[particle]['speed-x'];
        rpg_particles[particle]['y'] += rpg_particles[particle]['dy'] * rpg_particles[particle]['speed-y'];

        if(rpg_particles[particle]['lifespan'] < 0){
            rpg_particles.splice(
              particle,
              1
            );
            continue;
        }
        rpg_particles[particle]['lifespan'] -= 1;

        for(var object in rpg_world_dynamic){
            if(!rpg_world_dynamic[object]['collision']
              || rpg_particles[particle]['x'] <= rpg_world_dynamic[object]['x']
              || rpg_particles[particle]['x'] >= rpg_world_dynamic[object]['x'] + rpg_world_dynamic[object]['width']
              || rpg_particles[particle]['y'] <= rpg_world_dynamic[object]['y']
              || rpg_particles[particle]['y'] >= rpg_world_dynamic[object]['y'] + rpg_world_dynamic[object]['height']){
                continue;
            }

            rpg_particles.splice(
              particle,
              1
            );
            continue particleloop;
        }

        // Handle particles not owned by player.
        if(rpg_particles[particle]['owner'] > -1){
            if(rpg_particles[particle]['x'] > rpg_player['x'] - rpg_player['width-half']
              && rpg_particles[particle]['x'] < rpg_player['x'] + rpg_player['width-half']
              && rpg_particles[particle]['y'] > rpg_player['y'] - rpg_player['height-half']
              && rpg_particles[particle]['y'] < rpg_player['y'] + rpg_player['height-half']){
                rpg_player_affect(
                  'health',
                  rpg_particles[particle]['damage']
                );

                rpg_particles.splice(
                  particle,
                  1
                );
            }

            continue;
        }

        // Handle particles owned by player.
        for(var npc in rpg_npcs){
            if(rpg_npcs[npc]['team'] === 0
              || rpg_particles[particle]['x'] <= rpg_npcs[npc]['x'] - rpg_npcs[npc]['width'] / 2
              || rpg_particles[particle]['x'] >= rpg_npcs[npc]['x'] + rpg_npcs[npc]['width'] / 2
              || rpg_particles[particle]['y'] <= rpg_npcs[npc]['y'] - rpg_npcs[npc]['height'] / 2
              || rpg_particles[particle]['y'] >= rpg_npcs[npc]['y'] + rpg_npcs[npc]['height'] / 2){
                continue;
            }

            rpg_npcs[npc]['stats']['health']['current'] -= rpg_particles[particle]['damage'];
            if(rpg_npcs[npc]['stats']['health']['current'] <= 0){
                rpg_npcs.splice(
                  npc,
                  1
                );
            }

            rpg_particles.splice(
              particle,
              1
            );
            continue particleloop;
        }
    }
}

function rpg_player_affect(stat, effect){
    rpg_player['stats'][stat]['current'] -= effect;
    if(rpg_player['stats'][stat]['current'] <= 0){
        rpg_player['stats'][stat]['current'] = 0;

    }else if(rpg_player['stats'][stat]['current'] >= rpg_player['stats'][stat]['max']){
        rpg_player['stats'][stat]['current'] = rpg_player['stats'][stat]['max'];
        rpg_player['stats'][stat]['regeneration']['current'] = 0;
    }
}

function rpg_player_create(properties){
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
    properties['height'] = properties['height'] !== void 0
      ? properties['height']
      : 34;
    properties['height-half'] = properties['height'] / 2;
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
    properties['width'] = properties['width'] !== void 0
      ? properties['width']
      : 34;
    properties['width-half'] = properties['width'] / 2;
    properties['x'] = properties['x'] || 0;
    properties['y'] = properties['y'] || 0;
    properties['y-velocity'] = properties['y-velocity'] || 0;

    rpg_player = properties;
}

function rpg_player_handle(){
    // Regenerate player health and mana.
    if(rpg_player['stats']['health']['current'] < rpg_player['stats']['health']['max']){
        rpg_player['stats']['health']['regeneration']['current'] += 1;
        if(rpg_player['stats']['health']['regeneration']['current'] >= rpg_player['stats']['health']['regeneration']['max']){
            rpg_player['stats']['health']['current'] += 1;
            rpg_player['stats']['health']['regeneration']['current'] = 0;
        }
    }

    if(rpg_player['stats']['mana']['current'] < rpg_player['stats']['mana']['max']){
        rpg_player['stats']['mana']['regeneration']['current'] += 1;
        if(rpg_player['stats']['mana']['regeneration']['current'] >= rpg_player['stats']['mana']['regeneration']['max']){
            rpg_player['stats']['mana']['current'] += 1;
            rpg_player['stats']['mana']['regeneration']['current'] = 0;
        }
    }

    // Update player spells.
    for(var spell in rpg_player['spellbook']){
        if(rpg_player['spellbook'][spell]['current'] < rpg_player['spellbook'][spell]['reload']){
            rpg_player['spellbook'][spell]['current'] += 1;
        }
    }

    // Check if player wants to fire selected spell
    //   and fire it if they do and it can be fired.
    var selected = rpg_player['spellbook'][rpg_player['spellbar'][rpg_player['selected']]];

    if(mouse_lock_x > -1
      && selected['current'] >= selected['reload']
      && rpg_player['stats'][selected['costs']]['current'] >= selected['cost']){
        selected['current'] = 0;
        rpg_player['stats'][selected['costs']]['current'] = Math.max(
          rpg_player['stats'][selected['costs']]['current'] - selected['cost'],
          0
        );

        // Handle particle-creating spells.
        if(selected['type'] === 'particle'){
            var speeds = math_movement_speed(
              rpg_player['x'],
              rpg_player['y'],
              rpg_player['x'] + mouse_x - x,
              rpg_player['y'] + mouse_y - y
            );
            var particle = {};
            for(var property in selected['particle']){
                particle[property] = selected['particle'][property];
            }
            particle['dx'] = mouse_x > x ? speeds[0] : -speeds[0];
            particle['dy'] = mouse_y > y ? speeds[1] : -speeds[1];
            particle['x'] = rpg_player['x'];
            particle['y'] = rpg_player['y'];

            rpg_particle_create(particle);

        }else if(selected['type'] === 'stat'){
            rpg_player_affect(
              selected['effect']['stat'],
              selected['effect']['damage']
            );

        }else if(selected['type'] === 'world-dynamic'){
            var worlddynamic = {};
            for(var property in selected['world-dynamic']){
                worlddynamic[property] = selected['world-dynamic'][property];
            }
            worlddynamic['x'] = rpg_player['x'] + mouse_x - x;
            worlddynamic['y'] = rpg_player['y'] + mouse_y - y;

            rpg_world_dynamic_create(worlddynamic);
        }
    }

    if(rpg_player['stats']['health']['current'] <= 0){
        game_running = false;
    }
}

function rpg_spell_select(id){
    if(id < 1){
        id = 10;

    }else if(id > 10){
        id = 1;
    }

    rpg_player['selected'] = id;
    document.getElementById('canvas').style.cursor =
      rpg_player['spellbook'][rpg_player['spellbar'][id]]['cursor'] || 'auto';
}

function rpg_world_dynamic_create(properties){
    properties = properties || {};

    properties['collision'] = properties['collision'] === void 0;
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

    rpg_world_dynamic.push(properties);
}

var game_running = false;
var rpg_npcs = [];
var rpg_particles = [];
var rpg_player = {};
var rpg_ui = 0;
var rpg_world_dynamic = [];
var rpg_world_static = [];
