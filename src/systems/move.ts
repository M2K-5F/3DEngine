import type { FrameTime, System } from "../interfaces";
import { ThingTransform } from "../thing/components/transform";
import { ThingVelocity } from "../thing/components/velocity";
import type { World } from "../world";

export class MoveSystem implements System {
    update(dt: FrameTime, world: World): void {
        const things = world.query(ThingTransform, ThingVelocity)

        things.forEach(thing => {
            const velocity = thing.getComponent(ThingVelocity)!
            const transform = thing.getComponent(ThingTransform)!

            transform.position = transform.position.addVector(velocity.velocity.multiplyScalar(dt))
        })
    }
}