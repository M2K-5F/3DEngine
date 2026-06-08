import type { ModelGeometry } from "./interfaces"

export class EngineModel {
  constructor(private _geometry: ModelGeometry) {}

  static fromOBJ(model: string): EngineModel {
    const rawVertices: number[] = [] 
    const rawNormals: number[] = []  
    
    const faces: Array<Array<{ vIdx: number; nIdx: number | null }>> = []
    let hasNormalsInFile = false

    for (const line of model.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const parts = trimmed.split(/\s+/)
      const type = parts[0]

      if (type === 'v') {
        rawVertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]))
      } else if (type === 'vn') {
        rawNormals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]))
        hasNormalsInFile = true
      } else if (type === 'f') {
        const face: Array<{ vIdx: number; nIdx: number | null }> = []
        
        for (let i = 1; i < parts.length; i++) {
          const idxs = parts[i].split('/')
          const vIdx = parseInt(idxs[0], 10) - 1 
          
          const nIdx = idxs.length >= 3 && idxs[2] ? parseInt(idxs[2], 10) - 1 : null
          face.push({ vIdx, nIdx })
        }
        
        for (let i = 1; i < face.length - 1; i++) {
          faces.push([face[0], face[i], face[i + 1]])
        }
      }
    }

    const computedNormals = new Float32Array(rawVertices.length)

    if (!hasNormalsInFile) {
      for (const tri of faces) {
        const i0 = tri[0].vIdx * 3
        const i1 = tri[1].vIdx * 3
        const i2 = tri[2].vIdx * 3

        const ax = rawVertices[i1] - rawVertices[i0]
        const ay = rawVertices[i1 + 1] - rawVertices[i0 + 1]
        const az = rawVertices[i1 + 2] - rawVertices[i0 + 2]

        const bx = rawVertices[i2] - rawVertices[i0]
        const by = rawVertices[i2 + 1] - rawVertices[i0 + 1]
        const bz = rawVertices[i2 + 2] - rawVertices[i0 + 2]

        const nx = ay * bz - az * by
        const ny = az * bx - ax * bz
        const nz = ax * by - ay * bx

        for (const vert of tri) {
          const vi = vert.vIdx * 3
          computedNormals[vi] += nx
          computedNormals[vi + 1] += ny
          computedNormals[vi + 2] += nz
        }
      }

      for (let i = 0; i < computedNormals.length; i += 3) {
        const nx = computedNormals[i]
        const ny = computedNormals[i + 1]
        const nz = computedNormals[i + 2]
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
        if (len > 0) {
          computedNormals[i] /= len
          computedNormals[i + 1] /= len
          computedNormals[i + 2] /= len
        }
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

        const key = `${posX},${posY},${posZ},${normX},${normY},${normZ}`

        if (uniqueVertices.has(key)) {
          idx.push(uniqueVertices.get(key)!)
        } else {
          const newIndex = verts.length / 6
          verts.push(posX, posY, posZ, normX, normY, normZ)
          uniqueVertices.set(key, newIndex)
          idx.push(newIndex)
        }
      }
    }

    return new EngineModel({
      vertices: new Float32Array(verts),
      indices: new Uint16Array(idx) 
    })
  }


  static async fromGLTF(path: string): Promise<EngineModel> {
    const gltf = await (await fetch(path)).json();
    const bin = await (await fetch(path.substring(0, path.lastIndexOf('/') + 1) + gltf.buffers[0].uri)).arrayBuffer();

    const read = (idx: number, Cls: any) => {
      const a = gltf.accessors[idx], v = gltf.bufferViews[a.bufferView];
      return new Cls(bin, (v.byteOffset || 0) + (a.byteOffset || 0), v.byteLength / Cls.BYTES_PER_ELEMENT);
    };

    const prim = gltf.meshes[0].primitives[0];
    const pos = read(prim.attributes.POSITION, Float32Array);
    const norm = read(prim.attributes.NORMAL, Float32Array);
    const ind = read(prim.indices, gltf.accessors[prim.indices].componentType === 5123 ? Uint16Array : Uint32Array);

    const verts = new Float32Array(pos.length * 2);
    for (let i = 0; i < pos.length / 3; i++) {
      verts.set(pos.subarray(i * 3, i * 3 + 3), i * 6);
      verts.set(norm.subarray(i * 3, i * 3 + 3), i * 6 + 3);
    }

    return new EngineModel({ vertices: verts, indices: new Uint16Array(ind) });
  }

  get geometry() {
    return this._geometry
  }
}
