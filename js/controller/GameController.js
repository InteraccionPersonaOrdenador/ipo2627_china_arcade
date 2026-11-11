import { GAME_STATE } from "../config/gameConfig.js";

export class GameController {
  constructor(model, view, inputController, frameProvider = window) {
    this.model = model;
    this.view = view;
    this.inputController = inputController;
    this.frameProvider = frameProvider;
    this.previousTime = 0;
    this.resumeAfterHelp = false;
    this.loop = this.loop.bind(this);
  }

  initialize() {
    this.view.bindStart(() => this.handleStart());
    this.view.bindPause(() => this.model.togglePause());
    this.view.bindRestart(() => this.model.startNewGame());
    this.view.bindEnd(() => this.model.endGame());
    this.view.bindHelp(() => this.handleHelp());
    this.view.bindHelpClose(() => this.handleHelpClose());
    this.inputController.bindShoot(() => this.model.shoot());
    this.inputController.bindPause(() => this.model.togglePause());
    this.inputController.initialize();

    this.view.render(this.model.getSnapshot());
    this.frameProvider.requestAnimationFrame(this.loop);
  }

  handleStart() {
    if (this.model.state === GAME_STATE.PAUSED) {
      this.model.resume();
      return;
    }

    if (this.model.state !== GAME_STATE.PLAYING) {
      this.model.startNewGame();
    }
  }

  handleHelp() {
    this.resumeAfterHelp = this.model.state === GAME_STATE.PLAYING;
    if (this.resumeAfterHelp) {
      this.model.togglePause();
    }
    this.view.showHelp();
  }

  handleHelpClose() {
    if (this.resumeAfterHelp && this.model.state === GAME_STATE.PAUSED) {
      this.model.resume();
    }
    this.resumeAfterHelp = false;
  }

  loop(currentTime) {
    const deltaTime = this.previousTime === 0
      ? 0
      : Math.min((currentTime - this.previousTime) / 1000, 0.033);
    this.previousTime = currentTime;

    const direction = this.inputController.getHorizontalDirection();
    this.model.update(deltaTime, direction);
    this.view.render(this.model.getSnapshot());
    this.frameProvider.requestAnimationFrame(this.loop);
  }
}
