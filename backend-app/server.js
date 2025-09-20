const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// GET semua transaksi
app.get("/api/transaksi", (req, res) => {
  db.query("SELECT * FROM tb_transaksi", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Tambah transaksi
app.post("/api/transaksi", (req, res) => {
  const { jenis_transaksi, jumlah_transaksi, kategory_transaksi, tanggal_transaksi } = req.body;
  db.query(
    "INSERT INTO tb_transaksi (jenis_transaksi, jumlah_transaksi, kategory_transaksi, tanggal_transaksi) VALUES (?, ?, ?, ?)",
    [jenis_transaksi, jumlah_transaksi, kategory_transaksi, tanggal_transaksi],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "Transaksi berhasil ditambahkan", id: result.insertId });
    }
  );
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
