'use strict';

function platform_coin_collide(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': 'player',
      },
    });

    platform_players[args['id']]['coins'] += 1;
    if(platform_players[args['id']]['coins'] >= platform_score_goal){
        platform_players[args['id']]['done'] = true;
    }

    audio_start({
      'id': 'boop',
    });
}

function platform_init(){
}

function platform_jump(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': 'player',
        'velocity': 1,
      },
    });

    platform_players['player']['y-velocity'] = args['velocity'];
}

function platform_player_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'all': false,
        'id': 'player',
      },
    });

    if(args['all']){
        platform_players[args['id']] = {};
    }

    platform_players[args['id']] = core_handle_defaults({
      'default': {
        'can-jump': false,
        'coins': 0,
        'done': false,
        'lives': 1,
        'x': 0,
        'y': 0,
        'y-velocity': 0,
      },
      'var': platform_players[args['id']],
    });
}

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

// Required args: character, effect, stat
function rpg_character_affect(args){
    rpg_characters[args['character']]['stats'][args['stat']]['current'] -= args['effect'];
    if(rpg_characters[args['character']]['stats'][args['stat']]['current'] <= 0){
        rpg_characters[args['character']]['stats'][args['stat']]['current'] = 0;

        if(args['stat'] === 'health'){
            rpg_characters[args['character']]['dead'] = true;
            if(rpg_characters[args['character']]['parent'] !== false){
                rpg_spawners[rpg_characters[args['character']]['parent']]['charcters'] -= 1;
            }
        }

    }else if(rpg_characters[args['character']]['stats'][args['stat']]['current'] >= rpg_characters[args['character']]['stats'][args['stat']]['max']){
        rpg_characters[args['character']]['stats'][args['stat']]['current'] = rpg_characters[args['character']]['stats'][args['stat']]['max'];
        rpg_characters[args['character']]['stats'][args['stat']]['regeneration']['current'] = 0;
    }
}

function rpg_character_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
      },
    });

    args['properties']['color'] = args['properties']['color'] || '#fff';
    args['properties']['dead'] = false;
    args['properties']['height'] = args['properties']['height'] !== void 0
      ? args['properties']['height']
      : 20;
    args['properties']['height-half'] = args['properties']['height'] / 2;
    args['properties']['inventory'] = args['properties']['inventory'] || [];
    args['properties']['parent'] = args['properties']['parent'] !== void 0
      ? args['properties']['parent']
      : false;
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
    for(let character in rpg_characters){
        if(rpg_characters[character]['dead']){
            continue;
        }

        // Regenerate character stats.
        for(let stat in rpg_characters[character]['stats']){
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
            rpg_characters[character]['target-x'] = rpg_characters[character]['x'] + core_mouse['x'] - canvas_properties['width-half'];
            rpg_characters[character]['target-y'] = rpg_characters[character]['y'] + core_mouse['y'] - canvas_properties['height-half'];

        }else{
            rpg_characters[character]['target-x'] = rpg_characters[0]['x'];
            rpg_characters[character]['target-y'] = rpg_characters[0]['y'];
        }

        // Handle character inventory item spells.
        for(let item in rpg_characters[character]['inventory']){
            let selected = rpg_characters[character]['inventory'][item]['spell'];

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
              && !core_mouse['down-0']){
                continue;
            }

            let speeds = math_move_2d({
              'x0': rpg_characters[character]['x'],
              'x1': rpg_characters[character]['target-x'],
              'y0': rpg_characters[character]['y'],
              'y1': rpg_characters[character]['target-y'],
            });

            selected['reload-current'] = 0;
            rpg_character_affect({
              'character': character,
              'effect': selected['cost'],
              'stat': selected['costs'],
            });

            // Handle particle-creating spells.
            if(selected['type'] === 'particle'){
                let particle = Object.assign(
                  {},
                  selected
                );
                particle['dx'] = speeds['x'];
                particle['dy'] = speeds['y'];
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

function rpg_handle_all(){
    rpg_character_handle();
    rpg_particle_handle();
    rpg_spawner_handle();

    core_ui_update({
      'ids': {
        'health': rpg_characters[0]['stats']['health']['current'] + '/' + rpg_characters[0]['stats']['health']['max'],
        'mana': rpg_characters[0]['stats']['mana']['current'] + '/' + rpg_characters[0]['stats']['mana']['max'],
        'selected': rpg_characters[0]['inventory'][rpg_characters[0]['selected']]['label'],
      },
    });
}

function rpg_item_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
        'type': 'any',
      },
    });

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
      args['properties']['spell']['lifespan'] = args['properties']['spell']['lifespan'] || 9999;
      args['properties']['spell']['reload'] = args['properties']['spell']['reload'] || 0;
      args['properties']['spell']['reload-current'] = args['properties']['spell']['reload-current'] || args['properties']['spell']['reload'];
      args['properties']['spell']['speed-x'] = args['properties']['spell']['speed-x'] || 5;
      args['properties']['spell']['speed-y'] = args['properties']['spell']['speed-y'] || 5;
      args['properties']['spell']['type'] = args['properties']['spell']['type'] || 'particle';

    return args['properties'];
}

