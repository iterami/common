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
static float camera_matrix[16] = { 0 };
GLuint camera_matrix_location;
static int entity_count = 0;
GLuint program;
GLint shader_vertex_color;
GLint shader_vertex_position;
GLuint *vertex_arrays;
GLuint *vertex_buffers;
GLuint *vertex_colors;
static GtkWidget *window;

static void camera_move(float speed, gboolean strafe);
static void camera_origin(void);
static void camera_rotate(float x, float y, float z);
static void camera_set_rotation(float x, float y, float z);
static void camera_set_translation(float x, float y, float z);
static void camera_translate(float x, float y, float z);
static float degrees_to_radians(float degrees);
static void entity_create(GLfloat colors[], int id, float rotate_x, float rotate_y, float rotate_z, float translate_x, float translate_y, float translate_z, int vertex_count, int vertices_size, GLfloat vertices[]);
static void entity_draw(int id);
static void generate_all(void);
static struct nextvalue get_next_value(GtkTextBuffer *buffer, int line, int offset);
static void matrix_copy(float *from, float *to);
static void matrix_identity(float *matrix);
static void matrix_perspective(float *matrix, gint width, gint height);
static void matrix_rotate(float *matrix, float x, float y, float z);
static void matrix_translate(float *matrix, float x, float y, float z);
static void realize(GtkGLArea *area);
static gboolean render(GtkGLArea *area, GdkGLContext *context);
