import { Component, Entity, IComponentParams } from "../../../GameManager"
import { AdvancedDynamicTexture } from '@babylonjs/gui'

interface IUserInterfaceParams extends IComponentParams{
    foreground?: boolean
    onInitialize?: (adt: AdvancedDynamicTexture) => void
}

export class UserInterface extends Component{

    public get name(){
        return 'UserInterface'
    }

    private _adt: AdvancedDynamicTexture = null
    get adt(){
        return this._adt
    }

    constructor(_params:IUserInterfaceParams, _entity: Entity){
        super(_params, _entity)
        this._onInitialize()
    }

    private _onInitialize(){  
        this._adt = AdvancedDynamicTexture.CreateFullscreenUI('ui', this.getProperty('foreground') ?? true)
        const oi = this.getProperty('onInitialize')
        if(oi){
            oi(this._adt)
        }
    }
    
    // update = (delta:number): void =>{
    // }
}