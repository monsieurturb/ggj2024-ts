import './style.css';
import { Colors, Config } from './config';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { CutScene } from './scenes/CutScene';
import { GameOver } from './scenes/GameOver';

const config = {
  type: Phaser.CANVAS,
  width: Config.screen.width,
  height: Config.screen.height,
  parent: 'game-container',
  backgroundColor: Colors.BACKGROUND_HEX,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    Game,
    CutScene,
    GameOver
  ]
};

setTimeout(() => {
  new Phaser.Game(config);
}, 250);

// export default new Phaser.Game(config);
