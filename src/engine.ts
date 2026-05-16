import type { IRenderer, PolygonTransformer, PolygonTransformUnit } from './interfaces'
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
            const modelMatrix = model.getModelMatrix()
            
            model.geometry.polygons.forEach(polygon => {   
                const worldPolygon = polygon.transformByMatrix(modelMatrix)

                let unit: PolygonTransformUnit = {
                    polygon: worldPolygon,
                    color: model.color,
                    lightIntensity: 0,
                    worldNormal: worldPolygon.normal()
                }

                for (const transformer of this.transformFlow) {
                    const result = transformer.transformPolygon(unit)
                    if (!result) return
                }
                
                this.renderer.addPolygon(unit)
            })
        })

        this.renderer.flushFrame()
    }
}