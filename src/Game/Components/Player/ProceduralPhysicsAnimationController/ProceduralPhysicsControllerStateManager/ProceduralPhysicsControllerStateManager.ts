import { Component, Entity, GameManager, IComponentParams } from "../../../../../GameManager"
import { ProceduralControllerStateController } from "./ProceduralControllerStateController"

export interface IProceduralPhysicsControllerStateManagerParams extends IComponentParams{}

export class ProceduralPhysicsControllerStateManager extends Component{

    public get name(){
        return 'ProceduralPhysicsControllerStateManager'
    }

    private _stateController: ProceduralControllerStateController = null

    public getCurrentStateName(){
        return this._stateController.getCurrentStateName()
    }
    public setState(name:string){
        return this._stateController.setState(name)
    }

    constructor(_params:IProceduralPhysicsControllerStateManagerParams, _entity: Entity){
        super(_params, _entity)
        this._onInitialize()
    }

    private _onInitialize(){        
        this._stateController = new ProceduralControllerStateController({}, this.gameManager)
        this.setState('idle')
        this.registerEvent('setState', (event)=>{
            this.setState(event.state)
        })
    }

    update = (delta:number): void =>{
        this._stateController.update(delta)
    }
}