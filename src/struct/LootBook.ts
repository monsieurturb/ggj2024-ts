import { Random } from "../Random";

export class LootBook {
    private static instance: LootBook;

    private _penalties: Array<string>;
    private _rewards: Array<string>;
    private _skills: Array<string>;

    constructor() {
        // Penalties
        this._penalties = [];

        this._penalties.push("Next turn - One random dice will become a 1");
        this._penalties.push("Next quest - 1 less turn to complete");

        // Rewards
        this._rewards = [];

        this._rewards.push("Next 3 dice placed in main quest will be doubled");
        this._rewards.push("Next quest - 2 more turns to complete");

        // Permanent skills
        this._skills = [];

        this._skills.push("Character gets one more dice");
        this._skills.push("Character dice count double when placed in main quest");
    }

    public static getInstance(): LootBook {
        if (!LootBook.instance)
            LootBook.instance = new LootBook();

        return LootBook.instance;
    }

    public pickOnePenalty(): string {
        return Random.getInstance().pick(this._penalties);
    }

    public pickOneReward(): string {
        return Random.getInstance().pick(this._rewards);
    }

    public pickOneSkill(): string {
        return Random.getInstance().pick(this._skills);
    }
}