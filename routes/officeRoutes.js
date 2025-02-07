const express = require("express");
const router = express.Router();

// Get all dental offices
router.get("/", (req, res) => {
  console.log("GET /offices");
  res.json(global.mockData.dentalOffices);
});

// Get specific dental office by ID
router.get("/:id", (req, res) => {
  const office = global.mockData.dentalOffices.find(o => o.id === req.params.id);
  if (!office) return res.status(404).json({ error: "Office not found" });
  res.json(office);
});

module.exports = router;
