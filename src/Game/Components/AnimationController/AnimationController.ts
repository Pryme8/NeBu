import { AnimationGroup } from "@babylonjs/core"
import { Component, Entity, GameManager, IComponentParams } from "../../../GameManager"
import { StateController } from "../../../StateController"
import { State } from "../../../StateController/State/State"
import { ILerpableObs } from "../../../Utilities"

interface IAnimationStateControllerParams{
    animationGroups: AnimationGroup[]
    inputMap: any
    movementWeights: any
}

class AnimationStateController extends StateController{
    get animations(){
        return this._params.animationGroups
    }

    get inputMap(){
        return this._params.inputMap
    }

    get movementWeights(){
        return this._params.movementWeights
    }

    public animationMap = {}

    constructor(private _params:IAnimationStateControllerParams, _manager:GameManager){
        super(_manager)
        this._onInitialize()
    }

    private _onInitialize(){  
        this.addState('idle', IdleState)                 
        this.addState('walk', WalkState)
        this.animations.forEach((animation)=>{
            this.animationMap[animation.name] = animation
        })      
    }
}

export interface IAnimationControllerParams extends IComponentParams{
    animationGroups: AnimationGroup[]
    inputMap: any
    movementWeights: any
}

export class AnimationController extends Component{

    public get name(){
        return 'AnimationController'
    }

    private _stateController: AnimationStateController = null
    public getCurrentStateName(){
        return this._stateController.getCurrentStateName()
    }

    constructor(_params:IAnimationControllerParams, _entity: Entity){
        super(_params, _entity)
        this._onInitialize()
    }

    private _onInitialize(){
        const animationGroups = this.getProperty('animationGroups')
        const inputMap = this.getProperty('inputMap')
        const movementWeights = this.getProperty('movementWeights')
        this._stateController = new AnimationStateController({animationGroups, inputMap, movementWeights}, this.gameManager)
        this._stateController.setState('idle')
    }

    update = (delta:number): void =>{
        this._stateController.update(delta)
    }
}


class AnimationState extends State{
    get name(){
        return ''
    }
    get animation(){
        return this.parent.animations.filter((a)=>{
            return (a.name === this.name)
        })[0]
    }
    get inputMap(){
       return this.parent.inputMap
    }

    public currentWeight = 0
    public transitionSpeed = 0.5

    public transitionCallbacks: ILerpableObs[] = []

    get scene(){
        return this.parent.manager.scene
    }

    constructor(parent){
        super(parent)
    }

    exit = (): void => {
        this.transitionCallbacks.forEach((transition)=>{
            transition.stop()
        })
        this.transitionCallbacks.splice(0, this.transitionCallbacks.length)
    }

    setWeights(){
        const weights = this.parent.movementWeights
        const currentState = this.parent.getCurrentStateName()
        Object.keys(weights).forEach((key)=>{
            const weight = weights[key] 
            if(currentState ==  'walkBack'){
                console.log('back')
                if(key == 'left'){
                    console.log('backleft')
                    this.parent.animationMap['right']?.setWeightForAllAnimatables(weight.current)
                    return
                }else if(key == 'right'){
                    this.parent.animationMap['left']?.setWeightForAllAnimatables(weight.current)
                    return
                }
            }
            weight.animationGroup?.setWeightForAllAnimatables(weight.current)
        })
    }
}

class IdleState extends AnimationState{
    get name(){
        return 'idle'
    }

    constructor(parent){
        super(parent)
        this.currentWeight = 1
    }

    enter = (prevState): void => {
        const animation = this.animation
        if(animation){        
           
        }        
    }

    update = (delta:number): void => {
   
    }    
}

class WalkState extends AnimationState{    
    get name(){
        return 'walk'
    }

    constructor(parent){
        super(parent)
    }

    enter = (prevState):void=>{         
    }

    update = (delta:number): void => {

    }
}
