module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_BUFFER_SIZE: parseInt(process.env.CLIENT_BUFFER_SIZE || "50"),
  HEARTBEAT_INTERVAL: parseInt(process.env.HEARTBEAT_INTERVAL || "15000"),
  EVENT_INTERVAL: parseInt(process.env.EVENT_INTERVAL || "2000"),
  EVENT_HISTORY_LIMIT: 300
};