import { Scene } from 'phaser';
import { Config } from '../config';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        // this.cameras.main.setBackgroundColor(0x00ff00);

        this.add.text(
            Config.screenWidth * 0.5,
            Config.screenHeight * 0.5, 'Game', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        });
    }
}
