import { Scene } from 'phaser';
import { Random } from '../Random';
import { Colors, Config } from '../config';
import { Char } from '../entities/Char';
import { QuestCard } from '../entities/QuestCard';
import { CharType } from '../struct/CharStruct';
import { QuestStruct } from '../struct/QuestStruct';
import { QuestBook } from '../struct/QuestBook';
import { EventManager, Events } from '../Events';
import { gsap, Power3 } from 'gsap';

export class Game extends Scene {
    // Entities
    private _chars: Array<Char> = [];
    private _questCards: Array<QuestCard> = [];

    // Data
    private _turnsRemaining: number = 10;
    private _boundOnEndTurn: (() => void) | undefined;
    private _boundOnQuestCompleted: ((uuid: string) => void) | undefined;
    private _boundOnQuestFailed: ((uuid: string) => void) | undefined;

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

        // Listen to quest events
        this._boundOnQuestCompleted = this.onQuestCompleted.bind(this);
        this._boundOnQuestFailed = this.onQuestFailed.bind(this);
        EventManager.on(Events.QUEST_COMPLETED, this._boundOnQuestCompleted);
        EventManager.on(Events.QUEST_FAILED, this._boundOnQuestFailed);

        // Listen to end turn event
        this._boundOnEndTurn = this.onEndTurn.bind(this);
        EventManager.on(Events.END_TURN, this._boundOnEndTurn);

        // Create all characters
        this.createCharAndDice(CharType.TYPE_A, 300);
        this.createCharAndDice(CharType.TYPE_B, 700);
        this.createCharAndDice(CharType.TYPE_C, 1100);

        // Queue quests
        for (let i = 0; i < 5; i++) {
            this.queueAnotherQuest();
        }
        // console.log(this._questCards.map((q) => q.questName));

        // Activate first quest
        this.activateNextQuest();

        // Throw and show
        this.throwAllDice();
    }

    private queueAnotherQuest() {
        const i = this._questCards.length;
        const quest = QuestBook.getInstance().pickOne();
        const card = new QuestCard(this, quest)
            .setPosition(Config.screen.width * 0.5 + i * 15, 300 - i * 15);
        this._questsLayer?.addAt(card, 0);
        this._questCards.push(card);
    }

    private activateNextQuest() {
        while (this._questCards.length < 5) {
            this.queueAnotherQuest();
        }

        const card = this._questCards[0];
        // console.log('Activating card', card?.uuid);
        card?.activate();
    }

    private createCharAndDice(type: CharType, x: number) {
        const char = new Char(this, type);
        char.setPosition(x, Config.screen.height);
        if (this._charsLayer)
            this._charsLayer.add(char);
        this._chars.push(char);

        for (let i = 0; i < char.diceEntities.length; i++) {
            const dice = char.diceEntities[i];
            if (this._diceLayer)
                this._diceLayer.add(dice);
        }
    }

    private throwAllDice() {
        let d = 0;
        for (const char of this._chars) {
            char.throwAllDice();

            let diceWidth = Config.diceSize * char.diceEntities.length + Config.diceSize * 0.25 * (char.diceEntities.length - 1);
            let startX = char.x + Config.diceSize / 2 - diceWidth / 2;
            for (let i = 0; i < char.diceEntities.length; i++) {
                const dice = char.diceEntities[i];
                // Place just outside the screen
                dice.setPosition(startX + i * Config.diceSize * 1.25, Config.screen.height + Config.diceSize * 0.75);
                dice.setRotation(Math.PI);
                // Move into view
                gsap.to(dice, {
                    y: char.y - Config.diceSize * 0.75,
                    rotation: 0,
                    duration: 0.4,
                    delay: 0.05 * d,
                    ease: Power3.easeOut,
                    onStart: () => {
                        dice.setVisible(true);
                        if (dice.input)
                            dice.input.enabled = false;
                    },
                    onComplete: () => {
                        if (dice.input)
                            dice.input.enabled = true;
                    },
                });

                d++;
            }
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
            card.targetPosition = new Phaser.Geom.Point(Config.screen.width * 0.5 + i * 15, 300 - i * 15);
            card.update();
        }

        // Update UI
        if (this._turnText)
            this._turnText.text = "Turns remaining: " + this._turnsRemaining;
    }

    private getQuestCardFromUUID(uuid: string): QuestCard | undefined {
        for (const card of this._questCards) {
            if (card.uuid === uuid)
                return card;
        }
        return undefined;
    }

    private deleteQuestCardFromUUID(uuid: string): QuestCard | undefined {
        const card = this.getQuestCardFromUUID(uuid);
        this._questCards = this._questCards.filter((card) => card.uuid !== uuid);
        return card;
    }

    private onEndTurn() {
        this.throwAllDice();
    }

    private onQuestCompleted(uuid: string) {
        console.log('Detected quest completed!', uuid);
        const card = this.getQuestCardFromUUID(uuid);
        console.log("Result:", card?.lootOnSuccess);


        // TODO Loot

        this.deleteQuestAndActivateNext(uuid);
    }

    private onQuestFailed(uuid: string) {
        console.log('Detected quest failed!', uuid);
        const card = this.getQuestCardFromUUID(uuid);
        console.log("Result:", card?.lootOnFail);

        // TODO Loot

        this.deleteQuestAndActivateNext(uuid);
    }

    private deleteQuestAndActivateNext(uuid: string) {
        const card = this.deleteQuestCardFromUUID(uuid);
        // console.log('Deleted?', card?.uuid, this._questCards.map((q) => q.questName));

        card?.destroy();

        this.activateNextQuest();
    }

    private shutdown() {
        EventManager.off(Events.QUEST_COMPLETED, this._boundOnQuestCompleted);
        EventManager.off(Events.QUEST_FAILED, this._boundOnQuestFailed);
        EventManager.off(Events.END_TURN, this._boundOnEndTurn);

        this.events.off(Phaser.Scenes.Events.SHUTDOWN);
    }
}
