import { GAME_STATE } from "../config/gameConfig.js";

export class GameView {
  constructor(elements) {
    this.elements = elements;
    this.context = elements.canvas.getContext("2d");
  }

  bindStart(handler) {
    this.elements.startButton.addEventListener("click", handler);
  }

  bindPause(handler) {
    this.elements.pauseButton.addEventListener("click", handler);
  }

  bindRestart(handler) {
    this.elements.restartButton.addEventListener("click", handler);
  }

  bindEnd(handler) {
    this.elements.endButton.addEventListener("click", handler);
  }

  bindHelp(handler) {
    this.elements.helpButton.addEventListener("click", handler);
  }

  bindHelpClose(handler) {
    this.elements.helpDialog.addEventListener("close", handler);
  }

  showHelp() {
    if (!this.elements.helpDialog.open) {
      this.elements.helpDialog.showModal();
    }
  }

  render(snapshot) {
    this.renderScene(snapshot);
    this.renderHud(snapshot);
    this.renderInterfaceState(snapshot.state);
  }

  renderScene(snapshot) {
    const context = this.context;
    this.drawBackground(context, snapshot);
    this.drawPlatforms(context, snapshot.platforms);
    this.drawHarpoon(context, snapshot.harpoon);
    this.drawBalls(context, snapshot.balls);
    this.drawPlayer(context, snapshot.player, snapshot.invulnerable);
    this.drawOverlay(context, snapshot);
  }

