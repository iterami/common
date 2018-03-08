typedef struct entitystruct{
  GLuint array;
  GLuint buffer;
  gboolean draw;
  float rotate_x;
  float rotate_y;
  float rotate_z;
  float translate_x;
  float translate_y;
  float translate_z;
} entitystruct;
typedef struct nextvalue{
  gchar *value;
  int offset;
} nextvalue;

entitystruct camera = {
  0,
  0,
  FALSE,
  0,
  0,
  0,
  0,
  0,
  0,
};
float camera_matrix[16] = { 0 };
GLuint camera_matrix_location;
int entity_count = 0;
GtkWidget *glarea;
GLuint program;
GLint shader_vertex_color;
GLint shader_vertex_position;
GLuint *vertex_arrays;
GLuint *vertex_buffers;
GLuint *vertex_colors;

void camera_move(float speed, gboolean strafe);
void camera_origin(void);
void camera_rotate(float x, float y, float z);
void camera_set_rotation(float x, float y, float z);
void camera_set_translation(float x, float y, float z);
void camera_translate(float x, float y, float z);
void common_begin_frameclock(void);
float degrees_to_radians(float degrees);
void entity_create(GLfloat colors[], int id, float rotate_x, float rotate_y, float rotate_z, float translate_x, float translate_y, float translate_z, int vertex_count, int vertices_size, GLfloat vertices[]);
void entity_draw(int id);
void generate_all(void);
struct nextvalue get_next_value(GtkTextBuffer *buffer, int line, int offset);
void matrix_copy(float *from, float *to);
void matrix_identity(float *matrix);
void matrix_perspective(float *matrix, gint width, gint height);
void matrix_rotate(float *matrix, float x, float y, float z);
void matrix_translate(float *matrix, float x, float y, float z);
void realize(GtkGLArea *area);
gboolean render(GtkGLArea *area, GdkGLContext *context);
