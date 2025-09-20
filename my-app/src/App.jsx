import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
// Pastikan file api.js ada dan sudah benar
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "./api";
import "./App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    jenis_transaksi: "income",
    kategory_transaksi: "",
    jumlah_transaksi: "",
    tanggal_transaksi: "",
  });
  const [editId, setEditId] = useState(null);

  // 1. Mengambil data dari server saat komponen pertama kali dimuat
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      // Menyimpan data dari database ke dalam state 'transactions'
      setTransactions(res.data);
    } catch (err) {
      console.error("Gagal mengambil data transaksi:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.kategory_transaksi || !form.jumlah_transaksi || !form.tanggal_transaksi) {
      return alert("Harap lengkapi semua field!");
    }

    try {
      if (editId) {
        await updateTransaction(editId, form);
        setEditId(null);
      } else {
        await addTransaction(form);
      }
      // Reset form dan ambil ulang data terbaru
      setForm({ jenis_transaksi: "income", kategory_transaksi: "", jumlah_transaksi: "", tanggal_transaksi: "" });
      fetchTransactions();
    } catch (err) {
      console.error("Gagal mengirim transaksi:", err);
    }
  };

  const handleDelete = async (id) => {
    // Penjaga untuk memastikan ID valid
    if (typeof id === 'undefined') {
      console.error("Gagal menghapus: ID tidak ditemukan.");
      return;
    }
    
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      console.error("Gagal menghapus transaksi:", err);
    }
  };

  const handleEdit = (transaction) => {
    // Mengubah format tanggal agar sesuai dengan input type="date" (YYYY-MM-DD)
    const formattedDate = transaction.tanggal_transaksi
      ? new Date(transaction.tanggal_transaksi).toISOString().split("T")[0]
      : "";
    
    // Membersihkan data (mengubah null/undefined menjadi string kosong)
    setForm({
      jenis_transaksi: transaction.jenis_transaksi || "income",
      kategory_transaksi: transaction.kategory_transaksi || "",
      jumlah_transaksi: transaction.jumlah_transaksi || "",
      tanggal_transaksi: formattedDate,
    });
    setEditId(transaction.id);
  };

  // Logika untuk mempersiapkan data chart
  const monthlyData = {};
  if (Array.isArray(transactions)) {
    transactions.forEach((t) => {
      if (!t.tanggal_transaksi) return;
      const month = new Date(t.tanggal_transaksi).toLocaleString("id-ID", { month: "short", year: "numeric" });
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
      if (t.jenis_transaksi === "income") {
        monthlyData[month].income += parseFloat(t.jumlah_transaksi || 0);
      } else {
        monthlyData[month].expense += parseFloat(t.jumlah_transaksi || 0);
      }
    });
  }

  const labels = Object.keys(monthlyData);
  const data = {
    labels,
    datasets: [
      { label: "Pemasukan", data: labels.map((m) => monthlyData[m].income), backgroundColor: "#36A2EB" },
      { label: "Pengeluaran", data: labels.map((m) => monthlyData[m].expense), backgroundColor: "#FF6384" },
    ],
  };

  return (
    <div className="app-container">
      <h1 className="title">💰 Catatan Keuangan Sederhana</h1>

      <form onSubmit={handleSubmit} className="transaction-form">
        <select name="jenis_transaksi" value={form.jenis_transaksi} onChange={handleChange} className="form-input">
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <input type="text" name="kategory_transaksi" placeholder="Kategori" value={form.kategory_transaksi} onChange={handleChange} className="form-input" />
        <input type="number" name="jumlah_transaksi" placeholder="Jumlah" value={form.jumlah_transaksi} onChange={handleChange} className="form-input" />
        <input type="date" name="tanggal_transaksi" value={form.tanggal_transaksi} onChange={handleChange} className="form-input" />
        <button type="submit" className="form-button">{editId ? "Update" : "Tambah"}</button>
      </form>

      <h2 style={{ marginTop: '40px' }}>📝 Daftar Transaksi</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Tipe</th>
            <th>Kategori</th>
            <th>Jumlah</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {/* 2. Menampilkan data jika ada, jika tidak, tampilkan pesan */}
          {transactions && transactions.length > 0 ? (
            transactions.map((t) => (
              // Hanya render baris jika data dan ID-nya valid
              t && t.id ? (
                <tr key={t.id}>
                  <td>{t.jenis_transaksi === "income" ? "Pemasukan" : "Pengeluaran"}</td>
                  <td>{t.kategory_transaksi}</td>
                  <td>Rp {parseFloat(t.jumlah_transaksi || 0).toLocaleString('id-ID')}</td>
                  <td>{t.tanggal_transaksi ? new Date(t.tanggal_transaksi).toLocaleDateString("id-ID") : 'Tanggal tidak valid'}</td>
                  <td>
                    <button onClick={() => handleEdit(t)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="delete-btn">Hapus</button>
                  </td>
                </tr>
              ) : null
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Belum ada data transaksi. Silakan tambahkan data baru.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "40px" }}>
        <h2>📊 Ringkasan Per Bulan</h2>
        <div className="chart-container">
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
