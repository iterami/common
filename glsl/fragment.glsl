precision mediump float;

uniform float alpha;
varying float float_fogDistance;

uniform sampler2D sampler;

varying vec2 vec_textureCoord;

varying vec3 vec_lighting;

varying vec4 vec_fragmentColor;

void main(void){
    gl_FragColor = mix(
      vec4(
        1,
        1,
        1,
        1
      ),
      vec_fragmentColor,
      clamp(
        exp(-0.0001 * float_fogDistance * float_fogDistance),
        0.0,
        1.0
      )
    ) * texture2D(sampler, vec_textureCoord) * vec4(vec_lighting, 1.0) * alpha;
}
