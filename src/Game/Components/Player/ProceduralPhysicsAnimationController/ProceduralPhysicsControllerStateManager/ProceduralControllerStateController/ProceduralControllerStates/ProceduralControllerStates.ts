import { AnimationGroup } from "@babylonjs/core"
import { State } from "../../../../../../../StateController/State"
import { ProceduralPhysicsAnimationController } from "../../../ProceduralPhysicsAnimationController"

export class ProceduralControllerState extends State{
    get name(){
        return ''
    }

    get scene(){
        return this.parent.manager.scene
    }

    constructor(parent){
        super(parent)
    } 
}

export class IdleState extends ProceduralControllerState{
    get name(){
        return 'idle'
    }

    constructor(parent){
        super(parent)
    }

    enter = (prevState): void => {  
        console.log('started Idling')
    }
  
}

export class MovingState extends ProceduralControllerState{    
    get name(){
        return 'moving'
    }

    constructor(parent){
        super(parent)
    }

    enter = (prevState):void=>{     
        console.log('started moving')
    }
}

export class JumpState extends ProceduralControllerState{    
    get name(){
        return 'jump'
    }
    jumpAnimation: AnimationGroup = null
    jumpEndObs = null
    controller = null

    constructor(parent){
        super(parent);
        
    }
    enter = (prevState):void=>{ 
        if(!this.jumpAnimation){
            this.controller = this.parent.manager.getEntityById('Player')[0].getComponentByName('ProceduralPhysicsAnimationController')[0]
            this.jumpAnimation = this.controller.movementAnimations.jump.basic
            this.jumpAnimation.loopAnimation = false                   
        }
        console.log('started a jump', this.jumpAnimation) 
        this.jumpAnimation.restart()
        this.jumpAnimation.play()
        this.jumpEndObs = this.jumpAnimation.onAnimationEndObservable.addOnce(()=>{  
            this.jumpAnimation.onAnimationEndObservable.remove(this.jumpEndObs)          
            this.controller.broadcastEvent({name:'resetJump'})
        })
    }

    exit = () =>{
        console.log('jump ended')        
    }
}

export class FallingState extends ProceduralControllerState{    
    get name(){
        return 'falling'
    }

    constructor(parent){
        super(parent)
    }

    enter = (prevState):void=>{     
        console.log('started falling')
    }
}