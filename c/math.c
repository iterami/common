#include <math.h>
#include "math.h"

float math_degrees_to_radians(float degrees){
    return degrees * (M_PI / 180);
}

float math_radians_to_degrees(float radians){
    return radians * (180 / M_PI);
}
