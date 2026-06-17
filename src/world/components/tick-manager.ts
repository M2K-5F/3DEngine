import type { FrameTime } from "../../interfaces"

export class TickManager {
    public last?: number

    tick() {
        const now = Date.now()
        const dt = (now - (this.last ?? now)) / 1000 as FrameTime
        this.last = now 
        return dt
    }
}