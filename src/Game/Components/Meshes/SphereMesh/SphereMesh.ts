import { MeshBuilder, Mesh, Vector2, Vector3, Vector4 } from "@babylonjs/core";
import { Component, IComponentParams } from "../../../../GameManager/Component";
import { Entity } from "../../../../GameManager/Entity";

export interface ISphereMeshParams extends IComponentParams{
    meshName?: string
    segments?: number
    diameter?: number
    diameterX?: number
    diameterY?: number
    diameterZ?: number
    arc?: number
    slice?: number
    sideOrientation?: number
    frontUVs?: Vector4
    backUVs?: Vector4
    updatable?: boolean
    position?: Vector3
    visibility?: number 
}

const defaultSphereParams:ISphereMeshParams = {
    segments: 16,
    diameter: 1, 
    position: Vector3.Zero(),
    visibility: 1
}

export class SphereMesh extends Component{

    public get name(){
        return this.getProperty('meshName') ?? 'SphereMesh'
    }

    public mesh: Mesh

    constructor(_params:ISphereMeshParams, _entity: Entity){
        _params = {...defaultSphereParams, ..._params}
        super(_params, _entity)
        this.onInitialize()
    }

    onInitialize(){
        const size = this.getProperty('size')
        const options:ISphereMeshParams = {...this.params}
        delete options.meshName
        delete options.position
        this.mesh = MeshBuilder.CreateSphere(this.name, options, this.scene)
        this.mesh.position = this.getProperty('position')
        this.mesh.visibility = this.getProperty('visibility')
    }
}