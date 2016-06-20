'use strict';

function create_program(id, shaderlist){
    var program = buffer.createProgram();
    for(var shader in shaderlist){
        buffer.attachShader(
          program,
          shaderlist[shader]
        );
    }
    buffer.linkProgram(program);
    buffer.useProgram(program);

    programs[id] = program;
}

function create_shader(id, type, source){
    var shader = buffer.createShader(type);
    buffer.shaderSource(
      shader,
      source
    );
    buffer.compileShader(shader);

    shaders[id] = shader;
}

function draw(){
    buffer.viewport(
      0,
      0,
      buffer.viewportWidth,
      buffer.viewportHeight
    );
    buffer.clear(buffer.COLOR_BUFFER_BIT | buffer.DEPTH_BUFFER_BIT);

    matrix_identity('camera');
    matrix_rotate(
      'camera',
      [
        degrees_to_radians(camera['rotate-x']),
        degrees_to_radians(camera['rotate-y']),
        degrees_to_radians(camera['rotate-z']),
      ]
    );
    matrix_translate(
      'camera',
      [
        camera['x'],
        camera['y'],
        camera['z'],
      ]
    );

    draw_logic();

    for(var entity in entities){
        matrix_clone(
          'camera',
          'cache'
        );

        matrix_translate(
          'camera',
          [
            -entities[entity]['position']['x'],
            -entities[entity]['position']['y'],
            entities[entity]['position']['z'],
          ]
        );
        matrix_rotate(
          'camera',
          [
            degrees_to_radians(entities[entity]['rotate']['x']),
            degrees_to_radians(entities[entity]['rotate']['y']),
            degrees_to_radians(entities[entity]['rotate']['z']),
          ]
        );

        buffer.bindBuffer(
          buffer.ARRAY_BUFFER,
          entities[entity]['buffer']['color']
        );
        buffer.vertexAttribPointer(
          attributes['vec_vertexColor'],
          4,
          buffer.FLOAT,
          false,
          0,
          0
        );

        buffer.bindBuffer(
          buffer.ARRAY_BUFFER,
          entities[entity]['buffer']['vertex']
        );
        buffer.vertexAttribPointer(
          attributes['vec_vertexPosition'],
          3,
          buffer.FLOAT,
          false,
          0,
          0
        );

        buffer.bindBuffer(
          buffer.ARRAY_BUFFER,
          entities[entity]['buffer']['texture']
        );
        buffer.vertexAttribPointer(
          attributes['vec_texturePosition'],
          2,
          buffer.FLOAT,
          false,
          0,
          0
        );

        buffer.activeTexture(buffer.TEXTURE0);
        buffer.bindTexture(
          buffer.TEXTURE_2D,
          entities[entity]['texture']
        );
        buffer.uniform1i(
          buffer.getUniformLocation(
            programs['shaders'],
            'sampler'
          ),
          0
        );

        buffer.bindBuffer(
          buffer.ARRAY_BUFFER,
          entities[entity]['buffer']['index']
        );

        buffer.uniformMatrix4fv(
          buffer.getUniformLocation(
            programs['shaders'],
            'mat_perspectiveMatrix'
          ),
          0,
          matricies['perspective']
        );
        buffer.uniformMatrix4fv(
          buffer.getUniformLocation(
            programs['shaders'],
            'mat_cameraMatrix'
          ),
          0,
          matricies['camera']
        );

        buffer.drawArrays(
          buffer[entities[entity]['mode']],
          0,
          entities[entity]['vertices'].length / 3
        );

        matrix_copy(
          'cache',
          'camera'
        );
    }

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );
}

function drawloop(){
    draw();
    animationFrame = window.requestAnimationFrame(drawloop);
}

function init_webgl(){
    resize();
    setmode(0);
}

function logicloop(){
    for(var entity in entities){
        if(entities[entity]['logic']){
            entities[entity]['logic']();
        }
    }

    logic();
}