// Required args: id
function rpg_item_select(args){
    args = core_args({
      'args': args,
      'defaults': {
        'character': 0,
      },
    });

    let length = rpg_characters[args['character']]['inventory'].length - 1;
    if(args['id'] < 0){
        args['id'] = length;

    }else if(args['id'] > length){
        args['id'] = 0;
    }

    rpg_characters[args['character']]['selected'] = args['id'];

    if(args['character'] === 0){
        core_elements['canvas'].style.cursor = rpg_characters[0]['inventory'][args['id']]['cursor'] || 'auto';
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

function rpg_particle_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
      },
    });

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
    for(let particle in rpg_particles){
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

        for(let object in rpg_world_dynamic){
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
        for(let character in rpg_characters){
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

function rpg_spawner_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
      },
    });

    args['properties']['characters'] = 0;
    args['properties']['max'] = args['properties']['max'] || 1;
    args['properties']['x'] = args['properties']['x'] || 0;
    args['properties']['y'] = args['properties']['y'] || 0;

    args['properties']['character'] = args['properties']['character'] || {};
      args['properties']['character']['parent'] = rpg_spawners.length;
      args['properties']['character']['x'] = args['properties']['x'];
      args['properties']['character']['y'] = args['properties']['y'];

    rpg_spawners.push(args['properties']);
}

function rpg_spawner_handle(){
    for(let spawner in rpg_spawners){
        if(rpg_spawners[spawner]['characters'] < rpg_spawners[spawner]['max']){
            rpg_character_create({
              'properties': rpg_spawners[spawner]['character'],
            });
            rpg_spawners[spawner]['characters'] += 1;
        }
    }
}

function rpg_unload(){
    rpg_characters.length = 0;
    rpg_particles.length = 0;
    rpg_spawners.length = 0;
    rpg_world_dynamic.length = 0;
    rpg_world_static.length = 0;
}

function rpg_world_dynamic_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
      },
    });

    args['properties']['collision'] = args['properties']['collision'] === void 0;
    args['properties']['color'] = args['properties']['color'] || '#fff';
    args['properties']['effect'] = args['properties']['effect'] || {};
    args['properties']['effect-dx'] = args['properties']['effect-dx'] || 0;
    args['properties']['effect-dy'] = args['properties']['effect-dy'] || 0;
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

// Required args: player, type, x, y
function rts_building_build(args){
    if(rts_players[args['player']]['money'] < rts_buildings[args['type']]['cost']){
        return;
    }

    // Don't allow building outside of level.
    if(args['x'] > core_storage_data['level-size'] - rts_buildings[args['type']]['width']){
        args['x'] = core_storage_data['level-size'] - rts_buildings[args['type']]['width'];

    }else if(args['x'] < -core_storage_data['level-size']){
        args['x'] = -core_storage_data['level-size'];
    }

    if(args['y'] > core_storage_data['level-size'] - rts_buildings[args['type']]['height']){
        args['y'] = core_storage_data['level-size'] - rts_buildings[args['type']]['height'];

    }else if(args['y'] < -core_storage_data['level-size']){
        args['y'] = -core_storage_data['level-size'];
    }

    // Don't allow building on fog.
    args['fog'] = args['fog'] || false;
    if(args['player'] === 0
      && !args['fog']){
        let loop_counter = rts_fog.length - 1;
        if(loop_counter >= 0){
            do{
                if(!rts_fog[loop_counter]['display']){
                    continue;
                }

                if(math_distance({
                  'x0': args['x'],
                  'x1': rts_fog[loop_counter]['x'] - core_storage_data['level-size'] + rts_buildings[args['type']]['width'] / 2,
                  'y0': args['y'],
                  'y1': rts_fog[loop_counter]['y'] - core_storage_data['level-size'] + rts_buildings[args['type']]['height'] / 2,
                }) < 70){
                    return;
                }
            }while(loop_counter--);
        }
    }

    // Don't allow building too far from another building.
    if(rts_players[args['player']]['buildings'].length > 0){
        let build = false;
        for(let building in rts_players[args['player']]['buildings']){
            if(math_distance({
              'x0': args['x'],
              'x1': rts_players[args['player']]['buildings'][building]['x'],
              'y0': args['y'],
              'y1': rts_players[args['player']]['buildings'][building]['y'],
            }) < 200){
                build = true;
                break;
            }
        }
        if(!build){
            return;
        }
    }

    // Don't allow building on other buildings.
    for(let building in rts_players[args['player']]['buildings']){
        if(math_cuboid_overlap({
          'height-0': rts_buildings[args['type']]['height'],
          'height-1': rts_players[args['player']]['buildings'][building]['height'],
          'width-0': rts_buildings[args['type']]['width'],
          'width-1': rts_players[args['player']]['buildings'][building]['width'],
          'x-0': args['x'],
          'x-1': rts_players[args['player']]['buildings'][building]['x'],
          'y-0': args['y'],
          'y-1': rts_players[args['player']]['buildings'][building]['y'],
        })){
            return;
        }
    }

    // Don't allow building on dynamic world elements.
    for(let element in rts_world_dynamic){
        if(math_cuboid_overlap({
          'height-0': rts_buildings[args['type']]['height'],
          'height-1': rts_world_dynamic[element]['height'],
          'width-0': rts_buildings[args['type']]['width'],
          'width-1': rts_world_dynamic[element]['width'],
          'x-0': args['x'],
          'x-1': rts_world_dynamic[element]['x'],
          'y-0': args['y'],
          'y-1': rts_world_dynamic[element]['y'],
        })){
            return;
        }
    }

    rts_players[args['player']]['money'] -= rts_buildings[args['type']]['cost'];
    let building = {
      'damage': 0,
      'destination-x': args['x'] + rts_buildings[args['type']]['width'] / 2,
      'destination-y': args['y'] + rts_buildings[args['type']]['height'] / 2,
      'bullet-speed': 10,
      'fog-radius': 290,
      'income': 0,
      'range': 0,
      'reload': 0,
      'reload-current': 0,
      'selected': false,
      'type': args['type'],
      'x': args['x'],
      'y': args['y'],
    };
    Object.assign(
      building,
      rts_buildings[args['type']]
    );

    rts_players[args['player']]['buildings'].push(building);

    if(building['income'] != 0){
        rts_players[args['player']]['income'] += building['income'];
    }

    if(args['player'] === 0){
        rts_build_mode = '';

        if(rts_fog.length > 0){
            rts_building_fog();
        }
    }
}

