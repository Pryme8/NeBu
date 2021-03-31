import { DirectionalLight, Mesh, MeshBuilder, PhysicsImpostor, Vector3 } from "@babylonjs/core";
import { Entity, IEntityParams } from "../../../GameManager/Entity";
import { AttachPhysics, EditorGrid } from "../../Components";

interface IStartStage extends IEntityParams{
    showGrid?: boolean
}
export class StartStage extends Entity{
    private _groundMesh: Mesh = null
    private _stageLight: DirectionalLight = null
    public get stageLight(){
        return this._stageLight
    }
    constructor(_params, _manager){
        super(_params, _manager)
        this.AddComponent(EditorGrid, {showGrid:_params.showGrid ?? false})
        this._groundMesh = MeshBuilder.CreateGround('basic-ground', {width:1000, height:1000, subdivisions:1}, this.scene)
        this._stageLight = new DirectionalLight('stage-light', (new Vector3(0.5, -1, 0.5)).normalizeToNew(), this.scene)
        this._stageLight.position = this._stageLight.direction.clone().scale(-1000)
        this._stageLight.intensity = 0.65

        this.gameManager.shadowManager.CreateCascadeShadowGenerator(this._stageLight, {resolution:512})
        this._groundMesh.receiveShadows = true
        
        this.AddComponent(AttachPhysics, {
            imposterMap:[
                {
                    type: PhysicsImpostor.PlaneImpostor,
                    target: this._groundMesh,
                    options : {
                        mass: 0,
                        restitution: 0.235,
                        friction: 0.865
                    }
                }
            ]
        })
    }
}