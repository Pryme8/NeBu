import { AnimationGroup, Color3, Mesh, Ray, RayHelper, Scalar, Skeleton, Space, Vector2, Vector3, MeshBuilder, Matrix, Quaternion, PhysicsImpostor } from "@babylonjs/core";
import { Component, IComponentParams } from "../../../../GameManager/Component";
import { Entity } from "../../../../GameManager/Entity";
import { ShowLocalAxes } from "../../Debug";
import { CapsuleMesh, EmptyMesh, SphereMesh } from "../../Meshes";
import { AttachPhysics } from "../../Physics";
import { ProceduralPhysicsControllerStateManager } from "./ProceduralPhysicsControllerStateManager";

export interface IProceduralPhysicsAnimationControllerParams extends IComponentParams{
    target: Mesh 
    inputMap: any
    mouseData: any
    skeleton: Skeleton
    animationOptions : IDirectionAnimationOptions | IStateAnimationOption
}

export interface IDirectionAnimationOption{
    walk? : AnimationGroup
    run? : AnimationGroup
}

export interface IStateAnimationOption{
    basic? : AnimationGroup
    alternatives? : AnimationGroup[]
}

export interface IDirectionAnimationOptions{
    forward: IDirectionAnimationOption
    back: IDirectionAnimationOption
    left: IDirectionAnimationOption
    right: IDirectionAnimationOption
}

export interface IDirectionAnimationProperties extends IDirectionAnimationOption{
    weight: number  
}

export interface IMovementAnimations{
    idle: IStateAnimationProperties
    crouchPose: IStateAnimationProperties
    jump: IStateAnimationProperties
    forward: IDirectionAnimationProperties
    back: IDirectionAnimationProperties
    left: IDirectionAnimationProperties
    leftTurn: IStateAnimationProperties
    right: IDirectionAnimationProperties
    rightTurn: IStateAnimationProperties
}

export interface IStateAnimationProperties{
    weight: number
    basic?: AnimationGroup
    alternatives?: AnimationGroup[]
}

export class ProceduralPhysicsAnimationController extends Component{

    public get name(){
        return 'ProceduralPhysicsAnimationController'
    }  

    private _target = null
    private _inputMap = null
    private _mouseData = null
    private _skeleton = null
    private _headBone = null

    private _inputVelocityVector: Vector3 = Vector3.Zero()

    private _debugVelocityRay: RayHelper = null
    private _debugLookTargetRay: RayHelper = null

    private _stateController: ProceduralPhysicsControllerStateManager = null

    private _lastActorSpeed:Vector3 = Vector3.Zero()
    get lastActorSpeed(){
        return this._lastActorSpeed
    }

    _lastActorMovement = Vector3.Zero()
    _lastActorPosition = null

    private _rotationInputSpeeds = {
        acceleration : 3,
        deceleration : 3,
        speed: Vector2.Zero(),
        rotationSpeed: new Vector2(3, 2),
        angularVelocity : 0,
        lastAngle : 0,
        turnAnimationMaxVelocity: 0.02
    }    

    private _camera = null
    private _cameraOptions = {
        focusTarget : new Vector3(0, 1.7, 10),
        debugRay : null,  
        focusAngle : 0,
        distance: 4.5,
        heightOffset: 2,
        isPointerLock : ()=>{ this.gameManager.engine.isPointerLock } 
    }    

    private _inputSpeeds = {
        acceleration : 1,
        deceleration : 2,
        left : 0,
        right : 0,
        forward: 0,
        back: 0
    }

    private _movementSpeeds = {
        forward : {
            walk : 2,
            run : 4            
        },
        back : {
            walk : 1.5,
            run : 3
        },
        left : {
            walk : 1.75,
            run : 3.5
        },
        right : {
            walk : 2.75,
            run : 3.5
        }
    }
     
    private _movementAnimations: IMovementAnimations = {
        idle : {
            weight: 0,
            basic : null         
        },
        crouchPose:{
            weight: 0,
            basic: null
        },
        jump:{
            weight: 0,
            basic: null
        },
        forward : {
            weight: 0,
            walk : null,
            run : null            
        },
        back : {
            weight: 0,
            walk : null,
            run : null,
        },
        left : {
            weight: 0,
            walk : null,
            run : null
        },
        leftTurn :{
            weight: 0,
            basic : null 
        },
        right : {
            weight: 0,
            walk : null,
            run : null 
        },
        rightTurn :{
            weight: 0,
            basic : null 
        }        
    }

