import type { Point3 } from "../../maths/point3";
import type { Vector3 } from "../../maths/vector3";
import { Component } from "../thing";

export class ThingTransform extends Component {
    constructor(
        public position: Point3,
        public rotation: Vector3
    ) { super() }
}