import type { FrameTime, System } from "../interfaces"
import { ThingTransform } from "../thing/components/transform"
import { ThingVelocity } from "../thing/components/velocity"
import type { World } from "../world"


export class GravitySystem implements System {
    constructor(
        private gravityForse: number,
        private groundLevel = 0,
    ) {}


    update(dt: FrameTime, world: World) {
        const things = world.query(ThingTransform, ThingVelocity)

        things.forEach(thing => {
            const transform = thing.getComponent(ThingTransform)!
            const velocity = thing.getComponent(ThingVelocity)!

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
                    velocity.velocity.y = -velY * 0.9
                }
            }
        })
    }
}