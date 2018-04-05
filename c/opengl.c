#include "opengl.h"
#include "math.c"

gboolean opengl_camera_free_keypress(GtkWidget *widget, GdkEventKey *event, gpointer data){
    if(event->keyval == KEY_BACK){
        key_back = TRUE;

    }else if(event->keyval == KEY_DOWN){
        key_down = TRUE;

    }else if(event->keyval == KEY_FORWARD){
        key_forward = TRUE;

    }else if(event->keyval == KEY_LEFT){
        key_left = TRUE;

    }else if(event->keyval == KEY_RIGHT){
        key_right = TRUE;

    }else if(event->keyval == KEY_UP){
        key_up = TRUE;
    }

    return FALSE;
}

gboolean opengl_camera_free_keyrelease(GtkWidget *widget, GdkEventKey *event, gpointer data){
    if(event->keyval == KEY_BACK){
        key_back = FALSE;

    }else if(event->keyval == KEY_DOWN){
        key_down = FALSE;

    }else if(event->keyval == KEY_FORWARD){
        key_forward = FALSE;

    }else if(event->keyval == KEY_LEFT){
        key_left = FALSE;

    }else if(event->keyval == KEY_RIGHT){
        key_right = FALSE;

    }else if(event->keyval == KEY_UP){
        key_up = FALSE;
    }

    return FALSE;
}

gboolean opengl_camera_free_mousemove(GtkWidget *widget, GdkEventMotion *event, gpointer data){
    mouse_movement_x = event->x - mouse_x;
    mouse_movement_y = event->y - mouse_y;

    mouse_x = event->x;
    mouse_y = event->y;

    return FALSE;
}

gboolean opengl_camera_free_mousepress(GtkWidget *widget, GdkEventButton *event, gpointer data){
    mouse_down = TRUE;

    return FALSE;
}

gboolean opengl_camera_free_mouserelease(GtkWidget *widget, GdkEventButton *event, gpointer data){
    mouse_down = FALSE;

    return FALSE;
}

void opengl_camera_init_free(void){
    g_signal_connect_swapped(
      window,
      "key-press-event",
      G_CALLBACK(opengl_camera_free_keypress),
      NULL
    );
    g_signal_connect_swapped(
      window,
      "key-release-event",
      G_CALLBACK(opengl_camera_free_keyrelease),
      NULL
    );
    g_signal_connect_swapped(
      glarea,
      "button-press-event",
      G_CALLBACK(opengl_camera_free_mousepress),
      NULL
    );
    g_signal_connect_swapped(
      glarea,
      "button-release-event",
      G_CALLBACK(opengl_camera_free_mouserelease),
      NULL
    );
    g_signal_connect_swapped(
      glarea,
      "motion-notify-event",
      G_CALLBACK(opengl_camera_free_mousemove),
      NULL
    );
}

void opengl_camera_move(const float speed, const gboolean strafe){
    float y_rotation = camera.rotate_y;
    if(strafe){
        y_rotation -= 90;
    }
    float angle = -math_degrees_to_radians(y_rotation);

    opengl_camera_translate(
      sin(angle) * speed,
      0,
      cos(angle) * speed
    );
}

void opengl_camera_origin(void){
    opengl_camera_set_rotation(
      0,
      0,
      0
    );
    opengl_camera_set_translation(
      0,
      0,
      0
    );
}

void opengl_camera_rotate(const float x, const float y, const float z){
    camera.rotate_x += x;
    camera.rotate_y += y;
    camera.rotate_z += z;

    if(camera.rotate_x > 89){
        camera.rotate_x = 89;

    }else if(camera.rotate_x < -89){
        camera.rotate_x = -89;
    }

    opengl_camera_rotation_clamp();
}

void opengl_camera_rotation_clamp(void){
    if(camera.rotate_x < -360){
        camera.rotate_x += 360;

    }else if(camera.rotate_x > 360){
        camera.rotate_x -= 360;
    }
    if(camera.rotate_y < -360){
        camera.rotate_y += 360;

    }else if(camera.rotate_y > 360){
        camera.rotate_y -= 360;
    }
    if(camera.rotate_z < -360){
        camera.rotate_z += 360;

    }else if(camera.rotate_z > 360){
        camera.rotate_z -= 360;
    }
}

void opengl_camera_set_rotation(const float x, const float y, const float z){
    camera.rotate_x = x;
    camera.rotate_y = y;
    camera.rotate_z = z;

    opengl_camera_rotation_clamp();
}

void opengl_camera_set_translation(const float x, const float y, const float z){
    camera.translate_x = x;
    camera.translate_y = y;
    camera.translate_z = z;
}

void opengl_camera_translate(const float x, const float y, const float z){
    camera.translate_x += x;
    camera.translate_y += y;
    camera.translate_z += z;
}

