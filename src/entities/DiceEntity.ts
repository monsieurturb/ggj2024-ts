export class DiceEntity extends Phaser.GameObjects.Container {

    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 48, 48, 0xFFFFFF);
        this.background.setStrokeStyle(4, 0x000000);
        this.background.setOrigin(0.5, 0.5);

        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, "", {
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

        // if (this.scene.input && this.scene.input.keyboard)
        // this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown);
        // this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.onDragStart);
        // this.on(Phaser.Input.Events.GAMEOBJECT_DRAG, this.onDrag);
        // this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.onDragEnd);
        // this.on(Phaser.Input.Events.GAMEOBJECT_DROP, this.onDrop);// Triggers only if dropped on a Zone
        // this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_ENTER, this.onDragEnter);
        // this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_LEAVE, this.onDragLeave);
    }
}
