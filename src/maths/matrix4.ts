import { Point3 } from "./point3"
import type { Vector3 } from "./vector3"


// Column-major left-handed matrix
export class Matrix4 {
    m: Float32Array

    constructor(elements?: ArrayLike<number>) {
        this.m = new Float32Array(16)

        if (elements) {
            this.m.set(elements)
        } else {
            this.m[0] = 1; this.m[5] = 1; this.m[10] = 1; this.m[15] = 1
        }
    }


    transformPoint(p: Point3): Point3 {
        const x = this.m[0] * p.x + this.m[4] * p.y + this.m[8] * p.z + this.m[12] * p.w
        const y = this.m[1] * p.x + this.m[5] * p.y + this.m[9] * p.z + this.m[13] * p.w
        const z = this.m[2] * p.x + this.m[6] * p.y + this.m[10] * p.z + this.m[14] * p.w
        const w = this.m[3] * p.x + this.m[7] * p.y + this.m[11] * p.z + this.m[15] * p.w
        
        return new Point3(x, y, z, w) 
    }


    multiplyBy(other: Matrix4): Matrix4 {
        const a = this.m
        const b = other.m
        
        return new Matrix4([
            a[0]*b[0] + a[4]*b[1] + a[8]*b[2] + a[12]*b[3],
            a[1]*b[0] + a[5]*b[1] + a[9]*b[2] + a[13]*b[3],
            a[2]*b[0] + a[6]*b[1] + a[10]*b[2] + a[14]*b[3],
            a[3]*b[0] + a[7]*b[1] + a[11]*b[2] + a[15]*b[3],

            a[0]*b[4] + a[4]*b[5] + a[8]*b[6] + a[12]*b[7],
            a[1]*b[4] + a[5]*b[5] + a[9]*b[6] + a[13]*b[7],
            a[2]*b[4] + a[6]*b[5] + a[10]*b[6] + a[14]*b[7],
            a[3]*b[4] + a[7]*b[5] + a[11]*b[6] + a[15]*b[7],

            a[0]*b[8] + a[4]*b[9] + a[8]*b[10] + a[12]*b[11],
            a[1]*b[8] + a[5]*b[9] + a[9]*b[10] + a[13]*b[11],
            a[2]*b[8] + a[6]*b[9] + a[10]*b[10] + a[14]*b[11],
            a[3]*b[8] + a[7]*b[9] + a[11]*b[10] + a[15]*b[11],

            a[0]*b[12] + a[4]*b[13] + a[8]*b[14] + a[12]*b[15],
            a[1]*b[12] + a[5]*b[13] + a[9]*b[14] + a[13]*b[15],
            a[2]*b[12] + a[6]*b[13] + a[10]*b[14] + a[14]*b[15],
            a[3]*b[12] + a[7]*b[13] + a[11]*b[14] + a[15]*b[15]
        ])
    }
}

export class MatrixFabric {
    static getScaleMatrix(x: number, y: number, z: number): Matrix4 {
        return new Matrix4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ])
    }


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
            0, 0, settings.far / (settings.far - settings.near), 1,
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
}