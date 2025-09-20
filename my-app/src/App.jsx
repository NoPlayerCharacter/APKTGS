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
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "./api";
import "./App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "income",
    category: "",
    amount: "",
    date: "",
  });
  const [editIndex, setEditIndex] = useState(null);

  // Fetch data dari backend
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetch transactions:", err);
    }
  };

  // Handle input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Tambah / Update transaksi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date)
      return alert("Lengkapi semua field!");

    try {
      if (editIndex !== null) {
        await updateTransaction(transactions[editIndex].id, form);
        setEditIndex(null);
      } else {
        await addTransaction(form);
      }
      setForm({ type: "income", category: "", amount: "", date: "" });
      fetchTransactions();
    } catch (err) {
      console.error("Error submit transaction:", err);
    }
  };

  // Hapus transaksi
  const handleDelete = async (index) => {
    try {
      await deleteTransaction(transactions[index].id);
      fetchTransactions();
    } catch (err) {
      console.error("Error delete transaction:", err);
    }
  };

  // Edit transaksi
  const handleEdit = (index) => {
    setForm(transactions[index]);
    setEditIndex(index);
  };

  // Buat data chart per bulan
  const monthlyData = {};
  transactions.forEach((t) => {
    const month = new Date(t.date).toLocaleString("id-ID", {
      month: "short",
      year: "numeric",
    });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };

    if (t.type === "income") {
      monthlyData[month].income += parseFloat(t.amount);
    } else {
      monthlyData[month].expense += parseFloat(t.amount);
    }
  });

  const labels = Object.keys(monthlyData);
  const data = {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        data: labels.map((m) => monthlyData[m].income),
        backgroundColor: "#36A2EB",
      },
      {
        label: "Pengeluaran",
        data: labels.map((m) => monthlyData[m].expense),
        backgroundColor: "#FF6384",
      },
    ],
  };

  return (
    <div className="app-container">
      <h1 className="title">💰 Catatan Keuangan Sederhana</h1>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="transaction-form">
        <select name="type" value={form.type} onChange={handleChange} className="form-input">
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <input
          type="text"
          name="category"
          placeholder="Kategori"
          value={form.category}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="number"
          name="amount"
          placeholder="Jumlah"
          value={form.amount}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="form-input"
        />
        <button type="submit" className="form-button">
          {editIndex !== null ? "Update" : "Tambah"}
        </button>
      </form>

      {/* Tabel Transaksi */}
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
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Belum ada data
              </td>
            </tr>
          ) : (
            transactions.map((t, i) => (
              <tr key={t.id}>
                <td>{t.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
                <td>{t.category}</td>
                <td>Rp {parseFloat(t.amount).toLocaleString()}</td>
                <td>{t.date}</td>
                <td>
                  <button onClick={() => handleEdit(i)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(i)} className="delete-btn">
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Chart Bulanan */}
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
