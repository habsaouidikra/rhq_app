const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "rhq.db"));

db.run_ = (sql, params = []) =>
  new Promise((res, rej) =>
    db.run(sql, params, function (err) {
      if (err) rej(err);
      else res({ lastID: this.lastID, changes: this.changes });
    })
  );

db.get_ = (sql, params = []) =>
  new Promise((res, rej) =>
    db.get(sql, params, (err, row) => (err ? rej(err) : res(row)))
  );

db.all_ = (sql, params = []) =>
  new Promise((res, rej) =>
    db.all(sql, params, (err, rows) => (err ? rej(err) : res(rows)))
  );

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS rhq (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rhq_id TEXT,
    tarifit TEXT NOT NULL,
    locutionary TEXT,
    illocutionary TEXT,
    act TEXT,
    function TEXT,
    structural TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    illustration TEXT,
    submitted_by TEXT DEFAULT 'anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )`);

  db.get("SELECT * FROM admin WHERE id = 1", (err, row) => {
    if (!row) {
      db.run("INSERT INTO admin (id, username, password) VALUES (1, ?, ?)", ["admin", "rhq2024"]);
    }
  });
});

module.exports = db;
