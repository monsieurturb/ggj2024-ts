import { EventManager, Events } from "../managers/Events";
import { Config, Fonts } from "../config";
import { MainQuestStruct } from "../struct/MainQuestStruct";
import { QuestStruct } from "../struct/QuestStruct";
import { Dice } from "./Dice";
import { QuestCard } from "./QuestCard";
import { QuestSlot } from "./QuestSlot";
import { Game } from "../scenes/Game";

export class MainQuestCard extends QuestCard {
    declare protected _quest: MainQuestStruct;

    protected _throwAllDiceButton: Phaser.GameObjects.Text | undefined;

    public multiplier: number = 1;

    constructor(scene: Phaser.Scene, quest: QuestStruct) {
        super(scene, quest);
    }

    createGraphics() {
        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, Config.questCard.width, Config.questCard.height, 0xFFFFFF, 0.1)
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5, 0.5);

        this._text = new Phaser.GameObjects.Text(this.scene, -Config.questCard.width * 0.5 + 20, -Config.questCard.height * 0.5 + 32, "", {
            fontFamily: Fonts.MAIN,
            fontSize: 28,
            color: '#000000',
            wordWrap: { width: Config.questCard.width * 0.5 }
        })
            .setFixedSize(Config.questCard.width, Config.questCard.height)
            .setOrigin(0, 0)
            .setVisible(this._facingUp);

        this._throwAllDiceButton = new Phaser.GameObjects.Text(
            this.scene,
            -Config.questCard.width * 0.25,
            Config.questCard.height * 0.25,
            "Use remaining dice", {
            fontFamily: Fonts.MAIN,
            fontSize: 28,
            color: '#000000',
        })
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                if (Game.preventAllInteractions)
                    return;

                EventManager.emit(Events.USE_REMAINING_DICE);
            });

        this.add([
            this._background,
            this._text,
            this._throwAllDiceButton,
        ]);
    }

    createSlots() {
        for (let i = 0; i < this._quest.requirements.length; i++) {
            const slot = new QuestSlot(this.scene, this._quest.requirements[i], this._quest.requirements, true);
            this._slots.push(slot);
        }
        this.placeSlots();
    }

    getSlot(): QuestSlot | undefined {
        if (this._slots.length > 0)
            return this._slots[0];
        else
            return undefined;
    }

    flip() {
        super.flip(true);
    }

    update(time: number) {
        super.update(time);

        if (this._text) {
            let s = this._quest.name;
            this._text.text = s;
        }
    }

    onRequirementCompleted(uuid: string) {
        if (this._quest.isOwnRequirement(uuid)) {
            // console.log('MAIN QUEST Requirement filled:', uuid);

            const slot = this.getSlot();
            if (slot && slot.diceHistory.length > 0) {
                // Find last dice
                const lastDice = slot.diceHistory[slot.diceHistory.length - 1];
                // Emit event
                EventManager.emit(Events.MAIN_QUEST_PROGRESS, lastDice.value * this.multiplier);
                // Clear history
                slot.clearHistory();
            }

            this._quest.undoRequirements();
        }
    }
}