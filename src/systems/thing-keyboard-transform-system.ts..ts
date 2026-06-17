import type { FrameTime, System } from "../interfaces"
import { ThingVelocity } from "../thing/components/velocity"
import { Component } from "../thing/thing"
import { Keys } from "../world/components/input-manager"
import type { World } from "../world/world"


export class KeyboardTransformTag extends Component {}


export class KeyboardTransformSystem implements System {
    constructor(
        private maxSpeed: number, 
        private maxFastSpeed: number,
        private acceleration: number
    ) {}

    update(dt: FrameTime, world: World) {
        const things = world.entities.query(ThingVelocity, KeyboardTransformTag)

        const isFast = world.input.has(Keys.Shift)

        const speed = isFast ? this.maxFastSpeed : this.maxSpeed

        const hasA = world.input.has(Keys.ArrowLeft)
        const hasD = world.input.has(Keys.ArrowRight)
        const hasW = world.input.has(Keys.ArrowUp)
        const hasS = world.input.has(Keys.ArrowDown)
        const hasE = world.input.has(Keys.T)
        const hasQ = world.input.has(Keys.R)

        const hasX = hasA || hasD
        const hasY = hasE || hasQ
        const hasZ = hasW || hasS

        const acceleration = this.acceleration * dt

        things.forEach(thing => {
            const velocity = thing.getComponent(ThingVelocity)!.velocity

            if (hasX) {
                if (hasA) velocity.x = Math.max(velocity.x - acceleration , -speed)
                
                if (hasD) velocity.x = Math.min(velocity.x + acceleration , speed)
            }
            else {
                if (Math.abs(velocity.x) <= acceleration) {
                    velocity.x = 0
                } else {
                    velocity.x += -Math.sign(velocity.x) * acceleration
                }
            }

            if (hasY) {
                if (hasE) velocity.y = Math.min(velocity.y + acceleration , speed)
                
                if (hasQ) velocity.y = Math.max(velocity.y - acceleration , -speed)
            }
            else {
                if (Math.abs(velocity.y) <= acceleration) {
                    velocity.y = 0
                } else {
                    velocity.y += -Math.sign(velocity.y) * acceleration
                }
            }

            if (hasZ) {
                if (hasW) velocity.z = Math.max(velocity.z - acceleration , -speed)
                
                if (hasS) velocity.z = Math.min(velocity.z + acceleration , speed)
            }
            else {
                if (Math.abs(velocity.z) <= acceleration) {
                    velocity.z = 0
                } else {
                    velocity.z += -Math.sign(velocity.z) * acceleration
                }
            }
        })
    }
}