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
    
    // 1. Базовый свет и блик
    float diffuse = max(0.1, dot(normal, lightDir));
    vec3 viewDir = normalize(uPosition - vWorldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(0.0, dot(viewDir, reflectDir)), 32.0);
    
    // 2. Магия радужного перелива
    // Считаем угол между взглядом и геометрией
    float angle = max(0.0, dot(normal, viewDir));
    
    // Генерируем три разные синусоиды для R, G и B каналов на основе этого угла
    vec3 rainbow;
    rainbow.r = sin(angle * 6.28 + 0.0) * 0.5 + 0.5;
    rainbow.g = sin(angle * 6.28 + 2.0) * 0.5 + 0.5;
    rainbow.b = sin(angle * 6.28 + 4.0) * 0.5 + 0.5;
    
    // Сила радужного напыления на краях модели
    float iridescenceStrength = pow(1.0 - angle, 2.0);
    
    // Смешиваем текстуру с радугой и добавляем стандартный белый блик
    vec3 baseColor = mix(texColor.rgb * diffuse, rainbow, iridescenceStrength * 0.6);
    vec3 finalColor = baseColor + (vec3(1.0) * spec * 0.5);
    
    outColor = vec4(finalColor, texColor.a);
}
