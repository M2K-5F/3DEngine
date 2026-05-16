import type { Matrix4 } from "./matrix4"
import { Point3 } from "./point3"
import type { Vector3 } from "./vector3"

export class Polygon3 { 
    constructor( 
        public p1: Point3, 
        public p2: Point3, 
        public p3: Point3 
    ) {} 
    
    center(): Point3 { 
        return new Point3( 
            (this.p1.x + this.p2.x + this.p3.x) / 3, 
            (this.p1.y + this.p2.y + this.p3.y) / 3, 
            (this.p1.z + this.p2.z + this.p3.z) / 3 
        ) 
    }


    normal(): Vector3 { 
        const v1 = this.p1.vectorTo(this.p2) 
        const v2 = this.p1.vectorTo(this.p3) 
        return v1.cross(v2).normalize() 
    } 
    
    addVector(v: Vector3): Polygon3 { 
        return new Polygon3( 
            this.p1.addVector(v), 
            this.p2.addVector(v), 
            this.p3.addVector(v) 
        ) 
    } 
    
    isBackface(cameraPosition: Point3): boolean { 
        const center = this.center() 
        const normal = this.normal() 
        const viewVector = cameraPosition.subtract(center) 
        return viewVector.dot(normal) <= 0 
    } 
    
    transformByMatrix(matrix: Matrix4) { 
        return new Polygon3(...this.points.map(point => point.transformByMatrix(matrix)) as [Point3, Point3, Point3]) 
    } 
    
    get points() { return [this.p1, this.p2, this.p3] as const } 
}