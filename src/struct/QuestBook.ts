import { Random } from "../Random";
import { CharType } from "./CharStruct";
import { LootBook } from "./LootBook";
import { QuestRequirement, QuestRequirementMode, QuestStruct } from "./QuestStruct";

export class QuestBook {
    private static instance: QuestBook;

    private _quests: Array<QuestStruct>;

    constructor() {
        this._quests = [];

        this._quests.push(new QuestStruct("Perfect Delivery")
            .addRequirement(new QuestRequirement(CharType.ANY, QuestRequirementMode.EXACT, 6))
            .setLootOnSuccess(LootBook.getInstance().pickOneReward())
            .setTurnsRemaining(2)
        );
        this._quests.push(new QuestStruct("Irresistible Duo")
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.MIN, 3))
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.MIN, 3))
            .setLootOnSuccess(LootBook.getInstance().pickOneSkill())
            .setTurnsRemaining(3)
        );
        this._quests.push(new QuestStruct("Monologue")
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.SCORE, 9))
            .setLootOnFail(LootBook.getInstance().pickOnePenalty())
            .setTurnsRemaining(2)
        );
    }

    public static getInstance(): QuestBook {
        if (!QuestBook.instance)
            QuestBook.instance = new QuestBook();

        return QuestBook.instance;
    }

    public pickOne(): QuestStruct {
        return Random.getInstance().pick(this._quests).clone();
    }
}