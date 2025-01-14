import { EventManager, Events } from "../managers/Events";
import { Colors, Config, Fonts } from "../config";
import { QuestStruct } from "../struct/QuestStruct";
import { QuestSlot } from "./QuestSlot";
import { QuestReward } from "../struct/QuestReward";
import { Random } from "../managers/Random";
import { gsap, Power3, Elastic } from "gsap";
import { lerp } from "../utils";
import { Rewards } from "../managers/Rewards";

export class QuestCard extends Phaser.GameObjects.Container {
    // Actual quest class
    protected _quest: QuestStruct;
    // Expose some of the quest properties, keep the rest private
    public get quest() { return this._quest; }
    public get uuid() { return this._quest.uuid; }
    public get questName() { return this._quest.name; }
    public get turnsRemaining() { return this._quest.turnsRemaining; }
    public get rewardsForFail() { return this._quest.rewardsForFail; }
    public get rewardsForSuccess() { return this._quest.rewardsForSuccess; }

    // Graphics objects
    protected _back: Phaser.GameObjects.Sprite | undefined;
    protected _text: Phaser.GameObjects.Text | undefined;
    protected _subText: Phaser.GameObjects.Text | undefined;
    protected _slots: Array<QuestSlot> = [];
    protected _turnsText: Phaser.GameObjects.Text | undefined;
    protected _turnsIcon: Phaser.GameObjects.Image | undefined;
    protected _turnsCircle: Phaser.GameObjects.Ellipse | undefined;

    protected _facingUp: boolean;
    protected _boundOnRequirementProgress: ((uuid: string) => void) | undefined;
    protected _boundOnRequirementCompleted: ((uuid: string) => void) | undefined;
    protected _boundOnEndTurn: (() => void) | undefined;

    public targetPosition: Phaser.Geom.Point;
    public isBeingDestroyed: boolean = false;

    constructor(scene: Phaser.Scene, quest: QuestStruct) {
        super(scene);

        this.targetPosition = new Phaser.Geom.Point(this.x, this.y);

        this._quest = quest;

        // Create graphics
        this.createGraphics();

        // Start facing down
        this._facingUp = false;
    }

    createGraphics() {
        this._back = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'ui', 'Carte_Special.png');

        this._text = new Phaser.GameObjects.Text(
            this.scene,
            -this._back.width * 0.5 + (30 * Config.DPR),
            -this._back.height * 0.5 + (17 * Config.DPR),
            "",
            Fonts.getStyle(32, Colors.BLACK_HEX, Fonts.MAIN)
        )
            .setFixedSize(this._back.width, this._back.height)
            .setOrigin(0, 0)
            .setVisible(this._facingUp);

        this._subText = new Phaser.GameObjects.Text(
            this.scene,
            -this._back.width * 0.5 + 30 * Config.DPR,
            -this._back.height * 0.5 + 65 * Config.DPR,
            "",
            Fonts.getStyle(24, Colors.BLACK_HEX, Fonts.TEXT)
        )
            // .setFixedSize(this._back.width - 60 * Config.DPR, this._back.height)
            .setWordWrapWidth(this._back.width - 150 * Config.DPR)
            .setOrigin(0, 0)
            .setVisible(this._facingUp);

        this._turnsText = new Phaser.GameObjects.Text(
            this.scene,
            this._back.width * 0.5 - (45 * Config.DPR),
            -this._back.height * 0.5 + (65 * Config.DPR),
            "",
            Fonts.getStyle(48, Colors.BLACK_HEX, Fonts.MAIN)
        )
            .setOrigin(0.5, 0.5)
            .setVisible(this._facingUp);

        this._turnsIcon = new Phaser.GameObjects.Image(
            this.scene,
            this._turnsText.x - 40 * Config.DPR, this._turnsText.y,
            'ui',
            'Picto_Turn.png',
        )
            .setOrigin(0.5, 0.5)
            .setScale(0.55)
            .setVisible(this._facingUp);

        this._turnsCircle = new Phaser.GameObjects.Ellipse(
            this.scene,
            this._turnsText.x - 22 * Config.DPR, this._turnsText.y,
            95 * Config.DPR, 95 * Config.DPR,
            Colors.SLOT_ANY
        )
            .setVisible(this._facingUp);

