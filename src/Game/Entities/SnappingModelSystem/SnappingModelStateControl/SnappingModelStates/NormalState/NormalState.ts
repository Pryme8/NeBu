import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core"
import { SnappingModelStates } from "../SnappingModelStates"

export class NormalState extends SnappingModelStates{
    get name(){
        return 'normal'
    }
    
    toggleNodeMenu(toggle){
        return this.snapSystem.toggleNodeMenu(toggle)
    }

    private _keyboardObs = null

    static isShiftModifierOn: boolean = false

    constructor(parent){
        super(parent)
    }

    enter = (prevState): void => {   
        NormalState.isShiftModifierOn = false      
        this.toggleNodeMenu(true)
        this._keyboardObs = this.scene.onKeyboardObservable.add((keyInfo: KeyboardInfo)=>{
            switch(keyInfo.type){
                case KeyboardEventTypes.KEYDOWN:{
                    switch(keyInfo.event.code){
                        case 'ShiftLeft':
                            NormalState.isShiftModifierOn = true
                        break  
                    }                   
                    break
                }
                case KeyboardEventTypes.KEYUP:{
                    switch(keyInfo.event.code){
                        case 'ShiftLeft':
                            NormalState.isShiftModifierOn = false
                        break  
                    }                   
                    break
                }
            }
        })
    } 
    
    exit = (): void => { 
        this.toggleNodeMenu(false)
        NormalState.isShiftModifierOn = false
        this.scene.onKeyboardObservable.remove(
            this._keyboardObs
        )
    } 
}
