import { Camera } from './engine/components/camera'
import { Projector } from './engine/components/projector'
import { Renderer } from './engine/components/renderer'
import { Point3 } from './maths/point3'
import { Vector3 } from './maths/vector3'
import { MouseSystem } from './systems/mouse-system'
import { ThingTransform } from './thing/components/transform'
import { ThingVelocity } from './thing/components/velocity'
import { ThingMesh } from './thing/components/mesh'
import { Mesh } from './shared/mesh'
import { MoveSystem } from './systems/move'
import { GravitySystem } from './systems/gravity-system'
import { ThingCollider } from './thing/components/collider'
import { ThingMass } from './thing/components/mass'
import { CollideSystem } from './systems/collide-system'
import { Colors } from './shared/color-constants'
import { BlazingEngine } from './engine/engine'
import { World } from './world/world'
import { KeyboardCameraSystem } from './systems/keyboard-system'
import { KeyboardTransformSystem, KeyboardTransformTag } from './systems/thing-keyboard-transform-system.ts.'
import { Thing } from './thing/thing'
import { Material } from './shared/material'

function initEngine() {
    const WIDTH = 1400, HEIGHT = 800

    const projector = new Projector({ fov: Math.PI/2, aspect: WIDTH/HEIGHT, near: 0.1, far: 100 })
    const renderer = new Renderer({height: HEIGHT, width: WIDTH, fallbackTextureColor: Colors.PURPLE})   
    const engine = new BlazingEngine(renderer, projector)
    return engine
}


function initWorld() {
    const camera = new Camera()
    const moveSystem = new MoveSystem()
    const gravitySystem = new GravitySystem(-0.9)
    const collideSystem = new CollideSystem()
    const keyboardCameraSystem = new KeyboardCameraSystem(camera)
    const mouseSystem = new MouseSystem(camera)
    const thingTransformSystem = new KeyboardTransformSystem(10, 30, 10)

    const world = new World(camera)

    world.systems.addSystems(gravitySystem, keyboardCameraSystem, thingTransformSystem, collideSystem, mouseSystem, moveSystem)

    return world
}


async function loadModel(world: World) {
    const skullMesh = await Mesh.fromOBJ('./assets/skull/Skull.obj')
    const skullMaterial = await Material.from('./assets/skull/Skull.jpg')
    const zelaMaterial = await Material.from('./assets/zela.jpg')

    world.entities.create()
        .addComponent(new ThingTransform(new Point3(20, 9, -35), new Vector3(1.5, 1.5, 0)))
        .addComponent(new ThingMesh(skullMesh, skullMaterial))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0)))
        .addComponent(new ThingCollider({type: "sphere", radius: 17}))
        .addComponent(new ThingMass(10, 0.5))

    world.entities.create()
        .addComponent(new ThingTransform(new Point3(0, 9, -10), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createSphere(24, 2)))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0), 0.1))
        .addComponent(new ThingCollider({type: "sphere", radius: 2}))
        .addComponent(new ThingMass(10, 0.5))
        .addComponent(new KeyboardTransformTag())


    world.entities.create()
        .addComponent(new ThingTransform(new Point3(0, 5, -10), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createSphere(24, 2)))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0)))
        .addComponent(new ThingCollider({type: "sphere", radius: 2}))
        .addComponent(new ThingMass(10, 0.5))


    world.entities.create()
        .addComponent(new ThingTransform(new Point3(0, 5, -14), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createSphere(24, 2)))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0)))
        .addComponent(new ThingCollider({type: "sphere", radius: 2}))
        .addComponent(new ThingMass(10, 0.5))

        
    world.entities.create()
        .addComponent(new ThingTransform(new Point3(4, 5, -10), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createSphere(24, 2)))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0)))
        .addComponent(new ThingCollider({type: "sphere", radius: 2}))
        .addComponent(new ThingMass(10, 0.5))

    world.entities.create()
        .addComponent(new ThingTransform(new Point3(4, 5, -14), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createSphere(24, 2)))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0)))
        .addComponent(new ThingCollider({type: "sphere", radius: 2}))
        .addComponent(new ThingMass(10, 0.5))
    
    world.entities.create()
        .addComponent(new ThingTransform(new Point3(0, -2 ,0), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createPlane(100, 100), zelaMaterial))
}

async function main() {
    const engine = initEngine()

    const world = initWorld()
    loadModel(world)

    engine.bindWorld(world)

    engine.loop()
}

main()

