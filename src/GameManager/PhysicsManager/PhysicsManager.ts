
import { AmmoJSPlugin, Scene, Vector3, Mesh, PhysicsImpostor } from "@babylonjs/core";
import * as ammo from "ammo.js";

import { GameManager } from "../GameManager";

export interface IImposterParams{
    type: number
    target : Mesh,
    options : any
}

export class PhysicsManager{  
    
    static Plugin = AmmoJSPlugin
    
    public get manager(){
        return this._manager
    }

    public get scene(): Scene{
        return this.manager.scene
    }  

    private _plugin = null
    public get plugin(){
        return this._plugin
    }  

    private _globalGravity = new Vector3(0, -9.6, 0)

    get globalGravity(){
        return this._globalGravity
    }

    public setGlobalGravity(gravity:Vector3){
        this._globalGravity = gravity
    }

    constructor(private _manager: GameManager, onDone:()=>void){
        const loadAmmo = (async () => {
            const Ammo = await ammo()
            this._plugin = new PhysicsManager.Plugin(true, Ammo)
            this.scene.enablePhysics(this.globalGravity, this.plugin)
            onDone()
        })()         
    }

    AddImposter(params: IImposterParams){
        params.target.physicsImpostor = new PhysicsImpostor(params.target, params.type, params.options, this.scene)
        return params.target.physicsImpostor
    }
}