import { Scene } from 'phaser';
import { Config, Fonts } from '../config';

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        // this.add.image(512, 384, 'background');

        // this.add.image(512, 300, 'logo');

        const styleDark = {
            color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            fontFamily: Fonts.MAIN,
            fontSize: 32,
            align: 'center'
        }

        this.add.text(
            Config.screen.width * 0.5,
            Config.screen.height - 32,
            'Main Menu', styleDark).setOrigin(0.5, 1);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
