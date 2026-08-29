import express from "express";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://adityak2608.github.io";
const COC_API = "https://api.clashofclans.com/v1";

app.disable("x-powered-by");
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin || ALLOWED_ORIGIN);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "clash-command-center-api" }));

app.get("/player/:tag", async (req, res) => {
  const token = String(req.get("authorization") || "").trim();
  const tag = String(req.params.tag || "").replace(/^#/, "").toUpperCase();

  if (!/^#[A-Z0-9]+$/.test(`#${tag}`)) {
    return res.status(400).json({ message: "Invalid player tag." });
  }
  if (!token.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Missing API token." });
  }

  try {
    const upstream = await fetch(`${COC_API}/players/%23${encodeURIComponent(tag)}`, {
      headers: {
        Authorization: token,
        Accept: "application/json"
      }
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.type("application/json");
    return res.send(text);
  } catch (error) {
    return res.status(502).json({ message: "Unable to reach the Clash of Clans API." });
  }
});

app.use((_req, res) => res.status(404).json({ message: "Not found." }));

app.listen(PORT, () => {
  console.log(`Clash Command Center API listening on ${PORT}`);
});
