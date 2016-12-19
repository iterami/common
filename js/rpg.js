'use strict';

// Required args: character, effect, stat
function rpg_character_affect(args){
    rpg_characters[args['character']]['stats'][args['stat']]['current'] -= args['effect'];
    if(rpg_characters[args['character']]['stats'][args['stat']]['current'] <= 0){
        rpg_characters[args['character']]['stats'][args['stat']]['current'] = 0;

        if(args['stat'] === 'health'){
            rpg_characters[args['character']]['dead'] = true;
        }

    }else if(rpg_characters[args['character']]['stats'][args['stat']]['current'] >= rpg_characters[args['character']]['stats'][args['stat']]['max']){
        rpg_characters[args['character']]['stats'][args['stat']]['current'] = rpg_characters[args['character']]['stats'][args['stat']]['max'];
        rpg_characters[args['character']]['stats'][args['stat']]['regeneration']['current'] = 0;
    }
}

// Optional args: properties
function rpg_character_create(args){
    args = args || {};
    args['properties'] = args['properties'] || {};

    args['properties']['color'] = args['properties']['color'] || '#fff';
    args['properties']['dead'] = false;
    args['properties']['height'] = args['properties']['height'] !== void 0
      ? args['properties']['height']
      : 20;
    args['properties']['height-half'] = args['properties']['height'] / 2;
    args['properties']['inventory'] = args['properties']['inventory'] || [];
    args['properties']['player'] = args['properties']['player'] || false;
    args['properties']['selected'] = args['properties']['selected'] || 0;
    args['properties']['target-x'] = args['properties']['target-x'] || 0;
    args['properties']['target-y'] = args['properties']['target-y'] || 0;
    args['properties']['team'] = args['properties']['team'] !== void 0
      ? args['properties']['team']
      : 1;
    args['properties']['width'] = args['properties']['width'] !== void 0
      ? args['properties']['width']
      : 20;
    args['properties']['width-half'] = args['properties']['width'] / 2;
    args['properties']['x'] = args['properties']['x'] || 0;
    args['properties']['x-velocity'] = args['properties']['x-velocity'] || 0;
    args['properties']['y'] = args['properties']['y'] || 0;
    args['properties']['y-velocity'] = args['properties']['y-velocity'] || 0;

    args['properties']['stats'] = args['properties']['stats'] || {};
      args['properties']['stats']['health'] = args['properties']['stats']['health'] || {};
        args['properties']['stats']['health']['current'] = args['properties']['stats']['health']['current'] !== void 0
          ? args['properties']['stats']['health']['current']
          : 10;
        args['properties']['stats']['health']['max'] = args['properties']['stats']['health']['max'] || args['properties']['stats']['health']['current'];
        args['properties']['stats']['health']['regeneration'] = args['properties']['stats']['health']['regeneration'] || {};
          args['properties']['stats']['health']['regeneration']['current'] = args['properties']['stats']['health']['regeneration']['current'] !== void 0
            ? args['properties']['stats']['health']['regeneration']['current']
            : 0;
          args['properties']['stats']['health']['regeneration']['max'] = args['properties']['stats']['health']['regeneration']['max'] || 1000;
      args['properties']['stats']['mana'] = args['properties']['stats']['mana'] || {};
        args['properties']['stats']['mana']['current'] = args['properties']['stats']['mana']['current'] !== void 0
          ? args['properties']['stats']['mana']['current']
          : 10;
        args['properties']['stats']['mana']['max'] = args['properties']['stats']['mana']['max'] || args['properties']['stats']['mana']['current'];
        args['properties']['stats']['mana']['regeneration'] = args['properties']['stats']['mana']['regeneration'] || {};
          args['properties']['stats']['mana']['regeneration']['current'] = args['properties']['stats']['mana']['regeneration']['current'] !== void 0
            ? args['properties']['stats']['mana']['regeneration']['current']
            : 0;
          args['properties']['stats']['mana']['regeneration']['max'] = args['properties']['stats']['mana']['regeneration']['max'] || 100;

    rpg_characters.push(args['properties']);
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

        // Update target.
        if(character === '0'){
            rpg_characters[character]['target-x'] = rpg_characters[character]['x'] + mouse_x - canvas_x;
            rpg_characters[character]['target-y'] = rpg_characters[character]['y'] + mouse_y - canvas_y;

        }else{
            rpg_characters[character]['target-x'] = rpg_characters[0]['x'];
            rpg_characters[character]['target-y'] = rpg_characters[0]['y'];
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

            if(character === '0'
              && mouse_lock_x < 0){
                continue;
            }

            var speeds = math_movement_speed({
              'x0': rpg_characters[character]['x'],
              'x1': rpg_characters[character]['target-x'],
              'y0': rpg_characters[character]['y'],
              'y1': rpg_characters[character]['target-y'],
            });
            var dx = rpg_characters[character]['target-x'] > rpg_characters[character]['x'] ? speeds[0] : -speeds[0];
            var dy = rpg_characters[character]['target-y'] > rpg_characters[character]['y'] ? speeds[1] : -speeds[1];

            selected['reload-current'] = 0;
            rpg_character_affect({
              'character': character,
              'effect': selected['cost'],
              'stat': selected['costs'],
            });

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

                rpg_particle_create({
                  'properties': particle,
                });

            }else if(selected['type'] === 'stat'){
                rpg_character_affect({
                  'character': character,
                  'effect': selected['damage'],
                  'stat': selected['damages'],
                });

            }else if(selected['type'] === 'character'){
                rpg_character_create({
                  'properties': {
                    'x': rpg_characters[character]['target-x'],
                    'y': rpg_characters[character]['target-y'],
                  },
                });
            }

            break;
        }
    }
}

