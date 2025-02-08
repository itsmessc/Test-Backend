const express = require("express");
const router = express.Router();

// Get all dentists
router.get("/", (req, res) => {
  res.json(global.mockData.dentists);
});

// Get dentists by office ID
router.get("/office/:officeId", (req, res) => {
  const dentists = global.mockData.dentists.filter(d => d.officeId === req.params.officeId);
  res.json(dentists);
});

router.get("/:id", (req, res) => {
  const dentistId = req.params.id;
  const dentist = global.mockData.dentists.find(d => d.id === dentistId);

  if (!dentist) {
    return res.status(404).json({ error: "Dentist not found" });
  }

  res.json(dentist);
});

// Get unavailable slots for a dentist
router.get("/:id/unavailable-slots", (req, res) => {
  const dentist = global.mockData.dentists.find(d => d.id === req.params.id);
  if (!dentist) return res.status(404).json({ error: "Dentist not found" });
  res.json(dentist.unavailableSlots);
});

module.exports = router;
