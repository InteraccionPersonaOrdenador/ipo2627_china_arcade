export class Harpoon {
  constructor({ x, baseY, speed, width }) {
    this.x = x;
    this.tipY = baseY;
    this.baseY = baseY;
    this.speed = speed;
    this.width = width;
  }

  update(deltaTime) {
    this.tipY -= this.speed * deltaTime;
  }
}
