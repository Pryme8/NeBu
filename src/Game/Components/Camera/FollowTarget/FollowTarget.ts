import { AbstractMesh, FollowCamera, Quaternion, TransformNode, Vector3 } from "@babylonjs/core"
import { Component, Entity, IComponentParams } from "../../../../GameManager"

export interface IFollowTargetParams extends IComponentParams{
    target: AbstractMesh
    replaceActiveCamera: boolean
    position?: Vector3
    radius?: number
    heightOffset?: number
    rotationOffset?: number
    maxCameraSpeed?: number
    targetOffset?: Vector3
}

export class FollowTarget extends Component{
    public get name(){
        return 'FollowTarget'
    }

    constructor(_params:IFollowTargetParams, _entity: Entity){
        super(_params, _entity)  
        this.onInitialize()
    }

    private _camera:FollowCamera = null
    get camera(){
        return this._camera
    }
    
    public setRotationOffset(degrees:number){
        this.camera.rotationOffset = degrees
    }

    private _targetNode: TransformNode = null
    get targetNode(){
        return this._targetNode
    }
    public setTargetPosition(position:Vector3){
        this._targetNode.position = position
    }
    public setHeightOffset(height:number){
        this._camera.heightOffset = height
    }

    onInitialize(){
        const originalCamera = this.scene.activeCamera
        const offset = this.getProperty('targetOffset') ?? false
        const target = this.getProperty('target')
        const followOffsetNode = new TransformNode('FollowTarget-OffsetNode', this.scene)
        followOffsetNode.parent = target
        followOffsetNode.rotationQuaternion = Quaternion.Identity()
        if(offset){
            followOffsetNode.position = offset.clone()
        }else{
            followOffsetNode.position = Vector3.Zero()
        }
        this._targetNode = followOffsetNode
        const camera = new FollowCamera(`${this.entity.name}.${this.name}`, this.getProperty('position') ?? Vector3.Zero(), this.scene, followOffsetNode as AbstractMesh) 
        camera.radius = this.getProperty('radius') ?? 6
        camera.heightOffset = this.getProperty('heightOffset') ?? 1.2
        camera.rotationOffset = this.getProperty('rotationOffset') ?? 0
        camera.cameraAcceleration = this.getProperty('cameraAcceleration') ?? 0.1
        camera.maxCameraSpeed = this.getProperty('maxCameraSpeed') ?? 10
        this.scene.activeCamera = camera            
        if(this.getProperty('replaceActiveCamera')){           
            originalCamera.dispose()
        }
        this._camera = camera
    }
    // update = (delta:number): void =>{
      
    // }
}