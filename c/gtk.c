#include <gtk/gtk.h>
#include "gtk.h"

GtkWidget * common_add_menuitem(GtkWidget *menu, gchar *label, GtkAccelGroup *accelgroup, guint key, GdkModifierType modifier){
    GtkWidget *menuitem;

    menuitem = gtk_menu_item_new_with_mnemonic(label);

    gtk_widget_add_accelerator(
      menuitem,
      "activate",
      accelgroup,
      key,
      modifier,
      GTK_ACCEL_VISIBLE
    );

    gtk_menu_shell_append(
      GTK_MENU_SHELL(menu),
      menuitem
    );

    return menuitem;
}

int common_get_int_length(gint integer){
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

gchar* common_iterami_path(gchar *filename){
    gint length_file = 0;
    gint length_name = 0;

    while(filename[length_file] != '\0'){
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
        path[loopi + length_name + 16] = filename[loopi];
        loopi++;
    }
    path[length_name + length_file + 16] = '\0';

    return path;
}

void common_init_gtk(void){
    GtkCssProvider *provider;

    name = g_get_user_name();

    // Setup CSS.
    provider = gtk_css_provider_new();
    gtk_style_context_add_provider_for_screen(
      gdk_display_get_default_screen(gdk_display_get_default()),
      GTK_STYLE_PROVIDER(provider),
      GTK_STYLE_PROVIDER_PRIORITY_APPLICATION
    );
    gint length_name = 0;
    while(name[length_name] != '\0'){
        length_name++;
    }
    gchar *path = common_iterami_path("css/gtk.css");
    gtk_css_provider_load_from_file(
      provider,
      g_file_new_for_path(path),
      0
    );
    g_free(path);
    g_object_unref(provider);
}
