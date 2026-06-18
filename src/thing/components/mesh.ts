import type { Vector3 } from "../../maths/vector3";
import type { Material } from "../../shared/material";
import type { Mesh } from "../../shared/mesh";
import { Component } from "../thing";

export class ThingMesh extends Component {
    constructor(
        public mesh: Mesh,
        public material?: Material
    ) { super() }
}