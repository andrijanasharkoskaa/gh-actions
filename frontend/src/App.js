import React, { useEffect, useState } from "react";

import axios from "axios";

import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");

  const [instance, setInstance] = useState("");

  const loadTasks = async () => {
    try {
      const response = await axios.get("/api/tasks");

      setTasks(response.data.tasks);

      setInstance(response.data.instance);
    } catch (error) {
      setInstance("Backend unavailable");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async () => {
    await axios.post("/api/tasks", {
      title: title,
    });

    setTitle("");

    loadTasks();
  };

  return (
    <div className="container">
      <h1>Green version - New release</h1>

      <h2>
        Running on:
        <span className="instance">{instance}</span>
      </h2>

      <div className="form">
        <input
          placeholder="Task name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button onClick={addTask}>Add</button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>😁😁😁 {task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
