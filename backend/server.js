const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Task = require("./models/Task");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Mongo error:", err);
  });

// BLUE/GREEN IDENTIFICATION

app.get("/health", (req, res) => {
  res.json({
    status: "UP",

    instance: process.env.INSTANCE_NAME,

    version: "GREEN RELEASE",
  });
});

// GET TASKS

app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();

  res.json({
    instance: process.env.INSTANCE_NAME,

    tasks,
  });
});

// CREATE TASK

app.post("/api/tasks", async (req, res) => {
  const task = await Task.create({
    title: req.body.title,
  });

  res.json({
    message: "Task created",

    instance: process.env.INSTANCE_NAME,

    task,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend ${process.env.INSTANCE_NAME} running`);
});
