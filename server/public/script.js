const scoreboard = document.getElementById("scoreboard");
const statusElement = document.getElementById("connection-status");
const statsElement = document.getElementById("global-stats");

const subscribedGames = [
  "game-01",
  "game-02",
  "game-03"
];

let eventSource = null;

function setConnectionStatus(status, text) {
  statusElement.setAttribute("data-status", status);
  statusElement.textContent = text;
}

function createScoreCard(game) {
  const existing = document.querySelector(
    `[data-testid="scorecard-${game.game_id}"]`
  );

  if (existing) return;

  const card = document.createElement("div");
  card.className = "scorecard";
  card.setAttribute(
    "data-testid",
    `scorecard-${game.game_id}`
  );

  card.innerHTML = `
    <h2>${game.home_team} vs ${game.away_team}</h2>

    <div class="team-row">
      <span>${game.home_team}</span>
      <span data-testid="score-home-${game.game_id}">
        ${game.home_score}
      </span>
    </div>

    <div class="team-row">
      <span>${game.away_team}</span>
      <span data-testid="score-away-${game.game_id}">
        ${game.away_score}
      </span>
    </div>

    <p>${game.game_clock}</p>
  `;

  scoreboard.appendChild(card);
}

function updateScore(game) {
  createScoreCard(game);

  const home = document.querySelector(
    `[data-testid="score-home-${game.game_id}"]`
  );

  const away = document.querySelector(
    `[data-testid="score-away-${game.game_id}"]`
  );

  if (home) {
    home.textContent = game.home_score;
    home.classList.add("flash");

    setTimeout(() => {
      home.classList.remove("flash");
    }, 800);
  }

  if (away) {
    away.textContent = game.away_score;
    away.classList.add("flash");

    setTimeout(() => {
      away.classList.remove("flash");
    }, 800);
  }
}

function connectSSE() {
  if (eventSource) {
    eventSource.close();
  }

  setConnectionStatus(
    "reconnecting",
    "Connecting..."
  );

  eventSource = new EventSource(
    `/events?games=${subscribedGames.join(",")}`
  );

  eventSource.onopen = () => {
    setConnectionStatus(
      "connected",
      "Connected"
    );
  };

  eventSource.onerror = () => {
    setConnectionStatus(
      "reconnecting",
      "Reconnecting..."
    );
  };

  eventSource.addEventListener(
    "initial_state",
    (event) => {
      const data = JSON.parse(event.data);
      updateScore(data);
    }
  );

  eventSource.addEventListener(
    "score_update",
    (event) => {
      const data = JSON.parse(event.data);
      updateScore(data);
    }
  );
}

async function fetchStats() {
  try {
    const res = await fetch("/stats");
    const data = await res.json();

    statsElement.textContent =
      `Connected Clients: ${data.connected_clients} | ` +
      `Dropped Events: ${data.total_dropped_events}`;
  } catch (err) {
    console.error(err);
  }
}

connectSSE();

setInterval(fetchStats, 5000);
fetchStats();