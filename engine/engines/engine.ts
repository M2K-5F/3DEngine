import { ScreenSettings } from "../interfaces"

export class Pixel{
    constructor(
        public x: number,
        public y: number
    ) {}
}

export class Point3 {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public w: number = 1,
    ) {}

    vectorTo(other: Point3): Vector3 {
        return new Vector3(
            other.x - this.x,
            other.y - this.y,
            other.z - this.z,
            0,
        )
    }

    toScreenPixel(screen: ScreenSettings): Pixel {
        const x = (screen.centerX ?? 450) - this.x * screen.scale
        const y = (screen.centerY ?? 450) + this.y * screen.scale
        return new Pixel(x, y)
    }

    addVector(v: Vector3): Point3 {
        return new Point3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
            this.w
        )
    }
}



export class Vector3 {
    constructor (
        public x: number,
        public y: number,
        public z: number,
        public w: number = 0,
    ) {}

    add(other: Vector3): Vector3 {
        return new Vector3(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z,
            this.w
        )
    }

    subtract(other: Vector3): Vector3 {
        return new Vector3(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
            this.w
        )
    }

    multiplyScalar(scalar: number): Vector3 {
        return new Vector3(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar,
            this.w
        )
    }

    normalize(): Vector3 {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        if (length > 0) {
            return new Vector3(
                this.x / length,
                this.y / length,
                this.z / length,
                this.w
            )
        }
        return this
    }

    cross(other: Vector3): Vector3 {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
            this.w
        )
    }

    dot(other: Vector3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z
    }
}

export class Polygon3 {
    constructor(
        public p1: Point3,
        public p2: Point3,
        public p3: Point3
    ) {}

    center(): Point3 {
        return new Point3(
            (this.p1.x + this.p2.x + this.p3.x) / 3,
            (this.p1.y + this.p2.y + this.p3.y) / 3,
            (this.p1.z + this.p2.z + this.p3.z) / 3
        )
    }

    normal(): Vector3 {
        const v1 = this.p1.vectorTo(this.p2)
        const v2 = this.p1.vectorTo(this.p3)
        return v1.cross(v2).normalize()
    }

    addVector(v: Vector3): Polygon3 {
        return new Polygon3(
            this.p1.addVector(v),
            this.p2.addVector(v),
            this.p3.addVector(v)
        )
    }

    spread() {
        return [this.p1, this.p2, this.p3] as const
    }
}

export class Matrix4 {
    constructor(
        private m: number[] = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ] as const 
    ) {}

    static translation(tx: number, ty: number, tz: number): Matrix4 {
        return new Matrix4([
            1, 0, 0, tx,
            0, 1, 0, ty,
            0, 0, 1, tz,
            0, 0, 0, 1
        ])
    }

    static rotationY(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            cos,  0, sin,  0,
            0,    1, 0,    0,
            -sin, 0, cos,  0,
            0,    0, 0,    1
        ])
    }

    static rotationX(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            1, 0,    0,    0,
            0, cos, -sin,  0,
            0, sin,  cos,  0,
            0, 0,    0,    1
        ])
    }

    static rotationZ(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            cos, -sin, 0, 0,
            sin,  cos, 0, 0,
            0,    0,   1, 0,
            0,    0,   0, 1
        ])
    }

    static getProjectionMatrix(settings: ScreenSettings): Matrix4 {
        const f = 1 / Math.tan(settings.fov / 2)
        
        return new Matrix4([
            f / (settings.aspect || 1), 0, 0, 0,
            0, f, 0, 0,
            0, 0, -(settings.Zfar + settings.Znear) / (settings.Zfar - settings.Znear), -(2 * settings.Zfar * settings.Znear) / (settings.Zfar - settings.Znear),
            0, 0, -1, 0
        ])
    }

    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
        const z = eye.subtract(target).normalize()
        const x = up.cross(z).normalize()
        const y = z.cross(x).normalize()
        
        return new Matrix4([
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            -x.dot(eye), -y.dot(eye), -z.dot(eye), 1
        ])
    }

    transform(p: Point3): Point3 {
        const x = this.m[0] * p.x + this.m[4] * p.y + this.m[8] * p.z + this.m[12] * p.w
        const y = this.m[1] * p.x + this.m[5] * p.y + this.m[9] * p.z + this.m[13] * p.w
        const z = this.m[2] * p.x + this.m[6] * p.y + this.m[10] * p.z + this.m[14] * p.w
        const w = this.m[3] * p.x + this.m[7] * p.y + this.m[11] * p.z + this.m[15] * p.w
        return new Point3(
            x / w,
            y / w,
            z / w,
            w
        )
    }

    multiply(other: Matrix4): Matrix4 {
        const result = new Array(16).fill(0)
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0
                for (let k = 0; k < 4; k++) {
                    sum += this.m[i * 4 + k] * other.m[k * 4 + j]
                }
                result[i * 4 + j] = sum
            }
        }
        return new Matrix4(result)
    }
}

