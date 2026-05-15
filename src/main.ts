import { GraphicEngine} from './engine'
import {GuyWithPipisi} from './models/guy-with-pipisa'
import {TigerTank} from './models/tiger-tank'
const engine = new GraphicEngine({
    fov: 90, 
    scale: 100,
    Znear: 0.1,
    Zfar: 100
})
engine.enableKeyboard()
engine.setupMouseControl()


const frame = () => {
    engine.makeFrame(draw => {
        draw(TigerTank)
        draw(TigerTank, {offsetX: 10})
    })
    requestAnimationFrame(frame)
}
frame()