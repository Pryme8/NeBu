import {  FreeCamera, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { Entity, GameManager } from "../GameManager";
import { SceneStates } from "./Components/SceneStates";


export class Game{
    get manager(){
        return this._manager
    }

    get engine(){
        return this.manager.engine
    }

    get scene(){
        return this.manager.scene
    }

    constructor(private _manager: GameManager){
        this._onInitialize()
    }

    private _onInitialize(){
        this.scene.activeCamera.position.set(0, 2, -10);
        (this.scene.activeCamera as FreeCamera).setTarget(Vector3.Zero()) 
          
        let sceneStates = this.AddEntity(Entity, {name:'SceneStates'})
        sceneStates = sceneStates.AddComponent(SceneStates, {})
        
        /*
        const basicBox = player.AddComponent(BasicBox, { position: new Vector3(0, 0.5, 0) })
        const followTarget = player.AddComponent(FollowTarget, {
            target:basicBox.mesh,
            replaceActiveCamera : true,
            position: this.scene.activeCamera.position
        })
        const basicMovement = player.AddComponent(SimpleKeyControls, {
            left    :   'KeyA',
            right   :   'KeyD',
            forward :   'KeyW',
            back    :   'KeyS',
            target  :   basicBox.mesh
        })
        */
    }

    public AddEntity(entityType, params){
        return this.manager.AddEntity(entityType, params)
    }
}