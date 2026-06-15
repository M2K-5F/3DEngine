import { Thing, type ComponentClass } from "./thing/thing";

export class World {
    private entities: Thing[] = []

    public createThing(id: number): Thing {
        const entity = new Thing(id)
        this.entities.push(entity)
        return entity
    }

    public query(...componentClasses: ComponentClass<any>[]): Thing[] {
        return this.entities.filter(entity => 
            componentClasses.every(compClass => entity.hasComponent(compClass))
        )
    }

    public getAll(): Thing[] {
        return this.entities
    }
}
