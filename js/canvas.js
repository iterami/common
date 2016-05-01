'use strict';

function draw(){
    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    draw_logic();

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    window.requestAnimationFrame(draw);
}

function init_canvas(){
    resize();

    if(typeof draw_logic == 'function'){
        window.requestAnimationFrame(draw);
        window.setInterval(
          logic,
          30
        );
    }
}

function resize(){
    height = window.innerHeight;
    document.getElementById('buffer').height = height;
    document.getElementById('canvas').height = height;
    y = height / 2;

    width = window.innerWidth;
    document.getElementById('buffer').width = width;
    document.getElementById('canvas').width = width;
    x = width / 2;

    if(typeof resize_logic == 'function'){
        resize_logic();
    }
}

var buffer = document.getElementById('buffer').getContext('2d', {
  //'alpha': false,
});
var canvas = document.getElementById('canvas').getContext('2d', {
  //'alpha': false,
});
var height = 0;
var width = 0;
var x = 0;
var y = 0;

window.onresize = resize;
