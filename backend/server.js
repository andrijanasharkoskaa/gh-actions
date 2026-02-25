const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: "db",
  user: "postgres",
  password: "postgres",
  database: "mydb",
  port: 5432,
});

app.get("/api/users", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ message: "Backend connected to DB!", time: result.rows[0] });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
