const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// GET semua transaksi
app.get("/api/transaksi", (req, res) => {
  // FIX: Mengubah 'id_transaksi' menjadi 'id' menggunakan alias SQL
  db.query("SELECT id_transaksi AS id, jenis_transaksi, jumlah_transaksi, kategory_transaksi, tanggal_transaksi FROM tb_transaksi", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
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
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Transaksi berhasil ditambahkan", id: result.insertId });
    }
  );
});

// Update transaksi (edit)
app.put("/api/transaksi/:id", (req, res) => {
  const { id } = req.params;
  const { jenis_transaksi, jumlah_transaksi, kategory_transaksi, tanggal_transaksi } = req.body;

  // FIX: Menggunakan 'id_transaksi' di klausa WHERE
  db.query(
    "UPDATE tb_transaksi SET jenis_transaksi = ?, jumlah_transaksi = ?, kategory_transaksi = ?, tanggal_transaksi = ? WHERE id_transaksi = ?",
    [jenis_transaksi, jumlah_transaksi, kategory_transaksi, tanggal_transaksi, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      res.json({ message: "Transaksi berhasil diupdate" });
    }
  );
});

// Hapus transaksi
app.delete("/api/transaksi/:id", (req, res) => {
  const { id } = req.params;
  // FIX: Menggunakan 'id_transaksi' di klausa WHERE
  db.query("DELETE FROM tb_transaksi WHERE id_transaksi = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    res.json({ message: "Transaksi berhasil dihapus" });
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
