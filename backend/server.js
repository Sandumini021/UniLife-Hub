const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/UniLife")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});