        this.add([
            this._back,
            this._text,
            this._subText,
            this._turnsCircle,
            this._turnsIcon,
            this._turnsText,
        ]);
    }

    createSlots() {
        for (let i = 0; i < this._quest.requirements.length; i++) {
            const slot = new QuestSlot(this.scene, this._quest.requirements[i], this._quest.requirements)
                .setVisible(this._facingUp);
            this._slots.push(slot);
        }
        this.placeSlots();
    }

    placeSlots() {
        const w = this._slots[0].width * this._slots.length + 20 * Config.DPR * (this._slots.length - 1);
        for (let i = 0; i < this._slots.length; i++) {
            this._slots[i].x = -w * 0.5 + (i + 0.5) * this._slots[i].width + i * 20 * Config.DPR;
            this._slots[i].y = 57 * Config.DPR;
            this.add(this._slots[i]);
        }
    }

    activate(primed: boolean = false) {
        this._quest.activate(primed);
        this.createSlots();

        // Update texts
        if (this._text)
            this._text.text = this._quest.name;

        if (this._subText) {
            let s = "";
            if (this._quest.rewardsForSuccess.length > 0)
                s = this._quest.rewardsForSuccess.map((r) => Rewards.getInstance().getRewardText(r)).join(", ");
            else if (this._quest.rewardsForFail.length > 0)
                s = "Fail: " + this._quest.rewardsForFail.map((r) => r.type).join(", ");
            this._subText.text = s;
        }

        // Flip to face up
        this.flip();

        this._boundOnRequirementProgress = this.onRequirementProgress.bind(this);
        this._boundOnRequirementCompleted = this.onRequirementCompleted.bind(this);
        this._boundOnEndTurn = this.onEndTurn.bind(this);
        EventManager.on(Events.REQUIREMENT_PROGRESS, this._boundOnRequirementProgress);
        EventManager.on(Events.REQUIREMENT_COMPLETED, this._boundOnRequirementCompleted);
        EventManager.on(Events.END_TURN, this._boundOnEndTurn);
    }

    flip(instant: boolean = false) {
        if (instant) {
            this._facingUp = !this._facingUp;

            this._text?.setVisible(this._facingUp);
            this._subText?.setVisible(this._facingUp);
            this._turnsCircle?.setVisible(this._facingUp);
            this._turnsIcon?.setVisible(this._facingUp);
            this._turnsText?.setVisible(this._facingUp);

            for (const slot of this._slots)
                slot.setVisible(this._facingUp);
        }
        else {
            const timeline = gsap.timeline({
                delay: 0.35,
                defaults: {
                    duration: 0.4,
                    ease: Power3.easeOut,
                }
            });
            timeline.to(this, {
                scaleX: 1.1,
                scaleY: 0,
                onStart: () => {
                    this.targetPosition.y += 250;
                },
                onComplete: () => {
                    this._facingUp = !this._facingUp;

                    this._back?.setTintFill(0xFFFFFF);

                    this._text?.setVisible(this._facingUp);
                    this._subText?.setVisible(this._facingUp);
                    this._turnsCircle?.setVisible(this._facingUp);
                    this._turnsIcon?.setVisible(this._facingUp);
                    this._turnsText?.setVisible(this._facingUp);

                    for (const slot of this._slots)
                        slot.setVisible(this._facingUp);

                    this.targetPosition.y -= 250;
                },
            }).to(this, {
                scaleX: 1,
                scaleY: 1,
            });
        }
    }

    setPosition(x?: number | undefined, y?: number | undefined, z?: number | undefined, w?: number | undefined): this {
        super.setPosition(x, y, z, w);
        if (x)
            this.targetPosition.x = x;
        if (y)
            this.targetPosition.y = y;
        return this;
    }

    update(time: number) {
        if (this.isBeingDestroyed)
            return;

        /* if (this._text)
            this._text.text = this._quest.name; */

        /* if (this._subText) {
            let s = "";
            if (this._quest.rewardsForSuccess.length > 0)
                s = "Success: " + this._quest.rewardsForSuccess.map((r) => Rewards.getInstance().getRewardText(r)).join(", ");
            else if (this._quest.rewardsForFail.length > 0)
                s = "Fail: " + this._quest.rewardsForFail.map((r) => r.type).join(", ");
            this._subText.text = s;
        } */

        if (this._turnsText)
            this._turnsText.text = this.turnsRemaining.toFixed();

        // Lerp to target position
        const x = this.targetPosition.x - this.x;
        const y = this.targetPosition.y - this.y;
        if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
            const mult = 0.15;
            this.x = lerp(this.x, this.targetPosition.x, mult);
            this.y = lerp(this.y, this.targetPosition.y, mult);
        }
        else if (Math.abs(x) > 0 || Math.abs(y) > 0) {
            this.setPosition(this.targetPosition.x, this.targetPosition.y);
        }

        // Update slots
        for (const slot of this._slots) {
            slot.update();
        }

        // Last turn warning
        if (this._quest.turnsRemaining === 1 && this._quest.isPrimed) {
            const r = 0.01 * Math.sin(time / 75);// amplitude * sin(time / freq)
            const s = 0.01 * Math.sin(time / 125);// amplitude * sin(time / freq)
            this.setRotation(r);
            this.setScale(1 + s);
        }
    }

    onEndTurn() {
        if (!this._quest.isPrimed)
            return;

        if (this._turnsIcon) {
            gsap.to(this._turnsIcon, {
                rotation: `-=${Math.PI}`,
                duration: 1.5,
                ease: Elastic.easeOut,
            });
        }

        if (this._turnsText) {
            gsap.from(this._turnsText, {
                scale: 1.35,
                duration: 1.5,
                ease: Elastic.easeOut,
            });
        }
    }

    onRequirementProgress(uuid: string) {
        // if (this._quest.isOwnRequirement(uuid))
        // console.log('Requirement progress:', uuid);

        if (this._quest.isOwnRequirement(uuid) && !this._quest.isPrimed)
            this._quest.isPrimed = true;
    }

    onRequirementCompleted(uuid: string) {
        // if (this._quest.isOwnRequirement(uuid))
        // console.log('Requirement completed:', uuid);

        if (this._quest.isOwnRequirement(uuid)) {
            if (this._quest.isDone())
                EventManager.emit(Events.QUEST_COMPLETED, this._quest.uuid);
            else if (!this._quest.isPrimed)
                this._quest.isPrimed = true
        }
    }

    destroy(fromScene?: boolean | undefined) {
        // console.log('destroying quest card');

        EventManager.off(Events.REQUIREMENT_PROGRESS, this._boundOnRequirementProgress);
        EventManager.off(Events.REQUIREMENT_COMPLETED, this._boundOnRequirementCompleted);
        EventManager.off(Events.END_TURN, this._boundOnEndTurn);

        this._quest.destroy();

        super.destroy();
    }
}