import { Scene } from 'phaser';
import { Random } from '../Random';
import { Colors, Config } from '../config';
import { Char } from '../entities/Char';
import { QuestCard } from '../entities/QuestCard';
import { CharType } from '../struct/CharStruct';
import { QuestRequirement, QuestRequirementMode, QuestStruct } from '../struct/QuestStruct';
import { QuestBook } from '../struct/QuestBook';
import { EventManager, Events } from '../Events';
import { gsap, Power3 } from 'gsap';
import { MainQuestStruct } from '../struct/MainQuestStruct';
import { MainQuestCard } from '../entities/MainQuestCard';
import { BossBar } from '../entities/BossBar';

export class Game extends Scene {
    // Entities
    private _chars: Array<Char> = [];
    private _questCards: Array<QuestCard> = [];
    private _bossBar: BossBar | undefined;

    // Data
    private _mainQuestCard: MainQuestCard | undefined;
    private _turnsRemaining: number = 10;
    private _throwDiceTimeline: gsap.core.Timeline | undefined;
    private _boundOnEndTurn: (() => void) | undefined;
    private _boundOnUseRemainingDice: (() => void) | undefined;
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

        // Boss bar
        this._bossBar = new BossBar(this)
            .setPosition(Config.screen.width * 0.5, 30);

        // Add to UI layer
        this._uiLayer.add([
            this._turnText,
            this._endTurnButton,
            this._bossBar,
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
            50,
            'Launch cutscene', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
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

        // Listen to "use remaining dice" event
        this._boundOnUseRemainingDice = this.onUseRemainingDice.bind(this);
        EventManager.on(Events.USE_REMAINING_DICE, this._boundOnUseRemainingDice);

        // Listen to "end turn" event
        this._boundOnEndTurn = this.onEndTurn.bind(this);
        EventManager.on(Events.END_TURN, this._boundOnEndTurn);

        // Listen to quest events
        this._boundOnQuestCompleted = this.onQuestCompleted.bind(this);
        this._boundOnQuestFailed = this.onQuestFailed.bind(this);
        EventManager.on(Events.QUEST_COMPLETED, this._boundOnQuestCompleted);
        EventManager.on(Events.QUEST_FAILED, this._boundOnQuestFailed);

        // Listen to shutdown event
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown.bind(this));

        // Create all characters
        this.createCharAndDice(CharType.BARD, 300);
        this.createCharAndDice(CharType.POET, 700);
        this.createCharAndDice(CharType.MIMO, 1100);

        // Setup the animation timeline for the dice throw
        this.setupThrowDiceTimeline();

        // Create main quest
        const mainQuest = new MainQuestStruct()
            .addRequirement(new QuestRequirement(CharType.ANY, QuestRequirementMode.MIN, 1))
            .setTurnsRemaining(999);
        this._mainQuestCard = new MainQuestCard(this, mainQuest)
            .setPosition(Config.screen.width * 0.25, 300);
        this._questsLayer?.add(this._mainQuestCard);

        // Queue quests
        for (let i = 0; i < 5; i++) {
            this.queueAnotherQuest();
        }
        // console.log(this._questCards.map((q) => q.questName));

        // Activate main quest
        this._mainQuestCard.activate();
        // Activate first quest
        this.activateNextQuest();

        // Throw and show
        this.throwAllDice();
    }

