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
    camera.rotate_x = math_clamp_float(
      camera.rotate_x,
      -89,
      89,
      0
    );
    camera.rotate_y = math_clamp_float(
      camera.rotate_y,
      0,
      360,
      1
    );
    camera.rotate_z = math_clamp_float(
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

    glUniform1f(
      alpha_location,
      entities[id].alpha
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

void opengl_events_init(GtkWidget *_glarea){
    g_signal_connect_swapped(
      glarea,
      "realize",
      G_CALLBACK(opengl_realize),
      glarea
    );
    g_signal_connect_swapped(
      glarea,
      "render",
      G_CALLBACK(opengl_render),
      NULL
    );
    g_signal_connect_swapped(
      glarea,
      "resize",
      G_CALLBACK(opengl_resize),
      NULL
    );

    gtk_widget_add_events(
      glarea,
      GDK_POINTER_MOTION_MASK
    );
    gtk_widget_add_events(
      glarea,
      GDK_BUTTON_PRESS_MASK
    );
    gtk_widget_add_events(
      glarea,
      GDK_BUTTON_RELEASE_MASK
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

void opengl_group_add(groupstruct *group, entitystruct *entity){
    group->count++;

    entitystruct *entities[group->count];
    int i;

    for(i = 0; i < group->count - 1; i++){
        *entities[i] = group->entities[i];
    }
    entities[group->count - 1] = entity;

    group->entities = g_realloc(
      group->entities,
      sizeof(entities)
    );

    for(i = 0; i < group->count; i++){
        group->entities[i] = *entities[i];
    }

    g_free(entities);
}

void opengl_group_modify(groupstruct *group){
}

void opengl_group_move(groupstruct *oldgroup, entitystruct *entity, groupstruct *newgroup){
    opengl_group_remove(
      oldgroup,
      entity
    );
    opengl_group_add(
      newgroup,
      entity
    );
}

void opengl_group_remove(groupstruct *group, entitystruct *entity){
    group->count--;

    entitystruct *entities[group->count];
    int i;
    int j = 0;

    for(i = 0; i < group->count; i++){
        j++;
        if(&group->entities[j] == entity){
            j++;
        }

        *entities[i] = group->entities[j];
    }

    group->entities = g_realloc(
      group->entities,
      sizeof(entities)
    );

    for(i = 0; i < group->count; i++){
        group->entities[i] = *entities[i];
    }

    g_free(entities);
}

void opengl_group_remove_all(groupstruct *group){
    group->count = 0;

    g_free(group->entities);
}

void opengl_groups_create(const gchar *new_groups[], const int count){
    g_free(groups);

    group_count = count + 1;
    groups = g_malloc(sizeof(groupstruct) * group_count);

    groupstruct group_depthfalse = {
      0,
      NULL,
      "_depthfalse"
    };
    groups[0] = group_depthfalse;

    if(new_groups != NULL){
        int i;
        for(i = 1; i < group_count; i++){
            groupstruct new_group = {
              0,
              NULL,
              (gchar *)new_groups[i]
            };

            groups[i] = new_group;
        }
    }
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
        struct json_object_element_s* json_object = json_level->start;
        struct json_array_element_s* json_array_element;
        struct json_array_s* json_array;
        struct json_number_s* number;
        struct json_value_s* value;

        // Default level values.
        float ambient_blue = 1;
        float ambient_green = 1;
        float ambient_red = 1;
        float camera_speed = .1;
        gchar *camera_type = "free";
        float clearcolor_blue = 0;
        float clearcolor_green = 0;
        float clearcolor_red = 0;
        float directional_blue = 1;
        float directional_green = 1;
        float directional_red = 1;
        float fog_density = .0001;
        float fog_state = FALSE;
        float gravity_acceleration = -.05;
        float gravity_max = -1;
        float multiplier_jump = 1;
        float multiplier_speed = 1;

        // Parse ambient-blue.
        if(strcmp(json_object->name->string, "ambient-blue") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            ambient_blue = atof(number->number);

            json_object = json_object->next;
        }

        // Parse ambient-green.
        if(strcmp(json_object->name->string, "ambient-green") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            ambient_green = atof(number->number);

            json_object = json_object->next;
        }

        // Parse ambient-red.
        if(strcmp(json_object->name->string, "ambient-red") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            ambient_red = atof(number->number);

            json_object = json_object->next;
        }

        // Parse camera-zoom-max.
        if(strcmp(json_object->name->string, "camera-zoom-max") == 0){
            json_object = json_object->next;
        }

        // Parse clearcolor-blue.
        if(strcmp(json_object->name->string, "clearcolor-blue") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            clearcolor_blue = atof(number->number);

            json_object = json_object->next;
        }

        // Parse clearcolor-green.
        if(strcmp(json_object->name->string, "clearcolor-green") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            clearcolor_green = atof(number->number);

            json_object = json_object->next;
        }

        // Parse clearcolor-red.
        if(strcmp(json_object->name->string, "clearcolor-red") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            clearcolor_red = atof(number->number);

            json_object = json_object->next;
        }

        opengl_clearcolor_set(
          clearcolor_red,
          clearcolor_green,
          clearcolor_blue,
          1
        );

        // Parse directional-blue.
        if(strcmp(json_object->name->string, "directional-blue") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            directional_blue = atof(number->number);

            json_object = json_object->next;
        }

        // Parse directional-green.
        if(strcmp(json_object->name->string, "directional-green") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            directional_green = atof(number->number);

            json_object = json_object->next;
        }

        // Parse directional-red.
        if(strcmp(json_object->name->string, "directional-red") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            directional_red = atof(number->number);

            json_object = json_object->next;
        }

        // Parse directional-state.
        if(strcmp(json_object->name->string, "directional-state") == 0){
            json_object = json_object->next;
        }

        // Parse directional-vector.
        if(strcmp(json_object->name->string, "directional-vector") == 0){
            json_object = json_object->next;
        }

        // Parse fog-density.
        if(strcmp(json_object->name->string, "fog-density") == 0){
            json_object = json_object->next;
        }

        // Parse fog-state.
        if(strcmp(json_object->name->string, "fog-state") == 0){
            json_object = json_object->next;
        }

        // Parse gravity-acceleration.
        if(strcmp(json_object->name->string, "gravity-acceleration") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            gravity_acceleration = atof(number->number);

            json_object = json_object->next;
        }

        // Parse gravity-axis.
        if(strcmp(json_object->name->string, "gravity-axis") == 0){
            json_object = json_object->next;
        }

        // Parse gravity-max.
        if(strcmp(json_object->name->string, "gravity-max") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            gravity_max = atof(number->number);

            json_object = json_object->next;
        }

        // Parse jump-movement.
        if(strcmp(json_object->name->string, "jump-movement") == 0){
            json_object = json_object->next;
        }

        // Parse multiplier-jump.
        if(strcmp(json_object->name->string, "multiplier-jump") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            multiplier_jump = atof(number->number);

            json_object = json_object->next;
        }

        // Parse multiplier-speed.
        if(strcmp(json_object->name->string, "multiplier-speed") == 0){
            value = json_object->value;
            number = (struct json_number_s*)value->payload;
            multiplier_speed = atof(number->number);

            json_object = json_object->next;
        }

        // Parse paths.
        if(strcmp(json_object->name->string, "paths") == 0){
            json_object = json_object->next;
        }

        // Parse spawn-rotate-x.
        if(strcmp(json_object->name->string, "spawn-rotate-x") == 0){
            json_object = json_object->next;
        }

        // Parse spawn-rotate-y.
        if(strcmp(json_object->name->string, "spawn-rotate-y") == 0){
            json_object = json_object->next;
        }

        // Parse spawn-rotate-z.
        if(strcmp(json_object->name->string, "spawn-rotate-z") == 0){
            json_object = json_object->next;
        }

        // Parse spawn-translate-x.
        if(strcmp(json_object->name->string, "spawn-translate-x") == 0){
            json_object = json_object->next;
        }

        // Parse spawn-translate-y.
        if(strcmp(json_object->name->string, "spawn-translate-y") == 0){
            json_object = json_object->next;
        }

        // Parse spawn-translate-z.
        if(strcmp(json_object->name->string, "spawn-translate-z") == 0){
            json_object = json_object->next;
        }

        // Parse groups.
        if(strcmp(json_object->name->string, "groups") == 0){
            json_array = json_object->value->payload;
            int group_count = json_array->length;

            int i;
            json_array_element = json_array->start;
            const gchar *groups_array[group_count];
            for(i = 0; i < group_count; i++){
                if(i != 0){
                    json_array_element = json_array_element->next;
                }

                struct json_value_s* group_value = json_object->value;
                struct json_string_s* string = (struct json_string_s*)group_value->payload;

                groups_array[i] = (gchar*)string->string;
            }

            opengl_groups_create(
              groups_array,
              group_count
            );
            g_free(groups_array);

            json_object = json_object->next;

        }else{
            opengl_groups_create(
              NULL,
              0
            );
        }

        opengl_generate_all();

        // Parse entities.
        if(strcmp(json_object->name->string, "entities") == 0){
            json_array = json_object->value->payload;
            entity_count = json_array->length;

            int id;
            json_array_element = json_array->start;
            for(id = 0; id < entity_count; id++){
                if(id != 0){
                    json_array_element = json_array_element->next;
                }

                struct json_object_s* json_level_entities_element_property_object = (struct json_object_s*)json_array_element->value->payload;
                struct json_object_element_s* json_level_entities_element_property = json_level_entities_element_property_object->start;

                // Default entity values.
                float alpha = 1;
                gboolean billboard = FALSE;
                gboolean collides = FALSE;
                gboolean collision = FALSE;
                gboolean draw = TRUE;
                gchar *draw_type = "TRIANGLE_STRIP";
                gboolean gravity = FALSE;
                float rotate_x = 0;
                float rotate_y = 0;
                float rotate_z = 0;
                float scale_x = 1;
                float scale_y = 1;
                float scale_z = 1;
                float translate_x = 0;
                float translate_y = 0;
                float translate_z = 0;

                // Parse id.
                if(strcmp(json_level_entities_element_property->name->string, "id") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse alpha.
                if(strcmp(json_level_entities_element_property->name->string, "alpha") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    alpha = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse attach-offset-x.
                if(strcmp(json_level_entities_element_property->name->string, "attach-offset-x") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse attach-offset-y.
                if(strcmp(json_level_entities_element_property->name->string, "attach-offset-y") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse attach-offset-z.
                if(strcmp(json_level_entities_element_property->name->string, "attach-offset-z") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse attach-to.
                if(strcmp(json_level_entities_element_property->name->string, "attach-to") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse attach-type.
                if(strcmp(json_level_entities_element_property->name->string, "attach-type") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse billboard.
                if(strcmp(json_level_entities_element_property->name->string, "billboard") == 0){
                    value = json_level_entities_element_property->value;
                    billboard = value->type == json_type_false ? FALSE : TRUE;

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse change.
                if(strcmp(json_level_entities_element_property->name->string, "change") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse collide-damage.
                if(strcmp(json_level_entities_element_property->name->string, "collide-damage") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse collide-range-horizontal.
                if(strcmp(json_level_entities_element_property->name->string, "collide-range-horizontal") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse collide-range-vertical.
                if(strcmp(json_level_entities_element_property->name->string, "collide-range-vertical") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse collides.
                if(strcmp(json_level_entities_element_property->name->string, "collides") == 0){
                    value = json_level_entities_element_property->value;
                    collides = value->type == json_type_true ? TRUE : FALSE;

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse collision.
                if(strcmp(json_level_entities_element_property->name->string, "collision") == 0){
                    value = json_level_entities_element_property->value;
                    collision = value->type == json_type_true ? TRUE : FALSE;

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse draw.
                if(strcmp(json_level_entities_element_property->name->string, "draw") == 0){
                    value = json_level_entities_element_property->value;
                    draw = value->type == json_type_true ? TRUE : FALSE;

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse draw-type.
                if(strcmp(json_level_entities_element_property->name->string, "draw-type") == 0){
                    value = json_level_entities_element_property->value;
                    struct json_string_s* string = (struct json_string_s*)value->payload;
                    draw_type = (gchar*)string->string;

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse gravity.
                if(strcmp(json_level_entities_element_property->name->string, "gravity") == 0){
                    value = json_level_entities_element_property->value;
                    gravity = value->type == json_type_true ? TRUE : FALSE;

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse item-amount.
                if(strcmp(json_level_entities_element_property->name->string, "item-amount") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse item-entities.
                if(strcmp(json_level_entities_element_property->name->string, "item-entities") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse item-id.
                if(strcmp(json_level_entities_element_property->name->string, "item-id") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse item-spell.
                if(strcmp(json_level_entities_element_property->name->string, "item-spell") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse item-spellproperties.
                if(strcmp(json_level_entities_element_property->name->string, "item-spellproperties") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse item-stats.
                if(strcmp(json_level_entities_element_property->name->string, "item-stats") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse path-direction.
                if(strcmp(json_level_entities_element_property->name->string, "path-direction") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse path-id.
                if(strcmp(json_level_entities_element_property->name->string, "path-id") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse path-point.
                if(strcmp(json_level_entities_element_property->name->string, "path-point") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse rotate-x.
                if(strcmp(json_level_entities_element_property->name->string, "rotate-x") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    rotate_x = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse rotate-y.
                if(strcmp(json_level_entities_element_property->name->string, "rotate-y") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    rotate_y = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse rotate-z.
                if(strcmp(json_level_entities_element_property->name->string, "rotate-z") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    rotate_z = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse scale-x.
                if(strcmp(json_level_entities_element_property->name->string, "scale-x") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    scale_x = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse scale-y.
                if(strcmp(json_level_entities_element_property->name->string, "scale-y") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    scale_y = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse scale-z.
                if(strcmp(json_level_entities_element_property->name->string, "scale-z") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    scale_z = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse spawn-entity.
                if(strcmp(json_level_entities_element_property->name->string, "spawn-entity") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse spawn-interval-current.
                if(strcmp(json_level_entities_element_property->name->string, "spawn-interval-current") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse spawn-interval-max.
                if(strcmp(json_level_entities_element_property->name->string, "spawn-interval-max") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse speed.
                if(strcmp(json_level_entities_element_property->name->string, "speed") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse texture-id.
                if(strcmp(json_level_entities_element_property->name->string, "texture-id") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse texture-repeat-x.
                if(strcmp(json_level_entities_element_property->name->string, "texture-repeat-x") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse texture-repeat-y.
                if(strcmp(json_level_entities_element_property->name->string, "texture-repeat-y") == 0){
                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse translate-x.
                if(strcmp(json_level_entities_element_property->name->string, "translate-x") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    translate_x = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse translate-y.
                if(strcmp(json_level_entities_element_property->name->string, "translate-y") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    translate_y = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse translate-z.
                if(strcmp(json_level_entities_element_property->name->string, "translate-z") == 0){
                    value = json_level_entities_element_property->value;
                    number = (struct json_number_s*)value->payload;
                    translate_z = atof(number->number);

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                // Parse vertex-colors. Required.
                value = json_level_entities_element_property->value;
                struct json_array_s* array_payload = (struct json_array_s*)value->payload;

                size_t vertices_count = array_payload->length / 4;
                size_t vertices_size = sizeof(GLfloat) * (vertices_count * 4);

                entitystruct entity = {
                  alpha,
                  billboard,
                  g_malloc(vertices_size),
                  draw,
                  opengl_string_to_primitive(draw_type),
                  id,
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

                // Parse vertices. Required.
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

                // Parse groups.
                if(strcmp(json_level_entities_element_property->name->string, "groups") == 0){
                    struct json_array_s* groups_array = json_level_entities_element_property->value->payload;
                    struct json_array_element_s* groups_array_element = groups_array->start;

                    while(groups_array_element != NULL){
                        groups_array_element = groups_array_element->next;

                        int i;
                        for(i = 0; i < group_count; i++){
                            value = groups_array_element->value;
                            struct json_string_s* group_name = (struct json_string_s*)value->payload;

                            if(strcmp(group_name->string, groups[i].id) == 0){
                                opengl_group_add(
                                  &groups[i],
                                  &entities[id]
                                );

                                break;
                            }
                        }
                    }

                    json_level_entities_element_property = json_level_entities_element_property->next;
                }

                opengl_entity_bind(id);
            }

            json_object = json_object->next;
        }

        // Parse prefabs.
        if(strcmp(json_object->name->string, "prefabs") == 0){
            json_object = json_object->next;
        }

        // Parse characters.
        if(strcmp(json_object->name->string, "characters") == 0){
            json_object = json_object->next;
        }

        // Parse randomized.
        if(strcmp(json_object->name->string, "randomized") == 0){
        }

        g_free(json_raw);
    }

    g_free(content);
}

void opengl_logicloop(void){
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

    /*
    // Level logic.

    int i;
    for(id = 0; id < entity_count; id++){
        // Entity logic.
    }
    */

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
}

void opengl_realize(GtkGLArea *area){
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
    glEnable(GL_DEPTH_TEST);

    glBlendFunc(
      GL_SRC_ALPHA,
      GL_ONE_MINUS_SRC_ALPHA
    );
    glCullFace(GL_BACK);

    // Setup shaders.
    GLuint shader_fragment;
    GLuint shader_vertex;

    shader_fragment = glCreateShader(GL_FRAGMENT_SHADER);
    const GLchar *source_fragment =
      //"precision mediump float;"
      "uniform float alpha;"
      "uniform sampler2D sampler;"
      "varying float float_fogDistance;"
      "varying vec2 vec_textureCoord;"
      "varying vec3 vec_lighting;"
      "varying vec4 vec_fragmentColor;"
      "void main(void){"
          "gl_FragColor = vec_fragmentColor * alpha;"
      "}";
    glShaderSource(
      shader_fragment,
      1,
      &source_fragment,
      NULL
    );
    glCompileShader(shader_fragment);

    shader_vertex = glCreateShader(GL_VERTEX_SHADER);
    const GLchar *source_vertex =
      "attribute vec2 vec_texturePosition;"
      "attribute vec3 vec_vertexNormal;"
      "attribute vec4 vec_vertexColor;"
      "attribute vec4 vec_vertexPosition;"
      "uniform mat4 mat_cameraMatrix;"
      "uniform mat4 mat_normalMatrix;"
      "uniform mat4 mat_perspectiveMatrix;"
      "varying float float_fogDistance;"
      "varying vec2 vec_textureCoord;"
      "varying vec3 vec_lighting;"
      "varying vec4 vec_fragmentColor;"
      "void main(void){"
          "gl_Position = mat_cameraMatrix * vec_vertexPosition;"
          "float_fogDistance = length(gl_Position.xyz);"
          "vec_fragmentColor = vec_vertexColor;"
          "vec_textureCoord = vec_texturePosition;"
          "vec4 transformedNormal = mat_normalMatrix * vec4(vec_vertexNormal, 1.0);"
          "vec_lighting = vec3(1, 1, 1);"
      "}";
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

    alpha_location = glGetUniformLocation(
      program,
      "alpha"
    );
    camera_matrix_location = glGetUniformLocation(
      program,
      "mat_cameraMatrix"
    );
    shader_vertex_color = glGetAttribLocation(
      program,
      "vec_vertexColor"
    );
    shader_vertex_position = glGetAttribLocation(
      program,
      "vec_vertexPosition"
    );

    entitystruct camera = {
      1,
      FALSE,
      0,
      FALSE,
      0,
      -1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    };

    repo_init();

    g_timeout_add(
      25,
      (GSourceFunc)opengl_logicloop,
      NULL
    );
}

gboolean opengl_render(GtkGLArea *area, GdkGLContext *context){
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    int id;

    // Draw _depthfalse entities.
    if(groups[0].count > 0){
        glDisable(GL_DEPTH_TEST);

        for(id = 0; id < groups[0].count; id++){
            opengl_entity_draw(groups[0].entities[id].id);
        }

        glEnable(GL_DEPTH_TEST);
    }

    // Draw opaque entities.
    for(id = 0; id < entity_count; id++){
        if(entities[id].alpha == 1){
            opengl_entity_draw(id);
        }
    }

    // Draw transparent entities.
    for(id = 0; id < entity_count; id++){
        if(entities[id].alpha < 1){
            opengl_entity_draw(id);
        }
    }

    return TRUE;
}

void opengl_resize(GtkGLArea *_glarea, int width, int height, gpointer data){
    window_height = height;
    window_width = width;

    glViewport(
      0,
      0,
      window_width,
      window_height
    );

    math_matrix_perspective(
      camera_matrix,
      window_width,
      window_height
    );
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
