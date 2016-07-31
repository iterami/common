'use strict';

function webgl_buffer_set(colorData, vertexData, textureData, indexData){
    var colorBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      colorBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Float32Array(colorData),
      webgl_buffer.STATIC_DRAW
    );

    var vertexBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      vertexBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Float32Array(vertexData),
      webgl_buffer.STATIC_DRAW
    );

    var textureBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      textureBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Float32Array(textureData),
      webgl_buffer.STATIC_DRAW
    );

    var indexBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      indexBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Uint16Array(indexData),
      webgl_buffer.STATIC_DRAW
    );

    return {
      'color': colorBuffer,
      'index': indexBuffer,
      'texture': textureBuffer,
      'vertex': vertexBuffer,
    }
}

function webgl_camera_move(speed, y, strafe){
    webgl_camera['y'] += y;
    var movement = math_move_3d(
      speed,
      webgl_camera['rotate-y'],
      strafe
    );
    webgl_camera['x'] += movement['x'];
    webgl_camera['z'] += movement['z'];
}

function webgl_camera_rotate(x, y, z){
    webgl_camera['rotate-x'] = math_clamp(
      math_round(
        webgl_camera['rotate-x'] + x,
        7
      ),
      0,
      360,
      true
    );
    webgl_camera['rotate-y'] = math_clamp(
      math_round(
        webgl_camera['rotate-y'] + y,
        7
      ),
      0,
      360,
      true
    );
    webgl_camera['rotate-z'] = math_clamp(
      math_round(
        webgl_camera['rotate-z'] + z,
        7
      ),
      0,
      360,
      true
    );
}

function webgl_clearcolor_set(color){
    webgl_clearcolor = color;
    webgl_buffer.clearColor(
      color['red'],
      color['green'],
      color['blue'],
      color['alpha']
    );
}

function webgl_draw(){
    webgl_buffer.viewport(
      0,
      0,
      webgl_buffer.viewportWidth,
      webgl_buffer.viewportHeight
    );
    webgl_buffer.clear(webgl_buffer.COLOR_BUFFER_BIT | webgl_buffer.DEPTH_BUFFER_BIT);

    math_matrix_identity('camera');
    math_matrix_rotate(
      'camera',
      [
        math_degrees_to_radians(webgl_camera['rotate-x']),
        math_degrees_to_radians(webgl_camera['rotate-y']),
        math_degrees_to_radians(webgl_camera['rotate-z']),
      ]
    );
    math_matrix_translate(
      'camera',
      [
        webgl_camera['x'],
        webgl_camera['y'],
        webgl_camera['z'],
      ]
    );

    draw_logic();

    for(var entity in webgl_entities){
        math_matrix_clone(
          'camera',
          'cache'
        );

        math_matrix_translate(
          'camera',
          [
            -webgl_entities[entity]['position']['x'],
            -webgl_entities[entity]['position']['y'],
            webgl_entities[entity]['position']['z'],
          ]
        );
        math_matrix_rotate(
          'camera',
          [
            math_degrees_to_radians(webgl_entities[entity]['rotate']['x']),
            math_degrees_to_radians(webgl_entities[entity]['rotate']['y']),
            math_degrees_to_radians(webgl_entities[entity]['rotate']['z']),
          ]
        );

        webgl_buffer.bindBuffer(
          webgl_buffer.ARRAY_BUFFER,
          webgl_entities[entity]['buffer']['color']
        );
        webgl_buffer.vertexAttribPointer(
          webgl_attributes['vec_vertexColor'],
          4,
          webgl_buffer.FLOAT,
          false,
          0,
          0
        );

        webgl_buffer.bindBuffer(
          webgl_buffer.ARRAY_BUFFER,
          webgl_entities[entity]['buffer']['vertex']
        );
        webgl_buffer.vertexAttribPointer(
          webgl_attributes['vec_vertexPosition'],
          3,
          webgl_buffer.FLOAT,
          false,
          0,
          0
        );

        webgl_buffer.bindBuffer(
          webgl_buffer.ARRAY_BUFFER,
          webgl_entities[entity]['buffer']['texture']
        );
        webgl_buffer.vertexAttribPointer(
          webgl_attributes['vec_texturePosition'],
          2,
          webgl_buffer.FLOAT,
          false,
          0,
          0
        );

        webgl_buffer.activeTexture(webgl_buffer.TEXTURE0);
        webgl_buffer.bindTexture(
          webgl_buffer.TEXTURE_2D,
          webgl_entities[entity]['texture']
        );
        webgl_buffer.uniform1i(
          webgl_buffer.getUniformLocation(
            webgl_programs['shaders'],
            'sampler'
          ),
          0
        );

        webgl_buffer.bindBuffer(
          webgl_buffer.ARRAY_BUFFER,
          webgl_entities[entity]['buffer']['index']
        );

        webgl_buffer.uniformMatrix4fv(
          webgl_buffer.getUniformLocation(
            webgl_programs['shaders'],
            'mat_perspectiveMatrix'
          ),
          0,
          math_matrices['perspective']
        );
        webgl_buffer.uniformMatrix4fv(
          webgl_buffer.getUniformLocation(
            webgl_programs['shaders'],
            'mat_cameraMatrix'
          ),
          0,
          math_matrices['camera']
        );

        webgl_buffer.drawArrays(
          webgl_buffer[webgl_entities[entity]['mode']],
          0,
          webgl_entities[entity]['vertices'].length / 3
        );

        math_matrix_copy(
          'cache',
          'camera'
        );
    }

    webgl_canvas.clearRect(
      0,
      0,
      webgl_width,
      webgl_height
    );
    webgl_canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    for(var text in webgl_text){
        for(var property in webgl_text[text]['properties']){
            webgl_canvas[property] = webgl_text[text]['properties'][property];
        }
        webgl_canvas.fillText(
          webgl_text[text]['text'],
          webgl_text[text]['x'],
          webgl_text[text]['y']
        );
    }
}

