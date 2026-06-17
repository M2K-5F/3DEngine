import type { Vector3 } from "../../maths/vector3";
import { Component } from "../thing";

export class ThingVelocity extends Component {
    constructor(
        public velocity: Vector3,
        public drag: number = 1
    ) { super() }

    takeForce(forceVec: Vector3) {
        this.velocity = this.velocity.add(forceVec)
    }
}