varying float float_fogDistance;

uniform mat4 mat_cameraMatrix;
uniform mat4 mat_normalMatrix;
uniform mat4 mat_perspectiveMatrix;

attribute vec2 vec_texturePosition;
varying vec2 vec_textureCoord;

varying vec3 vec_lighting;
attribute vec3 vec_vertexNormal;

varying vec4 vec_fragmentColor;
attribute vec4 vec_vertexColor;
attribute vec4 vec_vertexPosition;

void main(void){
    gl_Position = mat_perspectiveMatrix * mat_cameraMatrix * vec_vertexPosition;
    float_fogDistance = length(gl_Position.xyz);
    vec_fragmentColor = vec_vertexColor;
    vec_textureCoord = vec_texturePosition;
    vec4 transformedNormal = mat_normalMatrix * vec4(vec_vertexNormal, 1.0);
    vec_lighting = vec3(
      1,
      1,
      1
    ) + (
      vec3(
        1,
        1,
        1
      ) * max(
        dot(
          transformedNormal.xyz,
          normalize(vec3(0, 1, -.8))
        ),
        0.0
      )
    );
}
