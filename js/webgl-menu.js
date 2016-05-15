'use strict';

function degrees_to_radians(degrees, decimals){
    return round(
      degrees * degree,
      decimals
    );
}

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
      [
        degrees_to_radians(camera['rotate-x']),
        degrees_to_radians(camera['rotate-y']),
        degrees_to_radians(camera['rotate-z']),
      ]
    );
    matrix_translate(
      'camera',
      [
        camera['x'],
        camera['y'],
        camera['z'],
      ]
    );

    draw_logic();

    for(var entity in entities){
    }

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
    animationFrame = window.requestAnimationFrame(drawloop);
}

function init_webgl(){
    resize();
    setmode(0);
}

function matrix_camera(){
    matricies['perspective'] = matrix_create();

    matricies['perspective'][0] = .5;
    matricies['perspective'][5] = 1;
    matricies['perspective'][10] = -1;
    matricies['perspective'][11] = -1;
    matricies['perspective'][14] = -2;
}

function matrix_clone(id, newid){
    matricies[newid] = matrix_create();
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

function matrix_create(){
    return new Float32Array(16);
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

function matrix_round(id, decimals){
    for(var key in matricies[id]){
        matricies[id][key] = round(
          matricies[id][key],
          decimals
        );
    }
}

function matrix_translate(id, dimensions){
    matricies[id][12] -= matricies[id][0] * dimensions[0]
      + matricies[id][4] * dimensions[1]
      + matricies[id][8] * dimensions[2];
    matricies[id][13] -= matricies[id][1] * dimensions[0]
      + matricies[id][5] * dimensions[1]
      + matricies[id][9] * dimensions[2];
    matricies[id][14] -= matricies[id][2] * dimensions[0]
      + matricies[id][6] * dimensions[1]
      + matricies[id][10] * dimensions[2];
   matricies[id][15] -= matricies[id][3] * dimensions[0]
      + matricies[id][7] * dimensions[1]
      + matricies[id][11] * dimensions[2];

    matrix_round(id);
}

function resize(){
    if(mode <= 0){
        return;
    }

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

function setmode(newmode, newgame){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    camera = {};
    mode = newmode;
    newgame = newgame || false;

    setmode_logic(newgame);

    if(mode === 0){
        // Main menu mode.
        buffer = 0;
        canvas = 0;

    }else{
        if(newgame){
            document.body.innerHTML =
              '<canvas id=canvas></canvas><canvas id=buffer></canvas>';

            buffer = document.getElementById('buffer').getContext('webgl');
            canvas = document.getElementById('canvas').getContext('2d');

            resize();
        }

        camera = {
          'rotate-x': 0,
          'rotate-y': 0,
          'rotate-z': 0,
          'x': 0,
          'y': 0,
          'z': 0,
        };
        matrix_create('camera');

        if(typeof load_level == 'function'){
            load_level(mode);
        }

        if(typeof draw_logic == 'function'){
            animationFrame = window.requestAnimationFrame(drawloop);
        }

        if(typeof logic == 'function'){
            interval = window.setInterval(
              logic,
              settings['ms-per-frame']
            );
        }
    }

}

function round(number, decimals){
    decimals = decimals || 7;

    return Number(
      Number.parseFloat(number + 'e+' + decimals)
        + 'e-' + decimals
    );
}

var animationFrame = 0;
var buffer = 0;
var camera = {};
var canvas = 0;
var degree = Math.PI / 180;
var entities = {};
var height = 0;
var interval = 0;
var matricies = {};
var mode = 0;
var width = 0;
var x = 0;
var y = 0;

window.onresize = resize;
