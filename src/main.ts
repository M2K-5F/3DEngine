import { Camera } from './engine/components/camera'
import { Renderer } from './engine/components/renderer'
import { Point3 } from './maths/point3'
import { Vector3 } from './maths/vector3'
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
import { Material } from './shared/material'
import { CameraOrbitFollowSystem } from './systems/player/camera-orbit-follow-system'
import { PlayerTag } from './thing/tags/player-tag'
import { MouseRotationSystem } from './systems/player/mouse-camera-rotation-system'
import { MovementSpace, ThingMovementSystem } from './systems/player/thing-moving-system'

function initEngine() {
    const WIDTH = 1500, HEIGHT = 750

    const renderer = new Renderer({height: HEIGHT, width: WIDTH, fallbackTextureColor: Colors.PURPLE, far: 200, near: 0.1, fov: Math.PI / 2})   
    const engine = new BlazingEngine(renderer)
    return engine
}


function initWorld() {
    const camera = new Camera()
    const moveSystem = new MoveSystem()
    const gravitySystem = new GravitySystem(-0.9)
    const collideSystem = new CollideSystem()
    const mouseCameraSystem = new MouseRotationSystem()
    const playerCameraOrbitSystem = new CameraOrbitFollowSystem(PlayerTag, 10, 2)
    const playerMovementSystem = new ThingMovementSystem(PlayerTag, MovementSpace.Camera, 20, 40, 20)

    const world = new World(camera)

    world.systems.addSystems(
        mouseCameraSystem, gravitySystem, 
        playerMovementSystem, collideSystem, 
        moveSystem, playerCameraOrbitSystem
    )

    return world
}


function createSphere(world: World, position: Point3) {
    return world.entities.create()
        .addComponent(new ThingTransform(position, new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createSphere(24, 2)))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0), 0.3))
        .addComponent(new ThingCollider({type: "sphere", radius: 2}))
        .addComponent(new ThingMass(1, 0.001))
}


async function loadModel(world: World) {
    const skullMesh = await Mesh.fromOBJ('./assets/skull/Skull.obj')
    const skullMaterial = await Material.from('./assets/skull/Skull.jpg')
    const zelaMaterial = await Material.from('./assets/zela.jpg')
    // const tankMesh = await Mesh.fromOBJ('./assets/tank.obj')
    // const guyMesh = await Mesh.fromOBJ('./assets/guy.obj')

    world.entities.create()
        .addComponent(new ThingTransform(new Point3(20, 9, -35), new Vector3(1.5, 1.5, 0)))
        .addComponent(new ThingMesh(skullMesh, skullMaterial))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0)))
        .addComponent(new ThingCollider({type: "sphere", radius: 17}))
        .addComponent(new ThingMass(10, 0.5))

    world.entities.create()
        .addComponent(new ThingTransform(new Point3(0, 5, -10), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createSphere(24, 2)))
        .addComponent(new ThingVelocity(new Vector3(0, 0, 0), 0.1))
        .addComponent(new ThingCollider({type: "sphere", radius: 2}))
        .addComponent(new ThingMass(1000000 , 0.1))
        .addComponent(new PlayerTag())
    

    createSphere(world, new Point3(0, 1, -18))
    createSphere(world, new Point3(4, 1, -18))
    createSphere(world, new Point3(8, 1, -18))
    createSphere(world, new Point3(12, 1, -18))
    createSphere(world, new Point3(0, 5, -18))
    createSphere(world, new Point3(4, 5, -18))
    createSphere(world, new Point3(8, 5, -18))
    createSphere(world, new Point3(12, 5, -18))

    createSphere(world, new Point3(0, 1, -14))
    createSphere(world, new Point3(4, 1, -14))
    createSphere(world, new Point3(8, 1, -14))
    createSphere(world, new Point3(12, 1, -14))
    createSphere(world, new Point3(0, 5, -14))
    createSphere(world, new Point3(4, 5, -14))
    createSphere(world, new Point3(8, 5, -14))
    createSphere(world, new Point3(12, 5, -14))
    
    world.entities.create()
        .addComponent(new ThingTransform(new Point3(0, -2 ,0), new Vector3(0, 0, 0)))
        .addComponent(new ThingMesh(Mesh.createPlane(200, 200), zelaMaterial))
}

async function main() {
    const engine = initEngine()

    const world = initWorld()
    await loadModel(world)

    engine.bindWorld(world)

    engine.loop()
}

main()

