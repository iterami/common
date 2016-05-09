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
    matrix_rotate(
      'camera',
      {}
    );
    matrix_translate(
      'camera',
      {}
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
}

function drawloop(){
    draw();
    window.requestAnimationFrame(drawloop);
}

function init_webgl(){
    matrix_create('camera');

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
    matrix_create(newid);
    matrix_copy(
      id,
      newid
    );
}

function matrix_copy(id, newid){
    for(var key in matricies[id]){
        matricies[newid][key] = matricies[id][key];
    }
}

function matrix_create(id){
    matricies[id] = new Float32Array(16);
}

function matrix_identity(id){
    for(var key in matricies[id]){
        matricies[id][key] =
          key % 5 === 0
            ? 1
            : 0;
    }
}

function matrix_rotate(id, dimensions){
    // Rotate X.
    matrix_clone(
      id,
      'cache'
    );
    var cosine = Math.cos(dimensions[0]);
    var sine = Math.sin(dimensions[0]);

    matricies[id][4] = matricies['cache'][4] * cosine + matricies['cache'][8] * sine;
    matricies[id][5] = matricies['cache'][5] * cosine + matricies['cache'][9] * sine;
    matricies[id][6] = matricies['cache'][6] * cosine + matricies['cache'][10] * sine;
    matricies[id][7] = matricies['cache'][7] * cosine + matricies['cache'][11] * sine;
    matricies[id][8] = matricies['cache'][8] * cosine - matricies['cache'][4] * sine;
    matricies[id][9] = matricies['cache'][9] * cosine - matricies['cache'][5] * sine;
    matricies[id][10] = matricies['cache'][10] * cosine - matricies['cache'][6] * sine;
    matricies[id][11] = matricies['cache'][11] * cosine - matricies['cache'][7] * sine;

    // Rotate Y.
    matrix_copy(
      id,
      'cache'
    );
    cosine = Math.cos(dimensions[1]);
    sine = Math.sin(dimensions[1]);

    matricies[id][0] = matricies['cache'][0] * cosine - matricies['cache'][8] * sine;
    matricies[id][1] = matricies['cache'][1] * cosine - matricies['cache'][9] * sine;
    matricies[id][2] = matricies['cache'][2] * cosine - matricies['cache'][10] * sine;
    matricies[id][3] = matricies['cache'][3] * cosine - matricies['cache'][11] * sine;
    matricies[id][8] = matricies['cache'][8] * cosine + matricies['cache'][0] * sine;
    matricies[id][9] = matricies['cache'][9] * cosine + matricies['cache'][1] * sine;
    matricies[id][10] = matricies['cache'][10] * cosine + matricies['cache'][2] * sine;
    matricies[id][11] = matricies['cache'][11] * cosine + matricies['cache'][3] * sine;

    // Rotate Z.
    matrix_copy(
      id,
      'cache'
    );
    cosine = Math.cos(dimensions[2]);
    sine = Math.sin(dimensions[2]);

    matricies[id][0] = matricies['cache'][0] * cosine + matricies['cache'][4] * sine;
    matricies[id][1] = matricies['cache'][1] * cosine + matricies['cache'][5] * sine;
    matricies[id][2] = matricies['cache'][2] * cosine + matricies['cache'][6] * sine;
    matricies[id][3] = matricies['cache'][3] * cosine + matricies['cache'][7] * sine;
    matricies[id][4] = matricies['cache'][4] * cosine - matricies['cache'][0] * sine;
    matricies[id][5] = matricies['cache'][5] * cosine - matricies['cache'][1] * sine;
    matricies[id][6] = matricies['cache'][6] * cosine - matricies['cache'][2] * sine;
    matricies[id][7] = matricies['cache'][7] * cosine - matricies['cache'][3] * sine;
}

function matrix_translate(id, dimensions){
    matricies[id][12] -= matricies[id][0] * args['dimensions'][0]
      + matricies[id][4] * args['dimensions'][1]
      + matricies[id][8] * args['dimensions'][2];
    matricies[id][13] -= matricies[id][1] * args['dimensions'][0]
      + matricies[id][5] * args['dimensions'][1]
      + matricies[id][9] * args['dimensions'][2];
    matricies[id][14] -= matricies[id][2] * args['dimensions'][0]
      + matricies[id][6] * args['dimensions'][1]
      + matricies[id][10] * args['dimensions'][2];
    args['matrix']['value'][15] -= matricies[id][3] * args['dimensions'][0]
      + matricies[id][7] * args['dimensions'][1]
      + matricies[id][11] * args['dimensions'][2];
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
