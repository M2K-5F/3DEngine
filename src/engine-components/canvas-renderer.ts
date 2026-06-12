
import type { EngineModelController } from "../engine-model-controller"
import type { IRenderer } from "../interfaces"
import type { Matrix4 } from "../maths/matrix4"


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


    public addModelGeometry(controller: EngineModelController, cache: ModelCachedGeometry) {
        const vertices = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, cache.vertices, this.gl.STATIC_DRAW)

        const indices = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indices)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, cache.indices, this.gl.STATIC_DRAW)
        
        const vao = this.gl.createVertexArray()

        this.gl.bindVertexArray(vao)
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices)
            this.gl.vertexAttribPointer(this.attributes.point, 3, this.gl.FLOAT, false, 24, 0)
            this.gl.enableVertexAttribArray(this.attributes.point)

            this.gl.vertexAttribPointer(this.attributes.normal, 3, this.gl.FLOAT, false, 24, 12)
            this.gl.enableVertexAttribArray(this.attributes.normal)


            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indices)

        this.gl.bindVertexArray(null)

        this.modelBuffers.set(controller, {
            vao,
            vertices,
            indices,
            indicesCount: cache.indices.length
        })
    }


    public removeModelGeometry(controller: EngineModelController) {
        const model = this.modelBuffers.get(controller)

        if (model) {
            this.gl.deleteVertexArray(model.vao)
            this.gl.deleteBuffer(model.indices)
            this.gl.deleteBuffer(model.vertices)
            this.modelBuffers.delete(controller)
        }
    }


    public clearFrame() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    }


    public render(vp: Matrix4) {
        this.gl.uniformMatrix4fv(this.uniforms.vp, false, new Float32Array(vp.m))
        
        this.modelBuffers.forEach((model, controller) => {
            this.gl.bindVertexArray(model.vao)

            this.gl.uniformMatrix4fv(this.uniforms.m, false, new Float32Array(controller.getMatrix().m))

            const color = controller.getColor()
            this.gl.uniform3f(this.uniforms.color, color.x, color.y, color.z)

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