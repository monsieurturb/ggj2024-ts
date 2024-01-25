import { EventManager, Events } from "../Events";
import { Colors, Config } from "../config";
import { CharType } from "../struct/CharStruct";
import { QuestRequirement, QuestRequirementMode } from "../struct/QuestStruct";
import { Dice } from "./Dice";

export class QuestSlot extends Phaser.GameObjects.Container {
    private zone: Phaser.GameObjects.Zone;
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;

    private requirement: QuestRequirement;

    constructor(scene: Phaser.Scene, requirement: QuestRequirement) {
        super(scene);

        this.requirement = requirement;
        this.width = Config.diceSize * 1.25;
        this.height = Config.diceSize * 1.25;

        this.zone = new Phaser.GameObjects.Zone(this.scene, 0, 0, this.width, this.height)
            .setRectangleDropZone(this.width, this.height);

        this.background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.width, this.height, <number>this.getColor(), 0.5)
            .setStrokeStyle(4, 0x000000, 0.5)
            .setOrigin(0.5, 0.5);

        this.text = new Phaser.GameObjects.Text(
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
            this.background,
            this.text,
            this.zone,
        ]);
    }

    getColor(hex: boolean = false): string | number {
        switch (this.requirement.type) {
            case CharType.TYPE_A: return hex ? Colors.DARK_HEX : Colors.DARK;
            case CharType.TYPE_B: return hex ? Colors.LIGHT_HEX : Colors.LIGHT;
            case CharType.TYPE_C: return hex ? Colors.PINK_HEX : Colors.PINK;
            default: return hex ? '#FFFFFF' : 0xFFFFFF;
        }
    }

    getRequirementText() {
        if (this.requirement.done)
            return 'DONE';

        let s = (() => {
            switch (this.requirement.mode) {
                case QuestRequirementMode.EVEN: return "EVEN";
                case QuestRequirementMode.EXACT: return "EXACTLY";
                case QuestRequirementMode.MAX: return "MAX";
                case QuestRequirementMode.MIN: return "MIN";
                case QuestRequirementMode.ODD: return "ODD";
                case QuestRequirementMode.SCORE: return "REACH";
                default: return "";
            }
        })();
        s += "\n" + this.requirement.value;
        return s;
    }

    /* onDrop(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, target: Phaser.GameObjects.Zone) {
        // console.log('ON DROP pointer:', pointer, 'is Dice:', (gameObject instanceof Dice), 'is this zone:', (target === this.zone));

        // If target is not this Slot's Zone or gameObject is not a Dice, return
        if (target != this.zone || !(gameObject instanceof Dice)) {
            // console.log('target:', target);
            return;
        }

        const dice = gameObject as Dice;
        const isValid = this.isDiceValid(dice);
        if (!isValid)
            dice.setPosition(dice.input?.dragStartX, dice.input?.dragStartY);
        // console.log("DROPPED:", dice.charType, dice.currentValue, (isValid ? "IS VALID" : "IS NOT VALID"));
    } */

    isDiceValid(dice: Dice) {
        if (this.requirement.done)
            return false;

        const isTypeValid = this.requirement.type === CharType.ANY || this.requirement.type === dice.charType;

        let isValueValid = false;
        switch (this.requirement.mode) {
            case QuestRequirementMode.EVEN:
                isValueValid = dice.currentValue % 2 === 0;
                break;
            case QuestRequirementMode.EXACT:
                isValueValid = dice.currentValue === this.requirement.value;
                break;
            case QuestRequirementMode.MAX:
                isValueValid = dice.currentValue <= this.requirement.value;
                break;
            case QuestRequirementMode.MIN:
                isValueValid = dice.currentValue >= this.requirement.value;
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
        if (this.requirement.mode === QuestRequirementMode.SCORE) {
            // Substract dice current value from score
            this.requirement.value = Phaser.Math.Clamp(this.requirement.value - dice.currentValue, 0, this.requirement.value);
            // If score reached, we're done
            if (this.requirement.value <= 0)
                this.requirement.done = true
        }
        // For all other modes
        else
            this.requirement.done = true;

        // Update text
        this.text.text = this.getRequirementText();

        // Destroy dice
        dice.destroy();

        // Emit event if done
        if (this.requirement.done)
            EventManager.emit(Events.REQUIREMENT_FILLED, this.requirement.uuid);
    }

    /* removeDice(diceEntity: Dice) {
        const result = this.diceEntities.delete(diceEntity.uuid);
        if (!result)
            console.log("Dice not in slot");
        else
            console.log("Dice removed from slot", dice.currentValue);

        this.updateText();
    } */

    /* private updateText() {
        const a: Array<Dice> = Array.from(this.diceEntities.values());
        this.text.text = `In slot: ${a.map((d) => d.currentValue).join(",")}`;
        this.text.text += `\nTotal: ${a.reduce((total, dice) => total + dice.currentValue, 0)}`;
    } */
}