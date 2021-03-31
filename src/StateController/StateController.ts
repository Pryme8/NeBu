import { GameManager } from "../GameManager"
import { State } from "./State/State"

/*
    Generic State Controller
    Author: Andrew Butt Sr.
    Email: Pryme8@gmail.com
*/
export class StateController{
    private _states = {}
    get states(){
        return this._states
    }
    private _currentState = null
    get currentState(){
        return this._currentState
    }

    get manager(){
        return this._manager
    }

    constructor(private _manager: GameManager){}

    public addState(name, type){
        this.states[name] = type
    }
   
    public setState(name){
        const prevState = this._currentState
        if(prevState){
            if(prevState.name === name){
                return
            }
            prevState.exit()
        }

        const state = new this.states[name](this)
        
        this._currentState = state

        state.enter(prevState)
    }

    public getCurrentStateName(){
        return this._currentState.name ?? false
    }

    public update(delta){
        if(this._currentState){
            this._currentState.update(delta)
        }
    }
}