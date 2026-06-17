import type { FrameTime, System } from '../interfaces'
import type { World } from '../world'
import type { Camera } from './components/camera'
import type { Projector } from './components/projector'
import type { Renderer } from './components/renderer'



export class Engine {
    private _systems: Set<System> = new Set()
    private _world?: World

    constructor(
        private renderer: Renderer, 
        private camera: Camera, 
        private projector: Projector,
    ) {}

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


    bindWorld(world: World) {
        this._world = world
    }


    public loop(loopFn: (dt: FrameTime) => void) {
        let last = Date.now()

        const loop = () => {
            const world = this._world
            if (world) {
                const now = Date.now()
                const dt = (now - last) / 1000 as FrameTime
                last = now 

                this._systems.forEach(sys => sys.update(dt, world))

                loopFn(dt)   

                this.renderer.clearFrame()

                this.renderer.render(this.camera, this.projector, world)
            }

            requestAnimationFrame(loop)
        }
        
        loop()
    }
}