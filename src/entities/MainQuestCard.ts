import { EventManager, Events } from "../Events";
import { Config } from "../config";
import { MainQuestStruct } from "../struct/MainQuestStruct";
import { QuestStruct } from "../struct/QuestStruct";
import { QuestCard } from "./QuestCard";
import { QuestSlot } from "./QuestSlot";

export class MainQuestCard extends QuestCard {
    declare protected _quest: MainQuestStruct;

    constructor(scene: Phaser.Scene, quest: QuestStruct) {
        super(scene, quest);
    }

    createSlots() {
        for (let i = 0; i < this._quest.requirements.length; i++) {
            const req = this._quest.requirements[i];
            const slot = new QuestSlot(this.scene, req, true);
            slot.x = - (this._quest.requirements.length - 1) * Config.diceSize * 1.25 * 0.5 + i * Config.diceSize * 1.35 + Config.questCard.width * 0.25;
            this.add(slot);
        }
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
            console.log('MAIN QUEST Requirement filled:', uuid);
            this._quest.undoRequirements();
        }
    }
}