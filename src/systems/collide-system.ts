import type { FrameTime, System } from "../interfaces";
import { Vector3 } from "../maths/vector3";
import { ThingCollider } from "../thing/components/collider";
import { ThingMass } from "../thing/components/mass";
import { ThingTransform } from "../thing/components/transform";
import { ThingVelocity } from "../thing/components/velocity";
import { Thing } from "../thing/thing";
import type { World } from "../world";

type CollisionManifold = {
    penetration: number
    normal: Vector3 
}

export class CollideSystem implements System {
    update(dt: FrameTime, world: World): void {
        const things = world.query(ThingMass, ThingCollider, ThingTransform, ThingVelocity)
        

        for (let i = 0; i < things.length; i++) {
            for (let j = i + 1; j < things.length; j++) {
                const a = things[i]
                const b = things[j]

                const manifold = this.chechCollision(a, b)

                if (manifold) {
                    this.resolveCollision(a, b, manifold)
                }
            }
        }
    }


    private chechCollision(a: Thing, b: Thing): CollisionManifold | null {
        const aCollider = a.getComponent<ThingCollider>(ThingCollider)!
        const bCollider = b.getComponent<ThingCollider>(ThingCollider)!

        const aTransform = a.getComponent(ThingTransform)!
        const bTransform = b.getComponent(ThingTransform)!

        if (aCollider.collider.type === "sphere" && bCollider.collider.type === "sphere") {
            const vector = aTransform.position.vectorTo(bTransform.position);
            const vecLength = vector.length;
            const radiusLength = aCollider.collider.radius + bCollider.collider.radius;
            
            if (vecLength < radiusLength) {                
                const normal = vecLength > 0 ? vector.multiplyScalar(1 / vecLength) : new Vector3(0, 1, 0)
                const penetration = radiusLength - vecLength

                return {
                    penetration: penetration,
                    normal: normal
                }
            }
        }

        return null
    }


    private resolveCollision(a: Thing, b: Thing, manifold: CollisionManifold) {
        const transA = a.getComponent(ThingTransform)!
        const transB = b.getComponent(ThingTransform)!
        const velA = a.getComponent(ThingVelocity)!
        const velB = b.getComponent(ThingVelocity)!
        const massA = a.getComponent(ThingMass)!.mass
        const massB = b.getComponent(ThingMass)!.mass

        const { normal, penetration } = manifold;

        const totalMass = massA + massB;
        
        if (totalMass > 0) {
            const mRatioA = massB / totalMass;
            const mRatioB = massA / totalMass;

            transA.position = transA.position.subtract(normal.multiplyScalar(penetration * mRatioA))
            transB.position = transB.position.addVector(normal.multiplyScalar(penetration * mRatioB))
        }

        const relativeVelocity = velB.velocity.subtract(velA.velocity)
        const velAlongNormal = relativeVelocity.dot(normal)

        if (velAlongNormal < 0) {
            const restitution = 0.8
            
            let impulseMagnitude = -(1 + restitution) * velAlongNormal;
            
            const invMassA = massA === Infinity ? 0 : 1 / massA;
            const invMassB = massB === Infinity ? 0 : 1 / massB;
            const invMassSum = invMassA + invMassB;

            if (invMassSum > 0) {
                impulseMagnitude /= invMassSum;

                const impulseVector = normal.multiplyScalar(impulseMagnitude)
            
                velA.velocity = velA.velocity.subtract(impulseVector.multiplyScalar(invMassA))
                velB.velocity = velB.velocity.add(impulseVector.multiplyScalar(invMassB))
            }
        }
    }
}