    get movementAnimations(){
        return this._movementAnimations
    }

    private _runOptions = {
        acceleration : 2,
        deceleration : 4,
        weight: 0        
    }

    private _crouchOptions = {
        acceleration : 3,
        deceleration : 2,
        weight: 0,
        speedImpact: 0.25,
        topColliderDrop: 0.25,            
    }

    private _jumpOptions = {
        canJump : true,
        jumping : false,
        jumpStarted : false,
        impulseFrame : 0.65,
        fallingStartFrame : 1.0,
        transitionSpeed: 0.1,
        jumpPower : 5,
        bottomColliderRaise: 1,
        weight: 0,
        lungFactor : 1.6
    }

    private _resetJump(delta){
        this._jumpOptions.canJump = true
        this._jumpOptions.jumping = false
        this._jumpOptions.jumpStarted = false

        if(this.lastActorSpeed.length() > 0.0001 * delta){
            this._stateController.setState('moving')
        }else{
            this._stateController.setState('idle')
        }
    }

    private _directionsReadOnly = {
        forward: Vector3.Forward(),
        back: Vector3.Backward(),
        left: Vector3.Left(),
        right: Vector3.Right(),
        up: Vector3.Up(),
        down: Vector3.Down()
    }

    _tempMatrix : Matrix = Matrix.Identity()

    private _physicsBody = null
    private _topCollider = null
    private _topColliderInitialPosition = null
    private _bottomCollider = null
    private _bottomColliderInitialPosition = null
    

    constructor(_params:IProceduralPhysicsAnimationControllerParams, _entity: Entity){
        super(_params, _entity)  
        this._movementAnimations = {...this._movementAnimations, ..._params.animationOptions} as IMovementAnimations
        this.onInitialize()
    }

    onInitialize(){

        this._target = this.getProperty('target')
        const player = this.entity

        const bottomCollider =  player.AddComponent(CapsuleMesh, {
            meshName : 'PlayerColliderBottom',
            position : new Vector3(0,0.6,0),
            size: new Vector2(0.35, 1.0),
            capSubdivisions : 5, 
            visibility: 0.0                   
        }) as CapsuleMesh
        this._bottomCollider = bottomCollider
        this._bottomColliderInitialPosition = bottomCollider.mesh.position.clone()

        const topCollider =  player.AddComponent(SphereMesh, {
            meshName : 'PlayerColliderTop',
            position : new Vector3(0,1.35,0),
            diameter: 0.9,
            segments : 16, 
            visibility: 0.0                
        }) as SphereMesh
        this._topCollider = topCollider
        this._topColliderInitialPosition = topCollider.mesh.position.clone()

        const physicsBody = player.AddComponent(EmptyMesh, {
            meshName : 'PlayerCollider'                 
        }) as EmptyMesh

        physicsBody.mesh.addChild(bottomCollider.mesh)
        physicsBody.mesh.addChild(topCollider.mesh)

        player.AddComponent(AttachPhysics, {
            imposterMap:[
                {
                    type: PhysicsImpostor.CapsuleImpostor,
                    target: bottomCollider.mesh,
                    options : {
                        mass: 0.0,
                        restitution: 0.1,
                        friction: 0.865
                    }
                },
                {
                    type: PhysicsImpostor.SphereImpostor,
                    target: topCollider.mesh,
                    options : {
                        mass: 0.0,
                        restitution: 0.1,
                        friction: 0.865
                    }
                },
                {
                    type: PhysicsImpostor.NoImpostor,
                    target: physicsBody.mesh,
                    options : {
                        mass: 1.0,
                        restitution: 0.1,
                        friction: 0.865
                    }
                }
            ]
        })

        // player.AddComponent(ShowLocalAxes, {
        //     target: physicsBody.mesh,
        //     size: 1.5
        // })

        this._target.setParent(physicsBody.mesh)

        physicsBody.mesh.position.y = 2
        physicsBody.mesh.physicsImpostor.physicsBody.setAngularFactor(0)
        this._physicsBody = physicsBody

        this._inputMap = this.getProperty('inputMap')
 
        this._mouseData = this.getProperty('mouseData')
        this._skeleton = this.getProperty('skeleton')
        this._headBone = this._skeleton.bones[6]
        this._stateController = this.entity.AddComponent(ProceduralPhysicsControllerStateManager,{}) as ProceduralPhysicsControllerStateManager   
        this._camera = this.scene.activeCamera 

        this.registerEvent('resetJump', ()=>{
            console.log('Resting Jump!')
            this._resetJump(this.gameManager.delta)
        })
    }

