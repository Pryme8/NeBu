import { GameManager } from "../../../../../../GameManager"
import { StateController } from "../../../../../../StateController"
import { IdleState, MovingState, JumpState, FallingState } from "./ProceduralControllerStates"

export interface IProceduralControllerStateControllerParams{

}

export class ProceduralControllerStateController extends StateController{    
    constructor(private _params:IProceduralControllerStateControllerParams, _manager:GameManager){
        super(_manager)
        this._onInitialize()
    }

    private _onInitialize(){  
        this.addState('idle', IdleState)                 
        this.addState('moving', MovingState)
        this.addState('jump', JumpState)
        this.addState('falling', FallingState)
    }
}