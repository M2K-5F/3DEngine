import type { FrameTime, System } from "../../interfaces"
import type { World } from "../../world/world"

export class MouseRotationSystem implements System {
    private container: HTMLDivElement
    private mouseLocked: boolean = false
    private sensitivity: number = 0.002
    
    private deltaX: number = 0
    private deltaY: number = 0

    constructor() {
        this.container = document.getElementById('root') as HTMLDivElement
        this.setupMouse()
    }
    
    private setupMouse() {
        this.container.addEventListener('click', () => this.container.requestPointerLock())
        
        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.container
        })

        document.addEventListener('mousemove', (e) => {
            if (this.mouseLocked) {
                this.deltaX -= e.movementX * this.sensitivity
                this.deltaY += e.movementY * this.sensitivity
            }
        })
    }

    update(dt: FrameTime, world: World): void {
        if (this.mouseLocked && (this.deltaX !== 0 || this.deltaY !== 0)) {
            const camera = world.camera.getCamera()
            camera.rotate(this.deltaX, this.deltaY)
            this.deltaX = 0
            this.deltaY = 0
        }
    }
}
