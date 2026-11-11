export class Player {
  constructor({ x, y, width, height, speed }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  move(direction, deltaTime, worldWidth) {
    this.x += direction * this.speed * deltaTime;
    this.x = Math.max(0, Math.min(worldWidth - this.width, this.x));
  }

  resetPosition(worldWidth) {
    this.x = (worldWidth - this.width) / 2;
  }

  get centerX() {
    return this.x + this.width / 2;
  }
}
