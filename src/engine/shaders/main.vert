#version 300 es

in vec3 aPoint;
in vec3 aNormal;
in vec2 aUV;

uniform mat4 uVP;
uniform mat4 uM;

out vec3 vNormal;
out vec2 vUV;
out vec3 vWorldPos;

void main() {
    vWorldPos = vec3(uM * vec4(aPoint, 1.0));
    vNormal = mat3(uM) * aNormal;
    vUV = aUV;
    gl_Position = (uVP * uM) * vec4(aPoint, 1.0);
}
