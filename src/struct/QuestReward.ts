import { Random } from "../Random";

export class QuestReward {
    readonly uuid: string;
    readonly target: QuestRewardTarget;
    readonly type: QuestRewardType;

    private _args: Array<number> = [];
    public get args(): Array<number> { return this._args; }

    constructor(target: QuestRewardTarget, type: QuestRewardType, args: Array<number>) {
        this.uuid = Random.getInstance().uuid();
        this.target = target;
        this.type = type;
        this._args = args;
    }

    clone() {
        return new QuestReward(this.target, this.type, this.args);
    }
}

export enum QuestRewardTarget {
    // Character targets
    ONE_RANDOM_CHAR = "ONE_RANDOM_CHAR",
    ONE_RANDOM_QUEST_CHAR = "ONE_RANDOM_QUEST_CHAR",
    ALL_QUEST_CHARS = "ALL_QUEST_CHARS",
    ONE_RANDOM_NON_QUEST_CHAR = "ONE_RANDOM_NON_QUEST_CHAR",
    ALL_NON_QUEST_CHARS = "ALL_NON_QUEST_CHARS",
    ALL_CHARS = "ALL_CHARS",
    // Quest targets
    MAIN_QUEST = "MAIN_QUEST",
    NEXT_X_QUESTS = "NEXT_X_QUESTS",// args: [X: number of quests to target]
}

export enum QuestRewardType {
    // Character targets
    EXTRA_X_DICE = "EXTRA_X_DICE",// args: [X: number of extra dice to add]
    FREEZE_X_DICE = "FREEZE_X_DICE",// args: [X: number of dice to freeze]
    // Quest targets
    X_MORE_TURNS_TO_COMPLETE = "X_MORE_TURNS_TO_COMPLETE",// args: [X: number of turns to add]
    X_LESS_TURNS_TO_COMPLETE = "X_LESS_TURNS_TO_COMPLETE",// args: [X: number of turns to substract]
    DISCARD = "DISCARD",
    HIDE = "HIDE",
    // Main quest targets
    X_MULT_FOR_Y_TURNS = "X_MULT_FOR_Y_TURNS",// args: [X: dice value multiplier, Y: number of turns to last]
    UNLOCK_NEXT_STAGE = "UNLOCK_NEXT_STAGE",
}