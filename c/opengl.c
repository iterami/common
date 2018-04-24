#include "opengl.h"
#include "gtk.c"
#include "json.c"
#include "math.c"

void opengl_billboard(const int id, gboolean x, gboolean y, gboolean z){
    if(x){
        entities[id].rotate_x = 360 - camera.rotate_x;
    }

    if(y){
        entities[id].rotate_y = 360 - camera.rotate_y;
    }

    if(z){
        entities[id].rotate_z = 360 - camera.rotate_z;
    }
}

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
    const float angle = -math_degrees_to_radians(y_rotation);

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

    opengl_camera_rotation_clamp();
}

void opengl_camera_rotation_clamp(void){
    camera.rotate_x = core_clamp_float(
      camera.rotate_x,
      -89,
      89,
      0
    );
    camera.rotate_y = core_clamp_float(
      camera.rotate_y,
      0,
      360,
      1
    );
    camera.rotate_z = core_clamp_float(
      camera.rotate_z,
      0,
      360,
      1
    );
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

void opengl_clearcolor_set(const float red, const float green, const float blue, const float alpha){
    glClearColor(
      red,
      green,
      blue,
      alpha
    );
}

void opengl_entity_bind(const int id){
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
      entities[id].vertices_size,
      entities[id].vertices_array,
      GL_STATIC_DRAW
    );

    glBindBuffer(
      GL_ARRAY_BUFFER,
      vertex_colors[id]
    );
    glEnableVertexAttribArray(shader_vertex_color);
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
      entities[id].vertices_size,
      entities[id].colors_array,
      GL_STATIC_DRAW
    );
}

void opengl_entity_draw(const int id){
    if(!entities[id].draw){
        return;
    }

    if(entities[id].billboard){
        opengl_billboard(
          id,
          FALSE,
          TRUE,
          FALSE
        );
    }

    float temp_matrix[16] = { 0 };
    math_matrix_copy(
      camera_matrix,
      temp_matrix
    );
    math_matrix_translate(
      camera_matrix,
      -entities[id].translate_x,
      -entities[id].translate_y,
      -entities[id].translate_z
    );
    math_matrix_rotate(
      camera_matrix,
      math_degrees_to_radians(entities[id].rotate_x),
      math_degrees_to_radians(entities[id].rotate_y),
      math_degrees_to_radians(entities[id].rotate_z)
    );

    glBindVertexArray(vertex_arrays[id]);
    glBindBuffer(
      GL_ARRAY_BUFFER,
      vertex_buffers[id]
    );

    glUniformMatrix4fv(
      camera_matrix_location,
      1,
      GL_FALSE,
      camera_matrix
    );

    glDrawArrays(
      entities[id].draw_type,
      0,
      entities[id].vertex_count
    );

    math_matrix_copy(
      temp_matrix,
      camera_matrix
    );
}

