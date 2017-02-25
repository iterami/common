'use strict';

// Required args: max, min, value
// Optional args: decimals, wrap
function math_clamp(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;
    args['wrap'] = args['wrap'] || false;

    if(args['wrap']){
        var diff = args['max'] - args['min'];
        while(args['value'] < args['min']){
            args['value'] += diff;
        }
        while(args['value'] >= args['max']){
            args['value'] -= diff;
        }

    }else{
        args['value'] = Math.max(
          args['value'],
          args['min']
        );
        args['value'] = Math.min(
          args['value'],
          args['max']
        );
    }

    return args['value'];
}

// Required args: degrees
// Optional args: decimals
function math_degrees_to_radians(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;

    return math_round({
      'decimals': args['decimals'],
      'number': args['degrees'] * math_degree,
    });
}

// Required args: x0, x1, y0, y1
// Optional args: decimals
function math_distance(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;

    return math_round({
      'decimals': args['decimals'],
      'number': Math.sqrt(
        Math.pow(
          args['x0'] - args['x1'],
          2
        ) + Math.pow(
          args['y0'] - args['y1'],
          2
        )
      ),
    });
}

// Required args: length, x0, x1, y0, y1
// Optional args: decimals
function math_fixed_length_line(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;

    var line_distance = math_distance({
      'x0': args['x0'],
      'x1': args['x1'],
      'y0': args['y0'],
      'y1': args['y1'],
    });

    args['x1'] /= line_distance;
    args['x1'] *= args['length'];
    args['y1'] /= line_distance;
    args['y1'] *= args['length'];

    return {
      'x': math_round({
        'decimals': args['decimals'],
        'number': args['x1'],
      }),
      'y': math_round({
        'decimals': args['decimals'],
        'number': args['y1'],
      }),
    };
}

// Required args: id, newid
function math_matrix_clone(args){
    math_matrices[args['newid']] = math_matrix_create();
    math_matrix_copy({
      'id': args['id'],
      'newid': args['newid'],
    });
}

// Required args: id, newid
function math_matrix_copy(args){
    for(var key in math_matrices[args['id']]){
        math_matrices[args['newid']][key] = math_matrices[args['id']][key];
    }
}

function math_matrix_create(){
    return new Float32Array(16);
}

// Required args: ids
function math_matrix_delete(args){
    for(var id in args['ids']){
        delete math_matrices[args['ids'][id]];
    }
}

