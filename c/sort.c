#include "sort.h"

int sort_compare_ints(const void* a, const void* b){
    return *(int*)a - *(int*)b;
}

int sort_compare_strings(const void* a, const void* b){
    return strcmp(*(const char **)a, *(const char **)b);
}
