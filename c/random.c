#include <stdlib.h>
#include <time.h>
#include "random.h"

int random_integer(const int max){
    return rand() % max;
}

int random_seed(void){
    srand(time(NULL));
}
