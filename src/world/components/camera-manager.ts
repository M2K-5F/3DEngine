import type { Camera } from "../../engine/components/camera";

export class CameraManager {
    constructor(
        private _camera: Camera
    ) {}

    getCamera() {
        return this._camera
    }

    bindCamera(camera: Camera) {
        this._camera = camera
    }
}
