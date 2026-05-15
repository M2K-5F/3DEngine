import { Vector3 }  from './vector'
import {ScreenPixel} from './screen-pixel'
import { ScreenSettings } from '../types'

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

    toScreenPixel(screen: ScreenSettings): ScreenPixel {
        const x = (screen.centerX ?? 450) - this.x * screen.scale
        const y = (screen.centerY ?? 450) + this.y * screen.scale
        return new ScreenPixel(x, y)
    }

    addVector(v: Vector3): Point3 {
        return new Point3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
            this.w
        )
    }
}