  drawBackground(context, snapshot) {
    const gradient = context.createLinearGradient(0, 0, 0, snapshot.height);
    gradient.addColorStop(0, "oklch(34% 0.11 245)");
    gradient.addColorStop(1, "oklch(19% 0.06 255)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, snapshot.width, snapshot.height);

    context.fillStyle = "oklch(88% 0.08 235 / 22%)";
    for (let index = 0; index < 18; index += 1) {
      const x = (index * 173) % snapshot.width;
      const y = (index * 97) % (snapshot.height - 110);
      context.beginPath();
      context.arc(x, y, 2 + (index % 3), 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "oklch(30% 0.06 250)";
    context.fillRect(0, snapshot.height - snapshot.floorHeight, snapshot.width, snapshot.floorHeight);
    context.fillStyle = "oklch(78% 0.18 75)";
    context.fillRect(0, snapshot.height - snapshot.floorHeight, snapshot.width, 4);
  }

  drawPlatforms(context, platforms) {
    for (const platform of platforms) {
      context.fillStyle = "oklch(42% 0.12 245)";
      context.fillRect(platform.x, platform.y, platform.width, platform.height);
      context.fillStyle = "oklch(82% 0.1 235)";
      context.fillRect(platform.x, platform.y, platform.width, 4);
    }
  }

  drawHarpoon(context, harpoon) {
    if (!harpoon) {
      return;
    }

    context.strokeStyle = "oklch(94% 0.01 250)";
    context.lineWidth = harpoon.width;
    context.beginPath();
    context.moveTo(harpoon.x, harpoon.baseY);
    context.lineTo(harpoon.x, harpoon.tipY);
    context.stroke();

    context.fillStyle = "oklch(78% 0.18 75)";
    context.beginPath();
    context.moveTo(harpoon.x, harpoon.tipY - 10);
    context.lineTo(harpoon.x - 7, harpoon.tipY + 3);
    context.lineTo(harpoon.x + 7, harpoon.tipY + 3);
    context.closePath();
    context.fill();
  }

  drawBalls(context, balls) {
    const colors = {
      1: ["oklch(86% 0.12 92)", "oklch(68% 0.18 62)"],
      2: ["oklch(84% 0.14 55)", "oklch(63% 0.22 28)"],
      3: ["oklch(80% 0.16 25)", "oklch(57% 0.22 355)"],
      4: ["oklch(75% 0.17 330)", "oklch(48% 0.2 290)"]
    };

    for (const ball of balls) {
      const [highlight, base] = colors[ball.size];
      const gradient = context.createRadialGradient(
        ball.x - ball.radius * 0.35,
        ball.y - ball.radius * 0.4,
        ball.radius * 0.08,
        ball.x,
        ball.y,
        ball.radius
      );
      gradient.addColorStop(0, "oklch(98% 0.02 90)");
      gradient.addColorStop(0.28, highlight);
      gradient.addColorStop(1, base);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  drawPlayer(context, player, invulnerable) {
    if (invulnerable && Math.floor(performance.now() / 100) % 2 === 0) {
      return;
    }

    context.fillStyle = "oklch(68% 0.17 235)";
    context.fillRect(player.x, player.y + 14, player.width, player.height - 14);

    context.fillStyle = "oklch(88% 0.14 85)";
    context.beginPath();
    context.arc(player.x + player.width / 2, player.y + 14, 15, Math.PI, 0);
    context.fill();

    context.fillStyle = "oklch(21% 0.03 250)";
    context.fillRect(player.x + 10, player.y + player.height - 8, 9, 8);
    context.fillRect(player.x + player.width - 19, player.y + player.height - 8, 9, 8);
  }

  drawOverlay(context, snapshot) {
    const messages = {
      [GAME_STATE.MENU]: ["BUBBLE PANIC", "Pulsa Comenzar"],
      [GAME_STATE.PAUSED]: ["PAUSA", "Pulsa P o el botón para continuar"],
      [GAME_STATE.ROUND_COMPLETE]: ["¡RONDA SUPERADA!", `Preparando ronda ${snapshot.round + 1}`],
      [GAME_STATE.VICTORY]: ["¡VICTORIA!", `Puntuación: ${snapshot.score}`],
      [GAME_STATE.GAME_OVER]: ["FIN DE LA PARTIDA", `Puntuación: ${snapshot.score}`],
      [GAME_STATE.ENDED]: ["PARTIDA FINALIZADA", "Puedes comenzar de nuevo"]
    };

    const message = messages[snapshot.state];
    if (!message) {
      return;
    }

    context.fillStyle = "oklch(10% 0.03 250 / 72%)";
    context.fillRect(0, 0, snapshot.width, snapshot.height);
    context.textAlign = "center";
    context.fillStyle = "oklch(100% 0 0)";
    context.font = "800 44px system-ui";
    context.fillText(message[0], snapshot.width / 2, snapshot.height / 2 - 12);
    context.fillStyle = "oklch(88% 0.14 85)";
    context.font = "700 20px system-ui";
    context.fillText(message[1], snapshot.width / 2, snapshot.height / 2 + 28);
  }

  renderHud(snapshot) {
    this.elements.round.textContent = `${snapshot.round}/${snapshot.totalRounds}`;
    this.elements.time.textContent = snapshot.time;
    this.elements.lives.textContent = snapshot.lives;
    this.elements.score.textContent = snapshot.score;
  }

  renderInterfaceState(state) {
    const isPlaying = state === GAME_STATE.PLAYING;
    const isPaused = state === GAME_STATE.PAUSED;
    const canEnd = ![GAME_STATE.MENU, GAME_STATE.ENDED].includes(state);

    this.elements.startButton.textContent = isPaused ? "Continuar" : "Comenzar";
    this.elements.startButton.disabled = isPlaying || state === GAME_STATE.ROUND_COMPLETE;
    this.elements.pauseButton.textContent = isPaused ? "Continuar" : "Pausar";
    this.elements.pauseButton.disabled = !isPlaying && !isPaused;
    this.elements.endButton.disabled = !canEnd;

    const statusMessages = {
      [GAME_STATE.MENU]: "Pulsa Comenzar para jugar.",
      [GAME_STATE.PLAYING]: "Muévete con A/D o flechas y dispara con Espacio.",
      [GAME_STATE.PAUSED]: "Partida en pausa.",
      [GAME_STATE.ROUND_COMPLETE]: "Ronda superada.",
      [GAME_STATE.VICTORY]: "Has completado todas las rondas.",
      [GAME_STATE.GAME_OVER]: "Te has quedado sin vidas o sin tiempo.",
      [GAME_STATE.ENDED]: "Partida finalizada."
    };
    this.elements.status.textContent = statusMessages[state];
  }
}
