'use strict';

// Required args: colorData, indexData, textureData, vertexData
function webgl_buffer_set(args){
    var colorBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      colorBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Float32Array(args['colorData']),
      webgl_buffer.STATIC_DRAW
    );

    var vertexBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      vertexBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Float32Array(args['vertexData']),
      webgl_buffer.STATIC_DRAW
    );

    var textureBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      textureBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Float32Array(args['textureData']),
      webgl_buffer.STATIC_DRAW
    );

    var indexBuffer = webgl_buffer.createBuffer();
    webgl_buffer.bindBuffer(
      webgl_buffer.ARRAY_BUFFER,
      indexBuffer
    );
    webgl_buffer.bufferData(
      webgl_buffer.ARRAY_BUFFER,
      new Uint16Array(args['indexData']),
      webgl_buffer.STATIC_DRAW
    );

    return {
      'color': colorBuffer,
      'index': indexBuffer,
      'texture': textureBuffer,
      'vertex': vertexBuffer,
    }
}

// Required args: speed, y
// Optional args: strafe
function webgl_camera_move(args){
    args['strafe'] = args['strafe'] || false;

    webgl_camera['y'] += args['y'];
    var movement = math_move_3d(
      args['speed'],
      webgl_camera['rotate-y'],
      args['strafe']
    );
    webgl_camera['x'] += movement['x'];
    webgl_camera['z'] += movement['z'];
}

// Required args: x, y, z
function webgl_camera_rotate(args){
    var axes = {
      'x': args['x'],
      'y': args['y'],
      'z': args['z'],
    };
    for(var axis in axes){
        webgl_camera['rotate-' + axis] = math_clamp(
          math_round(
            webgl_camera['rotate-' + axis] + axes[axis],
            7
          ),
          0,
          360,
          true
        );
    }
}

