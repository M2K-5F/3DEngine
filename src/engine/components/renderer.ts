import { MatrixFabric } from "../../maths/matrix4"
import { ThingTransform } from "../../thing/components/transform"
import { ThingMesh } from "../../thing/components/mesh"
import type { Mesh } from "../../shared/mesh"
import type { CameraRotation } from "./camera"
import type { Point3 } from "../../maths/point3"
import { Vector3 } from "../../maths/vector3"
import FS_MAIN from "../shaders/game-smoke.frag?raw"
import VS_MAIN from "../shaders/main.vert?raw"
import type { World } from "../../world/world"
import type { Material } from "../../shared/material"

export type RendererConfig = {
    width: number
    height: number,
    far: number,
    near: number,
    fov: number
    fallbackTextureColor: Vector3,
}


type BufferCache = {
    vao: WebGLVertexArrayObject
    indices: WebGLBuffer
    vertices: WebGLBuffer
    indicesCount: number
}


export class Renderer  {
    private _meshBufferCache: Map<Mesh, BufferCache> = new Map()
    private _textureCache: Map<Material, WebGLTexture> = new Map()

    private config: RendererConfig
    private canvas: HTMLCanvasElement
    private gl: WebGL2RenderingContext
    private program: WebGLProgram
    private fallbackTexture: WebGLTexture

    private attributes = {
        point: -1,
        normal: -1,
        uv: -1
    }

    private uniforms: {
        vp: WebGLUniformLocation | null
        m: WebGLUniformLocation | null
        lightDir: WebGLUniformLocation | null
        color: WebGLUniformLocation | null
        texture: WebGLUniformLocation | null
        position: WebGLUniformLocation | null
    } = {
        vp: null,
        m: null,
        lightDir: null,
        color: null,
        texture: null,
        position: null
    }
    
    constructor(config: RendererConfig) {
        this.config = config

        const root = document.getElementById('root')!

        this.canvas = document.createElement('canvas')
        root.append(this.canvas)
        this.canvas.width = config.width; this.canvas.height = config.height

        this.gl = this.canvas.getContext('webgl2')!

        this.program = createProgram(this.gl)
        this.uniforms.vp = this.gl.getUniformLocation(this.program, "uVP")
        this.uniforms.m = this.gl.getUniformLocation(this.program, "uM")
        this.uniforms.texture = this.gl.getUniformLocation(this.program, "uTexture")
        this.uniforms.lightDir = this.gl.getUniformLocation(this.program, 'uLightDir')
        this.uniforms.color = this.gl.getUniformLocation(this.program, 'uColor')
        this.uniforms.position = this.gl.getUniformLocation(this.program, "uPosition")

        this.attributes.point = this.gl.getAttribLocation(this.program, 'aPoint')
        this.attributes.normal = this.gl.getAttribLocation(this.program, "aNormal")
        this.attributes.uv = this.gl.getAttribLocation(this.program, 'aUV')

        this.fallbackTexture = createFallbackTexture(this.gl, config.fallbackTextureColor.multiplyScalar(255))

        this.gl.useProgram(this.program)

        this.gl.uniform3f(this.uniforms.lightDir, 1, 1, 0)


        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.clearColor(1, 1, 0, 0.5)
    }


    public removeMesh(mesh: Mesh) {
        const cache = this._meshBufferCache.get(mesh) 
        if (!cache) return 0

        this.gl.deleteVertexArray(cache.vao)
        this.gl.deleteBuffer(cache.indices)
        this.gl.deleteBuffer(cache.vertices)
        this._meshBufferCache.delete(mesh)
        return 1
    }


