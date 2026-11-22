// Fetches views, subscribers and video counts for every client in
// src/data/clients.json from the channel's public YouTube "About" page
// and writes the numbers back into that file. Channels that fail to load
// keep their previous values, so a flaky request never blanks the site.
import { readFile, writeFile } from "node:fs/promises";

const FILE = new URL("../src/data/clients.json", import.meta.url);
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  // Skip the EU cookie-consent interstitial.
  Cookie: "SOCS=CAI; CONSENT=YES+",
};

const SUFFIX = { K: 1e3, M: 1e6, B: 1e9 };

function parseCount(text) {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = parseFloat(m[1]) * (m[2] ? SUFFIX[m[2].toUpperCase()] : 1);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function pick(html, key) {
  const m = html.match(new RegExp(`"${key}":"([^"]*)"`));
  return m ? m[1] : null;
}

async function fetchStats(handle) {
  const res = await fetch(`https://www.youtube.com/@${encodeURIComponent(handle)}/about`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const stats = {
    views: parseCount(pick(html, "viewCountText")),
    videos: parseCount(pick(html, "videoCountText")),
    subscribers: parseCount(pick(html, "subscriberCountText")),
  };
  if (stats.views == null && stats.videos == null && stats.subscribers == null) {
    throw new Error("no stats found on page");
  }
  return stats;
}

const data = JSON.parse(await readFile(FILE, "utf8"));
let ok = 0;
for (const client of data.clients) {
  try {
    const fresh = await fetchStats(client.handle);
    for (const [k, v] of Object.entries(fresh)) if (v != null) client.stats[k] = v;
    ok++;
    console.log(`@${client.handle}:`, client.stats);
  } catch (err) {
    console.warn(`@${client.handle}: kept old values (${err.message})`);
  }
}
if (ok === 0) {
  console.error("Could not update any channel.");
  process.exit(1);
}
data.updatedAt = new Date().toISOString().slice(0, 10);
await writeFile(FILE, JSON.stringify(data, null, 2) + "\n");
