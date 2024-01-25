import { Scene } from 'phaser';
import { Random } from '../Random';
import { Colors, Config } from '../config';
import { Char } from '../entities/Char';
import { QuestCard } from '../entities/QuestCard';
import { CharType } from '../struct/CharStruct';
import { QuestStruct } from '../struct/QuestStruct';
import { QuestBook } from '../struct/QuestBook';
import { EventManager, Events } from '../Events';

export class Game extends Scene {
    // Entities
    private _chars: Array<Char> = [];
    private _questCards: Array<QuestCard> = [];

    // Data
    private _turnsRemaining: number = 10;

    // Layers
    private _charsLayer: Phaser.GameObjects.Container | undefined;
    private _questsLayer: Phaser.GameObjects.Container | undefined;
    private _diceLayer: Phaser.GameObjects.Container | undefined;
    private _uiLayer: Phaser.GameObjects.Container | undefined;

    // UI
    private _endTurnButton: Phaser.GameObjects.Text | undefined;
    private _turnText: Phaser.GameObjects.Text | undefined;

    public mask: Phaser.GameObjects.Rectangle | undefined;

    constructor() {
        super("Game");
    }

    init() {
        this.cameras.main.setBackgroundColor(Colors.BACKGROUND);

        // Reset data
        this._chars = [];
        this._questCards = [];
        this._turnsRemaining = 10;
    }

    preload() { }

    create() {
        // Create all layers
        this._charsLayer = this.add.container();
        this._questsLayer = this.add.container();
        this._diceLayer = this.add.container();
        this._uiLayer = this.add.container();
        this.mask = this.add.rectangle(0, 0, Config.screen.width, Config.screen.height, 0x000000)
            .setOrigin(0, 0)
            .removeFromDisplayList();

        // Seed the randomizer
        // Random.getInstance().setSeed('make me laugh');

        // Create all characters
        this.createCharAndDice(CharType.TYPE_A, 300);
        this.createCharAndDice(CharType.TYPE_B, 700);
        this.createCharAndDice(CharType.TYPE_C, 1100);

        // Turns display
        this._turnText = this.add.text(
            10, 10,
            "", {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        // End turn button
        this._endTurnButton = this.add.text(
            Config.screen.width - 20, Config.screen.height - 20,
            "END TURN", {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(1, 1)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this._turnsRemaining--;
                EventManager.emit(Events.END_TURN);
            });
        // Add to UI layer
        this._uiLayer.add([
            this._turnText,
            this._endTurnButton
        ]);

        // NOTE Quest card test
        for (let i = 0; i < 5; i++) {
            const quest = QuestBook.getInstance().pickOne();
            const card = new QuestCard(this, quest)
                .setPosition(Config.screen.width * 0.5 - i * 15, 300 + i * 15);
            this._questsLayer.add(card);
            this._questCards.push(card);
        }

        // NOTE Debug scene name
        let t = this.add.text(
            Config.screen.width * 0.5,
            Config.screen.height - 32,
            'Game', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5, 1)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.scene.start('GameOver');
            });
        this._uiLayer.add(t);

        // NOTE Cutscene test
        t = this.add.text(
            Config.screen.width * 0.5,
            32,
            'Launch cutscene', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5, 0)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.mask?.setScale(0, 1)
                    .addToDisplayList();
                this.scene.transition({
                    target: "CutScene",
                    // moveAbove: true,
                    moveBelow: true,
                    duration: Config.sceneTransitionDuration,
                    sleep: true,
                    onUpdate: (progress: number) => {
                        const v = Phaser.Math.Easing.Bounce.Out(progress);
                        this.mask?.setScale(v, 1);
                    }
                });
            });
        this._uiLayer.add(t);

        // Listen to shutdown event
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown.bind(this));

        // Listen to quest completed event
        EventManager.on(Events.QUEST_COMPLETED, this.onQuestCompleted);

        // Activate first quest
        const card = this._questCards[this._questCards.length - 1];
        card.activate();
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
        // Update UI
        if (this._turnText)
            this._turnText.text = "Turns remaining: " + this._turnsRemaining;
    }

    onQuestCompleted() {
        console.log('Detected quest completed!');

    }

    shutdown() {
        // TODO Clean scene on exit (destroy chars and quests, kill event listeners etc.)
        this.events.off(Phaser.Scenes.Events.SHUTDOWN);
    }
}
