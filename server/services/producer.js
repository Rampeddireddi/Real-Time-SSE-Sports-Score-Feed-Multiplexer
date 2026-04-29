const crypto = require("crypto");
const GameEvent = require("../models/GameEvent");
const { EVENT_INTERVAL } = require("../config/constants");
const { saveEvent } = require("./eventHistory");
const stats = require("./statsService");

const games = [
  {
    game_id: "game-01",
    home_team: "Lakers",
    away_team: "Warriors"
  },
  {
    game_id: "game-02",
    home_team: "Celtics",
    away_team: "Bulls"
  },
  {
    game_id: "game-03",
    home_team: "Heat",
    away_team: "Nets"
  }
];

function generateId() {
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function simulateGame(game, broadcastEvent) {
  let home_score = 0;
  let away_score = 0;
  let minute = 1;

  setInterval(() => {
    home_score += Math.floor(Math.random() * 3);
    away_score += Math.floor(Math.random() * 3);

    const event = new GameEvent({
      id: generateId(),
      game_id: game.game_id,
      home_team: game.home_team,
      away_team: game.away_team,
      home_score,
      away_score,
      game_clock: `Q1 ${minute}:00`,
      event_type: "score_update"
    });

    minute++;

    saveEvent(event);

    stats.active_games = games.map(g => ({
      game_id: g.game_id,
      last_update: new Date().toISOString()
    }));

    broadcastEvent(event);
  }, EVENT_INTERVAL);
}

function startProducers(broadcastEvent) {
  games.forEach(game => {
    simulateGame(game, broadcastEvent);
  });
}

module.exports = {
  startProducers,
  games
};