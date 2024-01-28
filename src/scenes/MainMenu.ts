import { Scene } from 'phaser';
import { Colors, Config, Fonts } from '../config';

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        this.add.image(0, 0, 'screens', 'ScreenIntro_UI.png').setOrigin(0, 0);

        this.add.text(
            Config.screen.width * 0.5,
            25 * Config.DPR,
            'Global Game Jam 2024\nA game by [...]',
            Fonts.getStyle(22, Colors.WHITE_HEX, Fonts.TEXT)
        )
            .setAlign('center')
            .setOrigin(0.5, 0);

        this.input.once('pointerdown', () => {
            this.sound.setVolume(0.666);
            this.sound.play('main_theme');
            this.scene.start('Game');
        });

        this.sound.setVolume(1);
        // this.sound.play('main_theme');
    }
}
