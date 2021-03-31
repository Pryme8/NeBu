import { Observer, Scene } from "@babylonjs/core"
import { Entity } from "../Entity"
import { GameManager } from "../GameManager"


export interface IEntityManagerParams{}

export class EntityManager{
    private _ids: number = 0
    public getCurrentId(increment: boolean = true): number{
        const id = this._ids
        if(increment){
            this._ids++
        }
        return id
    }

    private _entities: any = {}
    get entities(){
        return this._entities
    }
    private _entityStack : Entity[] = []
    get entityStack(){
        return this._entityStack
    }

    get manager(){
        return this._manager
    }

    public get inputMap(){
        return this.manager.inputMap
    }

    get scene(){
        return this.manager.scene
    }

    private _updateObs: Observer<Scene> = null

    constructor(private _manager: GameManager){
        this._updateObs = this.scene.onBeforeRenderObservable.add(()=>{
            this.update(this.manager.delta)
        })
    }

    public getEntityById(id:string|number){
        return this.entities[id]
    }    

    public getUniqueEntities(){
        return (Object.keys(this.entities)
        .filter( key => (!Array.isArray(this.entities[key])))
        .reduce( (res, key) => (res[key] = this.entities[key], res), {} ))
    }

    public getUniqueEntitiesAsArray(){
        const results: Entity[] = []
        const uniqueEntities = this.getUniqueEntities()
        Object.keys(uniqueEntities).forEach((key)=>{
            results.push(uniqueEntities[key])
        })
        return results
    }

    public getEntityByName(name:string){
        return this.entities[name]
    }

    public getFirstEntityByName(name:string){
        return this.entities[name][0]
    }

    public AddEntity(entityType, params){
        params.name  = params.name ?? 'UnknownEntity'
        const entity = new entityType(params, this)
        this.entities[entity.id] = entity
        if(!this.entities[params.name]){
            this.entities[params.name] = []
        }
        this.entities[params.name].push(entity)
        this._entityStack = this.getUniqueEntitiesAsArray()
        return entity
    }

    public update(delta:number){
        const entities = this.entityStack
        entities.forEach((entity:Entity)=>{
            if(!entity.isEnabled || !entity.update){
                return
            }
            entity.update(delta)
        })
    }

    public cleanupDisposed(entity){
        let index = this.entityStack.indexOf(entity)
        this.entityStack.splice(index, 1)
        index = this.entities[entity.name].indexOf(entity)
        this.entities[entity.name].splice(index, 1)
        delete this.entities[entity.id]
    }
}