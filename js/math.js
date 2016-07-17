'use strict';

function math_clamp(value, min, max, wrap){
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

function math_degrees_to_radians(degrees, decimals){
    return math_round(
      degrees * degree,
      decimals
    );
}

function math_distance(x0, y0, x1, y1){
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}

function math_fixed_length_line(x0, y0, x1, y1, length){
    var line_distance = math_distance(
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

function math_matrix_clone(id, newid){
    matrices[newid] = math_matrix_create();
    math_matrix_copy(
      id,
      newid
    );
}

function math_matrix_copy(id, newid){
    for(var key in matrices[id]){
        matrices[newid][key] = matrices[id][key];
    }
}

function math_matrix_create(){
    return new Float32Array(16);
}

function math_matrix_identity(id){
    for(var key in matrices[id]){
        matrices[id][key] =
          key % 5 === 0
            ? 1
            : 0;
    }
}

function math_matrix_perspective(){
    matrices['perspective'] = math_matrix_create();

    matrices['perspective'][0] = .5;
    matrices['perspective'][5] = 1;
    matrices['perspective'][10] = -1;
    matrices['perspective'][11] = -1;
    matrices['perspective'][14] = -2;
}

function math_matrix_rotate(id, dimensions){
    // Rotate X.
    math_matrix_clone(
      id,
      'rotate-cache'
    );
    var cosine = Math.cos(dimensions[0]);
    var sine = Math.sin(dimensions[0]);

    matrices[id][4] = matrices['rotate-cache'][4] * cosine + matrices['rotate-cache'][8] * sine;
    matrices[id][5] = matrices['rotate-cache'][5] * cosine + matrices['rotate-cache'][9] * sine;
    matrices[id][6] = matrices['rotate-cache'][6] * cosine + matrices['rotate-cache'][10] * sine;
    matrices[id][7] = matrices['rotate-cache'][7] * cosine + matrices['rotate-cache'][11] * sine;
    matrices[id][8] = matrices['rotate-cache'][8] * cosine - matrices['rotate-cache'][4] * sine;
    matrices[id][9] = matrices['rotate-cache'][9] * cosine - matrices['rotate-cache'][5] * sine;
    matrices[id][10] = matrices['rotate-cache'][10] * cosine - matrices['rotate-cache'][6] * sine;
    matrices[id][11] = matrices['rotate-cache'][11] * cosine - matrices['rotate-cache'][7] * sine;

    // Rotate Y.
    math_matrix_copy(
      id,
      'rotate-cache'
    );
    cosine = Math.cos(dimensions[1]);
    sine = Math.sin(dimensions[1]);

    matrices[id][0] = matrices['rotate-cache'][0] * cosine - matrices['rotate-cache'][8] * sine;
    matrices[id][1] = matrices['rotate-cache'][1] * cosine - matrices['rotate-cache'][9] * sine;
    matrices[id][2] = matrices['rotate-cache'][2] * cosine - matrices['rotate-cache'][10] * sine;
    matrices[id][3] = matrices['rotate-cache'][3] * cosine - matrices['rotate-cache'][11] * sine;
    matrices[id][8] = matrices['rotate-cache'][8] * cosine + matrices['rotate-cache'][0] * sine;
    matrices[id][9] = matrices['rotate-cache'][9] * cosine + matrices['rotate-cache'][1] * sine;
    matrices[id][10] = matrices['rotate-cache'][10] * cosine + matrices['rotate-cache'][2] * sine;
    matrices[id][11] = matrices['rotate-cache'][11] * cosine + matrices['rotate-cache'][3] * sine;

    // Rotate Z.
    math_matrix_copy(
      id,
      'rotate-cache'
    );
    cosine = Math.cos(dimensions[2]);
    sine = Math.sin(dimensions[2]);

    matrices[id][0] = matrices['rotate-cache'][0] * cosine + matrices['rotate-cache'][4] * sine;
    matrices[id][1] = matrices['rotate-cache'][1] * cosine + matrices['rotate-cache'][5] * sine;
    matrices[id][2] = matrices['rotate-cache'][2] * cosine + matrices['rotate-cache'][6] * sine;
    matrices[id][3] = matrices['rotate-cache'][3] * cosine + matrices['rotate-cache'][7] * sine;
    matrices[id][4] = matrices['rotate-cache'][4] * cosine - matrices['rotate-cache'][0] * sine;
    matrices[id][5] = matrices['rotate-cache'][5] * cosine - matrices['rotate-cache'][1] * sine;
    matrices[id][6] = matrices['rotate-cache'][6] * cosine - matrices['rotate-cache'][2] * sine;
    matrices[id][7] = matrices['rotate-cache'][7] * cosine - matrices['rotate-cache'][3] * sine;
}

function math_matrix_round(id, decimals){
    for(var key in matrices[id]){
        matrices[id][key] = math_round(
          matrices[id][key],
          decimals
        );
    }
}

function math_matrix_translate(id, dimensions){
    for(var i = 0; i < 4; i++){
        matrices[id][i + 12] -= matrices[id][i] * dimensions[0]
          + matrices[id][i + 4] * dimensions[1]
          + matrices[id][i + 8] * dimensions[2];
    }

    math_matrix_round(id);
}

function math_move_3d(speed, angle, strafe){
    strafe = strafe || false;
    var radians = -math_degrees_to_radians(angle - (strafe ? 90 : 0));
    return {
      'x': math_round(speed * Math.sin(radians), 7),
      'z': math_round(speed * Math.cos(radians), 7),
    };
}

function math_movement_speed(x0, y0, x1, y1){
    var angle = Math.atan(Math.abs(y0 - y1) / Math.abs(x0 - x1));
    return [
      Math.cos(angle),
      Math.sin(angle),
    ];
}

function math_round(number, decimals){
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
var matrices = {};
var tau = Math.PI * 2;
