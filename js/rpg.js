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
    properties['height'] = properties['height'] !== void 0
      ? properties['height']
      : 20;
    properties['height-half'] = properties['height'] / 2;
    properties['inventory'] = properties['inventory'] || [];
    properties['player'] = properties['player'] || false;
    properties['selected'] = properties['selected'] || 0;
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
          : 10;
        properties['stats']['health']['max'] = properties['stats']['health']['max'] || properties['stats']['health']['current'];
        properties['stats']['health']['regeneration'] = properties['stats']['health']['regeneration'] || {};
          properties['stats']['health']['regeneration']['current'] = properties['stats']['health']['regeneration']['current'] !== void 0
            ? properties['stats']['health']['regeneration']['current']
            : 0;
          properties['stats']['health']['regeneration']['max'] = properties['stats']['health']['regeneration']['max'] || 1000;
      properties['stats']['mana'] = properties['stats']['mana'] || {};
        properties['stats']['mana']['current'] = properties['stats']['mana']['current'] !== void 0
          ? properties['stats']['mana']['current']
          : 10;
        properties['stats']['mana']['max'] = properties['stats']['mana']['max'] || properties['stats']['mana']['current'];
        properties['stats']['mana']['regeneration'] = properties['stats']['mana']['regeneration'] || {};
          properties['stats']['mana']['regeneration']['current'] = properties['stats']['mana']['regeneration']['current'] !== void 0
            ? properties['stats']['mana']['regeneration']['current']
            : 0;
          properties['stats']['mana']['regeneration']['max'] = properties['stats']['mana']['regeneration']['max'] || 100;

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

        // Handle character inventory item spells.
        for(var item in rpg_characters[character]['inventory']){
            var selected = rpg_characters[character]['inventory'][item]['spell'];

            if(selected['reload-current'] < selected['reload']){
                selected['reload-current'] += 1;
                continue;
            }

            if(rpg_characters[character]['selected'] != item){
                continue;
            }

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

            selected['reload-current'] = 0;
            rpg_character_affect(
              character,
              selected['costs'],
              selected['cost']
            );

            // Handle particle-creating spells.
            if(selected['type'] === 'particle'){
                var particle = {};
                for(var property in selected){
                    particle[property] = selected[property];
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
                  selected['damages'],
                  selected['damage']
                );

            }else if(selected['type'] === 'character'){
                rpg_character_create({
                  'x': Math.round(target_x - 12.5),
                  'y': Math.round(target_y - 12.5),
                });
            }

            break;
        }
    }
}

function rpg_item_create(properties, type){
    properties = properties || {};
    type = type || 'any';

    properties['cursor'] = properties['cursor'] || 'auto';
    properties['equipped'] = properties['equipped'] || false;
    properties['label'] = properties['label'] || '';
    properties['owner'] = properties['owner'] || 0;
    properties['slot'] = properties['slot'] || 'spellbook';
    properties['spell'] = properties['spell'] || {};
      properties['spell']['cost'] = properties['spell']['cost'] || 0;
      properties['spell']['costs'] = properties['spell']['costs'] || 'mana';
      properties['spell']['color'] = properties['spell']['color'] || '#fff';
      properties['spell']['damage'] = properties['spell']['damage'] || 0;
      properties['spell']['damages'] = properties['spell']['damages'] || 'health';
      properties['spell']['lifespan'] = properties['spell']['lifespan'] || 50;
      properties['spell']['reload'] = properties['spell']['reload'] || 0;
      properties['spell']['reload-current'] = properties['spell']['reload-current'] || properties['spell']['reload'];
      properties['spell']['speed-x'] = properties['spell']['speed-x'] || 5;
      properties['spell']['speed-y'] = properties['spell']['speed-y'] || 5;
      properties['spell']['type'] = properties['spell']['type'] || 'particle';

    return properties;
}

function rpg_item_select(character, id){
    character = character || 0;

    var length = rpg_characters[character]['inventory'].length - 1;
    if(id < 0){
        id = length;

    }else if(id > length){
        id = 0;
    }

    rpg_characters[character]['selected'] = id;

    if(character === 0){
        document.getElementById('canvas').style.cursor =
          rpg_characters[0]['inventory'][id]['cursor'] || 'auto';
    }
}

/*
function rpg_item_toggle(id){
    if(rpg_items[id]['owner'] === false){
        return;
    }

    // Toggle item on character.
    rpg_items[id]['equipped'] = !rpg_items[id]['equipped'];
}
*/

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
var rpg_particles = [];
var rpg_world_dynamic = [];
var rpg_world_static = [];
