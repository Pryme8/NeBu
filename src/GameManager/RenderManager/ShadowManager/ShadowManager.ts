import { CascadedShadowGenerator, DirectionalLight, ShadowGenerator } from "@babylonjs/core";
import { RenderManager } from "../RenderManager";

export class ShadowManager{
    private _light : DirectionalLight = null
    private _shadows : CascadedShadowGenerator = null
    get shadows(){
        return this._shadows
    }

    constructor(private _manager:RenderManager){ }

    CreateCascadeShadowGenerator(light: DirectionalLight, params){
        this._light = light                       
        this._shadows = new CascadedShadowGenerator(params.resolution ?? 1024, light)
        this.shadows.bias = 0.005
        this.shadows.lambda = 1
        this.shadows.useKernelBlur = true
        this.shadows.penumbraDarkness = 0.7
        this.shadows.darkness = 0.1
        this.shadows.forceBackFacesOnly = true
        this.shadows.filteringQuality = ShadowGenerator.QUALITY_HIGH
        //this.shadows.setMinMaxDistance(0, 0.001)
        this.shadows.autoCalcDepthBounds = true
        this.shadows.autoCalcDepthBoundsRefreshRate  = 1
        globalThis.shadows = this.shadows
        return this._shadows
    }
}
