const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dbPath = path.join(__dirname, "../db.json");

const secretKey = process.env.JWT_SECRET || "your-secret-key";

// 📌 Load database file
const loadDatabase = () => {
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

// 📌 Save database file
const saveDatabase = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// 📌 **Signup Route**
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const db = loadDatabase();

    // Check if email is already registered
    if (db.users.some(user => user.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: db.users.length + 1, name, email, phone, password: hashedPassword };

    // Store new user in the database
    db.users.push(newUser);
    saveDatabase(db);

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id, email }, secretKey, { expiresIn: "1h" });

    res.json({ message: "Signup successful", user: { id: newUser.id, name, email, phone }, token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 **Login Route**
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = loadDatabase();

    // Find user
    const user = db.users.find(user => user.email === email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email }, secretKey, { expiresIn: "1h" });

    res.json({ message: "Login successful", user: { id: user.id, name: user.name, email, phone: user.phone }, token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 **Get Current User (Protected Route)**
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, secretKey);
    const db = loadDatabase();
    const user = db.users.find(user => user.id === decoded.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