function move_camera(speed, y, strafe){
    strafe = strafe || false;
    var radians = -degrees_to_radians(camera['rotate-y'] - (strafe ? 90 : 0));
    camera['x'] += round(speed * Math.sin(radians), 7);
    camera['y'] += y;
    camera['z'] += round(speed * Math.cos(radians), 7);
}

function new_image(src, todo){
    var image = new Image();
    image.onload = todo || function(){};
    image.src = src;
    return image;
}

function onpointerlockchange(event){
    pointerlock = document.pointerLockElement === document.getElementById('canvas');
};

function resize(){
    if(mode <= 0){
        return;
    }

    height = window.innerHeight;
    document.getElementById('buffer').height = height;
    document.getElementById('canvas').height = height;
    y = height / 2;

    width = window.innerWidth;
    document.getElementById('buffer').width = width;
    document.getElementById('canvas').width = width;
    x = width / 2;

    buffer.viewportHeight = height;
    buffer.viewportWidth = width;
    buffer.viewport(0, 0, height, width);

    if(typeof resize_logic === 'function'){
        resize_logic();
    }
}

function rotate_camera(x, y, z){
    camera['rotate-x'] = clamp(
      round(
        camera['rotate-x'] + x,
        7
      ),
      0,
      360
    );
    camera['rotate-y'] = clamp(
      round(
        camera['rotate-y'] + y,
        7
      ),
      0,
      360
    );
    camera['rotate-z'] = clamp(
      round(
        camera['rotate-z'] + z,
        7
      ),
      0,
      360
    );
}

