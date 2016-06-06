'use strict';

function clamp(value, min, max){
    var diff = max - min;

    while(value < min){
        value += diff;
    }
    while(value >= max){
        value -= diff;
    }
}

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

function degrees_to_radians(degrees, decimals){
    return round(
      degrees * degree,
      decimals
    );
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
    window.requestAnimationFrame(drawloop);
}

function init_webgl(){
    resize();

    buffer.clearColor(0, 0, 0, 1);
    buffer.clearDepth(1);
    buffer.enable(buffer.CULL_FACE);
    buffer.enable(buffer.DEPTH_TEST);
    buffer.depthFunc(buffer.LEQUAL);

    create_shader(
      'fragment',
      buffer.FRAGMENT_SHADER,
      'precision mediump float;'
      //+ 'varying float float_fogDistance;'
      //+ 'varying vec4 vec_fragmentColor;'
        + 'varying vec2 vec_textureCoord;'
        + 'uniform sampler2D sampler;'
        + 'void main(void){'
      /*
        +   'gl_FragColor = mix('
        +     'vec4('
        +       engine.webgl.clearColor[args['target']][0].toFixed(1) + ','
        +       engine.webgl.clearColor[args['target']][1].toFixed(1) + ','
        +       engine.webgl.clearColor[args['target']][2].toFixed(1) + ','
        +       engine.webgl.clearColor[args['target']][3].toFixed(1)
        +     '),'
        +     'vec_fragmentColor,'
        +     'clamp(exp(-0.001 * float_fogDistance * float_fogDistance), 0.0, 1.0)'
        +   ');'
      */
        +   'gl_FragColor = texture2D('
        +     'sampler,'
        +     'vec_textureCoord.st'
        +   ');'
        + '}'
    );
    create_shader(
      'vertex',
      buffer.VERTEX_SHADER,
      'attribute vec3 vec_vertexPosition;'
      //+ 'attribute vec4 vec_vertexColor;'
        + 'attribute vec2 vec_texturePosition;'
        + 'uniform mat4 mat_cameraMatrix;'
        + 'uniform mat4 mat_perspectiveMatrix;'
      //+ 'varying float float_fogDistance;'
      //+ 'varying vec4 vec_fragmentColor;'
        + 'varying vec2 vec_textureCoord;'
        + 'void main(void){'
        +   'gl_Position = mat_perspectiveMatrix * mat_cameraMatrix * vec4(vec_vertexPosition, 1.0);'
      //+   'vec_fragmentColor = vec_vertexColor;'
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

    matricies['camera'] = matrix_create();
    matrix_perspective();

    set_vertexattribarray('vec_vertexPosition');
    set_vertexattribarray('vec_texturePosition');

    if(typeof logic === 'function'){
        window.requestAnimationFrame(drawloop);
        window.setInterval(
          logicloop,
          30
        );
    }
}

function logicloop(){
    for(var entity in entities){
        if(entities[entity]['logic']){
            entities[entity]['logic']();
        }
    }

    logic();
}

function matrix_clone(id, newid){
    matricies[newid] = matrix_create();
    matrix_copy(
      id,
      newid
    );
}

function matrix_copy(id, newid){
    for(var key in matricies[id]){
        matricies[newid][key] = matricies[id][key];
    }
}

function matrix_create(){
    return new Float32Array(16);
}

function matrix_identity(id){
    for(var key in matricies[id]){
        matricies[id][key] =
          key % 5 === 0
            ? 1
            : 0;
    }
}

function matrix_perspective(){
    matricies['perspective'] = matrix_create();

    matricies['perspective'][0] = .5;
    matricies['perspective'][5] = 1;
    matricies['perspective'][10] = -1;
    matricies['perspective'][11] = -1;
    matricies['perspective'][14] = -2;
}

function matrix_rotate(id, dimensions){
    // Rotate X.
    matrix_clone(
      id,
      'cache'
    );
    var cosine = Math.cos(dimensions[0]);
    var sine = Math.sin(dimensions[0]);

    matricies[id][4] = matricies['cache'][4] * cosine + matricies['cache'][8] * sine;
    matricies[id][5] = matricies['cache'][5] * cosine + matricies['cache'][9] * sine;
    matricies[id][6] = matricies['cache'][6] * cosine + matricies['cache'][10] * sine;
    matricies[id][7] = matricies['cache'][7] * cosine + matricies['cache'][11] * sine;
    matricies[id][8] = matricies['cache'][8] * cosine - matricies['cache'][4] * sine;
    matricies[id][9] = matricies['cache'][9] * cosine - matricies['cache'][5] * sine;
    matricies[id][10] = matricies['cache'][10] * cosine - matricies['cache'][6] * sine;
    matricies[id][11] = matricies['cache'][11] * cosine - matricies['cache'][7] * sine;

    // Rotate Y.
    matrix_copy(
      id,
      'cache'
    );
    cosine = Math.cos(dimensions[1]);
    sine = Math.sin(dimensions[1]);

    matricies[id][0] = matricies['cache'][0] * cosine - matricies['cache'][8] * sine;
    matricies[id][1] = matricies['cache'][1] * cosine - matricies['cache'][9] * sine;
    matricies[id][2] = matricies['cache'][2] * cosine - matricies['cache'][10] * sine;
    matricies[id][3] = matricies['cache'][3] * cosine - matricies['cache'][11] * sine;
    matricies[id][8] = matricies['cache'][8] * cosine + matricies['cache'][0] * sine;
    matricies[id][9] = matricies['cache'][9] * cosine + matricies['cache'][1] * sine;
    matricies[id][10] = matricies['cache'][10] * cosine + matricies['cache'][2] * sine;
    matricies[id][11] = matricies['cache'][11] * cosine + matricies['cache'][3] * sine;

    // Rotate Z.
    matrix_copy(
      id,
      'cache'
    );
    cosine = Math.cos(dimensions[2]);
    sine = Math.sin(dimensions[2]);

    matricies[id][0] = matricies['cache'][0] * cosine + matricies['cache'][4] * sine;
    matricies[id][1] = matricies['cache'][1] * cosine + matricies['cache'][5] * sine;
    matricies[id][2] = matricies['cache'][2] * cosine + matricies['cache'][6] * sine;
    matricies[id][3] = matricies['cache'][3] * cosine + matricies['cache'][7] * sine;
    matricies[id][4] = matricies['cache'][4] * cosine - matricies['cache'][0] * sine;
    matricies[id][5] = matricies['cache'][5] * cosine - matricies['cache'][1] * sine;
    matricies[id][6] = matricies['cache'][6] * cosine - matricies['cache'][2] * sine;
    matricies[id][7] = matricies['cache'][7] * cosine - matricies['cache'][3] * sine;
}

function matrix_round(id, decimals){
    for(var key in matricies[id]){
        matricies[id][key] = round(
          matricies[id][key],
          decimals
        );
    }
}

function matrix_translate(id, dimensions){
    matricies[id][12] -= matricies[id][0] * dimensions[0]
      + matricies[id][4] * dimensions[1]
      + matricies[id][8] * dimensions[2];
    matricies[id][13] -= matricies[id][1] * dimensions[0]
      + matricies[id][5] * dimensions[1]
      + matricies[id][9] * dimensions[2];
    matricies[id][14] -= matricies[id][2] * dimensions[0]
      + matricies[id][6] * dimensions[1]
      + matricies[id][10] * dimensions[2];
   matricies[id][15] -= matricies[id][3] * dimensions[0]
      + matricies[id][7] * dimensions[1]
      + matricies[id][11] * dimensions[2];

    matrix_round(id);
}

function move_camera(speed, y, strafe){
    strafe = strafe || false;
    var radians = degrees_to_radians(camera['rotate-x'] + (strafe ? 90 : 0));
    camera['x'] += round(speed * Math.sin(radians), 7);
    camera['y'] += y;
    camera['z'] += round(speed * Math.cos(radians), 7);
}

function onpointerlockchange(e){
    pointerlock = document.pointerLockElement === document.getElementById('canvas');
};

function resize(){
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
      camera['rotate-x'] + x,
      0,
      360
    );
    camera['rotate-y'] = clamp(
      camera['rotate-y'] + y,
      0,
      360
    );
    camera['rotate-z'] = clamp(
      camera['rotate-z'] + z,
      0,
      360
    );
}

