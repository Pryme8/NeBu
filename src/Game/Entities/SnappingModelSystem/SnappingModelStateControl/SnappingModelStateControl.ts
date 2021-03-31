import { GameManager } from "../../../../GameManager"
import { StateController } from "../../../../StateController"
import { SnappingModelSystem } from "../SnappingModelSystem"
import { LoadingState, NormalState, PlacingState  } from "./SnappingModelStates"

export interface ISnappingModelStateControlParams{
    snapSystem: SnappingModelSystem
}

export class SnappingModelStateControl extends StateController{  
    get snapSystem(){
        return this._params.snapSystem
    }  
    constructor(private _params:ISnappingModelStateControlParams, _manager:GameManager){
        super(_manager)
        this._onInitialize()
    }

    private _onInitialize(){  
        this.addState('loading', LoadingState)
        this.addState('normal', NormalState)
        this.addState('placing', PlacingState)
    }
}