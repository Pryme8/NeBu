export class State {

    get parent(){
        return this._parent
    }

    constructor(private _parent){}

    enter(prevState){}
    exit(){}
    update(delta:number){}

    static onAdd: ()=>void | null = null
}