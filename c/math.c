#include <math.h>
#include "math.h"

float math_clamp_float(const float value, const float min, const float max, const int wrap){
    float wrapped_value = value;

    if(wrap == 1){
        const float range = max - min;

        if(wrapped_value < min){
            wrapped_value = fmodf(
              max - (min - wrapped_value),
              range
            );

        }else{
            wrapped_value = fmodf(
              min + (wrapped_value - min),
              range
            );
        }

    }else{
        if(wrapped_value < min){
            wrapped_value = min;

        }else if(wrapped_value > max){
            wrapped_value = max;
        }
    }

    return wrapped_value;
}

float math_degrees_to_radians(const float degrees){
    return degrees * (M_PI / 180);
}

float math_distance_2d(const float x0, const float y0, const float x1, const float y1){
    return sqrt(
      pow(
        x0 - x1,
        2
      ) + pow(
        y0 - y1,
        2
      ));
}

void math_matrix_copy(float *from, float *to){
    int i;

    for(i = 0; i < 16; i++){
        to[i] = from[i];
    }
}

void math_matrix_identity(float *matrix){
    int i;

    for(i = 0; i < 16; i++){
        if(i % 5 == 0){
            matrix[i] = 1;

        }else{
            matrix[i] = 0;
        }
    }
}

void math_matrix_perspective(float *matrix, const int width, const int height){
    matrix[0] = height / width;
    matrix[5] = 1;
    matrix[10] = -1;
    matrix[11] = -1;
    matrix[14] = -2;
}

void math_matrix_rotate(float *matrix, const float x, const float y, const float z){
    float cache[16];
    float cosine;
    float sine;

    math_matrix_copy(
      matrix,
      cache
    );

    cosine = cos(x);
    sine = sin(x);

    matrix[4] = cache[4] * cosine + cache[8] * sine;
    matrix[5] = cache[5] * cosine + cache[9] * sine;
    matrix[6] = cache[6] * cosine + cache[10] * sine;
    matrix[7] = cache[7] * cosine + cache[11] * sine;
    matrix[8] = cache[8] * cosine - cache[4] * sine;
    matrix[9] = cache[9] * cosine - cache[5] * sine;
    matrix[10] = cache[10] * cosine - cache[6] * sine;
    matrix[11] = cache[11] * cosine - cache[7] * sine;

    math_matrix_copy(
      matrix,
      cache
    );
    cosine = cos(y);
    sine = sin(y);

    matrix[0] = cache[0] * cosine - cache[8] * sine;
    matrix[1] = cache[1] * cosine - cache[9] * sine;
    matrix[2] = cache[2] * cosine - cache[10] * sine;
    matrix[3] = cache[3] * cosine - cache[11] * sine;
    matrix[8] = cache[8] * cosine + cache[0] * sine;
    matrix[9] = cache[9] * cosine + cache[1] * sine;
    matrix[10] = cache[10] * cosine + cache[2] * sine;
    matrix[11] = cache[11] * cosine + cache[3] * sine;

    math_matrix_copy(
      matrix,
      cache
    );
    cosine = cos(z);
    sine = sin(z);

    matrix[0] = cache[0] * cosine + cache[4] * sine;
    matrix[1] = cache[1] * cosine + cache[5] * sine;
    matrix[2] = cache[2] * cosine + cache[6] * sine;
    matrix[3] = cache[3] * cosine + cache[7] * sine;
    matrix[4] = cache[4] * cosine - cache[0] * sine;
    matrix[5] = cache[5] * cosine - cache[1] * sine;
    matrix[6] = cache[6] * cosine - cache[2] * sine;
    matrix[7] = cache[7] * cosine - cache[3] * sine;
}

void math_matrix_translate(float *matrix, const float x, const float y, const float z){
    int i;

    for(i = 0; i < 4; i++){
        matrix[i + 12] -= matrix[i] * x
          + matrix[i + 4] * y
          + matrix[i + 8] * z;
    }
}

float math_point_angle(const float x0, const float y0, const float x1, const float y1){
    return atan(fabs(y0 - y1) / fabs(x0 - x1));
}

float math_radians_to_degrees(const float radians){
    return radians * (180 / M_PI);
}
