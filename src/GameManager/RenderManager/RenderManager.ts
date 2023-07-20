import { Engine, FreeCamera, Scene, Vector3, DebugLayer, DebugLayerTab } from "@babylonjs/core"
import { GameManager } from "../GameManager"
import { ShadowManager } from "./ShadowManager/ShadowManager"

import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent

export class RenderManager{
    
    get canvas(){
        return this._gameManager.canvas
    }

    private _engine: Engine = null
    public get engine(): Engine{
        return this._engine
    }

    private _scene: Scene = null
    public get scene(): Scene{
        return this._scene
    }

    private _enabled: boolean = true
    public get isEnabled(){
        return this._enabled
    }

    private _delta: number = 0
    public get delta(){
        return this._delta
    }

    private _shadowManager:ShadowManager = null
    public get shadowManager(): ShadowManager{
        return this._shadowManager
    }

    constructor(private _gameManager:GameManager){
        const canvas = this.canvas
        const engine = new Engine(canvas, false)
        const scene = new Scene(engine)

        this._shadowManager = new ShadowManager(this)

        const camera = new FreeCamera(
          "defaultCamera",
          new Vector3(0, 0, -10),
          scene
        )
        camera.minZ = 0.05
        camera.maxZ = 100

        camera.setTarget(Vector3.Zero())

        engine.runRenderLoop(()=>{
            this._renderLoop()
        })

        window.addEventListener("resize", () => {
            engine.resize()
        });

        engine.setHardwareScalingLevel(1)

        this._engine = engine  
        this._scene = scene
        // scene.debugLayer.show()
    }

    _renderLoop(){
        if(this.isEnabled){
            const delta = this.engine.getDeltaTime()
            this._delta = delta*0.001
            this.scene.render()
        }        
    }
}