// Required args: id, player
function rts_building_destroy(args){
    if(rts_selected_id === args['id']){
        rts_build_mode = '';
        rts_selected_id = -1;
        rts_selected_type = '';
    }

    rts_players[args['player']]['income'] -= rts_players[args['player']]['buildings'][args['id']]['income'] || 0;

    rts_players[args['player']]['buildings'].splice(
      args['id'],
      1
    );
}

function rts_building_fog(){
    for(let building in rts_players[0]['buildings']){
        // Check if fog is within fog disance of a building.
        let loop_counter = rts_fog.length - 1;
        do{
            if(math_distance({
              'x0': rts_players[0]['buildings'][building]['x'],
              'x1': rts_fog[loop_counter]['x'] - core_storage_data['level-size'],
              'y0': rts_players[0]['buildings'][building]['y'],
              'y1': rts_fog[loop_counter]['y'] - core_storage_data['level-size'],
            }) > rts_players[0]['buildings'][building]['fog-radius']){
                continue;
            }

            if(core_storage_data['fog-type'] === 2){
                rts_fog[loop_counter]['display'] = false;

            }else{
                rts_fog.splice(
                  loop_counter,
                  1
                );
            }
        }while(loop_counter--);
    }
}

function rts_building_handle(){
    for(let building in rts_players[1]['buildings']){
        if(rts_players[1]['buildings'][building]['range'] <= 0){
            continue;
        }

        // If reloading, decrease reload,...
        if(rts_players[1]['buildings'][building]['reload-current'] > 0){
            rts_players[1]['buildings'][building]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            let check_for_buildings = true;
            for(let p0_unit in rts_players[0]['units']){
                if(math_distance({
                  'x0': rts_players[1]['buildings'][building]['x'],
                  'x1': rts_players[0]['units'][p0_unit]['x'],
                  'y0': rts_players[1]['buildings'][building]['y'],
                  'y1': rts_players[0]['units'][p0_unit]['y'],
                }) > rts_players[1]['buildings'][building]['range']){
                    continue;
                }

                rts_players[1]['buildings'][building]['reload-current'] = rts_players[1]['buildings'][building]['reload'];
                rts_bullets.push({
                  'color': '#f66',
                  'damage': rts_players[1]['buildings'][building]['damage'],
                  'destination-x': rts_players[0]['units'][p0_unit]['x'],
                  'destination-y': rts_players[0]['units'][p0_unit]['y'],
                  'player': 1,
                  'speed': rts_players[1]['buildings'][building]['bullet-speed'],
                  'x': rts_players[1]['buildings'][building]['x']
                    + buildings[rts_players[1]['buildings'][building]['type']]['width'] / 2,
                  'y': rts_players[1]['buildings'][building]['y']
                    + buildings[rts_players[1]['buildings'][building]['type']]['height'] / 2,
                });
                check_for_buildings = false;
                break;
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(let p0_building in rts_players[0]['buildings']){
                    if(math_distance({
                      'x0': rts_players[1]['buildings'][building]['x'],
                      'x1': rts_players[0]['buildings'][p0_building]['x']
                        + rts_buildings[rts_players[0]['buildings'][p0_building]['type']]['width'] / 2,
                      'y0': rts_players[1]['buildings'][building]['y'],
                      'y1': rts_players[0]['buildings'][p0_building]['y']
                        + rts_buildings[rts_players[0]['buildings'][p0_building]['type']]['height'] / 2,
                    }) > rts_players[1]['buildings'][building]['range']){
                        continue;
                    }

                    rts_players[1]['buildings'][building]['reload-current'] = rts_players[1]['buildings'][building]['reload'];
                    rts_bullets.push({
                      'color': '#f66',
                      'damage': rts_players[1]['buildings'][building]['damage'],
                      'destination-x': rts_players[0]['buildings'][p0_building]['x']
                        + rts_buildings[rts_players[0]['buildings'][p0_building]['type']]['width'] / 2,
                      'destination-y': rts_players[0]['buildings'][p0_building]['y']
                        + rts_buildings[rts_players[0]['buildings'][p0_building]['type']]['height'] / 2,
                      'player': 1,
                      'speed': rts_players[1]['buildings'][building]['bullet-speed'],
                      'x': rts_players[1]['buildings'][building]['x']
                        + rts_buildings[rts_players[1]['buildings'][building]['type']]['width'] / 2,
                      'y': rts_players[1]['buildings'][building]['y']
                        + rts_buildings[rts_players[1]['buildings'][building]['type']]['height'] / 2,
                    });
                    break;
                }
            }
        }
    }

    for(let building in rts_players[0]['buildings']){
        if(rts_players[0]['buildings'][building]['range'] <= 0){
            continue;
        }

        // If reloading, decrease reload,...
        if(rts_players[0]['buildings'][building]['reload-current'] > 0){
            rts_players[0]['buildings'][building]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            let check_for_buildings = true;
            for(let p1_unit in rts_players[1]['units']){
                if(math_distance({
                  'x0': rts_players[0]['buildings'][building]['x'],
                  'x1': rts_players[1]['units'][p1_unit]['x'],
                  'y0': rts_players[0]['buildings'][building]['y'],
                  'y1': rts_players[1]['units'][p1_unit]['y'],
                }) > rts_players[0]['buildings'][building]['range']){
                    continue;
                }

                rts_players[0]['buildings'][building]['reload-current'] = rts_players[0]['buildings'][building]['reload'];
                rts_bullets.push({
                  'color': '#f66',
                  'damage': rts_players[0]['buildings'][building]['damage'],
                  'destination-x': rts_players[1]['units'][p1_unit]['x'],
                  'destination-y': rts_players[1]['units'][p1_unit]['y'],
                  'player': 0,
                  'speed': rts_players[0]['buildings'][building]['bullet-speed'],
                  'x': rts_players[0]['buildings'][building]['x']
                    + rts_buildings[rts_players[0]['buildings'][building]['type']]['width'] / 2,
                  'y': rts_players[0]['buildings'][building]['y']
                    + rts_buildings[rts_players[0]['buildings'][building]['type']]['height'] / 2,
                });
                check_for_buildings = false;
                break;
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(let p1_building in rts_players[1]['buildings']){
                    if(math_distance({
                      'x0': rts_players[0]['buildings'][building]['x'],
                      'x1': rts_players[1]['buildings'][p1_building]['x']
                        + rts_buildings[rts_players[1]['buildings'][p1_building]['type']]['width'] / 2,
                      'y0': rts_players[0]['buildings'][building]['y'],
                      'y1': rts_players[1]['buildings'][p1_building]['y']
                        + rts_buildings[rts_players[1]['buildings'][p1_building]['type']]['height'] / 2,
                    }) > rts_players[0]['buildings'][building]['range']){
                        continue;
                    }

                    rts_players[0]['buildings'][building]['reload-current'] = rts_players[0]['buildings'][building]['reload'];
                    rts_bullets.push({
                      'color': '#f66',
                      'damage': rts_players[0]['buildings'][building]['damage'],
                      'destination-x': rts_players[1]['buildings'][p1_building]['x']
                        + rts_buildings[rts_players[1]['buildings'][p1_building]['type']]['width'] / 2,
                      'destination-y': rts_players[1]['buildings'][p1_building]['y']
                        + rts_buildings[rts_players[1]['buildings'][p1_building]['type']]['height'] / 2,
                      'player': 0,
                      'speed': rts_players[0]['buildings'][building]['bullet-speed'],
                      'x': rts_players[0]['buildings'][building]['x']
                        + rts_buildings[rts_players[0]['buildings'][building]['type']]['width'] / 2,
                      'y': rts_players[0]['buildings'][building]['y']
                        + rts_buildings[rts_players[0]['buildings'][building]['type']]['height'] / 2,
                    });
                    break;
                }
            }
        }
    }
}

