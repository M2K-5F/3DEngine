import type { FrameTime } from '../interfaces'
import type { World } from '../world/world'
import type { Renderer } from './components/renderer'



export class BlazingEngine {
    private _world?: World

    constructor(
        private renderer: Renderer,
    ) {}

    bindWorld(world: World) {
        this._world = world
    }

    public loop(loopFn?: (dt: FrameTime) => void) {
        const loop = () => {
            const world = this._world
            if (world) {
                const dt = world.update()

                loopFn?.(dt)   

                this.renderer.clearFrame()
                this.renderer.render(world)
            }

            requestAnimationFrame(loop)
        }
        
        loop()
    }
}