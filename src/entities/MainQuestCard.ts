import { EventManager, Events } from "../managers/Events";
import { Config } from "../config";
import { MainQuestStruct } from "../struct/MainQuestStruct";
import { QuestStruct } from "../struct/QuestStruct";
import { Dice } from "./Dice";
import { QuestCard } from "./QuestCard";
import { QuestSlot } from "./QuestSlot";

export class MainQuestCard extends QuestCard {
    declare protected _quest: MainQuestStruct;

    protected _throwAllDiceButton: Phaser.GameObjects.Text | undefined;

    public multiplier: number = 1;

    constructor(scene: Phaser.Scene, quest: QuestStruct) {
        super(scene, quest);
    }

    createGraphics() {
        super.createGraphics();

        this._throwAllDiceButton = new Phaser.GameObjects.Text(
            this.scene,
            -Config.questCard.width * 0.25,
            Config.questCard.height * 0.25,
            "Use remaining dice", {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#000000',
        })
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                EventManager.emit(Events.USE_REMAINING_DICE);
            });

        this.add(this._throwAllDiceButton);
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

    update() {
        super.update();

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