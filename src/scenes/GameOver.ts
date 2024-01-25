import { Scene } from 'phaser';
import { Config } from '../config';

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    create() {
        this.add.text(
            Config.screen.width * 0.5,
            Config.screen.height - 32,
            'Game Over', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5, 1);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
