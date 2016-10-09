'use strict';

function rpg_character_affect(character, stat, effect){
    rpg_characters[character]['stats'][stat]['current'] -= effect;
    if(rpg_characters[character]['stats'][stat]['current'] <= 0){
        rpg_characters[character]['stats'][stat]['current'] = 0;

        if(stat === 'health'){
            rpg_characters[character]['dead'] = true;
        }

    }else if(rpg_characters[character]['stats'][stat]['current'] >= rpg_characters[character]['stats'][stat]['max']){
        rpg_characters[character]['stats'][stat]['current'] = rpg_characters[character]['stats'][stat]['max'];
        rpg_characters[character]['stats'][stat]['regeneration']['current'] = 0;
    }
}

function rpg_character_create(properties){
    properties = properties || {};

    properties['color'] = properties['color'] || '#fff';
    properties['dead'] = false;
    properties['equipment'] = properties['equipment'] || {
      'feet': void 0,
      'head': void 0,
      'legs': void 0,
      'main-hand': void 0,
      'neck': void 0,
      'off-hand': void 0,
      'torso': void 0,
    };
    properties['height'] = properties['height'] !== void 0
      ? properties['height']
      : 20;
    properties['height-half'] = properties['height'] / 2;
    properties['inventory'] = properties['inventory'] || [];
    properties['player'] = properties['player'] || false;
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
    properties['team'] = properties['team'] !== void 0
      ? properties['team']
      : 1;
    properties['width'] = properties['width'] !== void 0
      ? properties['width']
      : 20;
    properties['width-half'] = properties['width'] / 2;
    properties['x'] = properties['x'] || 0;
    properties['x-velocity'] = properties['x-velocity'] || 0;
    properties['y'] = properties['y'] || 0;
    properties['y-velocity'] = properties['y-velocity'] || 0;

    properties['stats'] = properties['stats'] || {};
      properties['stats']['health'] = properties['stats']['health'] || {};
        properties['stats']['health']['current'] = properties['stats']['health']['current'] !== void 0
          ? properties['stats']['health']['current']
          : 1;
        properties['stats']['health']['max'] = properties['stats']['health']['max'] || 1;

    rpg_characters.push(properties);
}

