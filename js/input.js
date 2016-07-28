'use strict';

function input_handle_event(event, object, key, todo, state){
    if(object.hasOwnProperty(key)){
        if(object[key]['preventDefault']){
            event.preventDefault();
        }

        if(todo !== void 0
          && !object[key]['loop']){
            object[key]['todo']();
        }

        if(state !== void 0){
            object[key]['state'] = state;
        }

        return object[key]['solo'];
    }

    return false;
}

function input_handle_keydown(event){
    var key = input_keyinfo_get(event);

    var solo = input_handle_event(
      event,
      input_keys,
      key['code'],
      true,
      true
    );
    if(solo){
        return;
    }

    input_handle_event(
      event,
      input_keys,
      'all',
      true,
      true
    );
}

function input_handle_keyup(event){
    var key = input_keyinfo_get(event);

    var solo = input_handle_event(
      event,
      input_keys,
      key['code'],
      void 0,
      false
    );
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
    input_handle_event(
      event,
      input_mouse['todo'],
      'mousedown',
      true
    );
}

function input_handle_mousemove(event){
    input_mouse['movement-x'] = event.movementX;
    input_mouse['movement-y'] = event.movementY;
    input_mouse['x'] = event.pageX;
    input_mouse['y'] = event.pageY;
    input_handle_event(
      event,
      input_mouse['todo'],
      'mousemove',
      true
    );
}

function input_handle_mouseup(event){
    input_mouse['down'] = false;
    input_handle_event(
      event,
      input_mouse['todo'],
      'mouseup',
      true
    );
}

function input_handle_mousewheel(event){
    var delta = Number(
      event.wheelDelta
        || -event.detail
    );
    input_handle_event(
      event,
      input_mouse['todo'],
      'mousewheel',
      true
    );
}

function input_handle_onpointerlockchange(event){
    input_mouse['pointerlock-state'] = document.pointerLockElement === document.getElementById(input_mouse['pointerlock-id']);
};

function input_init(keybinds, mousebinds){
    keybinds = keybinds || false;
    if(keybinds !== false){
        input_keybinds_update(
          keybinds,
          true
        );

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
    mousebinds = mousebinds || false;
    if(mousebinds !== false){
        input_mousebinds_update(
          mousebinds,
          true
        );

        document.onpointerlockchange = input_handle_onpointerlockchange;
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
}

function input_keybinds_update(keybinds, clear){
    if(clear || false){
        input_keys = {};
    }

    for(var key in keybinds){
        input_keys[key] = {};
        input_keys[key]['loop'] = keybinds[key]['loop'] || false;
        input_keys[key]['preventDefault'] = keybinds[key]['preventDefault'] || false;
        input_keys[key]['solo'] = keybinds[key]['solo'] || false;
        input_keys[key]['state'] = false;
        input_keys[key]['todo'] = keybinds[key]['todo'] || function(){};
    }
}

function input_keyinfo_get(event){
    var code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
}

function input_mousebinds_update(mousebinds, clear){
    if(clear || false){
        input_mouse['todo'] = {};
    }

    for(var mousebind in mousebinds){
        input_mouse['todo'][mousebind] = {};
        input_mouse['todo'][mousebind]['loop'] = mousebinds[mousebind]['loop'] || false;
        input_mouse['todo'][mousebind]['preventDefault'] = mousebinds[mousebind]['preventDefault'] || false;
        input_mouse['todo'][mousebind]['todo'] = mousebinds[mousebind]['todo'] || function(){};
    }
}

function input_requestpointerlock(id){
    document.getElementById(id).requestPointerLock();

    input_mouse['pointerlock-id'] = id;
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

var input_keys = {};
var input_mouse = {};
