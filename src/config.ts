import * as Phaser from 'phaser';
import { clamp } from './utils';

export class Config {
    static DEBUG: boolean = false;

    static DPR: number = window.devicePixelRatio <= 1 ? 1 : 2;

    static screen = { width: 1920 * Config.DPR, height: 1080 * Config.DPR };
    static questCard = { width: 700 * Config.DPR, height: 250 * Config.DPR, startX: -350 * Config.DPR, startY: 300 * Config.DPR };
    static bossBar = { width: 1200 * Config.DPR, height: 25 * Config.DPR };
    static diceSize: number = 100 * Config.DPR;
    static sceneTransitionDuration: number = 1000;
    static stageBaseDifficulty: number = 50;
    static diceRotation: number = 0.025;
    static dicePosition: number = 8;
    static maxVisibleQuests: number = 3;
}

export class Colors {
    static BLACK_HEX: string = '#000000';
    static WHITE_HEX: string = '#FFFFFF';
    static BACKGROUND_HEX: string = '#00303C';
    static DARK_HEX: string = '#097F89';
    static LIGHT_HEX: string = '#FFCD96';
    static PINK_HEX: string = '#FF7777';

    static BLACK: number = Phaser.Display.Color.HexStringToColor(Colors.BLACK_HEX).color;
    static WHITE: number = Phaser.Display.Color.HexStringToColor(Colors.WHITE_HEX).color;
    static BACKGROUND: number = Phaser.Display.Color.HexStringToColor(Colors.BACKGROUND_HEX).color;
    static DARK: number = Phaser.Display.Color.HexStringToColor(Colors.DARK_HEX).color;
    static LIGHT: number = Phaser.Display.Color.HexStringToColor(Colors.LIGHT_HEX).color;
    static PINK: number = Phaser.Display.Color.HexStringToColor(Colors.PINK_HEX).color;
}

export class Fonts {
    static MAIN = "paroli";
    static TEXT = "dovetail-mvb";

    static getStyle(size: number, color: string, font: string) {
        return {
            fontFamily: font,
            fontSize: size * Config.DPR,
            color: color,
        }
    }
}