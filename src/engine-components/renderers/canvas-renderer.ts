import type { IRenderer, PolygonTransformUnit } from "../../interfaces"

export type RendererConfig = {
    width: number
    height: number    
}

export class CanvasRenderer implements IRenderer {
    private config: RendererConfig

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private offscreenCanvas: HTMLCanvasElement
    private offscreenCtx: CanvasRenderingContext2D
    private polygonQueue: Array<PolygonTransformUnit> = []
    
    constructor(config: RendererConfig) {
        this.config = config
        const root = document.getElementById('root')!

        this.canvas = document.createElement('canvas')
        this.canvas.width = config.width; this.canvas.height = config.height
        this.ctx = this.canvas.getContext('2d')!


        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCanvas.width = config.width; this.offscreenCanvas.height = config.height
        this.offscreenCtx = this.offscreenCanvas.getContext('2d')!

        root.append(this.canvas)
    }


    clearFrame() {
        this.polygonQueue = []
        this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }


    addPolygon(item: PolygonTransformUnit) {
        this.polygonQueue.push(item)
    }


    flushFrame() {
        this._sortQueue()
        this._drawFromQueue()
        this._renderFromOffscreen()
    }


    private _sortQueue() {
        this.polygonQueue.sort((a, b) => {
            const depthA = Math.max(a.polygon.p1.z, a.polygon.p2.z, a.polygon.p3.z)
            const depthB = Math.max(b.polygon.p1.z, b.polygon.p2.z, b.polygon.p3.z)
            return depthB - depthA
        })
    }


    private _drawFromQueue() {
        for (const item of this.polygonQueue) {
            const [px1, px2, px3] = item.polygon.points.map(point => 
                point.convertIntoPixel(this.config)
            )
            

            let finalColor = item.color
            if (item.color === 'green') {
                const ambient = 0.2
                const brightness = ambient + (1 - ambient) * item.lightIntensity
                const r = Math.floor(50 * brightness)
                const g = Math.floor(255 * brightness)
                const b = Math.floor(50 * brightness)
                finalColor = `rgb(${r},${g},${b})`
            }

            this.offscreenCtx.beginPath();
            this.offscreenCtx.moveTo(px1.x, px1.y)
            this.offscreenCtx.lineTo(px2.x, px2.y)
            this.offscreenCtx.lineTo(px3.x, px3.y)
            this.offscreenCtx.fillStyle = finalColor
            this.offscreenCtx.fill()
        }
    }


    private _renderFromOffscreen() {
        this.ctx.drawImage(this.offscreenCanvas, 0, 0)
    }
}
