'use strict';

// Required args: player, type, x, y
// Optional args: fog
function rts_building_build(args){
    if(rts_players[args['player']]['money'] < rts_buildings[args['type']]['cost']){
        return;
    }

    // Don't allow building outside of level.
    if(args['x'] > storage_data['level-size'] - rts_buildings[args['type']]['width']){
        args['x'] = storage_data['level-size'] - rts_buildings[args['type']]['width'];

    }else if(args['x'] < -storage_data['level-size']){
        args['x'] = -storage_data['level-size'];
    }

    if(args['y'] > storage_data['level-size'] - rts_buildings[args['type']]['height']){
        args['y'] = storage_data['level-size'] - rts_buildings[args['type']]['height'];

    }else if(args['y'] < -storage_data['level-size']){
        args['y'] = -storage_data['level-size'];
    }

    // Don't allow building on fog.
    args['fog'] = args['fog'] || false;
    if(args['player'] === 0
      && !args['fog']){
        var loop_counter = rts_fog.length - 1;
        if(loop_counter >= 0){
            do{
                if(!rts_fog[loop_counter]['display']){
                    continue;
                }

                if(math_distance({
                  'x0': args['x'],
                  'x1': rts_fog[loop_counter]['x'] - storage_data['level-size'] + rts_buildings[args['type']]['width'] / 2,
                  'y0': args['y'],
                  'y1': rts_fog[loop_counter]['y'] - storage_data['level-size'] + rts_buildings[args['type']]['height'] / 2,
                }) < 70){
                    return;
                }
            }while(loop_counter--);
        }
    }

    // Don't allow building too far from another building.
    if(rts_players[args['player']]['buildings'].length > 0){
        var build = false;
        for(var building in rts_players[args['player']]['buildings']){
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
    for(var building in rts_players[args['player']]['buildings']){
        if(math_rectangle_overlap({
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
    for(var element in rts_world_dynamic){
        if(math_rectangle_overlap({
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
    var building = {
      'damage': 0,
      'destination-x': args['x'] + rts_buildings[args['type']]['width'] / 2,
      'destination-y': args['y'] + rts_buildings[args['type']]['height'] / 2,
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
    for(var property in rts_buildings[args['type']]){
        building[property] = rts_buildings[args['type']][property];
    }

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
    for(var building in rts_players[0]['buildings']){
        // Check if fog is within fog disance of a building.
        var loop_counter = rts_fog.length - 1;
        do{
            if(math_distance({
              'x0': rts_players[0]['buildings'][building]['x'],
              'x1': rts_fog[loop_counter]['x'] - storage_data['level-size'],
              'y0': rts_players[0]['buildings'][building]['y'],
              'y1': rts_fog[loop_counter]['y'] - storage_data['level-size'],
            }) > rts_players[0]['buildings'][building]['fog-radius']){
                continue;
            }

            if(storage_data['fog-type'] === 2){
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
    for(var building in rts_players[1]['buildings']){
        if(rts_players[1]['buildings'][building]['range'] <= 0){
            continue;
        }

        // If reloading, decrease reload,...
        if(rts_players[1]['buildings'][building]['reload-current'] > 0){
            rts_players[1]['buildings'][building]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            var check_for_buildings = true;
            for(var p0_unit in rts_players[0]['units']){
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
                for(var p0_building in rts_players[0]['buildings']){
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

    for(building in rts_players[0]['buildings']){
        if(rts_players[0]['buildings'][building]['range'] <= 0){
            continue;
        }

        // If reloading, decrease reload,...
        if(rts_players[0]['buildings'][building]['reload-current'] > 0){
            rts_players[0]['buildings'][building]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            var check_for_buildings = true;
            for(var p1_unit in rts_players[1]['units']){
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
                for(var p1_building in rts_players[1]['buildings']){
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
    for(var bullet in rts_bullets){
        // Calculate bullet movement.
        var speeds = math_movement_speed({
          'x0': rts_bullets[bullet]['x'],
          'x1': rts_bullets[bullet]['destination-x'],
          'y0': rts_bullets[bullet]['y'],
          'y1': rts_bullets[bullet]['destination-y'],
        });

        // Move bullet x.
        if(rts_bullets[bullet]['x'] != rts_bullets[bullet]['destination-x']){
            rts_bullets[bullet]['x'] +=
              10
              * (rts_bullets[bullet]['x'] > rts_bullets[bullet]['destination-x']
                ? -speeds[0]
                : speeds[0]
              );
        }

        // Move bullet y.
        if(rts_bullets[bullet]['y'] != rts_bullets[bullet]['destination-y']){
            rts_bullets[bullet]['y'] +=
              10
              * (rts_bullets[bullet]['y'] > rts_bullets[bullet]['destination-y']
                ? -speeds[1]
                : speeds[1]
              );
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
            for(var unit in rts_players[0]['units']){
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

            for(var building in rts_players[0]['buildings']){
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
            for(var unit in rts_players[1]['units']){
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

            for(var building in rts_players[1]['buildings']){
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
    if(camera_x > storage_data['level-size']){
        camera_x = storage_data['level-size'];
    }else if(camera_x < -storage_data['level-size']){
        camera_x = -storage_data['level-size'];
    }

    camera_y = -rts_math[0] * (args['y'] - canvas_height + 100);
    if(camera_y > storage_data['level-size']){
        camera_y = storage_data['level-size'];
    }else if(camera_y < -storage_data['level-size']){
        camera_y = -storage_data['level-size'];
    }
}

// Optional args: minimap
function rts_destionation_set(args){
    args = args || {};
    args['minimap'] = args['minimap'] || false;

    if(rts_selected_type === 'unit'){
        for(var unit in rts_players[0]['units']){
            if(!rts_players[0]['units'][unit]['selected']){
                continue;
            }

            rts_players[0]['units'][unit]['destination-x'] = args['minimap']
              ? rts_math[0] * (mouse_x - 100)
              : mouse_x - canvas_x - camera_x;

            rts_players[0]['units'][unit]['destination-y'] = args['minimap']
              ? rts_math[0] * (mouse_y - canvas_height + 100)
              : mouse_y - canvas_y - camera_y;

            rts_destionation_validate({
              'id': unit,
              'type': 'units',
            });
        }

        return;
    }

    for(var building in rts_players[0]['buildings']){
        if(!rts_players[0]['buildings'][building]['selected']){
            continue;
        }

        rts_players[0]['buildings'][building]['destination-x'] = args['minimap']
          ? rts_math[0] * (mouse_x - 100)
          : mouse_x - canvas_x - camera_x;

        rts_players[0]['buildings'][building]['destination-y'] = args['minimap']
          ? rts_math[0] * (mouse_y - canvas_height + 100)
          : mouse_y - canvas_y - camera_y;

        rts_destionation_validate({
          'id': building,
          'type': 'buildings',
        });
    }
}

// Required args: id, type
function rts_destionation_validate(args){
    if(rts_players[0][args['type']][args['id']]['destination-x'] > storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-x'] = storage_data['level-size'];
    }else if(rts_players[0][args['type']][args['id']]['destination-x'] < -storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-x'] = -storage_data['level-size'];
    }

    if(rts_players[0][args['type']][args['id']]['destination-y'] > storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-y'] = storage_data['level-size'];
    }else if(rts_players[0][args['type']][args['id']]['destination-y'] < -storage_data['level-size']){
        rts_players[0][args['type']][args['id']]['destination-y'] = -storage_data['level-size'];
    }
}

function rts_players_handle(){
    rts_money_timer -= 1;
    if(rts_money_timer < 0){
        rts_money_timer = -1;
    }

    for(var player in rts_players){
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

    for(var unit in rts_players[0]['units']){
        rts_players[0]['units'][unit]['selected'] = (
            (mouse_lock_x < canvas_x + rts_players[0]['units'][unit]['x'] + camera_x + 15
              && mouse_x > canvas_x + rts_players[0]['units'][unit]['x'] + camera_x - 15)
            || (mouse_lock_x > canvas_x + rts_players[0]['units'][unit]['x'] + camera_x - 15
              && mouse_x < canvas_x + rts_players[0]['units'][unit]['x'] + camera_x + 15)
          ) && (
            (mouse_lock_y < canvas_y + rts_players[0]['units'][unit]['y'] + camera_y + 15
              && mouse_y > canvas_y + rts_players[0]['units'][unit]['y'] + camera_y - 15)
            || (mouse_lock_y > canvas_y + rts_players[0]['units'][unit]['y'] + camera_y - 15
              && mouse_y < canvas_y + rts_players[0]['units'][unit]['y'] + camera_y + 15)
          );

        if(rts_players[0]['units'][unit]['selected']){
            rts_selected_id = unit;
            rts_selected_type = 'unit';
        }
    }

    for(var building in rts_players[0]['buildings']){
        if(rts_selected_type !== ''){
            rts_players[0]['buildings'][building]['selected'] = 0;
            continue;
        }

        rts_players[0]['buildings'][building]['selected'] = (
            (mouse_lock_x < canvas_x + rts_players[0]['buildings'][building]['x'] + camera_x + rts_players[0]['buildings'][building]['width']
              && mouse_x > canvas_x + rts_players[0]['buildings'][building]['x'] + camera_x)
            || (mouse_lock_x > canvas_x + rts_players[0]['buildings'][building]['x'] + camera_x
              && mouse_x < canvas_x + rts_players[0]['buildings'][building]['x'] + camera_x + rts_players[0]['buildings'][building]['width'])
          ) && (
            (mouse_lock_y < canvas_y + rts_players[0]['buildings'][building]['y'] + camera_y + rts_players[0]['buildings'][building]['height']
              && mouse_y > canvas_y + rts_players[0]['buildings'][building]['y'] + camera_y)
            || (mouse_lock_y > canvas_y + rts_players[0]['buildings'][building]['y'] + camera_y
              && mouse_y < canvas_y + rts_players[0]['buildings'][building]['y'] + camera_y + rts_players[0]['buildings'][building]['height'])
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
    var temp_selected_id = args['player'] > 0
      ? 1
      : rts_selected_id;
    var unit = {
      'damage': 25,
      'destination-x': args['player'] > 0
        ? random_integer({
          'max': storage_data['level-size'] * 2,
        }) - storage_data['level-size']
        : rts_players[args['player']]['buildings'][temp_selected_id]['destination-x'],
      'destination-y': args['player'] > 0
        ? random_integer({
          'max': storage_data['level-size'] * 2,
        }) - storage_data['level-size']
        : rts_players[args['player']]['buildings'][temp_selected_id]['destination-y'],
      'fog-radius': 290,
      'health': 100,
      'selected': false,
      'range': 240,
      'reload': 75,
      'reload-current': 0,
      'x': rts_players[args['player']]['buildings'][temp_selected_id]['x']
        + rts_buildings[rts_players[args['player']]['buildings'][temp_selected_id]['type']]['width'] / 2,
      'y': rts_players[args['player']]['buildings'][temp_selected_id]['y']
        + rts_buildings[rts_players[args['player']]['buildings'][temp_selected_id]['type']]['height'] / 2,
    };
    for(var property in rts_units[args['type']]){
        unit[property] = rts_units[args['type']][property];
    }

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
    for(var unit in rts_players[1]['units']){
        // If reloading, decrease reload,...
        if(rts_players[1]['units'][unit]['reload-current'] > 0){
            rts_players[1]['units'][unit]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            var check_for_buildings = true;
            for(var p0_unit in rts_players[0]['units']){
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
                  'x': rts_players[1]['units'][unit]['x'],
                  'y': rts_players[1]['units'][unit]['y'],
                });
                check_for_buildings = false;
                break;
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(var building in rts_players[0]['buildings']){
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
            var speeds = math_movement_speed({
              'x0': rts_players[1]['units'][unit]['x'],
              'x1': rts_players[1]['units'][unit]['destination-x'],
              'y0': rts_players[1]['units'][unit]['y'],
              'y1': rts_players[1]['units'][unit]['destination-y'],
            });

            if(rts_players[1]['units'][unit]['x'] != rts_players[1]['units'][unit]['destination-x']){
                rts_players[1]['units'][unit]['x'] +=
                  (rts_players[1]['units'][unit]['x'] > rts_players[1]['units'][unit]['destination-x']
                    ? -speeds[0]
                    : speeds[0]
                  ) * .7;
            }

            if(rts_players[1]['units'][unit]['y'] != rts_players[1]['units'][unit]['destination-y']){
                rts_players[1]['units'][unit]['y'] +=
                  (rts_players[1]['units'][unit]['y'] > rts_players[1]['units'][unit]['destination-y']
                    ? -speeds[1]
                    : speeds[1]
                  ) * .7;
            }

            if(math_distance({
              'x0': rts_players[1]['units'][unit]['x'],
              'x1': rts_players[1]['units'][unit]['destination-x'],
              'y0': rts_players[1]['units'][unit]['y'],
              'y1': rts_players[1]['units'][unit]['destination-y'],
            }) < 5){
                rts_players[1]['units'][unit]['destination-x'] = random_integer({
                  'max': storage_data['level-size'] * 2,
                })
                  - storage_data['level-size'];
                rts_players[1]['units'][unit]['destination-y'] = random_integer({
                  'max': storage_data['level-size'] * 2,
                })
                  - storage_data['level-size'];
            }
        }
    }

    for(unit in rts_players[0]['units']){
        var update_fog = false;

        // If not yet reached destination, move unit.
        if(Math.abs(rts_players[0]['units'][unit]['x'] - rts_players[0]['units'][unit]['destination-x']) > 1
          && Math.abs(rts_players[0]['units'][unit]['y'] - rts_players[0]['units'][unit]['destination-y']) > 1){
            var speeds = math_movement_speed({
              'x0': rts_players[0]['units'][unit]['x'],
              'x1': rts_players[0]['units'][unit]['destination-x'],
              'y0': rts_players[0]['units'][unit]['y'],
              'y1': rts_players[0]['units'][unit]['destination-y'],
            });

            if(rts_players[0]['units'][unit]['x'] != rts_players[0]['units'][unit]['destination-x']){
                rts_players[0]['units'][unit]['x'] +=
                  (rts_players[0]['units'][unit]['x'] > rts_players[0]['units'][unit]['destination-x']
                    ? -speeds[0]
                    : speeds[0]
                  ) * .7;
            }

            if(rts_players[0]['units'][unit]['y'] != rts_players[0]['units'][unit]['destination-y']){
                rts_players[0]['units'][unit]['y'] +=
                  (rts_players[0]['units'][unit]['y'] > rts_players[0]['units'][unit]['destination-y']
                    ? -speeds[1]
                    : speeds[1]
                  ) * .7;
            }

            update_fog = true;

        // Destination reached, make sure units don't overlap.
        }else{
            rts_players[0]['units'][unit]['destination-x'] = rts_players[0]['units'][unit]['x'];
            rts_players[0]['units'][unit]['destination-y'] = rts_players[0]['units'][unit]['y'];

            for(var other_unit in rts_players[0]['units']){
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
                      + random_integer({
                        'max': 40,
                      }) - 20;
                    rts_players[0]['units'][unit]['destination-y'] = rts_players[0]['units'][unit]['y']
                      + random_integer({
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
        if(storage_data['fog-type'] === 2
          || update_fog){
            var loop_counter = rts_fog.length - 1;
            if(loop_counter >= 0){
                do{
                    if(math_distance({
                      'x0': rts_players[0]['units'][unit]['x'],
                      'x1': rts_fog[loop_counter]['x'] - storage_data['level-size'] + 50,
                      'y0': rts_players[0]['units'][unit]['y'],
                      'y1': rts_fog[loop_counter]['y'] - storage_data['level-size'] + 50,
                    }) < rts_players[0]['units'][unit]['fog-radius']){
                        if(storage_data['fog-type'] === 2){
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

        var check_for_buildings = true;
        for(var p1_unit in rts_players[1]['units']){
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

        for(var building in rts_players[1]['buildings']){
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
              'x': rts_players[0]['units'][unit]['x'],
              'y': rts_players[0]['units'][unit]['y'],
            });
            break;
        }
    }
}

var rts_buildings = {};
var rts_build_mode = '';
var rts_bullets = [];
var rts_fog = [];
var rts_math = [];
var rts_money_timer = 0;
var rts_players = {};
var rts_selected_id = -1;
var rts_selected_type = '';
var rts_units = {};
var rts_world_dynamic = [];
var rts_world_static = [];
