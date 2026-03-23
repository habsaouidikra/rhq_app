const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", async (req, res) => {
  try {
    const rows = await db.all_("SELECT * FROM rhq WHERE status = 'approved' ORDER BY CAST(rhq_id AS INTEGER) ASC, id ASC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/submit", async (req, res) => {
  const { tarifit, locutionary, illocutionary, act, function: fn, structural, submitted_by } = req.body;
  if (!tarifit || !tarifit.trim()) return res.status(400).json({ error: "Tarifit text is required" });
  try {
    const result = await db.run_(
      `INSERT INTO rhq (tarifit, locutionary, illocutionary, act, function, structural, submitted_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [tarifit.trim(), locutionary || null, illocutionary || null, act || null, fn || null, structural || null, submitted_by || "anonymous"]
    );
    res.json({ success: true, id: result.lastID });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