    update = (delta: number) =>{
        const target = this._physicsBody.mesh    
        this.updateRotationInputSpeeds(delta)
        this.updateWeights(delta)
        this.setAnimationWeights()
        this.moveActor(target, delta) 
        if(this.gameManager.engine.isPointerLock){ 
            this.updateCamera(target, delta)
        }
        //this.updateDebugRays(target)
    }

    updateRotationInputSpeeds(delta){
        //const currentAngleSign = Math.sign(this._rotationInputSpeeds.lastAngle)
        const accel = this._rotationInputSpeeds.acceleration * delta
        const decel = (1 - (this._rotationInputSpeeds.deceleration * delta))
        this._rotationInputSpeeds.speed.x = (Math.abs(this._mouseData.lastMovement.x) > 0.0001)?Math.max(-1,Math.min(1, this._rotationInputSpeeds.speed.x+(this._mouseData.lastMovement.x*accel))):this._rotationInputSpeeds.speed.x*decel
        this._rotationInputSpeeds.speed.y = (Math.abs(this._mouseData.lastMovement.y) > 0.0001)?Math.max(-1,Math.min(1, this._rotationInputSpeeds.speed.y+(this._mouseData.lastMovement.y*accel))):this._rotationInputSpeeds.speed.y*decel
        if(Math.abs(this._rotationInputSpeeds.speed.x) < 0.0001){
            this._rotationInputSpeeds.speed.x = 0
        }
        if(Math.abs(this._rotationInputSpeeds.speed.y) < 0.0001){
            this._rotationInputSpeeds.speed.y = 0
        }
    }

    _clampWeightToEpsilon(target, epsilon = 0.0001){
        return (target.weight < epsilon)?0:target.weight
    }

