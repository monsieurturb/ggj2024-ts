import { Colors, Config } from "../config";

export class StageBarIcon extends Phaser.GameObjects.Container {
    protected _background: Phaser.GameObjects.Ellipse;
    protected _overlapBorder: Phaser.GameObjects.Rectangle;
    protected _overlap: Phaser.GameObjects.Rectangle;
    protected _icon: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene) {
        super(scene);

        this._background = new Phaser.GameObjects.Ellipse(
            this.scene,
            0, 0,
            Config.stageBar.height * 1.5, Config.stageBar.height * 1.5,
            Colors.LIGHT
        )
            .setOrigin(1, 0.5)
            .setStrokeStyle(3 * Config.DPR, Colors.WHITE);

        this._overlapBorder = new Phaser.GameObjects.Rectangle(
            this.scene,
            0, 0,
            Config.stageBar.height * 0.75,
            Config.stageBar.height,
        )
            .setOrigin(0, 0.5)
            .setPosition(-this._background.width * 0.5, 2 * Config.DPR)
            .setStrokeStyle(3 * Config.DPR, Colors.WHITE);

        this._overlap = new Phaser.GameObjects.Rectangle(
            this.scene,
            0, 0,
            Config.stageBar.height * 0.75 + 3 * Config.DPR,
            Config.stageBar.height - 3 * Config.DPR,
            Colors.LIGHT
        )
            .setOrigin(0, 0.5)
            .setPosition(-this._background.width * 0.5, 2 * Config.DPR);

        this._icon = new Phaser.GameObjects.Image(this.scene, 0, 0, 'ui', 'Picto_Smile.png')
            .setPosition(-this._background.width * 0.5, 2 * Config.DPR)
            .setScale(0.45);

        this.add([
            this._overlapBorder,
            this._background,
            this._overlap,
            this._icon,
        ]);
    }

    update(time: number) {
        const r = 0.1 * Math.sin(time / 300);// amplitude * sin(time / freq)
        this._icon.setRotation(r);
    }
}