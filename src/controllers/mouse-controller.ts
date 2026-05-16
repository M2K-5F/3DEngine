import type { ICamera } from "../interfaces"

export class MouseController {
    private camera: ICamera
    private container: HTMLDivElement
    private mouseLocked: boolean = false
    private sensitivity: number = 0.002
    
    constructor(camera: ICamera) {
        this.camera = camera
        this.container = document.getElementById('root') as HTMLDivElement
        this.setupMouse()
    }
    
    private setupMouse() {
        this.container.addEventListener('click', () => {
            this.container.requestPointerLock()
        })
        
        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.container
        })
        
        document.addEventListener('mousemove', (e) => {
            if (this.mouseLocked) {
                this.camera.rotate(
                    - e.movementX * this.sensitivity,
                    - e.movementY * this.sensitivity
                )
            }
        })
    }
}