function webgl_drawloop(){
    webgl_draw();
    webgl_animationFrame = window.requestAnimationFrame(webgl_drawloop);
}

function webgl_entity_set(id, properties){
    properties['color'] = properties['color'] || [
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
    ];
    properties['index'] = properties['index'] || [
      0, 1, 2, 0, 2, 3,
    ];
    properties['mode'] = properties['mode'] || 'TRIANGLE_FAN';
    properties['position'] = properties['position'] || {
      'x': 0,
      'y': 0,
      'z': 0,
    };
    properties['rotate'] = properties['rotate'] || {
      'x': 0,
      'y': 0,
      'z': 0,
    };
    properties['scale'] = properties['scale'] || {
      'x': 1,
      'y': 1,
      'z': 1
    };

    webgl_entities[id] = properties;

    webgl_entities[id]['buffer'] = webgl_buffer_set(
      webgl_entities[id]['color'],
      webgl_entities[id]['vertices'],
      [
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
      ],
      webgl_entities[id]['index']
    );

    webgl_texture_set(
      id,
      webgl_textures['_default']
    );
}

function webgl_group_add(group, entitylist){
    if(!(group in webgl_groups)){
        webgl_groups[group] = {};
    }

    for(var entity in entitylist){
        webgl_groups[group][entitylist[entity]] = true;
    }
}

function webgl_group_modify(grouplist, todo){
    for(var group in grouplist){
        for(var entity in webgl_groups[grouplist[group]]){
            todo(entity);
        }
    }
}

function webgl_group_remove(group, entitylist, delete_empty){
    if(group in webgl_groups){
        for(var entity in entitylist){
            delete webgl_groups[group][entitylist[entity]];
        }
    }

    if((delete_empty || false)
      && webgl_groups[group].length === 0){
        delete webgl_groups[group];
    }
}

function webgl_init(){
    webgl_resize();

    webgl_clearcolor = {
      'alpha': 1,
      'blue': 0,
      'green': 0,
      'red': 0,
    };

    webgl_setmode(0);
}

function webgl_logicloop(){
    for(var entity in webgl_entities){
        if(webgl_entities[entity]['logic']){
            webgl_entities[entity]['logic']();
        }
    }

    logic();
}

