import {Sphere} from './models/sphere'
import { GuyWithPipisi } from './models/guy-with-pipisa'
import {Cube} from './models/cube'
import { TigerTank } from './models/tiger-tank'
import { Camera } from './engine-components/base-camera'
import { Projector } from './engine-components/base-projector'
import { DiffuseLighting } from './engine-components/diffuse-lightning'
import { CanvasRenderer } from './engine-components/renderers/canvas-renderer'
import { Engine } from './engine'
import { ModelManager } from './model-manager'
import { Point3 } from './maths/point3'
import { Vector3 } from './maths/vector3'
import { KeyboardCameraController } from './controllers/keyboard-controller'
import { MouseController } from './controllers/mouse-controller'


const camera = new Camera()
const keyboardController = new KeyboardCameraController(camera)
const mouseController = new MouseController(camera)

const projector = new Projector({ fov: Math.PI/1.5, aspect: 800/600, near: 0.1, far: 100 })
const lighting = new DiffuseLighting(new Vector3(1, 1, -1).normalize())
const renderer = new CanvasRenderer({
    fov: Math.PI / 2,
    far: 100,
    near: 0.1,
    height: 800,
    width: 1400,
    scale: 100,
})


const engine = new Engine(renderer)
    .addPolygonTransformer(camera)
    .addPolygonTransformer(lighting)
    .addPolygonTransformer(projector)  


const cube = new ModelManager(new Sphere(), {
    position: new Point3(0, 0, 0),
    rotation: {x: 0, y: 0, z: 0},
    scale: new Vector3(1, 1, 1)
})


engine.addModel(cube, 1)    
let ratio = 0

function animate() {
    keyboardController.update()
    ratio = ratio += 0.04
    
    const move = Math.sin(ratio)
    
    cube.setRotation({x: ratio, y: ratio, z: 0})
    cube.updatePosition(new Point3(0, 0, move))
    engine.makeFrame()
    requestAnimationFrame(animate)
}

animate()