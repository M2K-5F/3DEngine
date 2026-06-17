import type { FrameTime, System } from "../interfaces";
import { ThingTransform } from "../thing/components/transform";
import { ThingVelocity } from "../thing/components/velocity";
import type { World } from "../world/world";

export class MoveSystem implements System {
    update(dt: FrameTime, world: World): void {
        const things = world.entities.query(ThingTransform, ThingVelocity)

        things.forEach(thing => {
            const velocity = thing.getComponent(ThingVelocity)!
            const transform = thing.getComponent(ThingTransform)!


            const dampingFactor = Math.max(0, 1 - velocity.drag * dt)
            velocity.velocity = velocity.velocity.multiplyScalar(dampingFactor)

            transform.position = transform.position.addVector(velocity.velocity.multiplyScalar(dt))
        })
    }
}