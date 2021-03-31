import { KeyboardEventTypes, KeyboardInfo, Observer, PointerEventTypes, PointerInfo, Vector3 } from "@babylonjs/core";
import { GameManager } from "../GameManager";


interface IGlobalMouseData{
    lastMovement: Vector3
}

export class ControlManager{    
    public get manager(){
        return this._manager
    }

    public get scene(){
        return this.manager.scene
    }

    private _inputMap: any = {}
    public get inputMap(){
        return this._inputMap
    }

    private _mouse:IGlobalMouseData = {
        lastMovement: Vector3.Zero()
    }
    public get mouse(){
        return this._mouse
    }

    private _mouseObs: Observer<PointerInfo>= null
    private _keyboardObs: Observer<KeyboardInfo> = null

    constructor(private _manager: GameManager){
        this._mouseObs = this.scene.onPointerObservable.add((pointerInfo: PointerInfo)=>{
            if(pointerInfo.type === PointerEventTypes.POINTERMOVE){
                this._mouse.lastMovement.set(pointerInfo.event.movementX, pointerInfo.event.movementY, this._mouse.lastMovement.z)
            }
        })
        this._keyboardObs = this.scene.onKeyboardObservable.add((keyboardInfo: KeyboardInfo)=>{
            switch(keyboardInfo.type){
                case KeyboardEventTypes.KEYDOWN:{
                    console.log(keyboardInfo.event.code)
                        if(this.inputMap[keyboardInfo.event.code] !== undefined){
                            this.inputMap[keyboardInfo.event.code] = true
                        }
                    break
                }
                case KeyboardEventTypes.KEYUP:{
                        if(this.inputMap[keyboardInfo.event.code] !== undefined){
                            this.inputMap[keyboardInfo.event.code] = false
                        }
                    break
                }
            }
        })
        this.scene.onAfterRenderObservable.add(()=>{
            this._mouse.lastMovement.set(0, 0, 0)
        })
    }

    public addInput(code){
        this.inputMap[code] = false
    }    
    public removeInput(code){
        this.inputMap[code] = undefined
    }
}