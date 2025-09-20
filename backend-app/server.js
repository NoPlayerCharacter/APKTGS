const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Koneksi ke MySQL (sesuaikan user & password XAMPP)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // default XAMPP user
  password: "",       // default XAMPP password kosong
  database: "finance_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// ================== ROUTES ==================

// Ambil semua transaksi
app.get("/transactions", (req, res) => {
  db.query("SELECT * FROM transactions ORDER BY date DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Tambah transaksi
app.post("/transactions", (req, res) => {
  const { type, amount, category, date } = req.body;
  db.query(
    "INSERT INTO transactions (type, amount, category, date) VALUES (?, ?, ?, ?)",
    [type, amount, category, date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, type, amount, category, date });
    }
  );
});

// Edit transaksi
app.put("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { type, amount, category, date } = req.body;
  db.query(
    "UPDATE transactions SET type=?, amount=?, category=?, date=? WHERE id=?",
    [type, amount, category, date, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ updated: result.affectedRows });
    }
  );
});

// Hapus transaksi
app.delete("/transactions/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM transactions WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ deleted: result.affectedRows });
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
