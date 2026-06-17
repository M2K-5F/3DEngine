import { Thing, type ComponentClass } from "../../thing/thing"

export class EntityManager {
    private entities: Thing[] = []

    public create(): Thing {
        const entity = new Thing(this.entities.length)
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
