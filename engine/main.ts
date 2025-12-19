import { createDetailedCube, GraphicEngine, OJBModel } from './engines/engine'
import { p } from './model'

const engine = new GraphicEngine()
const sword = new OJBModel(p).convertToEngineModel()



const frame = () => {
    engine.makeFrame((draw) => {
        draw(sword, {angleY: Math.PI / 4 })
    })
    requestAnimationFrame(frame)
}
frame()