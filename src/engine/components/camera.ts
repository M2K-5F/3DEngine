import { Point3 } from "../../maths/point3"


export type CameraRotation = { horizontal: number, vertical: number }


export class Camera {    
    public position = new Point3(0, 0, 0)
    public rotation: CameraRotation = { horizontal: 0, vertical: 0 }

    public rotate(deltaX: number, deltaY: number) {
        this.rotation.horizontal += deltaX
        this.rotation.vertical += deltaY

        const maxVerticalAngle = Math.PI / 2 - 0.05
        this.rotation.vertical = Math.max(-maxVerticalAngle, Math.min(maxVerticalAngle, this.rotation.vertical))
    }
}