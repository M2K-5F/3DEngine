import type { Vector3 } from "../../maths/vector3";
import { Component } from "../thing";

export class ThingVelocity extends Component {
    constructor(
        public velocity: Vector3
    ) { super() }

    takeForce(forceVec: Vector3) {
        this.velocity = this.velocity.add(forceVec)
    }
}