function rts_bullet_handle(){
    for(let bullet in rts_bullets){
        // Calculate bullet movement.
        let speeds = math_move_2d({
          'multiplier': rts_bullets[bullet]['speed'],
          'x0': rts_bullets[bullet]['x'],
          'x1': rts_bullets[bullet]['destination-x'],
          'y0': rts_bullets[bullet]['y'],
          'y1': rts_bullets[bullet]['destination-y'],
        });

        // Move bullet x.
        if(rts_bullets[bullet]['x'] != rts_bullets[bullet]['destination-x']){
            rts_bullets[bullet]['x'] += speeds['x'];
        }

        // Move bullet y.
        if(rts_bullets[bullet]['y'] != rts_bullets[bullet]['destination-y']){
            rts_bullets[bullet]['y'] += speeds['y'];
        }

        // If bullet reaches destination, check for collisions.
        if(math_distance({
          'x0': rts_bullets[bullet]['x'],
          'x1': rts_bullets[bullet]['destination-x'],
          'y0': rts_bullets[bullet]['y'],
          'y1': rts_bullets[bullet]['destination-y'],
        }) > 10){
            continue;
        }

        if(rts_bullets[bullet]['player'] === 1){
            for(let unit in rts_players[0]['units']){
                if(math_distance({
                  'x0': rts_bullets[bullet]['x'],
                  'x1': rts_players[0]['units'][unit]['x'],
                  'y0': rts_bullets[bullet]['y'],
                  'y1': rts_players[0]['units'][unit]['y'],
                }) > 15){
                    continue;
                }

                rts_players[0]['units'][unit]['health'] -= rts_bullets[bullet]['damage'];
                if(rts_players[0]['units'][unit]['health'] <= 0){
                    rts_unit_destroy({
                      'id': unit,
                      'player': 0,
                    });
                }

                break;
            }

            for(let building in rts_players[0]['buildings']){
                if(rts_bullets[bullet]['x'] <= rts_players[0]['buildings'][building]['x']
                  || rts_bullets[bullet]['x'] >= rts_players[0]['buildings'][building]['x'] + 100
                  || rts_bullets[bullet]['y'] <= rts_players[0]['buildings'][building]['y']
                  || rts_bullets[bullet]['y'] >= rts_players[0]['buildings'][building]['y'] + 100){
                    continue;
                }

                rts_players[0]['buildings'][building]['health'] -= rts_bullets[bullet]['damage'];
                if(rts_players[0]['buildings'][building]['health'] <= 0){
                    rts_building_destroy({
                      'id': building,
                      'player': 0,
                    });
                }

                break;
            }

        }else{
            for(let unit in rts_players[1]['units']){
                if(math_distance({
                  'x0': rts_bullets[bullet]['x'],
                  'x1': rts_players[1]['units'][unit]['x'],
                  'y0': rts_bullets[bullet]['y'],
                  'y1': rts_players[1]['units'][unit]['y'],
                }) > 15){
                    continue;
                }

                rts_players[1]['units'][unit]['health'] -= rts_bullets[bullet]['damage'];
                if(rts_players[1]['units'][unit]['health'] <= 0){
                    rts_unit_destroy({
                      'id': unit,
                      'player': 1,
                    });
                }

                break;
            }

            for(let building in rts_players[1]['buildings']){
                if(rts_bullets[bullet]['x'] <= rts_players[1]['buildings'][building]['x']
                  || rts_bullets[bullet]['x'] >= rts_players[1]['buildings'][building]['x'] + 100
                  || rts_bullets[bullet]['y'] <= rts_players[1]['buildings'][building]['y']
                  || rts_bullets[bullet]['y'] >= rts_players[1]['buildings'][building]['y'] + 100){
                    continue;
                }

                rts_players[1]['buildings'][building]['health'] -= rts_bullets[bullet]['damage'];
                if(rts_players[1]['buildings'][building]['health'] <= 0){
                    rts_building_destroy({
                      'id': building,
                      'player': 1,
                    });
                }

                break;
            }
        }

        rts_bullets.splice(
          bullet,
          1
        );
    }
}

