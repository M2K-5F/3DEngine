import { EngineModel } from "../engine-model"
import { Point3 } from "../maths/point3"
import { Polygon3 } from "../maths/polygon3"

export class Sphere extends EngineModel {
    constructor( radius: number = 1, segments: number = 16) {
        const polygons: Polygon3[] = []
        const vertices: Point3[] = []

        for (let i = 0; i <= segments; i++) {
            const lat = Math.PI * i / segments
            const sinLat = Math.sin(lat)
            const cosLat = Math.cos(lat)
            
            for (let j = 0; j <= segments; j++) {
                const lon = 2 * Math.PI * j / segments
                const sinLon = Math.sin(lon)
                const cosLon = Math.cos(lon)
                
                const x = radius * sinLat * cosLon
                const y = radius * cosLat
                const z = radius * sinLat * sinLon
                
                vertices.push(new Point3(x, y, z))
            }
        }
        
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const first = (i * (segments + 1)) + j
                const second = first + segments + 1
                
                polygons.push(
                    new Polygon3(
                        vertices[first + 1],
                        vertices[second],
                        vertices[first],
                    ),
                    new Polygon3(
                        vertices[second + 1],
                        vertices[second],
                        vertices[first + 1],
                    )
                )
            }
        }
        
        super(polygons)
    }
}