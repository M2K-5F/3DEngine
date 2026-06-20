#version 300 es

precision highp float;
uniform vec3 uColor;
uniform vec3 uLightDir;
uniform sampler2D uTexture;
uniform vec3 uPosition; // Позиция камеры, которая у вас уже есть!

in vec3 vNormal;
in vec2 vUV;
in vec3 vWorldPos; // Мировая позиция пикселя, которая у вас уже есть!

out vec4 outColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDir);
    
    // 1. Базовый диффузный свет и текстура
    float diffuse = max(0.1, dot(normal, lightDir));
    
    // Блик Блинна-Фонга (оставляем вашу настроенную инерцию блика)
    vec3 viewDir = normalize(uPosition - vWorldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(0.0, dot(viewDir, reflectDir)), 32.0);
    vec3 specColor = vec3(1.0, 1.0, 1.0);
    
    vec4 texColor = texture(uTexture, vUV);
    vec3 objectColor = (texColor.rgb * diffuse) + (specColor * spec * 0.5);
    
    // --- МАКСИМАЛЬНО ПРОСТОЙ ТУМАН ---
    // Настройки тумана прямо в коде (не нужно прокидывать юниформы)
    vec3 fogColor = vec3(1.0, 1.0, 1.0); // Белый туман (под ваш gl.clearColor(1, 1, 1, 0.5))
    float fogNear = 10.0;                // Расстояние, где туман ТОЛЬКО НАЧИНАЕТСЯ
    float fogFar = 40.0;                 // Расстояние, где объект ПОЛНОСТЬЮ ИСЧЕЗАЕТ в тумане
    
    // Считаем честное расстояние от камеры до этого пикселя в 3D пространстве
    float dist = distance(uPosition, vWorldPos);
    
    // Вычисляем коэффициент тумана (от 0.0 до 1.0)
    // clamp зажмет значение, чтобы оно не улетало в бесконечность
    float fogFactor = clamp((dist - fogNear) / (fogFar - fogNear), 0.0, 1.0);
    
    // Линейно смешиваем (mix) цвет объекта и цвет тумана на основе расстояния
    vec3 finalColor = mix(objectColor, fogColor, fogFactor);
    
    outColor = vec4(finalColor, texColor.a);
}
