import { Scene } from 'phaser';
import { Random } from '../Random';
import { Config } from '../config';
import { Dice } from '../entities/Dice';
import { Slot } from '../entities/Slot';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        // this.cameras.main.setBackgroundColor(0x00ff00);

        // Random.getInstance().setSeed('test');

        const s1 = new Slot(this, 2)
            .setPosition(900, 300);
        this.add.existing(s1);

        const s2 = new Slot(this, 3)
            .setPosition(900, 450);
        this.add.existing(s2);

        const c = this.add.container(0, 0);
        for (let i = 0; i < 4; i++) {
            const d = new Dice(this)
                .setPosition(200 + i * 64, 200)
                .throw();
            c.add(d);
        }

        for (let i = 0; i < 4; i++) {
            const d = new Dice(this)
                .setPosition(200 + i * 64, 400)
                .throw();
            this.add.existing(d);
        }

        this.add.text(
            Config.screenWidth * 0.5,
            Config.screenHeight * 0.5, 'Game', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // this.input.on(Phaser.Input.Events.DRAG_START, this.onDragStart.bind(this));
        // this.input.on(Phaser.Input.Events.DRAG, this.onDrag);

        /* this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        }); */
    }

    /* onDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        this.children.bringToTop(gameObject);
    }

    onDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Components.Transform, dragX: number, dragY: number) {
        gameObject.setPosition(dragX, dragY);
    } */
}
