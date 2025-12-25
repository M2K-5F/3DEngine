import { createDetailedCube, createSphere, EngineModel, GraphicEngine, OJBModel } from './engines/engine'
import {model} from "./Roadster"

const engine = new GraphicEngine({
    fov: 90, 
    scale: 100,
    Znear: 0.1,
    Zfar: 100
})
engine.enableKeyboard()

const sword = new OJBModel(model).convertToEngineModel()



const frame = () => {
    engine.makeFrame((draw) => {
        draw(sword)
    })
    requestAnimationFrame(frame)
}
frame()