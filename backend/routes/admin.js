const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { parse } = require("csv-parse/sync");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const upload = multer({ storage: multer.memoryStorage() });
const ILLUSTRATIONS_DIR = path.join(__dirname, "../public/illustrations");
if (!fs.existsSync(ILLUSTRATIONS_DIR)) fs.mkdirSync(ILLUSTRATIONS_DIR, { recursive: true });

const GIPHY_KEY = "JD7N0LElpqElcLRCgNC9XlCZh0knJ89z";
const GEMINI_KEY = "AIzaSyCNfunp0vr-IxRc3pJ8wi-9-CJzzdA0ekM";

async function auth(req, res, next) {
  const { username, password } = req.headers;
  const admin = await db.get_("SELECT * FROM admin WHERE username=? AND password=?", [username, password]);
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  next();
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await db.get_("SELECT * FROM admin WHERE username=? AND password=?", [username, password]);
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ success: true, username });
});

router.get("/pending", auth, async (req, res) => {
  const rows = await db.all_("SELECT * FROM rhq WHERE status IN ('pending','approved_pending') ORDER BY created_at ASC");
  res.json(rows);
});

router.get("/all", auth, async (req, res) => {
  const rows = await db.all_("SELECT * FROM rhq ORDER BY created_at DESC");
  res.json(rows);
});

