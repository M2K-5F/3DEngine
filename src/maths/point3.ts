import type { Matrix4 } from "./matrix4"
import { Vector3 } from "./vector3"

export class Point3 {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public w: number = 1,
    ) {}

    vectorTo(other: Point3): Vector3 {
        return new Vector3(
            other.x - this.x,
            other.y - this.y,
            other.z - this.z,
            0,
        )
    }
    

    addVector(v: Vector3): Point3 {
        return new Point3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
            this.w
        )
    }

    subtract(other: Point3): Vector3 {
        return new Vector3(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
            0
        )
    }

    transformByMatrix(matrix: Matrix4) {
        return matrix.transformPoint(this)
    }
}