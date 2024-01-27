import { Colors, Fonts } from "../config";
import { Random } from "../managers/Random";

export class StageLock extends Phaser.GameObjects.Container {
    private _lock: StageLockStruct;
    public get lock() { return this._lock; };

    protected _background: Phaser.GameObjects.Rectangle;
    protected _text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, lock: StageLockStruct) {
        super(scene);

        this._lock = lock;

        this._background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 40, 40, Colors.PINK);

        this._text = new Phaser.GameObjects.Text(this.scene, 0, 0, "", {
            fontFamily: Fonts.MAIN,
            fontSize: 24,
            color: '#000000',
            align: 'center',
        })
            .setOrigin(0.5, 0.5);

        this.add([
            this._background,
            this._text,
        ]);
    }

    update() {
        if (!this.visible)
            return;

        this._text.text = this._lock.remaining;

        if (this._lock.isOpen)
            this.setVisible(false);
    }
}

export class StageLockStruct {
    readonly uuid: string;
    private _questsNeeded: number;
    private _questsDone: number;
    public get isOpen() { return this._questsDone >= this._questsNeeded; };
    public get remaining() { return (this._questsNeeded - this._questsDone).toFixed(); };

    readonly cap: number;

    constructor(questsNeeded: number, cap: number) {
        this.uuid = Random.getInstance().uuid();
        this._questsNeeded = questsNeeded;
        this._questsDone = 0;
        this.cap = cap;
    }

    updateCount(count: number = 1) {
        this._questsDone += count;

        if (this.isOpen)
            console.log('lock @' + this.cap, 'is open');
    }
}