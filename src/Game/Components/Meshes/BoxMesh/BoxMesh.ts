import { MeshBuilder, Mesh, Vector3, Vector4, Color4 } from "@babylonjs/core";
import { Component, IComponentParams } from "../../../../GameManager/Component";
import { Entity } from "../../../../GameManager/Entity";

export interface IBoxMeshParams extends IComponentParams{
    meshName?: string
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
    faceUV?: Vector4[];
    faceColors?: Color4[];
    sideOrientation?: number;
    frontUVs?: Vector4;
    backUVs?: Vector4;
    wrap?: boolean;
    topBaseAt?: number;
    bottomBaseAt?: number;
    updatable?: boolean;
    position?: Vector3
    visibility?: number 
}

const defaultSphereParams:IBoxMeshParams = {
    size: 1, 
    position: Vector3.Zero(),
    visibility: 1
}

export class BoxMesh extends Component{

    public get name(){
        return this.getProperty('meshName') ?? 'BoxMesh'
    }

    public mesh: Mesh

    constructor(_params:IBoxMeshParams, _entity: Entity){
        _params = {...defaultSphereParams, ..._params}
        super(_params, _entity)
        this.onInitialize()
    }

    onInitialize(){
        const size = this.getProperty('size')
        const options:IBoxMeshParams = {...this.params}
        delete options.meshName
        delete options.position
        this.mesh = MeshBuilder.CreateBox(this.name, options, this.scene)
        this.mesh.position = this.getProperty('position')
        this.mesh.visibility = this.getProperty('visibility')
    }
}