function rpg_character_handle(){
    for(var character in rpg_characters){
        if(rpg_characters[character]['dead']){
            continue;
        }

        // Regenerate character stats.
        for(var stat in rpg_characters[character]['stats']){
            if(rpg_characters[character]['stats'][stat]['regeneration'] === void 0
              || rpg_characters[character]['stats'][stat]['current'] >= rpg_characters[character]['stats'][stat]['max']){
                continue;
            }

            rpg_characters[character]['stats'][stat]['regeneration']['current'] += 1;
            if(rpg_characters[character]['stats'][stat]['regeneration']['current'] >= rpg_characters[character]['stats'][stat]['regeneration']['max']){
                rpg_characters[character]['stats'][stat]['current'] += 1;
                rpg_characters[character]['stats'][stat]['regeneration']['current'] = 0;
            }
        }

        for(var spell in rpg_characters[character]['spellbook']){
            if(rpg_characters[character]['spellbook'][spell]['current'] < rpg_characters[character]['spellbook'][spell]['reload']){
                rpg_characters[character]['spellbook'][spell]['current'] += 1;
                continue;
            }

            if(rpg_characters[character]['spellbar'][rpg_characters[character]['selected']] !== spell){
                continue;
            }

            var selected = rpg_characters[character]['spellbook'][rpg_characters[character]['spellbar'][rpg_characters[character]['selected']]];

            if(selected['cost'] !== 0
              && rpg_characters[character]['stats'][selected['costs']]['current'] < selected['cost']){
                continue;
            }

            var dx = 0;
            var dy = 0;
            var speeds = 0;
            var target_x = 0;
            var target_y = 0;

            if(character === '0'){
                if(mouse_lock_x < 0){
                    continue;
                }

                target_x = rpg_characters[character]['x'] + mouse_x - canvas_x;
                target_y = rpg_characters[character]['y'] + mouse_y - canvas_y;

                speeds = math_movement_speed(
                  rpg_characters[character]['x'],
                  rpg_characters[character]['y'],
                  target_x,
                  target_y
                );

                dx = mouse_x > canvas_x ? speeds[0] : -speeds[0];
                dy = mouse_y > canvas_y ? speeds[1] : -speeds[1];

            }else{
                speeds = math_movement_speed(
                  rpg_characters[character]['x'],
                  rpg_characters[character]['y'],
                  rpg_characters[0]['x'],
                  rpg_characters[0]['y']
                );

                dx = rpg_characters[0]['x'] > rpg_characters[character]['x'] ? speeds[0] : -speeds[0];
                dy = rpg_characters[0]['y'] > rpg_characters[character]['y'] ? speeds[1] : -speeds[1];
            }

            selected['current'] = 0;
            rpg_character_affect(
              character,
              selected['costs'],
              selected['cost']
            );

            // Handle particle-creating spells.
            if(selected['type'] === 'particle'){
                var particle = {};
                for(var property in selected['particle']){
                    particle[property] = selected['particle'][property];
                }
                particle['dx'] = dx;
                particle['dy'] = dy;
                particle['owner'] = character;
                particle['x'] = rpg_characters[character]['x'];
                particle['y'] = rpg_characters[character]['y'];

                rpg_particle_create(particle);

            }else if(selected['type'] === 'stat'){
                rpg_character_affect(
                  character,
                  selected['effect']['stat'],
                  selected['effect']['damage']
                );

            }else if(selected['type'] === 'world-dynamic'){
                var worlddynamic = {};
                for(var property in selected['world-dynamic']){
                    worlddynamic[property] = selected['world-dynamic'][property];
                }
                worlddynamic['x'] = Math.round(target_x - 12.5);
                worlddynamic['y'] = Math.round(target_y - 12.5);

                rpg_world_dynamic_create(worlddynamic);
            }

            break;
        }
    }
}

function rpg_item_create(properties, type){
    properties = properties || {};
    type = type || 'any';

    properties['equipped'] = properties['equipped'] || false;
    properties['owner'] = properties['owner'] || 'player';

    rpg_items.push(properties);
}

function rpg_item_toggle(id){
    if(rpg_items[id]['owner'] === false){
        return;
    }

    // Toggle item on character.
    rpg_items[id]['equipped'] = !rpg_items[id]['equipped'];
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
    properties['stat'] = properties['stat'] || 'health';
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

        // Handle collisions with characters.
        for(var character in rpg_characters){
            if(rpg_particles[particle]['owner'] == character
              || rpg_particles[particle]['x'] <= rpg_characters[character]['x'] - rpg_characters[character]['width'] / 2
              || rpg_particles[particle]['x'] >= rpg_characters[character]['x'] + rpg_characters[character]['width'] / 2
              || rpg_particles[particle]['y'] <= rpg_characters[character]['y'] - rpg_characters[character]['height'] / 2
              || rpg_particles[particle]['y'] >= rpg_characters[character]['y'] + rpg_characters[character]['height'] / 2){
                continue;
            }

            rpg_character_affect(
              character,
              rpg_particles[particle]['stat'],
              rpg_particles[particle]['damage']
            );

            rpg_particles.splice(
              particle,
              1
            );

            continue particleloop;
        }
    }
}

function rpg_spell_select(character, id){
    character = character || 0;

    if(id < 1){
        id = 10;

    }else if(id > 10){
        id = 1;
    }

    rpg_characters[character]['selected'] = id;

    if(character === 0){
        document.getElementById('canvas').style.cursor =
          rpg_characters[0]['spellbook'][rpg_characters[0]['spellbar'][id]]['cursor'] || 'auto';
    }
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

var rpg_characters = [];
var rpg_items = [];
var rpg_particles = [];
var rpg_ui = 0;
var rpg_world_dynamic = [];
var rpg_world_static = [];