    updateWeights(delta){       
        const inputMap = this._inputMap
        const accel = this._inputSpeeds.acceleration * delta
        const decel = (1 - (this._inputSpeeds.deceleration * delta))

        let currentState = this._stateController.getCurrentStateName()

        const canMove = (currentState == 'idle' || currentState == 'moving')

        //console.log(currentState, canMove, this._jumpOptions.canJump)

        if(this._jumpOptions.canJump && canMove){      
            //console.log("can jump!")  
            if(this._inputMap.jump){
                this._jumpOptions.canJump = false
                this._jumpOptions.jumping = true
                this._stateController.setState('jump')
            }
        }

        currentState = this._stateController.getCurrentStateName()
                
        if(currentState == 'jump'){
            this._jumpOptions.weight = Scalar.Lerp(this._jumpOptions.weight, 1, this._jumpOptions.transitionSpeed)
        }else{
            if(this._jumpOptions.weight > 0.0001){
                this._jumpOptions.weight = Scalar.Lerp(this._jumpOptions.weight, 0, this._jumpOptions.transitionSpeed)
            }else{
                this._jumpOptions.weight = 0
            }
        }
       
        const isJumpingOrFalling = (currentState == 'jump' || currentState == 'falling')

        this._inputSpeeds.forward = (inputMap.forward && canMove) ? Math.min(1, this._inputSpeeds.forward + accel) : (!isJumpingOrFalling) ? this._inputSpeeds.forward * decel : this._inputSpeeds.forward
        this._inputSpeeds.back = (inputMap.back && canMove) ? Math.min(1, this._inputSpeeds.back + accel) : (!isJumpingOrFalling) ? this._inputSpeeds.back * decel : this._inputSpeeds.back
        this._inputSpeeds.right = (inputMap.right && canMove) ? Math.min(1, this._inputSpeeds.right + accel) : (!isJumpingOrFalling) ? this._inputSpeeds.right * decel : this._inputSpeeds.right
        this._inputSpeeds.left = (inputMap.left && canMove) ? Math.min(1, this._inputSpeeds.left + accel) : (!isJumpingOrFalling) ? this._inputSpeeds.left * decel : this._inputSpeeds.left

        this._inputVelocityVector.set(
            this._inputSpeeds.right - this._inputSpeeds.left,
            0,
            this._inputSpeeds.forward - this._inputSpeeds.back
        )

        if(this._inputVelocityVector.length() > 1){
            this._inputVelocityVector.normalize()
        }

        this._movementAnimations.forward.weight = Math.max(0, Vector3.Dot(this._inputVelocityVector, this._directionsReadOnly.forward))
        this._movementAnimations.back.weight = Math.max(0, Vector3.Dot(this._inputVelocityVector, this._directionsReadOnly.back))
        this._movementAnimations.right.weight = Math.max(0, Vector3.Dot(this._inputVelocityVector, this._directionsReadOnly.right))
        this._movementAnimations.left.weight = Math.max(0, Vector3.Dot(this._inputVelocityVector, this._directionsReadOnly.left))
        this._movementAnimations.leftTurn.weight = (this._rotationInputSpeeds.angularVelocity < -0.005)?Math.abs(this._rotationInputSpeeds.angularVelocity)/this._rotationInputSpeeds.turnAnimationMaxVelocity:0
        this._movementAnimations.rightTurn.weight = (this._rotationInputSpeeds.angularVelocity > 0.005)?Math.abs(this._rotationInputSpeeds.angularVelocity)/this._rotationInputSpeeds.turnAnimationMaxVelocity:0

        this._crouchOptions.weight = (inputMap.crouch)?Math.min(1, this._crouchOptions.weight + (this._crouchOptions.acceleration * delta)):this._crouchOptions.weight * (1.0-(this._crouchOptions.deceleration * delta))
        this._runOptions.weight = (inputMap.run && currentState === 'moving')?Math.min(1, this._runOptions.weight + (this._runOptions.acceleration * delta)):this._runOptions.weight * (1.0-(this._runOptions.deceleration * delta))

        this._movementAnimations.forward.weight = this._clampWeightToEpsilon(this._movementAnimations.forward)
        this._movementAnimations.back.weight = this._clampWeightToEpsilon(this._movementAnimations.back)
        this._movementAnimations.left.weight = this._clampWeightToEpsilon(this._movementAnimations.left)
        this._movementAnimations.right.weight = this._clampWeightToEpsilon(this._movementAnimations.right)
        this._movementAnimations.leftTurn.weight = this._clampWeightToEpsilon(this._movementAnimations.leftTurn)
        this._movementAnimations.rightTurn.weight = this._clampWeightToEpsilon(this._movementAnimations.rightTurn) 
        this._runOptions.weight = this._clampWeightToEpsilon(this._runOptions) 
        this._crouchOptions.weight = this._clampWeightToEpsilon(this._crouchOptions)
    }
    
