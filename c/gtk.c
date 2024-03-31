#include "gtk.h"

void gtk_activate(GtkApplication* app, gpointer data){
    gtk_window_present(GTK_WINDOW(window));
}

void gtk_add_menuitem(GtkWidget *menu, const gchar *label, GtkAccelGroup *accelgroup, const guint key, GdkModifierType modifier, GCallback callback, gpointer data){
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

    if(callback != NULL){
        g_signal_connect_swapped(
          menuitem,
          "activate",
          callback,
          data
       );

    }else{
        gtk_widget_set_sensitive(
          menuitem,
          FALSE
        );
    }
}

void gtk_init_gtk(GtkApplication* app, const gchar *title, const gchar *icon){
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
    if(icon != NULL){
        gtk_window_set_icon_from_file(
          GTK_WINDOW(window),
          core_iterami_path(icon),
          NULL
        );
    }
}
