#define KEY_COPY GDK_KEY_c
#define KEY_CUT GDK_KEY_x
#define KEY_PASTE GDK_KEY_v
#define KEY_QUIT GDK_KEY_q

typedef struct nextvalue{
  gchar *value;
  int offset;
} nextvalue;

GtkWidget *window;

GtkWidget * gtk_add_menuitem(GtkWidget *menu, gchar *label, GtkAccelGroup *accelgroup, guint key, GdkModifierType modifier);
void gtk_begin_frameclock(GtkWidget *_glarea);
struct nextvalue gtk_get_next_value(GtkTextBuffer *buffer, int line, int offset);
void gtk_init_gtk(GtkApplication* app, gchar *title);