    moveActor(target, delta:number){
        const actorSpeed = Vector3.Zero()
        const invertCrouchWeight = this._crouchOptions.weight
        const invertCrouchImpact = Scalar.Lerp(1, this._crouchOptions.speedImpact, invertCrouchWeight)
        this._topCollider.mesh.position.y = Scalar.Lerp(this._topColliderInitialPosition.y, this._topColliderInitialPosition.y-this._crouchOptions.topColliderDrop, this._crouchOptions.weight)
        
        const jumpForce = Vector3.Up()
        if(this._jumpOptions.jumping){
            const currentFrame = this.movementAnimations.jump.basic.animatables[0].masterFrame            
            if(!this._jumpOptions.jumpStarted && currentFrame >= this._jumpOptions.impulseFrame){
                this._jumpOptions.jumpStarted = true
                target.physicsImpostor.applyImpulse((new Vector3(0,this._jumpOptions.jumpPower,0)).add(this._lastActorSpeed.clone().scale(this._jumpOptions.lungFactor)), target.getAbsolutePosition())
            }
            if(this._jumpOptions.jumpStarted && currentFrame >= this._jumpOptions.impulseFrame){
                this._bottomCollider.mesh.position.y = Scalar.Lerp(this._bottomColliderInitialPosition.y, this._bottomColliderInitialPosition.y+this._jumpOptions.bottomColliderRaise, 0.5)
            }else if(this._jumpOptions.jumpStarted && currentFrame >= this._jumpOptions.fallingStartFrame){
                this._bottomCollider.mesh.position.y = Scalar.Lerp(this._bottomCollider.mesh.position.y, this._bottomColliderInitialPosition.y, 0.5)
            }
            console.log(`weight:${this._jumpOptions.weight}`)
        }else{
            this._bottomCollider.mesh.position.y = this._bottomColliderInitialPosition.y
        }
     
        actorSpeed.addInPlace(
            target.forward.scale(
            this._movementAnimations.forward.weight *
            Scalar.Lerp(this._movementSpeeds.forward.walk, this._movementSpeeds.forward.run, this._runOptions.weight)*invertCrouchImpact
            )
        )

        actorSpeed.addInPlace(
            target.forward.scale(
            -this._movementAnimations.back.weight *
            Scalar.Lerp(this._movementSpeeds.back.walk, this._movementSpeeds.back.run, this._runOptions.weight)*invertCrouchImpact
            )
        )

        actorSpeed.addInPlace(
            target.right.scale(
                -this._movementAnimations.left.weight *
                Scalar.Lerp(this._movementSpeeds.left.walk, this._movementSpeeds.left.run, this._runOptions.weight)*invertCrouchImpact
            )
        )

        actorSpeed.addInPlace(
            target.right.scale(
                this._movementAnimations.right.weight * 
                Scalar.Lerp(this._movementSpeeds.right.walk, this._movementSpeeds.right.run, this._runOptions.weight)*invertCrouchImpact
            )
        )

        this._lastActorSpeed = actorSpeed.scale(delta)
        const newPosition = target.position.clone()
        if(this._lastActorPosition){
            this._lastActorMovement = newPosition.subtract(this._lastActorPosition)

        }   
        this._lastActorPosition = newPosition
        
        target.position.addInPlace(this._lastActorSpeed)

        this._cameraOptions.focusTarget.addInPlace(this._lastActorMovement)
        
        const rotation = target.rotationQuaternion.toEulerAngles()

        const angularDiff = this._rotationInputSpeeds.lastAngle - rotation.y
        this._rotationInputSpeeds.lastAngle = rotation.y
        this._rotationInputSpeeds.angularVelocity = angularDiff

        rotation.y = this.lerp_angle(rotation.y, this._cameraOptions.focusAngle, 0.05*invertCrouchImpact)
       
        Quaternion.RotationYawPitchRollToRef(rotation.y, rotation.x, rotation.z, target.rotationQuaternion )  

    }

    lerp_angle(from, to, weight){
        return from + this.short_angle_dist(from, to) * weight
    }  

    short_angle_dist(from, to){
        const max_angle = Math.PI * 2
        const difference = (to - from) % max_angle
        return ((2 * difference) % max_angle) - difference
    }

