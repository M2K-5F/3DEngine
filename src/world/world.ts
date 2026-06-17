import type { Camera } from "../engine/components/camera";
import { CameraManager } from "./components/camera-manager";
import { EntityManager } from "./components/entity-manager";
import { InputManager } from "./components/input-manager";
import { SystemManager } from "./components/system-manager";
import { TickManager } from "./components/tick-manager";

export class World {
    public entities = new EntityManager() 
    public input = new InputManager()
    public systems = new SystemManager()
    public tick = new TickManager()
    public camera: CameraManager

    constructor(
        camera: Camera
    ) {
        this.camera = new CameraManager(camera)
    }

    update() {
        const dt = this.tick.tick()

        this.systems.updateSystems(dt, this)
        
        return dt
    }
}
