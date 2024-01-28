import { Scene } from 'phaser';
import { Colors, Config, Fonts } from '../config';
import { Game } from './Game';

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    create() {
        this.add.image(0, 0, 'screens', 'ScreenOutro_UI.png').setOrigin(0, 0);

        this.add.text(
            Config.screen.width * 0.5,
            Config.screen.height * 0.5 + 55 * Config.DPR,
            Game.score.toFixed(),
            Fonts.getStyle(128, Colors.WHITE_HEX, Fonts.MAIN)
        )
            .setAlign('center')
            .setOrigin(0.5, 0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
