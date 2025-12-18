import { Polygon3 } from "../polygon"
import { Vector } from "../vector"

export function createSphere(centerX: number, centerY: number, centerZ: number, radius: number = 1, segments: number = 16): Polygon3[] {
    const polygons: Polygon3[] = []
    const vertices: Vector[] = []

    for (let i = 0; i <= segments; i++) {
        const lat = Math.PI * i / segments
        const sinLat = Math.sin(lat)
        const cosLat = Math.cos(lat)
        
        for (let j = 0; j <= segments; j++) {
            const lon = 2 * Math.PI * j / segments
            const sinLon = Math.sin(lon)
            const cosLon = Math.cos(lon)
            
            const x = centerX + radius * sinLat * cosLon
            const y = centerY + radius * cosLat
            const z = centerZ + radius * sinLat * sinLon
            
            vertices.push(new Vector(x, y, z))
        }
    }
    
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const first = (i * (segments + 1)) + j
            const second = first + segments + 1
            
            polygons.push(
                new Polygon3(
                    vertices[first],
                    vertices[second],
                    vertices[first + 1]
                ),
                new Polygon3(
                    vertices[first + 1],
                    vertices[second],
                    vertices[second + 1]
                )
            )
        }
    }
    
    return polygons
}