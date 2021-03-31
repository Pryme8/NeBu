import { AssetContainer, Color3, MeshBuilder, PickingInfo, PointerEventTypes, PointerInfo, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, Rectangle, ScrollViewer, StackPanel } from "@babylonjs/gui";
import { Entity, IEntityParams } from "../../../GameManager/Entity";
import { LoadModelToContainer } from "../../Components";
import { SnappingModel } from "./SnappingModel/SnappingModel";
import { NormalState, SnappingModelStateControl } from "./SnappingModelStateControl";

interface ISnappingModelSystemParams extends IEntityParams{
    models : ISnappingModelParams[]
}

export interface ISnappingModelParams{
    url: string
    name: string
    overWriteName?: string
    type: string
    subtype: string
    snapPoints? : ISnappingPoint[]
    useGlbTemplate? : boolean
    snapPointsParentName?: string
    spinSettings: ISpinSettings
    decoration : boolean
    offset? : Vector3
    canFlipX? : boolean
    previewImageUrl? : string
    rootTransform?: TransformNode 
}

interface ISnappingPoint{
    position: Vector3
    forward: Vector3
    right: Vector3
    up: Vector3
}

interface ISpinSettings{
    x : ISpinSetting
    y : ISpinSetting
    z : ISpinSetting
}

interface ISpinSetting{
    steps: number[]
}

export class SnappingModelSystem extends Entity{  
    private _modelMap : any = {}
    get modelMap(){
        return this._modelMap
    }
    private _models: ISnappingModelParams[] = null
    get models(){
        return this._models
    }

    private _activeModel : SnappingModel = null
    private _snapMeshCache = {
        normal : null,
        highlight: null
    }
    get snapMeshCache(){
        return this._snapMeshCache
    }

    private _stateControl : SnappingModelStateControl = null
    get stateControl(){
        return this._stateControl
    }

    private snapEntities = []

    constructor(_params, _manager){
        super(_params, _manager)
        this._onInitialize()
    }
    _onInitialize(){
        this._models = this.getProperty('models')
        this._stateControl = new SnappingModelStateControl({snapSystem: this}, this.gameManager)
        this._snapMeshCache.normal = MeshBuilder.CreateBox('snapPointMesh.normal', {size:0.05}, this.scene)
        this._snapMeshCache.normal.setEnabled(false)
        //this._snapMeshCache.normal.visibility = 0.2
        const nMat = new StandardMaterial('snapPoint', this.scene)
        //nMat.alpha = 0.5
        this._snapMeshCache.normal.material = nMat
        //this._snapMeshCache.normal.material.lightingDisabled = true
        this._snapMeshCache.normal.material.emissiveColor = new Color3(0.5, 0.5, 0.7)
        this._snapMeshCache.normal.renderingGroupId = 1
        this._snapMeshCache.highlight = MeshBuilder.CreateBox('snapPointMesh.highlight', {size:0.05}, this.scene)
        this._snapMeshCache.highlight.setEnabled(false)
        this._snapMeshCache.highlight.renderingGroupId = 1
        this._snapMeshCache.highlight.material = new StandardMaterial('snapPoint', this.scene)
        //this._snapMeshCache.highlight.material.lightingDisabled = true
        this._snapMeshCache.highlight.material.emissiveColor = new Color3(0.7, 0.7, 1.0)
        this._bindings()
        this._buildUI()        
        this.stateControl.setState('loading')
    }  
    
    private _loadStarted: boolean = false
    loadAllModels(){
        if(!this._loadStarted){
            this._loadStarted = true
            let waitingOn = this.models.length
            console.log(this.models)
            this.models.forEach((model)=>{
                this.addModelToMenu(model)
                console.log(`loading model : ${model.name}, waitingOn: ${waitingOn}`)
                this.AddComponent(LoadModelToContainer, {url:model.url, 
                    onDone:(container:AssetContainer)=>{
                        const name = model.name
                        container.addAllToScene()
                        container.meshes[0].setEnabled(false)   
                        model.rootTransform = container.meshes[0]
                        model.rootTransform.getChildMeshes(false).forEach(m=>{
                            m.renderingGroupId = 1
                            m.isPickable = false
                            m.receiveShadows = true                            
                        })                 
                        this.modelMap[name] = model
                        waitingOn--
                        console.log(`loaded model : ${model.name}, waitingOn: ${waitingOn}`)
                        if(waitingOn == 0){
                            this.stateControl.setState('normal')
                        }
                    }
                })
            })
        }
    }

    AddSnapEntity(name){
        const entity = this.gameManager.AddEntity(
            SnappingModel, {...this.modelMap[name], snapSystem: this}
        )
        this.snapEntities.push(entity)
        this._mouseControls.activeModel = entity
        this.stateControl.setState('placing')
        return entity
    }

    CloneSnapEntity(entity){
        const newEntity = this.gameManager.AddEntity(
            SnappingModel, {...this.modelMap[entity.name], snapSystem: this}
        )  

        newEntity.setFlipped(entity.getFlipped())
        newEntity.setSpin(entity.getSpin())

        this.snapEntities.push(newEntity)
        return newEntity
    }


