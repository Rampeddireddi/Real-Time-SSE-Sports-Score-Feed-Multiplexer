class GameEvent {
  constructor({
    id,
    game_id,
    home_team,
    away_team,
    home_score,
    away_score,
    game_clock,
    event_type
  }) {
    this.id = id;
    this.game_id = game_id;
    this.home_team = home_team;
    this.away_team = away_team;
    this.home_score = home_score;
    this.away_score = away_score;
    this.game_clock = game_clock;
    this.event_type = event_type;
  }
}

module.exports = GameEvent;