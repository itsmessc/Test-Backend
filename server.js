const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const officeRoutes = require("./routes/officeRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const dentistRoutes = require("./routes/dentistRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

const DB_PATH = path.join(__dirname, "db.json");

// 📌 **Helper function to load and save data**
const loadDatabase = () => {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
};
const saveDatabase = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Load mock database into global state
global.mockData = loadDatabase();
console.log("Loaded mock data");

// Routes
app.use("/auth", authRoutes);
app.use("/dental-offices", officeRoutes);
app.use("/services", serviceRoutes);
app.use("/dentists", dentistRoutes);
app.use("/appointments", appointmentRoutes);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Mock API is running on http://localhost:${PORT}`);
});
