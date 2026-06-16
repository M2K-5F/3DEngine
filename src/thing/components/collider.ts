import { Component } from "../thing";


export type SphereCollider = {
    radius: number,
    type: "sphere"
}

export type ColliderType = 
    | SphereCollider


export class ThingCollider<T = ColliderType> extends Component {
    constructor(
        public collider: T
    ) { super() }
}