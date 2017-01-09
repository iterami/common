'use strict';

// Required args: event, key, object
// Optional arsg: state, todo
function input_handle_event(args){
    if(args['object'].hasOwnProperty(args['key'])){
        if(args['object'][args['key']]['preventDefault']){
            args['event'].preventDefault();
        }

        if(args['todo'] !== void 0
          && !args['object'][args['key']]['loop']){
            args['object'][args['key']]['todo']();
        }

        if(args['state'] !== void 0){
            args['object'][args['key']]['state'] = args['state'];
        }

        return args['object'][args['key']]['solo'];
    }

    return false;
}

function input_handle_gamepadconnected(event){
    var gamepad = event.gamepad;
    input_gamepads[gamepad.index] = gamepad;
}

function input_handle_gamepaddisconnected(event){
    delete input_gamepads[event.gamepad.index];
}

function input_handle_keydown(event){
    var key = input_keyinfo_get(event);

    var solo = input_handle_event({
      'event': event,
      'key': key['code'],
      'object': input_keys,
      'state': true,
      'todo': true,
    });
    if(solo){
        return;
    }

    input_handle_event({
      'event': event,
      'key': 'all',
      'object': input_keys,
      'state': true,
      'todo': true,
    });
}

function input_handle_keyup(event){
    var key = input_keyinfo_get(event);

    var solo = input_handle_event({
      'event': event,
      'key': key['code'],
      'object': input_keys,
      'state': false,
    });
    if(solo){
        return;
    }

    if(input_keys.hasOwnProperty('all')){
        var all = false;
        for(var key in input_keys){
            if(key !== 'all'
              && input_keys[key]['state']){
                all = true;
                break;
            }
        }
        input_keys['all']['state'] = all;
    }
}

function input_handle_mousedown(event){
    input_mouse['down'] = true;
    input_mouse['down-x'] = input_mouse['x'];
    input_mouse['down-y'] = input_mouse['y'];
    input_handle_event({
      'event': event,
      'key': 'mousedown',
      'object': input_mouse['todo'],
      'todo': true,
    });
}

function input_handle_mousemove(event){
    input_mouse['movement-x'] = event.movementX;
    input_mouse['movement-y'] = event.movementY;
    input_mouse['x'] = event.pageX;
    input_mouse['y'] = event.pageY;
    input_handle_event({
      'event': event,
      'key': 'mousemove',
      'object': input_mouse['todo'],
      'todo': true,
    });
}

function input_handle_mouseup(event){
    input_mouse['down'] = false;
    input_handle_event({
      'event': event,
      'key': 'mouseup',
      'object': input_mouse['todo'],
      'todo': true,
    });
}

function input_handle_mousewheel(event){
    var delta = Number(
      event.wheelDelta
        || -event.detail
    );
    input_handle_event({
      'event': event,
      'key': 'mousewheel',
      'object': input_mouse['todo'],
      'todo': true,
    });
}

function input_handle_onpointerlockchange(event){
    var pointerlock_element = document.getElementById(input_mouse['pointerlock-id']);
    input_mouse['pointerlock-state'] = document.pointerLockElement === pointerlock_element
      || document.mozPointerLockElement === pointerlock_element;
};

// Optional args: keybinds, mousebinds
function input_init(args){
    args = args || {};
    args['keybinds'] = args['keybinds'] || false;
    args['mousebinds'] = args['mousebinds'] || false;

    if(args['keybinds'] !== false){
        input_keybinds_update({
          'clear': true,
          'keybinds': args['keybinds'],
        });

        window.onkeydown = input_handle_keydown;
        window.onkeyup = input_handle_keyup;
    }

    input_mouse = {
      'down': false,
      'down-x': 0,
      'down-y': 0,
      'movement-x': 0,
      'movement-y': 0,
      'pointerlock-id': 'canvas',
      'pointerlock-state': false,
      'todo': {},
      'x': 0,
      'y': 0,
    };
    if(args['mousebinds'] !== false){
        input_mousebinds_update({
          'clear': true,
          'mousebinds': args['mousebinds'],
        });

        document.onpointerlockchange = input_handle_onpointerlockchange;
        document.onmozpointerlockchange = input_handle_onpointerlockchange;
        window.onmousedown = input_handle_mousedown;
        window.onmousemove = input_handle_mousemove;
        window.onmouseup = input_handle_mouseup;
        window.ontouchend = input_handle_mouseup;
        window.ontouchmove = input_handle_mousemove;
        window.ontouchstart = input_handle_mousedown;

        if('onmousewheel' in window){
            window.onmousewheel = input_handle_mousewheel;

        }else{
            document.addEventListener(
              'DOMMouseScroll',
              input_handle_mousewheel,
              false
            );
        }
    }

    window.ongamepadconnected = input_handle_gamepadconnected;
    window.ongamepaddisconnected = input_handle_gamepaddisconnected;
}

// Required args: keybinds
// Optional args: clear
function input_keybinds_update(args){
    args['clear'] = args['clear'] || false;

    if(args['clear']){
        input_keys = {};
    }

    for(var key in args['keybinds']){
        input_keys[key] = {};
        input_keys[key]['loop'] = args['keybinds'][key]['loop'] || false;
        input_keys[key]['preventDefault'] = args['keybinds'][key]['preventDefault'] || false;
        input_keys[key]['solo'] = args['keybinds'][key]['solo'] || false;
        input_keys[key]['state'] = false;
        input_keys[key]['todo'] = args['keybinds'][key]['todo'] || function(){};
    }
}

function input_keyinfo_get(event){
    var code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
}

// Required args: mousebinds
// Optional args: clear
function input_mousebinds_update(args){
    args['clear'] = args['clear'] || false;

    if(args['clear']){
        input_mouse['todo'] = {};
    }

    for(var mousebind in args['mousebinds']){
        input_mouse['todo'][mousebind] = {};
        input_mouse['todo'][mousebind]['loop'] = args['mousebinds'][mousebind]['loop'] || false;
        input_mouse['todo'][mousebind]['preventDefault'] = args['mousebinds'][mousebind]['preventDefault'] || false;
        input_mouse['todo'][mousebind]['todo'] = args['mousebinds'][mousebind]['todo'] || function(){};
    }
}

// Required args: id
function input_requestpointerlock(args){
    var element = document.getElementById(args['id']);
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock;
    element.requestPointerLock();

    input_mouse['pointerlock-id'] = args['id'];
}

function input_todos_repeat(){
    for(var key in input_keys){
        if(input_keys[key]['loop']
          && input_keys[key]['state']){
            input_keys[key]['todo']();
        }
    }
    for(var mousebind in input_mouse['todo']){
        if(input_mouse['todo'][mousebind]['loop']){
            input_mouse['todo'][mousebind]['todo']();
        }
    }
}

var input_gamepads = {};
var input_keys = {};
var input_mouse = {};
