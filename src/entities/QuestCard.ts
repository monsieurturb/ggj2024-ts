import { EventManager, Events } from "../Events";
import { Config } from "../config";
import { QuestStruct } from "../struct/QuestStruct";
import { QuestSlot } from "./QuestSlot";

export class QuestCard extends Phaser.GameObjects.Container {
    // Actual quest class
    private _quest: QuestStruct;
    // Expose some of the quest properties, keep the rest private
    public get uuid(): string { return this._quest.uuid; }
    public get questName(): string { return this._quest.name; }
    public get turnsRemaining(): number { return this._quest.turnsRemaining; }
    public get lootOnFail(): string { return this._quest.lootOnFail; }
    public get lootOnSuccess(): string { return this._quest.lootOnSuccess; }

    // Graphics objects
    private _background: Phaser.GameObjects.Rectangle | undefined;
    private _text: Phaser.GameObjects.Text | undefined;

    private _boundOnRequirementFilled: ((uuid: string) => void) | undefined;

    public targetPosition: Phaser.Geom.Point;

    constructor(scene: Phaser.Scene, quest: QuestStruct) {
        super(scene);

        this.targetPosition = new Phaser.Geom.Point(this.x, this.y);

        this._quest = quest;

        this.createGraphics();
        // this.createSlots();
    }

    createGraphics() {
        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, Config.questCard.width, Config.questCard.height, 0xFFFFFF)
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5, 0.5);

        this._text = new Phaser.GameObjects.Text(this.scene, -Config.questCard.width * 0.5 + 20, -Config.questCard.height * 0.5 + 32, "", {
            fontFamily: 'Arial',
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
            const req = this._quest.requirements[i];
            const slot = new QuestSlot(this.scene, req);
            slot.x = - (this._quest.requirements.length - 1) * Config.diceSize * 1.25 * 0.5 + i * Config.diceSize * 1.35 + Config.questCard.width * 0.25;
            this.add(slot);
        }
    }

    activate() {
        this._quest.activate();
        this.createSlots();

        this._boundOnRequirementFilled = this.onRequirementFilled.bind(this);
        EventManager.on(Events.REQUIREMENT_FILLED, this._boundOnRequirementFilled);
    }

    update() {
        if (this._text) {
            let s = this._quest.name;
            if (this._quest.lootOnFail != "")
                s += "\nIf failed: " + this._quest.lootOnFail;
            if (this._quest.lootOnSuccess != "")
                s += "\nIf completed: " + this._quest.lootOnSuccess;
            s += "\nTurns remaining: " + this._quest.turnsRemaining;
            s += "\nDone: " + (this._quest.isDone() ? "YES" : "NO");
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
    }

    onRequirementFilled(uuid: string) {
        // console.log('Requirement filled:', uuid);
        if (this._quest.isDone()) {
            // console.log('Quest completed!');
            EventManager.emit(Events.QUEST_COMPLETED, this._quest.uuid);
        }
    }

    destroy(fromScene?: boolean | undefined) {
        // console.log('destroying quest card');

        EventManager.off(Events.REQUIREMENT_FILLED, this._boundOnRequirementFilled);

        this._quest.destroy();

        super.destroy();
    }
}