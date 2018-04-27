#include <stdlib.h>
#include "core.h"

float core_clamp_float(const float value, const float min, const float max, const int wrap){
    float wrapped_value = value;

    if(wrap == 1){
        const float diff = max - min;

        while(wrapped_value < min){
            wrapped_value += diff;
        }
        while(wrapped_value >= max){
            wrapped_value -= diff;
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

int core_is_hexadecimal(const char character){
    return (('0' <= character && character <= '9')
      && ('a' <= character && character <= 'f')
      && ('A' <= character && character <= 'F'));
}

size_t core_get_int_length(const int integer){
    if(integer > 999999999){
        return 10;

    }else if(integer > 99999999){
        return 9;

    }else if(integer > 9999999){
        return 8;

    }else if(integer > 999999){
        return 7;

    }else if(integer > 99999){
        return 6;

    }else if(integer > 9999){
        return 5;

    }else if(integer > 999){
        return 4;

    }else if(integer > 99){
        return 3;

    }else if(integer > 9){
        return 2;
    }

    return 1;
}

char* core_iterami_path(const char *filename){
    const char *name = getenv("USER");

    size_t length_file = 0;
    size_t length_name = 0;

    while(filename[length_file] != '\0'){
        length_file++;
    }
    while(name[length_name] != '\0'){
        length_name++;
    }

    char *path = malloc(length_name + length_file + 17);

    path[0] = '/';
    path[1] = 'h';
    path[2] = 'o';
    path[3] = 'm';
    path[4] = 'e';
    path[5] = '/';
    int i = 0;
    while(i < length_name){
        path[i + 6] = name[i];
        i++;
    }
    path[length_name + 6] = '/';
    path[length_name + 7] = '.';
    path[length_name + 8] = 'i';
    path[length_name + 9] = 't';
    path[length_name + 10] = 'e';
    path[length_name + 11] = 'r';
    path[length_name + 12] = 'a';
    path[length_name + 13] = 'm';
    path[length_name + 14] = 'i';
    path[length_name + 15] = '/';
    i = 0;
    while(i < length_file){
        path[i + length_name + 16] = filename[i];
        i++;
    }
    path[length_name + length_file + 16] = '\0';

    return path;
}
