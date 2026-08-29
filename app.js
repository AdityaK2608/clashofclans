const API_BASE = "";
const state = {
  token: "",
  tag: "",
  player: null,
  mockMode: true
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmt(value) {
  return value === undefined || value === null ? "—" : Number(value).toLocaleString();
}

function setError(message) {
  const el = $("connectError");
  el.textContent = message || "";
  el.classList.toggle("hidden", !message);
}

function setConnected(connected) {
  const pill = $("connectionPill");
  pill.classList.toggle("muted", !connected);
  pill.innerHTML = connected
    ? '<span class="status-dot"></span> Connected'
    : '<span class="status-dot"></span> Disconnected';
}

function entityRow(entity) {
  const level = entity.level ?? "—";
  const max = entity.maxLevel ?? entity.maxLevelForTownHall ?? "—";
  const pct = Number.isFinite(Number(entity.progress))
    ? Math.max(0, Math.min(100, Number(entity.progress)))
    : null;
  return `<div class="entity-row">
    <div class="entity-head"><strong>${escapeHtml(entity.name)}</strong><span>${escapeHtml(level)}${max !== "—" ? ` / ${escapeHtml(max)}` : ""}</span></div>
    ${pct !== null ? `<div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>` : ""}
  </div>`;
}

function progressionPct(items) {
  if (!Array.isArray(items) || !items.length) return null;
  const valid = items.filter((x) => Number.isFinite(Number(x.progress)));
  if (!valid.length) return null;
  return valid.reduce((sum, x) => sum + Number(x.progress), 0) / valid.length;
}

function render(player) {
  state.player = player;
  $("connectView").classList.add("hidden");
  $("dashboardView").classList.remove("hidden");
  setConnected(true);

  $("playerName").textContent = player.name || "Unknown Player";
  $("playerMeta").textContent = `${player.tag || state.tag || "#PLAYER"} · ${player.clan?.name || "No Clan"}`;
  $("townHallValue").textContent = player.townHallLevel ?? "—";
  $("xpValue").textContent = fmt(player.expLevel);
  $("trophiesValue").textContent = fmt(player.trophies);
  $("bestTrophiesValue").textContent = fmt(player.bestTrophies);
  $("leagueBadge").textContent = player.league?.name || "Unranked";
  $("attackWins").textContent = fmt(player.achievements?.find?.((a) => a.name === "Conqueror")?.value ?? player.attackWins);
  $("defenseWins").textContent = fmt(player.defenseWins);
  $("donations").textContent = fmt(player.donations);
  $("clanValue").textContent = player.clan?.name || "—";

  const areas = [
    ["Heroes", progressionPct(player.heroes)],
    ["Troops", progressionPct(player.troops)],
    ["Spells", progressionPct(player.spells)],
    ["Hero Equipment", progressionPct(player.heroEquipment)],
    ["Pets", progressionPct(player.pets)]
  ].filter(([, pct]) => pct !== null);

  $("progressList").innerHTML = areas.length
    ? areas.map(([name, pct]) => `<div class="progress-item"><div class="progress-head"><span>${escapeHtml(name)}</span><strong>${Math.round(pct)}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0, Math.min(100,pct))}%"></div></div></div>`).join("")
    : '<div class="muted-text">No progression arrays are available in the current API payload.</div>';

  const allPcts = areas.map(([, pct]) => pct);
  const overall = allPcts.length ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;
  $("overallScore").textContent = `${overall}%`;
  $("overallScoreRing").style.background = `conic-gradient(var(--accent) ${overall}%, var(--track) ${overall}%)`;

  const sections = [
    ["heroesList", "heroCount", player.heroes],
    ["troopsList", "troopCount", player.troops],
    ["spellsList", "spellCount", player.spells],
    ["equipmentList", "equipmentCount", player.heroEquipment]
  ];

  sections.forEach(([listId, countId, list]) => {
    const arr = Array.isArray(list) ? list : [];
    $(countId).textContent = `${arr.length} tracked`;
    $(listId).innerHTML = arr.length ? arr.map(entityRow).join("") : '<div class="muted-text">No data available.</div>';
  });
}

function loadMockData(tag) {
  return {
    name: "Demo Chief",
    tag,
    townHallLevel: 18,
    expLevel: 243,
    trophies: 5842,
    bestTrophies: 6121,
    attackWins: 1943,
    defenseWins: 812,
    donations: 27380,
    league: { name: "Legend League" },
    clan: { name: "SouL" },
    heroes: [
      { name: "Barbarian King", level: 90, maxLevel: 95, progress: 94.7 },
      { name: "Archer Queen", level: 92, maxLevel: 95, progress: 96.8 },
      { name: "Grand Warden", level: 70, maxLevel: 70, progress: 100 },
      { name: "Royal Champion", level: 45, maxLevel: 45, progress: 100 }
    ],
    troops: [
      { name: "Barbarian", level: 12, maxLevel: 12, progress: 100 },
      { name: "Archer", level: 12, maxLevel: 12, progress: 100 },
      { name: "Electro Dragon", level: 7, maxLevel: 8, progress: 87.5 },
      { name: "Root Rider", level: 4, maxLevel: 5, progress: 80 }
    ],
    spells: [
      { name: "Rage Spell", level: 6, maxLevel: 6, progress: 100 },
      { name: "Freeze Spell", level: 7, maxLevel: 7, progress: 100 },
      { name: "Recall Spell", level: 5, maxLevel: 6, progress: 83.3 }
    ],
    heroEquipment: [
      { name: "Barbarian Puppet", level: 18, maxLevel: 18, progress: 100 },
      { name: "Eternal Tome", level: 18, maxLevel: 27, progress: 66.7 },
      { name: "Fireball", level: 20, maxLevel: 27, progress: 74.1 }
    ],
    pets: [
      { name: "L.A.S.S.I.", level: 10, maxLevel: 10, progress: 100 },
      { name: "Phoenix", level: 8, maxLevel: 10, progress: 80 }
    ]
  };
}

async function fetchPlayer(tag, token) {
  // This adapter is intentionally isolated so we can point it at a secure
  // backend later without changing the dashboard rendering code.
  const url = API_BASE ? `${API_BASE}/player/${encodeURIComponent(tag)}` : "";
  if (!url) return null;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    throw new Error(`API request failed (${response.status}).`);
  }
  return response.json();
}

