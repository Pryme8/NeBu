import { Color3, Mesh, MeshBuilder } from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import { Component, IComponentParams } from "../../../GameManager/Component";
import { Entity } from "../../../GameManager/Entity";

export interface IEditorGridParams extends IComponentParams{
    showGrid?:boolean
    majorUnitFrequency?: number
    minorUnitVisibility?: number
    gridRatio?: number
    backFaceCulling?: boolean
    mainColor?: number
    opacity?: number
    renderingGroupId?: number
}
export class EditorGrid extends Component{

    public get name(){
        return 'EditorGridComponent'
    }

    private _plane: Mesh = null
    private _material:GridMaterial = null

    constructor(_params:IEditorGridParams, _entity: Entity){
        super(_params, _entity)  
        this.onInitialize()
    }

    onInitialize(){
        const camera = this.scene.activeCamera        
        this._plane = MeshBuilder.CreateGround('editor-grid', {width:camera.maxZ, height:camera.maxZ, subdivisions:1}, this.scene)
        this._material = new GridMaterial('editor-grid', this.scene)
        this._plane.material = this._material
        //this._plane.isPickable = false
        this._material.majorUnitFrequency = this.getProperty('majorUnitFrequency') ?? 10
        this._material.minorUnitVisibility = this.getProperty('minorUnitVisibility') ?? 0.1
        this._material.gridRatio = this.getProperty('gridRatio') ?? 10
        this._material.backFaceCulling = this.getProperty('backFaceCulling') ?? false
        this._material.mainColor = this.getProperty('mainColor') ?? new Color3(1, 1, 1)
        this._material.lineColor = this.getProperty('lineColor') ??new Color3(1, 1, 1)
        this._material.opacity =  this.getProperty('opacity') ?? 0.5
        //this._material.zOffset = -0.2
        this._plane.renderingGroupId = this.getProperty('renderingGroupId') ?? 0
    }
}