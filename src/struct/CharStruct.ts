import { Random } from "../Random";
import { DiceStruct } from "./DiceStruct";

export class CharStruct {
    readonly uuid: string;
    readonly type: CharType;

    private _dicePool: Array<DiceStruct>;
    public get dicePool() { return this._dicePool; }

    constructor(type: CharType) {
        this.uuid = Random.getInstance().uuid();
        this.type = type;

        this._dicePool = [
            new DiceStruct(this.type),
            new DiceStruct(this.type),
            // new DiceStruct(this.type),
        ];
    }
}

export enum CharType {
    ANY = "CT_ANY",
    RANDOM = "CT_RANDOM",
    TYPE_A = "CT_TYPE_A",
    TYPE_B = "CT_TYPE_B",
    TYPE_C = "CT_TYPE_C",
}