void opengl_entity_create(GLfloat colors[], int id, float rotate_x, float rotate_y, float rotate_z, float translate_x, float translate_y, float translate_z, int vertex_count, int vertices_size, GLfloat vertices[]){
    int loopi;
    for(loopi = 0; loopi < vertex_count; loopi++){
        vertices[loopi * 4] += translate_x;
        vertices[loopi * 4 + 1] += translate_y;
        vertices[loopi * 4 + 2] += translate_z;
    }

    glBindVertexArray(vertex_arrays[id]);
    glBindBuffer(
      GL_ARRAY_BUFFER,
      vertex_buffers[id]
    );

    glEnableVertexAttribArray(shader_vertex_position);
    glVertexAttribPointer(
      shader_vertex_position,
      4,
      GL_FLOAT,
      GL_FALSE,
      0,
      0
    );
    glBufferData(
      GL_ARRAY_BUFFER,
      vertices_size,
      vertices,
      GL_STATIC_DRAW
    );

    glEnableVertexAttribArray(shader_vertex_color);
    glBindBuffer(
      GL_ARRAY_BUFFER,
      vertex_colors[id]
    );
    glVertexAttribPointer(
      shader_vertex_color,
      4,
      GL_FLOAT,
      GL_FALSE,
      0,
      0
    );
    glBufferData(
      GL_ARRAY_BUFFER,
      vertices_size,
      colors,
      GL_STATIC_DRAW
    );
}

void opengl_entity_draw(const int id){
    glBindVertexArray(vertex_arrays[id]);
    glBindBuffer(
      GL_ARRAY_BUFFER,
      vertex_buffers[id]
    );

    glDrawArrays(
      GL_TRIANGLES,
      0,
      3
    );
}

void opengl_generate_all(void){
    g_free(vertex_arrays);
    g_free(vertex_buffers);

    vertex_arrays = g_malloc(sizeof(GLuint) * entity_count);
    glGenVertexArrays(
      entity_count,
      vertex_arrays
    );
    vertex_buffers = g_malloc(sizeof(GLuint) * entity_count);
    glGenBuffers(
      entity_count,
      vertex_buffers
    );
    vertex_colors = g_malloc(sizeof(GLuint) * entity_count);
    glGenBuffers(
      entity_count,
      vertex_colors
    );
}

void opengl_load_level(const char *filename){
    opengl_camera_origin();

    gchar *content;
    gssize length;

    if(g_file_get_contents(
      filename,
      &content,
      &length,
      NULL
    ) && g_utf8_validate(
      content,
      length,
      NULL
    )){
        GtkTextBuffer *buffer;
        GtkTextIter end;
        int loopi;
        int loopisub;
        nextvalue nextresult;
        GtkTextIter start;
        GtkWidget *temp_text_view;
        int vertexarray_size;
        float x_rotation;
        float y_rotation;
        float z_rotation;
        float x_translation;
        float y_translation;
        float z_translation;

        buffer = gtk_text_buffer_new(NULL);
        temp_text_view = gtk_text_view_new_with_buffer(buffer);

        gtk_text_buffer_set_text(
          buffer,
          content,
          length
        );

        // Parse # of entities.
        gtk_text_buffer_get_iter_at_line(
          buffer,
          &start,
          1
        );
        gtk_text_buffer_get_iter_at_line(
          buffer,
          &end,
          2
        );
        gtk_text_iter_backward_char(&end);
        entity_count = atoi(gtk_text_buffer_get_text(
          buffer,
          &start,
          &end,
          FALSE
        ));
        opengl_generate_all();

        // Parse entities.
        for(loopi = 0; loopi < entity_count; loopi++){
            // Parse # of vertices.
            gtk_text_buffer_get_iter_at_line(
              buffer,
              &start,
              loopi + 2
            );
            end = start;
            gtk_text_iter_forward_char(&end);
            vertexarray_size = atoi(gtk_text_buffer_get_text(
              buffer,
              &start,
              &end,
              FALSE
            )) * 4;

            // Parse coordinates.
            nextresult = gtk_get_next_value(
              buffer,
              loopi + 2,
              2
            );
            x_translation = atof(nextresult.value);
            nextresult = gtk_get_next_value(
              buffer,
              loopi + 2,
              nextresult.offset
            );
            y_translation = atof(nextresult.value);
            nextresult = gtk_get_next_value(
              buffer,
              loopi + 2,
              nextresult.offset
            );
            z_translation = atof(nextresult.value);

            // Parse rotation.
            nextresult = gtk_get_next_value(
              buffer,
              loopi + 2,
              nextresult.offset
            );
            x_rotation = atof(nextresult.value);
            nextresult = gtk_get_next_value(
              buffer,
              loopi + 2,
              nextresult.offset
            );
            y_rotation = atof(nextresult.value);
            nextresult = gtk_get_next_value(
              buffer,
              loopi + 2,
              nextresult.offset
            );
            z_rotation = atof(nextresult.value);

            // Parse vertices.
            GLfloat vertices_array[vertexarray_size];
            for(loopisub = 0; loopisub < vertexarray_size; loopisub++){
                nextresult = gtk_get_next_value(
                  buffer,
                  loopi + 2,
                  nextresult.offset
                );
                vertices_array[loopisub] = atof(nextresult.value);
            }

            // Parse colors.
            GLfloat colors_array[vertexarray_size];
            for(loopisub = 0; loopisub < vertexarray_size; loopisub++){
                nextresult = gtk_get_next_value(
                  buffer,
                  loopi + 2,
                  nextresult.offset
                );
                colors_array[loopisub] = atof(nextresult.value);
            }

            opengl_entity_create(
              colors_array,
              loopi,
              x_rotation,
              y_rotation,
              z_rotation,
              x_translation,
              y_translation,
              z_translation,
              vertexarray_size / 4,
              sizeof(vertices_array),
              vertices_array
            );
        }

        gtk_widget_destroy(temp_text_view);
    }

    g_free(content);
}

