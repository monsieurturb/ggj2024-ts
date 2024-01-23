import { Dice } from "./Dice";

export class Slot extends Phaser.GameObjects.Container {
    private zone: Phaser.GameObjects.Zone;
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;

    private diceEntities: Map<string, Dice>;

    private spaces: number;

    constructor(scene: Phaser.Scene, spaces: number = 1) {
        super(scene);

        this.spaces = spaces;
        this.width = 64 * this.spaces;
        this.height = 64;

        this.diceEntities = new Map<string, Dice>();

        this.zone = new Phaser.GameObjects.Zone(this.scene, 0, 0, this.width, this.height)
            .setRectangleDropZone(this.width, this.height);

        this.background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.width, this.height, 0xFFFF00, 0.25)
            .setStrokeStyle(4, 0xFFFF00)
            .setOrigin(0.5, 0.5);

        this.text = new Phaser.GameObjects.Text(this.scene, -this.width / 2, this.height / 2 + 5, "In slot:", {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF',
            // stroke: '#FFCC00',
            // strokeThickness: 6,
        });
        this.text.setOrigin(0, 0);

        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(-this.background.width / 2, -this.background.height / 2, this.background.width, this.background.height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            dropZone: true,
        }, Phaser.Geom.Rectangle.Contains);

        this.add([
            this.background,
            this.zone,
            this.text,
        ]);

        // this.scene.input.on(Phaser.Input.Events.DROP, this.onDrop.bind(this));
        // this.scene.input.on(Phaser.Input.Events.DRAG_ENTER, this.onDragEnter.bind(this));
    }

    /* onDrop(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, target: Phaser.GameObjects.Zone) {
        // If target is not this Slot's Zone or gameObject is not a Dice, return
        if (target != this.zone ||
            !(gameObject instanceof Dice))
            return;

        const dice = gameObject as Dice;
        console.log("DROPPED:", dice.currentValue);
    } */

    addDice(diceEntity: Dice) {
        if (!this.diceEntities.has(diceEntity.uuid)) {
            this.diceEntities.set(diceEntity.uuid, diceEntity);
            // console.log("Dice added to slot", dice.currentValue);
        }
        // else
        // console.log("Dice already in slot");

        this.updateText();
    }

    removeDice(diceEntity: Dice) {
        const result = this.diceEntities.delete(diceEntity.uuid);
        /* if (!result)
            console.log("Dice not in slot");
        else
            console.log("Dice removed from slot", dice.currentValue); */

        this.updateText();
    }

    private updateText() {
        const a: Array<Dice> = Array.from(this.diceEntities.values());
        this.text.text = `In slot: ${a.map((d) => d.currentValue).join(",")}`;
        this.text.text += `\nTotal: ${a.reduce((total, dice) => total + dice.currentValue, 0)}`;
    }
}