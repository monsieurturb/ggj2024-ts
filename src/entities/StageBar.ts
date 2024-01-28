import { Colors, Config } from "../config";
import { EventManager, Events } from "../managers/Events";
import { Random } from "../managers/Random";
import { clamp, ilerp, lerp } from "../utils";
import { StageLock, StageLockStruct } from "./StageLock";

export class StageBar extends Phaser.GameObjects.Container {
    // Graphics objects
    protected _background: Phaser.GameObjects.Rectangle | undefined;
    protected _bar: Phaser.GameObjects.Rectangle | undefined;
    protected _locksLayer: Phaser.GameObjects.Container;
    protected _locks: Array<StageLock> = [];

    protected _stageLevel: number = 0;
    protected _stage: StageStruct;
    protected _totalScore: number = 0;
    public get score() { return this._totalScore; }

    constructor(scene: Phaser.Scene) {
        super(scene);

        // Base graphics
        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0);
        this._bar = new Phaser.GameObjects.Rectangle(this.scene, 0, 0);
        this._locksLayer = new Phaser.GameObjects.Container(this.scene, 0, 0);

        this.add([
            this._background,
            this._bar,
            this._locksLayer,
        ]);

        this._totalScore = 0;

        // Init first stage
        this._stageLevel = 3;
        this._stage = new StageStruct(this._stageLevel);
        this.resetGraphics();

        // Listen to quest events
        EventManager.on(Events.MAIN_QUEST_PROGRESS, this.onMainQuestProgress.bind(this));
        EventManager.on(Events.QUEST_COMPLETED, this.onQuestCompleted.bind(this));
    }

    resetGraphics() {
        const size = Config.bossBar.width * clamp(0.6, 1, 0.6 + 0.1 * this._stageLevel);

        this._background?.setSize(size, Config.bossBar.height)
            .setFillStyle(Colors.DARK)
            .setOrigin(0, 0.5)
            .setPosition(-size * 0.5, 0);

        this._bar?.setSize(size, Config.bossBar.height)
            .setFillStyle(Colors.LIGHT)
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
        this._stageLevel++;
        this._stage = new StageStruct(this._stageLevel);
        this.resetGraphics();
    }

    update() {
        if (this._bar) {
            const targetScale = lerp(this._bar.scaleX, this._stage.progress, 0.35);
            this._bar?.setScale(targetScale, 1);
        }
        for (const lock of this._locks) {
            lock.update();
        }
    }

    onQuestCompleted() {
        this._stage.decrementLock();

        if (this._stage.isComplete) {
            console.log('STAGE_COMPLETED');
            EventManager.emit(Events.STAGE_COMPLETED);
        }
    }

    onMainQuestProgress(value: number) {
        const added = this._stage.add(value);
        this._totalScore += added;

        if (this._stage.isComplete) {
            console.log('STAGE_COMPLETED');
            EventManager.emit(Events.STAGE_COMPLETED);
        }
    }
}

export class StageStruct {
    static levels = [1, 2, 3, 5, 10, 12, 14];

    readonly uuid: string;

    private _level: number;
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

        // Init values
        this._total = Config.stageBaseDifficulty * mult;
        this._current = 0;

        // Setup locks
        this._locks = [];
        this.setupLocks();
    }

    setupLocks() {
        const count = this._level + 1;
        const extra = 2;

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