void realize(GtkGLArea *area){
    gtk_gl_area_make_current(area);

    glewExperimental = GL_TRUE;
    glewInit();

    // Setup GL properties.
    glClearColor(
      0,
      0,
      0,
      0
    );
    gtk_gl_area_set_has_depth_buffer(
      area,
      TRUE
    );
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);

    // Setup shaders.
    GLuint shader_fragment;
    GLuint shader_vertex;

    shader_fragment = glCreateShader(GL_FRAGMENT_SHADER);
    const GLchar *source_fragment = "varying vec4 fragment_color;void main(void){gl_FragColor=fragment_color;}";
    glShaderSource(
      shader_fragment,
      1,
      &source_fragment,
      NULL
    );
    glCompileShader(shader_fragment);

    shader_vertex = glCreateShader(GL_VERTEX_SHADER);
    const GLchar *source_vertex = "uniform mat4 camera_matrix;varying vec4 fragment_color;attribute vec4 vertex_color;attribute vec4 vertex_position;void main(void){gl_Position=camera_matrix*vertex_position;fragment_color=vertex_color;}";
    glShaderSource(
      shader_vertex,
      1,
      &source_vertex,
      NULL
    );
    glCompileShader(shader_vertex);

    // Setup program.
    program = glCreateProgram();

    glAttachShader(
      program,
      shader_fragment
    );
    glAttachShader(
      program,
      shader_vertex
    );

    glLinkProgram(program);

    glDetachShader(
      program,
      shader_fragment
    );
    glDetachShader(
      program,
      shader_vertex
    );

    glDeleteShader(shader_fragment);
    glDeleteShader(shader_vertex);

    camera_matrix_location = glGetUniformLocation(
      program,
      "camera_matrix"
    );
    shader_vertex_color = glGetAttribLocation(
      program,
      "vertex_color"
    );
    shader_vertex_position = glGetAttribLocation(
      program,
      "vertex_position"
    );

    repo_init();
}

gboolean render(GtkGLArea *area, GdkGLContext *context){
    if(mouse_down){
        opengl_camera_rotate(
          mouse_movement_y / 20,
          mouse_movement_x / 20,
          0
        );

        mouse_movement_x = 0;
        mouse_movement_y = 0;
    }

    if(key_back){
        opengl_camera_move(
          .1,
          FALSE
        );
    }
    if(key_down){
        opengl_camera_translate(
          0,
          -.1,
          0
        );
    }
    if(key_forward){
        opengl_camera_move(
          -.1,
          FALSE
        );
    }
    if(key_left){
        opengl_camera_move(
          -.1,
          TRUE
        );
    }
    if(key_right){
        opengl_camera_move(
          .1,
          TRUE
        );
    }
    if(key_up){
        opengl_camera_translate(
          0,
          .1,
          0
        );
    }

    math_matrix_identity(camera_matrix);
    math_matrix_perspective(
      camera_matrix,
      1,
      1
    );
    math_matrix_rotate(
      camera_matrix,
      math_degrees_to_radians(camera.rotate_x),
      math_degrees_to_radians(camera.rotate_y),
      math_degrees_to_radians(camera.rotate_z)
    );
    math_matrix_translate(
      camera_matrix,
      camera.translate_x,
      camera.translate_y,
      camera.translate_z
    );

    glUseProgram(program);
    glUniformMatrix4fv(
      camera_matrix_location,
      1,
      GL_FALSE,
      camera_matrix
    );

    int loopi;
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    for(loopi = 0; loopi < entity_count; loopi++){
        opengl_entity_draw(loopi);
    }

    return TRUE;
}
