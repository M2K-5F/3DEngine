import { Component } from "../thing";

export class ThingMass extends Component {
    constructor(
        public mass: number,
        public restitution: number
    ) { super() }
}