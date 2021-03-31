import { Component, IComponentParams } from "../../../GameManager/Component";
import { Entity } from "../../../GameManager/Entity";

export interface IInputMappingParams extends IComponentParams{
    input : any
    map : Map<string, string>
}

export class InputMapping extends Component{
    public get name(){
        return 'InputMapping'
    }

    private _inputMap:any = {}

    public get inputMap(){
        return this._inputMap
    }

    constructor(_params:IInputMappingParams, _entity: Entity){
        super(_params, _entity)
        this.onInitialize()
        console.log(this.inputMap)
    }
    onInitialize(){
        Object.keys(this.getProperty('input')).forEach((key)=>{
            this.inputMap[this.getProperty('map').get(key)] = false
        })
    }
    update = (_): void => {
        Object.keys(this.getProperty('input')).forEach((key)=>{
            this.inputMap[this.getProperty('map').get(key)] = this.getProperty('input')[key]
        })
    }
}