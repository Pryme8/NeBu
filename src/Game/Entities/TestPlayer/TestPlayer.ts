import { AnimationGroup, AssetContainer } from "@babylonjs/core";
import { Entity, IEntityParams } from "../../../GameManager/Entity";
import { InputMapping, LoadModelToContainer, ProceduralPhysicsAnimationController } from "../../Components";


interface ITestPlayerParams extends IEntityParams{}
export class TestPlayer extends Entity{  
    constructor(_params, _manager){
        super(_params, _manager)
        this._onInitialize()
    }
    _onInitialize(){

        this.gameManager.addInput('KeyW')
        this.gameManager.addInput('KeyS')
        this.gameManager.addInput('KeyA')
        this.gameManager.addInput('KeyD')
        this.gameManager.addInput('KeyC')
        this.gameManager.addInput('ShiftLeft')
        this.gameManager.addInput('Space')

        let inputs = this.gameManager.AddEntity(Entity, {name:'PlayerInputs'})
        inputs = inputs.AddComponent(InputMapping, {
            name:'inputs',
            input: this.gameManager.inputMap,
            map: new Map<string, string>(
                [
                    ['KeyW', 'forward'],
                    ['KeyS', 'back'],
                    ['KeyA', 'left'],
                    ['KeyD', 'right'],
                    ['KeyC', 'crouch'],
                    ['ShiftLeft', 'run'],
                    ['Space', 'jump']
                ]
            )        
        })
     
        const player = this.gameManager.AddEntity(Entity, {name:'Player'})
        const meshURL = './assets/meshes/ybot/ybot-withAnimations.glb'
        
        player.AddComponent(LoadModelToContainer, {url:meshURL, onDone:(container:AssetContainer)=>{            
            container.addAllToScene()
            console.log(container)
            const root = container.meshes[0];

            root.getChildMeshes().forEach((mesh)=>{
                mesh.receiveShadows = true
                console.log(this.gameManager.shadowManager)
                this.gameManager.shadows.addShadowCaster(mesh, false)
            })            

            const animationGroups = container.animationGroups
            const animationMap = {}

            animationGroups.forEach((ag:AnimationGroup)=>{                      
                ag.start(true)
                ag.setWeightForAllAnimatables(0)
                if(ag.name == 'walk'){
                    ag.loopAnimation = true                           
                }else if(ag.name == 'idle'){
                    ag.setWeightForAllAnimatables(1) 
                }else if(ag.name == 'walkLeft'){ 
                    ag.loopAnimation = true 
                // }else if(ag.name == 'walkRight'){
                // }else if(ag.name == 'walkBack'){  
                }
                animationMap[ag.name] = ag                    
            })

            const skeleton = container.skeletons[0] 

            const physicsAnimationController = player.AddComponent(ProceduralPhysicsAnimationController, {
                target:root,
                inputMap: inputs.inputMap,
                mouseData: this.gameManager.mouse,
                skeleton: skeleton,
                animationOptions : {
                    idle:{
                        basic: animationMap['idle'] ?? null                         
                    },
                    crouchPose:{
                        basic: animationMap['crouchPose'] ?? null                         
                    },
                    jump:{
                        basic: animationMap['jump'] ?? null                         
                    },
                    // falling:{
                    //     basic: animationMap['falling'] ?? null                         
                    // },
                    forward:{
                        walk: animationMap['walk'] ?? null,
                        run: animationMap['run'] ?? null
                    },
                    back:{
                        walk: animationMap['walkBack'] ?? null,
                        run: animationMap['runBack'] ?? null
                    },
                    left:{
                        walk: animationMap['walkLeft'] ?? null,
                        run: animationMap['runLeft'] ?? null                           
                    },
                    leftTurn:{
                        basic: animationMap['leftTurn'] ?? null                       
                    },
                    right:{
                        walk: animationMap['walkRight'] ?? null,
                        run: animationMap['runRight'] ?? null                           
                    },
                    rightTurn:{
                        basic: animationMap['rightTurn'] ?? null                       
                    }
                }
            })
        }})     

        this.gameManager.startPointerLock()
    }
}