void opengl_generate_all(void){
    g_free(entities);
    g_free(vertex_arrays);
    g_free(vertex_buffers);

    entities = g_malloc(sizeof(entitystruct) * entity_count);

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

void opengl_load_level(const gchar *filename){
    opengl_camera_origin();

    gchar *content;
    gssize length;

    if(g_file_get_contents(
      filename,
      &content,
      &length,
      NULL
    )){
        struct json_value_s* json_raw = json_parse(
          content,
          length
        );
        struct json_object_s* json_level = (struct json_object_s*)json_raw->payload;

        // Parse clear color.
        struct json_object_element_s* json_object = json_level->start;
        struct json_array_s* json_array = json_object->value->payload;

        struct json_array_element_s* json_array_element = json_array->start;
        struct json_value_s* value = json_array_element->value;
        struct json_number_s* number = (struct json_number_s*)value->payload;
        float red = atof(number->number);

        json_array_element = json_array_element->next;
        value = json_array_element->value;
        number = (struct json_number_s*)value->payload;
        float green = atof(number->number);

        json_array_element = json_array_element->next;
        value = json_array_element->value;
        number = (struct json_number_s*)value->payload;
        float blue = atof(number->number);

        json_array_element = json_array_element->next;
        value = json_array_element->value;
        number = (struct json_number_s*)value->payload;
        float alpha = atof(number->number);

        opengl_clearcolor_set(
          red,
          green,
          blue,
          alpha
        );

        // Parse entities.
        json_object = json_object->next;
        json_array = json_object->value->payload;
        entity_count = (int)json_array->length;

        opengl_generate_all();

        int id;
        json_array_element = json_array->start;
        for(id = 0; id < entity_count; id++){
            if(id != 0){
                json_array_element = json_array_element->next;
            }

            struct json_object_s* json_level_entities_element_property_object = (struct json_object_s*)json_array_element->value->payload;
            struct json_object_element_s* json_level_entities_element_property = json_level_entities_element_property_object->start;

            value = json_level_entities_element_property->value;
            gboolean billboard = value->type == json_type_true ? TRUE : FALSE;

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            gboolean draw = value->type == json_type_true ? TRUE : FALSE;

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            struct json_string_s* string = (struct json_string_s*)value->payload;
            gchar *draw_type = (gchar*)string->string;

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            number = (struct json_number_s*)value->payload;
            float rotate_x = atof(number->number);

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            number = (struct json_number_s*)value->payload;
            float rotate_y = atof(number->number);

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            number = (struct json_number_s*)value->payload;
            float rotate_z = atof(number->number);

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            number = (struct json_number_s*)value->payload;
            float translate_x = atof(number->number);

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            number = (struct json_number_s*)value->payload;
            float translate_y = atof(number->number);

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            number = (struct json_number_s*)value->payload;
            float translate_z = atof(number->number);

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            struct json_array_s* array_payload = (struct json_array_s*)value->payload;

            int vertices_count = (int)array_payload->length / 4;
            int vertices_size = sizeof(GLfloat) * (vertices_count * 4);

            entitystruct entity = {
              billboard,
              g_malloc(vertices_size),
              draw,
              opengl_string_to_primitive(draw_type),
              rotate_x,
              rotate_y,
              rotate_z,
              translate_x,
              translate_y,
              translate_z,
              vertices_count,
              g_malloc(vertices_size),
              vertices_size
            };

            int i;
            struct json_array_element_s* sub_array_element = array_payload->start;
            for(i = 0; i < vertices_count; i++){
                if(i != 0){
                    sub_array_element = sub_array_element->next;
                }

                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.colors_array[i * 4] = atof(number->number);

                sub_array_element = sub_array_element->next;
                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.colors_array[i * 4 + 1] = atof(number->number);

                sub_array_element = sub_array_element->next;
                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.colors_array[i * 4 + 2] = atof(number->number);

                sub_array_element = sub_array_element->next;
                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.colors_array[i * 4 + 3] = atof(number->number);
            }

            json_level_entities_element_property = json_level_entities_element_property->next;
            value = json_level_entities_element_property->value;
            array_payload = (struct json_array_s*)value->payload;

            sub_array_element = array_payload->start;
            for(i = 0; i < vertices_count; i++){
                if(i != 0){
                    sub_array_element = sub_array_element->next;
                }

                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.vertices_array[i * 4] = atof(number->number);

                sub_array_element = sub_array_element->next;
                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.vertices_array[i * 4 + 1] = atof(number->number);

                sub_array_element = sub_array_element->next;
                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.vertices_array[i * 4 + 2] = atof(number->number);

                sub_array_element = sub_array_element->next;
                value = sub_array_element->value;
                number = (struct json_number_s*)value->payload;
                entity.vertices_array[i * 4 + 3] = atof(number->number);
            }

            entities[id] = entity;
            opengl_entity_bind(id);
        }

        g_free(json_raw);
    }

    g_free(content);
}

int opengl_string_to_primitive(const gchar *string){
    if(strcmp(string, "TRIANGLES") == 0){
        return GL_TRIANGLES;

    }else if(strcmp(string, "TRIANGLE_STRIP") == 0){
        return GL_TRIANGLE_STRIP;

    }else if(strcmp(string, "TRIANGLE_FAN") == 0){
        return GL_TRIANGLE_FAN;

    }else if(strcmp(string, "LINE_LOOP") == 0){
        return GL_LINE_LOOP;

    }else if(strcmp(string, "LINE_STRIP") == 0){
        return GL_LINE_STRIP;

    }else if(strcmp(string, "LINES") == 0){
        return GL_LINES;

    }else if(strcmp(string, "POINTS") == 0){
        return GL_POINTS;
    }
}

void realize(GtkGLArea *area){
    gtk_gl_area_make_current(area);

    glewExperimental = GL_TRUE;
    glewInit();

    // Setup GL properties.
    opengl_clearcolor_set(
      0,
      0,
      0,
      0
    );
    gtk_gl_area_set_has_depth_buffer(
      area,
      TRUE
    );
    glEnable(GL_BLEND);
    glEnable(GL_CULL_FACE);

    glBlendFunc(
      GL_SRC_ALPHA,
      GL_ONE_MINUS_SRC_ALPHA
    );
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
    glUseProgram(program);

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

    int id;
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    for(id = 0; id < entity_count; id++){
        opengl_entity_draw(id);
    }

    return TRUE;
}
