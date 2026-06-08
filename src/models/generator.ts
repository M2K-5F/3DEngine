import { EngineModel } from "../engine-model";


export class GeometryGenerator {
    static createCube(size: number = 1) {
        const h = size / 2
        const rawVerts = [
            -h,-h, h,  -h, h, h,   h, h, h,   h,-h, h, 
            -h,-h,-h,  -h, h,-h,   h, h,-h,   h,-h,-h, 
            -h, h,-h,  -h, h, h,   h, h, h,   h, h,-h, 
            -h,-h,-h,  -h,-h, h,   h,-h, h,   h,-h,-h, 
            h,-h,-h,   h, h,-h,   h, h, h,   h,-h, h, 
            -h,-h,-h,  -h, h,-h,  -h, h, h,  -h,-h, h  
        ]

        const normals = [
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1,
            0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
            0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,
            1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0
        ]

        const verts: number[] = []
        for (let i = 0; i < rawVerts.length / 3; i++) {
            verts.push(rawVerts[i*3], rawVerts[i*3+1], rawVerts[i*3+2])
            verts.push(normals[i*3], normals[i*3+1], normals[i*3+2])
        }

        const idx: number[] = []
        for (let f = 0; f < 6; f++) {
            const o = f * 4
            idx.push(o, o + 1, o + 2, o, o + 2, o + 3)
        }

        return new EngineModel({ vertices: new Float32Array(verts), indices: new Uint16Array(idx) })
    }

    static createPlane(width: number = 1, height: number = 1) {
        const w = width / 2
        const h = height / 2
        const verts = new Float32Array([
            -w, 0,  h,   0, 1, 0,
            w, 0,  h,   0, 1, 0,
            w, 0, -h,   0, 1, 0,
            -w, 0, -h,   0, 1, 0
        ])
        const idx = new Uint16Array([0, 1, 2, 0, 2, 3])
        return new EngineModel({ vertices: verts, indices: idx })
    }

    static createSphere(subdivisions: number = 24, radius: number = 1) {
        const verts: number[] = []
        const idx: number[] = []

        for (let lat = 0; lat <= subdivisions; lat++) {
            const theta = (lat * Math.PI) / subdivisions
            const sinTheta = Math.sin(theta)
            const cosTheta = Math.cos(theta)

            for (let lon = 0; lon <= subdivisions; lon++) {
                const phi = (lon * 2 * Math.PI) / subdivisions
                const nx = Math.cos(phi) * sinTheta
                const ny = cosTheta
                const nz = -Math.sin(phi) * sinTheta

                verts.push(nx * radius, ny * radius, nz * radius, nx, ny, nz)
            }
        }

        for (let lat = 0; lat < subdivisions; lat++) {
            for (let lon = 0; lon < subdivisions; lon++) {
                const first = lat * (subdivisions + 1) + lon
                const second = first + subdivisions + 1

                if (lat === 0) {
                    idx.push(first, second, second + 1)
                } else if (lat === subdivisions - 1) {
                    idx.push(first, second, first + 1)
                } else {
                    idx.push(first, second, first + 1)
                    idx.push(second, second + 1, first + 1)
                }
            }
        }
        return new EngineModel({ vertices: new Float32Array(verts), indices: new Uint16Array(idx) })
    }

    static createCylinder(segments: number = 16, radius: number = 0.5, height: number = 1) {
        const verts: number[] = []
        const idx: number[] = []
        const h = height / 2

        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments
            const x = Math.cos(angle)
            const z = -Math.sin(angle)

            verts.push(x * radius,  h, z * radius,   x, 0, z)
            verts.push(x * radius, -h, z * radius,   x, 0, z)
        }

        for (let i = 0; i < segments; i++) {
            const first = i * 2
            idx.push(first, first + 1, first + 2)
            idx.push(first + 1, first + 3, first + 2)
        }

        const topCenterIdx = verts.length / 6
        verts.push(0, h, 0,  0, 1, 0)

        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments
            verts.push(Math.cos(angle) * radius, h, -Math.sin(angle) * radius,  0, 1, 0)
            if (i > 0) idx.push(topCenterIdx, topCenterIdx + i, topCenterIdx + i + 1)
        }

        const bottomCenterIdx = verts.length / 6
        verts.push(0, -h, 0,  0, -1, 0)

        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments
            verts.push(Math.cos(angle) * radius, -h, -Math.sin(angle) * radius,  0, -1, 0)
            if (i > 0) idx.push(bottomCenterIdx, bottomCenterIdx + i + 1, bottomCenterIdx + i)
        }

        return new EngineModel({ vertices: new Float32Array(verts), indices: new Uint16Array(idx) })
    }
}
