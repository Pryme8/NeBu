import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core"
import { SnappingModelStates } from "../SnappingModelStates"

export class PlacingState extends SnappingModelStates{
    get name(){
        return 'placing'
    }
    toggleToolMenu(toggle){
        return this.snapSystem.toggleToolMenu(toggle)
    }
    private _currentTool = 'snapTransform'
    get currentTool(){
        return this._currentTool
    }
    setCurrentTool(tool){
        this._currentTool = tool
    }

    private _keyboardObs = null

    constructor(parent){
        super(parent)
    }

    enter = (prevState): void => {  
        console.log('placing state')
        this.toggleToolMenu(true)
        this._keyboardObs = this.scene.onKeyboardObservable.add((keyInfo: KeyboardInfo)=>{
            switch(keyInfo.type){
                case KeyboardEventTypes.KEYDOWN:{
                    switch(keyInfo.event.code){
                        case 'KeyQ':
                            this.snapSystem.mouseControls.activeModel.rotate('y', -1)
                        break
                        case 'KeyW':
                            this.snapSystem.mouseControls.activeModel.rotate('y', 1)
                        break
                        case 'KeyZ':
                            this.snapSystem.mouseControls.activeModel.flip('z')
                        break
                        case 'KeyX':
                            this.snapSystem.mouseControls.activeModel.flip('x')
                        break
                        case 'Delete':
                            this.snapSystem.disposeSnapEntity(this.snapSystem.mouseControls.activeModel)
                        break
                    }                   
                    break
                }
            }
        })
    } 
    
    exit = (): void => {  
        this.toggleToolMenu(false)
        this.scene.onKeyboardObservable.remove(
            this._keyboardObs
        )
    } 
}
