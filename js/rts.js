'use strict';

function rts_building_build(player, building_type, building_x, building_y, fog_override){
    if(rts_players[player]['money'] < rts_buildings[building_type]['cost']){
        return;
    }

    // Make sure building is within buildable limit.
    if(building_x > settings_settings['level-size'] - rts_buildings[building_type]['width']){
        building_x = settings_settings['level-size'] - rts_buildings[building_type]['width'];

    }else if(building_x < -settings_settings['level-size']){
        building_x = -settings_settings['level-size'];
    }

    if(building_y > settings_settings['level-size'] - rts_buildings[building_type]['height']){
        building_y = settings_settings['level-size'] - rts_buildings[building_type]['height'];

    }else if(building_y < -settings_settings['level-size']){
        building_y = -settings_settings['level-size'];
    }

    if(player === 0
      && !(fog_override || false)){
        // Don't allow building on fog.
        var loop_counter = rts_fog.length - 1;
        if(loop_counter >= 0){
            do{
                if(!rts_fog[loop_counter]['display']){
                    continue;
                }

                if(math_distance(
                  building_x,
                  building_y,
                  rts_fog[loop_counter]['x'] - settings_settings['level-size'] + rts_buildings[building_type]['width'] / 2,
                  rts_fog[loop_counter]['y'] - settings_settings['level-size'] + rts_buildings[building_type]['height'] / 2
                ) < 70){
                    return;
                }
            }while(loop_counter--);
        }
    }

    rts_players[player]['money'] -= rts_buildings[building_type]['cost'];

    var building = {
      'damage': 0,
      'destination-x': building_x + rts_buildings[building_type]['width'] / 2,
      'destination-y': building_y + rts_buildings[building_type]['height'] / 2,
      'range': 0,
      'reload': 0,
      'reload-current': 0,
      'selected': false,
      'type': building_type,
      'x': building_x,
      'y': building_y,
    };

    for(var property in rts_buildings[building_type]){
        building[property] = rts_buildings[building_type][property];
    }

    rts_players[player]['buildings'].push(building);

    if(player === 0){
        rts_build_mode = '';

        if(rts_fog.length > 0){
            rts_building_fog();
        }
    }
}

function rts_building_fog(){
    for(var building in rts_players[0]['buildings']){
        // Check if fog is within 390px of a building.
        var loop_counter = rts_fog.length - 1;
        do{
            if(math_distance(
              rts_players[0]['buildings'][building]['x'],
              rts_players[0]['buildings'][building]['y'],
              rts_fog[loop_counter]['x'] - settings_settings['level-size'],
              rts_fog[loop_counter]['y'] - settings_settings['level-size']
            ) > 390){
                continue;
            }

            if(settings_settings['fog-type'] === 2){
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

function rts_camera_validatemove(mouse_x, mouse_y){
    camera_x = -rts_math[0] * (mouse_x - 100);
    if(camera_x > settings_settings['level-size']){
        camera_x = settings_settings['level-size'];
    }else if(camera_x < -settings_settings['level-size']){
        camera_x = -settings_settings['level-size'];
    }

    camera_y = -rts_math[0] * (mouse_y - canvas_height + 100);
    if(camera_y > settings_settings['level-size']){
        camera_y = settings_settings['level-size'];
    }else if(camera_y < -settings_settings['level-size']){
        camera_y = -settings_settings['level-size'];
    }
}

function rts_destionation_set(on_minimap){
    if(rts_selected_type === 'Unit'){
        for(var unit in rts_players[0]['units']){
            if(!rts_players[0]['units'][unit]['selected']){
                continue;
            }

            rts_players[0]['units'][unit]['destination-x'] = on_minimap
              ? rts_math[0] * (mouse_x - 100)
              : mouse_x - canvas_x - camera_x;

            rts_players[0]['units'][unit]['destination-y'] = on_minimap
              ? rts_math[0] * (mouse_y - canvas_height + 100)
              : mouse_y - canvas_y - camera_y;

            rts_destionation_validate(
              'units',
              unit
            );
        }

        return;
    }

    for(var building in rts_players[0]['buildings']){
        if(!rts_players[0]['buildings'][building]['selected']){
            continue;
        }

        rts_players[0]['buildings'][building]['destination-x'] = on_minimap
          ? rts_math[0] * (mouse_x - 100)
          : mouse_x - canvas_x - camera_x;

        rts_players[0]['buildings'][building]['destination-y'] = on_minimap
          ? rts_math[0] * (mouse_y - canvas_height + 100)
          : mouse_y - canvas_y - camera_y;

        rts_destionation_validate(
          'buildings',
          building
        );
    }
}

function rts_destionation_validate(type, id){
    if(rts_players[0][type][id]['destination-x'] > settings_settings['level-size']){
        rts_players[0][type][id]['destination-x'] = settings_settings['level-size'];
    }else if(rts_players[0][type][id]['destination-x'] < -settings_settings['level-size']){
        rts_players[0][type][id]['destination-x'] = -settings_settings['level-size'];
    }

    if(rts_players[0][type][id]['destination-y'] > settings_settings['level-size']){
        rts_players[0][type][id]['destination-y'] = settings_settings['level-size'];
    }else if(rts_players[0][type][id]['destination-y'] < -settings_settings['level-size']){
        rts_players[0][type][id]['destination-y'] = -settings_settings['level-size'];
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
            rts_selected_type = 'Unit';
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

function rts_unit_build(player, unit_type){
    if(rts_players[player]['money'] < rts_units[unit_type]['cost']){
        return;
    }

    rts_players[player]['money'] -= rts_units[unit_type]['cost'];

    var temp_selected_id = player > 0
      ? 1
      : rts_selected_id;
    var unit = {
      'damage': 25,
      'destination-x': player > 0
        ? random_integer(settings_settings['level-size'] * 2) - settings_settings['level-size']
        : rts_players[player]['buildings'][temp_selected_id]['destination-x'],
      'destination-y': player > 0
        ? random_integer(settings_settings['level-size'] * 2) - settings_settings['level-size']
        : rts_players[player]['buildings'][temp_selected_id]['destination-y'],
      'health': 100,
      'selected': false,
      'range': 240,
      'reload': 75,
      'reload-current': 0,
      'x': rts_players[player]['buildings'][temp_selected_id]['x']
        + rts_buildings[rts_players[player]['buildings'][temp_selected_id]['type']]['width'] / 2,
      'y': rts_players[player]['buildings'][temp_selected_id]['y']
        + rts_buildings[rts_players[player]['buildings'][temp_selected_id]['type']]['height'] / 2,
    };

    for(var property in rts_units[unit_type]){
        unit[property] = rts_units[unit_type][property];
    }

    rts_players[player]['units'].push(unit);
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
var rts_world_static = [];
