import { EngineModel } from './engine-model'
import {Polygon3, Matrix4, Vector3} from './maths'
import { ScreenSettings, ModelSettings, EngineDrawer } from './types'

export class GraphicEngine {
    private polygonQueue: Array<{
        polygon: Polygon3,
        color: string,
        depth: number,
        dot: number
    }> = []
    
    private lightVector: Vector3 = new Vector3(1, 1, -1)
    private cameraVectorUp: Vector3 = new Vector3(0, 1, 0)
    private cameraPosition: Vector3 = new Vector3(0, 0, 1)
    private cameraTarget: Vector3 = new Vector3(0, 0, 0)
    private cameraForward: Vector3 = new Vector3(0, 0, -1)
    private cameraYaw: number = 0  
    private cameraPitch: number = 0 
    
    private viewMatrix: Matrix4 = new Matrix4()
    private projectionMatrix: Matrix4 = new Matrix4()
    private MVPMatrix: Matrix4 = new Matrix4()
    
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private offscreenCanvas: HTMLCanvasElement
    private offscreenCtx: CanvasRenderingContext2D

    public keys = new Set<string>()
    public cameraSpeed = 0.1
    public mouseSensitivity = 0.002
    private mouseLocked: boolean = false

    constructor(
        private screenSettings: ScreenSettings,
    ) {
        this.canvas = document.getElementById("maincnv") as HTMLCanvasElement
        this.ctx = this.canvas.getContext("2d")!
        
        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCtx = this.offscreenCanvas.getContext("2d")!

        this.updateCameraSettings()
        this.updateProjectonMatrix()
        this.updateCameraDirection()
        this.updateViewMatrix()
        this.updateMVPMatrix()
        this.initOffscreenCanvas()
    }

