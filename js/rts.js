'use strict';

function build_building(player, building_type, building_x, building_y, fog_override){
    if(players[player]['money'] < buildings[building_type]['cost']){
        return;
    }

    // Make sure building is within buildable limit.
    if(building_x > settings_settings['level-size'] - buildings[building_type]['width']){
        building_x = settings_settings['level-size'] - buildings[building_type]['width'];

    }else if(building_x < -settings_settings['level-size']){
        building_x = -settings_settings['level-size'];
    }

    if(building_y > settings_settings['level-size'] - buildings[building_type]['height']){
        building_y = settings_settings['level-size'] - buildings[building_type]['height'];

    }else if(building_y < -settings_settings['level-size']){
        building_y = -settings_settings['level-size'];
    }

    fog_override = fog_override || false;

    if(player === 0
      && !fog_override){
        // Don't allow building on fog.
        var loop_counter = fog.length - 1;
        if(loop_counter >= 0){
            do{
                if(!fog[loop_counter]['display']){
                    continue;
                }

                if(math_distance(
                  building_x,
                  building_y,
                  fog[loop_counter]['x'] - settings_settings['level-size'] + buildings[building_type]['width'] / 2,
                  fog[loop_counter]['y'] - settings_settings['level-size'] + buildings[building_type]['height'] / 2
                ) < 70){
                    return;
                }
            }while(loop_counter--);
        }
    }

    players[player]['money'] -= buildings[building_type]['cost'];

    var building = {
      'damage': 0,
      'destination-x': building_x + buildings[building_type]['width'] / 2,
      'destination-y': building_y + buildings[building_type]['height'] / 2,
      'range': 0,
      'reload': 0,
      'reload-current': 0,
      'selected': false,
      'type': building_type,
      'x': building_x,
      'y': building_y,
    };

    for(var property in buildings[building_type]){
        building[property] = buildings[building_type][property];
    }

    players[player]['buildings'].push(building);

    if(player === 0){
        build_mode = '';

        if(fog.length > 0){
            fog_update_building();
        }
    }
}

function build_unit(player, unit_type){
    if(players[player]['money'] < units[unit_type]['cost']){
        return;
    }

    players[player]['money'] -= units[unit_type]['cost'];

    var temp_selected_id = player > 0
      ? 1
      : selected_id;
    var unit = {
      'damage': 25,
      'destination-x': player > 0
        ? random_integer(settings_settings['level-size'] * 2) - settings_settings['level-size']
        : players[player]['buildings'][temp_selected_id]['destination-x'],
      'destination-y': player > 0
        ? random_integer(settings_settings['level-size'] * 2) - settings_settings['level-size']
        : players[player]['buildings'][temp_selected_id]['destination-y'],
      'health': 100,
      'selected': false,
      'range': 240,
      'reload': 75,
      'reload-current': 0,
      'x': players[player]['buildings'][temp_selected_id]['x']
        + buildings[players[player]['buildings'][temp_selected_id]['type']]['width'] / 2,
      'y': players[player]['buildings'][temp_selected_id]['y']
        + buildings[players[player]['buildings'][temp_selected_id]['type']]['height'] / 2,
    };

    for(var property in units[unit_type]){
        unit[property] = units[unit_type][property];
    }

    players[player]['units'].push(unit);
}

function fog_update_building(){
    for(var building in players[0]['buildings']){
        // Check if fog is within 390px of a building.
        var loop_counter = fog.length - 1;
        do{
            if(math_distance(
              players[0]['buildings'][building]['x'],
              players[0]['buildings'][building]['y'],
              fog[loop_counter]['x'] - settings_settings['level-size'],
              fog[loop_counter]['y'] - settings_settings['level-size']
            ) > 390){
                continue;
            }

            if(settings_settings['fog-type'] === 2){
                fog[loop_counter]['display'] = false;

            }else{
                fog.splice(
                  loop_counter,
                  1
                );
            }
        }while(loop_counter--);
    }
}


