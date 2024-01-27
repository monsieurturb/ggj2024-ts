import { EventManager, Events } from "../managers/Events";
import { Colors, Config } from "../config";
import { CharType } from "../struct/CharStruct";
import { QuestRequirement, QuestRequirementMode } from "../struct/QuestRequirement";
import { Dice } from "./Dice";

export class QuestSlot extends Phaser.GameObjects.Container {
    protected _zone: Phaser.GameObjects.Zone;
    protected _background: Phaser.GameObjects.Rectangle;
    protected _text: Phaser.GameObjects.Text;

    protected _requirement: QuestRequirement;
    protected _allRequirements: Array<QuestRequirement>;
    protected _belongsToMainQuest: boolean;

    protected _diceHistory: Array<DiceSnapshot>;
    public get diceHistory() { return this._diceHistory; }

    constructor(scene: Phaser.Scene, requirement: QuestRequirement, allRequirements: Array<QuestRequirement>, belongsToMainQuest = false) {
        super(scene);

        this._requirement = requirement;
        this._allRequirements = allRequirements;
        this._belongsToMainQuest = belongsToMainQuest;

        this._diceHistory = [];

        this.width = Config.diceSize * 1.25;
        this.height = Config.diceSize * 1.25;

        this._zone = new Phaser.GameObjects.Zone(this.scene, 0, 0, this.width, this.height)
            .setRectangleDropZone(this.width, this.height);

        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.width, this.height, <number>this.getColor(), 0.5)
            .setStrokeStyle(4, 0x000000, 0.5)
            .setOrigin(0.5, 0.5);

        this._text = new Phaser.GameObjects.Text(
            this.scene,
            0, 0,
            this.getRequirementText(), {
            fontFamily: 'Arial Black',
            fontSize: 22,
            color: '#000000',
            stroke: <string>this.getColor(true),
            strokeThickness: 4,
            align: 'center',
        })
            .setOrigin(0.5, 0.5);

        this.add([
            this._background,
            this._text,
            this._zone,
        ]);
    }

    getColor(hex: boolean = false): string | number {
        switch (this._requirement.type) {
            case CharType.BARD: return hex ? Colors.DARK_HEX : Colors.DARK;
            case CharType.POET: return hex ? Colors.LIGHT_HEX : Colors.LIGHT;
            case CharType.MIMO: return hex ? Colors.PINK_HEX : Colors.PINK;
            default: return hex ? '#FFFFFF' : 0xFFFFFF;
        }
    }

    getRequirementText() {
        if (this._belongsToMainQuest)
            return "";

        if (this._requirement.done)
            return 'DONE';

        let s = (() => {
            switch (this._requirement.mode) {
                case QuestRequirementMode.EVEN: return "EVEN";
                case QuestRequirementMode.EXACT: return "EXACTLY";
                case QuestRequirementMode.MAX: return "MAX";
                case QuestRequirementMode.MIN: return "MIN";
                case QuestRequirementMode.ODD: return "ODD";
                case QuestRequirementMode.SCORE: return "REACH";
                default: return "";
            }
        })();
        s += "\n" + this._requirement.value;
        return s;
    }

    update() {
        this._text.text = this.getRequirementText();
    }

    isDiceValid(dice: Dice) {
        if (this._requirement.done)
            return false;

        const isTypeValid = this._requirement.type === CharType.ANY || this._requirement.type === dice.dice.type;

        let isValueValid = false;
        switch (this._requirement.mode) {
            case QuestRequirementMode.EVEN:
                isValueValid = dice.dice.currentValue % 2 === 0;
                break;
            case QuestRequirementMode.EXACT:
                isValueValid = dice.dice.currentValue === this._requirement.value;
                break;
            case QuestRequirementMode.EXCEPT:
                isValueValid = dice.dice.currentValue !== this._requirement.value;
                break;
            case QuestRequirementMode.MAX:
                isValueValid = dice.dice.currentValue <= this._requirement.value;
                break;
            case QuestRequirementMode.MIN:
                isValueValid = dice.dice.currentValue >= this._requirement.value;
                break;
            case QuestRequirementMode.ODD:
                isValueValid = dice.dice.currentValue % 2 === 1;
                break;
            case QuestRequirementMode.SAME:
                const reqValue = this.getValueFromOtherSlots();
                isValueValid = reqValue === -1 ? true : reqValue === dice.dice.currentValue;
                break;
            case QuestRequirementMode.SCORE:
                isValueValid = true;
                break;
        }

        return isTypeValid && isValueValid;
    }

    protected getValueFromOtherSlots(): number {
        for (const req of this._allRequirements) {
            if (req.done)
                return req.value;
        }
        return -1;
    }

    addDice(dice: Dice) {
        // NOTE Maybe remove this since we already check it before calling addDice
        if (!this.isDiceValid(dice))
            return false;

        // If SCORE mode
        if (this._requirement.mode === QuestRequirementMode.SCORE) {
            // Substract dice current value from score
            this._requirement.value = Phaser.Math.Clamp(this._requirement.value - dice.dice.currentValue, 0, this._requirement.value);
            // If score reached, we're done
            if (this._requirement.value <= 0)
                this._requirement.done = true
        }
        // If SAME mode, store the dice value to constrain the other slots later
        else if (this._requirement.mode === QuestRequirementMode.SAME) {
            this._requirement.value = dice.dice.currentValue;
            this._requirement.done = true;

            for (const req of this._allRequirements) {
                if (req.uuid !== this._requirement.uuid) {
                    req.mode = QuestRequirementMode.EXACT;
                    req.value = this._requirement.value;
                }
            }
        }
        // If any other mode
        else
            this._requirement.done = true;

        // Save to history
        this._diceHistory.push({ type: dice.dice.type, value: dice.dice.currentValue });

        // Update text
        this._text.text = this.getRequirementText();

        // Hide dice
        dice.setVisible(false);

        // Emit event if done
        if (this._requirement.done)
            EventManager.emit(Events.REQUIREMENT_COMPLETED, this._requirement.uuid);
        else
            EventManager.emit(Events.REQUIREMENT_PROGRESS, this._requirement.uuid);
    }

    clearHistory() {
        this._diceHistory = [];
    }
}

interface DiceSnapshot {
    type: CharType,
    value: number,
}