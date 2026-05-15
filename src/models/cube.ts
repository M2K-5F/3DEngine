import { EngineModel } from "../engine"
import { Point3 } from "../maths/point"
import { Polygon3 } from "../maths/polygon"


export class Cube extends EngineModel {
    create(size: number = 1): Cube  {
        const half = size / 2
        const polygons: Polygon3[] = []
        
        const vertices = [
            new Point3(-half, -half, -half),
            new Point3( half, -half, -half),
            new Point3( half,  half, -half),
            new Point3(-half,  half, -half),
            new Point3(-half, -half,  half),
            new Point3( half, -half,  half),
            new Point3( half,  half,  half),
            new Point3(-half,  half,  half),
        ]
        
        const faces = [
            [4, 5, 6, 7],
            [1, 0, 3, 2],
            [3, 7, 6, 2],
            [1, 5, 4, 0],
            [5, 1, 2, 6],
            [0, 4, 7, 3],
        ]
        
        for (const face of faces) {
            const [i1, i2, i3, i4] = face
            
            polygons.push(
                new Polygon3(vertices[i1], vertices[i2], vertices[i3]),
                new Polygon3(vertices[i1], vertices[i3], vertices[i4])
            )
        }
        
        return new Cube(polygons)
    }
}