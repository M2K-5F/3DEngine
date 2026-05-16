import type { Polygon3 } from "./maths/polygon3"
import type { Vector3 } from "./maths/vector3"

export type PolygonTransformUnit = {
    polygon: Polygon3
    color: string
    lightIntensity: number
    worldNormal: Vector3
}

export interface PolygonTransformer {
    transformPolygon(unit: PolygonTransformUnit): boolean
}


export interface ICamera extends PolygonTransformer {
    rotate(deltaX: number, deltaY: number): void
    move(moveVector: Vector3): void
}

export interface IProjector extends PolygonTransformer {}

export interface IRenderer {
    clearFrame(): void
    addPolygon(unit: PolygonTransformUnit): void
    flushFrame(): void
}

