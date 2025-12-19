import { Point } from "jspdf"
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
            0  // w=0 для вектора
        )
    }

    toScreenPixel(screen: ScreenSettings): Pixel {
        const x = screen.centerX - this.x * screen.scale
        const y = screen.centerY + this.y * screen.scale
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
            f / settings.aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, -(settings.Zfar + settings.Znear) / (settings.Zfar - settings.Znear), -(2 * settings.Zfar * settings.Znear) / (settings.Zfar - settings.Znear),
            0, 0, -1, 0
        ])
    }

    // static lookAt(eye: Vector, target: Vector, up: Vector): Matrix4 {
    //     const z = eye.subtract(target).normalize()
    //     const x = up.cross(z).normalize()
    //     const y = z.cross(x).normalize()
        
    //     return new Matrix4([
    //         x.x, y.x, z.x, 0,
    //         x.y, y.y, z.y, 0,
    //         x.z, y.z, z.z, 0,
    //         -x.dot(eye), -y.dot(eye), -z.dot(eye), 1
    //     ])
    // }

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
        new Point3(-half, -half, -half),  // 0: лево-низ-зад
        new Point3( half, -half, -half),  // 1: право-низ-зад
        new Point3( half,  half, -half),  // 2: право-верх-зад
        new Point3(-half,  half, -half),  // 3: лево-верх-зад
        new Point3(-half, -half,  half),  // 4: лево-низ-перед
        new Point3( half, -half,  half),  // 5: право-низ-перед
        new Point3( half,  half,  half),  // 6: право-верх-перед
        new Point3(-half,  half,  half),  // 7: лево-верх-перед
    ]
    
    const faces = [
        // Передняя грань (Z = +half)
        [4, 5, 6, 7],  // Все нормали наружу
        // Задняя грань (Z = -half)
        [1, 0, 3, 2],  // Обратный порядок чтобы нормаль наружу
        // Верхняя грань (Y = +half)
        [3, 7, 6, 2],
        // Нижняя грань (Y = -half)
        [1, 5, 4, 0],
        // Правая грань (X = +half)
        [5, 1, 2, 6],
        // Левая грань (X = -half)
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


export function createSphere(centerX: number, centerY: number, centerZ: number, radius: number = 1, segments: number = 16): Polygon3[] {
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
    
    return polygons
}

class PolygonManager{
    constructor(
        private sphere = createSphere(0, 0, 0, 1, 16),
        private cube = createDetailedCube(0, 0, 0, 1, 2)
    ) {}

    spherePolygons() {
        return this.sphere
    }

    cubePolygons() {
        return this.cube
    }
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
    offsetX?: number,
    offsetY?: number,
    offsetZ?: number,
    angleX?: number,
    angleY?: number,
    angleZ?: number,
    color?: `rgb(${number},${number},${number})`,
    debugMode?: boolean
}

export class EngineModel{
    constructor(
        public polygons: Polygon3[],
    ){}
}

export type EngineDrawer = (model: EngineModel, settings: ModelSettings) => void

export class GraphicEngine {
    private polygonQueue: Array<{
        polygon: Polygon3,
        color: string,
        depth: number,
        dot: number
    }> = []
    
    private offscreenCanvas: HTMLCanvasElement
    private offscreenCtx: CanvasRenderingContext2D

    constructor(
        private canvas = <HTMLCanvasElement> document.getElementById("maincnv")!,
        private ctx = canvas.getContext("2d")!,
        private camera: ScreenSettings = {
            fov: 90, 
            centerX: canvas.width / 2, 
            centerY: canvas.height / 2, 
            scale: 100,
            aspect: canvas.width / canvas.height,
            Znear: 0.1
            ,
            Zfar: 100
        },
        private projectionMatrix = Matrix4.getProjectionMatrix(camera),
        private position = new Vector3(0,0,2),
        private cameraSpeed = 0.1,
        public keys = new Set<string>(),
    ) {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase())
        })
        console.log(this.canvas.width);
        

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase())
        })

        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCanvas.width = this.canvas.width
        this.offscreenCanvas.height = this.canvas.height
        this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
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
            const newPoly = new Polygon3(
                points[0],
                points[1], 
                points[2],
            )
            let translatedPolygon: Polygon3 = newPoly
                .addVector(this.position)

            if (settings.offsetX || settings.offsetY || settings.offsetZ) {
                translatedPolygon = translatedPolygon.addVector(
                    new Vector3(
                        settings.offsetX || 0, 
                        settings.offsetY || 0, 
                        settings.offsetZ || 0
                    )
                )   
            }
            this.addPolygonToQueue(translatedPolygon, settings.color || "green")
        }
    }

    private addPolygonToQueue(polygon: Polygon3, color: string) {
        const [p1, p2, p3] = polygon.spread()
        
        const normalVector = polygon.normal()
        const center = polygon.center()
        const viewVector = center.vectorTo(new Point3(0,0,0))
        const dot = viewVector.normalize().dot(normalVector.normalize())
        if (dot < 0) return
        
        if (p1.z < 0.1 || p2.z < 0.1 || p3.z < 0.1) {
            return
        }
        
        const avgDepth = (p1.z + p2.z + p3.z) / 3
        
        this.polygonQueue.push({
            polygon,
            color,
            depth: avgDepth,
            dot: dot
        })
    }

    private drawPolygon(polygon: Polygon3, color: `rgb(${number},${number},${number})`| "green" ) {
        const [p1, p2, p3] = polygon.spread()
        const normalVector = polygon.normal()
        const center = polygon.center()
        
        const viewVector = center.vectorTo(new Point3(0,0,0))
        
        const dot = viewVector.normalize().dot(normalVector.normalize())
        if (dot < 0) return

        if (p1.z < 0.1 || p2.z < 0.1 || p3.z < 0.1) {
            return
        }
        
        const pj1 = this.projectionMatrix.transform(p1)
        const pj2 = this.projectionMatrix.transform(p2)
        const pj3 = this.projectionMatrix.transform(p3)
        
        const px1 = pj1.toScreenPixel(this.camera)
        const px2 = pj2.toScreenPixel(this.camera)
        const px3 = pj3.toScreenPixel(this.camera)
        let RGB: string
        if (color === "green") {
            const dia = 50 + 150 * Math.max(0, dot)
            RGB = `rgb(${dia},${255 },${dia})`
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

    private drawDebugNormals(polygon: Polygon3) {
        const normal = polygon.normal()
        const center = polygon.center()
        const normalEnd = center.addVector(normal.multiplyScalar(0.2))
    
        const pjcenter = this.projectionMatrix.transform(center)
        const pjnormalend = this.projectionMatrix.transform(normalEnd)

        const pixelCenter = pjcenter.toScreenPixel(this.camera)
        const pixelNormalEnd = pjnormalend.toScreenPixel(this.camera)
    
        
        this.offscreenCtx.beginPath()
        this.offscreenCtx.moveTo(pixelCenter.x, pixelCenter.y)
        this.offscreenCtx.lineTo(pixelNormalEnd.x, pixelNormalEnd.y)
        this.offscreenCtx.strokeStyle = "blue"
        this.offscreenCtx.lineWidth = 2
        this.offscreenCtx.stroke()
        this.offscreenCtx.lineWidth = 1
        this.offscreenCtx.strokeStyle = "black"
    }
    
    private handleInput() {
        if (this.keys.has('w')) {
            this.position.z -= this.cameraSpeed
        }
        if (this.keys.has('s')) {
            this.position.z += this.cameraSpeed
        }
        if (this.keys.has('a')) {
            this.position.x += this.cameraSpeed
        }
        if (this.keys.has('d')) {
            this.position.x -= this.cameraSpeed
        }
        if (this.keys.has('q')) {
            this.position.y += this.cameraSpeed
        }
        if (this.keys.has('e')) {
            this.position.y -= this.cameraSpeed
        }
    }

    private drawPolygonDirectly(polygon: Polygon3, color: string, dot: number) {
        const [p1, p2, p3] = polygon.spread()
        
        const pj1 = this.projectionMatrix.transform(p1)
        const pj2 = this.projectionMatrix.transform(p2)
        const pj3 = this.projectionMatrix.transform(p3)
        
        const px1 = pj1.toScreenPixel(this.camera)
        const px2 = pj2.toScreenPixel(this.camera)
        const px3 = pj3.toScreenPixel(this.camera)
        
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

        const drawer = (model: EngineModel, settings?: ModelSettings) => {
            this.renderModel(model, settings || {})
        }
        callback(drawer)
        
        this.polygonQueue.sort((a, b) => b.depth - a.depth)
        
        for (const item of this.polygonQueue) {
            this.drawPolygonDirectly(item.polygon, item.color, item.dot)
        }
        
        this.ctx.drawImage(this.offscreenCanvas, 0, 0)
    }
}