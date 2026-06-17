import type { FrameTime, System } from "../../interfaces"
import type { World } from "../world"

export class SystemManager {    
    private _systems: Set<System> = new Set()


    addSystems(...systems: System[]) {
        systems.forEach(system => {
            this._systems.add(system)
        })
    }

    removeSystems(...systems: System[]) {
        systems.forEach(system => {
            this._systems.delete(system)
        })
    }

    updateSystems(dt: FrameTime, world: World) {
        this._systems.forEach(sys => sys.update(dt, world))
    }
}