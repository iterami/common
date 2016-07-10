'use strict';

function clamp(value, min, max, wrap){
    wrap = wrap || false;

    if(wrap){
        var diff = max - min;
        while(value < min){
            value += diff;
        }
        while(value >= max){
            value -= diff;
        }

    }else{
        value = Math.max(
          value,
          min
        );
        value = Math.min(
          value,
          max
        );
    }

    return value;
}

function degrees_to_radians(degrees, decimals){
    return round(
      degrees * degree,
      decimals
    );
}

function distance(x0, y0, x1, y1){
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}

function fixed_length_line(x0, y0, x1, y1, length){
    var line_distance = distance(
      x0, y0, x1, y1
    );

    x1 /= line_distance;
    x1 *= length;
    y1 /= line_distance;
    y1 *= length;

    return {
      'x': x1,
      'y': y1,
    };
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

function matrix_perspective(){
    matricies['perspective'] = matrix_create();

    matricies['perspective'][0] = .5;
    matricies['perspective'][5] = 1;
    matricies['perspective'][10] = -1;
    matricies['perspective'][11] = -1;
    matricies['perspective'][14] = -2;
}

function matrix_rotate(id, dimensions){
    // Rotate X.
    matrix_clone(
      id,
      'rotate-cache'
    );
    var cosine = Math.cos(dimensions[0]);
    var sine = Math.sin(dimensions[0]);

    matricies[id][4] = matricies['rotate-cache'][4] * cosine + matricies['rotate-cache'][8] * sine;
    matricies[id][5] = matricies['rotate-cache'][5] * cosine + matricies['rotate-cache'][9] * sine;
    matricies[id][6] = matricies['rotate-cache'][6] * cosine + matricies['rotate-cache'][10] * sine;
    matricies[id][7] = matricies['rotate-cache'][7] * cosine + matricies['rotate-cache'][11] * sine;
    matricies[id][8] = matricies['rotate-cache'][8] * cosine - matricies['rotate-cache'][4] * sine;
    matricies[id][9] = matricies['rotate-cache'][9] * cosine - matricies['rotate-cache'][5] * sine;
    matricies[id][10] = matricies['rotate-cache'][10] * cosine - matricies['rotate-cache'][6] * sine;
    matricies[id][11] = matricies['rotate-cache'][11] * cosine - matricies['rotate-cache'][7] * sine;

    // Rotate Y.
    matrix_copy(
      id,
      'rotate-cache'
    );
    cosine = Math.cos(dimensions[1]);
    sine = Math.sin(dimensions[1]);

    matricies[id][0] = matricies['rotate-cache'][0] * cosine - matricies['rotate-cache'][8] * sine;
    matricies[id][1] = matricies['rotate-cache'][1] * cosine - matricies['rotate-cache'][9] * sine;
    matricies[id][2] = matricies['rotate-cache'][2] * cosine - matricies['rotate-cache'][10] * sine;
    matricies[id][3] = matricies['rotate-cache'][3] * cosine - matricies['rotate-cache'][11] * sine;
    matricies[id][8] = matricies['rotate-cache'][8] * cosine + matricies['rotate-cache'][0] * sine;
    matricies[id][9] = matricies['rotate-cache'][9] * cosine + matricies['rotate-cache'][1] * sine;
    matricies[id][10] = matricies['rotate-cache'][10] * cosine + matricies['rotate-cache'][2] * sine;
    matricies[id][11] = matricies['rotate-cache'][11] * cosine + matricies['rotate-cache'][3] * sine;

    // Rotate Z.
    matrix_copy(
      id,
      'rotate-cache'
    );
    cosine = Math.cos(dimensions[2]);
    sine = Math.sin(dimensions[2]);

    matricies[id][0] = matricies['rotate-cache'][0] * cosine + matricies['rotate-cache'][4] * sine;
    matricies[id][1] = matricies['rotate-cache'][1] * cosine + matricies['rotate-cache'][5] * sine;
    matricies[id][2] = matricies['rotate-cache'][2] * cosine + matricies['rotate-cache'][6] * sine;
    matricies[id][3] = matricies['rotate-cache'][3] * cosine + matricies['rotate-cache'][7] * sine;
    matricies[id][4] = matricies['rotate-cache'][4] * cosine - matricies['rotate-cache'][0] * sine;
    matricies[id][5] = matricies['rotate-cache'][5] * cosine - matricies['rotate-cache'][1] * sine;
    matricies[id][6] = matricies['rotate-cache'][6] * cosine - matricies['rotate-cache'][2] * sine;
    matricies[id][7] = matricies['rotate-cache'][7] * cosine - matricies['rotate-cache'][3] * sine;
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

function move_3d(speed, angle, strafe){
    strafe = strafe || false;
    var radians = -degrees_to_radians(angle - (strafe ? 90 : 0));
    return {
      'x': round(speed * Math.sin(radians), 7),
      'z': round(speed * Math.cos(radians), 7),
    };
}

function movement_speed(x0, y0, x1, y1){
    var angle = Math.atan(Math.abs(y0 - y1) / Math.abs(x0 - x1));
    return [
      Math.cos(angle),
      Math.sin(angle),
    ];
}

function random_integer(max){
    return Math.floor(Math.random() * max);
}

function round(number, decimals){
    decimals = decimals || 7;

    if(String(number).indexOf('e') >= 0){
        number = Number(number.toFixed(decimals));
    }

    return Number(
      Math.round(number + 'e+' + decimals)
        + 'e-' + decimals
    );
}

var degree = Math.PI / 180;
var matricies = {};
var tau = Math.PI * 2;
