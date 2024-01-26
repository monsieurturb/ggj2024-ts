import { Random } from "../Random";
import { CharType } from "./CharStruct";
import { LootBook } from "./LootBook";
import { QuestRequirement, QuestRequirementMode, QuestStruct } from "./QuestStruct";

export class QuestBook {
    private static instance: QuestBook;

    private _quests: Array<QuestStruct>;

    constructor() {
        this._quests = [];

        this._quests.push(new QuestStruct("Test Random Exact")
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.EXACT, -1))
            .setTurnsRemaining(2)
        );
        this._quests.push(new QuestStruct("Test ANY Pair")
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.SAME, -1))
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.SAME, -1))
            .setTurnsRemaining(2)
        );
        /* this._quests.push(new QuestStruct("Perfect Delivery")
            .addRequirement(new QuestRequirement(CharType.ANY, QuestRequirementMode.EXACT, 6))
            .setLootOnSuccess(LootBook.getInstance().pickOneReward())
            .setTurnsRemaining(2)
        ); */
        /* this._quests.push(new QuestStruct("Irresistible Duo")
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.MIN, 3))
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.MIN, 3))
            .setLootOnSuccess(LootBook.getInstance().pickOneSkill())
            .setTurnsRemaining(3)
        ); */
        /* this._quests.push(new QuestStruct("Monologue")
            .addRequirement(new QuestRequirement(CharType.RANDOM, QuestRequirementMode.SCORE, 9))
            .setLootOnFail(LootBook.getInstance().pickOnePenalty())
            .setTurnsRemaining(2)
        ); */
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
    P: 0.67

    Tight Five
    Req: COLORED EXACT 5
    Success/Fail: 
    Turns: 
    P: 0.30

    Working Out
    Req: ANY SCORE 21
    Success/Fail:
    Turns: 3
    P: 0.55

    Musical Interlude
    Req: BARD MAX 3 | POET MAX 3
    Success/Fail:
    Turns: 2
    P: 0.56

    Burlesque Bit
    Req: BARD MAX 2 | MIMO MIN 5
    Success/Fail:
    Turns: 2
    P: 0.31

    Style Clash
    Req: POET EVEN | MIMO ODD
    Success/Fail:
    Turns: 2
    P: 0.56

Comic Opera
Req: BARD SCORE 9
Success: Next quest +1 turn
Turns: 1
P: 0.28

Double Entendre
Req: POET EXACT 1 | POET EXACT 6
Success: This char get +2 dice next turn
Turns: 3
P: 0.06

    Slapstick Master
    Req: MIMO EXCEPT 4
    Success/Fail:
    Turns:
    P: 0.69

Elaborate Joke
Req: FIRST EXACT 1 | SECOND EXACT 2 | THIRD EXACT 3
Success: Main Quest Boost x3 for 6 dice
Turns: 3
P: 0.027




PROBABILITIES :

For two independant events: P(A u B) = P(A) + P(B) - (P(A) * P(B))

Get any exact value with 1 dice:        0.17
Get one 5+ with 1 dice:                 0.33
Get one 4+ with 1 dice:                 0.50
Get one 3+ with 1 dice:                 0.67
Get one 2+ with 1 dice:                 0.83

Get any exact value with 2 dice:        0.30
Get one 5+ with 2 dice:                 0.56
Get one 4+ with 2 dice:                 0.75 (1/2 + 1/2 - (1/2 * 1/2))
Get one 3+ with 2 dice:                 0.89
Get one 2+ with 2 dice:                 0.97

Get any exact value with 3 dice:        0.42
Get one 5+ with 3 dice:                 0.70
Get one 4+ with 3 dice:                 0.88
Get one 3+ with 3 dice:                 0.96
Get one 2+ with 3 dice:                 0.99

Get any exact value with 4 dice:        0.52
Get one 5+ with 4 dice:                 0.80
Get one 4+ with 4 dice:                 0.94
Get one 3+ with 4 dice:                 0.99
Get one 2+ with 4 dice:                 0.99

Get any exact value with 5 dice:        0.60
Get one 5+ with 5 dice:                 0.87
Get one 4+ with 5 dice:                 0.97
Get one 3+ with 5 dice:                 0.99
Get one 2+ with 5 dice:                 0.99

Get any exact value with 6 dice:        0.67
Get one 5+ with 6 dice:                 0.91
Get one 4+ with 6 dice:                 0.98
Get one 3+ with 6 dice:                 0.99
Get one 2+ with 6 dice:                 0.99

Get any pair with 2 dice:               0.17
Get any pair with 3 dice:               0.44
Get any pair with 4 dice:               0.72
Get any pair with 5 dice:               0.91
Get any pair with 6 dice:               0.98

Get a specific pair with 2 dice:        0.03
Get a specific pair with 3 dice:        0.07
Get a specific pair with 4 dice:        0.12
Get a specific pair with 5 dice:        0.16
Get a specific pair with 6 dice:        0.20

Roll 1, 2, 3 with 6 dice:               0.24







*/