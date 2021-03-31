import { SnappingModelStates } from "../SnappingModelStates"

export class LoadingState extends SnappingModelStates{ 
    get name(){
        return 'loading'
    }
    constructor(parent){
        super(parent)
    }
    enter = (prevState): void => {  
        console.log('loading')
        this.snapSystem.loadAllModels()
    }  
}
