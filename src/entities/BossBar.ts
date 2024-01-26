import { Colors, Config } from "../config";

export class BossBar extends Phaser.GameObjects.Container {
    // Graphics objects
    protected _background: Phaser.GameObjects.Rectangle | undefined;
    protected _bar: Phaser.GameObjects.Rectangle | undefined;

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.createGraphics();
        this.setProgress(0);
    }

    createGraphics() {
        this._background = new Phaser.GameObjects.Rectangle(
            this.scene,
            0, 0,
            Config.bossBar.width,
            Config.bossBar.height,
            Colors.DARK
        )
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5, 0.5);

        this._bar = new Phaser.GameObjects.Rectangle(
            this.scene,
            this._background.x - this._background.width * 0.5,
            this._background.y,
            Config.bossBar.width,
            Config.bossBar.height - 6,
            Colors.PINK
        )
            .setOrigin(0, 0.5);

        this.add([
            this._background,
            this._bar,
        ]);
    }

    setProgress(progress: number) {
        this._bar?.setScale(progress, 1);
    }
}