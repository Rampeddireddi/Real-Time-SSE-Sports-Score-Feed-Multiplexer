const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const {
  HEARTBEAT_INTERVAL,
  CLIENT_BUFFER_SIZE
} = require("../config/constants");

const {
  addClient,
  removeClient,
  getClients
} = require("../services/clientRegistry");

const {
  getLatestState,
  getEventsAfter
} = require("../services/eventHistory");

const stats = require("../services/statsService");

function generateClientId() {
  return crypto.randomBytes(8).toString("hex");
}

function sendSSE(res, eventName, payload, id) {
  res.write(`id: ${id}\n`);
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const gamesParam = req.query.games || "";
  const subscribedGames = gamesParam
    .split(",")
    .filter(Boolean);

  const lastEventId = req.header("Last-Event-ID");

  const clientId = generateClientId();

  const client = {
    id: clientId,
    res,
    subscriptions: new Set(subscribedGames),
    queue: [],
    maxBuffer: CLIENT_BUFFER_SIZE
  };

  addClient(clientId, client);
  stats.connected_clients++;

  /*
    STEP A:
    Send initial_state immediately
  */

  subscribedGames.forEach((gameId) => {
    const latestState = getLatestState(gameId);

    if (latestState) {
      sendSSE(
        res,
        "initial_state",
        latestState,
        latestState.id
      );
    }
  });

  /*
    STEP B:
    Replay missed events using Last-Event-ID
  */

  if (lastEventId) {
    subscribedGames.forEach((gameId) => {
      const missedEvents = getEventsAfter(
        gameId,
        lastEventId
      );

      missedEvents.forEach((event) => {
        sendSSE(
          res,
          "score_update",
          event,
          event.id
        );
      });
    });
  }

  /*
    STEP C:
    Heartbeat every 15 sec
  */

  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`);
  }, HEARTBEAT_INTERVAL);

  /*
    STEP D:
    Handle disconnect cleanly
  */

  req.on("close", () => {
    clearInterval(heartbeat);

    removeClient(clientId);

    stats.connected_clients--;

    res.end();
  });
});

module.exports = router;