import type { EngineModelController } from "./engine-model-controller"
import type { Matrix4 } from "./maths/matrix4"
import type { Point3 } from "./maths/point3"
import type { Vector3 } from "./maths/vector3"


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


export type ModelGeometry = {
    vertices: Float32Array,
    indices: Uint16Array
}


export interface IRenderer {
    clearFrame(): void
    render(vp: Matrix4): void
    addModelGeometry(controller: EngineModelController, geometry: ModelGeometry): void
    removeModelGeometry(controller: EngineModelController): void
}

