#pragma once

float core_clamp_float(const float value, const float min, const float max, const int wrap);
int core_is_hexadecimal(const char character);
size_t core_get_int_length(const int integer);
char* core_iterami_path(const char *filename);