function webgl_program_create(id, shaderlist){
    var program = webgl_buffer.createProgram();
    for(var shader in shaderlist){
        webgl_buffer.attachShader(
          program,
          shaderlist[shader]
        );
    }
    webgl_buffer.linkProgram(program);
    webgl_buffer.useProgram(program);

    webgl_programs[id] = program;
}

function webgl_resize(){
    if(webgl_mode <= 0){
        return;
    }

    webgl_height = window.innerHeight;
    document.getElementById('buffer').height = webgl_height;
    document.getElementById('canvas').height = webgl_height;
    webgl_y = webgl_height / 2;

    webgl_width = window.innerWidth;
    document.getElementById('buffer').width = webgl_width;
    document.getElementById('canvas').width = webgl_width;
    webgl_x = webgl_width / 2;

    webgl_buffer.viewportHeight = webgl_height;
    webgl_buffer.viewportWidth = webgl_width;
    webgl_buffer.viewport(0, 0, webgl_height, webgl_width);

    webgl_buffer.font = webgl_fonts['medium'];

    if(typeof resize_logic === 'function'){
        resize_logic();
    }
}

function webgl_setmode(newmode, newgame){
    window.cancelAnimationFrame(webgl_animationFrame);
    window.clearInterval(webgl_interval);

    newgame = newgame || false;
    webgl_camera = {};
    webgl_mode = newmode;
    var msperframe = 0;
    webgl_programs = {};
    webgl_shaders = {};

    if(typeof setmode_logic === 'function'){
        setmode_logic(newgame);

    }else{
        webgl_mode = 1;
        newgame = true;
        msperframe = 33;
    }

    // Main menu mode.
    if(webgl_mode === 0){
        webgl_buffer = 0;
        webgl_canvas = 0;
        return;
    }

    // Simulation modes.
    if(newgame){
        var properties = '';

        if(!webgl_oncontextmenu){
            properties = ' oncontextmenu="return false" ';
        }

        document.body.innerHTML =
          '<canvas id=canvas ' + properties + '></canvas><canvas id=buffer></canvas>';

        webgl_buffer = document.getElementById('buffer').getContext(
          'webgl',
          {
            'alpha': false,
            'antialias': true,
            'depth': true,
            'preserveDrawingBuffer': false,
            'premultipliedAlpha': false,
            'stencil': false,
          }
        );
        webgl_canvas = document.getElementById('canvas').getContext('2d');

        webgl_resize();

        webgl_clearcolor_set(webgl_clearcolor);
        webgl_buffer.clearDepth(webgl_cleardepth);
        webgl_buffer.enable(webgl_buffer.CULL_FACE);
        webgl_buffer.enable(webgl_buffer.DEPTH_TEST);
        webgl_buffer.depthFunc(webgl_buffer.LEQUAL);

        webgl_shader_create(
          'fragment',
          webgl_buffer.FRAGMENT_SHADER,
          'precision mediump float;'
          //+ 'varying float float_fogDistance;'
            + 'uniform sampler2D sampler;'
            + 'varying vec4 vec_fragmentColor;'
            + 'varying vec2 vec_textureCoord;'
            + 'void main(void){'
          /*+   'gl_FragColor = mix('
            +     'vec4('
            +       webgl_clearcolor['red'] + ','
            +       webgl_clearcolor['green'] + ','
            +       webgl_clearcolor['blue'] + ','
            +       webgl_clearcolor['alpha']
            +     '),'
            +     'vec_fragmentColor,'
            +     'clamp(exp(-0.001 * float_fogDistance * float_fogDistance), 0.0, 1.0)'
            +   ') * vec_fragmentColor;'
          */+   'gl_FragColor = texture2D('
            +     'sampler,'
            +     'vec_textureCoord'
            +   ') * vec_fragmentColor;'
            + '}'
        );
        webgl_shader_create(
          'vertex',
          webgl_buffer.VERTEX_SHADER,
          'attribute vec3 vec_vertexPosition;'
          //+ 'varying float float_fogDistance;'
            + 'uniform mat4 mat_cameraMatrix;'
            + 'uniform mat4 mat_perspectiveMatrix;'
            + 'varying vec4 vec_fragmentColor;'
            + 'attribute vec4 vec_vertexColor;'
            + 'varying vec2 vec_textureCoord;'
            + 'attribute vec2 vec_texturePosition;'
            + 'void main(void){'
            +   'gl_Position = mat_perspectiveMatrix * mat_cameraMatrix * vec4(vec_vertexPosition, 1.0);'
            +   'vec_fragmentColor = vec_vertexColor;'
          //+   'float_fogDistance = length(gl_Position.xyz);'
            +   'vec_textureCoord = vec_texturePosition;'
            + '}'
        );

        webgl_program_create(
          'shaders',
          [
            webgl_shaders['fragment'],
            webgl_shaders['vertex'],
          ]
        );

        webgl_vertexattribarray_set('vec_vertexColor');
        webgl_vertexattribarray_set('vec_vertexPosition');
        webgl_vertexattribarray_set('vec_texturePosition');
    }

    webgl_camera = {
      'rotate-x': 0,
      'rotate-y': 0,
      'rotate-z': 0,
      'x': 0,
      'y': 0,
      'z': 0,
    };
    math_matrices['camera'] = math_matrix_create();
    math_matrix_perspective();

    if(typeof load_level === 'function'){
        load_level(webgl_mode);
    }

    if(typeof draw_logic === 'function'){
        webgl_animationFrame = window.requestAnimationFrame(webgl_drawloop);
    }

    if(typeof logic === 'function'){
        webgl_interval = window.setInterval(
          webgl_logicloop,
          msperframe || settings['ms-per-frame']
        );
    }

}

