import * as Phaser from 'phaser';

export class Config {
    static DEBUG: boolean = false;

    static screen = { width: 1920, height: 1080 };
    static questCard = { width: 700, height: 250, startX: -350, startY: 300 };
    static bossBar = { width: 1200, height: 25 };
    static diceSize: number = 100;
    static sceneTransitionDuration: number = 1000;
    static stageBaseDifficulty: number = 50;
    static diceRotation: number = 0.025;
    static dicePosition: number = 8;
    static maxVisibleQuests: number = 3;
}

export class Colors {
    static BACKGROUND_HEX: string = '#00303C';
    static DARK_HEX: string = '#097F89';
    static LIGHT_HEX: string = '#FFCD96';
    static PINK_HEX: string = '#FF7777';

    static BACKGROUND: number = Phaser.Display.Color.HexStringToColor(Colors.BACKGROUND_HEX).color;
    static DARK: number = Phaser.Display.Color.HexStringToColor(Colors.DARK_HEX).color;
    static LIGHT: number = Phaser.Display.Color.HexStringToColor(Colors.LIGHT_HEX).color;
    static PINK: number = Phaser.Display.Color.HexStringToColor(Colors.PINK_HEX).color;
}

export enum Fonts {
    MAIN = "paroli",
    TEXT = "dovetail-mvb",
}