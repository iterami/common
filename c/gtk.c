#include <gtk/gtk.h>
#include "gtk.h"

gchar* construct_common_path(gchar *file){
    gint length_file = 0;
    gint length_name = 0;

    while(file[length_file] != '\0'){
        length_file++;
    }
    while(name[length_name] != '\0'){
        length_name++;
    }

    gchar *path = g_malloc(length_name + length_file + 17);

    path[0] = '/';
    path[1] = 'h';
    path[2] = 'o';
    path[3] = 'm';
    path[4] = 'e';
    path[5] = '/';
    gint loopi = 0;
    while(loopi < length_name){
        path[loopi + 6] = name[loopi];
        loopi++;
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
    loopi = 0;
    while(loopi < length_file){
        path[loopi + length_name + 16] = file[loopi];
        loopi++;
    }
    path[length_name + length_file + 16] = '\0';

    return path;
}
