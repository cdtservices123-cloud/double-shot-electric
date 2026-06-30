// Storage abstraction:
//   Local dev  → JSON file (dse-data.json)
//   Vercel     → Vercel KV (Redis) when KV_REST_API_URL is set
const fs   = require("fs");
const path = require("path");

let USE_KV = !!process.env.KV_REST_API_URL;
const DATA_FILE = path.join(process.cwd(), "dse-data.json");

// ── Local JSON file ──────────────────────────────────────────────────────────
function loadLocal() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return { waitlist: [], orders: [], _ids: { waitlist: 1, orders: 1 } }; }
}
function saveLocal(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Vercel KV ─────────────────────────────────────────────────────────────────
let kv = null;
if (USE_KV) {
  try { ({ kv } = require("@vercel/kv")); }
  catch { USE_KV = false; }
}

async function kvGet(key, fallback) {
  const val = await kv.get(key);
  return val ?? fallback;
}

// ── Unified interface ─────────────────────────────────────────────────────────

async function getAll(table) {
  if (!USE_KV) return [...loadLocal()[table]].reverse();
  const rows = await kvGet(table, []);
  return [...rows].reverse();
}

async function insert(table, record) {
  const row = { ...record, created_at: new Date().toISOString() };
  if (!USE_KV) {
    const data = loadLocal();
    row.id = data._ids[table]++;
    data[table].push(row);
    saveLocal(data);
    return row;
  }
  const ids = await kvGet("_ids", { waitlist: 1, orders: 1 });
  row.id = ids[table]++;
  const rows = await kvGet(table, []);
  rows.push(row);
  await Promise.all([kv.set("_ids", ids), kv.set(table, rows)]);
  return row;
}

async function findOne(table, predicate) {
  const rows = USE_KV ? await kvGet(table, []) : loadLocal()[table];
  return rows.find(predicate);
}

async function updateOne(table, id, patch) {
  if (!USE_KV) {
    const data = loadLocal();
    const idx  = data[table].findIndex(r => r.id === id);
    if (idx === -1) return false;
    Object.assign(data[table][idx], patch);
    saveLocal(data);
    return true;
  }
  const rows = await kvGet(table, []);
  const idx  = rows.findIndex(r => r.id === id);
  if (idx === -1) return false;
  Object.assign(rows[idx], patch);
  await kv.set(table, rows);
  return true;
}

module.exports = { getAll, insert, findOne, updateOne };
