export const GAME_STATE = Object.freeze({
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  ROUND_COMPLETE: "round-complete",
  VICTORY: "victory",
  GAME_OVER: "game-over",
  ENDED: "ended"
});

export const GAME_CONFIG = Object.freeze({
  width: 960,
  height: 540,
  floorHeight: 22,
  gravity: 820,
  startingLives: 3,
  playerInvulnerability: 1.8,
  roundTransitionDuration: 1.7,
  player: {
    width: 46,
    height: 56,
    speed: 360,
  },
  harpoon: {
    speed: 760,
    width: 5,
  },
  ballSizes: {
    1: { radius: 12, speed: 150, bounceSpeed: 480, score: 400 },
    2: { radius: 20, speed: 135, bounceSpeed: 550, score: 300 },
    3: { radius: 32, speed: 120, bounceSpeed: 620, score: 200 },
    4: { radius: 47, speed: 100, bounceSpeed: 700, score: 100 },
  },
  rounds: [
    {
      time: 60,
      balls: [
        { size: 2, x: 220, y: 170, direction: 1 },
        { size: 2, x: 480, y: 120, direction: -1 },
        { size: 2, x: 740, y: 180, direction: 1 },
      ],
      platforms: [{ x: 360, y: 350, width: 240, height: 16 }],
    },
    {
      time: 70,
      balls: [
        { size: 3, x: 190, y: 130, direction: 1 },
        { size: 2, x: 480, y: 90, direction: -1 },
        { size: 3, x: 770, y: 150, direction: -1 },
      ],
      platforms: [
        { x: 170, y: 340, width: 190, height: 16 },
        { x: 600, y: 340, width: 190, height: 16 },
      ],
    },
    {
      time: 85,
      balls: [{ size: 4, x: 300, y: 110, direction: 1 }],
      platforms: [
        { x: 110, y: 355, width: 200, height: 16 },
        { x: 380, y: 285, width: 200, height: 16 },
        { x: 650, y: 355, width: 200, height: 16 },
      ],
    },
  ],
});
