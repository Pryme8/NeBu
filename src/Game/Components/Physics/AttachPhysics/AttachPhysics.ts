
import { IImposterParams } from "../../../../GameManager";
import { Component, IComponentParams } from "../../../../GameManager/Component";
import { Entity } from "../../../../GameManager/Entity";

export interface IAttachPhysicsParams extends IComponentParams{
    imposterMap: IImposterParams[]
}

export class AttachPhysics extends Component{

    public get name(){
        return 'AttachPhysics'
    }

    AddImposter(params:IImposterParams){
        return this.gameManager.AddImposter(params)
    }

    constructor(_params:IAttachPhysicsParams, _entity: Entity){
        super(_params, _entity)  
        this.onInitialize()
    }

    onInitialize(){
        const imposterMap = this.getProperty('imposterMap') ?? false
        if(imposterMap){
            imposterMap.forEach((imposterParams)=>{
                this.AddImposter(imposterParams)
            })
        }
    }
}