// Required args: x, y
function rts_camera_validatemove(args){
    camera_x = -rts_math[0] * (args['x'] - 100);
    if(camera_x > core_storage_data['level-size']){
        camera_x = core_storage_data['level-size'];
    }else if(camera_x < -core_storage_data['level-size']){
        camera_x = -core_storage_data['level-size'];
    }

    camera_y = -rts_math[0] * (args['y'] - canvas_properties['height'] + 100);
    if(camera_y > core_storage_data['level-size']){
        camera_y = core_storage_data['level-size'];
    }else if(camera_y < -core_storage_data['level-size']){
        camera_y = -core_storage_data['level-size'];
    }
}

function rts_destionation_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'minimap': false,
      },
    });

    if(rts_selected_type === 'unit'){
        for(let unit in rts_players[0]['units']){
            if(!rts_players[0]['units'][unit]['selected']){
                continue;
            }

            rts_players[0]['units'][unit]['destination-x'] = args['minimap']
              ? rts_math[0] * (core_mouse['x'] - 100)
              : core_mouse['x'] - canvas_properties['width-half'] - camera_x;

            rts_players[0]['units'][unit]['destination-y'] = args['minimap']
              ? rts_math[0] * (core_mouse['y'] - canvas_properties['height'] + 100)
              : core_mouse['y'] - canvas_properties['height-half'] - camera_y;

            rts_destionation_validate({
              'id': unit,
              'type': 'units',
            });
        }

        return;
    }

    for(let building in rts_players[0]['buildings']){
        if(!rts_players[0]['buildings'][building]['selected']){
            continue;
        }

        rts_players[0]['buildings'][building]['destination-x'] = args['minimap']
          ? rts_math[0] * (core_mouse['x'] - 100)
          : core_mouse['x'] - canvas_properties['width-half'] - camera_x;

        rts_players[0]['buildings'][building]['destination-y'] = args['minimap']
          ? rts_math[0] * (core_mouse['y'] - canvas_properties['height'] + 100)
          : core_mouse['y'] - canvas_properties['height-half'] - camera_y;

        rts_destionation_validate({
          'id': building,
          'type': 'buildings',
        });
    }
}

// Required args: id, type
function rts_destionation_validate(args){
    if(rts_players[0][args['type']][args['id']]['destination-x'] > core_storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-x'] = core_storage_data['level-size'];
    }else if(rts_players[0][args['type']][args['id']]['destination-x'] < -core_storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-x'] = -core_storage_data['level-size'];
    }

    if(rts_players[0][args['type']][args['id']]['destination-y'] > core_storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-y'] = core_storage_data['level-size'];
    }else if(rts_players[0][args['type']][args['id']]['destination-y'] < -core_storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-y'] = -core_storage_data['level-size'];
    }
}

function rts_players_handle(){
    rts_money_timer -= 1;
    if(rts_money_timer < 0){
        rts_money_timer = -1;
    }

    for(let player in rts_players){
        if(rts_money_timer === -1){
            rts_players[player]['money'] += rts_players[player]['income'];
        }

        if(rts_players[player]['ai'] !== false){
            if(rts_players[player]['buildings'].length > 1){
                rts_unit_build({
                  'player': player,
                  'type': rts_players[player]['ai']['unit'],
                });

            }else if(rts_players[player]['buildings'].length > 0
              && rts_players[player]['buildings'][0]['type'] === 'HQ'){
                rts_building_build({
                  'player': player,
                  'type': rts_players[player]['ai']['building'],
                  'x': rts_players[player]['buildings'][0]['x'] > 0
                    ? rts_players[player]['buildings'][0]['x'] - 125
                    : rts_players[player]['buildings'][0]['x'] + 125,
                  'y': rts_players[player]['buildings'][0]['y'],
                });
            }
        }
    }
}

