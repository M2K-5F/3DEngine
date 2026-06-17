export class Mesh {
    constructor(
        public vertices: Float32Array,
        public indices: Uint16Array
    ) {}

    static async fromOBJ(fileUrl: string): Promise<Mesh> {
        const response = await fetch(fileUrl)

        if (!response.ok) {
            throw new Error(`Не удалось загрузить OBJ файл по пути: ${fileUrl}`)
        }
    
        const model = await response.text()
        const rawVertices: number[] = [] 
        const rawNormals: number[] = []  
        const rawUVs: number[] = []
        
        const faces: Array<Array<{ vIdx: number; tIdx: number | null; nIdx: number | null }>> = []
        let hasNormalsInFile = false
        let hasUVsInFile = false

        for (const line of model.split('\n')) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#')) continue

            const parts = trimmed.split(/\s+/)
            const type = parts[0]

            if (type === 'v') {
                rawVertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]))
            } else if (type === 'vt') {
                rawUVs.push(parseFloat(parts[1]), parseFloat(parts[2]))
                hasUVsInFile = true 
            } else if (type === 'vn') {
                rawNormals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]))
                hasNormalsInFile = true
            } else if (type === 'f') {
                const face: Array<{ vIdx: number; tIdx: number | null; nIdx: number | null }> = []
                
                for (let i = 1; i < parts.length; i++) {
                    const idxs = parts[i].split('/')
                    const vIdx = parseInt(idxs[0], 10) - 1 
                    
                    const tIdx = idxs.length >= 2 && idxs[1] ? parseInt(idxs[1], 10) - 1 : null
                    const nIdx = idxs.length >= 3 && idxs[2] ? parseInt(idxs[2], 10) - 1 : null
                    
                    face.push({ vIdx, tIdx, nIdx })
                }
                
                for (let i = 1; i < face.length - 1; i++) {
                    faces.push([face[0], face[i], face[i + 1]])
                }
            }
        }

        const computedNormals = new Float32Array(rawVertices.length)
        if (!hasNormalsInFile) {
            for (const tri of faces) {
            const i0 = tri[0].vIdx * 3; const i1 = tri[1].vIdx * 3; const i2 = tri[2].vIdx * 3
            const ax = rawVertices[i1] - rawVertices[i0]; const ay = rawVertices[i1 + 1] - rawVertices[i0 + 1]; const az = rawVertices[i1 + 2] - rawVertices[i0 + 2]
            const bx = rawVertices[i2] - rawVertices[i0]; const by = rawVertices[i2 + 1] - rawVertices[i0 + 1]; const bz = rawVertices[i2 + 2] - rawVertices[i0 + 2]
            const nx = ay * bz - az * by; const ny = az * bx - ax * bz; const nz = ax * by - ay * bx
            for (const vert of tri) {
                const vi = vert.vIdx * 3
                computedNormals[vi] += nx; computedNormals[vi + 1] += ny; computedNormals[vi + 2] += nz
            }
            }
            for (let i = 0; i < computedNormals.length; i += 3) {
            const nx = computedNormals[i]; const ny = computedNormals[i + 1]; const nz = computedNormals[i + 2]
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
            if (len > 0) { computedNormals[i] /= len; computedNormals[i + 1] /= len; computedNormals[i + 2] /= len }
            }
        }

        const verts: number[] = []
        const idx: number[] = []
        const uniqueVertices = new Map<string, number>()

        for (const tri of faces) {
            for (const vert of tri) {
                const vi = vert.vIdx
                
                const posX = rawVertices[vi * 3]
                const posY = rawVertices[vi * 3 + 1]
                const posZ = rawVertices[vi * 3 + 2]

                let normX = 0, normY = 0, normZ = 0
                if (hasNormalsInFile && vert.nIdx !== null && vert.nIdx >= 0) {
                    normX = rawNormals[vert.nIdx * 3]
                    normY = rawNormals[vert.nIdx * 3 + 1]
                    normZ = rawNormals[vert.nIdx * 3 + 2]
                } else {
                    normX = computedNormals[vi * 3]
                    normY = computedNormals[vi * 3 + 1]
                    normZ = computedNormals[vi * 3 + 2]
                }

                let uvU = 0
                let uvV = 0
                if (hasUVsInFile && vert.tIdx !== null && vert.tIdx >= 0) {
                    uvU = rawUVs[vert.tIdx * 2]
                    uvV = rawUVs[vert.tIdx * 2 + 1]
                }

                const key = `${posX},${posY},${posZ},${normX},${normY},${normZ},${uvU},${uvV}`

                if (uniqueVertices.has(key)) {
                    idx.push(uniqueVertices.get(key)!)
                } else {
                    const newIndex = verts.length / 8
                    
                    verts.push(posX, posY, posZ, normX, normY, normZ, uvU, uvV)
                    
                    uniqueVertices.set(key, newIndex)
                    idx.push(newIndex)
                }
            }
        }

        return new Mesh(new Float32Array(verts), new Uint16Array(idx))
    }


    static async fromGLTF(path: string): Promise<Mesh> {
        const gltf = await (await fetch(path)).json()
        const bin = await (await fetch(path.substring(0, path.lastIndexOf('/') + 1) + gltf.buffers[0].uri)).arrayBuffer()

        const read = (idx: number, Cls: any) => {
            const a = gltf.accessors[idx], v = gltf.bufferViews[a.bufferView]
            return new Cls(bin, (v.byteOffset || 0) + (a.byteOffset || 0), v.byteLength / Cls.BYTES_PER_ELEMENT)
        }

        const prim = gltf.meshes[0].primitives[0]
        const pos = read(prim.attributes.POSITION, Float32Array)
        const norm = read(prim.attributes.NORMAL, Float32Array)
        const ind = read(prim.indices, gltf.accessors[prim.indices].componentType === 5123 ? Uint16Array : Uint32Array)

        const verts = new Float32Array(pos.length * 2)
        for (let i = 0; i < pos.length / 3; i++) {
            verts.set(pos.subarray(i * 3, i * 3 + 3), i * 6)
            verts.set(norm.subarray(i * 3, i * 3 + 3), i * 6 + 3)
        }
        return new Mesh(new Float32Array(verts), new Uint16Array(ind))
    }


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
            // Добавляем пустые UV координаты (U, V)
            verts.push(0.0, 0.0) 
        }

        const idx: number[] = []
        for (let f = 0; f < 6; f++) {
            const o = f * 4
            idx.push(o, o + 1, o + 2, o, o + 2, o + 3)
        }

        return new Mesh(new Float32Array(verts), new Uint16Array(idx))
    }


    static createPlane(width: number = 1, height: number = 1) {
        const w = width / 2
        const h = height / 2
        const verts = new Float32Array([
            // Pos: X, Y, Z    Normal: NX, NY, NZ   UV: U, V
            -w, 0,  h,         0, 1, 0,             0.0, 0.0,
            w, 0,  h,         0, 1, 0,             0.0, 0.0,
            w, 0, -h,         0, 1, 0,             0.0, 0.0,
            -w, 0, -h,         0, 1, 0,             0.0, 0.0
        ])
        const idx = new Uint16Array([0, 1, 2, 0, 2, 3])
        return new Mesh(verts, new Uint16Array(idx))
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

                // Пушим позицию, нормаль и пустые UV
                verts.push(nx * radius, ny * radius, nz * radius, nx, ny, nz, 0.0, 0.0)
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
        return new Mesh(new Float32Array(verts), new Uint16Array(idx))
    }


    static createCylinder(segments: number = 16, radius: number = 0.5, height: number = 1) {
        const verts: number[] = []
        const idx: number[] = []
        const h = height / 2

        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments
            const x = Math.cos(angle)
            const z = -Math.sin(angle)

            verts.push(x * radius,  h, z * radius,   x, 0, z,   0.0, 0.0)
            verts.push(x * radius, -h, z * radius,   x, 0, z,   0.0, 0.0)
        }

        for (let i = 0; i < segments; i++) {
            const first = i * 2
            idx.push(first, first + 1, first + 2)
            idx.push(first + 1, first + 3, first + 2)
        }

        const topCenterIdx = verts.length / 8
        verts.push(0, h, 0,  0, 1, 0,  0.0, 0.0)

        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments
            verts.push(Math.cos(angle) * radius, h, -Math.sin(angle) * radius,  0, 1, 0,  0.0, 0.0)
            if (i > 0) idx.push(topCenterIdx, topCenterIdx + i, topCenterIdx + i + 1)
        }

        const bottomCenterIdx = verts.length / 8
        verts.push(0, -h, 0,  0, -1, 0,  0.0, 0.0)

        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments
            verts.push(Math.cos(angle) * radius, -h, -Math.sin(angle) * radius,  0, -1, 0,  0.0, 0.0)
            if (i > 0) idx.push(bottomCenterIdx, bottomCenterIdx + i + 1, bottomCenterIdx + i)
        }

        return new Mesh(new Float32Array(verts), new Uint16Array(idx))
    }
}
