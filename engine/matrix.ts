import { ScreenSettings } from "./interfaces"
import { Vector } from "./vector"

export class Matrix4 {
    constructor(
        private m: number[] = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]
    ) {}

    static translation(tx: number, ty: number, tz: number): Matrix4 {
        return new Matrix4([
            1, 0, 0, tx,
            0, 1, 0, ty,
            0, 0, 1, tz,
            0, 0, 0, 1
        ])
    }

    static rotationY(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            cos,  0, sin,  0,
            0,    1, 0,    0,
            -sin, 0, cos,  0,
            0,    0, 0,    1
        ])
    }

    static rotationX(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            1, 0,    0,    0,
            0, cos, -sin,  0,
            0, sin,  cos,  0,
            0, 0,    0,    1
        ])
    }

    static rotationZ(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            cos, -sin, 0, 0,
            sin,  cos, 0, 0,
            0,    0,   1, 0,
            0,    0,   0, 1
        ])
    }

    static getProjectionMatrix(settings: ScreenSettings): Matrix4 {
        const f = 1 / Math.tan(settings.fov / 2)
        
        return new Matrix4([
            f / settings.aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, -(settings.Zfar + settings.Znear) / (settings.Zfar - settings.Znear), -(2 * settings.Zfar * settings.Znear) / (settings.Zfar - settings.Znear),
            0, 0, -1, 0
        ])
    }

    static lookAt(eye: Vector, target: Vector, up: Vector): Matrix4 {
        const z = eye.subtract(target).normalize()
        const x = up.cross(z).normalize()
        const y = z.cross(x).normalize()
        
        return new Matrix4([
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            -x.dot(eye), -y.dot(eye), -z.dot(eye), 1
        ])
    }

    transformVector(v: Vector): Vector {
        const x = this.m[0] * v.x + this.m[4] * v.y + this.m[8] * v.z + this.m[12] * v.w
        const y = this.m[1] * v.x + this.m[5] * v.y + this.m[9] * v.z + this.m[13] * v.w
        const z = this.m[2] * v.x + this.m[6] * v.y + this.m[10] * v.z + this.m[14] * v.w
        const w = this.m[3] * v.x + this.m[7] * v.y + this.m[11] * v.z + this.m[15] * v.w

        v.x = x / w
        v.y = y / w
        v.z = z / w
        v.w = w
        return v
    }

    multiply(other: Matrix4): Matrix4 {
        const result = new Array(16).fill(0)
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0
                for (let k = 0; k < 4; k++) {
                    sum += this.m[i * 4 + k] * other.m[k * 4 + j]
                }
                result[i * 4 + j] = sum
            }
        }
        return new Matrix4(result)
    }
}