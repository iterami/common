#include <gtk/gtk.h>
#include "gtk.h"

GtkWidget * gtk_add_menuitem(GtkWidget *menu, gchar *label, GtkAccelGroup *accelgroup, guint key, GdkModifierType modifier){
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

void gtk_begin_frameclock(GtkWidget *_glarea){
    // Setup update loop.
    GdkFrameClock *frameclock = gdk_window_get_frame_clock(gdk_gl_context_get_window(gtk_gl_area_get_context(GTK_GL_AREA(_glarea))));
    g_signal_connect_swapped(
      frameclock,
      "update",
      G_CALLBACK(gtk_gl_area_queue_render),
      _glarea
    );
    gdk_frame_clock_begin_updating(frameclock);
}

int gtk_get_int_length(gint integer){
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

struct nextvalue gtk_get_next_value(GtkTextBuffer *buffer, int line, int offset){
    GtkTextIter end;
    gchar *slice;
    GtkTextIter start;
    GtkTextIter substart;

    gtk_text_buffer_get_iter_at_line(
      buffer,
      &start,
      line
    );
    gtk_text_iter_set_line_offset(
      &start,
      offset
    );
    end = start;
    substart = start;
    gtk_text_iter_forward_char(&end);
    slice = gtk_text_iter_get_text(
      &substart,
      &end
    );
    while(*slice != ','
      && *slice != '|'){
        gtk_text_iter_forward_char(&substart);
        gtk_text_iter_forward_char(&end);
        slice = gtk_text_iter_get_text(
          &substart,
          &end
        );
    }
    g_free(slice);

    nextvalue result = {
      gtk_text_buffer_get_text(
        buffer,
        &start,
        &end,
        FALSE
      ),
      gtk_text_iter_get_line_offset(&end)
    };
    return result;
}

void gtk_init_gtk(GtkApplication* app, gchar *title){
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
    gchar *path = gtk_iterami_path("css/gtk.css");
    gtk_css_provider_load_from_file(
      provider,
      g_file_new_for_path(path),
      0
    );
    g_free(path);
    g_object_unref(provider);

    // Setup window.
    window = gtk_application_window_new(app);
    gtk_window_set_default_size(
      GTK_WINDOW(window),
      1280,
      800
    );
    gtk_window_maximize(GTK_WINDOW(window));
    gtk_window_set_title(
      GTK_WINDOW(window),
      title
    );
}

gchar* gtk_iterami_path(gchar *filename){
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
