import { Scene } from 'phaser';
import { Config } from '../config';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        // this.cameras.main.setBackgroundColor(0xff0000);

        this.add.text(
            Config.screenWidth * 0.5,
            Config.screenHeight - 32, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
