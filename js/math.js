'use strict';

// Required args: max, min, value
function math_clamp(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'wrap': false,
      },
    });

    if(args['wrap']){
        args['value'] = args['value'] % (args['max'] - args['min']);

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

    return core_round({
      'decimals': args['decimals'],
      'number': args['value'],
    });
}

// Required args: height-0, height-1, width-0, width-1, x-0, x-1, y-0, y-1
function math_cuboid_overlap(args){
    args = core_args({
      'args': args,
      'defaults': {
        'depth-0': 0,
        'depth-1': 0,
        'z-0': 0,
        'z-1': 0,
      },
    });

    return args['x-0'] <= args['x-1'] + args['width-1']
      && args['x-0'] >= args['x-1'] - args['width-0']
      && args['y-0'] <= args['y-1'] + args['height-1']
      && args['y-0'] >= args['y-1'] - args['height-0']
      && args['z-0'] <= args['z-1'] + args['depth-1']
      && args['z-0'] >= args['z-1'] - args['depth-0'];
}

// Required args: degrees
function math_degrees_to_radians(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    return core_round({
      'decimals': args['decimals'],
      'number': args['degrees'] * .017453292519943295,
    });
}

function math_distance(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'x0': 0,
        'x1': 0,
        'y0': 0,
        'y1': 0,
        'z0': 0,
        'z1': 0,
      },
    });

    return core_round({
      'decimals': args['decimals'],
      'number': Math.sqrt(
        Math.pow(
          args['x0'] - args['x1'],
          2
        ) + Math.pow(
          args['y0'] - args['y1'],
          2
        ) + Math.pow(
          args['z0'] - args['z1'],
          2
        )
      ),
    });
}

function math_fixed_length_line(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'length': 1,
        'x0': 0,
        'x1': 0,
        'y0': 0,
        'y1': 0,
        'z0': 0,
        'z1': 0,
      },
    });

    let line_distance = math_distance({
      'x0': args['x0'],
      'x1': args['x1'],
      'y0': args['y0'],
      'y1': args['y1'],
      'z0': args['z0'],
      'z1': args['z1'],
    });

    args['x1'] /= line_distance;
    args['x1'] *= args['length'];
    args['y1'] /= line_distance;
    args['y1'] *= args['length'];
    args['z1'] /= line_distance;
    args['z1'] *= args['length'];

    return {
      'x': core_round({
        'decimals': args['decimals'],
        'number': args['x1'],
      }),
      'y': core_round({
        'decimals': args['decimals'],
        'number': args['y1'],
      }),
      'z': core_round({
        'decimals': args['decimals'],
        'number': args['z1'],
      }),
    };
}

// Required args: numerator
function math_fraction_reduce(args){
    args = core_args({
      'args': args,
      'defaults': {
        'denominator': false,
      },
    });

    if(args['denominator'] === false){
        args['denominator'] = Math.pow(
          10,
          String(args['numerator']).length
        );
    }

    let done = false;

    while(!done){
        let gcd = core_round({
          'number': math_greatest_common_divisor({
            'a': args['numerator'],
            'b': args['denominator'],
          }),
        });

        if(gcd > 1){
            args['denominator'] /= gcd;
            args['numerator'] /= gcd;

        }else{
            done = true;
        }
    }

    return {
      'denominator': args['denominator'],
      'numerator': args['numerator'],
    };
}

// Required args: a, b
function math_greatest_common_divisor(args){
    if(args['a'] === 0
      || isNaN(args['a'])){
        return args['b'];
    }
    if(args['b'] === 0
      || isNaN(args['b'])){
        return args['a'];
    }

    return math_greatest_common_divisor({
      'a': args['b'],
      'b': args['a'] % args['b'],
    });
}

// Required args: id, to
function math_matrix_clone(args){
    math_matrices[args['to']] = math_matrix_create();
    math_matrix_copy({
      'id': args['id'],
      'to': args['to'],
    });
}

// Required args: id, to
function math_matrix_copy(args){
    Object.assign(
      math_matrices[args['to']],
      math_matrices[args['id']]
    );
}

function math_matrix_create(){
    return new Float32Array(16);
}

