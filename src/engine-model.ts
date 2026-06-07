import type { ModelGeometry } from "./interfaces";

export class EngineModel {
    constructor(
        private _geometry: ModelGeometry
    ) {}

    static fromOBJ(model: string): EngineModel {
        const vertices: number[] = []
        const indices: number[] = []
        
        const lines = model.split('\n')
        
        for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith("#")) continue
            
            const parts = trimmed.split(/\s+/)
            const type = parts[0]
            
            if (type === "v") {
                vertices.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                )
            }
            else if (type === "f") {
                const faceIndices: number[] = []
                
                for (let i = 1; i < parts.length; i++) {
                    const vertexIndex = parseInt(parts[i].split("/")[0]) - 1 
                    faceIndices.push(vertexIndex)
                }
                
                if (faceIndices.length === 3) {
                    indices.push(...faceIndices)
                } 
                else if (faceIndices.length === 4) {
                    const [a, b, c, d] = faceIndices
                    indices.push(a, b, c)
                    indices.push(a, c, d)
                }
            }
        }
        
        return new EngineModel({
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices)
        })
    }
    
    get geometry() { return this._geometry }
}