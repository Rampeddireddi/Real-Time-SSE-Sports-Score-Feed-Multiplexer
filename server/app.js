const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { PORT } = require("./config/constants");

const eventsRoute = require("./routes/events");
const statsRoute = require("./routes/stats");

const {
  startProducers
} = require("./services/producer");

const {
  broadcastEvent
} = require("./services/clientRegistry");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/events", eventsRoute);
app.use("/stats", statsRoute);

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

startProducers(broadcastEvent);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});