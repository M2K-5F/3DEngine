import { Camera } from './engine-components/base-camera'
import { Projector } from './engine-components/base-projector'
import { CanvasRenderer } from './engine-components/canvas-renderer'
import { Engine } from './engine'
import { KeyboardCameraController } from './controllers/keyboard-controller'
import { MouseController } from './controllers/mouse-controller'
import { Point3 } from './maths/point3'
import { Vector3 } from './maths/vector3'
import { GeometryGenerator } from './models/generator'
import { GuyWithPipisi } from './models/guy-with-pipisa'
import { Colors } from './shared/color-constantts'

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


engine.addModel(GuyWithPipisi, {
    position: new Point3(0, 10, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.BLACK
})    


engine.addModel(GuyWithPipisi, {
    position: new Point3(0, 10, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.BLACK
})    

engine.addModel(GuyWithPipisi, {
    position: new Point3(40, 10, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.BLACK
})    

engine.addModel(GuyWithPipisi, {
    position: new Point3(30, 10, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.BLACK
})    

const pisa = engine.addModel(GuyWithPipisi, {
    position: new Point3(20, 10, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.MAGENTA
})    

engine.addModel(GuyWithPipisi, {
    position: new Point3(10, 10, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.BLACK
})    

engine.addModel(GuyWithPipisi, {
    position: new Point3(50, 10, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.CYAN
})    


engine.addModel(GeometryGenerator.createPlane(100, 100), {
    position: new Point3(0, -1, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1),
    color: Colors.GOLD
})    

let x = 1
engine.loop(() => {
    keyboardController.update()    
    x+=0.004
    pisa.setRotation({
        x:x, 
        y: x * 5,
        z:0
    })
})
