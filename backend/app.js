// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/testdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Example route
app.get("/api/users", async (req, res) => {
  res.json({
    message: "Backend connected to MongoDB!",
  });
});

app.listen(3002, () => {
  console.log("Backend running on port 3002");
});
