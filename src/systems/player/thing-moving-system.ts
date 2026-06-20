import type { System, FrameTime } from "../../interfaces"
import { Vector3 } from "../../maths/vector3"
import { ThingVelocity } from "../../thing/components/velocity"
import type { ComponentClass } from "../../thing/thing"
import { Keys } from "../../world/components/input-manager"
import type { World } from "../../world/world"

export const MovementSpace = {
    Camera: 'camera',
    World: 'world'
} as const




export class ThingMovementSystem implements System {
    constructor(
        private followedTag: ComponentClass<any> | null,
        private movementSpace: typeof MovementSpace[keyof typeof MovementSpace],
        private maxSpeed: number, 
        private maxFastSpeed: number,
        private acceleration: number
    ) {}

    bindTag(tag: ComponentClass<any> | null) {
        this.followedTag = tag
    }

    update(dt: FrameTime, world: World): void {
        if (!this.followedTag) return 

        const targets = world.entities.query(ThingVelocity, this.followedTag)
        if (targets.length === 0) return

        const isFast = world.input.has(Keys.Shift)
        const speed = isFast ? this.maxFastSpeed : this.maxSpeed
        const hasA = world.input.has(Keys.A)
        const hasD = world.input.has(Keys.D)
        const hasW = world.input.has(Keys.W)
        const hasS = world.input.has(Keys.S)
        const hasX = hasA || hasD
        const hasZ = hasW || hasS
        const hasJump = world.input.has(Keys.Space)
        const accelStep = this.acceleration * dt

        let axisForward = new Vector3(0, 0, 1)
        let axisRight = new Vector3(1, 0, 0)

        if (this.movementSpace === 'camera') {
            const camera = world.camera.getCamera()
            const camH = camera.rotation.horizontal

            axisForward = new Vector3(Math.sin(camH), 0, Math.cos(camH)).normalize()
            axisRight = new Vector3(Math.cos(camH), 0, -Math.sin(camH)).normalize()
        }

        let moveDirection = new Vector3(0, 0, 0)
        if (hasX) {
            if (hasA) moveDirection = moveDirection.add(axisRight)
            if (hasD) moveDirection = moveDirection.subtract(axisRight)
        }
        if (hasZ) {
            if (hasW) moveDirection = moveDirection.add(axisForward)
            if (hasS) moveDirection = moveDirection.subtract(axisForward)
        }

        const isMoving = hasX || hasZ
        const finalDir = isMoving ? moveDirection.normalize() : new Vector3(0, 0, 0)

        targets.forEach(target => {
            const velocity = target.getComponent(ThingVelocity)!.velocity

            if (hasJump && Math.abs(velocity.y) < 0.05) {
                velocity.y = 15 
            }

            if (isMoving) {
                velocity.x += finalDir.x * accelStep
                velocity.z += finalDir.z * accelStep
            } 
            
            else {
                if (Math.abs(velocity.x) <= accelStep) velocity.x = 0
                else velocity.x += -Math.sign(velocity.x) * accelStep

                if (Math.abs(velocity.z) <= accelStep) velocity.z = 0
                else velocity.z += -Math.sign(velocity.z) * accelStep
            }
            
            const newHorizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
            if (newHorizontalSpeed > speed) {
                const ratio = speed / newHorizontalSpeed
                velocity.x *= ratio
                velocity.z *= ratio
            }
        })
    }
}
