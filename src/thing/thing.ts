export abstract class Component {}

export type ComponentClass<T extends Component> = new (...args: any[]) => T


export class Thing {
    public readonly id: number
    private components = new Map<ComponentClass<any>, Component>()

    constructor(id: number) {
        this.id = id
    }

    public addComponent<T extends Component>(component: T): this {
        this.components.set(component.constructor as ComponentClass<T>, component)
        return this
    }

    public getComponent<T extends Component>(componentClass: ComponentClass<T>): T | undefined {
        return this.components.get(componentClass) as T | undefined
    }

    public hasComponent(componentClass: ComponentClass<any>): boolean {
        return this.components.has(componentClass)
    }
}