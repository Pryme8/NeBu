import { Scene } from "@babylonjs/core"
import { Component } from "../Component"
import { EntityManager } from "../EntityManager"
import { GameManager } from "../GameManager"

export interface IEntityParams{
    name: string
}

export class Entity{
    private _id: number = null
    public get id(){
        return this._id
    }

    private _components : Component[] = []
    get components(){
        return this._components
    }

    private _events: Map<string, Array<(event)=> void>> = new Map<string, Array<(event)=> void>>()
    public get events(): Map<string, Array<(event)=> void>> {
        return this._events
    }

    public get manager():EntityManager {
        return this._manager
    }

    public get gameManager():GameManager {
        return this.manager.manager
    }

    public get inputMap(){
        return this.manager.inputMap
    }

    public get name():string {
        return this._params.name ?? `Entity${this.id}`
    }

    public get scene():Scene {
        return this.manager.scene
    }

    public get params():any {
        return this._params
    }

    private _enabled: boolean = true
    public get isEnabled(){
        return this._enabled
    }

    private _isDisposed: boolean = false
    public get isDisposed(){
        return this._isDisposed
    }

    constructor(private _params: IEntityParams, private _manager:EntityManager){
        this._id = this.manager.getCurrentId()
    }

    public AddComponent(component, params){        
        this.components.push(new component(params, this))
        return this.components[this.components.length-1]
    }

    public getComponentByName(name){        
        return this.components.filter((c)=>{
            return (c.name === name)
        })
    }

    public registerEvent(eventName, callback:(event) => void = null){
        this.events.set(eventName, [])
        if(callback !== null){
            this.subscribeToEvent(eventName, callback)
        }
        console.log(this.events)
    }

    public broadcastEvent(event) {
        if(this.events.has(event.name)){
            console.log(this.events.get(event.name))
            this.events.get(event.name).forEach((callback)=>{
                callback(event)
            })
        }
    }

    public subscribeToEvent(event, callback){
        if(this.events.has(event)){
            const callbacks = this.events.get(event) 
            callbacks.push(callback)
            this.events.set(event, callbacks) 
        }
    }

    public unsubscribeToEvent(event, callback){
        if(this.events.has(event.name)){
            const events = this.events.get(event.name)
            const index = events.indexOf(callback)
            if(index >= 0){
                events.splice(index, 1)
            }
            this.events.set(event.name, events)
        }
    }

    getProperty(name: string){
        return (this._params as any)[name]
    }

    public update(delta:number){
        this.components.forEach((component:Component)=>{
            if(component.update && component.isEnabled){
                component.update(delta)
            }                      
        })     
        if(this.onUpdate){
            this.onUpdate(delta)
        }   
    }

    public onUpdate: (delta:number)=>void | null = null

    public dispose(){
        this.components.forEach(comp=>{
            if(comp.dispose){
                comp.dispose()
            }
        }) 
        
        if(this.onDispose){
            this.onDispose()
        }

        this._isDisposed = true
        this.manager.cleanupDisposed(this)
    }

    public onDispose: ()=>void | null = null
}