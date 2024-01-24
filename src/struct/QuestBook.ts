import { Random } from "../Random";
import { CharType } from "./CharStruct";
import { LootBook } from "./LootBook";
import { QuestRequirementMode, QuestStruct } from "./QuestStruct";

export class QuestBook {
    private static instance: QuestBook;

    private _quests: Array<QuestStruct>;

    constructor() {
        this._quests = [];

        this._quests.push(new QuestStruct("Perfect Delivery")
            .addRequirement({ type: CharType.ANY, mode: QuestRequirementMode.EXACT, value: 6 })
            .setLootOnSuccess(LootBook.getInstance().pickOneReward())
            .setTurnsRemaining(2)
        );
        this._quests.push(new QuestStruct("Irresistible Duo")
            .addRequirement({ type: CharType.TYPE_A, mode: QuestRequirementMode.MIN, value: 3 })
            .addRequirement({ type: CharType.TYPE_B, mode: QuestRequirementMode.MIN, value: 3 })
            .setLootOnSuccess(LootBook.getInstance().pickOneSkill())
            .setTurnsRemaining(3)
        );
        this._quests.push(new QuestStruct("Monologue")
            .addRequirement({ type: CharType.TYPE_C, mode: QuestRequirementMode.SCORE, value: 10 })
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
        const q = Random.getInstance().pick(this._quests).clone();
        // console.log("picking a random quest: " + q.name + ", " + q.turnsRemaining + ", " + q.uuid);
        return q;
    }
}