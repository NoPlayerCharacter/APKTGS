const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",     // default user XAMPP
  password: "",     // default kosong di XAMPP
  database: "keuangan_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

module.exports = db;