async function connect() {
  setError("");
  const tag = $("playerTag").value.trim().toUpperCase();
  const token = $("apiToken").value.trim();
  if (!tag) return setError("Enter a Player Tag, for example #9ABC1234.");
  if (!token) return setError("Enter your Clash of Clans API token.");

  state.tag = tag;
  state.token = token;
  $("connectButton").disabled = true;
  $("connectButton").textContent = "Loading…";

  try {
    const player = await fetchPlayer(tag, token);
    if (player) {
      state.mockMode = false;
      render(player);
    } else {
      // V1 UI is usable immediately while the secure backend is wired in.
      state.mockMode = true;
      render(loadMockData(tag));
      setError("The dashboard UI is ready, but the secure CoC API endpoint is not configured yet. Showing preview data.");
    }
  } catch (error) {
    setError(error.message || "Unable to load the account.");
  } finally {
    $("connectButton").disabled = false;
    $("connectButton").textContent = "Connect & Load Dashboard";
  }
}

function disconnect() {
  state.token = "";
  state.tag = "";
  state.player = null;
  $("apiToken").value = "";
  $("dashboardView").classList.add("hidden");
  $("connectView").classList.remove("hidden");
  setConnected(false);
  setError("");
}

function toggleTheme() {
  const light = document.documentElement.classList.toggle("light");
  localStorage.setItem("coc-theme", light ? "light" : "dark");
  $("themeToggle").textContent = light ? "☀" : "☾";
}

function init() {
  if (localStorage.getItem("coc-theme") === "light") {
    document.documentElement.classList.add("light");
    $("themeToggle").textContent = "☀";
  }
  $("connectButton").addEventListener("click", connect);
  $("disconnectButton").addEventListener("click", disconnect);
  $("themeToggle").addEventListener("click", toggleTheme);
  $("refreshButton").addEventListener("click", () => {
    if (!state.tag || !state.token) return;
    connect();
  });
  $("apiToken").addEventListener("keydown", (event) => {
    if (event.key === "Enter") connect();
  });
  $("playerTag").addEventListener("keydown", (event) => {
    if (event.key === "Enter") connect();
  });
}

document.addEventListener("DOMContentLoaded", init);
