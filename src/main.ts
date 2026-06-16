import { Camera } from './engine/components/camera'
import { Projector } from './engine/components/projector'
import { CanvasRenderer } from './engine/components/renderer'
import { Point3 } from './maths/point3'
import { Vector3 } from './maths/vector3'
import { Colors } from './shared/color-constants'
import { KeyboardCameraSystem } from './systems/keyboard-system'
import { MouseSystem } from './systems/mouse-system'
import { ThingTransform } from './thing/components/transform'
import { ThingVelocity } from './thing/components/velocity'
import { ThingMesh } from './thing/components/mesh'
import { Engine } from './engine/engine'
import { World } from './world'
import { Mesh } from './shared/mesh'
import { MoveSystem } from './systems/move'
import { GravitySystem } from './systems/gravity-system'
import { GuyWithPipisi } from './models/guy-with-pipisa'
import { ThingCollider } from './thing/components/collider'
import { ThingMass } from './thing/components/mass'
import { CollideSystem } from './systems/collide-system'
import { TigerTank } from './models/tiger-tank'

const WIDTH = 1400, HEIGHT = 800

const camera = new Camera()
const projector = new Projector({ fov: Math.PI/2, aspect: WIDTH/HEIGHT, near: 0.1, far: 100 })
const renderer = new CanvasRenderer({height: HEIGHT, width: WIDTH})

const engine = new Engine(renderer, camera, projector)

const keyboardSystem = new KeyboardCameraSystem(camera)
const mouseSystem = new MouseSystem(camera)
const moveSystem = new MoveSystem()
const gravitySystem = new GravitySystem(-0.9)
const collideSystem = new CollideSystem()

engine.addSystems(keyboardSystem, mouseSystem, gravitySystem, moveSystem, collideSystem)


const world = new World()

const a = world.createThing(1)
    .addComponent(new ThingTransform(
        new Point3(-10, 10, -10),
        new Vector3(0, 0, 0)
    ))
    .addComponent(new ThingVelocity(
        new Vector3(1, 0, 0)
    ))
    .addComponent(new ThingMesh(
        TigerTank, Colors.GOLD
    ))
    .addComponent(new ThingCollider({
        type: "sphere",
        radius: 2
    }))
    .addComponent(new ThingMass(10))


    
const b = world.createThing(2)
    .addComponent(new ThingTransform(
        new Point3(10, 10, -10),
        new Vector3(0, 0, 0)
    ))
    .addComponent(new ThingVelocity(
        new Vector3(-1, 0, 0)
    ))
    .addComponent(new ThingMesh(
        Mesh.createSphere(20, 2), Colors.MAGENTA
    ))
    .addComponent(new ThingCollider({
        type: "sphere",
        radius: 2
    }))
    .addComponent(new ThingMass(100))


engine.bindWorld(world)

engine.loop(() => {})
