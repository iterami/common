'use strict';

function draw(){
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

function init_webgl(){
    resize();

    window.requestAnimationFrame(draw);
    window.setInterval(
      logic,
      30
    );
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

var buffer = 0;
var canvas = 0;
var height = 0;
var width = 0;
var x = 0;
var y = 0;

window.onresize = resize;
