const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://mongo:27017/testdb") // if using Docker network, use 'mongo'
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Serve frontend (React production build)
app.use(express.static(path.join(__dirname, "../frontend/build")));

// API routes
app.get("/api/users", async (req, res) => {
  res.json({
    message: "Backend connected to MongoDB!",
  });
});

// Serve index.html for all other routes (React routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Backend + Frontend running on port ${PORT}`);
});