    private queueAnotherQuest() {
        const i = this._questCards.length;
        const quest = QuestBook.getInstance().pickOne();
        const card = new QuestCard(this, quest)
            .setPosition(Config.screen.width * 0.75 + i * 15, 300 - i * 15);
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

    private setupThrowDiceTimeline() {
        // Prepare timeline
        this._throwDiceTimeline = gsap.timeline({
            paused: true,
            defaults: {
                rotation: 0,
                duration: 0.4,
                ease: Power3.easeOut,
            },
            onStart: () => {
                // Deactivate end turn button
                if (this._endTurnButton && this._endTurnButton.input)
                    this._endTurnButton.input.enabled = false;
            },
            onComplete: () => {
                // Activate end turn button
                if (this._endTurnButton && this._endTurnButton.input)
                    this._endTurnButton.input.enabled = true;
            },
        });

        for (const char of this._chars) {
            let diceWidth = Config.diceSize * char.diceEntities.length + Config.diceSize * 0.25 * (char.diceEntities.length - 1);
            let startX = char.x + Config.diceSize / 2 - diceWidth / 2;

            for (let i = 0; i < char.diceEntities.length; i++) {
                const dice = char.diceEntities[i];
                this._throwDiceTimeline.fromTo(
                    dice,
                    // Start values
                    {
                        x: startX + i * Config.diceSize * 1.25,
                        y: Config.screen.height + Config.diceSize * 0.75,
                        rotation: Math.PI,
                    },
                    // End values
                    {
                        x: startX + i * Config.diceSize * 1.25,
                        y: char.y - Config.diceSize * 0.75,
                        onStart: () => {
                            dice.setVisible(true);
                            // Deactivate dice
                            if (dice.input)
                                dice.input.enabled = false;
                        },
                        onComplete: () => {
                            // Activate dice
                            if (dice.input)
                                dice.input.enabled = true;
                        },
                    },
                    "<0.1"
                );
            }
        }
    }

    private throwAllDice() {
        // Actual dice "throw" (get new random values)
        for (const char of this._chars) {
            char.throwAllDice();
        }
        // Play animation
        this._throwDiceTimeline?.restart();
    }

    update(time: number, delta: number) {
        // Update all chars (and their dice)
        for (let i = 0; i < this._chars.length; i++) {
            const char = this._chars[i];
            char.update();
        }

        // Update main quest card
        this._mainQuestCard?.update();

        // Update all quest cards
        for (let i = 0; i < this._questCards.length; i++) {
            const card = this._questCards[i];
            card.targetPosition = new Phaser.Geom.Point(Config.screen.width * 0.75 + i * 15, 300 - i * 15);
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

    private onUseRemainingDice() {
        const slot = this._mainQuestCard?.getSlot();
        if (!slot)
            return;

        const timeline = gsap.timeline({
            // paused: true,
            defaults: {
                rotation: Math.PI * 2,
                duration: 0.4,
                ease: Power3.easeOut,
            },
            onStart: () => {
                // console.log('onStart');
                // Deactivate end turn button
                if (this._endTurnButton && this._endTurnButton.input)
                    this._endTurnButton.input.enabled = false;
            },
            onComplete: () => {
                // console.log('onComplete');
                // Automatically end turn
                this.onEndTurn();
            },
        });

        for (const char of this._chars) {
            for (let i = 0; i < char.diceEntities.length; i++) {
                const dice = char.diceEntities[i];

                // If dice was used already, skip it
                if (!dice.visible || !slot.isDiceValid(dice))
                    continue;

                // Animate towards slot
                timeline.to(
                    dice,
                    {
                        x: (this._mainQuestCard ? this._mainQuestCard.x : 0) + slot.x,
                        y: (this._mainQuestCard ? this._mainQuestCard.y : 0) + slot.y,
                        onStart: () => {
                            // Deactivate dice
                            if (dice.input)
                                dice.input.enabled = false;
                        },
                        onComplete: () => {
                            slot.addDice(dice);
                        },
                    },
                    "<0.1"
                );
            }
        }
    }

    private onEndTurn() {
        this.throwAllDice();
    }

    private onQuestCompleted(uuid: string) {
        console.log('Detected quest completed!', uuid);
        const card = this.getQuestCardFromUUID(uuid);
        // console.log("Result:", card?.lootOnSuccess);


        // TODO Loot

        this.deleteQuestAndActivateNext(uuid);
    }

    private onQuestFailed(uuid: string) {
        console.log('Detected quest failed!', uuid);
        const card = this.getQuestCardFromUUID(uuid);
        // console.log("Result:", card?.lootOnFail);

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
        EventManager.off(Events.USE_REMAINING_DICE, this._boundOnUseRemainingDice);
        EventManager.off(Events.END_TURN, this._boundOnEndTurn);
        EventManager.off(Events.QUEST_COMPLETED, this._boundOnQuestCompleted);
        EventManager.off(Events.QUEST_FAILED, this._boundOnQuestFailed);

        this.events.off(Phaser.Scenes.Events.SHUTDOWN);
    }
}