    disposeSnapEntity(entity){
        entity.dispose()
        const index = this.snapEntities.indexOf(entity)
        this.snapEntities.slice(index, 1)
        this.stateControl.setState('normal')
    }

    private _mouseObs = null
    
    private _mouseControls = {
        activeModel : null,
        hoverModel : null,
        canPlace : false
    }

    get mouseControls(){
        return this._mouseControls
    }

    _bindings(){
        this._mouseObs = this.scene.onPointerObservable.add((pointerInfo: PointerInfo)=>{

            const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh=>{
                if(this._mouseControls.activeModel){
                  if(
                      mesh?.parent?.metadata?.snapModel === this._mouseControls.activeModel ||
                      mesh?.metadata?.isSnapPoint === true
                    ){
                      return false
                  }
                }
                return true
            }))

            switch(pointerInfo.type){
                case PointerEventTypes.POINTERMOVE:{                    
                    if(!this._mouseControls.activeModel){
                        this._mouseMove(pick)
                    }else{
                        this._mouseMoveWithActiveModel(pick)
                    }                          
                    break
                }

                case PointerEventTypes.POINTERPICK:{
                    if(!this._mouseControls.activeModel){
                        const snapModel = pick.pickedMesh?.parent?.metadata?.snapModel
                        if(snapModel){
                            if(NormalState.isShiftModifierOn){
                                this._mouseControls.activeModel = this.CloneSnapEntity(snapModel)
                                snapModel.toggleSnapPoints(false)
                            }else{
                                this._mouseControls.activeModel = snapModel
                            }                            
                            this.stateControl.setState('placing')
                        }
                    }else{
                        if(this._mouseControls.canPlace){
                            this._mouseControls.activeModel.toggleSnapPoints(false)
                            this._mouseControls.hoverModel = null
                            this._mouseControls.activeModel = null
                            this.stateControl.setState('normal')                           
                        }                        
                    }                          
                    break
                }
            }
        })
    }

    _mouseMove(pick){
        if(!pick.hit){
            if(this._mouseControls.hoverModel){
                this._mouseControls.hoverModel.toggleSnapPoints(false)
                this._mouseControls.hoverModel = null
            }
            return
        }
        const snapModel = pick.pickedMesh?.parent?.metadata?.snapModel ?? false
        if(snapModel){    
            if(this._mouseControls.hoverModel){
                if(this._mouseControls.hoverModel !== snapModel){
                    this._mouseControls.hoverModel.toggleSnapPoints(false)
                }else{
                    return
                }
            }
            this._mouseControls.hoverModel = snapModel
            this._mouseControls.hoverModel.toggleSnapPoints(true)                        
        }else{
            if(this._mouseControls.hoverModel){
                this._mouseControls.hoverModel.toggleSnapPoints(false)
                this._mouseControls.hoverModel = null
            }
        }             
    }

    _mouseMoveWithActiveModel(pick : PickingInfo){
        this._mouseControls.canPlace = false
        if(!pick.hit){
            return
        }
        const newPosition = pick.pickedPoint

        if(this.mouseControls.activeModel.offset){
            const offset = this.mouseControls.activeModel.offset
            const root =  this.mouseControls.activeModel.root 
            newPosition.addInPlace(
                (root.right.scale(offset.x)
                ).add(
                    root.up.scale(offset.y)
                ).add(
                    root.forward.scale(offset.z)
                )
            )
        }

        const snapPointAndEntity = this.getClosestSnapPointAndEntityWithinDistance(newPosition, this.mouseControls.activeModel.maxDistance)
        if(snapPointAndEntity.snapEntity && !this.mouseControls.activeModel.isDecoration){
            const bestSnapPointIndex = this.getBestSnapPointOnActiveFromSnapPoint(snapPointAndEntity)
            if(bestSnapPointIndex >= 0){
                const anchorPosition = this.getPositionForActiveModelFromSnapPoints(bestSnapPointIndex, snapPointAndEntity)
                this._mouseControls.activeModel.root.position = anchorPosition
                this._mouseControls.canPlace = true 
            }else{
                this._mouseControls.activeModel.root.position = newPosition
                this._mouseControls.canPlace = true      
            }
        }else{
            this._mouseControls.activeModel.root.position = newPosition
            this._mouseControls.canPlace = true
        }
    }    

    private _ui = null
    get ui() : AdvancedDynamicTexture{
        return this._ui
    }
    private _nodeMenu = null
    get nodeMenu(){
        return this._nodeMenu
    }
    toggleNodeMenu(toggle){
        (!toggle)?this.ui.removeControl(this.nodeMenu):this.ui.addControl(this.nodeMenu)
    }
    private _stack = null

    private _toolMenu = null
    get toolMenu(){
        return this._toolMenu
    }
    toggleToolMenu(toggle){
        (!toggle)?this.ui.removeControl(this.toolMenu):this.ui.addControl(this.toolMenu)
    }

    _buildUI(){
        const ui: AdvancedDynamicTexture = this.gameManager.getEntityById('ui')[0].components[0].adt
        const nodeMenu = new ScrollViewer("nodeMenu")    
        nodeMenu.width = 1
        nodeMenu.height = '86px'
        nodeMenu.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
        nodeMenu.thickness = 0
        const stack = new StackPanel()
        stack.isVertical = false
        stack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        nodeMenu.addControl(stack)       
        this._ui = ui
        this._nodeMenu = nodeMenu
        this._stack = stack

        const toolMenu = new ScrollViewer("toolMenu")    
        toolMenu.width = 1
        toolMenu.height = '64px'
        toolMenu.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
        toolMenu.thickness = 0
        const toolStack = new StackPanel()
        toolStack.isVertical = false
        toolStack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        toolMenu.addControl(toolStack) 
        
        this.addToolButton('snapTransform', 'Snap Transform (S)', ()=>{
            this.stateControl.currentState.setCurrentTool('snapTransform')
        }, toolStack)
        this.addToolButton('freeTransform', 'Free Transform (T)', ()=>{
            this.stateControl.currentState.setCurrentTool('freeTransform')
        }, toolStack)       
        this.addToolButton('rotateLeft', 'Rotate Left (Q)', ()=>{
            this._mouseControls.activeModel.rotate('y', -1)
        }, toolStack)
        this.addToolButton('rotateRight', 'Rotate Right (W)', ()=>{
            this._mouseControls.activeModel.rotate('y', 1)
        }, toolStack)
        this.addToolButton('flipLocalX', 'Flip X (X)', ()=>{
            this._mouseControls.activeModel.flip('x')
        }, toolStack)
        this.addToolButton('flipLocalZ', 'Flip Z (Z)', ()=>{
            this._mouseControls.activeModel.flip('z')
        }, toolStack)
        this.addToolButton('delete', 'Delete (Del)', ()=>{
            this.disposeSnapEntity(this.mouseControls.activeModel)
        }, toolStack)

        this._ui = ui
        this._nodeMenu = nodeMenu
        this._stack = stack
        this._toolMenu = toolMenu
    } 

    addToolButton(toolName, buttonText, callback, target){
        const tool = Button.CreateSimpleButton(
            toolName,
            buttonText
        )
        tool.width = '64px'
        tool.height = '64px'
        tool.paddingRight = '6px'
        tool.thickness = 1
        tool.fontSizeInPixels = 8 
        tool.background = 'rgb(128, 128, 128)'
        tool.onPointerClickObservable.add(callback)
        tool.isPointerBlocker = true 
        target.addControl(tool)
    }

    addModelToMenu(model){ 
        const item = Button.CreateImageWithCenterTextButton(
            model.name,
            model.overWriteName ?? model.name,
            model.previewImageUrl
        )

        item.width = '64px'
        item.height = '64px'
        item.paddingRight = '6px'
        item.thickness = 0
        item.fontSizeInPixels = 8 

        item.onPointerClickObservable.add(()=>{
            this.AddSnapEntity(model.name)
        })

        item.isPointerBlocker = true

        this._stack.addControl(item)
    }

    getClosestSnapPointAndEntityWithinDistance(mousePosition, maxDistance){
        let closest = Number.POSITIVE_INFINITY
        let snapPointIndex = -1
        let snapEntity = null
        this.snapEntities.forEach((entity)=>{
            if(entity === this._mouseControls.activeModel){
                return false
            }
            entity.snapPoints.forEach((_snapPoint, i)=>{
                const pos = entity.getSnapPointPosition(i)
                const dist = Vector3.Distance(pos, mousePosition)
                if(dist < maxDistance){
                    if(dist < closest ){
                        closest = dist
                        snapPointIndex = i
                        snapEntity = entity
                    }
                }
            })
        })
        return {snapPointIndex, snapEntity}
    }

    getBestSnapPointOnActiveFromSnapPoint(snapPointAndEntity){
        let best = -1
        const entity = snapPointAndEntity.snapEntity
        const forward = entity.getSpunPointForward(snapPointAndEntity.snapPointIndex)
        //console.log(forward)
        this._mouseControls.activeModel.snapPoints.forEach((_snapPoint, i)=>{
            const angle = Vector3.Dot(
                forward,
                this._mouseControls.activeModel.getSpunPointForward(i)
            )
            if(angle <= -0.999){
                best = i
            }
        })
        return best
    }

    getPositionForActiveModelFromSnapPoints(bestSnapPointIndex, snapPointAndEntity){       
        const rootAPos = this._mouseControls.activeModel.root.getAbsolutePosition()
        const snapAPos = this._mouseControls.activeModel.getSnapPointPosition(bestSnapPointIndex)
        const offsetA = rootAPos.subtract(snapAPos)

        const rootBPos = snapPointAndEntity.snapEntity.root.getAbsolutePosition()
        const snapBPos = snapPointAndEntity.snapEntity.getSnapPointPosition(snapPointAndEntity.snapPointIndex)
        const offsetB = snapBPos.subtract(rootBPos)

        return rootBPos.add(offsetA).add(offsetB)
    }
}
