import { Entity } from "../Entity";

export interface IComponentParams{}

export class Component{
    
    public get name(){
        return 'GenericComponent'
    }

    public get entity(){
        return this._entity
    }
    public get gameManager(){
        return this.entity.manager.manager
    }
    public get params(){
        return this._params
    }

    get scene(){
        return this.entity.scene
    }

    public update: (event)=>void | null = null

    private _enabled: boolean = true
    public get isEnabled(){
        return this._enabled
    }

    public get inputMap(){
        return this._entity.inputMap
    }

    constructor(private _params: IComponentParams, private _entity: Entity){}

    public registerEvent(eventName, callback: (event) => void = null) {
        this.entity.registerEvent(eventName, callback)
    }

    broadcastEvent(event) {
        console.log(event)
        this.entity.broadcastEvent(event)
    }

    subscribeToEvent(event, callback){
        this.entity.subscribeToEvent(event, callback)
    }

    unsubscribeToEvent(event, callback){
        this.entity.unsubscribeToEvent(event, callback)
    }

    getProperty(name: string){
        return (this.params as any)[name]
    }

    public dispose: ()=>void | null = null
}