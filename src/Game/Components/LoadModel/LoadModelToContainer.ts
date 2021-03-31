import { SceneLoader } from "@babylonjs/core";
import { Component, IComponentParams } from "../../../GameManager/Component";
import { Entity } from "../../../GameManager/Entity";

export interface ILoadModelToContainerParams extends IComponentParams{
    url: string
    onDone?: (container)=> void
}
export class LoadModelToContainer extends Component{

    public get name(){
        return 'LoadModel'
    }

    constructor(_params:ILoadModelToContainerParams, _entity: Entity){
        super(_params, _entity)  
        this.onInitialize()
    }

    onInitialize(){
        const onDone = this.getProperty('onDone') ?? false
        SceneLoader.LoadAssetContainer(this.getProperty('url'), "", this.scene, (container)=>{
            if(onDone){
                onDone(container)
            }
        })
    }
}