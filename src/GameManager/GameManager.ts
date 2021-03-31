import { Game } from "../Game/Game"
import { ControlManager } from "./ControlManager"
import { EntityManager } from "./EntityManager"
import { RenderManager } from "./RenderManager"
import { IImposterParams, PhysicsManager } from "./PhysicsManager"
import { PhysicsImpostor, Vector3 } from "@babylonjs/core"

export interface IGameManagerParams{
    canvas: HTMLCanvasElement
}

export class GameManager{    

    private _renderManager: RenderManager = null
    private _entityManager: EntityManager = null
    private _controlManager: ControlManager = null
    private _physicsManager: PhysicsManager = null

    private _game: Game = null

    constructor(private _params: IGameManagerParams){
        this._renderManager = new RenderManager(this)
        this._entityManager = new EntityManager(this)
        this._controlManager= new ControlManager(this)
        //Wait for Physics Engine to load
        this._physicsManager = new PhysicsManager(this, ()=>{
            this._game = new Game(this)
        })  
        globalThis.scene = this.scene      
    }

    /*  Render Manager Functions
     *
     */
    get canvas(){
        return this._params.canvas
    }
    get scene(){
        return this._renderManager.scene
    }
    get engine(){
        return this._renderManager.engine
    }
    get delta(){
        return this._renderManager.delta
    }
    private _isLocked = false
    startPointerLock(){
        if(!this._isLocked){
            this._isLocked = true
            this.engine.enterPointerlock() 
            document.addEventListener('click', ()=>{this._keepLock()}, false)    
            this.canvas.click()        
        }       
    }
    endPointerLock(){
        if(this._isLocked){
            this._isLocked = false
            this.engine.exitPointerlock() 
            document.removeEventListener('click', ()=>{this._keepLock()}, false)
        }     
    }
    _keepLock(){
        if(!this.engine.isPointerLock){
            this.engine.enterPointerlock()
        }
    }

    get shadowManager(){
        return this._renderManager.shadowManager
    }
    get shadows(){
        return this.shadowManager.shadows
    }   

    /*  Entity Manager Functions
     *
     */
    public AddEntity(entityType, params){
        return this._entityManager.AddEntity(entityType, params)
    }
    public getEntityById(id:string){
        return this._entityManager.getEntityById(id)
    }

    /*  Control Manager Functions
    *
    */
    get inputMap(){
        return this._controlManager.inputMap
    }
    get mouse(){
        return this._controlManager.mouse
    }
    public addInput(code:string){
        return this._controlManager.addInput(code)
    }
    public removeInput(code:string){
        return this._controlManager.removeInput(code)
    }

    /*  Physics Manager Functions
    *
    */
    public setGlobalGravity(gravity:Vector3){
        return this._physicsManager.setGlobalGravity(gravity)
    }

    public AddImposter(params: IImposterParams): PhysicsImpostor{
        return this._physicsManager.AddImposter(params)
    }
}