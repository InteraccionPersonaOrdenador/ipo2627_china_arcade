import { GAME_OVER_REASON, GAME_STATE } from "../config/gameConfig.js";
import { Ball } from "./entities/Ball.js";
import { Harpoon } from "./entities/Harpoon.js";
import { Platform } from "./entities/Platform.js";
import { Player } from "./entities/Player.js";

export class GameModel {
  constructor(config) {
    this.config = config;
    this.state = GAME_STATE.MENU;
    this.roundIndex = 0;
    this.score = 0;
    this.lives = config.startingLives;
    this.timeRemaining = config.rounds[0].time;
    this.transitionRemaining = 0;
    this.invulnerabilityRemaining = 0;
    this.gameOverReason = null;
    this.balls = [];
    this.platforms = [];
    this.harpoon = null;

    const floorY = config.height - config.floorHeight;
    this.player = new Player({
      x: (config.width - config.player.width) / 2,
      y: floorY - config.player.height,
      ...config.player
    });

    this.loadRound(0);
  }

  startNewGame() {
    this.roundIndex = 0;
    this.score = 0;
    this.lives = this.config.startingLives;
    this.invulnerabilityRemaining = 0;
    this.gameOverReason = null;
    this.harpoon = null;
    this.player.resetPosition(this.config.width);
    this.loadRound(0);
    this.state = GAME_STATE.PLAYING;
  }

