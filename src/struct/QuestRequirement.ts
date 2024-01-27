import { Random } from "../managers/Random";
import { CharType } from "./CharStruct";

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