import axios from "axios";

const API_URL = "http://localhost:5000/api/transaksi";

// GET semua transaksi
export const getTransactions = () => axios.get(API_URL);

// POST tambah transaksi
export const addTransaction = (data) => axios.post(API_URL, data);

// PUT update transaksi
export const updateTransaction = (id, data) => axios.put(`${API_URL}/${id}`, data);

// DELETE transaksi
export const deleteTransaction = (id) => axios.delete(`${API_URL}/${id}`);
