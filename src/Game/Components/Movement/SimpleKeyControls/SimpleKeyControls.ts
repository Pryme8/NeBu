import { TransformNode, Vector3 } from "@babylonjs/core"
import { Component, Entity, IComponentParams } from "../../../../GameManager"

export interface ISimpleKeyControlsParams extends IComponentParams{
    left : string
    right: string
    forward : string
    back : string
    target : TransformNode
    accel? : number
    decel? : number
    maxSpeed? : number
}

export class SimpleKeyControls extends Component{

    public get name(){
        return 'SimpleKeyControls'
    }

    private _velocity: Vector3 = Vector3.Zero()

    get left(){
        return this.getProperty('left')
    }
    get right(){
        return this.getProperty('right')
    }
    get forward(){
        return this.getProperty('forward')
    }
    get back(){
        return this.getProperty('back')
    }
    get accel(){
        return this.getProperty('accel') ?? 0.01
    }
    get decel(){
        return this.getProperty('decel') ?? 0.886
    }
    get maxSpeed(){
        return this.getProperty('maxSpeed') ?? 1
    }

    constructor(_params:ISimpleKeyControlsParams, _entity: Entity){
        super(_params, _entity)
    }

    update = (delta:number): void =>{
        const inputs = this.inputMap
        const inputDirection = Vector3.Zero()
        const target = this.getProperty('target')
        const forward = target.forward
        const right = target.right

        if(inputs[this.left]){
            inputDirection.addInPlace(right.scale(-1))
        }
        if(inputs[this.right]){
            inputDirection.addInPlace(right)
        }
        if(inputs[this.forward]){
            inputDirection.addInPlace(forward)
        }
        if(inputs[this.back]){
            inputDirection.addInPlace(forward.scale(-1))
        }
        if(!inputDirection.equalsWithEpsilon(Vector3.Zero(), 0.1)){
            inputDirection.normalize()
        }  

        this._velocity.addInPlace(inputDirection.scale(this.accel))
        const newVelTotal = this._velocity.length()
        console.log(newVelTotal)
        if(newVelTotal > this.maxSpeed ){
            this._velocity.normalizeFromLength(this.maxSpeed)
        }else if(newVelTotal < this.accel*0.01){
            this._velocity.scaleInPlace(0)
        }
        this._velocity.scaleInPlace(this.decel)
        console.log(this._velocity)
        
        target.position.addInPlace(this._velocity)
    }
}