  resume() {
    if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
    }
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
    }
  }

  endGame() {
    if (this.state !== GAME_STATE.MENU) {
      this.state = GAME_STATE.ENDED;
      this.harpoon = null;
    }
  }

  shoot() {
    if (this.state !== GAME_STATE.PLAYING || this.harpoon) {
      return;
    }

    this.harpoon = new Harpoon({
      x: this.player.centerX,
      baseY: this.player.y,
      ...this.config.harpoon
    });
  }

  update(deltaTime, horizontalDirection) {
    if (this.state === GAME_STATE.ROUND_COMPLETE) {
      this.updateRoundTransition(deltaTime);
      return;
    }

    if (this.state !== GAME_STATE.PLAYING) {
      return;
    }

    this.timeRemaining = Math.max(0, this.timeRemaining - deltaTime);
    this.invulnerabilityRemaining = Math.max(0, this.invulnerabilityRemaining - deltaTime);

    if (this.timeRemaining === 0) {
      this.gameOverReason = GAME_OVER_REASON.TIME;
      this.state = GAME_STATE.GAME_OVER;
      this.harpoon = null;
      return;
    }

    this.player.move(horizontalDirection, deltaTime, this.config.width);
    this.updateHarpoon(deltaTime);
    this.updateBalls(deltaTime);
    this.resolveHarpoonCollision();
    this.resolvePlayerCollision();

    if (this.balls.length === 0 && this.state === GAME_STATE.PLAYING) {
      this.completeRound();
    }
  }

  updateHarpoon(deltaTime) {
    if (!this.harpoon) {
      return;
    }

    this.harpoon.update(deltaTime);
    if (this.harpoon.tipY <= 0) {
      this.harpoon = null;
    }
  }

  updateBalls(deltaTime) {
    const floorY = this.config.height - this.config.floorHeight;

    for (const ball of this.balls) {
      ball.update(deltaTime, this.config.gravity);
      this.resolveWorldCollision(ball, floorY);

      for (const platform of this.platforms) {
        this.resolvePlatformCollision(ball, platform);
      }
    }
  }

  resolveWorldCollision(ball, floorY) {
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.velocityX = Math.abs(ball.velocityX);
    } else if (ball.x + ball.radius > this.config.width) {
      ball.x = this.config.width - ball.radius;
      ball.velocityX = -Math.abs(ball.velocityX);
    }

    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.velocityY = Math.abs(ball.velocityY);
    }

    if (ball.y + ball.radius > floorY) {
      ball.y = floorY - ball.radius;
      ball.velocityY = -ball.bounceSpeed;
    }
  }

  resolvePlatformCollision(ball, platform) {
    const closestX = Math.max(platform.x, Math.min(ball.x, platform.x + platform.width));
    const closestY = Math.max(platform.y, Math.min(ball.y, platform.y + platform.height));
    const differenceX = ball.x - closestX;
    const differenceY = ball.y - closestY;
    const distanceSquared = differenceX ** 2 + differenceY ** 2;

    if (distanceSquared >= ball.radius ** 2) {
      return;
    }

    const wasAbove = ball.previousY + ball.radius <= platform.y;
    const wasBelow = ball.previousY - ball.radius >= platform.y + platform.height;
    const wasLeft = ball.previousX + ball.radius <= platform.x;
    const wasRight = ball.previousX - ball.radius >= platform.x + platform.width;

    if (wasAbove && ball.velocityY > 0) {
      ball.y = platform.y - ball.radius;
      ball.velocityY = -ball.bounceSpeed;
    } else if (wasBelow && ball.velocityY < 0) {
      ball.y = platform.y + platform.height + ball.radius;
      ball.velocityY = Math.abs(ball.velocityY);
    } else if (wasLeft && ball.velocityX > 0) {
      ball.x = platform.x - ball.radius;
      ball.velocityX = -Math.abs(ball.velocityX);
    } else if (wasRight && ball.velocityX < 0) {
      ball.x = platform.x + platform.width + ball.radius;
      ball.velocityX = Math.abs(ball.velocityX);
    }
  }

  resolveHarpoonCollision() {
    if (!this.harpoon) {
      return;
    }

    const hitIndex = this.balls.findIndex((ball) => {
      const closestY = Math.max(this.harpoon.tipY, Math.min(ball.y, this.harpoon.baseY));
      const distanceX = ball.x - this.harpoon.x;
      const distanceY = ball.y - closestY;
      const hitRadius = ball.radius + this.harpoon.width / 2;
      return distanceX ** 2 + distanceY ** 2 <= hitRadius ** 2;
    });

    if (hitIndex === -1) {
      return;
    }

    const hitBall = this.balls.splice(hitIndex, 1)[0];
    this.harpoon = null;
    this.score += this.config.ballSizes[hitBall.size].score;

    if (hitBall.size > 1) {
      this.splitBall(hitBall);
    }
  }

  splitBall(ball) {
    const childSize = ball.size - 1;
    const definition = this.config.ballSizes[childSize];
    const offset = definition.radius + 2;

    this.balls.push(
      this.createBall({
        x: ball.x - offset,
        y: ball.y,
        size: childSize,
        direction: -1,
        velocityY: -definition.bounceSpeed
      }),
      this.createBall({
        x: ball.x + offset,
        y: ball.y,
        size: childSize,
        direction: 1,
        velocityY: -definition.bounceSpeed
      })
    );
  }

  resolvePlayerCollision() {
    if (this.invulnerabilityRemaining > 0) {
      return;
    }

    const hasCollision = this.balls.some((ball) => {
      const closestX = Math.max(this.player.x, Math.min(ball.x, this.player.x + this.player.width));
      const closestY = Math.max(this.player.y, Math.min(ball.y, this.player.y + this.player.height));
      const differenceX = ball.x - closestX;
      const differenceY = ball.y - closestY;
      return differenceX ** 2 + differenceY ** 2 <= ball.radius ** 2;
    });

    if (!hasCollision) {
      return;
    }

    this.lives -= 1;
    this.harpoon = null;
    this.player.resetPosition(this.config.width);
    this.invulnerabilityRemaining = this.config.playerInvulnerability;

    if (this.lives <= 0) {
      this.gameOverReason = GAME_OVER_REASON.LIVES;
      this.state = GAME_STATE.GAME_OVER;
    }
  }

  completeRound() {
    if (this.roundIndex === this.config.rounds.length - 1) {
      this.state = GAME_STATE.VICTORY;
      return;
    }

    this.state = GAME_STATE.ROUND_COMPLETE;
    this.transitionRemaining = this.config.roundTransitionDuration;
  }

  updateRoundTransition(deltaTime) {
    this.transitionRemaining -= deltaTime;
    if (this.transitionRemaining > 0) {
      return;
    }

    this.roundIndex += 1;
    this.player.resetPosition(this.config.width);
    this.invulnerabilityRemaining = this.config.playerInvulnerability;
    this.loadRound(this.roundIndex);
    this.state = GAME_STATE.PLAYING;
  }

  loadRound(roundIndex) {
    const round = this.config.rounds[roundIndex];
    this.timeRemaining = round.time;
    this.harpoon = null;
    this.platforms = round.platforms.map((platform) => new Platform(platform));
    this.balls = round.balls.map((ball) => this.createBall(ball));
  }

  createBall({ x, y, size, direction, velocityY = 0 }) {
    const definition = this.config.ballSizes[size];
    return new Ball({
      x,
      y,
      size,
      velocityX: definition.speed * direction,
      velocityY,
      definition
    });
  }

  getSnapshot() {
    return {
      width: this.config.width,
      height: this.config.height,
      floorHeight: this.config.floorHeight,
      state: this.state,
      round: this.roundIndex + 1,
      totalRounds: this.config.rounds.length,
      score: this.score,
      lives: this.lives,
      time: Math.ceil(this.timeRemaining),
      gameOverReason: this.gameOverReason,
      invulnerable: this.invulnerabilityRemaining > 0,
      player: {
        x: this.player.x,
        y: this.player.y,
        width: this.player.width,
        height: this.player.height
      },
      balls: this.balls.map((ball) => ({
        x: ball.x,
        y: ball.y,
        radius: ball.radius,
        size: ball.size
      })),
      platforms: this.platforms.map((platform) => ({
        x: platform.x,
        y: platform.y,
        width: platform.width,
        height: platform.height
      })),
      harpoon: this.harpoon
        ? {
            x: this.harpoon.x,
            tipY: this.harpoon.tipY,
            baseY: this.harpoon.baseY,
            width: this.harpoon.width
          }
        : null
    };
  }
}
