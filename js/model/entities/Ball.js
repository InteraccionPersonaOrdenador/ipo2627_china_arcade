export class Ball {
  constructor({ x, y, size, velocityX, velocityY, definition }) {
    this.x = x;
    this.y = y;
    this.previousX = x;
    this.previousY = y;
    this.size = size;
    this.radius = definition.radius;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.bounceSpeed = definition.bounceSpeed;
  }

  update(deltaTime, gravity) {
    this.previousX = this.x;
    this.previousY = this.y;
    this.velocityY += gravity * deltaTime;
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }
}
