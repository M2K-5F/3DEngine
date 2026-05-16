import type { IProjector, PolygonTransformUnit } from "../interfaces"
import { Matrix4 } from "../maths/matrix4"

type ProjectorConfig = {
    aspect: number
    fov: number
    near: number
    far: number
}

export class Projector implements IProjector {
    private config: ProjectorConfig
    private projectionMatrix = new Matrix4()
    private matrixNeedsUpdate = true
    
    constructor(config: ProjectorConfig) {
        this.config = config
    }

    private _updateMatrix() {
        this.projectionMatrix = Matrix4.getProjectionMatrix(this.config)
        this.matrixNeedsUpdate = false
    }

    transformPolygon(unit: PolygonTransformUnit): boolean {
        if (this.matrixNeedsUpdate) this._updateMatrix()
        unit.polygon = unit.polygon.transformByMatrix(this.projectionMatrix)
    
        return true
    }
}