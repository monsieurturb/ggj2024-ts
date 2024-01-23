import { Scene } from 'phaser';
import { Random } from '../Random';
import { Config } from '../config';
import { Char } from '../entities/Char';
import { QuestCard } from '../entities/QuestCard';
import { CharType } from '../struct/CharStruct';
import { QuestStruct } from '../struct/QuestStruct';

export class Game extends Scene {
    // Entities
    private _chars: Array<Char> = [];
    private _questCards: Array<QuestCard> = [];

    // Layers
    private _charsLayer: Phaser.GameObjects.Container | undefined;
    private _questsLayer: Phaser.GameObjects.Container | undefined;
    private _diceLayer: Phaser.GameObjects.Container | undefined;
    private _uiLayer: Phaser.GameObjects.Container | undefined;

    constructor() {
        super("Game");
    }

    create() {
        // this.cameras.main.setBackgroundColor(0x00ff00);

        // Create all layers
        this._charsLayer = this.add.container();
        this._questsLayer = this.add.container();
        this._diceLayer = this.add.container();
        this._uiLayer = this.add.container();

        // Seed the randomizer
        Random.getInstance().setSeed('make me laugh');

        // Create all characters
        this.createCharAndDice(CharType.TYPE_A, 300);
        this.createCharAndDice(CharType.TYPE_B, 700);
        this.createCharAndDice(CharType.TYPE_C, 1100);

        // NOTE Quest card test
        const card = new QuestCard(this, new QuestStruct("Perfect Delivery"))
            .setPosition(Config.screen.width * 0.5, 300);
        this._questsLayer.add(card);
        this._questCards.push(card);

        // NOTE Debug scene name
        const t = this.add.text(
            Config.screen.width * 0.5,
            Config.screen.height - 32, 'Game', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.scene.start('GameOver');
            });
    }

    createCharAndDice(type: CharType, x: number) {
        const char = new Char(this, type);
        char.setPosition(x, Config.screen.height);
        if (this._charsLayer)
            this._charsLayer.add(char);
        this._chars.push(char);

        char.throwAllDice();

        let diceWidth = Config.diceSize * char.diceEntities.length + Config.diceSize * 0.25 * (char.diceEntities.length - 1);
        let startX = char.x + Config.diceSize / 2 - diceWidth / 2;
        for (let i = 0; i < char.diceEntities.length; i++) {
            const dice = char.diceEntities[i];
            dice.setPosition(startX + i * Config.diceSize * 1.25, char.y - Config.diceSize * 0.75);
            if (this._diceLayer)
                this._diceLayer.add(dice);
        }
    }

    update(time: number, delta: number) {
        // Update all chars (and their dice)
        for (let i = 0; i < this._chars.length; i++) {
            const char = this._chars[i];
            char.update();
        }
        // Update all quest cards
        for (let i = 0; i < this._questCards.length; i++) {
            const card = this._questCards[i];
            card.update();
        }
    }
}
