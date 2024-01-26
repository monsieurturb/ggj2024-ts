import { EventManager, Events } from "../Events";
import { Colors, Config } from "../config";
import { CharType } from "../struct/CharStruct";
import { QuestRequirement, QuestRequirementMode } from "../struct/QuestStruct";
import { Dice } from "./Dice";

export class QuestSlot extends Phaser.GameObjects.Container {
    protected _zone: Phaser.GameObjects.Zone;
    protected _background: Phaser.GameObjects.Rectangle;
    protected _text: Phaser.GameObjects.Text;

    protected _requirement: QuestRequirement;
    protected _belongsToMainQuest: boolean;

    constructor(scene: Phaser.Scene, requirement: QuestRequirement, belongsToMainQuest = false) {
        super(scene);

        this._requirement = requirement;
        this._belongsToMainQuest = belongsToMainQuest;

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
            case CharType.TYPE_A: return hex ? Colors.DARK_HEX : Colors.DARK;
            case CharType.TYPE_B: return hex ? Colors.LIGHT_HEX : Colors.LIGHT;
            case CharType.TYPE_C: return hex ? Colors.PINK_HEX : Colors.PINK;
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

    isDiceValid(dice: Dice) {
        if (this._requirement.done)
            return false;

        const isTypeValid = this._requirement.type === CharType.ANY || this._requirement.type === dice.charType;

        let isValueValid = false;
        switch (this._requirement.mode) {
            case QuestRequirementMode.EVEN:
                isValueValid = dice.currentValue % 2 === 0;
                break;
            case QuestRequirementMode.EXACT:
                isValueValid = dice.currentValue === this._requirement.value;
                break;
            case QuestRequirementMode.MAX:
                isValueValid = dice.currentValue <= this._requirement.value;
                break;
            case QuestRequirementMode.MIN:
                isValueValid = dice.currentValue >= this._requirement.value;
                break;
            case QuestRequirementMode.ODD:
                isValueValid = dice.currentValue % 2 === 1;
                break;
            case QuestRequirementMode.SCORE:
                isValueValid = true;
                break;
        }

        return isTypeValid && isValueValid;
    }

    addDice(dice: Dice) {
        if (!this.isDiceValid(dice))
            return false;

        // For SCORE mode
        if (this._requirement.mode === QuestRequirementMode.SCORE) {
            // Substract dice current value from score
            this._requirement.value = Phaser.Math.Clamp(this._requirement.value - dice.currentValue, 0, this._requirement.value);
            // If score reached, we're done
            if (this._requirement.value <= 0)
                this._requirement.done = true
        }
        // For all other modes
        else
            this._requirement.done = true;

        // Update text
        this._text.text = this.getRequirementText();

        // Hide dice
        dice.setVisible(false);

        // Emit event if done
        if (this._requirement.done)
            EventManager.emit(Events.REQUIREMENT_FILLED, this._requirement.uuid);
    }
}