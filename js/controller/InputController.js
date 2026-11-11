export class InputController {
  constructor(eventTarget) {
    this.eventTarget = eventTarget;
    this.pressedKeys = new Set();
    this.shootHandler = () => {};
    this.pauseHandler = () => {};
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  initialize() {
    this.eventTarget.addEventListener("keydown", this.handleKeyDown);
    this.eventTarget.addEventListener("keyup", this.handleKeyUp);
  }

  bindShoot(handler) {
    this.shootHandler = handler;
  }

  bindPause(handler) {
    this.pauseHandler = handler;
  }

  getHorizontalDirection() {
    const movingLeft = this.pressedKeys.has("ArrowLeft") || this.pressedKeys.has("KeyA");
    const movingRight = this.pressedKeys.has("ArrowRight") || this.pressedKeys.has("KeyD");
    return Number(movingRight) - Number(movingLeft);
  }

  handleKeyDown(event) {
    if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }

    if (event.repeat) {
      return;
    }

    this.pressedKeys.add(event.code);

    if (event.code === "Space") {
      this.shootHandler();
    }

    if (event.code === "KeyP" || event.code === "Escape") {
      this.pauseHandler();
    }
  }

  handleKeyUp(event) {
    this.pressedKeys.delete(event.code);
  }
}
