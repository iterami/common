'use strict';

function get_keycode(event){
    var code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
}

function handle_event(event, object, key, todo, state){
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

function handle_keydown(event){
    var key = get_keycode(event);

    var solo = handle_event(
      event,
      keys,
      key['code'],
      true,
      true
    );
    if(solo){
        return;
    }

    handle_event(
      event,
      keys,
      'all',
      true,
      true
    );
}

function handle_keyup(event){
    var key = get_keycode(event);

    var solo = handle_event(
      event,
      keys,
      key['code'],
      void 0,
      false
    );
    if(solo){
        return;
    }

    if(keys.hasOwnProperty('all')){
        var all = false;
        for(var key in keys){
            if(key !== 'all'
              && keys[key]['state']){
                all = true;
                break;
            }
        }
        keys['all']['state'] = all;
    }
}

function handle_mousedown(event){
    mouse['down'] = true;
    mouse['down-x'] = mouse['x'];
    mouse['down-y'] = mouse['y'];
    handle_event(
      event,
      mouse['todo'],
      'mousedown',
      true
    );
}

function handle_mousemove(event){
    mouse['movement-x'] = event.movementX;
    mouse['movement-y'] = event.movementY;
    mouse['x'] = event.pageX;
    mouse['y'] = event.pageY;
    handle_event(
      event,
      mouse['todo'],
      'mousemove',
      true
    );
}

function handle_mouseup(event){
    mouse['down'] = false;
    handle_event(
      event,
      mouse['todo'],
      'mouseup',
      true
    );
}

function handle_mousewheel(event){
    var delta = Number(
      event.wheelDelta
        || -event.detail
    );
    handle_event(
      event,
      mouse['todo'],
      'mousewheel',
      true
    );
}

function init_input(keybinds, mousebinds){
    keybinds = keybinds || false;
    if(keybinds !== false){
        update_keybinds(
          keybinds,
          true
        );

        window.onkeydown = handle_keydown;
        window.onkeyup = handle_keyup;
    }

    mouse = {
      'down': false,
      'down-x': 0,
      'down-y': 0,
      'movement-x': 0,
      'movement-y': 0,
      'todo': {},
      'x': 0,
      'y': 0,
    };
    mousebinds = mousebinds || false;
    if(mousebinds !== false){
        update_mousebinds(
          mousebinds,
          true
        );

        window.onmousedown = handle_mousedown;
        window.onmousemove = handle_mousemove;
        window.onmouseup = handle_mouseup;
        window.ontouchend = handle_mouseup;
        window.ontouchmove = handle_mousemove;
        window.ontouchstart = handle_mousedown;

        if('onmousewheel' in window){
            window.onmousewheel = handle_mousewheel;

        }else{
            document.addEventListener(
              'DOMMouseScroll',
              handle_mousewheel,
              false
            );
        }
    }
}

function repeat_input_todos(){
    for(var key in keys){
        if(keys[key]['loop']
          && keys[key]['state']){
            keys[key]['todo']();
        }
    }
    for(var mousebind in mouse['todo']){
        if(mouse['todo'][mousebind]['loop']){
            mouse['todo'][mousebind]['todo']();
        }
    }
}

function requestpointerlock(id){
    document.getElementById(id).requestPointerLock();
}

function update_keybinds(keybinds, clear){
    clear = clear || false;
    if(clear){
        keys = {};
    }

    for(var key in keybinds){
        keys[key] = {};
        keys[key]['loop'] = keybinds[key]['loop'] || false;
        keys[key]['preventDefault'] = keybinds[key]['preventDefault'] || false;
        keys[key]['solo'] = keybinds[key]['solo'] || false;
        keys[key]['state'] = false;
        keys[key]['todo'] = keybinds[key]['todo'] || function(){};
    }
}

function update_mousebinds(mousebinds, clear){
    clear = clear || false;
    if(clear){
        mouse['todo'] = {};
    }

    for(var mousebind in mousebinds){
        mouse['todo'][mousebind] = {};
        mouse['todo'][mousebind]['loop'] = mousebinds[mousebind]['loop'] || false;
        mouse['todo'][mousebind]['preventDefault'] = mousebinds[mousebind]['preventDefault'] || false;
        mouse['todo'][mousebind]['todo'] = mousebinds[mousebind]['todo'] || function(){};
    }
}

var keys = {};
var mouse = {};
