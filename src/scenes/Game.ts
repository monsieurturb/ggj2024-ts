import { Power3, gsap } from 'gsap';
import { Scene } from 'phaser';
import { EventManager, Events } from '../managers/Events';
import { Colors, Config, Fonts } from '../config';
import { StageBar } from '../entities/StageBar';
import { Char } from '../entities/Char';
import { Dice } from '../entities/Dice';
import { MainQuestCard } from '../entities/MainQuestCard';
import { QuestCard } from '../entities/QuestCard';
import { CharType } from '../struct/CharStruct';
import { MainQuestStruct } from '../struct/MainQuestStruct';
import { QuestBook } from '../struct/QuestBook';
import { QuestRequirement, QuestRequirementMode } from '../struct/QuestRequirement';
import { Rewards } from '../managers/Rewards';
import { QuestReward, QuestRewardTarget, QuestRewardType } from '../struct/QuestReward';
import { Random } from '../managers/Random';
import { Curtains } from '../entities/Curtains';
import { Audience } from '../entities/Audience';
import { TurnsDisplay } from '../entities/TurnsDisplay';
import { FameDisplay } from '../entities/FameDisplay';

export class Game extends Scene {
    static preventAllInteractions: boolean = true;
    static firstTimeUsedDice = 0;

    // Entities
    private _chars: Array<Char> = [];
    public get chars() { return this._chars; }
    private _questCards: Array<QuestCard> = [];
    private _stageBar: StageBar | undefined;
    private _audience: Audience | undefined;
    private _curtains: Curtains | undefined;

    // Data
    private _mainQuestCard: MainQuestCard | undefined;
    public get mainQuestCard() { return this._mainQuestCard; }

    // Layers
    private _audienceLayer: Phaser.GameObjects.Container | undefined;
    private _charsLayer: Phaser.GameObjects.Container | undefined;
    private _questsLayer: Phaser.GameObjects.Container | undefined;
    private _diceLayer: Phaser.GameObjects.Container | undefined;
    private _uiLayer: Phaser.GameObjects.Container | undefined;

    // UI
    private _useAllDiceButton: Phaser.GameObjects.Text | undefined;
    private _endTurnButton: Phaser.GameObjects.Text | undefined;
    private _fameDisplay: FameDisplay | undefined;
    private _turnsDisplay: TurnsDisplay | undefined;

    public mask: Phaser.GameObjects.Rectangle | undefined;

    private _boundOnMainQuestProgress: (() => void) | undefined;

    constructor() {
        super("Game");
    }

    init() {
        this.cameras.main.setBackgroundColor('#111111');

        // Reset data
        this._chars = [];
        this._questCards = [];
    }

    preload() { }

