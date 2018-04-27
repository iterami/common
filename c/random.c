#include <time.h>
#include "random.h"

int random_integer(const int max){
    return rand() % max;
}

void random_seed(void){
    srand(time(NULL));
}
