#pragma once

#define KEY_BACK GDK_KEY_s
#define KEY_DOWN GDK_KEY_c
#define KEY_FORWARD GDK_KEY_w
#define KEY_LEFT GDK_KEY_a
#define KEY_ORIGIN GDK_KEY_h
#define KEY_RIGHT GDK_KEY_d
#define KEY_UP GDK_KEY_space

typedef struct entitystruct{
  float alpha;
  gboolean billboard;
  GLfloat *colors_array;
  gboolean draw;
  int draw_type;
  int id;
  float rotate_x;
  float rotate_y;
  float rotate_z;
  float translate_x;
  float translate_y;
  float translate_z;
  size_t vertex_count;
  GLfloat *vertices_array;
  size_t vertices_size;
} entitystruct;
typedef struct groupstruct{
  int count;
  entitystruct *entities;
  char *id;
} groupstruct;

GLuint alpha_location;
entitystruct camera;
float camera_matrix[16] = { 0 };
GLuint camera_matrix_location;
entitystruct *entities = NULL;
size_t entity_count = 0;
GtkWidget *glarea;
int group_count;
groupstruct *groups;
gboolean key_back = FALSE;
gboolean key_down = FALSE;
gboolean key_forward = FALSE;
gboolean key_left = FALSE;
gboolean key_right = FALSE;
gboolean key_up = FALSE;
gboolean mouse_down = FALSE;
float mouse_movement_x = 0;
float mouse_movement_y = 0;
float mouse_x = 0;
float mouse_y = 0;
GLuint program;
GLint shader_vertex_color;
GLint shader_vertex_position;
GLuint *vertex_arrays;
GLuint *vertex_buffers;
GLuint *vertex_colors;
int window_height = 1;
int window_width = 1;

void opengl_billboard(const int id, gboolean x, gboolean y, gboolean z);
gboolean opengl_camera_free_keypress(GtkWidget *widget, GdkEventKey *event, gpointer data);
gboolean opengl_camera_free_keyrelease(GtkWidget *widget, GdkEventKey *event, gpointer data);
gboolean opengl_camera_free_mousemove(GtkWidget *widget, GdkEventMotion *event, gpointer data);
gboolean opengl_camera_free_mousepress(GtkWidget *widget, GdkEventButton *event, gpointer data);
gboolean opengl_camera_free_mouserelease(GtkWidget *widget, GdkEventButton *event, gpointer data);
void opengl_camera_init_free(void);
void opengl_camera_move(const float speed, const gboolean strafe);
void opengl_camera_origin(void);
void opengl_camera_rotate(const float x, const float y, const float z);
void opengl_camera_rotation_clamp(void);
void opengl_camera_set_rotation(const float x, const float y, const float z);
void opengl_camera_set_translation(const float x, const float y, const float z);
void opengl_camera_translate(const float x, const float y, const float z);
void opengl_clearcolor_set(const float red, const float green, const float blue, const float alpha);
void opengl_entity_bind(const int id);
void opengl_entity_draw(const int id);
void opengl_events_init(GtkWidget *_glarea);
void opengl_generate_all(void);
void opengl_group_add(groupstruct *group, entitystruct *entity);
void opengl_group_modify(groupstruct *group);
void opengl_group_move(groupstruct *oldgroup, entitystruct *entity, groupstruct *newgroup);
void opengl_group_remove(groupstruct *group, entitystruct *entity);
void opengl_group_remove_all(groupstruct *group);
void opengl_groups_create(const gchar *new_groups[], const int count);
void opengl_load_level(const gchar *filename);
void opengl_logicloop(void);
void opengl_realize(GtkGLArea *area);
gboolean opengl_render(GtkGLArea *area, GdkGLContext *context);
void opengl_resize(GtkGLArea *_glarea, int width, int height, gpointer data);
int opengl_string_to_primitive(const gchar *string);
