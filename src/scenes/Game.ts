import { Scene } from 'phaser';
import { Random } from '../Random';
import { Colors, Config } from '../config';
import { Dice } from '../entities/Dice';
import { Slot } from '../entities/Slot';
import { DiceStruct } from '../struct/DiceStruct';
import { Char } from '../entities/Char';
import { CharType } from '../struct/CharStruct';

export class Game extends Scene {
    private _chars: Array<Char> = [];

    // Layers
    private _charsLayer: Phaser.GameObjects.Container;
    private _diceLayer: Phaser.GameObjects.Container;
    private _uiLayer: Phaser.GameObjects.Container;

    constructor() {
        super('Game');
    }

    create() {
        // this.cameras.main.setBackgroundColor(0x00ff00);

        this._charsLayer = this.add.container();
        this._diceLayer = this.add.container();
        this._uiLayer = this.add.container();

        Random.getInstance().setSeed('make me laugh');

        let c = 1;
        for (const [, value] of Object.entries(CharType)) {
            const char = new Char(this, value);
            char.setPosition(c * 400 - 100, Config.screenHeight);
            this._charsLayer.add(char);
            this._chars.push(char);

            char.throwAllDice();

            let diceWidth = Config.diceSize * char.diceEntities.length + Config.diceSize * 0.25 * (char.diceEntities.length - 1);
            let startX = char.x + Config.diceSize / 2 - diceWidth / 2;
            for (let i = 0; i < char.diceEntities.length; i++) {
                const dice = char.diceEntities[i];
                dice.setPosition(startX + i * Config.diceSize * 1.25, char.y - Config.diceSize * 0.75);
                this._diceLayer.add(dice);
            }
            c++;
        }

        /* const s1 = new Slot(this, 2)
            .setPosition(900, 300);
        this.add.existing(s1); */

        /* const s2 = new Slot(this, 3)
            .setPosition(900, 450);
        this.add.existing(s2); */

        /* const c = this.add.container(0, 0);
        for (let i = 0; i < 9; i++) {
            const d = new Dice(this, new DiceStruct())
                .setPosition(200 + i * 64, 200);
            c.add(d);
        } */

        const t = this.add.text(
            Config.screenWidth * 0.5,
            Config.screenHeight - 32, 'Game', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.scene.start('GameOver');
            });
    }

    update(time: number, delta: number) {
        for (let i = 0; i < this._chars.length; i++) {
            const char = this._chars[i];
            char.update();
        }
    }
}
