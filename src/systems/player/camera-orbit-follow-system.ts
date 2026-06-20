import type { FrameTime, System } from "../../interfaces"
import { Point3 } from "../../maths/point3"
import { ThingTransform } from "../../thing/components/transform"
import type { ComponentClass } from "../../thing/thing"
import type { World } from "../../world/world"

export class CameraOrbitFollowSystem implements System {
    constructor(
        private followTag: ComponentClass<any> | null,
        private cameraDistance: number = 0,
        private cameraHeight: number = 0
    ) {}

    bindTag(tag: ComponentClass<any> | null) {
        this.followTag = tag
    }

    update(dt: FrameTime, world: World): void {
        if (!this.followTag) return 
        
        const [target] = world.entities.query(ThingTransform, this.followTag)
        if (!target) return

        const transform = target.getComponent(ThingTransform)!
        const camera = world.camera.getCamera()

        const hAngle = camera.rotation.horizontal
        const vAngle = camera.rotation.vertical

        const offsetX = -Math.sin(hAngle) * Math.cos(vAngle) * this.cameraDistance
        const offsetY = Math.sin(vAngle) * this.cameraDistance
        const offsetZ = -Math.cos(hAngle) * Math.cos(vAngle) * this.cameraDistance

        camera.position = new Point3(
            transform.position.x + offsetX,
            transform.position.y + offsetY + this.cameraHeight,
            transform.position.z + offsetZ
        )
    }
}
