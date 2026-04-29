const express = require("express");
const router = express.Router();

const stats = require("../services/statsService");

router.get("/", (req, res) => {
  res.status(200).json({
    connected_clients: stats.connected_clients,
    events_per_second: stats.events_per_second,
    total_dropped_events: stats.total_dropped_events,
    active_games: stats.active_games
  });
});

module.exports = router;