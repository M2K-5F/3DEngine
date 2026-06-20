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
    
    float dotNL = dot(normal, lightDir);
    float diffuse = smoothstep(-0.05, 0.05, dotNL) * 0.8 + 0.2; 
    
    vec3 viewDir = normalize(uPosition - vWorldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float rawSpec = max(0.0, dot(viewDir, reflectDir));
    float spec = step(0.9, pow(rawSpec, 8.0)); 
    
    vec3 specColor = vec3(1.0, 1.0, 1.0);
    
    vec3 finalColor = (texColor.rgb * diffuse) + (specColor * spec * 0.4);
    
    // --- ДОБАВЛЕНИЕ ТУМАНА ---
    // Цвет тумана подгоняем под цвет очистки экрана (у тебя это светло-серый/белый)
    vec3 fogColor = vec3(1.0, 1.0, 1.0); 
    
    // Настройки дистанции
    float fogNear = 15.0; // До 15 метров картинка идеально четкая
    float fogFar = 45.0;  // На 45 метрах объект полностью растворяется в тумане
    
    // Считаем расстояние от камеры до пикселя
    float dist = distance(uPosition, vWorldPos);
    
    // Вычисляем коэффициент смешивания от 0.0 до 1.0
    float fogFactor = clamp((dist - fogNear) / (fogFar - fogNear), 0.0, 1.0);
    
    // Плавно смешиваем твой стилизованный Toon-цвет с цветом тумана
    vec3 finalColorWithFog = mix(finalColor, fogColor, fogFactor);
    
    outColor = vec4(finalColorWithFog, texColor.a);
}
