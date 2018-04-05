#include <math.h>
#include "math.h"

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
    int loop;

    for(loop = 0; loop < 16; loop++){
        to[loop] = from[loop];
    }
}

void math_matrix_identity(float *matrix){
    int loop;

    for(loop = 0; loop < 16; loop++){
        if(loop % 5 == 0){
            matrix[loop] = 1;

        }else{
            matrix[loop] = 0;
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
    int loop;

    for(loop = 0; loop < 4; loop++){
        matrix[loop + 12] -= matrix[loop] * x
          + matrix[loop + 4] * y
          + matrix[loop + 8] * z;
    }
}

float math_radians_to_degrees(const float radians){
    return radians * (180 / M_PI);
}
