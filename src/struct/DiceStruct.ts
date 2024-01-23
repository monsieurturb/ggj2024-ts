import { Random } from "../Random";
import { CharType } from "./CharStruct";

export class DiceStruct {
    readonly uuid: string;
    readonly type: CharType;
    readonly sides: Array<number>;

    private _currentSide: number = 0;
    public get currentValue(): number { return this.sides[this._currentSide]; }
    public get displayValue(): string { return this.sides[this._currentSide].toFixed(); }

    constructor(type: CharType) {
        this.uuid = Random.getInstance().uuid();
        this.type = type;
        this.sides = [1, 2, 3, 4, 5, 6];
    }

    throw() {
        this._currentSide = Random.getInstance().integerInRange(0, this.sides.length - 1);
        return this;
    }
}