import {EngineModel} from './engine-model'

export type ModelSettings = {
    offsetX?: number
    offsetY?: number
    offsetZ?: number
    angleX?: number
    angleY?: number
    angleZ?: number
    color?: `rgb(${number},${number},${number})`
    debugMode?: boolean
}

export type ScreenSettings = {
    centerY?: number
    centerX?: number
    scale: number
    fov: number
    aspect?: number
    Zfar: number
    Znear: number
}

export type EngineDrawer = (model: EngineModel, settings?: ModelSettings) => void