    public setupMouseControl() {
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock()
        })
        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.canvas
        })
        
        document.addEventListener('mousemove', (e) => {
            if (this.mouseLocked) {
                this.handleMouseMove(e.movementX, e.movementY)
            }
        })
    }

    private handleMouseMove(deltaX: number, deltaY: number) {
        this.cameraYaw -= deltaX * this.mouseSensitivity
        this.cameraPitch -= deltaY * this.mouseSensitivity
        
        this.cameraPitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, this.cameraPitch))
        
        this.updateCameraDirection()
    }

    private updateCameraDirection() {
        this.cameraForward = new Vector3(
            Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch),
            Math.sin(this.cameraPitch),
            Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch)
        ).normalize()
        
        this.updateViewMatrix()
    }

    private updateProjectonMatrix() {
        this.projectionMatrix = Matrix4.getProjectionMatrix(this.screenSettings)
    }

    private updateMVPMatrix() {
        this.MVPMatrix = this.viewMatrix.multiply(this.projectionMatrix)
    }
    
    private updateViewMatrix() {
        this.cameraTarget = new Vector3(
            this.cameraPosition.x + this.cameraForward.x,
            this.cameraPosition.y + this.cameraForward.y,
            this.cameraPosition.z + this.cameraForward.z
        )
        
        const eye = this.cameraPosition
        const target = this.cameraTarget
        const up = this.cameraVectorUp
        this.viewMatrix = Matrix4.lookAt(eye, target, up)
    }

    private updateCameraSettings() {
        this.screenSettings = {
            ...this.screenSettings,
            centerX: this.canvas.width / 2,
            centerY: this.canvas.height / 2,
            aspect: this.canvas.width / this.canvas.height
        }
    }

    private initOffscreenCanvas() {
        this.offscreenCanvas.width = this.canvas.width
        this.offscreenCanvas.height = this.canvas.height
    }

    private renderModel(model: EngineModel, settings: ModelSettings) {
        let matrix: Matrix4 = new Matrix4()
        if (settings.angleX) {
            matrix = matrix.multiply(Matrix4.rotationX(settings.angleX))
        }
        if (settings.angleY) {
            matrix = matrix.multiply(Matrix4.rotationY(settings.angleY))
        }
        if (settings.angleZ) {
            matrix = matrix.multiply(Matrix4.rotationZ(settings.angleZ))
        }
        
        for (const polygon of model.polygons) {
            const points = polygon.spread().map(p => matrix.transform(p))
            let newPoly = new Polygon3(points[0], points[1], points[2])

            if (settings.offsetX || settings.offsetY || settings.offsetZ) {
                newPoly = newPoly.addVector(
                    new Vector3(
                        settings.offsetX || 0,
                        settings.offsetY || 0,
                        settings.offsetZ || 0
                    )
                )
            }
            this.addPolygonToQueue(newPoly, settings.color || "green")
        }
    }

    private addPolygonToQueue(polygon: Polygon3, color: string) {
        const [p1, p2, p3] = polygon.spread()

        const p1Camera = this.viewMatrix.transform(p1)
        const p2Camera = this.viewMatrix.transform(p2)
        const p3Camera = this.viewMatrix.transform(p3)

        const cameraPolygon = new Polygon3(p1Camera, p2Camera, p3Camera)

        const center = polygon.center()
        const normalVector = polygon.normal()

        const viewVector = new Vector3(
            center.x - this.cameraPosition.x,
            center.y - this.cameraPosition.y,
            center.z - this.cameraPosition.z
        )

        const dot = viewVector.normalize().dot(normalVector.normalize())

        if (dot > 0) {
            return
        }
        
        if (cameraPolygon.center().z < 0.1) {
            return
        }
        
        const avgDepth = (p1.z + p2.z + p3.z) / 3
        
        this.polygonQueue.push({
            polygon,
            color,
            depth: avgDepth,
            dot: Math.max(0, dot)
        })
    }

    private drawPolygon(polygon: Polygon3, color: string) {
        const [p1, p2, p3] = polygon.spread()
        
        const normalVector = polygon.normal()
        const dot = this.lightVector.normalize().dot(normalVector.normalize())
        
        const px1 = this.MVPMatrix.transform(p1).toScreenPixel(this.screenSettings)
        const px2 = this.MVPMatrix.transform(p2).toScreenPixel(this.screenSettings)
        const px3 = this.MVPMatrix.transform(p3).toScreenPixel(this.screenSettings)
        
        let RGB: string
        if (color === "green") {
            const dia = 50 + 150 * Math.max(0, dot)
            RGB = `rgb(${dia},${255},${dia})`
        } else {
            RGB = color
        }
        
        this.offscreenCtx.beginPath()
        this.offscreenCtx.moveTo(px1.x, px1.y)
        this.offscreenCtx.lineTo(px2.x, px2.y)
        this.offscreenCtx.lineTo(px3.x, px3.y)
        this.offscreenCtx.fillStyle = RGB
        this.offscreenCtx.closePath()
        this.offscreenCtx.fill()
    }

    makeFrame(callback: (drawer: EngineDrawer) => void) {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.offscreenCtx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.polygonQueue = []
        this.handleInput()
        this.updateViewMatrix()
        this.updateMVPMatrix()

        const drawer = (model: EngineModel, settings?: ModelSettings) => {
            this.renderModel(model, settings || {})
        }
        callback(drawer)
        
        this.polygonQueue.sort((a, b) => b.depth - a.depth)
        
        for (const item of this.polygonQueue) { 
            this.drawPolygon(item.polygon, item.color)
        }
        
        this.ctx.drawImage(this.offscreenCanvas, 0, 0)
    }

    enableKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase())
        })
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase())
        })
    }
    
    private handleInput() {
        if (this.keys.has('w')) {
            this.cameraPosition.x -= this.cameraForward.x * this.cameraSpeed
            this.cameraPosition.z -= this.cameraForward.z * this.cameraSpeed
        }
        if (this.keys.has('s')) {
            this.cameraPosition.x += this.cameraForward.x * this.cameraSpeed
            this.cameraPosition.z += this.cameraForward.z * this.cameraSpeed
        }
        if (this.keys.has('a')) {
            const left = this.cameraForward.cross(this.cameraVectorUp).normalize()
            this.cameraPosition.x -= left.x * this.cameraSpeed
            this.cameraPosition.z -= left.z * this.cameraSpeed
        }
        if (this.keys.has('d')) {
            const right = this.cameraVectorUp.cross(this.cameraForward).normalize()
            this.cameraPosition.x -= right.x * this.cameraSpeed
            this.cameraPosition.z -= right.z * this.cameraSpeed
        }
        
        if (this.keys.has('q')) {
            this.cameraPosition.y -= this.cameraSpeed
        }
        if (this.keys.has('e')) {
            this.cameraPosition.y += this.cameraSpeed
        }

        if (this.keys.has('arrowleft')) {
            this.cameraYaw += 0.05
            this.updateCameraDirection()
        }
        if (this.keys.has('arrowright')) {
            this.cameraYaw -= 0.05
            this.updateCameraDirection()
        }
        if (this.keys.has('arrowup')) {
            this.cameraPitch = Math.min(Math.PI/2 - 0.01, this.cameraPitch + 0.05)
            this.updateCameraDirection()
        }
        if (this.keys.has('arrowdown')) {
            this.cameraPitch = Math.max(-Math.PI/2 + 0.01, this.cameraPitch - 0.05)
            this.updateCameraDirection()
        }
    }
} 