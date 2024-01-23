import { Random } from "../Random";

export class QuestStruct {
    readonly uuid: string;
    readonly name: string;
    // readonly lootOnFail: QuestLoot | false;
    // readonly lootOnSuccess: QuestLoot | false;

    constructor(name: string) {
        this.uuid = Random.getInstance().uuid();
        this.name = name;
        // this.lootOnSuccess = QuestLoot.REWARD;
        // this.lootOnFail = QuestLoot.PENALTY;
    }
}

/* export enum QuestLoot {
    PENALTY,
    REWARD,
    SKILL,
} */