function rts_select(){
    rts_selected_id = -1;
    rts_selected_type = '';

    for(let unit in rts_players[0]['units']){
        rts_players[0]['units'][unit]['selected'] = (
            (core_mouse['down-x'] < canvas_properties['width-half'] + rts_players[0]['units'][unit]['x'] + camera_x + 15
              && core_mouse['x'] > canvas_properties['width-half'] + rts_players[0]['units'][unit]['x'] + camera_x - 15)
            || (core_mouse['down-x'] > canvas_properties['width-half'] + rts_players[0]['units'][unit]['x'] + camera_x - 15
              && core_mouse['x'] < canvas_properties['width-half'] + rts_players[0]['units'][unit]['x'] + camera_x + 15)
          ) && (
            (core_mouse['down-y'] < canvas_properties['height-half'] + rts_players[0]['units'][unit]['y'] + camera_y + 15
              && core_mouse['y'] > canvas_properties['height-half'] + rts_players[0]['units'][unit]['y'] + camera_y - 15)
            || (core_mouse['down-y'] > canvas_properties['height-half'] + rts_players[0]['units'][unit]['y'] + camera_y - 15
              && core_mouse['y'] < canvas_properties['height-half'] + rts_players[0]['units'][unit]['y'] + camera_y + 15)
          );

        if(rts_players[0]['units'][unit]['selected']){
            rts_selected_id = unit;
            rts_selected_type = 'unit';
        }
    }

    for(let building in rts_players[0]['buildings']){
        if(rts_selected_type !== ''){
            rts_players[0]['buildings'][building]['selected'] = 0;
            continue;
        }

        rts_players[0]['buildings'][building]['selected'] = (
            (core_mouse['down-x'] < canvas_properties['width-half'] + rts_players[0]['buildings'][building]['x'] + camera_x + rts_players[0]['buildings'][building]['width']
              && core_mouse['x'] > canvas_properties['width-half'] + rts_players[0]['buildings'][building]['x'] + camera_x)
            || (core_mouse['down-x'] > canvas_properties['width-half'] + rts_players[0]['buildings'][building]['x'] + camera_x
              && core_mouse['x'] < canvas_properties['width-half'] + rts_players[0]['buildings'][building]['x'] + camera_x + rts_players[0]['buildings'][building]['width'])
          ) && (
            (core_mouse['down-y'] < canvas_properties['height-half'] + rts_players[0]['buildings'][building]['y'] + camera_y + rts_players[0]['buildings'][building]['height']
              && core_mouse['y'] > canvas_properties['height-half'] + rts_players[0]['buildings'][building]['y'] + camera_y)
            || (core_mouse['down-y'] > canvas_properties['height-half'] + rts_players[0]['buildings'][building]['y'] + camera_y
              && core_mouse['y'] < canvas_properties['height-half'] + rts_players[0]['buildings'][building]['y'] + camera_y + rts_players[0]['buildings'][building]['height'])
          );

        if(rts_players[0]['buildings'][building]['selected']){
            rts_selected_id = building;
            rts_selected_type = rts_players[0]['buildings'][building]['type'];
        }
    }
}

function rts_selected_destroy(){
    if(rts_selected_type === 'unit'){
        rts_unit_destroy({
          'id': rts_selected_id,
          'type': 0,
        });

    }else if(rts_selected_type !== ''){
        rts_building_destroy({
          'id': rts_selected_id,
          'player': 0,
        });
    }
}

// Required args: player, type
function rts_unit_build(args){
    if(rts_players[args['player']]['money'] < rts_units[args['type']]['cost']){
        return;
    }

    rts_players[args['player']]['money'] -= rts_units[args['type']]['cost'];
    let temp_selected_id = args['player'] > 0
      ? 1
      : rts_selected_id;
    let unit = {
      'bullet-speed': 10,
      'damage': 25,
      'destination-x': args['player'] > 0
        ? core_random_integer({
          'max': core_storage_data['level-size'] * 2,
        }) - core_storage_data['level-size']
        : rts_players[args['player']]['buildings'][temp_selected_id]['destination-x'],
      'destination-y': args['player'] > 0
        ? core_random_integer({
          'max': core_storage_data['level-size'] * 2,
        }) - core_storage_data['level-size']
        : rts_players[args['player']]['buildings'][temp_selected_id]['destination-y'],
      'fog-radius': 290,
      'health': 100,
      'selected': false,
      'range': 240,
      'reload': 75,
      'reload-current': 0,
      'speed': .7,
      'x': rts_players[args['player']]['buildings'][temp_selected_id]['x']
        + rts_buildings[rts_players[args['player']]['buildings'][temp_selected_id]['type']]['width'] / 2,
      'y': rts_players[args['player']]['buildings'][temp_selected_id]['y']
        + rts_buildings[rts_players[args['player']]['buildings'][temp_selected_id]['type']]['height'] / 2,
    };
    Object.assign(
      unit,
      rts_units[args['type']]
    );

    rts_players[args['player']]['units'].push(unit);
}

// Required args: id, player
function rts_unit_destroy(args){
    if(rts_selected_id === 'unit'){
        rts_build_mode = '';
        rts_selected_id = -1;
        rts_selected_type = '';
    }

    rts_players[args['player']]['units'].splice(
      args['id'],
      1
    );
}

