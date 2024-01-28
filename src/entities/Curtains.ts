import { Config } from "../config";

export class Curtains extends Phaser.GameObjects.Container {
    private _leftParts: Array<Phaser.GameObjects.Sprite>;
    private _rightParts: Array<Phaser.GameObjects.Sprite>;

    constructor(scene: Phaser.Scene) {
        super(scene);

        const scale = 1.04;

        this._leftParts = [
            new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'scene', 'Rideau_Scene_1.png')
                .setTint(0x676AA2)
                .setScale(scale),
        ];
        this._rightParts = [
            new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'scene', 'Rideau_Scene_1.png')
                .setTint(0x676AA2)
                .setScale(-scale, scale),
        ];

        for (let i = 0; i < this._leftParts.length; i++) {
            const curtain = this._leftParts[i];
            curtain.x = -Config.screen.width * 0.5;
            this.add(curtain);
        }
        for (let i = 0; i < this._rightParts.length; i++) {
            const curtain = this._rightParts[i];
            curtain.x = Config.screen.width * 0.5;
            this.add(curtain);
        }
    }
}