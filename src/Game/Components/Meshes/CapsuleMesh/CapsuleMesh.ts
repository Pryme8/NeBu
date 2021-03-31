import { MeshBuilder, Mesh, Vector2, Vector3 } from "@babylonjs/core";
import { Component, IComponentParams } from "../../../../GameManager/Component";
import { Entity } from "../../../../GameManager/Entity";

export interface ICapsuleMeshParams extends IComponentParams{
    meshName?: string
    size?: Vector2
    tesselation?: number
    subdivisions?: number
    capSubdivisions?: number
    position?: Vector3
    visibility?: number 
}

const defaultCapsuleParams:ICapsuleMeshParams = {
    size: new Vector2(0.25, 1.0),
    tesselation : 16,
    subdivisions: 1,
    capSubdivisions: 5,
    position: Vector3.Zero(),
    visibility: 1
}

export class CapsuleMesh extends Component{

    public get name(){
        return this.getProperty('meshName') ?? 'CapsuleMesh'
    }

    public mesh: Mesh

    constructor(_params:ICapsuleMeshParams, _entity: Entity){
        _params = {...defaultCapsuleParams, ..._params}
        super(_params, _entity)
        this.onInitialize()
    }

    onInitialize(){
        const size = this.getProperty('size')
        const subs = 
        this.mesh = MeshBuilder.CreateCapsule(this.name, {
            subdivisions: this.getProperty('subdivisions'),
            capSubdivisions: this.getProperty('capSubdivisions'),
            tessellation: this.getProperty('tesselation'),
            height: size.y,
            radius: size.x
        }, this.scene)
        this.mesh.position = this.getProperty('position')
        this.mesh.visibility = this.getProperty('visibility')        
    }
}