import type { FrameTime, ICamera, IProjector, IRenderer, System } from '../interfaces'
import type { World } from '../world'



export class Engine {
    private _systems: Set<System> = new Set()
    private _world?: World

    constructor(
        private renderer: IRenderer, 
        private camera: ICamera, 
        private projector: IProjector,
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
        const eng = this

        const loop = () => {
            const world = this._world
            if (world) {
                const now = Date.now()
                const dt = (now - last) / 1000 as FrameTime
                last = now 

                eng._systems.forEach(sys => sys.update(dt, world))

                loopFn(dt)   

                this.renderer.clearFrame()

                const vp = this.projector.getMatrix().multiplyBy(this.camera.getMatrix())
                
                this.renderer.render(vp, world)
            }

            requestAnimationFrame(loop)
        }
        
        loop()
    }
}