export function createDetailedCube(centerX: number, centerY: number, centerZ: number, size: number = 1, subdivisions: number = 10): EngineModel {
    const half = size / 2
    const polygons: Polygon3[] = []
    
    const vertices = [
        new Point3(-half, -half, -half),
        new Point3( half, -half, -half),
        new Point3( half,  half, -half),
        new Point3(-half,  half, -half),
        new Point3(-half, -half,  half),
        new Point3( half, -half,  half),
        new Point3( half,  half,  half),
        new Point3(-half,  half,  half),
    ]
    
    const faces = [
        [4, 5, 6, 7],
        [1, 0, 3, 2],
        [3, 7, 6, 2],
        [1, 5, 4, 0],
        [5, 1, 2, 6],
        [0, 4, 7, 3],
    ]
    
    for (const face of faces) {
        const [i1, i2, i3, i4] = face
        
        polygons.push(
            new Polygon3(vertices[i1], vertices[i2], vertices[i3]),
            new Polygon3(vertices[i1], vertices[i3], vertices[i4])
        )
    }
    
    return new EngineModel(polygons)
}


export function createSphere(centerX: number, centerY: number, centerZ: number, radius: number = 1, segments: number = 16) {
    const polygons: Polygon3[] = []
    const vertices: Point3[] = []

    for (let i = 0; i <= segments; i++) {
        const lat = Math.PI * i / segments
        const sinLat = Math.sin(lat)
        const cosLat = Math.cos(lat)
        
        for (let j = 0; j <= segments; j++) {
            const lon = 2 * Math.PI * j / segments
            const sinLon = Math.sin(lon)
            const cosLon = Math.cos(lon)
            
            const x = centerX + radius * sinLat * cosLon
            const y = centerY + radius * cosLat
            const z = centerZ + radius * sinLat * sinLon
            
            vertices.push(new Point3(x, y, z))
        }
    }
    
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const first = (i * (segments + 1)) + j
            const second = first + segments + 1
            
            polygons.push(
                new Polygon3(
                    vertices[first + 1],
                    vertices[second],
                    vertices[first],
                ),
                new Polygon3(
                    vertices[second + 1],
                    vertices[second],
                    vertices[first + 1],
                )
            )
        }
    }
    
    return new EngineModel(polygons)
}


export class OJBModel{
    constructor(
        public model: string
    ){}

    convertToEngineModel() {
        const vertices: Point3[] = []
        const polygons: Polygon3[] = []
        
        const lines = this.model.split('\n')
        
        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('#')) continue
            
            const parts = trimmed.split(/\s+/)
            if (parts.length === 0) continue
            
            const type = parts[0]
            
            switch (type) {
                case 'v':
                    if (parts.length >= 4) {
                        vertices.push(new Point3(
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ))
                    }
                    break
                    
                case 'f':
                    if (parts.length >= 4) {
                        const faceVertices: Point3[] = [];
                        
                        for (let i = 1; i < parts.length; i++) {
                            const vertexInfo = parts[i].split('/')[0]
                            const vertexIndex = parseInt(vertexInfo) - 1
                            
                            if (vertexIndex >= 0 && vertexIndex < vertices.length) {
                                faceVertices.push(vertices[vertexIndex])
                            }
                        }
                        
                        if (faceVertices.length >= 3) {
                            for (let i = 1; i < faceVertices.length - 1; i++) {
                                polygons.push(new Polygon3(
                                    faceVertices[0],
                                    faceVertices[i],
                                    faceVertices[i + 1]
                                ))
                            }
                        }
                    }
                    break
            }
        }
        
        return new EngineModel(polygons)
    }
}

interface ModelSettings {
    offsetX?: number
    offsetY?: number
    offsetZ?: number
    angleX?: number
    angleY?: number
    angleZ?: number
    color?: `rgb(${number},${number},${number})`
    debugMode?: boolean
}

export class EngineModel{
    constructor(
        public polygons: Polygon3[]
    ){}
}

export type EngineDrawer = (model: EngineModel, settings?: ModelSettings) => void

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
    private cameraYaw: number = 0  // Поворот по горизонтали
    private cameraPitch: number = 0  // Наклон по вертикали
    
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

    // private setupMouseControl() {
    //     this.canvas.addEventListener('click', () => {
    //         this.canvas.requestPointerLock()
    //     })
    //     document.addEventListener('pointerlockchange', () => {
    //         this.mouseLocked = document.pointerLockElement === this.canvas
    //     })
        
    //     document.addEventListener('mousemove', (e) => {
    //         if (this.mouseLocked) {
    //             this.handleMouseMove(e.movementX, e.movementY)
    //         }
    //     })
    // }

    // private handleMouseMove(deltaX: number, deltaY: number) {
    //     this.cameraYaw -= deltaX * this.mouseSensitivity
    //     this.cameraPitch -= deltaY * this.mouseSensitivity
        
    //     this.cameraPitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, this.cameraPitch))
        
    //     this.updateCameraDirection()
    // }

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