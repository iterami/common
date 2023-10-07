#include "sort.h"

int sort_compare_ints_asc(const void* a, const void* b){
    return *(const int*)a - *(const int*)b;
}

int sort_compare_ints_desc(const void* a, const void* b){
    return *(const int*)b - *(const int*)a;
}

int sort_compare_strings_asc(const void* a, const void* b){
    return strcasecmp(*(const char **)a, *(const char **)b);
}

int sort_compare_strings_desc(const void* a, const void* b){
    return strcasecmp(*(const char **)b, *(const char **)a);
}
