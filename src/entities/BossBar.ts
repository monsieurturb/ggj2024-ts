import { Colors, Config } from "../config";
import { EventManager, Events } from "../managers/Events";

export class BossBar extends Phaser.GameObjects.Container {
    // Graphics objects
    protected _background: Phaser.GameObjects.Rectangle | undefined;
    protected _bar: Phaser.GameObjects.Rectangle | undefined;

    protected _stages: Array<BossStage> = [];
    protected _currentStage: number = 0;

    constructor(scene: Phaser.Scene) {
        super(scene);

        // TODO One stage after the other, with always one lock at the end and [n-1] locks placed evenly

        // Register all stages
        this._stages = [
            new BossStage(Config.stageBaseDifficulty),
            new BossStage(Config.stageBaseDifficulty * 2),
            new BossStage(Config.stageBaseDifficulty * 3),
            new BossStage(Config.stageBaseDifficulty * 5),
            new BossStage(Config.stageBaseDifficulty * 10),
            new BossStage(Config.stageBaseDifficulty * 12),
            new BossStage(Config.stageBaseDifficulty * 14),
            new BossStage(Config.stageBaseDifficulty * 18),
            new BossStage(Config.stageBaseDifficulty * 22),
            // ... +4
        ];

        // Base graphics
        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0);
        this._bar = new Phaser.GameObjects.Rectangle(this.scene, 0, 0);
        this.add([
            this._background,
            this._bar,
        ]);

        // Init first stage
        this._currentStage = 0;
        this.resetGraphics();

        // Listen to main quest
        EventManager.on(Events.MAIN_QUEST_PROGRESS, this.onMainQuestProgress.bind(this));
    }

    resetGraphics() {
        const size = Config.bossBar.width * Phaser.Math.Clamp(0.6 + 0.1 * this._currentStage, 0.6, 1);

        this._background?.setSize(size, Config.bossBar.height)
            .setFillStyle(Colors.DARK)
            .setOrigin(0, 0.5)
            .setPosition(-size * 0.5, 0);

        this._bar?.setSize(size, Config.bossBar.height)
            .setFillStyle(Colors.LIGHT)
            .setOrigin(0, 0.5)
            .setPosition(-size * 0.5, 0)
            .setScale(0, 1);
    }

    update() {
        if (!this._bar)
            return;
        const targetScale = Phaser.Math.Linear(this._bar.scaleX, this._stages[this._currentStage].progress, 0.35);
        this._bar?.setScale(targetScale, 1);
    }

    onMainQuestProgress(value: number) {
        this._stages[this._currentStage].add(value);
    }
}

class BossStage {
    private _total: number;
    private _current: number;
    public get progress() { return Phaser.Math.Clamp(this._current / this._total, 0, 1); };

    constructor(total: number) {
        this._total = total;
        this._current = 0;
    }

    add(value: number) {
        this._current += value;
    }
}