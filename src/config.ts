import * as Phaser from 'phaser';

export class Config {
    static DEBUG: boolean = false;

    static screenWidth: number = 1920;
    static screenHeight: number = 1080;

    static diceSize: number = 80;
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