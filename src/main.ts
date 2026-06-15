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

const WIDTH = 1400, HEIGHT = 800

const camera = new Camera()
const projector = new Projector({ fov: Math.PI/2, aspect: WIDTH/HEIGHT, near: 0.1, far: 100 })
const renderer = new CanvasRenderer({height: HEIGHT, width: WIDTH})

const engine = new Engine(renderer, camera, projector)

const keyboardSystem = new KeyboardCameraSystem(camera)
const mouseSystem = new MouseSystem(camera)
const moveSystem = new MoveSystem()
const gravitySystem = new GravitySystem(-0.9)

engine.addSystems(keyboardSystem, mouseSystem, gravitySystem, moveSystem)


const world = new World()

const thing = world.createThing(1)

thing.addComponent(new ThingTransform(
    new Point3(0, 10, -10),
    new Vector3(0, 0, 0)
))


thing.addComponent(new ThingVelocity(
    new Vector3(0, 0, 0)
))

thing.addComponent(new ThingMesh(
    Mesh.createSphere(), Colors.GOLD
))


engine.bindWorld(world)

engine.loop(() => {})
