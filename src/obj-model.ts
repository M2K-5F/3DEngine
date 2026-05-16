import { EngineModel } from "./engine-model"
import { Point3 } from "./maths/point3"
import { Polygon3 } from "./maths/polygon3"

export class OJBModel extends EngineModel {
    constructor(model: string) {
        const vertices: Point3[] = []
        const polygons: Polygon3[] = []
        
        const lines = model.split('\n')
        
        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('#')) continue
            
            const parts = trimmed.split(/\s+/)
            if (parts.length === 0) continue
            
            const type = parts[0]
            
            switch (type) {
                case 'v':
                    if (parts.length >= 4) {
                        vertices.push(new Point3(
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ))
                    }
                    break
                    
                case 'f':
                    if (parts.length >= 4) {
                        const faceVertices: Point3[] = [];
                        
                        for (let i = 1; i < parts.length; i++) {
                            const vertexInfo = parts[i].split('/')[0]
                            const vertexIndex = parseInt(vertexInfo) - 1
                            
                            if (vertexIndex >= 0 && vertexIndex < vertices.length) {
                                faceVertices.push(vertices[vertexIndex])
                            }
                        }
                        
                        if (faceVertices.length >= 3) {
                            for (let i = 1; i < faceVertices.length - 1; i++) {
                                polygons.push(new Polygon3(
                                    faceVertices[0],
                                    faceVertices[i],
                                    faceVertices[i + 1]
                                ))
                            }
                        }
                    }
                    break
            }
        }
        
        super(polygons)
    }
}