// Required args: ids
function math_matrix_delete(args){
    for(let id in args['ids']){
        delete math_matrices[args['ids'][id]];
    }
}

// Required args: id
function math_matrix_identity(args){
    for(let key in math_matrices[args['id']]){
        math_matrices[args['id']][key] =
          key % 5 === 0
            ? 1
            : 0;
    }
}

// Required args: dimensions, id
function math_matrix_rotate(args){
    let cache_id = 'rotate-cache-' + args['id'];

    // Rotate X.
    math_matrix_clone({
      'id': args['id'],
      'to': cache_id,
    });
    let cosine = Math.cos(args['dimensions'][0]);
    let sine = Math.sin(args['dimensions'][0]);

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
      'to': cache_id,
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
      'to': cache_id,
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
function math_matrix_round(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    for(let key in math_matrices[args['id']]){
        math_matrices[args['id']][key] = core_round({
          'decimals': args['decimals'],
          'number': math_matrices[args['id']][key],
        });
    }
}

// Required args: dimensions, id
function math_matrix_translate(args){
    for(let i = 0; i < 4; i++){
        math_matrices[args['id']][i + 12] -= math_matrices[args['id']][i] * args['dimensions'][0]
          + math_matrices[args['id']][i + 4] * args['dimensions'][1]
          + math_matrices[args['id']][i + 8] * args['dimensions'][2];
    }

    math_matrix_round({
      'id': args['id'],
    });
}

// Required args: x0, x1, y0, y1
function math_move_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'multiplier': 1,
      },
    });

    let angle = math_point_angle({
      'x0': args['x0'],
      'x1': args['x1'],
      'y0': args['y0'],
      'y1': args['y1'],
    });

    let dx = core_round({
      'decimals': args['decimals'],
      'number': Math.cos(angle) * args['multiplier'],
    });
    let dy = core_round({
      'decimals': args['decimals'],
      'number': Math.sin(angle) * args['multiplier'],
    });

    if(args['x0'] > args['x1']){
        dx = -dx;
    }
    if(args['y0'] > args['y1']){
        dy = -dy;
    }

    return {
      'angle': angle,
      'x': dx,
      'y': dy,
    };
}

// Required args: dx, dy, speed
function math_move_2d_diagonal(args){
    let sqrt = Math.sqrt(args['speed']);
    return {
      'x': (args['dx'] / args['speed']) * sqrt,
      'y': args['dy'] > 0
        ? sqrt
        : -sqrt,
    };
}

// Required args; angle
function math_move_3d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'multiplier': 1,
        'speed': 1,
        'strafe': false,
      },
    });
    args['speed'] *= args['multiplier'];

    let radians = -math_degrees_to_radians({
      'decimals': args['decimals'],
      'degrees': args['angle'] - (args['strafe']
          ? 90
          : 0
        ),
    });
    return {
      'x': core_round({
        'decimals': args['decimals'],
        'number': Math.sin(radians) * args['speed'],
      }),
      'z': core_round({
        'decimals': args['decimals'],
        'number': Math.cos(radians) * args['speed'],
      }),
    };
}

// Required args: x, y
function math_normalize(args){
    args = core_args({
      'args': args,
      'defaults': {
        'z': 0,
      },
    });

    let length = Math.sqrt(
      Math.pow(
        args['x'],
        2
      ) + Math.pow(
        args['y'],
        2
      ) + Math.pow(
        args['z'],
        2
      )
    );

    if(length === 0){
        length = 1;
    }

    return {
      'x': args['x'] / length,
      'y': args['y'] / length,
      'z': args['z'] / length,
    };
}

// Required args: x0, x1, y0, y1
function math_point_angle(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    return core_round({
      'decimals': args['decimals'],
      'number': Math.atan(Math.abs(args['y0'] - args['y1']) / Math.abs(args['x0'] - args['x1'])),
    });
}

// Required args: radians
function math_radians_to_degrees(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    return core_round({
      'decimals': args['decimals'],
      'number': args['radians'] * 57.29577951308232,
    });
}

window.math_matrices = {};
window.math_tau = 6.283185307179586;
