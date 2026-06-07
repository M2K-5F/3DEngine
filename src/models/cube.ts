import { EngineModel } from "../engine-model"

export const getCube = (size: number): EngineModel => {
    const half = size / 2
    
    // Уникальные вершины куба (8 штук)
    const vertices = new Float32Array([
        // Передние (z = -half)
        -half, -half, -half,  // 0
         half, -half, -half,  // 1
         half,  half, -half,  // 2
        -half,  half, -half,  // 3
        
        // Задние (z = half)
        -half, -half,  half,  // 4
         half, -half,  half,  // 5
         half,  half,  half,  // 6
        -half,  half,  half,  // 7
    ])
    
    // Индексы для 12 треугольников (36 индексов)
    const indices = new Uint16Array([
        // Передняя грань
        0, 1, 2,
        0, 2, 3,
        
        // Задняя грань
        4, 6, 5,
        4, 7, 6,
        
        // Левая грань
        0, 3, 7,
        0, 7, 4,
        
        // Правая грань
        1, 5, 6,
        1, 6, 2,
        
        // Верхняя грань
        3, 2, 6,
        3, 6, 7,
        
        // Нижняя грань
        0, 4, 5,
        0, 5, 1,
    ])
    
    return new EngineModel({
        vertices: vertices,
        indices: indices
    })
}