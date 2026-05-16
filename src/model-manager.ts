import type { EngineModel } from "./engine-model"
import type { PolygonTransformUnit } from "./interfaces"
import { Matrix4 } from "./maths/matrix4"
import type { Point3 } from "./maths/point3"
import type { Vector3 } from "./maths/vector3"

type ModelConfig = {
    position: Point3
    rotation: { x: number, y: number, z: number }
    scale: Vector3
}


export class ModelManager {
    private matrix = new Matrix4()
    private matrixNeedsUpdate = true

    private _geometry: EngineModel
    private config: ModelConfig
    private _color = 'green'


    constructor(geometry: EngineModel, config: ModelConfig) {
        this._geometry = geometry
        this.config = config
    }

    getTransformedPolygonUnits() {
        if (this.matrixNeedsUpdate) this._updateMatrix()

        return this._geometry.polygons.map((polygon): PolygonTransformUnit => {
            const worldPolygon = polygon.transformByMatrix(this.matrix)

            return {
                polygon: worldPolygon,
                worldNormal: worldPolygon.normal(),
                color: this.color,
                lightIntensity: 0,
            }
        })        
    }


    private _updateMatrix() {
        const { position, rotation, scale } = this.config
        
        let matrix = new Matrix4()
        
        matrix = matrix.multiplyBy(
            Matrix4.getScaleMatrix(scale.x, scale.y, scale.z)
        )

        if (rotation.x) matrix = matrix.multiplyBy(
            Matrix4.getRotationXMatrix(rotation.x)
        )

        if (rotation.y) matrix = matrix.multiplyBy(
            Matrix4.getRotationYMatrix(rotation.y)
        )

        if (rotation.z) matrix = matrix.multiplyBy(
            Matrix4.getRotationZMatrix(rotation.z)
        )

        this.matrix = matrix.multiplyBy(Matrix4.getTranslationMatrix(position.x, position.y, position.z))
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


    get geometry(): EngineModel { return this._geometry }
    get color(): string { return this._color }
}