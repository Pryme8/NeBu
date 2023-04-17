import { DirectionalLight, Scalar, Vector3 } from "@babylonjs/core"
import { AdvancedDynamicTexture, Button, StackPanel } from "@babylonjs/gui"
import { Component, Entity, GameManager, IComponentParams } from "../../../GameManager"
import { StateController } from "../../../StateController"
import { State } from "../../../StateController/State/State"
import { SimpleProceduralSky, SnappingModelSystem } from "../../Entities"
import { EditorGrid } from "../EditorGrid"
import { UserInterface } from "../UserInterface"

interface ISceneStateControllerParams{}

class SceneStateController extends StateController{
    constructor(private _params:ISceneStateControllerParams, _manager:GameManager){
        super(_manager)
        this._onInitialize()
    }
    private _onInitialize(){
        this.addState('start', StartState)
        this.addState('game', GameState)
    }
}

interface ISceneStatesParams extends IComponentParams{}
export class SceneStates extends Component{

    public get name(){
        return 'SceneStates'
    }

    private _stateController: SceneStateController = null

    public setState(name){
        this._stateController.setState(name)
    }

    constructor(_params:ISceneStatesParams, _entity: Entity){
        super(_params, _entity)
        this._onInitialize()
    }

    private _onInitialize(){  
        this._stateController = new SceneStateController({}, this.gameManager)
        this.setState('start')
        this.registerEvent('setState', (event)=>{
            if(event.state){
                this.setState(event.state)
            }
        })
    }
}

class SceneState extends State{
    get name(){
        return ''
    }
    get delta(){
        return this.parent.manager.delta
    }
    get scene(){
        return this.parent.manager.scene
    }
    AddEntity(entity, params){
        return this.parent.manager.AddEntity(entity, params)
    }
    constructor(parent){
        super(parent)
    }
}

class StartState extends SceneState{
    get name(){
        return 'start'
    }     
    enter = (prevState):void=>{
        if(prevState){
            return
        }

        let ui = this.AddEntity(Entity, {name:'ui'})
        ui = ui.AddComponent(UserInterface, {
            onInitialize:(adt:AdvancedDynamicTexture)=>{
                const startMenuBlock = new StackPanel()
                adt.addControl(startMenuBlock)              
                const startButton = Button.CreateSimpleButton("startButton", "Start")
                startButton.width = "160px"
                startButton.height = "40px"
                startButton.color = "white"
                startButton.background = "black"
                startButton.onPointerClickObservable.addOnce(()=>{
                    this.parent.setState('game')
                    const fadeOutObs = startMenuBlock.onBeforeDrawObservable.add(()=>{                        
                        startMenuBlock.alpha = Scalar.Lerp(startMenuBlock.alpha, 0, 10*this.delta)
                        if(startMenuBlock.alpha < 0.01){
                            startMenuBlock.alpha = 0
                            startMenuBlock.onBeforeDrawObservable.remove(fadeOutObs)
                        }
                    })
                })
                startMenuBlock.addControl(startButton)
            }
        })        
       
        const sunLight = new DirectionalLight('sunlight', (new Vector3(0.5, -1, 0.5)).normalizeToNew(), this.scene)
        sunLight.position = sunLight.direction.clone().scale(-500)
        sunLight.intensity = 0.65
        this.parent.manager.shadowManager.CreateCascadeShadowGenerator(sunLight, {resolution:1024})       
      
        const sky = this.AddEntity(SimpleProceduralSky, {
            name: 'Sky',
            sunLight : sunLight
        })
        sky.AddComponent(EditorGrid, {renderingGroupId : 1})        
    }
}