function round(number, decimals){
    decimals = decimals || 7;

    if(String(number).indexOf('e') >= 0){
        number = Number(number.toFixed(decimals));
    }

    return Number(
      Math.round(number + 'e+' + decimals)
        + 'e-' + decimals
    );
}

function set_buffer(vertexData, textureData, indexData){
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
      'index': indexBuffer,
      'texture': textureBuffer,
      'vertex': vertexBuffer,
    }
}

function set_entity(id, properties){
    entities[id] = properties;

    entities[id]['buffer'] = set_buffer(
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
    entities[entityid]['image'] = new Image();
    entities[entityid]['image'].onload = function(){
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
    };

    entities[entityid]['image'].src = image;
}

function set_vertexattribarray(attribute){
    attributes[attribute] = buffer.getAttribLocation(
      programs['shaders'],
      attribute
    );
    buffer.enableVertexAttribArray(attributes[attribute]);
}

var attributes = {};
var buffer = document.getElementById('buffer').getContext(
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
var camera = {
  'rotate-x': 0,
  'rotate-y': 0,
  'rotate-z': 0,
  'x': 0,
  'y': 0,
  'z': 0,
};
var canvas = document.getElementById('canvas').getContext('2d');
var degree = Math.PI / 180;
var entities = {};
var height = 0;
var matricies = {};
var pointerlock = false;
var programs = {};
var shaders = {};
var texture_default = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAP8A/wD/AAAAAAD///8hKtLYAAAAIklEQVQoz2NwQQMMTkoQIAgBIiNMwIEBAowhwGSECaAnBwAdPj4tFnzwQgAAAABJRU5ErkJggg==';
var width = 0;
var x = 0;
var y = 0;

document.onpointerlockchange = onpointerlockchange;

window.onresize = resize;
