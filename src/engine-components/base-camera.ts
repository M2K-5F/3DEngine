import type { ICamera, PolygonTransformUnit } from "../interfaces"
import { Matrix4 } from "../maths/matrix4"
import { Point3 } from "../maths/point3"
import { Vector3 } from "../maths/vector3"

export class Camera implements ICamera {
    private viewMatrix = new Matrix4()
    private matrixNeedsUpdate = true
    
    private position = new Point3(0, 0, 1)
    private directions = {
        up: new Vector3(0, 1, 0),
        forward: new Vector3(0, 0, 1),
        right: new Vector3(1, 0, 0),
    }
    private target = new Point3(0, 0, 0)
    private rotation = {horizontal: 0, vertical: 0}
    

    private _updateViewMatrix() {
        this.viewMatrix = Matrix4.getLookAtMatrix(
            this.position, 
            this.target, 
            this.directions.up
        )
    }

    public transformPolygon(unit: PolygonTransformUnit) {
        if (unit.polygon.isBackface(this.position)) return false

        if (this.matrixNeedsUpdate) this._updateViewMatrix()
        unit.polygon = unit.polygon.transformByMatrix(this.viewMatrix)
        if (unit.polygon.center().z < 0.5) return false
        
        return true
    }


    rotate(deltaX: number, deltaY: number) {
        this.rotation.horizontal += deltaX
        this.rotation.vertical += deltaY
        

        this.rotation.vertical = Math.max(
            -Math.PI / 2 + 0.01,
            Math.min(Math.PI / 2 - 0.01, this.rotation.vertical)
        )
        

        this.directions.forward = new Vector3(
            Math.sin(this.rotation.horizontal) * Math.cos(this.rotation.vertical),
            Math.sin(this.rotation.vertical),
            Math.cos(this.rotation.horizontal) * Math.cos(this.rotation.vertical)
        ).normalize()
        
        this.directions.right = this.directions.up.cross(this.directions.forward).normalize()
        
        this.target = this.position.addVector(this.directions.forward)
        
        this.matrixNeedsUpdate = true
    }


    move(moveVector: Vector3) {
        const worldMoveVector = this.directions.right
            .multiplyScalar(moveVector.x)
            .add(
                this.directions.up
                    .multiplyScalar(moveVector.y)
            )
            .add(
                this.directions.forward
                    .multiplyScalar(moveVector.z)
            )
    
        this.position = this.position.addVector(worldMoveVector)
        this.target = this.position.addVector(this.directions.forward)
        this.matrixNeedsUpdate = true
    }


    getPosition() {return this.position}
}