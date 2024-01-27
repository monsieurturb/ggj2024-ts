import { Char } from "../entities/Char";
import { Game } from "../scenes/Game";
import { CharType } from "../struct/CharStruct";
import { QuestReward, QuestRewardTarget, QuestRewardType } from "../struct/QuestReward";
import { QuestStruct } from "../struct/QuestStruct";
import { EventManager, Events } from "./Events";
import { Random } from "./Random";

export class Rewards {
    private static instance: Rewards;

    private _game: Game | undefined;
    private _queue: Array<RewardObject> = [];

    public static getInstance(): Rewards {
        if (!Rewards.instance)
            Rewards.instance = new Rewards();

        return Rewards.instance;
    }

    constructor() { }

    setup(game: Game) {
        this._game = game;
        this._queue = [];

        // Listen to "end turn" event
        EventManager.on(Events.END_TURN, this.onEndTurn.bind(this));
    }

    onEndTurn() {
        for (const rewardObject of this._queue)
            rewardObject.turnsRemaining--;

        const expiredRewards = this._queue.filter((ro) => ro.turnsRemaining < 0);
        this._queue = this._queue.filter((ro) => ro.turnsRemaining >= 0);

        for (const rewardObject of expiredRewards) {
            if (rewardObject.endCallback)
                rewardObject.endCallback();
        }
    }

    queue(rewards: Array<QuestReward>, quest: QuestStruct) {
        for (const reward of rewards) {
            console.log('NEW REWARD:', reward.target, reward.type, reward.args);

            const rewardObject: RewardObject = {
                reward: reward,
                quest: quest,
                turnsRemaining: 1
            };
            this._queue.push(rewardObject);

            switch (reward.target) {
                case QuestRewardTarget.ONE_RANDOM_CHAR:
                case QuestRewardTarget.ONE_RANDOM_QUEST_CHAR:
                case QuestRewardTarget.ALL_QUEST_CHARS:
                case QuestRewardTarget.ONE_RANDOM_NON_QUEST_CHAR:
                case QuestRewardTarget.ALL_NON_QUEST_CHARS:
                case QuestRewardTarget.ALL_CHARS:
                    this.applyCharReward(rewardObject);
                    break;

                case QuestRewardTarget.MAIN_QUEST:
                    this.applyMainQuestReward(rewardObject);
                    break

                case QuestRewardTarget.NEXT_X_QUESTS:
                    this.applyQuestsReward(rewardObject);
                    break
            }
        }
    }

    private applyCharReward(rewardObject: RewardObject) {
        const allChars = this._game?.chars;
        if (!allChars)
            return;

        // FIND TARGETS DEPENDING ON QUEST AND/OR RANDOM --------------------------------------------

        const questTypes: Array<CharType> = rewardObject.quest.requirements.map((req) => req.type);
        const questChars: Array<Char> = allChars.filter((char) => questTypes.includes(char.char.type));
        const nonQuestChars: Array<Char> = allChars.filter((char) => !questTypes.includes(char.char.type));

        const targetChars: Array<Char> = [];

        switch (rewardObject.reward.target) {
            // One random character
            case QuestRewardTarget.ONE_RANDOM_CHAR:
                targetChars.push(Random.getInstance().pick(allChars));
                break;

            // One random character who took part in the quest
            case QuestRewardTarget.ONE_RANDOM_QUEST_CHAR:
                targetChars.push(Random.getInstance().pick(questChars));
                break;

            // All characters who took part in the quest
            case QuestRewardTarget.ALL_QUEST_CHARS:
                for (const char of questChars)
                    targetChars.push(char);
                break;

            // One random character who did not take part in the quest
            case QuestRewardTarget.ONE_RANDOM_NON_QUEST_CHAR:
                targetChars.push(Random.getInstance().pick(nonQuestChars));
                break;

            // All characters who did not take part in the quest
            case QuestRewardTarget.ALL_NON_QUEST_CHARS:
                for (const char of nonQuestChars)
                    targetChars.push(char);
                break;

            // All characters
            case QuestRewardTarget.ALL_CHARS:
                for (const char of allChars)
                    targetChars.push(char);
                break;
        }

        // APPLY REWARD --------------------------------------------

        switch (rewardObject.reward.type) {
            // Add [X] dice to the character(s) pool for [Y] turns
            case QuestRewardType.EXTRA_X_DICE_FOR_Y_TURNS:
                // Validate args
                if (rewardObject.reward.args.length != 2)
                    break;
                // Add dice
                for (const char of targetChars)
                    char.addDice(rewardObject.reward.args[0]);
                // Init turns
                rewardObject.turnsRemaining = rewardObject.reward.args[1];
                // Setup end callback
                rewardObject.endCallback = () => {
                    // Remove dice
                    for (const char of targetChars)
                        char.removeDice(rewardObject.reward.args[0]);
                };
                break;

            // Freeze [X] of the character(s) dice each turn for [Y] turns
            case QuestRewardType.FREEZE_X_DICE_FOR_Y_TURNS:
                if (rewardObject.reward.args.length != 2)
                    break;
                break;
        }
    }

    private applyMainQuestReward(rewardObject: RewardObject) {

    }

    private applyQuestsReward(rewardObject: RewardObject) {

    }
}

interface RewardObject {
    reward: QuestReward,
    quest: QuestStruct,
    turnsRemaining: number,
    endCallback?: () => void,
}