
import type { EngineModelController } from "../engine-model-controller"
import type { IRenderer } from "../interfaces"
import type { Matrix4 } from "../maths/matrix4"


const VS_MAIN = `#version 300 es

in vec3 aPoint;
in vec3 aNormal;
uniform mat4 uMatrix;
out vec3 vNormal;

void main() {
    vNormal = aNormal;
    gl_Position = uMatrix * vec4(aPoint, 1.0);
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


type ModelCachedGeometry = {
    vertices: Float32Array
    indices: Uint16Array
}


type CachedModel = {
    vao: WebGLVertexArrayObject
    indices: WebGLBuffer
    vertices: WebGLBuffer
    indicesCount: number
}


export class CanvasRenderer implements IRenderer {
    private modelBuffers: Map<EngineModelController, CachedModel> = new Map()

    private canvas: HTMLCanvasElement
    private gl: WebGL2RenderingContext
    private program: WebGLProgram

    private aPoint: number
    private aNormal: number
    private uMatrix: WebGLUniformLocation | null
    private uLightDir: WebGLUniformLocation | null
    private uColor: WebGLUniformLocation | null
    
    constructor(config: RendererConfig) {
        const root = document.getElementById('root')!

        this.canvas = document.createElement('canvas')
        root.append(this.canvas)
        this.canvas.width = config.width; this.canvas.height = config.height

        this.gl = this.canvas.getContext('webgl2')!

        this.program = createProgram(this.gl)
        this.uMatrix = this.gl.getUniformLocation(this.program, "uMatrix")
        this.uLightDir = this.gl.getUniformLocation(this.program, 'uLightDir')
        this.aPoint = this.gl.getAttribLocation(this.program, 'aPoint')
        this.uColor = this.gl.getUniformLocation(this.program, 'uColor')
        this.aNormal = this.gl.getAttribLocation(this.program, "aNormal")

        this.gl.useProgram(this.program)

        this.gl.uniform3f(this.uLightDir, 1, 1, 0)


        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.clearColor(1, 1, 1, 0.5)
    }


    addModelGeometry(controller: EngineModelController, cache: ModelCachedGeometry) {
        const vertices = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, cache.vertices, this.gl.STATIC_DRAW)

        const indices = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indices)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, cache.indices, this.gl.STATIC_DRAW)
        
        const vao = this.gl.createVertexArray()

        this.gl.bindVertexArray(vao)
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices)
            this.gl.vertexAttribPointer(this.aPoint, 3, this.gl.FLOAT, false, 24, 0)
            this.gl.enableVertexAttribArray(this.aPoint)

            this.gl.vertexAttribPointer(this.aNormal, 3, this.gl.FLOAT, false, 24, 12)
            this.gl.enableVertexAttribArray(this.aNormal)


            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indices)

        this.gl.bindVertexArray(null)

        this.modelBuffers.set(controller, {
            vao,
            vertices,
            indices,
            indicesCount: cache.indices.length
        })
    }


    removeModelGeometry(controller: EngineModelController) {
        const model = this.modelBuffers.get(controller)

        if (model) {
            this.gl.deleteVertexArray(model.vao)
            this.gl.deleteBuffer(model.indices)
            this.gl.deleteBuffer(model.vertices)
            this.modelBuffers.delete(controller)
        }
    }


    clearFrame() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    }


    render(vp: Matrix4) {
        this.modelBuffers.forEach((model, controller) => {
            const mvp = vp.multiplyBy(controller.getMatrix())

            this.gl.bindVertexArray(model.vao)

            this.gl.uniformMatrix4fv(this.uMatrix, false, new Float32Array(mvp.m))

            this.gl.uniform3f(this.uColor, 100, 100, 1)

            this.gl.drawElements(this.gl.TRIANGLES, model.indicesCount, this.gl.UNSIGNED_SHORT, 0)
            
            this.gl.bindVertexArray(null)
        })
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