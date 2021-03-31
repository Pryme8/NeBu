import { Color3, Mesh, Vector3, TransformNode, MeshBuilder, Quaternion } from "@babylonjs/core";
import { Component, IComponentParams } from "../../../../GameManager/Component";
import { Entity } from "../../../../GameManager/Entity";

export interface IShowLocalAxesParams extends IComponentParams{
    size?: number
    target: TransformNode
}

const defaultParams = {
    size: 1
}

export class ShowLocalAxes extends Component{

    public get name(){
        return 'ShowLocalAxes'
    }

    public mesh: Mesh

    constructor(_params:IShowLocalAxesParams, _entity: Entity){
        _params = {..._params, ...defaultParams}
        super(_params, _entity)  
        this.onInitialize()
    }

    onInitialize(){
        const size = this.getProperty('size')
        const lines = [
            [
                Vector3.Zero(), Vector3.Forward().scale(size)
            ],
            [
                Vector3.Zero(), Vector3.Right().scale(size)
            ],
            [
                Vector3.Zero(), Vector3.Up().scale(size)
            ]
        ]
        const blue = (Color3.Blue()).toColor4(1)
        const red = (Color3.Red()).toColor4(1)
        const green = (Color3.Green()).toColor4(1)
        const colors = [
            [
               blue, blue
            ],
            [
                red, red
            ],
            [
               green, green
            ]
        ]

        this.mesh = MeshBuilder.CreateLineSystem(this.name, {
            lines,
            colors
        }, this.scene)

        this.mesh.setParent(this.getProperty('target'))
        this.mesh.rotationQuaternion = Quaternion.Identity()
        this.mesh.position = Vector3.Zero()
        this.mesh.renderingGroupId = 3
    }
}