// Required args: id
function math_matrix_identity(args){
    for(var key in math_matrices[args['id']]){
        math_matrices[args['id']][key] =
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

// Required args: dimensions, id
function math_matrix_rotate(args){
    var cache_id = 'rotate-cache-' + args['id'];

    // Rotate X.
    math_matrix_clone({
      'id': args['id'],
      'newid': cache_id,
    });
    var cosine = Math.cos(args['dimensions'][0]);
    var sine = Math.sin(args['dimensions'][0]);

    math_matrices[args['id']][4] = math_matrices[cache_id][4] * cosine + math_matrices[cache_id][8] * sine;
    math_matrices[args['id']][5] = math_matrices[cache_id][5] * cosine + math_matrices[cache_id][9] * sine;
    math_matrices[args['id']][6] = math_matrices[cache_id][6] * cosine + math_matrices[cache_id][10] * sine;
    math_matrices[args['id']][7] = math_matrices[cache_id][7] * cosine + math_matrices[cache_id][11] * sine;
    math_matrices[args['id']][8] = math_matrices[cache_id][8] * cosine - math_matrices[cache_id][4] * sine;
    math_matrices[args['id']][9] = math_matrices[cache_id][9] * cosine - math_matrices[cache_id][5] * sine;
    math_matrices[args['id']][10] = math_matrices[cache_id][10] * cosine - math_matrices[cache_id][6] * sine;
    math_matrices[args['id']][11] = math_matrices[cache_id][11] * cosine - math_matrices[cache_id][7] * sine;

    // Rotate Y.
    math_matrix_copy({
      'id': args['id'],
      'newid': cache_id,
    });
    cosine = Math.cos(args['dimensions'][1]);
    sine = Math.sin(args['dimensions'][1]);

    math_matrices[args['id']][0] = math_matrices[cache_id][0] * cosine - math_matrices[cache_id][8] * sine;
    math_matrices[args['id']][1] = math_matrices[cache_id][1] * cosine - math_matrices[cache_id][9] * sine;
    math_matrices[args['id']][2] = math_matrices[cache_id][2] * cosine - math_matrices[cache_id][10] * sine;
    math_matrices[args['id']][3] = math_matrices[cache_id][3] * cosine - math_matrices[cache_id][11] * sine;
    math_matrices[args['id']][8] = math_matrices[cache_id][8] * cosine + math_matrices[cache_id][0] * sine;
    math_matrices[args['id']][9] = math_matrices[cache_id][9] * cosine + math_matrices[cache_id][1] * sine;
    math_matrices[args['id']][10] = math_matrices[cache_id][10] * cosine + math_matrices[cache_id][2] * sine;
    math_matrices[args['id']][11] = math_matrices[cache_id][11] * cosine + math_matrices[cache_id][3] * sine;

    // Rotate Z.
    math_matrix_copy({
      'id': args['id'],
      'newid': cache_id,
    });
    cosine = Math.cos(args['dimensions'][2]);
    sine = Math.sin(args['dimensions'][2]);

    math_matrices[args['id']][0] = math_matrices[cache_id][0] * cosine + math_matrices[cache_id][4] * sine;
    math_matrices[args['id']][1] = math_matrices[cache_id][1] * cosine + math_matrices[cache_id][5] * sine;
    math_matrices[args['id']][2] = math_matrices[cache_id][2] * cosine + math_matrices[cache_id][6] * sine;
    math_matrices[args['id']][3] = math_matrices[cache_id][3] * cosine + math_matrices[cache_id][7] * sine;
    math_matrices[args['id']][4] = math_matrices[cache_id][4] * cosine - math_matrices[cache_id][0] * sine;
    math_matrices[args['id']][5] = math_matrices[cache_id][5] * cosine - math_matrices[cache_id][1] * sine;
    math_matrices[args['id']][6] = math_matrices[cache_id][6] * cosine - math_matrices[cache_id][2] * sine;
    math_matrices[args['id']][7] = math_matrices[cache_id][7] * cosine - math_matrices[cache_id][3] * sine;

    math_matrix_delete({
      'ids': [cache_id],
    });
}

// Required args: id
// Optional args: decimals
function math_matrix_round(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;

    for(var key in math_matrices[args['id']]){
        math_matrices[args['id']][key] = math_round({
          'decimals': args['decimals'],
          'number': math_matrices[args['id']][key],
        });
    }
}

// Required args: dimensions, id
function math_matrix_translate(args){
    for(var i = 0; i < 4; i++){
        math_matrices[args['id']][i + 12] -= math_matrices[args['id']][i] * args['dimensions'][0]
          + math_matrices[args['id']][i + 4] * args['dimensions'][1]
          + math_matrices[args['id']][i + 8] * args['dimensions'][2];
    }

    math_matrix_round({
      'id': args['id'],
    });
}

// Required args; angle
// Optional args: decimals, speed, strafe
function math_move_3d(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;
    args['speed'] = args['speed'] !== void 0
      ? args['speed']
      : 1;
    args['strafe'] = args['strafe'] || false;

    var radians = -math_degrees_to_radians({
      'decimals': args['decimals'],
      'degrees': args['angle'] - (args['strafe']
          ? 90
          : 0
        ),
    });
    return {
      'x': math_round({
        'decimals': args['decimals'],
        'number': Math.sin(radians) * args['speed'],
      }),
      'z': math_round({
        'decimals': args['decimals'],
        'number': Math.cos(radians) * args['speed'],
      }),
    };
}

// Required args: x0, x1, y0, y1
// Optional args: decimals
function math_movement_speed(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;

    var angle = Math.atan(Math.abs(args['y0'] - args['y1']) / Math.abs(args['x0'] - args['x1']));

    return [
      math_round({
        'decimals': args['decimals'],
        'number': Math.cos(angle),
      }),
      math_round({
        'decimals': args['decimals'],
        'number': Math.sin(angle),
      }),
      angle,
    ];
}

// Required args: radians
// Optional args: decimals
function math_radians_to_degrees(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;

    return math_round({
      'decimals': args['decimals'],
      'number': args['radians'] * math_radian,
    });
}

// Required args: h0, h1, w0, w1, x0, x1, y0, y1
function math_rectangle_overlap(args){
    var boolean = false;
    if(args['x0'] < args['x1'] + args['w1']
      && args['x0'] + args['w0'] > args['x1']
      && args['y0'] < args['y1'] + args['h1']
      && args['y0'] + args['h0'] > args['y1']){
        boolean = true;
    }
    return boolean;
}

// Required args: number
// Optional args: decimals
function math_round(args){
    args['decimals'] = args['decimals'] !== void 0
      ? args['decimals']
      : math_decimals;

    if(String(args['number']).indexOf('e') >= 0){
        args['number'] = Number(args['number'].toFixed(args['decimals']));
    }

    var result = Number(
      Math.round(args['number'] + 'e+' + args['decimals'])
        + 'e-' + args['decimals']
    );

    return isNaN(result)
      ? 0
      : result;
}

var math_decimals = 7;
var math_degree = Math.PI / 180;
var math_matrices = {};
var math_radian = 180 / Math.PI;
var math_tau = Math.PI * 2;
