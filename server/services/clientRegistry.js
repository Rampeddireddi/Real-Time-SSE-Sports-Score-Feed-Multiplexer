const clients = new Map();
const stats = require("./statsService");

function addClient(clientId, clientData) {
  clients.set(clientId, clientData);
}

function removeClient(clientId) {
  clients.delete(clientId);
}

function getClients() {
  return clients;
}

function broadcastEvent(event) {
  clients.forEach((client) => {
    if (
      client.subscriptions.size > 0 &&
      !client.subscriptions.has(event.game_id)
    ) {
      return;
    }

    /*
      Non-blocking backpressure handling
    */

    if (client.queue.length >= client.maxBuffer) {
      stats.total_dropped_events++;
      return;
    }

    client.queue.push(event);

    flushClientQueue(client);
  });
}

function flushClientQueue(client) {
  while (client.queue.length > 0) {
    const event = client.queue.shift();

    try {
      client.res.write(`id: ${event.id}\n`);
      client.res.write(`event: score_update\n`);
      client.res.write(
        `data: ${JSON.stringify(event)}\n\n`
      );
    } catch (err) {
      break;
    }
  }
}

module.exports = {
  addClient,
  removeClient,
  getClients,
  broadcastEvent
};