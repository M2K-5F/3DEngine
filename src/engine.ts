import type { ICamera, IProjector, IRenderer } from './interfaces'
import { EngineModelController, type ModelConfig } from './engine-model-controller'
import type { EngineModel } from './engine-model'



export class Engine {
    private _models: Set<EngineModelController> = new Set()

    constructor(
        private renderer: IRenderer, 
        private camera: ICamera, 
        private projector: IProjector,
    ) {}


    addModel(model: EngineModel, config: ModelConfig) {
        const controller = new EngineModelController(config)

        this._models.add(controller)

        this.renderer.addModelGeometry(
            controller, structuredClone(model.geometry)
        )
        return controller
    }


    removeModel(modelController: EngineModelController) {
        this._models.delete(modelController)

        this.renderer.removeModelGeometry(modelController)
    }


    private render() {
        this.renderer.clearFrame()

        const vp = this.projector.getMatrix().multiplyBy(this.camera.getMatrix())
        
        this.renderer.render(vp)
    }

    loop(loopFn: () => void) {
        const loop = () => {
            loopFn()   
            this.render()
            requestAnimationFrame(loop)
        }
        
        loop()
    }
}