import { Colors, Config, Fonts } from "../config";
import { CharStruct, CharType } from "../struct/CharStruct";
import { Dice } from "./Dice";

export class Char extends Phaser.GameObjects.Container {
    // Actual char class
    private _char: CharStruct;
    // Expose some of the dice properties, keep the rest private
    public get char() { return this._char; }

    // Graphics objects
    private _background: Phaser.GameObjects.Rectangle;

    public diceEntities: Array<Dice> = [];

    constructor(scene: Phaser.Scene, type: CharType) {
        super(scene);

        // Create this char's struct
        this._char = new CharStruct(type);

        const color = (() => {
            switch (this.char.type) {
                case CharType.BARD: return Colors.DARK;
                case CharType.POET: return Colors.LIGHT;
                case CharType.MIMO: return Colors.PINK;
                default: return 0xFFFFFF;
            }
        })();

        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 300 * Config.DPR, 600 * Config.DPR, color, 0.35)
            .setStrokeStyle(4 * Config.DPR, 0x000000)
            .setOrigin(0.5, 1);

        const t = new Phaser.GameObjects.Text(this.scene, 0, -300 * Config.DPR, this.char.type, {
            fontFamily: Fonts.MAIN,
            fontSize: 28 * Config.DPR,
            color: '#000000',
        })
            .setOrigin(0.5, 0.5);

        this.add([
            this._background,
            t,
        ]);

        // Create the dice entities from this char's dice pool
        for (const dice of this._char.dicePool)
            this.diceEntities.push(new Dice(this.scene, dice));
    }

    update() {
        for (let i = 0; i < this.diceEntities.length; i++) {
            const dice = this.diceEntities[i];
            dice.update();
        }
    }

    throwAllDice() {
        for (let i = 0; i < this._char.dicePool.length; i++) {
            const dice = this._char.dicePool[i];
            dice.throw();
        }
    }

    addDice(n: number) {
        // Add to dice to pool
        const newDice = this._char.addDice(n);
        // Create the new dice entities
        for (const dice of newDice)
            this.diceEntities.push(new Dice(this.scene, dice));
    }

    removeDice(n: number) {
        // Remove dice from pool
        const oldDice = this._char.removeDice(n);
        // Delete the old dice entities
        const oldUUIDs = oldDice.map((dice) => dice?.uuid);
        const oldDiceEntities = this.diceEntities.filter((dice) => oldUUIDs.includes(dice.dice.uuid));
        for (const dice of oldDiceEntities)
            dice.destroy();
        this.diceEntities = this.diceEntities.filter((dice) => !oldUUIDs.includes(dice.dice.uuid));
    }
}