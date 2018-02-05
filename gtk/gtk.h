const gchar *name;

GtkWidget * common_add_menuitem(GtkWidget *menu, gchar *label, GtkAccelGroup *accelgroup, guint key, GdkModifierType modifier);
int common_get_int_length(gint integer);
gchar* common_iterami_path(gchar *file);
void common_init_gtk(void);
