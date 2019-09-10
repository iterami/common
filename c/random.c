#include <time.h>
#include "random.h"

int random_integer(const int max){
    return rand() % max;
}

void random_seed(const int useseed, const int seed){
    if(useseed == 1){
        srand(seed);

    }else{
        srand(time(NULL));
    }
}
