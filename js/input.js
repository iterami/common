'use strict';

function get_keycode(event){
    var code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
}

function onmousewheel(){
}

function init_input(){
    if('onmousewheel' in window){
        window.onmousewheel = onmousewheel;

    }else{
        document.addEventListener(
          'DOMMouseScroll',
          onmousewheel
          false
        );
    }
}

window.onkeydown = function(e){
    var key = get_keycode(e);
};

window.onkeyup = function(e){
    var key = get_keycode(e);
};

window.onmousedown = function(e){
};

window.onmousemove = function(e){
};

window.onmouseup = function(e){
};

window.ontouchend = function(e){
};

window.ontouchmove = function(e){
}

window.ontouchstart = function(e){
};
