import type { FrameTime, System } from "../interfaces"
import { ThingCollider } from "../thing/components/collider"
import { ThingMass } from "../thing/components/mass"
import { ThingTransform } from "../thing/components/transform"
import { ThingVelocity } from "../thing/components/velocity"
import { Thing } from "../thing/thing"
import type { World } from "../world"


export class GravitySystem implements System {
    constructor(
        private gravityForse: number,
        private groundLevel = 0,
    ) {}


    update(dt: FrameTime, world: World) {
        const things = world.query(ThingTransform, ThingVelocity, ThingMass, ThingCollider)

        things.forEach(thing => {
            const transform = thing.getComponent(ThingTransform)!
            const velocity = thing.getComponent(ThingVelocity)!
            const mass = thing.getComponent(ThingMass)!

            velocity.velocity.y += this.gravityForse

            const posY = transform.position.y
            const velY = velocity.velocity.y

            const raycastY = posY + velY * dt
            

            if (raycastY <= this.groundLevel) {
                if (posY <= this.groundLevel || Math.abs(velY) < 3) {
                    transform.position.y = this.groundLevel
                    velocity.velocity.y = 0
                }
                else {
                    transform.position.y = this.groundLevel - (posY - this.groundLevel)
                    velocity.velocity.y = -velY * mass.restitution
                }
            }
        })
    }
}