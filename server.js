require("dotenv").config();
const express    = require("express");
const nodemailer = require("nodemailer");
const cors       = require("cors");
const path       = require("path");
const db         = require("./db");

const app       = express();
const PORT      = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "dse-admin-2026";

// ── Email ────────────────────────────────────────────────────────────────────
let mailer = null;
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
  mailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
}

async function sendMail(to, subject, html) {
  if (!mailer) { console.log(`[email skip] To: ${to} | ${subject}`); return; }
  try {
    await mailer.sendMail({
      from: `"${process.env.FROM_NAME || "Double Shot Electric"}" <${process.env.FROM_EMAIL || process.env.GMAIL_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error("[email error]", err.message);
  }
}

// ── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: "berry-thai",     name: "Berry Thai",       description: "Ceremonial Uji matcha · Thai basil · strawberry",  price: 6, tag: "Focus Fuel" },
  { id: "cinna-mom",      name: "Cinna-Mom",        description: "Double-shot espresso · cardamom · cinnamon",       price: 7, tag: "Energy Elixir" },
  { id: "miso-sweet",     name: "Miso Sweet",       description: "Espresso · miso brown sugar · caramel",            price: 7, tag: "Focus Fuel" },
  { id: "rosemarys-baby", name: "Rosemary's Baby",  description: "Rosemary syrup · Moroccan mint tea",               price: 6, tag: "Calm Cloud" },
];

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Public API ────────────────────────────────────────────────────────────────

app.get("/api/products", (_req, res) => res.json(PRODUCTS));

app.post("/api/waitlist", async (req, res) => {
  try {
    const { email, zip } = req.body || {};
    if (!email || !zip)                             return res.status(400).json({ error: "Email and ZIP are required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Invalid email address." });
    if (!/^\d{5}$/.test(zip))                       return res.status(400).json({ error: "ZIP must be 5 digits." });

    const existing = await db.findOne("waitlist", r => r.email === email);
    if (!existing) await db.insert("waitlist", { email, zip });

    await sendMail(
      email,
      "You're on the Double Shot Electric list ⚡",
      `<p>Hey — you're locked in for the first route in ZIP ${zip}.</p>
       <p>We'll only hit your inbox when delivery opens in your area.</p>
       <p style="color:#E8A547"><strong>Pre-order. Pull up. Get fueled.</strong></p>
       <p>— Double Shot Electric, Las Vegas</p>`
    );

    res.json({ ok: true, message: "You are on the list." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Try again." });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { name, email, phone, address, zip, notes, items } = req.body || {};
    if (!name || !email || !address || !zip || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required order fields." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Invalid email." });
    if (!/^\d{5}$/.test(zip))                        return res.status(400).json({ error: "Invalid ZIP." });

    const subtotal    = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const orderNumber = "DSE-" + Date.now().toString(36).toUpperCase();
    const itemsHtml   = items.map(i => `<li>${i.name} &times; ${i.quantity} — $${i.price * i.quantity}</li>`).join("");

    await db.insert("orders", {
      order_number: orderNumber,
      name, email,
      phone:   phone   || "",
      address, zip,
      notes:   notes   || "",
      items, subtotal,
      status: "pending",
    });

    await sendMail(
      email,
      `Your Double Shot Electric order ${orderNumber}`,
      `<p>Hey ${name},</p>
       <p>Your order is confirmed — we'll reach out before we pull up to deliver.</p>
       <hr>
       <p><strong>Order:</strong> ${orderNumber}</p>
       <ul>${itemsHtml}</ul>
       <p><strong>Subtotal: $${subtotal}</strong> — Cash on delivery</p>
       <p><strong>Delivery to:</strong> ${address}, ${zip}</p>
       ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
       <p style="color:#E8A547"><strong>Pre-order. Pull up. Get fueled.</strong></p>
       <p>— Double Shot Electric, Las Vegas</p>`
    );

    if (process.env.GMAIL_USER) {
      await sendMail(
        process.env.GMAIL_USER,
        `New order ${orderNumber} — $${subtotal}`,
        `<p><strong>${name}</strong> (${email}${phone ? ", " + phone : ""})</p>
         <p>${address}, ${zip}</p>
         ${notes ? `<p>Notes: ${notes}</p>` : ""}
         <ul>${itemsHtml}</ul>
         <p><strong>Total: $${subtotal} COD</strong></p>`
      );
    }

    res.json({ ok: true, orderNumber, subtotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not place order. Try again." });
  }
});

// ── Admin API ─────────────────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"] || req.query.key;
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized." });
  next();
}

app.get("/api/admin/waitlist", requireAdmin, async (_req, res) => {
  res.json(await db.getAll("waitlist"));
});

app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  res.json(await db.getAll("orders"));
});

app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const allowed = ["pending", "confirmed", "out-for-delivery", "delivered", "cancelled"];
  const { status } = req.body || {};
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status." });
  const ok = await db.updateOne("orders", parseInt(req.params.id, 10), { status });
  ok ? res.json({ ok: true }) : res.status(404).json({ error: "Order not found." });
});

app.get("/api/admin/waitlist.csv", requireAdmin, async (_req, res) => {
  const rows = await db.getAll("waitlist");
  const csv  = ["id,email,zip,created_at", ...rows.map(r => `${r.id},${r.email},${r.zip},${r.created_at}`)].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="dse-waitlist.csv"');
  res.send(csv);
});

app.get("/api/admin/orders.csv", requireAdmin, async (_req, res) => {
  const rows = await db.getAll("orders");
  const csv  = [
    "id,order_number,name,email,phone,address,zip,subtotal,status,created_at",
    ...rows.map(r => `${r.id},${r.order_number},"${r.name}",${r.email},${r.phone || ""},"${r.address}",${r.zip},${r.subtotal},${r.status},${r.created_at}`),
  ].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="dse-orders.csv"');
  res.send(csv);
});

// ── Start (skipped on Vercel — it uses module.exports instead) ────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n  Double Shot Electric — server running`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Admin: http://localhost:${PORT}/admin.html`);
    console.log(`  Storage: ${process.env.KV_REST_API_URL ? "Vercel KV" : "local JSON file"}`);
    console.log(`  Email:   ${mailer ? "Gmail SMTP enabled" : "disabled — set GMAIL_USER + GMAIL_PASS in .env"}\n`);
  });
}

module.exports = app;
