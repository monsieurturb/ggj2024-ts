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
/*

// TODO Deck of cards for quests: colored back for colored quests, colorless for non-colored quests, special color for hidden quests

Perfect Delivery
Req: EXACT 6
Success: Next quest +1 turn
Turns: 2

Reading The Crowd
Req: ANY MIN 4 | ANY MIN 5
Fail: Discard next quests and pick new ones (color hidden)
Turns: 2

Irresistible Duo
Req: COLORED MIN 3 | COLORED MIN 3
Success: Main Quest Boost x2 for 4 dice
Turns: 1

[ADJECTIVE] Monologue
Req: COLORED SCORE 12
Success: Both other chars get +1 dice next turn
Turns: 3

Drawing a Blank
Req: COLORED EXACT 1
Fail: This char's dice are hidden next turn
Turns: 1



Great Punchline
Req: ANY MIN 5
Success: Next quest is easier
Turns: 1

    One-Liner
    Req: ANY EXACT 1
    Success/Fail:
    Turns: 2

    Tight Five
    Req: COLORED EXACT 5
    Success/Fail: 
    Turns: 

    Working Out
    Req: ANY SCORE 21
    Success/Fail:
    Turns: 3

    Musical Interlude
    Req: BARD MAX 3 | POET MAX 3
    Success/Fail:
    Turns: 2

    Burlesque Bit
    Req: BARD MAX 2 | MIMO MIN 5
    Success/Fail:
    Turns: 2

    Style Clash
    Req: POET EVEN | MIMO ODD
    Success/Fail:
    Turns: 2

Comic Opera
Req: BARD SCORE 9
Success: Next quest +1 turn
Turns: 1

Double Entendre
Req: POET EXACT 1 | POET EXACT 6
Success: This char get +2 dice next turn
Turns: 3

    Slapstick Master
    Req: MIMO EXCEPT 4
    Success/Fail:
    Turns:

Elaborate Joke
Req: FIRST EXACT 1 | SECOND EXACT 2 | THIRD EXACT 3
Success: Main Quest Boost x3 for 6 dice
Turns: 3

*/