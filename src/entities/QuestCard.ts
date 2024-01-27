import { EventManager, Events } from "../managers/Events";
import { Config, Fonts } from "../config";
import { QuestStruct } from "../struct/QuestStruct";
import { QuestSlot } from "./QuestSlot";
import { QuestReward } from "../struct/QuestReward";

export class QuestCard extends Phaser.GameObjects.Container {
    // Actual quest class
    protected _quest: QuestStruct;
    // Expose some of the quest properties, keep the rest private
    public get quest() { return this._quest; }
    public get uuid() { return this._quest.uuid; }
    public get questName() { return this._quest.name; }
    public get turnsRemaining() { return this._quest.turnsRemaining; }
    public get rewardsForFail() { return this._quest.rewardsForFail; }
    public get rewardsForSuccess() { return this._quest.rewardsForSuccess; }

    // Graphics objects
    protected _background: Phaser.GameObjects.Rectangle | undefined;
    protected _text: Phaser.GameObjects.Text | undefined;
    protected _slots: Array<QuestSlot> = [];

    protected _boundOnRequirementProgress: ((uuid: string) => void) | undefined;
    protected _boundOnRequirementCompleted: ((uuid: string) => void) | undefined;

    public targetPosition: Phaser.Geom.Point;

    constructor(scene: Phaser.Scene, quest: QuestStruct) {
        super(scene);

        this.targetPosition = new Phaser.Geom.Point(this.x, this.y);

        this._quest = quest;

        this.createGraphics();
    }

    createGraphics() {
        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, Config.questCard.width, Config.questCard.height, 0xFFFFFF)
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5, 0.5);

        this._text = new Phaser.GameObjects.Text(this.scene, -Config.questCard.width * 0.5 + 20, -Config.questCard.height * 0.5 + 32, "", {
            fontFamily: Fonts.MAIN,
            fontSize: 28,
            color: '#000000',
            wordWrap: { width: Config.questCard.width * 0.5 }
        })
            .setFixedSize(Config.questCard.width, Config.questCard.height)
            .setOrigin(0, 0);

        this.add([
            this._background,
            this._text,
        ]);
    }

    createSlots() {
        for (let i = 0; i < this._quest.requirements.length; i++) {
            const slot = new QuestSlot(this.scene, this._quest.requirements[i], this._quest.requirements);
            this._slots.push(slot);
        }
        this.placeSlots();
    }

    placeSlots() {
        for (let i = 0; i < this._slots.length; i++) {
            this._slots[i].x = - (this._quest.requirements.length - 1) * Config.diceSize * 1.25 * 0.5 + i * Config.diceSize * 1.35 + Config.questCard.width * 0.25;
            this.add(this._slots[i]);
        }
    }

    activate(primed: boolean = false) {
        this._quest.activate(primed);
        this.createSlots();

        this._boundOnRequirementProgress = this.onRequirementProgress.bind(this);
        this._boundOnRequirementCompleted = this.onRequirementCompleted.bind(this);
        EventManager.on(Events.REQUIREMENT_PROGRESS, this._boundOnRequirementProgress);
        EventManager.on(Events.REQUIREMENT_COMPLETED, this._boundOnRequirementCompleted);
    }

    setPosition(x?: number | undefined, y?: number | undefined, z?: number | undefined, w?: number | undefined): this {
        super.setPosition(x, y, z, w);
        if (x)
            this.targetPosition.x = x;
        if (y)
            this.targetPosition.y = y;
        return this;
    }

    update() {
        if (this._text) {
            let s = this._quest.name;
            s += "\nTurns remaining: " + this._quest.turnsRemaining;
            this._text.text = s;
        }

        const x = this.targetPosition.x - this.x;
        const y = this.targetPosition.y - this.y;
        if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
            const mult = 0.15;
            this.setPosition(this.x + x * mult, this.y + y * mult);
        }
        else if (Math.abs(x) > 0 || Math.abs(y) > 0) {
            this.setPosition(this.targetPosition.x, this.targetPosition.y);
        }

        for (const slot of this._slots) {
            slot.update();
        }
    }

    onRequirementProgress(uuid: string) {
        // if (this._quest.isOwnRequirement(uuid))
        // console.log('Requirement progress:', uuid);

        if (this._quest.isOwnRequirement(uuid) && !this._quest.isPrimed)
            this._quest.isPrimed = true;
    }

    onRequirementCompleted(uuid: string) {
        // if (this._quest.isOwnRequirement(uuid))
        // console.log('Requirement completed:', uuid);

        if (this._quest.isOwnRequirement(uuid)) {
            if (this._quest.isDone())
                EventManager.emit(Events.QUEST_COMPLETED, this._quest.uuid);
            else if (!this._quest.isPrimed)
                this._quest.isPrimed = true
        }
    }

    destroy(fromScene?: boolean | undefined) {
        // console.log('destroying quest card');

        EventManager.off(Events.REQUIREMENT_PROGRESS, this._boundOnRequirementProgress);
        EventManager.off(Events.REQUIREMENT_COMPLETED, this._boundOnRequirementCompleted);

        this._quest.destroy();

        super.destroy();
    }
}