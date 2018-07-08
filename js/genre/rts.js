'use strict';

// Required args: player, type, x, y
// Optional args: fog
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

                if(core_distance({
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
            if(core_distance({
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
        if(core_rectangle_overlap({
          'h0': rts_buildings[args['type']]['height'],
          'h1': rts_players[args['player']]['buildings'][building]['height'],
          'w0': rts_buildings[args['type']]['width'],
          'w1': rts_players[args['player']]['buildings'][building]['width'],
          'x0': args['x'],
          'x1': rts_players[args['player']]['buildings'][building]['x'],
          'y0': args['y'],
          'y1': rts_players[args['player']]['buildings'][building]['y'],
        })){
            return;
        }
    }

    // Don't allow building on dynamic world elements.
    for(let element in rts_world_dynamic){
        if(core_rectangle_overlap({
          'h0': rts_buildings[args['type']]['height'],
          'h1': rts_world_dynamic[element]['height'],
          'w0': rts_buildings[args['type']]['width'],
          'w1': rts_world_dynamic[element]['width'],
          'x0': args['x'],
          'x1': rts_world_dynamic[element]['x'],
          'y0': args['y'],
          'y1': rts_world_dynamic[element]['y'],
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
            if(core_distance({
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
                if(core_distance({
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
                    if(core_distance({
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
                if(core_distance({
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
                    if(core_distance({
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
        let speeds = core_move_2d({
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
        if(core_distance({
          'x0': rts_bullets[bullet]['x'],
          'x1': rts_bullets[bullet]['destination-x'],
          'y0': rts_bullets[bullet]['y'],
          'y1': rts_bullets[bullet]['destination-y'],
        }) > 10){
            continue;
        }

        if(rts_bullets[bullet]['player'] === 1){
            for(let unit in rts_players[0]['units']){
                if(core_distance({
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
                if(core_distance({
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

// Optional args: minimap
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
                if(core_distance({
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
                    if(core_distance({
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
            let speeds = core_move_2d({
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

            if(core_distance({
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
            let speeds = core_move_2d({
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

                if(core_distance({
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
                    if(core_distance({
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
            if(core_distance({
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
            if(core_distance({
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

let rts_buildings = {};
let rts_build_mode = '';
let rts_bullets = [];
let rts_fog = [];
let rts_math = [];
let rts_money_timer = 0;
let rts_players = {};
let rts_selected_id = -1;
let rts_selected_type = '';
let rts_units = {};
let rts_world_dynamic = [];
let rts_world_static = [];
