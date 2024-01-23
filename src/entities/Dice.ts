import { Colors, Config } from "../config";
import { CharType } from "../struct/CharStruct";
import { DiceStruct } from "../struct/DiceStruct";
import { Slot } from "./Slot";

export class Dice extends Phaser.GameObjects.Container {
    // Actual dice class
    private _dice: DiceStruct;
    // Expose some of the dice properties, keep the rest private
    public get uuid(): string { return this._dice.uuid; }
    public get currentValue(): number { return this._dice.currentValue; }

    // Graphics objects
    private _background: Phaser.GameObjects.Rectangle | undefined;
    private _text: Phaser.GameObjects.Text | undefined;

    private _shiftKey: Phaser.Input.Keyboard.Key | undefined;

    constructor(scene: Phaser.Scene, dice: DiceStruct) {
        super(scene);

        this._dice = dice;

        this.createGraphics();
        this.setupBehaviour();
    }

    getColor() {
        switch (this._dice.type) {
            case CharType.TYPE_A: return Colors.DARK;
            case CharType.TYPE_B: return Colors.LIGHT;
            case CharType.TYPE_C: return Colors.PINK;
            default: return 0xFFFFFF;
        }
    }

    createGraphics() {
        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, Config.diceSize, Config.diceSize, this.getColor())
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5, 0.5);

        this._text = new Phaser.GameObjects.Text(this.scene, 0, 0, "", {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#000000',
        })
            .setOrigin(0.5, 0.5);

        this.add([
            this._background,
            this._text,
        ]);
    }

    setupBehaviour() {
        if (!this._background)
            return;

        // Set interactive
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -this._background.width * 0.5,
                -this._background.height * 0.5,
                this._background.width,
                this._background.height
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: true,
            useHandCursor: true,
        }, Phaser.Geom.Rectangle.Contains);

        // Setup Shift key
        if (this.scene.input && this.scene.input.keyboard)
            this._shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Click
        this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown);

        // Drag & drop
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.onDragStart);
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG, this.onDrag);
        // this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.onDragEnd);
        this.on(Phaser.Input.Events.GAMEOBJECT_DROP, this.onDrop);// Triggers only if dropped on a Zone
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_ENTER, this.onDragEnter);
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_LEAVE, this.onDragLeave);
    }

    update() {
        if (this._text)
            this._text.text = this._dice.displayValue;
    }

    onPointerDown(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
        if (this._shiftKey!.isDown)
            this._dice.throw();

        event.stopPropagation();
    }

    onDragStart(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        const parent = this.parentContainer || this.scene.children;
        parent.bringToTop(this);
    }

    onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        this.setPosition(dragX, dragY);
    }

    onDragEnd(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) { }

    private isValidTarget(target: Phaser.GameObjects.GameObject) {
        // Check if target is a Zone, has a parent and parent is a Slot
        return target instanceof Phaser.GameObjects.Zone &&
            target.parentContainer &&
            target.parentContainer instanceof Slot;
    }

    onDrop(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject) {
        if (!this.isValidTarget(target)) {
            console.log(this.input, this.input?.dragStartX);
            this.setPosition(this.input?.dragStartX, this.input?.dragStartY);
            return;
        }
    }

    onDragEnter(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject) {
        if (!this.isValidTarget(target))
            return;

        const slot = target.parentContainer as Slot;
        slot.addDice(this);
    }

    onDragLeave(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject) {
        if (!this.isValidTarget(target))
            return;

        const slot = target.parentContainer as Slot;
        slot.removeDice(this);
    }
}