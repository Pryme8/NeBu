import { Observer, Scalar, Scene } from "@babylonjs/core";

export interface ILerpablesParams{    
    value: any,
    target: any,
    speed: number //Rate
    duration?: number //Seconds of Animation
    epsilon?: number //If no duration when to round the results
    onStart?: Function //Callback to run on Start
    onStep?: Function //Callback to run per Step
    onStop?: Function //Callback to run if operation stopped
    onDone?: Function //Callback to run if operation completed
    easingFunction?: Function //Easing function (v)=>{return v}
}

export interface ILerpableObs extends Observer<Scene>{
    stop: () => void
}

export class Lerpables{    
    static LerpFloat(params: ILerpablesParams, scene:Scene):ILerpableObs{
        
        if(!params.duration){
            if (params.epsilon == null) {
                params.epsilon = 0.001
            }
        }else{
            params.duration *= 1000
        }    

        let obs: Observer<Scene> = null;
        let startedOn = null

        const cleanUp = ()=>{
            scene.onBeforeRenderObservable.remove(obs)
            obs = null;
            if(params.onDone && !forceStop){
                params.onDone()
            }else if(params.onStop && forceStop){
                params.onStop()
            }
        }
        
        let a = params.value+0
        let b = params.target+0
        let d = 0
        let dur = null
        let forceStop = false  
        let engine = scene.getEngine()
    
        obs = scene.onBeforeRenderObservable.add(()=>{

            if(!startedOn){
                startedOn = Date.now();
                if(params.duration){
                    dur = (params.duration * params.speed)
                }
                if(params.onStart){
                    params.onStart()
                }                
            }

            if(forceStop){
                cleanUp()
            }                
            
            let dt = engine.getDeltaTime()*0.001

            if(dur !== null){        
                d = Math.min((Date.now()-startedOn)/dur, 1)

                if(params.easingFunction !== undefined){
                    d = params.easingFunction(d)
                }
                
                params.value = Scalar.Lerp(a, b, d)
                
                if(params.onStep){
                    params.onStep(params.value);
                }

                if(d === 1){
                    params.value = b
                    cleanUp()
                }
            }else{
                d += params.speed * dt;

                if(params.easingFunction !== undefined){
                    d = params.easingFunction(d)
                }
                
                d = Math.min(d, 1.0)

                params.value = Scalar.Lerp(
                    a, b, d
                )

                if(params.onStep){
                    params.onStep(params.value)
                }

                if(params.target - params.value <= params.epsilon ){
                    params.value = b
                    cleanUp()
                }
            }               
        });
        (obs as any).stop = ()=>{
            forceStop = true;
        }
        return obs as ILerpableObs;
     
    }
 
}