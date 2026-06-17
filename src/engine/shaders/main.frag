#version 300 es

precision highp float;

uniform vec3 uColor;
uniform vec3 uLightDir;
uniform sampler2D uTexture;
uniform vec3 uPosition;

in vec3 vNormal;
in vec2 vUV;
in vec3 vWorldPos;

out vec4 outColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDir);
    
    float diffuse = max(0.1, dot(normal, lightDir));
    
    vec3 viewDir = normalize(uPosition - vWorldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    
    float spec = pow(max(0.0, dot(viewDir, reflectDir)), 32.0);
    vec3 specColor = vec3(1.0, 1.0, 1.0);
    
    vec4 texColor = texture(uTexture, vUV);
    vec3 finalColor = (texColor.rgb * diffuse) + (specColor * spec * 0.5);
    
    outColor = vec4(finalColor, texColor.a);
}
