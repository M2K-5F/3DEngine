import type { IRenderer } from "../../interfaces"
import { MatrixFabric, type Matrix4 } from "../../maths/matrix4"
import type { World } from "../../world"
import { ThingTransform } from "../../thing/components/transform"
import { ThingMesh } from "../../thing/components/mesh"
import type { Mesh } from "../../shared/mesh"


const VS_MAIN = `#version 300 es

in vec3 aPoint;
in vec3 aNormal;
uniform mat4 uVP;
uniform mat4 uM;
out vec3 vNormal;

void main() {
    vNormal = mat3(uM) * aNormal;
    gl_Position = (uVP * uM) * vec4(aPoint, 1.0);
}
`

const FS_MAIN = `#version 300 es

precision highp float;
uniform vec3 uColor;
uniform vec3 uLightDir;
in vec3 vNormal;
out vec4 outColor;

void main() {
    float intensity = dot(normalize(vNormal), normalize(uLightDir));
    intensity = max(0.1, intensity);
    
    outColor = vec4(uColor * intensity, 1.0);
}
`


export type RendererConfig = {
    width: number
    height: number    
}


type BufferCache = {
    vao: WebGLVertexArrayObject
    indices: WebGLBuffer
    vertices: WebGLBuffer
    indicesCount: number
}


export class CanvasRenderer implements IRenderer {
    private _meshBufferCache: Map<Mesh, BufferCache> = new Map()

    private canvas: HTMLCanvasElement
    private gl: WebGL2RenderingContext
    private program: WebGLProgram

    private attributes = {
        point: -1,
        normal: -1
    }

    private uniforms: {
        vp: WebGLUniformLocation | null
        m: WebGLUniformLocation | null
        lightDir: WebGLUniformLocation | null
        color: WebGLUniformLocation | null
    } = {
        vp: null,
        m: null,
        lightDir: null,
        color: null
    }
    
    constructor(config: RendererConfig) {
        const root = document.getElementById('root')!

        this.canvas = document.createElement('canvas')
        root.append(this.canvas)
        this.canvas.width = config.width; this.canvas.height = config.height

        this.gl = this.canvas.getContext('webgl2')!

        this.program = createProgram(this.gl)
        this.uniforms.vp = this.gl.getUniformLocation(this.program, "uVP")
        this.uniforms.m = this.gl.getUniformLocation(this.program, "uM")
        this.uniforms.lightDir = this.gl.getUniformLocation(this.program, 'uLightDir')
        this.uniforms.color = this.gl.getUniformLocation(this.program, 'uColor')

        this.attributes.point = this.gl.getAttribLocation(this.program, 'aPoint')
        this.attributes.normal = this.gl.getAttribLocation(this.program, "aNormal")

        this.gl.useProgram(this.program)

        this.gl.uniform3f(this.uniforms.lightDir, 1, 1, 0)


        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.clearColor(1, 1, 1, 0.5)
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


    public render(vp: Matrix4, world: World) {
        this.gl.uniformMatrix4fv(this.uniforms.vp, false, new Float32Array(vp.m))

        const things = world.query(ThingTransform, ThingMesh)

        things.forEach(thing => {
            const transform = thing.getComponent(ThingTransform)!
            const mesh = thing.getComponent(ThingMesh)!

            const m = createModelMatrix(transform)

            const bufferCache = this._getMeshBufferCache(mesh.mesh)

            this.gl.bindVertexArray(bufferCache.vao)
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bufferCache.indices)


            this.gl.uniformMatrix4fv(this.uniforms.m, false, new Float32Array(m.m))

            this.gl.uniform3f(this.uniforms.color, mesh.color.x, mesh.color.y, mesh.color.z)
            

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
            this.gl.vertexAttribPointer(this.attributes.point, 3, this.gl.FLOAT, false, 24, 0)
            this.gl.enableVertexAttribArray(this.attributes.point)

            this.gl.vertexAttribPointer(this.attributes.normal, 3, this.gl.FLOAT, false, 24, 12)
            this.gl.enableVertexAttribArray(this.attributes.normal)


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