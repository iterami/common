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
}

function handle_keyup(event){
    var key = get_keycode(event);
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

function init_input(){
    keys = {};
    mouse = {
      'down': false,
      'down-x': 0,
      'down-y': 0,
      'x': 0,
      'y': 0,
    };

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
