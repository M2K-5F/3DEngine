import { Point3 } from "../maths/point3"
import { Polygon3 } from "../maths/polygon3"
import { Vector3 } from "../maths/vector3"
import { ModelController } from "../engine-model-controller"

export const sphere = ( radius: number = 1, segments: number = 16) => {
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
    
    return new ModelController(polygons, {
        position: new Point3(0, 0, 0),
        rotation: {x: 0, y: 0, z: 0},
        scale: new Vector3(1, 1, 1)
    })
    }
