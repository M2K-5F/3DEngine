import { Camera } from './engine-components/base-camera'
import { Projector } from './engine-components/base-projector'
import { CanvasRenderer } from './engine-components/canvas-renderer'
import { Engine } from './engine'
import { KeyboardCameraController } from './controllers/keyboard-controller'
import { MouseController } from './controllers/mouse-controller'
import { Point3 } from './maths/point3'
import { TigerTank } from './models/tiger-tank'
import { Vector3 } from './maths/vector3'

const WIDTH = 1400, HEIGHT = 800

const camera = new Camera()
const keyboardController = new KeyboardCameraController(camera)
new MouseController(camera)

const projector = new Projector({ fov: Math.PI/2, aspect: WIDTH/HEIGHT, near: 0.1, far: 100 })
const renderer = new CanvasRenderer({
    height: HEIGHT,
    width: WIDTH
})


const engine = new Engine(renderer, camera, projector)



const controller = engine.addModel(TigerTank, {
    position: new Point3(0, 0, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1)
})    
let ratio = 0

engine.loop(() => {
    keyboardController.update()
    
    ratio = ratio += 0.04
    const move = Math.sin(ratio)
    
    controller.setRotation({x: ratio, y: ratio, z: 0})
    controller.updatePosition(new Point3(0, 0, move))
})