function rts_unit_handle(){
    for(let unit in rts_players[1]['units']){
        // If reloading, decrease reload,...
        if(rts_players[1]['units'][unit]['reload-current'] > 0){
            rts_players[1]['units'][unit]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            let check_for_buildings = true;
            for(let p0_unit in rts_players[0]['units']){
                if(math_distance({
                  'x0': rts_players[1]['units'][unit]['x'],
                  'x1': rts_players[0]['units'][p0_unit]['x'],
                  'y0': rts_players[1]['units'][unit]['y'],
                  'y1': rts_players[0]['units'][p0_unit]['y'],
                }) > rts_players[1]['units'][unit]['range']){
                    continue;
                }

                rts_players[1]['units'][unit]['reload-current'] = rts_players[1]['units'][unit]['reload'];
                rts_bullets.push({
                  'color': '#f66',
                  'damage': rts_players[1]['units'][unit]['damage'],
                  'destination-x': rts_players[0]['units'][p0_unit]['x'],
                  'destination-y': rts_players[0]['units'][p0_unit]['y'],
                  'player': 1,
                  'speed': rts_players[1]['units'][unit]['bullet-speed'],
                  'x': rts_players[1]['units'][unit]['x'],
                  'y': rts_players[1]['units'][unit]['y'],
                });
                check_for_buildings = false;
                break;
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(let building in rts_players[0]['buildings']){
                    if(math_distance({
                      'x0': rts_players[1]['units'][unit]['x'],
                      'x1': rts_players[0]['buildings'][building]['x']
                        + rts_buildings[rts_players[0]['buildings'][building]['type']]['width'] / 2,
                      'y0': rts_players[1]['units'][unit]['y'],
                      'y1': rts_players[0]['buildings'][building]['y']
                        + rts_buildings[rts_players[0]['buildings'][building]['type']]['height'] / 2,
                    }) > rts_players[1]['units'][unit]['range']){
                        continue;
                    }

                    rts_players[1]['units'][unit]['reload-current'] = rts_players[1]['units'][unit]['reload'];
                    rts_bullets.push({
                      'color': '#f66',
                      'damage': rts_players[1]['units'][unit]['damage'],
                      'destination-x': rts_players[0]['buildings'][building]['x']
                        + rts_buildings[rts_players[0]['buildings'][building]['type']]['width'] / 2,
                      'destination-y': rts_players[0]['buildings'][building]['y']
                        + rts_buildings[rts_players[0]['buildings'][building]['type']]['height'] / 2,
                      'player': 1,
                      'speed': rts_players[1]['units'][unit]['bullet-speed'],
                      'x': rts_players[1]['units'][unit]['x'],
                      'y': rts_players[1]['units'][unit]['y'],
                    });
                    break;
                }
            }
        }

        // Movement "AI", pick new destination once destination is reached.
        if(rts_players[1]['units'][unit]['x'] != rts_players[1]['units'][unit]['destination-x']
          || rts_players[1]['units'][unit]['y'] != rts_players[1]['units'][unit]['destination-y']){
            let speeds = math_move_2d({
              'multiplier': rts_players[1]['units'][unit]['speed'],
              'x0': rts_players[1]['units'][unit]['x'],
              'x1': rts_players[1]['units'][unit]['destination-x'],
              'y0': rts_players[1]['units'][unit]['y'],
              'y1': rts_players[1]['units'][unit]['destination-y'],
            });

            if(rts_players[1]['units'][unit]['x'] != rts_players[1]['units'][unit]['destination-x']){
                rts_players[1]['units'][unit]['x'] += speeds['x'];
            }

            if(rts_players[1]['units'][unit]['y'] != rts_players[1]['units'][unit]['destination-y']){
                rts_players[1]['units'][unit]['y'] += speeds['y'];
            }

            if(math_distance({
              'x0': rts_players[1]['units'][unit]['x'],
              'x1': rts_players[1]['units'][unit]['destination-x'],
              'y0': rts_players[1]['units'][unit]['y'],
              'y1': rts_players[1]['units'][unit]['destination-y'],
            }) < 5){
                rts_players[1]['units'][unit]['destination-x'] = core_random_integer({
                  'max': core_storage_data['level-size'] * 2,
                })
                  - core_storage_data['level-size'];
                rts_players[1]['units'][unit]['destination-y'] = core_random_integer({
                  'max': core_storage_data['level-size'] * 2,
                })
                  - core_storage_data['level-size'];
            }
        }
    }

    for(let unit in rts_players[0]['units']){
        let update_fog = false;

        // If not yet reached destination, move unit.
        if(Math.abs(rts_players[0]['units'][unit]['x'] - rts_players[0]['units'][unit]['destination-x']) > 1
          && Math.abs(rts_players[0]['units'][unit]['y'] - rts_players[0]['units'][unit]['destination-y']) > 1){
            let speeds = math_move_2d({
              'multiplier': rts_players[1]['units'][unit]['speed'],
              'x0': rts_players[0]['units'][unit]['x'],
              'x1': rts_players[0]['units'][unit]['destination-x'],
              'y0': rts_players[0]['units'][unit]['y'],
              'y1': rts_players[0]['units'][unit]['destination-y'],
            });

            if(rts_players[0]['units'][unit]['x'] != rts_players[0]['units'][unit]['destination-x']){
                rts_players[0]['units'][unit]['x'] += speeds['x'];
            }

            if(rts_players[0]['units'][unit]['y'] != rts_players[0]['units'][unit]['destination-y']){
                rts_players[0]['units'][unit]['y'] += speeds['y'];
            }

            update_fog = true;

        // Destination reached, make sure units don't overlap.
        }else{
            rts_players[0]['units'][unit]['destination-x'] = rts_players[0]['units'][unit]['x'];
            rts_players[0]['units'][unit]['destination-y'] = rts_players[0]['units'][unit]['y'];

            for(let other_unit in rts_players[0]['units']){
                if(unit === other_unit){
                    continue;
                }

                if(math_distance({
                  'x0': rts_players[0]['units'][unit]['x'],
                  'x1': rts_players[0]['units'][other_unit]['x'],
                  'y0': rts_players[0]['units'][unit]['y'],
                  'y1': rts_players[0]['units'][other_unit]['y'],
                }) < 20){
                    rts_players[0]['units'][unit]['destination-x'] = rts_players[0]['units'][unit]['x']
                      + core_random_integer({
                        'max': 40,
                      }) - 20;
                    rts_players[0]['units'][unit]['destination-y'] = rts_players[0]['units'][unit]['y']
                      + core_random_integer({
                        'max': 40,
                      }) - 20;

                    rts_destionation_validate({
                      'id': unit,
                      'type': 'units',
                    });

                    break;
                }
            }
        }

        // Update fog.
        if(core_storage_data['fog-type'] === 2
          || update_fog){
            let loop_counter = rts_fog.length - 1;
            if(loop_counter >= 0){
                do{
                    if(math_distance({
                      'x0': rts_players[0]['units'][unit]['x'],
                      'x1': rts_fog[loop_counter]['x'] - core_storage_data['level-size'] + 50,
                      'y0': rts_players[0]['units'][unit]['y'],
                      'y1': rts_fog[loop_counter]['y'] - core_storage_data['level-size'] + 50,
                    }) < rts_players[0]['units'][unit]['fog-radius']){
                        if(core_storage_data['fog-type'] === 2){
                            rts_fog[loop_counter]['display'] = false;

                        }else{
                            rts_fog.splice(
                              loop_counter,
                              1
                            );
                        }
                    }
                }while(loop_counter--);
            }
        }

        // If reloading, decrease reload,...
        if(rts_players[0]['units'][unit]['reload-current'] > 0){
            rts_players[0]['units'][unit]['reload-current'] -= 1;
            continue;
        }

        let check_for_buildings = true;
        for(let p1_unit in rts_players[1]['units']){
            if(math_distance({
              'x0': rts_players[0]['units'][unit]['x'],
              'x1': rts_players[1]['units'][p1_unit]['x'],
              'y0': rts_players[0]['units'][unit]['y'],
              'y1': rts_players[1]['units'][p1_unit]['y'],
            }) > rts_players[0]['units'][unit]['range']){
                continue;
            }

            rts_players[0]['units'][unit]['reload-current'] = rts_players[0]['units'][unit]['reload'];
            rts_bullets.push({
              'color': '#090',
              'damage': rts_players[0]['units'][unit]['damage'],
              'destination-x': rts_players[1]['units'][p1_unit]['x'],
              'destination-y': rts_players[1]['units'][p1_unit]['y'],
              'player': 0,
              'speed': rts_players[0]['units'][unit]['bullet-speed'],
              'x': rts_players[0]['units'][unit]['x'],
              'y': rts_players[0]['units'][unit]['y'],
            });
            check_for_buildings = false;
            break;
        }

        // If not checking for buildings, continue;
        if(!check_for_buildings){
            continue;
        }

        for(let building in rts_players[1]['buildings']){
            if(math_distance({
              'x0': rts_players[0]['units'][unit]['x'],
              'x1': rts_players[1]['buildings'][building]['x']
                + rts_buildings[rts_players[1]['buildings'][building]['type']]['width'] / 2,
              'y0': rts_players[0]['units'][unit]['y'],
              'y1': rts_players[1]['buildings'][building]['y']
                + rts_buildings[rts_players[1]['buildings'][building]['type']]['width'] / 2,
            }) > rts_players[0]['units'][unit]['range']){
                continue;
            }

            rts_players[0]['units'][unit]['reload-current'] = rts_players[0]['units'][unit]['reload'];
            rts_bullets.push({
              'color': '#090',
              'damage': rts_players[0]['units'][unit]['damage'],
              'destination-x': rts_players[1]['buildings'][building]['x']
                + rts_buildings[rts_players[1]['buildings'][building]['type']]['width'] / 2,
              'destination-y': rts_players[1]['buildings'][building]['y']
                + rts_buildings[rts_players[1]['buildings'][building]['type']]['height'] / 2,
              'player': 0,
              'speed': rts_players[0]['units'][unit]['bullet-speed'],
              'x': rts_players[0]['units'][unit]['x'],
              'y': rts_players[0]['units'][unit]['y'],
            });
            break;
        }
    }
}

window.platform_players = {};
window.platform_score_goal = 1;
window.race_checkpoints = [];
window.rpg_characters = [];
window.rpg_particles = [];
window.rpg_spawners = [];
window.rpg_world_dynamic = [];
window.rpg_world_static = [];
window.rts_build_mode = '';
window.rts_buildings = {};
window.rts_bullets = [];
window.rts_fog = [];
window.rts_math = [];
window.rts_money_timer = 0;
window.rts_players = {};
window.rts_selected_id = -1;
window.rts_selected_type = '';
window.rts_units = {};
window.rts_world_dynamic = [];
window.rts_world_static = [];
