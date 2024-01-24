import { Config } from "../config";
import { QuestStruct } from "../struct/QuestStruct";

export class QuestCard extends Phaser.GameObjects.Container {
    // Actual quest class
    private _quest: QuestStruct;
    // Expose some of the quest properties, keep the rest private
    public get turnsRemaining(): number { return this._quest.turnsRemaining; }

    // Graphics objects
    private _background: Phaser.GameObjects.Rectangle | undefined;
    private _text: Phaser.GameObjects.Text | undefined;

    constructor(scene: Phaser.Scene, quest: QuestStruct) {
        super(scene);

        this._quest = quest;

        this.createGraphics();
    }

    createGraphics() {
        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, Config.questCard.width, Config.questCard.height, 0xFFFFFF)
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5, 0.5);

        this._text = new Phaser.GameObjects.Text(this.scene, 10, -Config.questCard.height * 0.5 + 32, "", {
            fontFamily: 'Arial',
            fontSize: 28,
            color: '#000000',
            wordWrap: { width: Config.questCard.width - 20 }
        })
            .setFixedSize(Config.questCard.width, Config.questCard.height)
            .setOrigin(0.5, 0);

        this.add([
            this._background,
            this._text,
        ]);
    }

    activate() {
        this._quest.activate();
    }

    update() {
        if (this._text) {
            let s = this._quest.name;
            if (this._quest.lootOnFail != "")
                s += "\nIf failed: " + this._quest.lootOnFail;
            if (this._quest.lootOnSuccess != "")
                s += "\nIf completed: " + this._quest.lootOnSuccess;
            s += "\nTurns remaining: " + this._quest.turnsRemaining;
            this._text.text = s;
        }
    }
}