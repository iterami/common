#include <gtk/gtk.h>
#include "gtk.h"

GtkWidget * gtk_add_menuitem(GtkWidget *menu, const gchar *label, GtkAccelGroup *accelgroup, const guint key, GdkModifierType modifier){
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

void gtk_init_gtk(GtkApplication* app, const gchar *title){
    GtkCssProvider *provider;

    // Setup CSS.
    provider = gtk_css_provider_new();
    gtk_style_context_add_provider_for_screen(
      gdk_display_get_default_screen(gdk_display_get_default()),
      GTK_STYLE_PROVIDER(provider),
      GTK_STYLE_PROVIDER_PRIORITY_APPLICATION
    );
    gchar *path = core_iterami_path(CSS_PATH);
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
