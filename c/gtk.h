#pragma once

#define CSS_PATH "css/gtk.css"
#define KEY_COPY GDK_KEY_c
#define KEY_CUT GDK_KEY_x
#define KEY_INSERT_EMOJI GDK_KEY_period
#define KEY_PASTE GDK_KEY_v
#define KEY_QUIT GDK_KEY_q

GtkWidget *window;

void gtk_activate(GtkApplication* app, gpointer data);
void gtk_add_menuitem(GtkWidget *menu, const gchar *label, GtkAccelGroup *accelgroup, const guint key, GdkModifierType modifier, GCallback callback, gpointer data);
void gtk_init_gtk(GtkApplication* app, const gchar *title);