function webgl_shader_create(id, type, source){
    var shader = webgl_buffer.createShader(type);
    webgl_buffer.shaderSource(
      shader,
      source
    );
    webgl_buffer.compileShader(shader);

    webgl_shaders[id] = shader;
}

function webgl_texture_set(entityid, image){
    webgl_entities[entityid]['texture'] = webgl_buffer.createTexture();
    webgl_entities[entityid]['image'] = images_new(
      entityid + '-texture',
      image,
      function(){
          webgl_buffer.bindTexture(
            webgl_buffer.TEXTURE_2D,
            webgl_entities[entityid]['texture']
          );
          webgl_buffer.texImage2D(
            webgl_buffer.TEXTURE_2D,
            0,
            webgl_buffer.RGBA,
            webgl_buffer.RGBA,
            webgl_buffer.UNSIGNED_BYTE,
            webgl_entities[entityid]['image']
          );
          webgl_buffer.texParameteri(
            webgl_buffer.TEXTURE_2D,
            webgl_buffer.TEXTURE_MAG_FILTER,
            webgl_buffer.NEAREST
          );
          webgl_buffer.texParameteri(
            webgl_buffer.TEXTURE_2D,
            webgl_buffer.TEXTURE_MIN_FILTER,
            webgl_buffer.NEAREST
          );
          webgl_buffer.bindTexture(
            webgl_buffer.TEXTURE_2D,
            void 0
          );
      }
    );
}

function webgl_vertexattribarray_set(attribute){
    webgl_attributes[attribute] = webgl_buffer.getAttribLocation(
      webgl_programs['shaders'],
      attribute
    );
    webgl_buffer.enableVertexAttribArray(webgl_attributes[attribute]);
}

var webgl_animationFrame = 0;
var webgl_attributes = {};
var webgl_buffer = 0;
var webgl_camera = {};
var webgl_canvas = 0;
var webgl_clearcolor = {};
var webgl_cleardepth = 1;
var webgl_entities = {};
var webgl_fonts = {
  'big': '300% monospace',
  'medium': '200% monospace',
  'small': '100% monospace',
};
var webgl_groups = {};
var webgl_height = 0;
var webgl_interval = 0;
var webgl_mode = 0;
var webgl_oncontextmenu = true;
var webgl_programs = {};
var webgl_shaders = {};
var webgl_text = {};
var webgl_textures = {
  '_debug': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAP8A/wD/AAAAAAD///8hKtLYAAAAIklEQVQoz2NwQQMMTkoQIAgBIiNMwIEBAowhwGSECaAnBwAdPj4tFnzwQgAAAABJRU5ErkJggg==',
  '_default': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
};
var webgl_width = 0;
var webgl_x = 0;
var webgl_y = 0;

window.onresize = webgl_resize;
