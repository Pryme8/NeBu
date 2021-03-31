import { Mesh, Vector3} from "@babylonjs/core";
import { Component, IComponentParams } from "../../../../GameManager/Component";
import { Entity } from "../../../../GameManager/Entity";

export interface IEmptyMeshParams extends IComponentParams{
    meshName?: string
    position?: Vector3
}

const defaultEmptyParams:IEmptyMeshParams = {
    position: Vector3.Zero()
}

export class EmptyMesh extends Component{

    public get name(){
        return this.getProperty('meshName') ?? 'EmptyMesh'
    }

    public mesh: Mesh

    constructor(_params:IEmptyMeshParams, _entity: Entity){
        _params = {...defaultEmptyParams, ..._params}
        super(_params, _entity)
        this.onInitialize()
    }

    onInitialize(){
        this.mesh = new Mesh(this.name, this.scene)
        this.mesh.position = this.getProperty('position')
    }
}