// Required args: color
function webgl_clearcolor_set(args){
    webgl_clearcolor = args['color'];
    webgl_buffer.clearColor(
      args['color']['red'],
      args['color']['green'],
      args['color']['blue'],
      args['color']['alpha']
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

        if(webgl_entities[entity]['depth_ignore']){
            webgl_buffer.disable(webgl_buffer.DEPTH_TEST);
        }

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

        if(webgl_entities[entity]['depth_ignore']){
            webgl_buffer.enable(webgl_buffer.DEPTH_TEST);
        }

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

    if(webgl_menu){
        webgl_canvas.save();

        webgl_canvas.fillStyle = '#111';
        webgl_canvas.fillRect(
          webgl_x - 125,
          webgl_y - 50,
          250,
          100
        );

        webgl_canvas.fillStyle = '#fff';
        webgl_canvas.font = webgl_fonts['medium'];
        webgl_canvas.textAlign = 'center';
        webgl_canvas.textBaseline = 'middle';
        webgl_canvas.fillText(
          webgl_resume,
          webgl_x,
          webgl_y - 25
        );
        webgl_canvas.fillText(
          webgl_quit,
          webgl_x,
          webgl_y + 25
        );

        webgl_canvas.restore();
    }
}

function webgl_drawloop(){
    webgl_draw();
    webgl_animationFrame = window.requestAnimationFrame(webgl_drawloop);
}

// Required args: id
// Optional args: properties
function webgl_entity_set(args){
    args['properties'] = args['properties'];

    args['properties']['color'] = args['properties']['color'] || [
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
    ];
    args['properties']['depth_ignore'] = args['properties']['depth_ignore'] || false;
    args['properties']['index'] = args['properties']['index'] || [
      0, 1, 2, 0, 2, 3,
    ];
    args['properties']['mode'] = args['properties']['mode'] || 'TRIANGLE_FAN';
    args['properties']['position'] = args['properties']['position'] || {
      'x': 0,
      'y': 0,
      'z': 0,
    };
    args['properties']['rotate'] = args['properties']['rotate'] || {
      'x': 0,
      'y': 0,
      'z': 0,
    };
    args['properties']['scale'] = args['properties']['scale'] || {
      'x': 1,
      'y': 1,
      'z': 1,
    };

    webgl_entities[args['id']] = args['properties'];

    webgl_entities[args['id']]['buffer'] = webgl_buffer_set({
      'colorData': webgl_entities[args['id']]['color'],
      'vertexData': webgl_entities[args['id']]['vertices'],
      'textureData': [
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
      ],
      'indexData': webgl_entities[args['id']]['index'],
    });

    webgl_texture_set({
      'entityid': args['id'],
      'image': webgl_textures['_default'],
    });
}

// Required args: entitylist, group
function webgl_group_add(args){
    if(!(args['group'] in webgl_groups)){
        webgl_groups[args['group']] = {};
    }

    for(var entity in args['entitylist']){
        webgl_groups[args['group']][args['entitylist'][entity]] = true;
    }
}

// Required args: grouplist, todo
function webgl_group_modify(args){
    for(var group in args['grouplist']){
        console.log(args['grouplist'][group],webgl_groups);
        for(var entity in webgl_groups[args['grouplist'][group]]){
            args['todo'](entity);
        }
    }
}

// Required args: delete-empty, entitylist, group
function webgl_group_remove(args){
    if(args['group'] in webgl_groups){
        for(var entity in args['entitylist']){
            delete webgl_groups[args['group']][args['entitylist'][entity]];
        }
    }

    if((args['delete-empty'] || false)
      && webgl_groups[args['group']].length === 0){
        delete webgl_groups[args['group']];
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

    webgl_setmode({
      'newmode': 0,
    });
}

function webgl_logicloop(){
    for(var entity in webgl_entities){
        if(webgl_entities[entity]['logic']){
            webgl_entities[entity]['logic']();
        }
    }

    logic();
}

function webgl_menu_quit(){
    if(webgl_menu){
        webgl_setmode({
          'newmode': 0,
        });
    }
}

function webgl_menu_toggle(){
    webgl_menu = !webgl_menu;
}

// Required args: id, shaderlist
function webgl_program_create(args){
    var program = webgl_buffer.createProgram();
    for(var shader in args['shaderlist']){
        webgl_buffer.attachShader(
          program,
          args['shaderlist'][shader]
        );
    }
    webgl_buffer.linkProgram(program);
    webgl_buffer.useProgram(program);

    webgl_programs[args['id']] = program;
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

// Required args: newmode
// Optional args: newgame
function webgl_setmode(args){
    args['newgame'] = args['newgame'] || false;

    window.cancelAnimationFrame(webgl_animationFrame);
    window.clearInterval(webgl_interval);

    webgl_camera = {
      'rotate-x': 0,
      'rotate-y': 0,
      'rotate-z': 0,
      'x': 0,
      'y': 0,
      'z': 0,
    };
    webgl_menu = false;
    webgl_mode = args['newmode'];
    var msperframe = 0;
    webgl_programs = {};
    webgl_shaders = {};

    if(typeof setmode_logic === 'function'){
        setmode_logic(args['newgame']);

    }else{
        webgl_mode = 1;
        args['newgame'] = true;
        msperframe = 33;
    }

    // Main menu mode.
    if(webgl_mode === 0){
        webgl_buffer = 0;
        webgl_canvas = 0;
        return;
    }

    // Simulation modes.
    if(args['newgame']){
        var properties = '';

        if(!webgl_oncontextmenu){
            properties = ' oncontextmenu="return false" ';
        }

        document.body.innerHTML =
          '<canvas id=canvas' + properties + '></canvas><canvas id=buffer></canvas>';

        webgl_buffer = document.getElementById('buffer').getContext(
          'webgl',
          {
            'alpha': false,
            'antialias': true,
            'depth': true,
            'premultipliedAlpha': false,
            'preserveDrawingBuffer': false,
            'stencil': false,
          }
        );
        webgl_canvas = document.getElementById('canvas').getContext('2d');

        webgl_resize();

        webgl_clearcolor_set({
          'color': webgl_clearcolor,
        });
        webgl_buffer.clearDepth(webgl_cleardepth);
        webgl_buffer.enable(webgl_buffer.CULL_FACE);
        webgl_buffer.enable(webgl_buffer.DEPTH_TEST);
        webgl_buffer.depthFunc(webgl_buffer.LEQUAL);

        webgl_shader_create({
          'id': 'fragment',
          'source': 'precision mediump float;'
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
            + '}',
          'type': webgl_buffer.FRAGMENT_SHADER,
        });
        webgl_shader_create({
          'id': 'vertex',
          'source': 'attribute vec3 vec_vertexPosition;'
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
            + '}',
          'type': webgl_buffer.VERTEX_SHADER,
        });

        webgl_program_create({
          'id': 'shaders',
          'shaderlist': [
            webgl_shaders['fragment'],
            webgl_shaders['vertex'],
          ],
        });

        webgl_vertexattribarray_set({
          'attribute': 'vec_vertexColor',
        });
        webgl_vertexattribarray_set({
          'attribute': 'vec_vertexPosition',
        });
        webgl_vertexattribarray_set({
          'attribute': 'vec_texturePosition',
        });
    }

    math_matrices['camera'] = math_matrix_create();
    math_matrix_perspective();

    for(var entity in webgl_entities){
        if(webgl_entities[entity]['_init'] === true){
            var group = webgl_entities[entity]['_group'] || void 0;

            webgl_entity_set({
              'id': entity,
              'properties': webgl_entities[entity],
            });

            if(group !== void 0){
                webgl_group_add({
                  'entitylist': [
                    entity,
                  ],
                  'id': entity,
                });
            }
        }
    }

    if(typeof load_level === 'function'){
        load_level(webgl_mode);
    }

    if(typeof draw_logic === 'function'){
        webgl_animationFrame = window.requestAnimationFrame(webgl_drawloop);
    }

    if(typeof logic === 'function'){
        webgl_interval = window.setInterval(
          webgl_logicloop,
          msperframe || settings_settings['ms-per-frame']
        );
    }

}

// Required args: id, source, type
function webgl_shader_create(args){
    var shader = webgl_buffer.createShader(args['type']);
    webgl_buffer.shaderSource(
      shader,
      args['source']
    );
    webgl_buffer.compileShader(shader);

    webgl_shaders[args['id']] = shader;
}

// Required args: entityid
// Optional args: image
function webgl_texture_set(args){
    args['image'] = args['image'] || webgl_textures['_default'];

    webgl_entities[args['entityid']]['texture'] = webgl_buffer.createTexture();
    webgl_entities[args['entityid']]['image'] = images_new({
      'id': args['entityid'] + '-texture',
      'src': args['image'],
      'todo': function(){
          webgl_buffer.bindTexture(
            webgl_buffer.TEXTURE_2D,
            webgl_entities[args['entityid']]['texture']
          );
          webgl_buffer.texImage2D(
            webgl_buffer.TEXTURE_2D,
            0,
            webgl_buffer.RGBA,
            webgl_buffer.RGBA,
            webgl_buffer.UNSIGNED_BYTE,
            webgl_entities[args['entityid']]['image']
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
      },
    });
}

// Required args: attribute
function webgl_vertexattribarray_set(args){
    webgl_attributes[args['attribute']] = webgl_buffer.getAttribLocation(
      webgl_programs['shaders'],
      args['attribute']
    );
    webgl_buffer.enableVertexAttribArray(webgl_attributes[args['attribute']]);
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
var webgl_menu = false;
var webgl_mode = 0;
var webgl_oncontextmenu = true;
var webgl_programs = {};
var webgl_quit = 'Q = Main Menu';
var webgl_resume = 'ESC = Resume';
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