    public clearFrame() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    }


    public render(world: World) {
        const camera = world.camera.getCamera()

        const v = createViewMatrix(camera.position, camera.rotation)
        const p = createProjectionMatrix(this.config.fov, this.config.width/this.config.height, this.config.far, this.config.near)
        const vp = p.multiplyBy(v)
        this.gl.uniformMatrix4fv(this.uniforms.vp, false, new Float32Array(vp.m))
        this.gl.uniform3f(this.uniforms.position, camera.position.x, camera.position.y, camera.position.z)

        const things = world.entities.query(ThingTransform, ThingMesh)

        things.forEach(thing => {
            const transform = thing.getComponent(ThingTransform)!
            const mesh = thing.getComponent(ThingMesh)!

            const m = createModelMatrix(transform)

            const bufferCache = this._getMeshBufferCache(mesh.mesh)

            this.gl.bindVertexArray(bufferCache.vao)
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bufferCache.indices)
            this.gl.uniformMatrix4fv(this.uniforms.m, false, new Float32Array(m.m))

            const texture = mesh.material ? this._getTextureCache(mesh.material) : this.fallbackTexture
            
            this.gl.activeTexture(this.gl.TEXTURE0)
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
            this.gl.uniform1i(this.uniforms.texture, 0)

            this.gl.drawElements(this.gl.TRIANGLES, bufferCache.indicesCount, this.gl.UNSIGNED_SHORT, 0)
        })
    }

    private _getMeshBufferCache(mesh: Mesh) {
        if (this._meshBufferCache.has(mesh)) {
            return this._meshBufferCache.get(mesh)!
        }

        const vertices = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, mesh.vertices, this.gl.STATIC_DRAW)

        const indices = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indices)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indices, this.gl.STATIC_DRAW)        
        
        const vao = this.gl.createVertexArray()

        this.gl.bindVertexArray(vao)
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices)
            this.gl.vertexAttribPointer(this.attributes.point, 3, this.gl.FLOAT, false, 32, 0)
            this.gl.enableVertexAttribArray(this.attributes.point)

            this.gl.vertexAttribPointer(this.attributes.normal, 3, this.gl.FLOAT, false, 32, 12)
            this.gl.enableVertexAttribArray(this.attributes.normal)

            this.gl.vertexAttribPointer(this.attributes.uv, 2, this.gl.FLOAT, false, 32, 24)
            this.gl.enableVertexAttribArray(this.attributes.uv)


            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indices)

        const bufferCache: BufferCache = {
            vao,
            vertices,
            indices,
            indicesCount: mesh.indices.length
        }

        this._meshBufferCache.set(mesh, bufferCache)

        return bufferCache
    }


    private _getTextureCache(material: Material): WebGLTexture {
        if (this._textureCache.has(material)) {
            return this._textureCache.get(material)!
        }

        const gl = this.gl
        const texture = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture)

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, material.bitmap)
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        
        gl.generateMipmap(gl.TEXTURE_2D)

        this._textureCache.set(material, texture)
        
        return texture
    }
}


const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VS_MAIN)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_MAIN)
    
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Program link failed')
    }
    
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    
    return program
}


const compileShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`Shader compile failed`)
    }
    
    return shader
}


function createModelMatrix(transform: ThingTransform) {
    let matrix = MatrixFabric.getTranslationMatrix(transform.position.x, transform.position.y, transform.position.z)
            

    if (transform.rotation.x) matrix = matrix.multiplyBy(
        MatrixFabric.getRotationXMatrix(transform.rotation.x)
    )

    if (transform.rotation.y) matrix = matrix.multiplyBy(
        MatrixFabric.getRotationYMatrix(transform.rotation.y)
    )

    if (transform.rotation.z) matrix = matrix.multiplyBy(
        MatrixFabric.getRotationZMatrix(transform.rotation.z)
    )

    
    return matrix.multiplyBy(
        MatrixFabric.getScaleMatrix(1, 1, 1)
    )
}

function createViewMatrix(position: Point3, rotation: CameraRotation) {
    const forwardX = Math.sin(rotation.horizontal) * Math.cos(rotation.vertical)
    const forwardY = -Math.sin(rotation.vertical)
    const forwardZ = Math.cos(rotation.horizontal) * Math.cos(rotation.vertical)

    const forwardVector = new Vector3(forwardX, forwardY, forwardZ).normalize()

    const target = position.addVector(forwardVector)
    return MatrixFabric.getLookAtMatrix(
            position, 
            target, 
            new Vector3(0, 1, 0)
        )
}


function createProjectionMatrix(fov: number, aspect: number, far: number, near: number) {
    return MatrixFabric.getProjectionMatrix({fov, aspect, far, near})
}


function createFallbackTexture(gl: WebGL2RenderingContext, textureColor: Vector3) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([textureColor.x, textureColor.y, textureColor.z, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    return texture
}