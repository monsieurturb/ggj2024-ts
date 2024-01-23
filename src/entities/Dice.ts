import { Random } from "../Random";
import { Slot } from "./Slot";

export class Dice extends Phaser.GameObjects.Container {
    readonly sides: Array<number>;
    readonly uuid: string;

    private currentSide: number = 0;
    public get currentValue(): number {
        return this.sides[this.currentSide];
    }

    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;

    private shiftKey: Phaser.Input.Keyboard.Key | undefined;

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.uuid = Random.getInstance().uuid();
        this.sides = [1, 2, 3, 4, 5, 6];

        this.background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 48, 48, 0xFFFFFF);
        this.background.setStrokeStyle(4, 0x000000);
        this.background.setOrigin(0.5, 0.5);

        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, this.currentValue.toFixed(), {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#000000',
            // stroke: '#FFCC00',
            // strokeThickness: 6,
        });
        this.text.setOrigin(0.5, 0.5);
        this.add([
            this.background,
            this.text,
        ]);

        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(-this.background.width / 2, -this.background.height / 2, this.background.width, this.background.height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: true,
            useHandCursor: true,
        }, Phaser.Geom.Rectangle.Contains);

        if (this.scene.input && this.scene.input.keyboard)
            this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown);
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.onDragStart);
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG, this.onDrag);
        // this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.onDragEnd);
        this.on(Phaser.Input.Events.GAMEOBJECT_DROP, this.onDrop);// Triggers only if dropped on a Zone
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_ENTER, this.onDragEnter);
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_LEAVE, this.onDragLeave);
    }

    onPointerDown(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
        if (this.shiftKey!.isDown)
            this.throw();

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

    throw() {
        this.currentSide = Random.getInstance().integerInRange(0, this.sides.length - 1);
        this.text.text = this.currentValue.toFixed();
        return this;
    }
} 6