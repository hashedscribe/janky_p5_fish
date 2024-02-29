precision highp float;

varying vec2 pos;

void main(){
    vec4 c1 = vec4(0.05, 0.07, 0.2, 1.);
    vec4 c2 = vec4(0.08, 0.01, 0.13, 1.);
    vec4 c =  mix(c1, c2, pos.y);

    gl_FragColor = c;
}