// obj-loader.ts
import { Polygon3 } from "./polygon";
import { Vector } from "./vector";

export class OBJLoader {
    static async load(url: string): Promise<Polygon3[]> {
        const response = await fetch(url);
        const text = await response.text();
        return this.parse(text);
    }
    
    static parse(objData: string): Polygon3[] {
        const vertices: Vector[] = [];
        const polygons: Polygon3[] = [];
        
        const lines = objData.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) continue;
            
            const parts = trimmed.split(/\s+/);
            if (parts.length === 0) continue;
            
            const type = parts[0];
            
            switch (type) {
                case 'v': // vertex
                    if (parts.length >= 4) {
                        vertices.push(new Vector(
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ));
                    }
                    break;
                    
                case 'f': // face
                    if (parts.length >= 4) {
                        const faceVertices: Vector[] = [];
                        
                        // Обрабатываем все вершины грани
                        for (let i = 1; i < parts.length; i++) {
                            // Формат: vertex/texture/normal (мы берем только vertex)
                            const vertexInfo = parts[i].split('/')[0];
                            const vertexIndex = parseInt(vertexInfo) - 1; // OBJ индексы с 1
                            
                            if (vertexIndex >= 0 && vertexIndex < vertices.length) {
                                faceVertices.push(vertices[vertexIndex]);
                            }
                        }
                        
                        // Преобразуем полигон в треугольники (triangulate)
                        if (faceVertices.length >= 3) {
                            for (let i = 1; i < faceVertices.length - 1; i++) {
                                polygons.push(new Polygon3(
                                    faceVertices[0],
                                    faceVertices[i],
                                    faceVertices[i + 1]
                                ));
                            }
                        }
                    }
                    break;
            }
        }
        
        return polygons;
    }
}