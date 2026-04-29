const latestGameState = new Map();
const eventHistory = new Map();

function saveEvent(event) {
  latestGameState.set(event.game_id, event);

  if (!eventHistory.has(event.game_id)) {
    eventHistory.set(event.game_id, []);
  }

  const history = eventHistory.get(event.game_id);
  history.push(event);

  if (history.length > 300) {
    history.shift();
  }
}

function getLatestState(gameId) {
  return latestGameState.get(gameId);
}

function getEventsAfter(gameId, lastEventId) {
  const history = eventHistory.get(gameId) || [];
  const index = history.findIndex(e => e.id === lastEventId);

  if (index === -1) return [];

  return history.slice(index + 1);
}

function getAllGames() {
  return Array.from(latestGameState.keys());
}

module.exports = {
  saveEvent,
  getLatestState,
  getEventsAfter,
  getAllGames
};