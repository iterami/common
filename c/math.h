#pragma once

float math_clamp_float(const float value, const float min, const float max, const int wrap);
float math_degrees_to_radians(const float degrees);
float math_distance_2d(const float x0, const float y0, const float x1, const float y1);
void math_matrix_copy(float *from, float *to);
void math_matrix_identity(float *matrix);
void math_matrix_perspective(float *matrix, const int width, const int height);
void math_matrix_rotate(float *matrix, const float x, const float y, const float z);
void math_matrix_translate(float *matrix, const float x, const float y, const float z);
float math_point_angle(const float x0, const float y0, const float x1, const float y1);
float math_radians_to_degrees(const float radians);
