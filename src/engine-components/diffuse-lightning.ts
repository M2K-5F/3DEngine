import type { PolygonTransformer, PolygonTransformUnit } from "../interfaces"
import type { Vector3 } from "../maths/vector3"

export class DiffuseLighting implements PolygonTransformer {
    private direction: Vector3
    
    constructor(direction: Vector3) {
        this.direction = direction.normalize()
    }
    
    transformPolygon(unit: PolygonTransformUnit): boolean {
        const intensity = Math.max(0, this.direction.dot(unit.worldNormal))
        
        unit.lightIntensity = intensity
        
        return true
    }
}