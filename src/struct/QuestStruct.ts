import { Random } from "../Random";
import { CharType } from "./CharStruct";

export class QuestStruct {
    readonly uuid: string;
    readonly name: string;

    private _requirements: Array<QuestRequirement> = [];
    private _turnsLeft: number = 2;
    private _lootOnFail: string = "";
    private _lootOnSuccess: string = "";

    public get lootOnFail(): string { return this._lootOnFail; }
    public get lootOnSuccess(): string { return this._lootOnSuccess; }

    constructor(name: string) {
        this.uuid = Random.getInstance().uuid();
        this.name = name;
    }

    addRequirement(req: QuestRequirement) {
        this._requirements.push(req);
        return this;
    }

    setTurnsRemaining(turns: number) {
        this._turnsLeft = turns;
        return this;
    }

    setLootOnFail(loot: string) {
        this._lootOnFail = loot;
        return this;
    }

    setLootOnSuccess(loot: string) {
        this._lootOnSuccess = loot;
        return this;
    }
}

interface QuestRequirement {
    type: CharType,
    mode: QuestRequirementMode
    value: number
}

export enum QuestRequirementMode {
    SCORE,// Must reach 'value' with any number of dice
    MIN,// Dice current value must be greater or equal than 'value'
    MAX,// Dice current value must be lower or equal than 'value'
    EXACT,// Dice current value must be exactly 'value'
    EVEN,// Dice current value must be even
    ODD,// Dice current value must be odd
}