import { State } from "../../../../../StateController/State"
export class SnappingModelStates extends State{
    get name(){
        return ''
    }

    get scene(){
        return this.parent.manager.scene
    }

    get snapSystem(){
        return this.parent.snapSystem
    }

    constructor(parent){
        super(parent)
    } 
}
