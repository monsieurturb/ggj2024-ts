import { Colors, Config, Fonts } from "../config";
import { EventManager, Events } from "../managers/Events";
import { Random } from "../managers/Random";
import { clamp, ilerp, lerp } from "../utils";
import { StageBarIcon } from "./StageBarIcon";
import { StageLock, StageLockStruct } from "./StageLock";

export class StageBar extends Phaser.GameObjects.Container {
    // Graphics objects
    protected _nameText: Phaser.GameObjects.Text;
    protected _background: Phaser.GameObjects.Rectangle;
    protected _bar: Phaser.GameObjects.Rectangle;
    protected _icon: StageBarIcon;
    protected _locksLayer: Phaser.GameObjects.Container;
    protected _locks: Array<StageLock> = [];

    protected _stageLevel: number = 0;
    protected _stage: StageStruct;
    protected _totalScore: number = 0;
    public get score() { return this._totalScore; }

    constructor(scene: Phaser.Scene) {
        super(scene);

        // Base graphics
        this._nameText = new Phaser.GameObjects.Text(
            this.scene,
            0,
            -65 * Config.DPR,
            "",
            Fonts.getStyle(32, Colors.WHITE_HEX, Fonts.MAIN)
        )
            .setAlign('center')
            .setOrigin(0.5, 0);

        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0);
        this._bar = new Phaser.GameObjects.Rectangle(this.scene, 0, 0);

        this._icon = new StageBarIcon(this.scene);

        this._locksLayer = new Phaser.GameObjects.Container(this.scene, 0, 0);

        this.add([
            this._nameText,
            this._background,
            this._icon,
            this._bar,
            this._locksLayer,
        ]);

        this._totalScore = 0;

        // Init first stage
        this._stageLevel = 0;
        this._stage = new StageStruct(this._stageLevel);
        this.resetGraphics();

        // Listen to quest events
        EventManager.on(Events.MAIN_QUEST_PROGRESS, this.onMainQuestProgress.bind(this));
        EventManager.on(Events.QUEST_COMPLETED, this.onQuestCompleted.bind(this));
    }

    resetGraphics() {
        const size = Config.stageBar.width * clamp(0.6, 1, 0.6 + 0.1 * this._stageLevel);

        // Update stage name
        if (this._nameText)
            this._nameText.text = this._stage.name;

        // Icon
        this._icon.setPosition(-size * 0.5 - 1 * Config.DPR, -2 * Config.DPR);

        // Bar
        this._background?.setSize(size, Config.stageBar.height)
            .setFillStyle(Colors.WHITE, 0.25)
            .setStrokeStyle(3 * Config.DPR, Colors.WHITE)
            .setOrigin(0, 0.5)
            .setPosition(-size * 0.5, 0);

        this._bar?.setSize(size - 1 * Config.DPR, Config.stageBar.height - 3 * Config.DPR)
            .setFillStyle(Colors.GOLD)
            .setOrigin(0, 0.5)
            .setPosition(-size * 0.5, 0)
            .setScale(0, 1);

        // Destroy existing locks
        while (this._locks.length > 0) {
            const lock = this._locks.pop();
            lock?.destroy();
        }

        // Create new locks
        for (const lock of this._stage.locks) {
            let x = ilerp(0, this._stage.total, lock.cap);
            x = lerp(-size * 0.5, size * 0.5, x);
            const stageLock = new StageLock(this.scene, lock)
                .setPosition(x, 0);
            this._locksLayer.add(stageLock);
            this._locks.push(stageLock);
        }
    }

    startNextStage() {
        console.log('startNextStage');

        this._stageLevel++;
        this._stage = new StageStruct(this._stageLevel);
        this.resetGraphics();
    }

    update(time: number) {
        // Bar progress
        if (this._bar) {
            const targetScale = lerp(this._bar.scaleX, this._stage.progress, 0.35);
            this._bar?.setScale(targetScale, 1);
        }

        // Locks
        for (const lock of this._locks)
            lock.update();

        // Icon
        // this._icon.update(time);
    }

    onQuestCompleted() {
        const wasComplete = this._stage.isComplete;
        this._stage.decrementLock();

        if (!wasComplete && this._stage.isComplete)
            EventManager.emit(Events.STAGE_COMPLETED);
    }

    onMainQuestProgress(value: number) {
        const wasComplete = this._stage.isComplete;
        const added = this._stage.add(value);
        this._totalScore += added;

        if (!wasComplete && this._stage.isComplete)
            EventManager.emit(Events.STAGE_COMPLETED);
    }
}

export class StageStruct {
    static levels = [1, 2, 3, 5, 10, 12, 14];
    static names = [
        "Hamlet Tavern",
        "Village Tavern",
        "Town Tavern",
        "City Tavern",
        "Capital Tavern",
    ];

    readonly uuid: string;

    private _level: number;
    private _name: string;
    public get name() { return this._name; }
    private _total: number;
    public get total() { return this._total; }
    private _current: number;
    public get score() { return this._current };
    public get progress() { return clamp(0, 1, this._current / this._total); };
    public get isComplete() { return !this.getCurrentLock() && this._current >= this._total; };

    private _locks: Array<StageLockStruct> = [];
    public get locks() { return this._locks; }

    constructor(level: number) {
        this.uuid = Random.getInstance().uuid();

        // Calculate mult
        this._level = Math.max(level, 0);
        const mult = this._level < StageStruct.levels.length ?
            StageStruct.levels[this._level] :
            StageStruct.levels[StageStruct.levels.length - 1] + 4 * (this._level - StageStruct.levels.length + 1);

        // Get name
        this._name = StageStruct.names[Math.min(this._level, StageStruct.names.length - 1)];

        // Init values
        this._total = Config.stageBaseDifficulty * mult;
        this._current = 0;

        // Setup locks
        this._locks = [];
        this.setupLocks();
    }

    setupLocks() {
        const count = this._level + 1;
        const extra = 0;//2

        // Add the progress locks
        if (count > 1) {
            const step = Math.floor(this._total / count);
            for (let i = 1; i < count; i++)
                this._locks.push(new StageLockStruct(this._level + extra, step * i));
        }

        // Add the last lock
        this._locks.push(new StageLockStruct(this._level + extra, this._total));
    }

    getCurrentLock() {
        for (const lock of this._locks) {
            if (!lock.isOpen)
                return lock;
        }
        return false;
    }

    add(value: number): number {
        const prevScore = this._current;

        const lock = this.getCurrentLock();
        if (lock)
            this._current = clamp(0, lock.cap, this._current + value);
        else
            this._current += value;

        return this._current - prevScore;
    }

    decrementLock() {
        const lock = this.getCurrentLock();
        if (lock)
            lock.updateCount();
    }
}