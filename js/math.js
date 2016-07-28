'use strict';

function math_clamp(value, min, max, wrap){
    if(wrap || false){
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
      degrees * math_degree,
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
    math_matrices[newid] = math_matrix_create();
    math_matrix_copy(
      id,
      newid
    );
}

function math_matrix_copy(id, newid){
    for(var key in math_matrices[id]){
        math_matrices[newid][key] = math_matrices[id][key];
    }
}

function math_matrix_create(){
    return new Float32Array(16);
}

function math_matrix_identity(id){
    for(var key in math_matrices[id]){
        math_matrices[id][key] =
          key % 5 === 0
            ? 1
            : 0;
    }
}

function math_matrix_perspective(){
    math_matrices['perspective'] = math_matrix_create();

    math_matrices['perspective'][0] = .5;
    math_matrices['perspective'][5] = 1;
    math_matrices['perspective'][10] = -1;
    math_matrices['perspective'][11] = -1;
    math_matrices['perspective'][14] = -2;
}

function math_matrix_rotate(id, dimensions){
    // Rotate X.
    math_matrix_clone(
      id,
      'rotate-cache'
    );
    var cosine = Math.cos(dimensions[0]);
    var sine = Math.sin(dimensions[0]);

    math_matrices[id][4] = math_matrices['rotate-cache'][4] * cosine + math_matrices['rotate-cache'][8] * sine;
    math_matrices[id][5] = math_matrices['rotate-cache'][5] * cosine + math_matrices['rotate-cache'][9] * sine;
    math_matrices[id][6] = math_matrices['rotate-cache'][6] * cosine + math_matrices['rotate-cache'][10] * sine;
    math_matrices[id][7] = math_matrices['rotate-cache'][7] * cosine + math_matrices['rotate-cache'][11] * sine;
    math_matrices[id][8] = math_matrices['rotate-cache'][8] * cosine - math_matrices['rotate-cache'][4] * sine;
    math_matrices[id][9] = math_matrices['rotate-cache'][9] * cosine - math_matrices['rotate-cache'][5] * sine;
    math_matrices[id][10] = math_matrices['rotate-cache'][10] * cosine - math_matrices['rotate-cache'][6] * sine;
    math_matrices[id][11] = math_matrices['rotate-cache'][11] * cosine - math_matrices['rotate-cache'][7] * sine;

    // Rotate Y.
    math_matrix_copy(
      id,
      'rotate-cache'
    );
    cosine = Math.cos(dimensions[1]);
    sine = Math.sin(dimensions[1]);

    math_matrices[id][0] = math_matrices['rotate-cache'][0] * cosine - math_matrices['rotate-cache'][8] * sine;
    math_matrices[id][1] = math_matrices['rotate-cache'][1] * cosine - math_matrices['rotate-cache'][9] * sine;
    math_matrices[id][2] = math_matrices['rotate-cache'][2] * cosine - math_matrices['rotate-cache'][10] * sine;
    math_matrices[id][3] = math_matrices['rotate-cache'][3] * cosine - math_matrices['rotate-cache'][11] * sine;
    math_matrices[id][8] = math_matrices['rotate-cache'][8] * cosine + math_matrices['rotate-cache'][0] * sine;
    math_matrices[id][9] = math_matrices['rotate-cache'][9] * cosine + math_matrices['rotate-cache'][1] * sine;
    math_matrices[id][10] = math_matrices['rotate-cache'][10] * cosine + math_matrices['rotate-cache'][2] * sine;
    math_matrices[id][11] = math_matrices['rotate-cache'][11] * cosine + math_matrices['rotate-cache'][3] * sine;

    // Rotate Z.
    math_matrix_copy(
      id,
      'rotate-cache'
    );
    cosine = Math.cos(dimensions[2]);
    sine = Math.sin(dimensions[2]);

    math_matrices[id][0] = math_matrices['rotate-cache'][0] * cosine + math_matrices['rotate-cache'][4] * sine;
    math_matrices[id][1] = math_matrices['rotate-cache'][1] * cosine + math_matrices['rotate-cache'][5] * sine;
    math_matrices[id][2] = math_matrices['rotate-cache'][2] * cosine + math_matrices['rotate-cache'][6] * sine;
    math_matrices[id][3] = math_matrices['rotate-cache'][3] * cosine + math_matrices['rotate-cache'][7] * sine;
    math_matrices[id][4] = math_matrices['rotate-cache'][4] * cosine - math_matrices['rotate-cache'][0] * sine;
    math_matrices[id][5] = math_matrices['rotate-cache'][5] * cosine - math_matrices['rotate-cache'][1] * sine;
    math_matrices[id][6] = math_matrices['rotate-cache'][6] * cosine - math_matrices['rotate-cache'][2] * sine;
    math_matrices[id][7] = math_matrices['rotate-cache'][7] * cosine - math_matrices['rotate-cache'][3] * sine;
}

function math_matrix_round(id, decimals){
    for(var key in math_matrices[id]){
        math_matrices[id][key] = math_round(
          math_matrices[id][key],
          decimals
        );
    }
}

function math_matrix_translate(id, dimensions){
    for(var i = 0; i < 4; i++){
        math_matrices[id][i + 12] -= math_matrices[id][i] * dimensions[0]
          + math_matrices[id][i + 4] * dimensions[1]
          + math_matrices[id][i + 8] * dimensions[2];
    }

    math_matrix_round(id);
}

function math_move_3d(speed, angle, strafe){
    var radians = -math_degrees_to_radians(
      angle
      - ((strafe || false)
        ? 90
        : 0
      )
    );
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
      angle,
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

var math_degree = Math.PI / 180;
var math_matrices = {};
var math_tau = Math.PI * 2;