    updateCamera(target, delta){  
        const headAbs = target.position.clone()
        headAbs.addInPlaceFromFloats(0, 1.7, 0)
        const direction = this._cameraOptions.focusTarget.clone().subtract(headAbs).normalize()
        let newDirection = Vector3.Zero()
        direction.rotateByQuaternionToRef(Quaternion.RotationAxis(
            this._directionsReadOnly.up,
            (this._rotationInputSpeeds.speed.x * this._rotationInputSpeeds.rotationSpeed.x * delta)            
        ), newDirection)
        newDirection.normalize()   

        const upDistance = Vector3.Dot(newDirection, this._directionsReadOnly.up)
        const right = Vector3.Cross(this._directionsReadOnly.up, newDirection)
        if(upDistance < 0.925 && upDistance > -0.9){            
            newDirection.rotateByQuaternionToRef(Quaternion.RotationAxis(
                right,
                (this._rotationInputSpeeds.speed.y * this._rotationInputSpeeds.rotationSpeed.y * delta)            
            ), newDirection)
        }else{
            if(upDistance > 0.9){
                newDirection.rotateByQuaternionToRef(Quaternion.RotationAxis(
                    right,
                    (this._rotationInputSpeeds.rotationSpeed.y * delta)         
                ), newDirection)
            }else{
                newDirection.rotateByQuaternionToRef(Quaternion.RotationAxis(
                    right,
                    (-this._rotationInputSpeeds.rotationSpeed.y * delta)
                ), newDirection)
            }            
        }
        newDirection.normalize()

        this._cameraOptions.focusTarget = Vector3.Lerp( this._cameraOptions.focusTarget, headAbs.add(newDirection), 0.5)        
        
        if(this._cameraOptions.debugRay){
            this._cameraOptions.debugRay.dispose()
        }
  
        this._cameraOptions.focusAngle = Math.atan2((this._cameraOptions.focusTarget.x-headAbs.x), (this._cameraOptions.focusTarget.z-headAbs.z)) 
       
        this._headBone.getTransformNode().lookAt(this._cameraOptions.focusTarget, Math.PI, -Math.PI*0.85, 0, Space.WORLD) 

        const offsetDirection = this._cameraOptions.focusTarget.clone().subtract(headAbs)
        const offsetPosition = headAbs.subtract(offsetDirection.scale(this._cameraOptions.distance))

        const oldPos = this._camera.position.clone()        
        this._camera.position = offsetPosition
        this._camera.setTarget(this._cameraOptions.focusTarget)
        this._camera.position.addInPlace(this._camera.getDirection(this._directionsReadOnly.up).scale(this._cameraOptions.heightOffset))
        this._camera.position = Vector3.Lerp(oldPos, this._camera.position, 0.025)
        this._camera.setTarget(this._cameraOptions.focusTarget)

        // this._cameraOptions.debugRay = MeshBuilder.CreateLines('debug', {
        //     points:[headAbs, this._cameraOptions.focusTarget]
        // }, this.scene)
    }
     
