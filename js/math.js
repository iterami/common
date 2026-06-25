'use strict';

function math_clamp({
  max,
  min,
  value,
  wrap = false,
} = {}){
    if(value > min
      && value < max){
        return value;
    }

    if(wrap){
        if(value < min){
            return max - (min - value) % (max - min);
        }

        return min + (value - min) % (max - min);
    }

    return Math.min(
      Math.max(
        value,
        min
      ),
      max
    );
}

function math_cuboid_overlap({
  depth0 = 0,
  depth1 = 0,
  height0,
  height1,
  width0,
  width1,
  x0,
  x1,
  y0,
  y1,
  z0 = 0,
  z1 = 0,
} = {}){
    return x0 <= x1 + width1
      && x0 >= x1 - width0
      && y0 <= y1 + height1
      && y0 >= y1 - height0
      && z0 <= z1 + depth1
      && z0 >= z1 - depth0;
}

function math_degrees_to_radians(degrees){
    return degrees * .017453292519943295;
}

function math_distance({
  x0 = 0,
  x1 = 0,
  y0 = 0,
  y1 = 0,
  z0 = 0,
  z1 = 0,
} = {}){
    return Math.hypot(x0 - x1, y0 - y1, z0 - z1);
}

function math_fixed_length_line({
  length = 1,
  x0 = 0,
  x1 = 0,
  y0 = 0,
  y1 = 0,
  z0 = 0,
  z1 = 0,
} = {}){
    const line_distance = math_distance({
      'x0': x0,
      'x1': x1,
      'y0': y0,
      'y1': y1,
      'z0': z0,
      'z1': z1,
    });

    x1 /= line_distance;
    x1 *= length;
    y1 /= line_distance;
    y1 *= length;
    z1 /= line_distance;
    z1 *= length;

    return {
      'x': x1,
      'y': y1,
      'z': z1,
    };
}

function math_fraction_reduce({
  denominator = false,
  numerator,
} = {}){
    if(denominator === false){
        denominator = Math.pow(
          10,
          String(numerator).length
        );
    }

    let done = false;
    while(!done){
        const gcd = math_greatest_common_divisor({
          'a': numerator,
          'b': denominator,
        });

        if(gcd > 1){
            denominator /= gcd;
            numerator /= gcd;

        }else{
            done = true;
        }
    }

    return {
      'denominator': denominator,
      'numerator': numerator,
    };
}

function math_greatest_common_divisor({
  a,
  b,
} = {}){
    if(a === 0
      || globalThis.isNaN(a)){
        return b;
    }
    if(b === 0
      || globalThis.isNaN(b)){
        return a;
    }

    return math_greatest_common_divisor({
      'a': b,
      'b': a % b,
    });
}

function math_matrix_create(length){
    return new Float32Array(length || 16);
}

function math_matrix_identity(matrix){
    for(const key in matrix){
        matrix[key] =
          key % 5 === 0
            ? 1
            : 0;
    }

    return matrix;
}

function math_matrix_rotate(matrix, x, y, z){
    const cache = math_matrix_create(matrix);

    // Rotate X.
    let cosine = Math.cos(x);
    let sine = Math.sin(x);

    matrix[4] = cache[4] * cosine + cache[8] * sine;
    matrix[5] = cache[5] * cosine + cache[9] * sine;
    matrix[6] = cache[6] * cosine + cache[10] * sine;
    matrix[7] = cache[7] * cosine + cache[11] * sine;
    matrix[8] = cache[8] * cosine - cache[4] * sine;
    matrix[9] = cache[9] * cosine - cache[5] * sine;
    matrix[10] = cache[10] * cosine - cache[6] * sine;
    matrix[11] = cache[11] * cosine - cache[7] * sine;

    // Rotate Y.
    Object.assign(
      cache,
      matrix
    );
    cosine = Math.cos(y);
    sine = Math.sin(y);

    matrix[0] = cache[0] * cosine - cache[8] * sine;
    matrix[1] = cache[1] * cosine - cache[9] * sine;
    matrix[2] = cache[2] * cosine - cache[10] * sine;
    matrix[3] = cache[3] * cosine - cache[11] * sine;
    matrix[8] = cache[8] * cosine + cache[0] * sine;
    matrix[9] = cache[9] * cosine + cache[1] * sine;
    matrix[10] = cache[10] * cosine + cache[2] * sine;
    matrix[11] = cache[11] * cosine + cache[3] * sine;

    // Rotate Z.
    Object.assign(
      cache,
      matrix
    );
    cosine = Math.cos(z);
    sine = Math.sin(z);

    matrix[0] = cache[0] * cosine + cache[4] * sine;
    matrix[1] = cache[1] * cosine + cache[5] * sine;
    matrix[2] = cache[2] * cosine + cache[6] * sine;
    matrix[3] = cache[3] * cosine + cache[7] * sine;
    matrix[4] = cache[4] * cosine - cache[0] * sine;
    matrix[5] = cache[5] * cosine - cache[1] * sine;
    matrix[6] = cache[6] * cosine - cache[2] * sine;
    matrix[7] = cache[7] * cosine - cache[3] * sine;

    return matrix;
}

function math_matrix_translate(matrix, x, y, z){
    for(let i = 0; i < 4; i++){
        matrix[i + 12] -= matrix[i] * x
          + matrix[i + 4] * y
          + matrix[i + 8] * z;
    }

    return matrix;
}

function math_move_2d({
  speed = 1,
  x0,
  x1,
  y0,
  y1,
} = {}){
    const angle = Math.atan2(
      y1 - y0,
      x1 - x0
    );
    return {
      'angle': angle,
      'x': Math.cos(angle) * speed,
      'y': Math.sin(angle) * speed,
    };
}

function math_move_2d_diagonal({
  dx,
  dy,
  speed,
} = {}){
    const sqrt = Math.sqrt(speed);
    return {
      'x': (dx / speed) * sqrt,
      'y': dy > 0
        ? sqrt
        : -sqrt,
    };
}

function math_move_3d({
  angle,
  speed = 1,
  strafe = false,
} = {}){
    const radians = -math_degrees_to_radians(angle - (strafe
      ? 90
      : 0
    ));
    return {
      'x': Math.sin(radians) * speed,
      'z': Math.cos(radians) * speed,
    };
}

function math_normalize({
  x,
  y,
  z = 0,
} = {}){
    const length = math_distance({
      'x0': x,
      'y0': y,
      'z0': z,
    });

    if(length === 0){
        return {
          'x': x,
          'y': y,
          'z': z,
        };
    }

    return {
      'x': x / length,
      'y': y / length,
      'z': z / length,
    };
}

function math_oscillate({
  limit = 5,
  max = 10,
  min = 10,
  value,
} = {}){
    const half = (Math.abs(max) + Math.abs(min)) / 2;
    const distance_min = value - min;
    const distance_max = max - value;
    let limit_down = limit;
    let limit_up = limit;

    if(distance_max > distance_min){
        limit_down *= Math.max(
          distance_min / half,
          0
        );

    }else if(distance_max < distance_min){
        limit_up *= Math.max(
          distance_max / half,
          0
        );
    }

    return Math.random() * (limit_down + limit_up) + (value - limit_down);
}

function math_radians_to_degrees(radians){
    return radians * 57.29577951308232;
}
