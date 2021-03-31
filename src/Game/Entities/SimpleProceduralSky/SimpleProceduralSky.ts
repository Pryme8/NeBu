import { Color3, DirectionalLight, Effect, Mesh, MeshBuilder, ShaderMaterial, Vector2, Vector3 } from "@babylonjs/core";
import { CustomMaterial } from "@babylonjs/materials";
import { Entity, IEntityParams } from "../../../GameManager/Entity";

interface ISimpleProceduralSkyParams extends IEntityParams{
    sunLight: DirectionalLight
    skyColor?: Color3
    horizonColor?: Color3
}

const defaultParams = {
    skyColor : new Color3(0.3, 0.2, 0.4),
    horizonColor : new Color3(0.2, 0.3, 0.5)
}

export class SimpleProceduralSky extends Entity{    
    private _skyMesh: Mesh = null
    private _skyShader: CustomMaterial = null

    private _sunLight: DirectionalLight = null
    private _reflectedLight: DirectionalLight = null
    private _skyColor: Color3 = null
    private _horizonColor: Color3 = null

    private _fragmentDefinitionChunk: string = null
    private _fragmentColorChunk: string = null
    
    constructor(_params, _manager){
        super({...defaultParams, ..._params}, _manager)        
        this._onInitilize()
    }

    _onInitilize(){
        this._sunLight = this.getProperty('sunLight')
        this._reflectedLight = this._sunLight.clone('reflectedLight', null) as DirectionalLight
        this._reflectedLight.direction.scaleInPlace(-1)
        this._reflectedLight.position.scaleInPlace(-1)
        this._reflectedLight.intensity = 0.1        
        this._skyColor = this.getProperty('skyColor')
        this._horizonColor = this.getProperty('horizonColor')
        this._reflectedLight.diffuse = this._horizonColor
        this._skyMesh = MeshBuilder.CreateSphere("skyMesh", {diameter: this.scene.activeCamera.maxZ, segments: 32, sideOrientation: Mesh.BACKSIDE}, this.scene)
        this._skyMesh.isPickable = false
        this._skyMesh.infiniteDistance = true
        this._skyMesh.renderingGroupId = 0
        this._buildShaderChunks()

        this._skyShader = new CustomMaterial('skyShader', this.scene)
        // , {
        //     vertex:'proceduralSky',
        //     fragment:'proceduralSky'           
        // },
        // {
        //     attributes: ["position"], 
        //     uniforms: [              
        //         "projection", 
        //         "view",
        //         "time",
        //         'sunPosition',
        //         'skyDirection',
        //         'horizonColor',
        //         'skyColor'     
        //     ],
        //     needAlphaBlending : false,
        //     needAlphaTesting : false   
        // })
        
        let time = 0.0
        this._skyShader.AddUniform('sunPosition', 'vec3', this._sunLight.position)
        this._skyShader.AddUniform('horizonColor', 'vec3', new Vector3(this._horizonColor.r, this._horizonColor.g, this._horizonColor.b))
        this._skyShader.AddUniform('skyColor', 'vec3', new Vector3(this._skyColor.r, this._skyColor.g, this._skyColor.b))

        this._skyShader.onBindObservable.add(()=>{
            const effect = this._skyShader.getEffect()
            effect.setVector3('sunPosition', this._sunLight.position)
            effect.setColor3('horizonColor', this._horizonColor)
            effect.setColor3('skyColor', this._skyColor)
        })

        this._skyShader.Fragment_Definitions(this._fragmentDefinitionChunk)

        this._skyShader.Fragment_Before_FragColor(this._fragmentColorChunk)
     
 
        // this._skyShader.onBindObservable.add(()=>{  
        //     time+=this.gameManager.delta
        //     this._skyShader.setFloat('time', time)         
        //     this._skyShader.setVector3('sunPosition', this._sunLight.position)
        //     this._skyShader.setColor3('horizonColor', this._horizonColor)
        //     this._skyShader.setColor3('skyColor', this._skyColor)
        // })

        this._skyMesh.material = this._skyShader
    }

    _buildShaderChunks(){ 
 
    this._fragmentDefinitionChunk = `
    //https://github.com/MaxBittker/glsl-voronoi-noise/blob/master/3d.glsl
    const mat2 myt = mat2(.12121212, .13131313, -.13131313, .12121212);
    const vec2 mys = vec2(1e4, 1e6);

    vec2 rhash(vec2 uv) {
        uv *= myt;
        uv *= mys;
        return fract(fract(uv / mys) * uv);
    }

    vec3 hash(vec3 p) {
    return fract(
        sin(vec3(dot(p, vec3(1.0, 57.0, 113.0)), dot(p, vec3(57.0, 113.0, 1.0)),
                dot(p, vec3(113.0, 1.0, 57.0)))) *
        43758.5453);
    }

    vec3 voronoi3d(const in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);

    float id = 0.0;
    vec2 res = vec2(100.0);
    for (int k = -1; k <= 1; k++) {
        for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec3 b = vec3(float(i), float(j), float(k));
            vec3 r = vec3(b) - f + hash(p + b);
            float d = dot(r, r);

            float cond = max(sign(res.x - d), 0.0);
            float nCond = 1.0 - cond;

            float cond2 = nCond * max(sign(res.y - d), 0.0);
            float nCond2 = 1.0 - cond2;

            id = (dot(p + b, vec3(1.0, 57.0, 113.0)) * cond) + (id * nCond);
            res = vec2(d, res.x) * cond + res * nCond;

            res.y = cond2 * d + nCond2 * res.y;
        }
        }
    }

    return vec3(sqrt(res), abs(id));
    }

    mat4 rotationMatrix(vec3 axis, float angle) {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        
        return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                    0.0,                                0.0,                                0.0,                                1.0);
    }

    vec3 rotate(vec3 v, vec3 axis, float angle) {
        mat4 m = rotationMatrix(axis, angle);
        return (m * vec4(v, 1.0)).xyz;
    }
    
    #define HORIFADE 0.0005
    #define SUN_RADIUS 0.2
    #define SUN_FADE 0.01
    #define PI 3.14159265359
    #define UP vec3(0., 1., 0.)
    `

    this._fragmentColorChunk = 
    `
    vec3 p = normalize(vNormalW)*-1.0;
    float hori = dot(p, UP);
    float horiColorFade = distance(p.y, 0.0);
    if(p.y >= 0.){
        hori = 0.;
    }else{
        horiColorFade = 0.0;
    }
    float horiClamp = smoothstep(0.5-HORIFADE, 0.5+HORIFADE, hori);

    float sunDistance = smoothstep(0.5-SUN_FADE, 0.5+SUN_FADE, distance(p, normalize(sunPosition))/SUN_RADIUS);        
    vec3 skyBG = mix(horizonColor, skyColor, horiColorFade);

    float starsDistance = pow(1.0-clamp(0., 1., voronoi3d(p*100.).x), 32.);
    skyBG += starsDistance;        

    vec3 skyColor = mix(vec3(0.99, 1.0, 0.95), skyBG, sunDistance);
    vec3 groundColor = vec3(0.2, 0.4, 0.2);

    color.rgb = mix(skyColor, groundColor, 0.0);
    `

    }
}