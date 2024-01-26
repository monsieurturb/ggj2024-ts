import { EventManager, Events } from "../Events";
import { Random } from "../Random";
import { CharType } from "./CharStruct";

export class QuestStruct {
    readonly uuid: string;
    readonly name: string;

    public isPrimed: boolean = false;

    protected _requirements: Array<QuestRequirement> = [];
    protected _turnsRemaining: number = 2;
    protected _lootOnFail: string = "";
    protected _lootOnSuccess: string = "";
    protected _boundOnEndTurn: (() => void) | undefined;

    public get requirements(): Array<QuestRequirement> { return this._requirements; }
    public get turnsRemaining(): number { return this._turnsRemaining; }
    public get lootOnFail(): string { return this._lootOnFail; }
    public get lootOnSuccess(): string { return this._lootOnSuccess; }

    constructor(name: string) {
        this.uuid = Random.getInstance().uuid();
        this.name = name;
        this.isPrimed = false;
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

    clone() {
        const q = new QuestStruct(this.name)
            // Copy loot
            .setLootOnFail(this.lootOnFail)
            .setLootOnSuccess(this.lootOnSuccess)
            // Copy turns
            .setTurnsRemaining(this.turnsRemaining);

        // Copy requirements
        for (let i = 0; i < this._requirements.length; i++)
            q.addRequirement(this._requirements[i].clone());

        return q;
    }

    activate() {
        // Setup dynamic requirements
        const randomTypeReqs = [];
        for (const req of this._requirements) {
            // Store all requirements that need a random CharType
            if (req.type === CharType.RANDOM)
                randomTypeReqs.push(req);

            // Pick a random value for requirements that apply
            if ((req.mode === QuestRequirementMode.EXACT || req.mode === QuestRequirementMode.EXCEPT) && req.value === -1)
                req.value = Random.getInstance().integerInRange(1, 6);
        }
        // Pick a different random CharType for each requirement
        if (randomTypeReqs.length > 0)
            this.pickRandomTypes(randomTypeReqs);

        // Listen to END_TURN event
        this._boundOnEndTurn = this.onEndTurn.bind(this)
        EventManager.on(Events.END_TURN, this._boundOnEndTurn);
    }

    onEndTurn() {
        if (this.isPrimed)
            this._turnsRemaining--;
        else
            this.isPrimed = true;

        if (this.turnsRemaining <= 0)
            EventManager.emit(Events.QUEST_FAILED, this.uuid);
    }

    pickRandomTypes(reqs: Array<QuestRequirement>) {
        let a: Array<CharType> = [];
        for (const req of reqs) {
            // If empty, fill the array with all the available types and shuffle it
            if (a.length <= 0) {
                a = [CharType.BARD, CharType.POET, CharType.MIMO];
                Random.getInstance().shuffle(a);
            }
            // @ts-ignore - Pick one type and assign to req
            req.type = a.pop();
        }
    }

    isOwnRequirement(uuid: string): boolean {
        for (const req of this._requirements) {
            if (req.uuid === uuid)
                return true;
        }
        return false;
    }

    isDone() {
        // Return false if one of the requirements is not done
        for (const req of this._requirements) {
            if (!req.done)
                return false;
        }
        // Else return true
        return true;
    }

    destroy() {
        EventManager.off(Events.END_TURN, this._boundOnEndTurn);
    }
}

export class QuestRequirement {
    readonly uuid: string;

    public mode: QuestRequirementMode;
    public type: CharType;
    public value: number;
    public done: boolean;

    constructor(type: CharType, mode: QuestRequirementMode, value: number) {
        this.uuid = Random.getInstance().uuid();
        this.type = type;
        this.mode = mode;
        this.value = value;
        this.done = false;
    }

    clone() {
        return new QuestRequirement(this.type, this.mode, this.value);
    }
}

export enum QuestRequirementMode {
    EVEN = "QRM_EVEN",// Dice current value must be even
    EXACT = "QRM_EXACT",// Dice current value must be exactly 'value'
    EXCEPT = "QRM_EXCEPT",// Dice current value must NOT be 'value'
    MIN = "QRM_MIN",// Dice current value must be greater or equal than 'value'
    MAX = "QRM_MAX",// Dice current value must be lower or equal than 'value'
    ODD = "QRM_ODD",// Dice current value must be odd
    SAME = "QRM_SAME",// Must have the same value as the other reqs of its quest
    SCORE = "QRM_SCORE",// Must reach 'value' with any number of dice
}