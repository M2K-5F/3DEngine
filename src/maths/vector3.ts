import type { Point3 } from "./point3"

export class Vector3 {
    constructor (
        public x: number,
        public y: number,
        public z: number,
        public w: number = 0,
    ) {}

    add(other: Vector3): Vector3 {
        return new Vector3(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z,
            this.w
        )
    }

    subtract(other: Vector3): Vector3 {
        return new Vector3(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
            this.w
        )
    }

    multiplyScalar(scalar: number): Vector3 {
        return new Vector3(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar,
            this.w
        )
    }

    normalize(): Vector3 {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        if (length > 0) {
            return new Vector3(
                this.x / length,
                this.y / length,
                this.z / length,
                this.w
            )
        }
        return this
    }

    cross(other: Vector3): Vector3 {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
            0
        )
    }

    dot(other: Vector3 | Point3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z
    }
}