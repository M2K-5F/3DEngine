import type { ICamera } from "../interfaces"
import { Vector3 } from "../maths/vector3"

type KeysState = {
    forward: boolean
    backward: boolean
    left: boolean
    right: boolean
    up: boolean
    down: boolean
    fast: boolean
}


export class KeyboardCameraController {
    camera: ICamera
    keys: KeysState = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
        fast: false,
    }
    private moveSpeed: number = 0.1
    private fastMoveSpeed: number = 0.3


    constructor(camera: ICamera) {
        this.camera = camera
        this.setupKeyboard()
    }

    private setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.forward = true; break
                case 's': this.keys.backward = true; break
                case 'a': this.keys.left = true; break
                case 'd': this.keys.right = true; break
                case 'q': this.keys.down = true; break
                case 'e': this.keys.up = true; break
                case 'shift': this.keys.fast = true; break
            }
        })
        
        window.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.forward = false; break
                case 's': this.keys.backward = false; break
                case 'a': this.keys.left = false; break
                case 'd': this.keys.right = false; break
                case 'q': this.keys.down = false; break
                case 'e': this.keys.up = false; break
                case 'shift': this.keys.fast = false; break
            }
        })
    }

    update() {
        const speed = this.keys.fast ? this.fastMoveSpeed : this.moveSpeed;
        
        let forward = 0
        let right = 0
        let up = 0
        
        if (this.keys.forward) forward += speed
        if (this.keys.backward) forward -= speed
        if (this.keys.right) right -= speed
        if (this.keys.left) right += speed
        if (this.keys.up) up += speed
        if (this.keys.down) up -= speed
        
        if (forward !== 0 || right !== 0 || up !== 0) {
            this.camera.move(new Vector3(right, up, forward))
        }
    }
}