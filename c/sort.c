#include "sort.h"

int sort_compare_strings(const void* a, const void* b){
    const char **a2 = (const char **)a;
    const char **b2 = (const char **)b;
    return strcmp(*a2, *b2);
}