// Optional args: properties, type
function rpg_item_create(args){
    args = args || {};
    args['properties'] = args['properties'] || {};
    args['type'] = args['type'] || 'any';

    args['properties']['cursor'] = args['properties']['cursor'] || 'auto';
    args['properties']['equipped'] = args['properties']['equipped'] || false;
    args['properties']['label'] = args['properties']['label'] || '';
    args['properties']['owner'] = args['properties']['owner'] || 0;
    args['properties']['slot'] = args['properties']['slot'] || 'spellbook';
    args['properties']['spell'] = args['properties']['spell'] || {};
      args['properties']['spell']['cost'] = args['properties']['spell']['cost'] || 0;
      args['properties']['spell']['costs'] = args['properties']['spell']['costs'] || 'mana';
      args['properties']['spell']['color'] = args['properties']['spell']['color'] || '#fff';
      args['properties']['spell']['damage'] = args['properties']['spell']['damage'] || 0;
      args['properties']['spell']['damages'] = args['properties']['spell']['damages'] || 'health';
      args['properties']['spell']['lifespan'] = args['properties']['spell']['lifespan'] || 50;
      args['properties']['spell']['reload'] = args['properties']['spell']['reload'] || 0;
      args['properties']['spell']['reload-current'] = args['properties']['spell']['reload-current'] || args['properties']['spell']['reload'];
      args['properties']['spell']['speed-x'] = args['properties']['spell']['speed-x'] || 5;
      args['properties']['spell']['speed-y'] = args['properties']['spell']['speed-y'] || 5;
      args['properties']['spell']['type'] = args['properties']['spell']['type'] || 'particle';

    return args['properties'];
}

// Required args: id
// Optional args: character
function rpg_item_select(args){
    args['character'] = args['character'] || 0;

    var length = rpg_characters[args['character']]['inventory'].length - 1;
    if(args['id'] < 0){
        args['id'] = length;

    }else if(args['id'] > length){
        args['id'] = 0;
    }

    rpg_characters[args['character']]['selected'] = args['id'];

    if(args['character'] === 0){
        document.getElementById('canvas').style.cursor =
          rpg_characters[0]['inventory'][args['id']]['cursor'] || 'auto';
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

// Optional args: properties
function rpg_particle_create(args){
    args = args || {};
    args['properties'] = args['properties'] || {};

    args['properties']['color'] = args['properties']['color'] || '#fff';
    args['properties']['damage'] = args['properties']['damage'] || 0;
    args['properties']['dx'] = args['properties']['dx'] || 0;
    args['properties']['dy'] = args['properties']['dy'] || 0;
    args['properties']['height'] = args['properties']['height'] !== void 0
      ? args['properties']['height']
      : 10;
    args['properties']['height-half'] = args['properties']['height'] / 2;
    args['properties']['lifespan'] = args['properties']['lifespan'] !== void 0
      ? args['properties']['lifespan']
      : 10;
    args['properties']['owner'] = args['properties']['owner'] !== void 0
      ? args['properties']['owner']
      : -1;
    args['properties']['speed-x'] = args['properties']['speed-x'] !== void 0
      ? args['properties']['speed-x']
      : 1;
    args['properties']['speed-y'] = args['properties']['speed-y'] !== void 0
      ? args['properties']['speed-y']
      : 1;
    args['properties']['stat'] = args['properties']['stat'] || 'health';
    args['properties']['width'] = args['properties']['width'] !== void 0
      ? args['properties']['width']
      : 10;
    args['properties']['width-half'] = args['properties']['width'] / 2;
    args['properties']['x'] = args['properties']['x'] || 0;
    args['properties']['y'] = args['properties']['y'] || 0;

    rpg_particles.push(args['properties']);
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

            rpg_character_affect({
              'character': character,
              'effect': rpg_particles[particle]['damage'],
              'stat': rpg_particles[particle]['stat'],
            });

            rpg_particles.splice(
              particle,
              1
            );

            continue particleloop;
        }
    }
}

// Optional args: properties
function rpg_world_dynamic_create(args){
    args = args || {};
    args['properties'] = args['properties'] || {};

    args['properties']['collision'] = args['properties']['collision'] === void 0;
    args['properties']['color'] = args['properties']['color'] || '#fff';
    args['properties']['effect'] = args['properties']['effect'] || {};
    args['properties']['effect-stat'] = args['properties']['effect-stat'] || 'health';
    args['properties']['height'] = args['properties']['height'] !== void 0
      ? args['properties']['height']
      : 25;
    args['properties']['type'] = args['properties']['type'] || 'stone';
    args['properties']['width'] = args['properties']['width'] !== void 0
      ? args['properties']['width']
      : 25;
    args['properties']['x'] = args['properties']['x'] || 0;
    args['properties']['y'] = args['properties']['y'] || 0;

    rpg_world_dynamic.push(args['properties']);
}

var rpg_characters = [];
var rpg_particles = [];
var rpg_world_dynamic = [];
var rpg_world_static = [];