function setmode(newmode, newgame){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    camera = {};
    mode = newmode;
    var msperframe = 0;
    newgame = newgame || false;
    programs = {};
    shaders = {};

    if(typeof setmode_logic === 'function'){
        setmode_logic(newgame);

    }else{
        mode = 1;
        newgame = true;
        msperframe = 33;
    }

    // Main menu mode.
    if(mode === 0){
        buffer = 0;
        canvas = 0;

    // Simulation modes.
    }else{
        if(newgame){
            document.body.innerHTML =
              '<canvas id=canvas></canvas><canvas id=buffer></canvas>';

            buffer = document.getElementById('buffer').getContext(
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
            canvas = document.getElementById('canvas').getContext('2d');

            resize();

            buffer.clearColor(
              clearcolor[0],
              clearcolor[1],
              clearcolor[2],
              clearcolor[3]
            );
            buffer.clearDepth(cleardepth);
            buffer.enable(buffer.CULL_FACE);
            buffer.enable(buffer.DEPTH_TEST);
            buffer.depthFunc(buffer.LEQUAL);

            create_shader(
              'fragment',
              buffer.FRAGMENT_SHADER,
              'precision mediump float;'
              //+ 'varying float float_fogDistance;'
                + 'uniform sampler2D sampler;'
                + 'varying vec4 vec_fragmentColor;'
                + 'varying vec2 vec_textureCoord;'
                + 'void main(void){'
              /*+   'gl_FragColor = mix('
                +     'vec4('
                +       engine.webgl.clearColor[args['target']][0].toFixed(1) + ','
                +       engine.webgl.clearColor[args['target']][1].toFixed(1) + ','
                +       engine.webgl.clearColor[args['target']][2].toFixed(1) + ','
                +       engine.webgl.clearColor[args['target']][3].toFixed(1)
                +     '),'
                +     'vec_fragmentColor,'
                +     'clamp(exp(-0.001 * float_fogDistance * float_fogDistance), 0.0, 1.0)'
                +   ');'
              */+   'gl_FragColor = texture2D('
                +     'sampler,'
                +     'vec_textureCoord'
                +   ') * vec_fragmentColor;'
                + '}'
            );
            create_shader(
              'vertex',
              buffer.VERTEX_SHADER,
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

            create_program(
              'shaders',
              [
                shaders['fragment'],
                shaders['vertex'],
              ]
            );

            set_vertexattribarray('vec_vertexColor');
            set_vertexattribarray('vec_vertexPosition');
            set_vertexattribarray('vec_texturePosition');
        }

        camera = {
          'rotate-x': 0,
          'rotate-y': 0,
          'rotate-z': 0,
          'x': 0,
          'y': 0,
          'z': 0,
        };
        matricies['camera'] = matrix_create();
        matrix_perspective();

        if(typeof load_level === 'function'){
            load_level(mode);
        }

        if(typeof draw_logic === 'function'){
            animationFrame = window.requestAnimationFrame(drawloop);
        }

        if(typeof logic === 'function'){
            interval = window.setInterval(
              logicloop,
              msperframe || settings['ms-per-frame']
            );
        }
    }

}

function set_buffer(colorData, vertexData, textureData, indexData){
    var colorBuffer = buffer.createBuffer();
    buffer.bindBuffer(
      buffer.ARRAY_BUFFER,
      colorBuffer
    );
    buffer.bufferData(
      buffer.ARRAY_BUFFER,
      new Float32Array(colorData),
      buffer.STATIC_DRAW
    );

    var vertexBuffer = buffer.createBuffer();
    buffer.bindBuffer(
      buffer.ARRAY_BUFFER,
      vertexBuffer
    );
    buffer.bufferData(
      buffer.ARRAY_BUFFER,
      new Float32Array(vertexData),
      buffer.STATIC_DRAW
    );

    var textureBuffer = buffer.createBuffer();
    buffer.bindBuffer(
      buffer.ARRAY_BUFFER,
      textureBuffer
    );
    buffer.bufferData(
      buffer.ARRAY_BUFFER,
      new Float32Array(textureData),
      buffer.STATIC_DRAW
    );

    var indexBuffer = buffer.createBuffer();
    buffer.bindBuffer(
      buffer.ARRAY_BUFFER,
      indexBuffer
    );
    buffer.bufferData(
      buffer.ARRAY_BUFFER,
      new Uint16Array(indexData),
      buffer.STATIC_DRAW
    );

    return {
      'color': colorBuffer,
      'index': indexBuffer,
      'texture': textureBuffer,
      'vertex': vertexBuffer,
    }
}

function set_entity(id, properties){
    entities[id] = properties;

    entities[id]['buffer'] = set_buffer(
      entities[id]['color'],
      entities[id]['vertices'],
      [
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
      ],
      entities[id]['index']
    );

    set_texture2d(
      id,
      texture_default
    );
}

function set_texture2d(entityid, image){
    entities[entityid]['texture'] = buffer.createTexture();
    entities[entityid]['image'] = new_image(
      image,
      function(){
          buffer.bindTexture(
            buffer.TEXTURE_2D,
            entities[entityid]['texture']
          );
          buffer.texImage2D(
            buffer.TEXTURE_2D,
            0,
            buffer.RGBA,
            buffer.RGBA,
            buffer.UNSIGNED_BYTE,
            entities[entityid]['image']
          );
          buffer.texParameteri(
            buffer.TEXTURE_2D,
            buffer.TEXTURE_MAG_FILTER,
            buffer.NEAREST
          );
          buffer.texParameteri(
            buffer.TEXTURE_2D,
            buffer.TEXTURE_MIN_FILTER,
            buffer.NEAREST
          );
          buffer.bindTexture(
            buffer.TEXTURE_2D,
            void 0
          );
      }
    );
}

function set_vertexattribarray(attribute){
    attributes[attribute] = buffer.getAttribLocation(
      programs['shaders'],
      attribute
    );
    buffer.enableVertexAttribArray(attributes[attribute]);
}

var animationFrame = 0;
var attributes = {};
var buffer = 0;
var camera = {};
var canvas = 0;
var clearcolor = [0, 0, 0, 1];
var cleardepth = 1;
var entities = {};
var height = 0;
var interval = 0;
var matricies = {};
var mode = 0;
var pointerlock = false;
var programs = {};
var shaders = {};
var texture_default = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAP8A/wD/AAAAAAD///8hKtLYAAAAIklEQVQoz2NwQQMMTkoQIAgBIiNMwIEBAowhwGSECaAnBwAdPj4tFnzwQgAAAABJRU5ErkJggg==';
var width = 0;
var x = 0;
var y = 0;

document.onpointerlockchange = onpointerlockchange;
window.onresize = resize;
