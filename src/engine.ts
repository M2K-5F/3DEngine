import type { IRenderer, PolygonTransformer } from './interfaces'
import type { ModelManager } from './model-manager'


export class Engine {
    private renderer: IRenderer

    constructor(renderer: IRenderer) {
        this.renderer = renderer
    }

    private transformFlow: PolygonTransformer[] = []
    private models: Map<number, ModelManager> = new Map()


    addPolygonTransformer(transformer: PolygonTransformer) {
        this.transformFlow.push(transformer)

        return this
    }

    addModel(model: ModelManager, id: number) {
        this.models.set(id, model)

        return this
    }

    removeModel(modelID: number) {
        this.models.delete(modelID)
    }

    makeFrame() {
        this.renderer.clearFrame()
        
        this.models.forEach(model => {            
            model.getTransformedPolygonUnits().forEach(unit => {
                for (const transformer of this.transformFlow) {
                    if (!transformer.transformPolygon(unit)) return 
                }
                
                this.renderer.addPolygon(unit)
            })
        })

        this.renderer.flushFrame()
    }
}