router.get("/export-csv", auth, async (req, res) => {
  const rows = await db.all_("SELECT rhq_id, tarifit, locutionary, illocutionary, act, function, structural, submitted_by, approved_at FROM rhq WHERE status='approved' ORDER BY CAST(rhq_id AS INTEGER) ASC");
  const headers = ["RHQ_ID","Tarifit_RHQ","Locutionary_ENG","Illocutionary_ENG","Act","Function","Structural","Submitted_By","Approved_At"];
  const esc = (v) => v == null ? "" : `"${String(v).replace(/"/g,'""')}"`;
  const csv = [headers.join(","), ...rows.map(r => [r.rhq_id,r.tarifit,r.locutionary,r.illocutionary,r.act,r.function,r.structural,r.submitted_by,r.approved_at].map(esc).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=rhq_corpus.csv");
  res.send(csv);
});

async function generateImage(row) {
  const scene = row.illocutionary || row.locutionary || row.tarifit;
  const fn = row.function || "";

  // Step 1: Gemini crafts a vivid, creative Giphy search query
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are helping find a Giphy GIF for a linguistic research app about Tarifit Berber rhetorical questions.
The GIF should visually express the emotion and situation described below.
Generate a creative, specific, vivid 2-5 word Giphy search query.
Focus on the core emotion and body language — think of animated reactions, expressive faces, relatable human moments.
Be creative and vary your suggestion each time — don't default to generic terms.
Only return the search query itself. No quotes, no punctuation, no explanation.

Pragmatic function: ${fn}
Illocutionary meaning (what is actually meant): ${scene}`
          }]
        }]
      })
    }
  );
  const geminiData = await geminiRes.json();
  const searchQuery = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || `${fn} reaction`;
  console.log(`[GIF] Gemini query for "${fn} / ${scene}": "${searchQuery}"`);

  // Step 2: Search Giphy with random offset for variety on each click
  const randomOffset = Math.floor(Math.random() * 20);
  const giphyRes = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(searchQuery)}&limit=1&offset=${randomOffset}&rating=g&lang=en`
  );
  if (!giphyRes.ok) throw new Error("Giphy error: " + giphyRes.status);
  const giphyData = await giphyRes.json();

  if (!giphyData.data || giphyData.data.length === 0) {
    // Fallback: search just the function name with random offset
    const fallbackRes = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(fn + " emotion")}&limit=1&offset=${randomOffset}&rating=g&lang=en`
    );
    const fallbackData = await fallbackRes.json();
    if (!fallbackData.data || fallbackData.data.length === 0) throw new Error("No GIFs found");
    return fallbackData.data[0].images.original.url;
  }

  return giphyData.data[0].images.original.url;
}

function placeholderSvg(fn) {
  const colors = {
    Frustration:"#C4623A", Irony:"#8E44AD", Disappointment:"#2980B9",
    Complaint:"#D35400", Politeness:"#27AE60", Confirming:"#F39C12",
    Disagreement:"#C0392B", Denial:"#7F8C8D", Suggestion:"#1ABC9C",
    Luring:"#E74C3C", Surprise:"#E67E22", Warn:"#C0392B", Guilt:"#8E44AD",
  };
  const c = colors[fn] || "#95A5A6";
  const hex = c.replace("#","");
  const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
  const light = `rgba(${r},${g},${b},0.08)`;
  const mid = `rgba(${r},${g},${b},0.18)`;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${light}"/><circle cx="200" cy="130" r="55" fill="${mid}"/><circle cx="200" cy="130" r="35" fill="${mid}"/><circle cx="200" cy="130" r="18" fill="${c}" opacity="0.4"/><text x="200" y="210" font-family="Georgia,serif" font-size="15" fill="${c}" text-anchor="middle" opacity="0.7">${fn}</text></svg>`)}`;
}

router.patch("/:id/approve", auth, async (req, res) => {
  const { id } = req.params;
  const fields = ["tarifit","locutionary","illocutionary","act","function","structural","rhq_id"];
  const toUpdate = fields.filter(f => req.body[f] !== undefined);
  if (toUpdate.length > 0) {
    const set = toUpdate.map(f => `${f}=?`).join(", ");
    await db.run_(`UPDATE rhq SET ${set} WHERE id=?`, [...toUpdate.map(f => req.body[f]), id]);
  }
  await db.run_("UPDATE rhq SET status='approved_pending' WHERE id=?", [id]);
  res.json({ success: true });
});

router.patch("/:id/generate", auth, async (req, res) => {
  const row = await db.get_("SELECT * FROM rhq WHERE id=?", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  try {
    const url = await generateImage(row);
    await db.run_("UPDATE rhq SET illustration=? WHERE id=?", [url, req.params.id]);
    res.json({ success: true, url });
  } catch (e) {
    console.error("generateImage error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/publish", auth, async (req, res) => {
  await db.run_("UPDATE rhq SET status='approved', approved_at=CURRENT_TIMESTAMP WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

router.patch("/:id/edit", auth, async (req, res) => {
  const fields = ["tarifit","locutionary","illocutionary","act","function","structural","rhq_id"];
  const toUpdate = fields.filter(f => req.body[f] !== undefined);
  if (!toUpdate.length) return res.json({ success: true });
  const set = toUpdate.map(f => `${f}=?`).join(", ");
  await db.run_(`UPDATE rhq SET ${set} WHERE id=?`, [...toUpdate.map(f => req.body[f]), req.params.id]);
  res.json({ success: true });
});

router.patch("/:id/reject", auth, async (req, res) => {
  await db.run_("UPDATE rhq SET status='rejected' WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

router.delete("/:id", auth, async (req, res) => {
  await db.run_("DELETE FROM rhq WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

router.post("/import-csv", auth, upload.single("file"), async (req, res) => {
  try {
    const records = parse(req.file.buffer.toString("utf-8"), { columns: true, skip_empty_lines: true, trim: true });
    let count = 0;
    for (const r of records) {
      const tarifit = r["Tarifit_RHQ"] || r["tarifit"] || r["TARIFIT"] || "";
      if (!tarifit) continue;
      await db.run_(
        `INSERT INTO rhq (rhq_id, tarifit, locutionary, illocutionary, act, function, structural, status, submitted_by) VALUES (?,?,?,?,?,?,?,'pending','csv-import')`,
        [r["RHQ_ID"]||null, tarifit, r["Locutionary_ENG"]||null, r["Illocutionary_ENG"]||null, r["Act"]||null, r["Function"]||null, r["Structural"]||null]
      );
      count++;
    }
    res.json({ success: true, imported: count });
  } catch (e) {
    res.status(400).json({ error: "CSV error: " + e.message });
  }
});

module.exports = { router, placeholderSvg };
