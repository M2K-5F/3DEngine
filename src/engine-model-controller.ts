import { Matrix4, MatrixFabric } from "./maths/matrix4"
import { Point3 } from "./maths/point3"
import type { Vector3 } from "./maths/vector3"

export type ModelConfig = {
    position: Point3
    rotation: { x: number, y: number, z: number }
    scale: Vector3
}


export class EngineModelController {
    private matrix = new Matrix4()
    private matrixNeedsUpdate = true

    constructor(
        private config: ModelConfig, 
    ) {}

    
    getMatrix(): Matrix4 {
        if (this.matrixNeedsUpdate) this._updateMatrix()

        return this.matrix
    }


    private _updateMatrix() {
        const { position, rotation, scale } = this.config
        
        let matrix = new Matrix4()
        
        matrix = matrix.multiplyBy(
            MatrixFabric.getScaleMatrix(scale.x, scale.y, scale.z)
        )

        if (rotation.x) matrix = matrix.multiplyBy(
            MatrixFabric.getRotationXMatrix(rotation.x)
        )

        if (rotation.y) matrix = matrix.multiplyBy(
            MatrixFabric.getRotationYMatrix(rotation.y)
        )

        if (rotation.z) matrix = matrix.multiplyBy(
            MatrixFabric.getRotationZMatrix(rotation.z)
        )

        this.matrix = matrix.multiplyBy(MatrixFabric.getTranslationMatrix(position.x, position.y, position.z))
        this.matrixNeedsUpdate = false
    }

    setRotation(rotation: { x: number, y: number, z: number }) {
        this.config.rotation = rotation
        this.matrixNeedsUpdate = true
    }

    updatePosition(newPosition: Point3) {
        this.config.position = newPosition
        this.matrixNeedsUpdate = true
    }
}