function select(){
    selected_id = -1;
    selected_type = '';

    for(var unit in players[0]['units']){
        players[0]['units'][unit]['selected'] = (
            (mouse_lock_x < canvas_x + players[0]['units'][unit]['x'] + camera_x + 15
              && mouse_x > canvas_x + players[0]['units'][unit]['x'] + camera_x - 15)
            || (mouse_lock_x > canvas_x + players[0]['units'][unit]['x'] + camera_x - 15
              && mouse_x < canvas_x + players[0]['units'][unit]['x'] + camera_x + 15)
          ) && (
            (mouse_lock_y < canvas_y + players[0]['units'][unit]['y'] + camera_y + 15
              && mouse_y > canvas_y + players[0]['units'][unit]['y'] + camera_y - 15)
            || (mouse_lock_y > canvas_y + players[0]['units'][unit]['y'] + camera_y - 15
              && mouse_y < canvas_y + players[0]['units'][unit]['y'] + camera_y + 15)
          );

        if(players[0]['units'][unit]['selected']){
            selected_id = unit;
            selected_type = 'Unit';
        }
    }

    for(var building in players[0]['buildings']){
        if(selected_type !== ''){
            players[0]['buildings'][building]['selected'] = 0;
            continue;
        }

        players[0]['buildings'][building]['selected'] = (
            (mouse_lock_x < canvas_x + players[0]['buildings'][building]['x'] + camera_x + players[0]['buildings'][building]['width']
              && mouse_x > canvas_x + players[0]['buildings'][building]['x'] + camera_x)
            || (mouse_lock_x > canvas_x + players[0]['buildings'][building]['x'] + camera_x
              && mouse_x < canvas_x + players[0]['buildings'][building]['x'] + camera_x + players[0]['buildings'][building]['width'])
          ) && (
            (mouse_lock_y < canvas_y + players[0]['buildings'][building]['y'] + camera_y + players[0]['buildings'][building]['height']
              && mouse_y > canvas_y + players[0]['buildings'][building]['y'] + camera_y)
            || (mouse_lock_y > canvas_y + players[0]['buildings'][building]['y'] + camera_y
              && mouse_y < canvas_y + players[0]['buildings'][building]['y'] + camera_y + players[0]['buildings'][building]['height'])
          );

        if(players[0]['buildings'][building]['selected']){
            selected_id = building;
            selected_type = players[0]['buildings'][building]['type'];
        }
    }
}

function setdestination(on_minimap){
    if(selected_type === 'Unit'){
        for(var unit in players[0]['units']){
            if(!players[0]['units'][unit]['selected']){
                continue;
            }

            players[0]['units'][unit]['destination-x'] = on_minimap
              ? math[0] * (mouse_x - 100)
              : mouse_x - canvas_x - camera_x;

            players[0]['units'][unit]['destination-y'] = on_minimap
              ? math[0] * (mouse_y - canvas_height + 100)
              : mouse_y - canvas_y - camera_y;

            validate_destination(
              'units',
              unit
            );
        }

        return;
    }

    for(var building in players[0]['buildings']){
        if(!players[0]['buildings'][building]['selected']){
            continue;
        }

        players[0]['buildings'][building]['destination-x'] = on_minimap
          ? math[0] * (mouse_x - 100)
          : mouse_x - canvas_x - camera_x;

        players[0]['buildings'][building]['destination-y'] = on_minimap
          ? math[0] * (mouse_y - canvas_height + 100)
          : mouse_y - canvas_y - camera_y;

        validate_destination(
          'buildings',
          building
        );
    }
}

function validate_camera_move(mouse_x, mouse_y){
    camera_x = -math[0] * (mouse_x - 100);
    if(camera_x > settings_settings['level-size']){
        camera_x = settings_settings['level-size'];
    }else if(camera_x < -settings_settings['level-size']){
        camera_x = -settings_settings['level-size'];
    }

    camera_y = -math[0] * (mouse_y - canvas_height + 100);
    if(camera_y > settings_settings['level-size']){
        camera_y = settings_settings['level-size'];
    }else if(camera_y < -settings_settings['level-size']){
        camera_y = -settings_settings['level-size'];
    }
}

function validate_destination(type, id){
    if(players[0][type][id]['destination-x'] > settings_settings['level-size']){
        players[0][type][id]['destination-x'] = settings_settings['level-size'];
    }else if(players[0][type][id]['destination-x'] < -settings_settings['level-size']){
        players[0][type][id]['destination-x'] = -settings_settings['level-size'];
    }

    if(players[0][type][id]['destination-y'] > settings_settings['level-size']){
        players[0][type][id]['destination-y'] = settings_settings['level-size'];
    }else if(players[0][type][id]['destination-y'] < -settings_settings['level-size']){
        players[0][type][id]['destination-y'] = -settings_settings['level-size'];
    }
}

var buildings = {};
var build_mode = '';
var bullets = [];
var fog = [];
var math = [];
var money_timer = 0;
var paused = false;
var players = {};
var selected_id = -1;
var selected_type = '';
var units = {};
var world_static = [];
