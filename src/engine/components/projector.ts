import type { IProjector } from "../../interfaces"
import { Matrix4, MatrixFabric } from "../../maths/matrix4"

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
        this.projectionMatrix = MatrixFabric.getProjectionMatrix(this.config)
        this.matrixNeedsUpdate = false
    }

    public getMatrix(): Matrix4 {
        if (this.matrixNeedsUpdate) this._updateMatrix()

        return this.projectionMatrix
    }
}