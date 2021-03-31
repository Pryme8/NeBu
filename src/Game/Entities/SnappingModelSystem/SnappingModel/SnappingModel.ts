import { InstancedMesh, Matrix, Mesh, Quaternion, Scalar, TransformNode, Vector3 } from "@babylonjs/core";
import { Entity } from "../../../../GameManager/Entity";
import { ISnappingModelParams, SnappingModelSystem } from "../SnappingModelSystem";

interface ISnappingModelEntityParams extends ISnappingModelParams{
    snapSystem : SnappingModelSystem
}
export class SnappingModel extends Entity{
    private _modelRoot: TransformNode = null
    
    private _snapSystem: SnappingModelSystem = null
    private _boundingVectors = null
    private _maxDistance : number = null
    get maxDistance(){
        return this._maxDistance
    }

    private _snapPointMeshes: InstancedMesh[][] = []
    private _instanceRoot: TransformNode = null
    get root(){
        return this._instanceRoot
    }
    private _snapPointsRoot: TransformNode = null
    public toggleSnapPoints(toggle){
        this._snapPointsRoot.setEnabled(toggle)
    }
    
    private _snapPoints = null
    get snapPoints(){
        return this._snapPoints
    }
    getSnapPointPosition(index){
        return this._snapPointMeshes[index][0].getAbsolutePosition()
    }
    
    private _spinSettings = null
    get spinSettings(){
        return this._spinSettings
    }

    private _currentSpin = {
        x : 0,
        y : 0,
        z : 0
    }
    public setSpin(spin){
        this._currentSpin = {...this._currentSpin, ...spin}
        this.root.rotationQuaternion = Quaternion.FromEulerAngles(
            this._spinSettings.x.steps[this._currentSpin.x],
            this._spinSettings.y.steps[this._currentSpin.y],
            this._spinSettings.z.steps[this._currentSpin.z]
        )
    }
    public getSpin(){
        return this._currentSpin 
    }

    private _flipped = {
        x : false,
        //y : false,
        z : false
    }   

    public setFlipped(flip){
        this._flipped = {...this._flipped, ...flip}
        if(this._flipped.x && this.root.scaling.x != -1){
            this.root.scaling.x = -1
        }else if(!this._flipped.x && this.root.scaling.x != 1){
            this.root.scaling.x = 1
        }   
        if(this._flipped.z && this.root.scaling.z != -1){
            this.root.scaling.z = -1
        }else if(!this._flipped.z && this.root.scaling.z != 1){
            this.root.scaling.z = 1
        }    
    }
    public getFlipped(){
        return this._flipped 
    }

    private _isDecoration = false
    get isDecoration(){
        return this._isDecoration
    }  

    private _offset = false
    get offset(){
        return this._offset
    }

    constructor(_params, _manager){
        super(_params, _manager)  
        this._onInitialize()    
    }  

    _onInitialize(){        
        this._snapSystem = this.getProperty('snapSystem')
        this._modelRoot = this._snapSystem.modelMap[this.getProperty('name')].rootTransform
        this._boundingVectors = this._modelRoot.getHierarchyBoundingVectors()
        this._maxDistance = Math.max(Math.max(this._boundingVectors.max.x, this._boundingVectors.max.y), this._boundingVectors.max.z) * 1.75        
        if(this.getProperty('useGlbTemplate')){
            const containerTarget = this.getProperty('snapPointsParentName') ?? 'SnapPoints'
            this._parseGlbTemplate(containerTarget)

        }else{
            this._snapPoints = this.getProperty('snapPoints')
        }

        this._spinSettings = this.getProperty('spinSettings')
        this._isDecoration = this.getProperty('decoration')
        this._offset = this.getProperty('offset') ?? false
        this._instanceMeshes()
    }
    
    _instanceMeshes(){
        this._instanceRoot = new TransformNode('instanceRoot', this.scene)    
        this._instanceRoot.metadata = {
            snapModel : this
        }

        this._buildSnapPoints()

        this._modelRoot.getChildMeshes().forEach((mesh: Mesh)=>{
            const instance = mesh.createInstance(mesh.name+':instance')
            this.gameManager.shadows.addShadowCaster(instance)
            instance.setParent(this._instanceRoot)         
        })       
    }

