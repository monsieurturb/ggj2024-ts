import { Scene } from 'phaser';
import { Colors, Config, Fonts } from '../config';

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        // this.add.image(512, 384, 'background');

        this.add.sprite(512 * Config.DPR, 300 * Config.DPR, 'spritesheet', 'Picto_Smile.png');

        this.add.text(
            Config.screen.width * 0.5,
            Config.screen.height - 32,
            'Main Menu',
            Fonts.getStyle(48, Colors.BLACK_HEX, Fonts.MAIN)
        )
            .setStroke(Colors.WHITE_HEX, 8 * Config.DPR)
            .setAlign('center')
            .setOrigin(0.5, 1);

        // const test = this.add.image(150, 150, 'test');
        // test.setTintFill(Colors.PINK);

        // const back = this.add.image(700, 600, 'back');
        // back.setTint(Colors.PINK);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
