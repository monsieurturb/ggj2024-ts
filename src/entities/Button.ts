import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import { Colors, Config, Fonts } from '../config';

export class Button extends Phaser.GameObjects.Container {
    protected _background: RoundRectangle;
    protected _label: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, text: string, fontSize: number, color: string, bgColor: number) {
        super(scene);

        this._label = new Phaser.GameObjects.Text(
            this.scene,
            0, 0,
            text,
            Fonts.getStyle(fontSize, color, Fonts.MAIN),
        )
            .setAlign('center')
            .setOrigin(0.5, 0.5);

        this._background = new RoundRectangle(
            this.scene,
            0, 0,
            this._label.width + 40 * Config.DPR, this._label.height + 15 * Config.DPR,
            10,
            Colors.WHITE, 0.35
        );

        this.add([
            this._background,
            this._label,
        ]);

        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -this._background.width * 0.5,
                -this._background.height * 0.5,
                this._background.width,
                this._background.height
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        }, Phaser.Geom.Rectangle.Contains);
    }
}