import { ScreenSettings } from "./interfaces"
import { Point } from "./point"

export class Vector {
    constructor (
        public x: number,
        public y: number,
        public z: number,
        public w: number = 1,
    ) {}

    normalizeToScreen(screen: ScreenSettings): Point {
        const x = screen.centerX + this.x * screen.scale
        const y = screen.centerY - this.y * screen.scale
        return new Point(x, y)
    }

    add(other: Vector): Vector {
        return new Vector(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z,
            this.w
        )
    }

    subtract(other: Vector): Vector {
        return new Vector(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
            this.w
        )
    }

    multiplyScalar(scalar: number): Vector {
        return new Vector(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar,
            this.w
        )
    }

    normalize(): Vector {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        if (length > 0) {
            return new Vector(
                this.x / length,
                this.y / length,
                this.z / length,
                this.w
            )
        }
        return this
    }

    cross(other: Vector): Vector {
        return new Vector(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
            this.w
        )
    }

    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y + this.z * other.z
    }
}