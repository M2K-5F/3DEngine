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
    vec4 texColor = texture(uTexture, vUV);
    
    float diffuse = max(0.1, dot(normal, lightDir));
    
    vec3 viewDir = normalize(uPosition - vWorldPos);
    vec3 halfDir = normalize(lightDir + viewDir); 
    float spec = pow(max(0.0, dot(normal, halfDir)), 64.0);
    vec3 specColor = vec3(1.0, 1.0, 1.0);
    
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.0);
    vec3 fresnelColor = texColor.rgb * 0.5; 
    
    vec3 finalColor = (texColor.rgb * diffuse) + (specColor * spec * 0.8) + (fresnelColor * fresnel);
    
    outColor = vec4(finalColor, texColor.a);
}
