import type { Matrix4 } from "./maths/matrix4"
import type { Point3 } from "./maths/point3"
import type { Vector3 } from "./maths/vector3"
import type { World } from "./world"


export interface MatrixGenerator {
    getMatrix(): Matrix4
}


export interface ICamera extends MatrixGenerator {
    rotate(deltaX: number, deltaY: number): void
    move(moveVector: Vector3): void
}

export interface IProjector extends MatrixGenerator {}


export interface IModelController extends MatrixGenerator {
    setRotation(rotation: { x: number, y: number, z: number }): void,
    updatePosition(newPosition: Point3): void
}


export interface IRenderer {
    clearFrame(): void
    render(vp: Matrix4, world: World): void
}


export interface System {
    update(dt: FrameTime, world: World): void
}


export type ValueOf<T> = {prototype: T}


export type FrameTime = number & {__brand: "FrameTime"}