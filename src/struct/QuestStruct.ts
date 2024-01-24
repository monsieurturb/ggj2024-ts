import { EventManager, Events } from "../Events";
import { Random } from "../Random";
import { CharType } from "./CharStruct";

export class QuestStruct {
    readonly uuid: string;
    readonly name: string;

    private _requirements: Array<QuestRequirement> = [];
    private _turnsRemaining: number = 2;
    private _lootOnFail: string = "";
    private _lootOnSuccess: string = "";

    public get turnsRemaining(): number { return this._turnsRemaining; }
    public get lootOnFail(): string { return this._lootOnFail; }
    public get lootOnSuccess(): string { return this._lootOnSuccess; }

    constructor(name: string) {
        this.uuid = Random.getInstance().uuid();
        this.name = name;
    }

    clone() {
        const q = new QuestStruct(this.name)
            // Copy loot
            .setLootOnFail(this.lootOnFail)
            .setLootOnSuccess(this.lootOnSuccess)
            // Copy turns
            .setTurnsRemaining(this.turnsRemaining);
        // Copy requirements
        for (let i = 0; i < this._requirements.length; i++)
            q.addRequirement(this._requirements[i]);

        return q;
    }

    activate() {
        EventManager.on(Events.END_TURN, () => {
            this._turnsRemaining--;
        })
    }

    addRequirement(req: QuestRequirement) {
        this._requirements.push(req);
        return this;
    }

    setTurnsRemaining(turns: number) {
        this._turnsRemaining = turns;
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