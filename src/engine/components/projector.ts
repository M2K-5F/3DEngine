import type { IProjector } from "../../interfaces"

type ProjectorConfig = {
    aspect: number
    fov: number
    near: number
    far: number
}

export class Projector {
    public config: ProjectorConfig
    
    constructor(config: ProjectorConfig) {
        this.config = config
    }
}