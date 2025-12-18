import { Polygon3 } from "../polygon"
import { Vector } from "../vector"

export function createDetailedCube(centerX: number, centerY: number, centerZ: number, size: number = 1, subdivisions: number = 10): Polygon3[] {
    const polygons: Polygon3[] = []
    const half = size / 2
    
    const faces = [
        { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
        { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
        { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
        { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
        { normal: [1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
        { normal: [-1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] }
    ] as const
    
    const step = size / subdivisions
    
    for (const face of faces) {
        const [nx, ny, nz] = face.normal
        const [ux, uy, uz] = face.u
        const [vx, vy, vz] = face.v
        
        for (let i = 0; i < subdivisions; i++) {
            for (let j = 0; j < subdivisions; j++) {
                // Координаты в пространстве UV грани
                const u1 = -half + i * step
                const u2 = -half + (i + 1) * step
                const v1 = -half + j * step
                const v2 = -half + (j + 1) * step
                
                // Вычисляем 4 вершины квадрата
                const p1 = new Vector(
                    centerX + nx * half + ux * u1 + vx * v1,
                    centerY + ny * half + uy * u1 + vy * v1,
                    centerZ + nz * half + uz * u1 + vz * v1
                )
                
                const p2 = new Vector(
                    centerX + nx * half + ux * u2 + vx * v1,
                    centerY + ny * half + uy * u2 + vy * v1,
                    centerZ + nz * half + uz * u2 + vz * v1
                )
                
                const p3 = new Vector(
                    centerX + nx * half + ux * u2 + vx * v2,
                    centerY + ny * half + uy * u2 + vy * v2,
                    centerZ + nz * half + uz * u2 + vz * v2
                )
                
                const p4 = new Vector(
                    centerX + nx * half + ux * u1 + vx * v2,
                    centerY + ny * half + uy * u1 + vy * v2,
                    centerZ + nz * half + uz * u1 + vz * v2
                )
                
                // Разделяем квадрат на два треугольника
                polygons.push(
                    new Polygon3(p1, p2, p3),
                    new Polygon3(p1, p3, p4)
                )
            }
        }
    }
    
    return polygons
}