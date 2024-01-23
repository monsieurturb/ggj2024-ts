import { CharStruct, CharType } from "../struct/CharStruct";
import { Dice } from "./Dice";

export class Char extends Phaser.GameObjects.Container {
    // Actual char class
    private _char: CharStruct;
    // Expose some of the dice properties, keep the rest private
    public get uuid(): string { return this._char.uuid; }
    public get charType(): string { return this._char.type; }

    public diceEntities: Array<Dice> = [];

    constructor(scene: Phaser.Scene, type: CharType) {
        super(scene);

        // Create this char's struct
        this._char = new CharStruct(type);

        // Create the dice entities from this char's dice pool
        for (let i = 0; i < this._char.dicePool.length; i++) {
            const dice = this._char.dicePool[i];
            this.diceEntities.push(new Dice(this.scene, dice));
        }
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
}