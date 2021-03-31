import { AnimationGroup, BabylonFileLoaderConfiguration, TransformNode, Vector3 } from "@babylonjs/core"
import { Component, Entity, IComponentParams } from "../../../../GameManager"
import { AnimationController } from "../../AnimationController"

export interface IAnimatedPlayerControllerParams extends IComponentParams{
    animationGroups: AnimationGroup[]
    inputMap: any
    playerControls? : IPlayerControlProperties
    movementTarget : TransformNode
}

export interface IPlayerControlProperties{
    useFollowCamera?: boolean
    playerMovement?: IPlayerMovementProperties
}

export interface IPlayerMovementProperties{
    idle: IAnimationProperties  
    forward: IAnimationProperties
    back: IAnimationProperties
    left: IAnimationProperties
    right: IAnimationProperties
}

export interface IAnimationProperties{
    animationGroup:AnimationGroup
    accel: number
    decel: number
    current : number
    direction : Vector3
}


export class AnimatedPlayerController extends Component{

    public get name(){
        return 'AnimatedPlayerController'
    }

    private _playerVelocity: Vector3 = Vector3.Zero()
    public get playerVelocity(){
        return this._playerVelocity
    }
    private _maxSpeed = 0.1
    private _decel = 0.5
    private _accel = 1

    private _playerMovement: IPlayerMovementProperties = {
        idle:{
            animationGroup: null,            
            accel: 0.2,
            decel: 0.86,
            current: 0,
            direction: Vector3.Zero()   
        },
        forward:{
            animationGroup: null,            
            accel: 1,
            decel: 0.86,
            current: 0,
            direction: Vector3.Forward()  
        },
        back:{
            animationGroup: null,
            accel: 1,
            decel: 0.86,
            current: 0 ,
            direction: Vector3.Backward()  
        },
        left:{
            animationGroup: null,
            accel: 1,
            decel: 0.86,
            current: 0,
            direction: Vector3.Left()   

        },
        right:{
            animationGroup: null,
            accel: 1,
            decel: 0.86,
            current: 0,
            direction: Vector3.Right()    
        }
    }

    get playerMovement(){
        return this._playerMovement
    }

    constructor(_params:IAnimatedPlayerControllerParams, _entity: Entity){
        super(_params, _entity)
        this._onInitialize()
    }

    private _animationController:AnimationController = null
    get animationController(){
        return this._animationController
    }

    private _onInitialize(){
        const pc = this.getProperty('playerControls') ?? {}
        this._playerMovement = { ...this._playerMovement, ...pc }

        const animationGroups = this.getProperty('animationGroups')
        const inputMap = this.getProperty('inputMap')
        animationGroups.forEach((ag)=>{                      
            ag.start(true)
            ag.setWeightForAllAnimatables(0)
            if(ag.name == 'walk'){
                ag.loopAnimation = true   
                this.playerMovement.forward.animationGroup = ag            
            }else if(ag.name == 'idle'){
                ag.setWeightForAllAnimatables(1)
                this.playerMovement.forward.animationGroup = ag   
            }else if(ag.name == 'walkLeft'){                
                this.playerMovement.left.animationGroup = ag   
            }else if(ag.name == 'walkRight'){                
                this.playerMovement.right.animationGroup = ag   
            }else if(ag.name == 'walkBack'){                
                this.playerMovement.back.animationGroup = ag   
            }
        })

        this._animationController = this.entity.AddComponent(AnimationController, {
            animationGroups, 
            inputMap,
            movementWeights: this.playerMovement
        }) as AnimationController
      
    }

    update = (delta:number): void =>{
        this.animationController.update(delta)
        const currentState = this.animationController.getCurrentStateName()
        if(currentState){
            const target = this.getProperty('movementTarget')
            this._updateInputInfluence(target, delta)
            target.position.addInPlace(this.playerVelocity)
        }
    }

    _updateInputInfluence(target, delta){
        const inputMap = this.getProperty('inputMap')
        console.log(inputMap)   
        this.playerMovement.forward.current = (inputMap.forward)?Math.min(1, this.playerMovement.forward.current + (this.playerMovement.forward.accel * delta)):this.playerMovement.forward.current * this.playerMovement.forward.decel
        this.playerMovement.back.current = (inputMap.back)?Math.min(1, this.playerMovement.back.current + (this.playerMovement.back.accel * delta)):this.playerMovement.back.current * this.playerMovement.back.decel
        this.playerMovement.left.current = (inputMap.left)?Math.min(1, this.playerMovement.left.current + (this.playerMovement.left.accel * delta)):this.playerMovement.left.current * this.playerMovement.left.decel
        this.playerMovement.right.current = (inputMap.right)?Math.min(1, this.playerMovement.right.current + (this.playerMovement.right.accel * delta)):this.playerMovement.right.current * this.playerMovement.right.decel
            
        let forceVector = Vector3.Zero()
        Object.keys(this.playerMovement).forEach((key)=>{
            forceVector.addInPlace(this.playerMovement[key].direction.scale(this.playerMovement[key].current))
        })

        if(forceVector.length() > 1){
            forceVector.normalize()
        }
        forceVector.scaleInPlace(this._accel * delta)
        forceVector.x = -forceVector.x
        forceVector = Vector3.TransformCoordinates(forceVector.add(target.position), (target.getWorldMatrix()).invert())
        this.playerVelocity.addInPlace(forceVector)
 
        if(this.playerVelocity.length() > this._maxSpeed){
            this.playerVelocity.normalize().scaleInPlace(this._maxSpeed)
        }

        this.playerVelocity.scaleInPlace(this._decel)
        

        // const forward = target.forward
        // const right = target.right
        // Object.keys(this.playerMovement).forEach((key)=>{
        //     if(key === 'velocityGlobal'){
        //         return
        //     }
        //     const direction = this.playerMovement[key]
        //     switch(key){
        //         case 'forward':
        //             forceVector.addInPlace(forward.scale(direction.velocity.current))
        //         break;
        //         case 'back':
        //             forceVector.addInPlace(forward.scale(-direction.velocity.current))
        //         break;
        //         case 'left':
        //             forceVector.addInPlace(right.scale(direction.velocity.current))
        //         break;
        //         case 'right':
        //             forceVector.addInPlace(right.scale(-direction.velocity.current))
        //         break;
        //     }
        //     direction.velocity.current *= direction.decel
        //     if(direction.velocity.current < direction.velocity.min){
        //         direction.velocity.current = 0
        //     }
        // }) 
        
    }
}