    create() {
        Game.preventAllInteractions = true;

        // Create all layers
        this._audienceLayer = this.add.container();
        this._charsLayer = this.add.container();
        this._questsLayer = this.add.container();
        this._diceLayer = this.add.container();
        this._uiLayer = this.add.container();
        this.mask = this.add.rectangle(0, 0, Config.screen.width, Config.screen.height, 0x000000)
            .setOrigin(0, 0)
            .removeFromDisplayList();

        // Seed the randomizer
        // Random.getInstance().setSeed('make me laugh');

        // Setup rewards manager
        Rewards.getInstance().setup(this);

        // Fame display
        this._fameDisplay = new FameDisplay(this)
            .setPosition(
                110 * Config.DPR,
                70 * Config.DPR
            );

        // Turns display
        this._turnsDisplay = new TurnsDisplay(this)
            .setPosition(
                Config.screen.width - 110 * Config.DPR,
                70 * Config.DPR
            );

        // End turn button
        this._endTurnButton = this.add.text(
            Config.screen.width - 40 * Config.DPR,
            Config.screen.height - 40 * Config.DPR,
            "End turn",
            Fonts.getStyle(38, Colors.WHITE_HEX, Fonts.MAIN)
        )
            .setAlign('center')
            .setOrigin(1, 1)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                if (Game.preventAllInteractions)
                    return;
                this.endTurn();
            });

        // Use all dice button
        this._useAllDiceButton = this.add.text(
            Config.screen.width - 40 * Config.DPR,
            Config.screen.height - 120 * Config.DPR,
            "Use all dice",
            Fonts.getStyle(42, Colors.WHITE_HEX, Fonts.MAIN),
        )
            .setAlign('center')
            .setOrigin(1, 1)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                if (Game.preventAllInteractions)
                    return;
                this.useRemainingDice();
            });

        // Boss bar
        this._stageBar = new StageBar(this)
            .setPosition(Config.screen.width * 0.5, 30 * Config.DPR);

        // Add to UI layer
        this._uiLayer.add([
            this._fameDisplay,
            this._turnsDisplay,
            this._useAllDiceButton,
            this._endTurnButton,
            this._stageBar,
        ]);

        // Audience
        this._audience = new Audience(this)
            .setPosition(Config.screen.width * 0.5, Config.screen.height);

        // Curtains
        this._curtains = new Curtains(this)
            .setPosition(Config.screen.width * 0.5, Config.screen.height * 0.5);

        // Add to audience layer
        this._audienceLayer.add([
            this._audience,
            this._curtains,
        ]);

        // NOTE Debug scene name
        let t = this.add.text(
            Config.screen.width * 0.5,
            Config.screen.height * Config.DPR,
            'Game', {
            fontFamily: 'Arial Black', fontSize: 32 * Config.DPR, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8 * Config.DPR,
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
            50 * Config.DPR,
            'Launch cutscene', {
            fontFamily: 'Arial Black',
            fontSize: 24 * Config.DPR,
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

        // Listen to "end turn" event
        EventManager.on(Events.END_TURN, this.onEndTurn.bind(this));

        // Listen to quest events
        EventManager.on(Events.QUEST_COMPLETED, this.onQuestCompleted.bind(this));
        EventManager.on(Events.QUEST_FAILED, this.onQuestFailed.bind(this));

        // Listen to requirement events (to keep track of used dice)
        EventManager.on(Events.REQUIREMENT_PROGRESS, this.onDiceUsed.bind(this));
        EventManager.on(Events.REQUIREMENT_COMPLETED, this.onDiceUsed.bind(this));

        // Listen to main quest progress if needed
        if (Game.firstTimeUsedDice > 0) {
            this._boundOnMainQuestProgress = this.onMainQuestProgress.bind(this);
            EventManager.on(Events.MAIN_QUEST_PROGRESS, this._boundOnMainQuestProgress);
        }

        // Listen to shutdown event
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown.bind(this));

        // Create all characters
        const charTypes = Random.getInstance().shuffle([CharType.BARD, CharType.MIMO, CharType.POET]);
        for (let i = 0; i < charTypes.length; i++) {
            const charType = charTypes[i];
            this.createCharAndDice(charType, Config.screen.width * 0.2 + Config.screen.width * 0.25 * i);
        }

        // Create main quest
        const mainQuest = new MainQuestStruct()
            .addRequirement(new QuestRequirement(CharType.ANY, QuestRequirementMode.MIN, 1))
            .setTurnsRemaining(99);
        this._mainQuestCard = new MainQuestCard(this, mainQuest)
            .setPosition(Config.screen.width * 0.75, Config.questCard.startY);
        this._questsLayer?.add(this._mainQuestCard);

        // Activate main quest
        this._mainQuestCard.activate();

        // Activate first quest if player has already played
        if (Game.firstTimeUsedDice <= 0)
            this.activateNextQuest(true);

        // Throw and show
        this.throwAllDice();
    }

    private onMainQuestProgress() {
        Game.firstTimeUsedDice--;

        if (Game.firstTimeUsedDice === 0) {
            EventManager.off(Events.MAIN_QUEST_PROGRESS, this._boundOnMainQuestProgress);
            // Activate first quest
            this.activateNextQuest();
        }
    }

    private endTurn() {
        EventManager.emit(Events.END_TURN);
    }

    private queueAnotherQuest() {
        const i = this._questCards.length;
        const quest = QuestBook.getInstance().pickOne();
        const card = new QuestCard(this, quest)
            .setPosition(Config.questCard.startX, Config.questCard.startY);
        this._questsLayer?.addAt(card, 0);
        this._questCards.push(card);
    }

    private activateNextQuest(primed: boolean = false) {
        while (this._questCards.length < Config.maxVisibleQuests) {
            this.queueAnotherQuest();
        }

        // Reset target positions
        for (let i = 0; i < this._questCards.length; i++) {
            const card = this._questCards[i];
            card.targetPosition = new Phaser.Geom.Point(Config.screen.width * 0.31 + i * (-50 * Config.DPR), Config.questCard.startY);
        }

        const card = this._questCards[0];
        // console.log('Activating card', card?.quest.uuid);
        card?.activate(primed);
    }

    private createCharAndDice(type: CharType, x: number) {
        const char = new Char(this, type)
            .setPosition(x, Config.screen.height * 1.15);

        if (this._charsLayer)
            this._charsLayer.add(char);

        this._chars.push(char);
    }

    private throwAllDice() {
        // Actual dice "throw" (get new random values)
        for (const char of this._chars) {
            char.throwAllDice();
        }

        const timeline = gsap.timeline({
            defaults: {
                duration: 0.4,
                ease: Power3.easeOut,
            },
            onStart: () => {
                Game.preventAllInteractions = true;
            },
            onComplete: () => {
                Game.preventAllInteractions = false;
            },
        });

        for (const char of this._chars) {
            let diceWidth = Config.diceSize * char.diceEntities.length + Config.diceSize * 0.25 * (char.diceEntities.length - 1);
            let startX = char.x + Config.diceSize / 2 - diceWidth / 2;

            for (let i = 0; i < char.diceEntities.length; i++) {
                const dice = char.diceEntities[i];
                timeline.fromTo(
                    dice,
                    // Start values
                    {
                        x: startX + i * Config.diceSize * 1.25,
                        y: Config.screen.height + Config.diceSize * 0.75,
                        rotation: Math.PI,
                    },
                    // End values
                    {
                        x: startX + i * Config.diceSize * 1.25 + Math.random() * Config.dicePosition * 2 - Config.dicePosition,
                        y: Config.screen.height - Config.diceSize + Math.random() * Config.dicePosition * 2 - Config.dicePosition,
                        rotation: Math.PI * (Math.random() * Config.diceRotation * 2 - Config.diceRotation),
                        onStart: () => {
                            this._diceLayer?.add(dice);
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

    update(time: number, delta: number) {
        // Update all chars (and their dice)
        for (let i = 0; i < this._chars.length; i++) {
            const char = this._chars[i];
            char.update();
        }

        // Update main quest card
        this._mainQuestCard?.update(time);

        // Update all quest cards
        for (let i = 0; i < this._questCards.length; i++) {
            const card = this._questCards[i];
            card.update(time);
        }

        // Update UI
        this._stageBar?.update();
        if (this._stageBar)
            this._fameDisplay?.updateValue(this._stageBar.score);
        if (this._mainQuestCard)
            this._turnsDisplay?.updateValue(this._mainQuestCard.quest.turnsRemaining);
    }

    private getQuestCardFromUUID(uuid: string): QuestCard | undefined {
        for (const card of this._questCards) {
            if (card.quest.uuid === uuid)
                return card;
        }
        return undefined;
    }

    private deleteQuestCardFromUUID(uuid: string): QuestCard | undefined {
        const card = this.getQuestCardFromUUID(uuid);
        this._questCards = this._questCards.filter((card) => card.quest.uuid !== uuid);
        return card;
    }

    private onDiceUsed() {
        let allDiceUsed = true;
        for (const char of this._chars) {
            for (const dice of char.diceEntities) {
                if (dice.visible)
                    allDiceUsed = false;
            }
        }
        // Automatically end turn
        if (allDiceUsed)
            this.endTurn();
    }

    private useRemainingDice() {
        const slot = this._mainQuestCard?.getSlot();
        if (!slot)
            return;

        // Filter and sort dice
        let sortedDice: Array<Dice> = [];
        for (const char of this._chars) {
            for (let i = 0; i < char.diceEntities.length; i++) {
                const dice = char.diceEntities[i];
                // If dice was used already, skip it
                if (!dice.visible || !slot.isDiceValid(dice))
                    continue;
                sortedDice.push(dice);
            }
        }
        sortedDice.sort((a, b) => b.dice.currentValue - a.dice.currentValue);

        // Prepare timeline
        const timeline = gsap.timeline({
            defaults: {
                rotation: -Math.PI * 2,
                duration: 0.4,
                ease: Power3.easeOut,
            },
            onStart: () => {
                Game.preventAllInteractions = true;
            },
            onComplete: () => {
                Game.preventAllInteractions = false;
            },
        });

        // Animate all dice
        for (const dice of sortedDice) {
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

    private onEndTurn() {
        // console.log("onEndTurn");

        this.throwAllDice();
    }

    private onQuestCompleted(uuid: string) {
        console.log('Detected quest completed!', uuid);

        // Get target quest card
        const card = this.getQuestCardFromUUID(uuid);
        // Queue rewards for success
        if (card?.rewardsForSuccess)
            Rewards.getInstance().queue(card?.rewardsForSuccess, card.quest);

        // Delete quest and activate the next
        this.deleteQuestAndActivateNext(uuid, true);
    }

    private onQuestFailed(uuid: string) {
        console.log('Detected quest failed!', uuid);

        // Get target quest card
        const card = this.getQuestCardFromUUID(uuid);
        // Queue rewards for fail
        if (card?.rewardsForFail)
            Rewards.getInstance().queue(card?.rewardsForFail, card.quest);

        // Delete quest and activate the next
        this.deleteQuestAndActivateNext(uuid, false);
    }

    private deleteQuestAndActivateNext(uuid: string, success: boolean) {
        const card = this.deleteQuestCardFromUUID(uuid);

        if (card) {
            card.isBeingDestroyed = true;
            gsap.to(card, {
                y: success ? `-=${Config.questCard.height * 2}` : `+=${Config.questCard.height * 2}`,
                rotation: success ? `-=${Math.PI * 0.2}` : `+=${Math.PI * 0.2}`,
                alpha: 0,
                duration: 0.5,
                onComplete: () => {
                    card?.destroy();
                    this.activateNextQuest(!success);// Prime if previous quest failed
                }
            });
        }
        else
            this.activateNextQuest(!success);// Prime if previous quest failed
    }

    private shutdown() {
        EventManager.off(Events.END_TURN);
        EventManager.off(Events.QUEST_COMPLETED);
        EventManager.off(Events.QUEST_FAILED);
        EventManager.off(Events.REQUIREMENT_PROGRESS);
        EventManager.off(Events.REQUIREMENT_COMPLETED);

        this.events.off(Phaser.Scenes.Events.SHUTDOWN);
    }
}
