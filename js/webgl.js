'use strict';

function draw(){
    buffer.viewport(
      0,
      0,
      buffer.viewportWidth,
      buffer.viewportHeight
    );
    buffer.clear(buffer.COLOR_BUFFER_BIT | buffer.DEPTH_BUFFER_BIT);

    matrix_identity('camera');

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
}

function drawloop(){
    draw();
    window.requestAnimationFrame(drawloop);
}

function init_webgl(){
    resize();

    if(typeof logic == 'function'){
        window.requestAnimationFrame(drawloop);
        window.setInterval(
          logic,
          30
        );
    }
}

function matrix_clone(id, newid){
}

function matrix_copy(id, newid){
}

function matrix_create(id){
}

function matrix_identity(id){
    for(var key in matricies[id]){
        matricies[id][key] =
          key % (matricies[id]['width'] + 1) === 0
            ? 1
            : 0;
    }
}

function matrix_rotate(id, dimensions){
}

function matrix_translate(id, dimensions){
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

var buffer = document.getElementById('buffer').getContext('webgl');
var canvas = document.getElementById('canvas').getContext('2d');
var height = 0;
var matricies = {};
var width = 0;
var x = 0;
var y = 0;

window.onresize = resize;
