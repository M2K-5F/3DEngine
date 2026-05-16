import { Point3 } from "./point3"
import type { Vector3 } from "./vector3"

export class Matrix4 {
    constructor(
        private m: number[] = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ] as const 
    ) {}

    static getTranslationMatrix(tx: number, ty: number, tz: number): Matrix4 {
    return new Matrix4([
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1 
    ])
}

    static getRotationYMatrix(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            cos,  0, sin,  0,
            0,    1, 0,    0,
            -sin, 0, cos,  0,
            0,    0, 0,    1
        ])
    }

    static getRotationXMatrix(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            1, 0,    0,    0,
            0, cos, -sin,  0,
            0, sin,  cos,  0,
            0, 0,    0,    1
        ])
    }

    static getRotationZMatrix(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            cos, -sin, 0, 0,
            sin,  cos, 0, 0,
            0,    0,   1, 0,
            0,    0,   0, 1
        ])
    }

    static getProjectionMatrix(settings: {fov: number, aspect: number, far: number, near: number}): Matrix4 {
        const f = 1 / Math.tan(settings.fov / 2)
        return new Matrix4([
            f / settings.aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, settings.far / (settings.far - settings.near), 1,  // +Z в W
            0, 0, -settings.near * settings.far / (settings.far - settings.near), 0
        ])
    }

    static getLookAtMatrix(eye: Point3, target: Point3, up: Vector3): Matrix4 {
        const z = target.subtract(eye).normalize()
        const x = z.cross(up).normalize()
        const y = x.cross(z).normalize()    
        
        return new Matrix4([
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            -x.dot(eye), -y.dot(eye), -z.dot(eye), 1
        ])
    }

    transformPoint(p: Point3): Point3 {
        const x = this.m[0] * p.x + this.m[4] * p.y + this.m[8] * p.z + this.m[12] * p.w
        const y = this.m[1] * p.x + this.m[5] * p.y + this.m[9] * p.z + this.m[13] * p.w
        const z = this.m[2] * p.x + this.m[6] * p.y + this.m[10] * p.z + this.m[14] * p.w
        const w = this.m[3] * p.x + this.m[7] * p.y + this.m[11] * p.z + this.m[15] * p.w
        
        return new Point3(x, y, z, w) 
    }

    multiplyBy(other: Matrix4): Matrix4 {
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

    static getScaleMatrix(x: number, y: number, z: number): Matrix4 {
        return new Matrix4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }
}