class GameState extends SceneState{
    get name(){
        return 'game'
    }    
    enter = (prevState):void=>{
        const manager: GameManager  = this.parent.manager
        if(prevState.name == 'start'){
            manager.scene.activeCamera.attachControl(true)

            const snappingSystem = manager.AddEntity(SnappingModelSystem, {
                name:'SnapSystem',
                models:[
                    {   
                        name:'bannerGreen',
                        overWriteName:'Banner Green',
                        type : 'banner',
                        subtype: 'green',
                        url: './assets/fantasyTownKit/meshes/bannerGreen.glb',
                        generateImage: true,
                        //previewImageUrl: './assets/fantasyTownKit/icons/bannerGreen.png',
                        useGlbTemplate : true,
                        snapPointsParentName : 'bannerGreen.SnapPoints', 
                        spinSettings: {
                            x:{steps:[0]},
                            y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                            z:{steps:[0]}
                        },
                        decoration : true
                        //offset : new Vector3(0.5, -1, 0)
                    },
                    {   
                        name:'bannerRed',
                        overWriteName:'Banner Red',
                        type : 'banner',
                        subtype: 'red',
                        url: './assets/fantasyTownKit/meshes/bannerRed.glb',
                        generateImage: true,
                        //previewImageUrl: './assets/fantasyTownKit/icons/bannerRed.png',
                        snapPoints : [],                        
                        spinSettings: {
                            x:{steps:[0]},
                            y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                            z:{steps:[0]}
                        },
                        decoration : true,
                        offset : new Vector3(0.5, -1, 0)
                    },
                    // {   
                    //     name:'blade',
                    //     overWriteName:'Blade',
                    //     type : 'blade',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/blade.glb',
                    //     generateImage: true,
                    //     //previewImageUrl: './assets/fantasyTownKit/icons/blade.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.0, 0, 0)
                    // },
                    // {   
                    //     name:'cart',
                    //     overWriteName:'Cart',
                    //     type : 'cart',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/cart.glb',
                    //     generateImage: true,
                    //     //previewImageUrl: './assets/fantasyTownKit/icons/cart.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.0, 0.25, 0)
                    // },
                    // {   
                    //     name:'cartHigh',
                    //     overWriteName:'Cart High',
                    //     type : 'cart',
                    //     subtype: 'high',
                    //     url: './assets/fantasyTownKit/meshes/cartHigh.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/cartHigh.png',
                    //     snapPoints : [],
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.0, 0.25, 0)
                    // },
                    // {   
                    //     name:'chimney',
                    //     overWriteName:'Chimney',
                    //     type : 'chimney',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/chimney.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/chimney.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.35, 0, 0)
                    // },
                    // {   
                    //     name:'chimneyBase',
                    //     overWriteName:'Chimney Base',
                    //     type : 'chimney',
                    //     subtype: 'base',
                    //     url: './assets/fantasyTownKit/meshes/chimneyBase.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/chimneyBase.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.35, 0, 0)
                    // },
                    // {   
                    //     name:'chimneyTop',
                    //     overWriteName:'Chimney Base',
                    //     type : 'chimney',
                    //     subtype: 'top',
                    //     url: './assets/fantasyTownKit/meshes/chimneyTop.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/chimneyTop.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.35, 0, 0)
                    // },
                    // {   
                    //     name:'fence',
                    //     overWriteName:'Fence',
                    //     type : 'fence',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/fence.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/fence.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.45, 0, 0)
                    // },
                    // {   
                    //     name:'fenceBroken',
                    //     overWriteName:'Fence Broken',
                    //     type : 'fence',
                    //     subtype: 'broken',
                    //     url: './assets/fantasyTownKit/meshes/fenceBroken.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/fenceBroken.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.45, 0, 0)
                    // },
                    // {   
                    //     name:'fenceCurved',
                    //     overWriteName:'Fence Curved',
                    //     type : 'fence',
                    //     subtype: 'curved',
                    //     url: './assets/fantasyTownKit/meshes/fenceCurved.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/fenceCurved.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.45, 0, 0.45)
                    // },
                    // {   
                    //     name:'fenceGate',
                    //     overWriteName:'Fence Gate',
                    //     type : 'fence',
                    //     subtype: 'gate',
                    //     url: './assets/fantasyTownKit/meshes/fenceGate.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/fenceGate.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.45, 0, 0)
                    // },
                    // {   
                    //     name:'hedge',
                    //     overWriteName:'Hedge',
                    //     type : 'hedge',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/hedge.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/hedge.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.45, 0, 0)
                    // },
                    // {   
                    //     name:'hedgeCurved',
                    //     overWriteName:'Hedge',
                    //     type : 'hedge',
                    //     subtype: 'curved',
                    //     url: './assets/fantasyTownKit/meshes/hedgeCurved.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/hedgeCurved.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.45, 0, 0.45)
                    // },
                    // {   
                    //     name:'hedgeGate',
                    //     overWriteName:'Hedge Gate',
                    //     type : 'hedge',
                    //     subtype: 'gate',
                    //     url: './assets/fantasyTownKit/meshes/hedgeGate.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/hedgeGate.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.45, 0, 0)
                    // },
                    // {   
                    //     name:'lantern',
                    //     overWriteName:'Lantern',
                    //     type : 'lantern',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/lantern.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/lantern.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true
                    // },
                    // {   
                    //     name:'overhang',
                    //     overWriteName:'Overhang',
                    //     type : 'overhang',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/overhang.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/overhang.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true,
                    //     offset : new Vector3(0.4, -0.75, 0)
                    // },
                    // {   
                    //     name:'pillarStone',
                    //     overWriteName:'Pillar Stone',
                    //     type : 'pillar',
                    //     subtype: 'stone',
                    //     url: './assets/fantasyTownKit/meshes/pillarStone.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/pillarStone.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true       
                    // },
                    // {   
                    //     name:'pillarWood',
                    //     overWriteName:'Pillar Wood',
                    //     type : 'pillar',
                    //     subtype: 'wood',
                    //     url: './assets/fantasyTownKit/meshes/pillarWood.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/pillarWood.png',
                    //     snapPoints : [],                        
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : true       
                    // },
                    // {   
                    //     name:'planks',
                    //     overWriteName:'Planks',
                    //     type : 'planks',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/planks.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/planks.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'planks.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'planksHalf',
                    //     overWriteName:'Planks',
                    //     type : 'planks',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/planksHalf.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/planksHalf.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'planksHalf.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'planksOpening',
                    //     overWriteName:'Planks',
                    //     type : 'planks',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/planksOpening.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/planksOpening.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'planksOpening.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'poles',
                    //     overWriteName:'Planks',
                    //     type : 'poles',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/poles.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/poles.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'poles.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'polesHorizontal',
                    //     overWriteName:'Planks Horizontal',
                    //     type : 'poles',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/polesHorizontal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/polesHorizontal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'poles.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },               
                    // {   
                    //     name:'road',
                    //     overWriteName:'Road',
                    //     type : 'road',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/road.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/road.png',
                    //     useGlbTemplate : true,  
                    //     snapPointsParentName : 'road.SnapPoints',      
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadBend',
                    //     overWriteName:'Road',
                    //     type : 'road',
                    //     subtype: 'bend',
                    //     url: './assets/fantasyTownKit/meshes/roadBend.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadBend.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadBend.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadBend',
                    //     overWriteName:'Road Bend',
                    //     type : 'road',
                    //     subtype: 'bend',
                    //     url: './assets/fantasyTownKit/meshes/roadBend.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadBend.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadBend.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadCorner',
                    //     overWriteName:'Road Corner',
                    //     type : 'road',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/roadCorner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadCorner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadCorner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadCornerInner',
                    //     overWriteName:'Road Corner Inner',
                    //     type : 'road',
                    //     subtype: 'cornerInner',
                    //     url: './assets/fantasyTownKit/meshes/roadCornerInner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadCornerInner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadCornerInner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadCurb',
                    //     overWriteName:'Road Curb',
                    //     type : 'road',
                    //     subtype: 'curb',
                    //     url: './assets/fantasyTownKit/meshes/roadCurb.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadCurb.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadCurb.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadEdge',
                    //     overWriteName:'Road Edge',
                    //     type : 'road',
                    //     subtype: 'edge',
                    //     url: './assets/fantasyTownKit/meshes/roadEdge.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadEdge.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadEdge.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadEdgeSlope',
                    //     overWriteName:'Road Edge Slope',
                    //     type : 'road',
                    //     subtype: 'edgeSlope',
                    //     url: './assets/fantasyTownKit/meshes/roadEdgeSlope.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadEdgeSlope.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadEdgeSlope.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadSlope',
                    //     overWriteName:'Road Slope',
                    //     type : 'road',
                    //     subtype: 'slope',
                    //     url: './assets/fantasyTownKit/meshes/roadSlope.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadSlope.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadSlope.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadCurbSlope',
                    //     overWriteName:'Road Curb Slope',
                    //     type : 'road',
                    //     subtype: 'slope',
                    //     url: './assets/fantasyTownKit/meshes/roadCurbSlope.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadCurbSlope.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadCurbSlope.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roadCurbTransition',
                    //     overWriteName:'Road Curb Transition',
                    //     type : 'road',
                    //     subtype: 'slope',
                    //     url: './assets/fantasyTownKit/meshes/roadCurbTransition.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roadCurbTransition.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roadCurbTransition.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roof',
                    //     overWriteName:'Roof',
                    //     type : 'roof',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/roof.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roof.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roof.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofCorner',
                    //     overWriteName:'Roof',
                    //     type : 'roof',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/roofCorner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofCorner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofCorner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofCornerInner',
                    //     overWriteName:'Roof',
                    //     type : 'roof',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/roofCornerInner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofCornerInner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofCornerInner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofCornerRound',
                    //     overWriteName:'Roof Corner Round',
                    //     type : 'roof',
                    //     subtype: 'cornerRound',
                    //     url: './assets/fantasyTownKit/meshes/roofCornerRound.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofCornerRound.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofCornerRound.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofFlat',
                    //     overWriteName:'Roof Flat',
                    //     type : 'roof',
                    //     subtype: 'flat',
                    //     url: './assets/fantasyTownKit/meshes/roofFlat.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofFlat.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofFlat.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofGable',
                    //     overWriteName:'Roof Gable',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofGable.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofGable.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofGable.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofGableDetail',
                    //     overWriteName:'Roof Gable Detail',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofGableDetail.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofGableDetail.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofGableDetail.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofGableEnd',
                    //     overWriteName:'Roof Gable End',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofGableEnd.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofGableEnd.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofGableEnd.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofGableTop',
                    //     overWriteName:'Roof Gable Top',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofGableTop.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofGableTop.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofGableTop.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHigh',
                    //     overWriteName:'Roof High',
                    //     type : 'roof',
                    //     subtype: 'high',
                    //     url: './assets/fantasyTownKit/meshes/roofHigh.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHigh.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHigh.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighCorner',
                    //     overWriteName:'Roof High Corner',
                    //     type : 'roof',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/roofHighCorner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighCorner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighCorner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighCornerInner',
                    //     overWriteName:'Roof High Corner Inner',
                    //     type : 'roof',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/roofHighCornerInner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighCornerInner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighCornerInner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighCornerRound',
                    //     overWriteName:'Roof High Corner Round',
                    //     type : 'roof',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/roofHighCornerRound.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighCornerRound.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighCornerRound.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighFlat',
                    //     overWriteName:'Roof High Flat',
                    //     type : 'roof',
                    //     subtype: 'flat',
                    //     url: './assets/fantasyTownKit/meshes/roofHighFlat.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighFlat.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighFlat.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighGable',
                    //     overWriteName:'Roof High Gable',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofHighGable.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighGable.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighGable.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighGableDetail',
                    //     overWriteName:'Roof High Gable Detail',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofHighGableDetail.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighGableDetail.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighGableDetail.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighGableEnd',
                    //     overWriteName:'Roof High Gable End',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofHighGableEnd.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighGableEnd.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighGableEnd.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'roofHighGableTop',
                    //     overWriteName:'Roof Gable Top',
                    //     type : 'roof',
                    //     subtype: 'gable',
                    //     url: './assets/fantasyTownKit/meshes/roofHighGableTop.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/roofHighGableTop.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'roofHighGableTop.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wall',
                    //     overWriteName:'Wall',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wall.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wall.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wall.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallArch',
                    //     overWriteName:'Wall Arch',
                    //     type : 'wall',
                    //     subtype: 'arch',
                    //     url: './assets/fantasyTownKit/meshes/wallArch.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallArch.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallArch.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallArchTop',
                    //     overWriteName:'Wall Arch Top',
                    //     type : 'wall',
                    //     subtype: 'arch',
                    //     url: './assets/fantasyTownKit/meshes/wallArchTop.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallArchTop.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallArchTop.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallArchTopDetail',
                    //     overWriteName:'Wall Arch Top Detail',
                    //     type : 'wall',
                    //     subtype: 'arch',
                    //     url: './assets/fantasyTownKit/meshes/wallArchTopDetail.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallArchTopDetail.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallArchTopDetail.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallBlock',
                    //     overWriteName:'Wall Block',
                    //     type : 'wall',
                    //     subtype: 'block',
                    //     url: './assets/fantasyTownKit/meshes/wallBlock.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallBlock.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallBlock.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallBlockHalf',
                    //     overWriteName:'Wall Block Half',
                    //     type : 'wall',
                    //     subtype: 'block',
                    //     url: './assets/fantasyTownKit/meshes/wallBlockHalf.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallBlockHalf.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallBlockHalf.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallBroken',
                    //     overWriteName:'Wall Broken',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallBroken.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallBroken.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallBroken.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallCorner',
                    //     overWriteName:'Wall Corner',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallCorner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallCorner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallCorner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallCornerDetail',
                    //     overWriteName:'Wall Corner Detail',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallCornerDetail.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallCornerDetail.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallCornerDetail.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallCornerDiagonal',
                    //     overWriteName:'Wall Corner Diagonal',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallCornerDiagonal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallCornerDiagonal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallCornerDiagonal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallCornerDiagonalHalf',
                    //     overWriteName:'Wall Corner Diagonal Half',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallCornerDiagonalHalf.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallCornerDiagonalHalf.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallCornerDiagonalHalf.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallCornerEdge',
                    //     overWriteName:'Wall Corner Edge',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallCornerEdge.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallCornerEdge.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallCornerEdge.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallCurved',
                    //     overWriteName:'Wall Curved',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallCurved.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallCurved.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallCurved.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDetailCross',
                    //     overWriteName:'Wall Detail Cross',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallDetailCross.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDetailCross.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDetailCross.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDetailDiagonal',
                    //     overWriteName:'Wall Detail Diagonal',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallDetailDiagonal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDetailDiagonal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDetailDiagonal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDetailHorizontal',
                    //     overWriteName:'Wall Detail Horizontal',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallDetailHorizontal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDetailHorizontal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDetailHorizontal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDiagonal',
                    //     overWriteName:'Wall Diagonal',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallDiagonal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDiagonal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDiagonal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDoor',
                    //     overWriteName:'Wall Door',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallDoor.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDoor.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDoor.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDoorwayBase',
                    //     overWriteName:'Wall Doorway Base',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallDoorwayBase.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDoorwayBase.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDoorwayBase.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDoorwayRound',
                    //     overWriteName:'Wall Doorway Round',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallDoorwayRound.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDoorwayRound.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDoorwayRound.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDoorwaySquare',
                    //     overWriteName:'Wall Doorway Square',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallDoorwaySquare.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDoorwaySquare.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDoorwaySquare.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDoorwaySquareWide',
                    //     overWriteName:'Wall Doorway Square Wide',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallDoorwaySquareWide.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDoorwaySquareWide.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDoorwaySquareWide.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallDoorwaySquareWideCurved',
                    //     overWriteName:'Wall Doorway Square Wide Curved',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallDoorwaySquareWideCurved.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallDoorwaySquareWideCurved.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDoorwaySquareWideCurved.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallHalf',
                    //     overWriteName:'Wall Half',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallHalf.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallHalf.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallHalf.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallRounded',
                    //     overWriteName:'Wall Rounded',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallRounded.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallRounded.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallRounded.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallSide',
                    //     overWriteName:'Wall Side',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallSide.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallSide.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallSide.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallSlope',
                    //     overWriteName:'Wall Slope',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallSlope.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallSlope.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallSlope.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWindowGlass',
                    //     overWriteName:'Wall Window Glass',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWindowGlass.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWindowGlass.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWindowGlass.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWindowRound',
                    //     overWriteName:'Wall Window Round',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWindowRound.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWindowRound.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWindowRound.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWindowShutters',
                    //     overWriteName:'Wall Window Shutters',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWindowShutters.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWindowShutters.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWindowShutters.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWindowSmall',
                    //     overWriteName:'Wall Window Small',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWindowSmall.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWindowSmall.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWindowSmall.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWindowStone',
                    //     overWriteName:'Wall Window Stone',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWindowStone.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWindowStone.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWindowStone.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWood',
                    //     overWriteName:'Wall Wood',
                    //     type : 'wall',
                    //     subtype: 'wood',
                    //     url: './assets/fantasyTownKit/meshes/wallWood.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWood.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWood.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodArch',
                    //     overWriteName:'Wall Wood Arch',
                    //     type : 'wall',
                    //     subtype: 'arch',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodArch.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodArch.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodArch.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodArchTop',
                    //     overWriteName:'Wall Wood Arch Top',
                    //     type : 'wall',
                    //     subtype: 'arch',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodArchTop.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodArchTop.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallArchTop.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodArchTopDetail',
                    //     overWriteName:'Wall Wood Arch Top Detail',
                    //     type : 'wall',
                    //     subtype: 'arch',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodArchTopDetail.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodArchTopDetail.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodArchTopDetail.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodBlock',
                    //     overWriteName:'Wall Wood Block',
                    //     type : 'wall',
                    //     subtype: 'block',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodBlock.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodBlock.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodBlock.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodBlockHalf',
                    //     overWriteName:'Wall Wood Block Half',
                    //     type : 'wall',
                    //     subtype: 'block',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodBlockHalf.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodBlockHalf.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodBlockHalf.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodBroken',
                    //     overWriteName:'Wall Wood Broken',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodBroken.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodBroken.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodBroken.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodCorner',
                    //     overWriteName:'Wall Wood Corner',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodCorner.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodCorner.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodCorner.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodCornerDiagonal',
                    //     overWriteName:'Wall Wood Corner Diagonal',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodCornerDiagonal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodCornerDiagonal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodCornerDiagonal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodCornerDiagonalHalf',
                    //     overWriteName:'Wall Wood Corner Diagonal Half',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodCornerDiagonalHalf.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodCornerDiagonalHalf.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodCornerDiagonalHalf.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodCornerEdge',
                    //     overWriteName:'Wall Wood Corner Edge',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodCornerEdge.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodCornerEdge.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodCornerEdge.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodCurved',
                    //     overWriteName:'Wall Wood Curved',
                    //     type : 'wall',
                    //     subtype: 'corner',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodCurved.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodCurved.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodCurved.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDetailCross',
                    //     overWriteName:'Wall Wood Detail Cross',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDetailCross.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDetailCross.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDetailCross.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDetailDiagonal',
                    //     overWriteName:'Wall Wood Detail Diagonal',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDetailDiagonal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDetailDiagonal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDetailDiagonal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDetailHorizontal',
                    //     overWriteName:'Wall Detail Horizontal',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDetailHorizontal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDetailHorizontal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDetailHorizontal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDiagonal',
                    //     overWriteName:'Wall Wood Diagonal',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDiagonal.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDiagonal.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDiagonal.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDoor',
                    //     overWriteName:'Wall Wood Door',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDoor.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDoor.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDoor.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDoorwayBase',
                    //     overWriteName:'Wall Wood Doorway Base',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDoorwayBase.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDoorwayBase.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDoorwayBase.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDoorwayRound',
                    //     overWriteName:'Wall Wood Doorway Round',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDoorwayRound.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDoorwayRound.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDoorwayRound.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDoorwaySquare',
                    //     overWriteName:'Wall Wood Doorway Square',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDoorwaySquare.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDoorwaySquare.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallDoorwaySquare.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDoorwaySquareWide',
                    //     overWriteName:'Wall Wood Doorway Square Wide',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDoorwaySquareWide.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDoorwaySquareWide.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDoorwaySquareWide.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodDoorwaySquareWideCurved',
                    //     overWriteName:'Wall Wood Doorway Square Wide Curved',
                    //     type : 'wall',
                    //     subtype: 'door',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodDoorwaySquareWideCurved.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodDoorwaySquareWideCurved.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodDoorwaySquareWideCurved.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodHalf',
                    //     overWriteName:'Wall Wood Half',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodHalf.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodHalf.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodHalf.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodRounded',
                    //     overWriteName:'Wall Wood Rounded',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodRounded.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodRounded.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodRounded.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodSide',
                    //     overWriteName:'Wall Wood Side',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodSide.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodSide.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodSide.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodSlope',
                    //     overWriteName:'Wall Wood Slope',
                    //     type : 'wall',
                    //     subtype: 'basic',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodSlope.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodSlope.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodSlope.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodWindowGlass',
                    //     overWriteName:'Wall Wood Window Glass',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodWindowGlass.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodWindowGlass.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodWindowGlass.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodWindowRound',
                    //     overWriteName:'Wall Wood Window Round',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodWindowRound.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodWindowRound.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodWindowRound.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodWindowShutters',
                    //     overWriteName:'Wall Wood Window Shutters',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodWindowShutters.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodWindowShutters.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodWindowShutters.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodWindowSmall',
                    //     overWriteName:'Wall Wood Window Small',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodWindowSmall.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodWindowSmall.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWindowSmall.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // {   
                    //     name:'wallWoodWindowStone',
                    //     overWriteName:'Wall Wood Window Stone',
                    //     type : 'wall',
                    //     subtype: 'window',
                    //     url: './assets/fantasyTownKit/meshes/wallWoodWindowStone.glb',
                    //     previewImageUrl: './assets/fantasyTownKit/icons/wallWoodWindowStone.png',
                    //     useGlbTemplate : true,
                    //     snapPointsParentName : 'wallWoodWindowStone.SnapPoints', 
                    //     spinSettings: {
                    //         x:{steps:[0]},
                    //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    //         z:{steps:[0]}
                    //     },
                    //     decoration : false
                    // },
                    // // {   
                    // //     name:'watermill',
                    // //     overWriteName:'Watermill',
                    // //     type : 'watermill',
                    // //     subtype: 'basic',
                    // //     url: './assets/fantasyTownKit/meshes/watermill.glb',
                    // //     previewImageUrl: './assets/fantasyTownKit/icons/watermill.png',
                    // //     useGlbTemplate : true,
                    // //     snapPointsParentName : 'watermill.SnapPoints', 
                    // //     spinSettings: {
                    // //         x:{steps:[0]},
                    // //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    // //         z:{steps:[0]}
                    // //     },
                    // //     decoration : false
                    // // },
                    // // {   
                    // //     name:'windmill',
                    // //     overWriteName:'Windmill',
                    // //     type : 'windmill',
                    // //     subtype: 'basic',
                    // //     url: './assets/fantasyTownKit/meshes/windmill.glb',
                    // //     previewImageUrl: './assets/fantasyTownKit/icons/windmill.png',
                    // //     useGlbTemplate : true,
                    // //     snapPointsParentName : 'windmill.SnapPoints', 
                    // //     spinSettings: {
                    // //         x:{steps:[0]},
                    // //         y:{steps:[0, Math.PI*0.5, Math.PI, Math.PI*1.5]},
                    // //         z:{steps:[0]}
                    // //     },
                    // //     decoration : false
                    // // },                 
                    // // {   
                    // //     name:'rockLarge',
                    // //     overWriteName:'Rock Large',
                    // //     type : 'rock',
                    // //     subtype: 'large',
                    // //     url: './assets/fantasyTownKit/meshes/rockLarge.glb',
                    // //     previewImageUrl: './assets/fantasyTownKit/icons/rockLarge.png',
                    // //     snapPoints : [],                        
                    // //     spinSettings: {
                    // //         x:{steps:[0]},
                    // //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    // //         z:{steps:[0]}
                    // //     },
                    // //     decoration : true
                    // // },
                    // // {   
                    // //     name:'rockWide',
                    // //     overWriteName:'Rock Wide',
                    // //     type : 'rock',
                    // //     subtype: 'wide',
                    // //     url: './assets/fantasyTownKit/meshes/rockWide.glb',
                    // //     previewImageUrl: './assets/fantasyTownKit/icons/rockWide.png',
                    // //     snapPoints : [],                        
                    // //     spinSettings: {
                    // //         x:{steps:[0]},
                    // //         y:{steps:[0, Math.PI*0.25, Math.PI*0.5,  Math.PI*0.75, Math.PI,  Math.PI*1.25, Math.PI*1.5,  Math.PI*1.75]},
                    // //         z:{steps:[0]}
                    // //     },
                    // //     decoration : true
                    // // }                
                ]
            })
        }
    }
}