    _parseGlbTemplate( snapPointTargetName ){
        this._snapPoints = []

        const snapParent = this._modelRoot.getChildTransformNodes(true, (node)=>{
            return (node.name === snapPointTargetName)
        })[0]

        if(snapParent){
            snapParent.getChildTransformNodes(true).forEach((node=>{
                const snapPont = {
                    getForward: null,
                    position: node.getAbsolutePosition(),
                    forward: (node.getChildTransformNodes(true)[0].getAbsolutePosition().subtract(node.getAbsolutePosition())).normalize()
                }
                this._snapPoints.push(snapPont)
            }))
        }
    }
    
    _buildSnapPoints(){
        this._snapPointsRoot = new TransformNode('snap-point-root', this.scene)
        this.snapPoints.forEach((snapPoint, i)=>{
            const meshPosition = this.snapPointToPosition(snapPoint)
            const snapMeshNormal =  this._snapSystem.snapMeshCache.normal.createInstance()
            const snapMeshHighlight =  this._snapSystem.snapMeshCache.highlight.createInstance() 
            const forwardRef = new TransformNode(`forwardRef:${i}`, this.scene)
            forwardRef.position = snapPoint.position.add(snapPoint.forward)
            forwardRef.setParent(this._snapPointsRoot)
            snapPoint.getForward = ()=>{
                return (forwardRef.getAbsolutePosition().subtract(snapMeshNormal.getAbsolutePosition())).normalize()
            }
            snapMeshNormal.parent = this._snapPointsRoot
            snapMeshHighlight.parent = this._snapPointsRoot
            snapMeshNormal.position = meshPosition
            snapMeshHighlight.position = meshPosition 
            snapMeshNormal.setEnabled(true)      
            snapMeshHighlight.setEnabled(false)    
            
            snapMeshNormal.metadata = {
                isSnapPoint : true
            }
            snapMeshNormal.isPickable = false

            snapMeshHighlight.metadata = {
                isSnapPoint : true
            }
            snapMeshHighlight.isPickable = false
            
            this._snapPointMeshes.push([snapMeshNormal, snapMeshHighlight])
        })        
        this._snapPointsRoot.parent = this._instanceRoot
    }

    snapPointToPosition(point){
        return point.position.clone()
        // return new Vector3(
        //     Scalar.Lerp(this._boundingVectors.min.x, this._boundingVectors.max.x, point.position.x),
        //     Scalar.Lerp(this._boundingVectors.min.y, this._boundingVectors.max.y, point.position.y),
        //     Scalar.Lerp(this._boundingVectors.min.z, this._boundingVectors.max.z, point.position.z)
        // )
    }

    private _rotMatrix = Matrix.Identity()

    getSpunPointForward(pointIndex){
        // const spin = new Vector3( 
        //     this._spinSettings.x.steps[this._currentSpin.x],
        //     -this._spinSettings.y.steps[this._currentSpin.y],
        //     this._spinSettings.z.steps[this._currentSpin.z]
        // )
    
        // const rot = Quaternion.FromEulerAngles(
        //    spin.x, spin.y, spin.z
        // )
        // rot.toRotationMatrix(this._rotMatrix)
        // const forward = Vector3.TransformCoordinates(this.snapPoints[pointIndex].forward.clone(), this._rotMatrix)
        const forward = this.snapPoints[pointIndex].getForward()
        return forward
    }

    rotate(axes, direction){        
        let targetStep = this._currentSpin[axes]+direction
        const stepsCount = this._spinSettings[axes].steps.length
        if(targetStep < 0){
            targetStep = stepsCount - 1
        }else if(targetStep >= stepsCount){
            targetStep = 0
        }
        this._currentSpin[axes] = targetStep
        this.root.rotationQuaternion = Quaternion.FromEulerAngles(
            this._spinSettings.x.steps[this._currentSpin.x],
            this._spinSettings.y.steps[this._currentSpin.y],
            this._spinSettings.z.steps[this._currentSpin.z]
        )
    }

    flip(direction){       
        this.root.scaling[direction] *= -1
        this._flipped[direction] = (this.root.scaling[direction] > 0)?true:false   
    }

    onDispose = ()=>{
        this._instanceRoot.dispose(false, false)
    }

    // clone = ()=>{
    //     const model = new SnappingModel({...this.params}, this.manager)
    //     model._flipped = {...this._flipped}
    //     model._currentSpin = {...this._currentSpin}
    //     return model
    // }
}