'use strict';

function get_keycode(event){
    var code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
}

function handle_keydown(event){
    var key = get_keycode(event);

    if(keys.hasOwnProperty(key)){
        keys[key]['state'] = true;
    }
}

function handle_keyup(event){
    var key = get_keycode(event);

    if(keys.hasOwnProperty(key)){
        keys[key]['state'] = false;
    }
}

function handle_mousedown(event){
    mouse['down'] = true;
    mouse['down-x'] = mouse['x'];
    mouse['down-y'] = mouse['y'];
}

function handle_mousemove(event){
    mouse['x'] = event.pageX;
    mouse['y'] = event.pageY;
}

function handle_mouseup(event){
    mouse['down'] = false;
}

function handle_mousewheel(event){
    var delta = Number(
      event.wheelDelta
        || -event.detail
    );
}

function init_input(keybinds, mousebinds){
    keys = {};
    for(var key in keybinds){
        keys[key] = {};
        keys[key]['loop'] = keybinds[key]['loop'] || false;
        keys[key]['state'] = false;
        keys[key]['todo'] = keybinds[key]['todo'];
    }

    mouse = {
      'down': false,
      'down-x': 0,
      'down-y': 0,
      'todo': {},
      'x': 0,
      'y': 0,
    };
    for(var mousebind in mousebinds){
        mouse['todo'][key]['loop'] = mousebinds[mousebind]['loop'] || false;
        mouse['todo'][key]['todo'] = mousebinds[mousebind]['todo'];
    }

    if('onmousewheel' in window){
        window.onmousewheel = handle_mousewheel;

    }else{
        document.addEventListener(
          'DOMMouseScroll',
          handle_mousewheel
          false
        );
    }
}

function repeat_input_todos(){
    for(var key in keys){
        if(keys[key]['loop']){
            keys[key]['todo']();
        }
    }
    for(var mousebind in mouse['todo']){
        if(mouse['todo'][mousebind]['loop']){
            mouse['todo'][mousebind]['todo']();
        }
    }
}

var keys = {};
var mouse = {};

window.onkeydown = handle_keydown;
window.onkeyup = handle_keyup;
window.onmousedown = handle_mousedown;
window.onmousemove = handle_mousemove;
window.onmouseup = handle_mouseup;
window.ontouchend = handle_mouseup;
window.ontouchmove = handle_mousemove;
window.ontouchstart = handle_mousedown;
