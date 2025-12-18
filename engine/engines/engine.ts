import { ScreenSettings } from "../interfaces"
import { Matrix4 } from "../matrix"
import { Point } from "../point"
import { Polygon3 } from "../polygon"
import { createDetailedCube } from "../polygons/cube"
import { createSphere } from "../polygons/sphere"
import { Vector } from "../vector"

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

export class GraphicEngine {
    
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
            Znear: 0.1,
            Zfar: 100
        },
        private polygonFabric = new PolygonManager(),
        private projectionMatrix = Matrix4.getProjectionMatrix(camera),
        private position = new Vector(0,0,2),
        private cameraSpeed = 0.1,
        public keys = new Set<string>(),
    ){
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase())
        })

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase())
        })

        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCanvas.width = this.canvas.width
        this.offscreenCanvas.height = this.canvas.height
        this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
    }

    renderPolygons(
        polygons: Polygon3[],
        xOffset: number = 0,
        yOffset: number = 0,
        zOffset: number = 0,
    ) {
        const vectors = [new Vector(0,0,0), new Vector(0,0,0), new Vector(0,0,0)] as const
    
        for (const polygon of polygons) {
            const v1 = polygon.v1
            const v2 = polygon.v2  
            const v3 = polygon.v3

            const edge1X = v2.x - v1.x
            const edge1Y = v2.y - v1.y
            const edge1Z = v2.z - v1.z

            const edge2X = v3.x - v1.x
            const edge2Y = v3.y - v1.y
            const edge2Z = v3.z - v1.z

            const normalX = edge1Y * edge2Z - edge1Z * edge2Y
            const normalY = edge1Z * edge2X - edge1X * edge2Z
            const normalZ = edge1X * edge2Y - edge1Y * edge2X

            const viewX = v1.x - this.position.x
            const viewY = v1.y - this.position.y  
            const viewZ = v1.z - this.position.z

            const dot = normalX * viewX + normalY * viewY + normalZ * viewZ

            if (dot > 0) {
                continue
            }

            vectors[0].x = polygon.v1.x + this.position.x + xOffset
            vectors[0].y = polygon.v1.y + this.position.y + yOffset
            vectors[0].z = polygon.v1.z + this.position.z + zOffset

            vectors[1].x = polygon.v2.x + this.position.x + xOffset
            vectors[1].y = polygon.v2.y + this.position.y + yOffset
            vectors[1].z = polygon.v2.z + this.position.z + zOffset

            vectors[2].x = polygon.v3.x + this.position.x + xOffset
            vectors[2].y = polygon.v3.y + this.position.y + yOffset
            vectors[2].z = polygon.v3.z + this.position.z + zOffset


            if (vectors[0].z <  0.1 || vectors[1].z < 0.1 || vectors[2].z < 0.1) {
                continue
            }

            const res1 = this.projectionMatrix.transformVector(vectors[0])
            const res2 = this.projectionMatrix.transformVector(vectors[1])
            const res3 = this.projectionMatrix.transformVector(vectors[2])

            const p2 = res2.normalizeToScreen(this.camera)
            const p1 = res1.normalizeToScreen(this.camera)
            const p3 = res3.normalizeToScreen(this.camera)

            this.drawPoints(p1, p2, p3)
        }
    }

    renderCube(
        xOffset: number = 0,
        yOffset: number = 0,
        zOffset: number = 0,
    ) {
        this.renderPolygons(
            this.polygonFabric.cubePolygons(),
            xOffset,
            yOffset,
            zOffset,
        )
    }

    renderSphere(
        xOffset: number = 0,
        yOffset: number = 0,
        zOffset: number = 0,
    ) {
        this.renderPolygons(
            this.polygonFabric.spherePolygons(),
            xOffset,
            yOffset,
            zOffset
        )
    }

    drawPoints(p1: Point, p2: Point, p3: Point) {
        this.offscreenCtx.beginPath()
        this.offscreenCtx.moveTo(p1.x, p1.y)
        this.offscreenCtx.lineTo(p2.x, p2.y)
        this.offscreenCtx.lineTo(p3.x, p3.y)  
        this.offscreenCtx.fillStyle = "red"
        this.offscreenCtx.closePath()
        this.offscreenCtx.stroke()
        // this.offscreenCtx.fill()
    }
    
    handleInput() {

        if (this.keys.has('w')) {
            this.position.z -= this.cameraSpeed
        }
        if (this.keys.has('s')) {
            this.position.z += this.cameraSpeed
        }
        if (this.keys.has('a')) {
            this.position.x -= this.cameraSpeed
        }
        if (this.keys.has('d')) {
            this.position.x += this.cameraSpeed
        }
        if (this.keys.has('q')) {
            this.position.y -= this.cameraSpeed
        }
        if (this.keys.has('e')) {
            this.position.y += this.cameraSpeed
        }
    }

    animate() {
        const callback = () => {
            this.offscreenCtx.clearRect(0,0, this.canvas.width, this.canvas.height)
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
            this.handleInput()
            // this.renderCube()
            this.renderSphere()
            
            this.ctx.drawImage(this.offscreenCanvas, 0, 0)
            requestAnimationFrame(callback)
        }
        callback()
    }
}