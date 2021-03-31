import { Entity, IEntityParams } from "../../../GameManager/Entity";
import { BoxMesh } from "../../Components";

interface ITestCubeParams extends IEntityParams{}
export class TestCube extends Entity{  
    constructor(_params, _manager){
        super(_params, _manager)
        this.AddComponent(BoxMesh, {size:this.getProperty('size') ?? 1, position:this.getProperty('position') ?? null})
    }
}