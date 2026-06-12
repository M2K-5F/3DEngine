import { Matrix4, MatrixFabric } from "./maths/matrix4"
import { Point3 } from "./maths/point3"
import type { Vector3 } from "./maths/vector3"

export type ModelConfig = {
    position: Point3
    rotation: { x: number, y: number, z: number }
    scale: Vector3
    color: Vector3
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


    getColor() {
        return this.config.color
    }


    private _updateMatrix() {
        const { position, rotation, scale } = this.config
        
        let matrix = MatrixFabric.getTranslationMatrix(position.x, position.y, position.z)
        

        if (rotation.x) matrix = matrix.multiplyBy(
            MatrixFabric.getRotationXMatrix(rotation.x)
        )

        if (rotation.y) matrix = matrix.multiplyBy(
            MatrixFabric.getRotationYMatrix(rotation.y)
        )

        if (rotation.z) matrix = matrix.multiplyBy(
            MatrixFabric.getRotationZMatrix(rotation.z)
        )

        
        matrix = matrix.multiplyBy(
            MatrixFabric.getScaleMatrix(scale.x, scale.y, scale.z)
        )

        this.matrix = matrix
        this.matrixNeedsUpdate = false
    }


    public setRotation(rotation: { x: number, y: number, z: number }) {
        this.config.rotation = rotation
        this.matrixNeedsUpdate = true
    }


    public setPosition(newPosition: Point3) {
        this.config.position = newPosition
        this.matrixNeedsUpdate = true
    }
    

    public setColor(colorVec: Vector3) {
        this.config.color = colorVec
    }
}