    setAnimationWeights(){
        const backwardsFactor = Math.max( 0, Math.min(1, (0.25/Vector3.Dot(this._inputVelocityVector, this._directionsReadOnly.back))))
        const invertBackFactor = 1-backwardsFactor
        const runWeight = this._runOptions.weight
        const invertRunWeight = 1-runWeight
        const invertJumpWeight = 1 - this._jumpOptions.weight

        let total = 0

        if(this._jumpOptions.weight > 0.0001){
            this._movementAnimations.jump.basic.setWeightForAllAnimatables(this._jumpOptions.weight)
            total+=this._jumpOptions.weight
        }else{
            this._movementAnimations.jump.basic.setWeightForAllAnimatables(0)
        }

        if(this._crouchOptions.weight > 0.0001){
            this._movementAnimations.crouchPose.basic.setWeightForAllAnimatables(this._crouchOptions.weight*invertJumpWeight)
        }else{
            this._movementAnimations.crouchPose.basic.setWeightForAllAnimatables(0)
        }

        if(this._movementAnimations.forward.walk && this._movementAnimations.forward.weight > 0.0001){
            this._movementAnimations.forward.walk.setWeightForAllAnimatables(this._movementAnimations.forward.weight*invertRunWeight*invertJumpWeight)
            this._movementAnimations.forward.run.setWeightForAllAnimatables(this._movementAnimations.forward.weight*runWeight*invertJumpWeight)
            total+=this._movementAnimations.forward.weight
        }else{
            this._movementAnimations.forward.walk.setWeightForAllAnimatables(0)
        }
        if(this._movementAnimations.back.walk && this._movementAnimations.back.weight > 0.0001){
            this._movementAnimations.back.walk.setWeightForAllAnimatables(this._movementAnimations.back.weight*invertRunWeight*invertJumpWeight)
            this._movementAnimations.back.run.setWeightForAllAnimatables(this._movementAnimations.back.weight*runWeight*invertJumpWeight)
            total+=this._movementAnimations.back.weight
        }else{
            this._movementAnimations.back.walk.setWeightForAllAnimatables(0)
        }

        if(backwardsFactor > 0.0001){
            if(this._movementAnimations.left.walk && this._movementAnimations.left.weight > 0.0001){ 
                this._movementAnimations.left.walk.setWeightForAllAnimatables(this._movementAnimations.left.weight*backwardsFactor*invertRunWeight*invertJumpWeight)
                this._movementAnimations.right.walk.setWeightForAllAnimatables(this._movementAnimations.left.weight*invertBackFactor*invertRunWeight*invertJumpWeight)
                this._movementAnimations.left.run.setWeightForAllAnimatables(this._movementAnimations.left.weight*backwardsFactor*runWeight*invertJumpWeight)
                this._movementAnimations.right.run.setWeightForAllAnimatables(this._movementAnimations.left.weight*invertBackFactor*runWeight*invertJumpWeight)
                total+=this._movementAnimations.left.weight     
            }
            if(this._movementAnimations.right.walk && this._movementAnimations.right.weight > 0.0001){    
                this._movementAnimations.right.walk.setWeightForAllAnimatables(this._movementAnimations.right.weight*backwardsFactor*invertRunWeight*invertJumpWeight)
                this._movementAnimations.left.walk.setWeightForAllAnimatables(this._movementAnimations.right.weight*invertBackFactor*invertRunWeight*invertJumpWeight) 
                this._movementAnimations.right.run.setWeightForAllAnimatables(this._movementAnimations.right.weight*backwardsFactor*runWeight*invertJumpWeight)
                this._movementAnimations.left.run.setWeightForAllAnimatables(this._movementAnimations.right.weight*invertBackFactor*runWeight*invertJumpWeight)  
                total+=this._movementAnimations.right.weight            
            }
        }else{
            if(this._movementAnimations.left.walk && this._movementAnimations.left.weight > 0.0001){ 
                this._movementAnimations.left.walk.setWeightForAllAnimatables(this._movementAnimations.left.weight*invertRunWeight*invertJumpWeight)
                this._movementAnimations.left.run.setWeightForAllAnimatables(this._movementAnimations.left.weight*runWeight*invertJumpWeight)
                total+=this._movementAnimations.left.weight     
            }else{
                this._movementAnimations.left.walk.setWeightForAllAnimatables(0)
            }
            if(this._movementAnimations.right.walk && this._movementAnimations.right.weight > 0.0001){    
                this._movementAnimations.right.walk.setWeightForAllAnimatables(this._movementAnimations.right.weight*invertRunWeight*invertJumpWeight)  
                this._movementAnimations.right.run.setWeightForAllAnimatables(this._movementAnimations.right.weight*runWeight*invertJumpWeight)    
                total+=this._movementAnimations.right.weight            
            }else{
                this._movementAnimations.right.walk.setWeightForAllAnimatables(0)
            }
        }

        if(this._movementAnimations.leftTurn.weight > 0.0001){
            this._movementAnimations.leftTurn.basic.setWeightForAllAnimatables(this._movementAnimations.leftTurn.weight*invertJumpWeight)
            total+=this._movementAnimations.leftTurn.weight  
        }else{
            this._movementAnimations.leftTurn.basic.setWeightForAllAnimatables(0)
        }
        
        if(this._movementAnimations.rightTurn.weight > 0.0001){
            this._movementAnimations.rightTurn.basic.setWeightForAllAnimatables(this._movementAnimations.rightTurn.weight*invertJumpWeight)
            total+=this._movementAnimations.rightTurn.weight  
        }else{
            this._movementAnimations.rightTurn.basic.setWeightForAllAnimatables(0)
        }
        
        if(this._movementAnimations.idle.basic){ 
            this._movementAnimations.idle.weight = Math.max(0, 1.0-total)
            this._movementAnimations.idle.basic.setWeightForAllAnimatables(this._movementAnimations.idle.weight)
        }

        const currentState = this._stateController.getCurrentStateName()  
        //const jumpingOrFalling = (currentState == 'jumping' || currentState == 'falling')
        
        if(currentState === 'idle'){
            if(total > 0.01){
                this._stateController.setState('moving')
            }
        }else if(currentState === 'moving'){
            if(total < 0.01){
                this._stateController.setState('idle')
            }
        }
    }

    updateDebugRays(target){
        if(this._debugVelocityRay){
            this._debugVelocityRay.dispose()
        }
        const speed = this._inputVelocityVector.length()
        this._debugVelocityRay = RayHelper.CreateAndShow(new Ray(
            target.position, this._inputVelocityVector, this._inputVelocityVector.length()),
            this.scene, Color3.Lerp(Color3.Green(), Color3.Red(), speed)
        )
   
    }
}