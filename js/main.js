import { GAME_CONFIG } from "./config/gameConfig.js";
import { GameController } from "./controller/GameController.js";
import { InputController } from "./controller/InputController.js";
import { GameModel } from "./model/GameModel.js";
import { GameView } from "./view/GameView.js";

const elements = {
  canvas: document.querySelector(".js-game-canvas"),
  round: document.querySelector(".js-round"),
  time: document.querySelector(".js-time"),
  lives: document.querySelector(".js-lives"),
  score: document.querySelector(".js-score"),
  status: document.querySelector(".js-status"),
  startButton: document.querySelector(".js-start-button"),
  pauseButton: document.querySelector(".js-pause-button"),
  restartButton: document.querySelector(".js-restart-button"),
  endButton: document.querySelector(".js-end-button"),
  helpButton: document.querySelector(".js-help-button"),
  helpDialog: document.querySelector(".js-help-dialog")
};

const model = new GameModel(GAME_CONFIG);
const view = new GameView(elements);
const inputController = new InputController(window);
const controller = new GameController(model, view, inputController, window);

controller.initialize();
