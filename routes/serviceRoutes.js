const express = require("express");
const router = express.Router();

// Get all services
router.get("/", (req, res) => {
  res.json(global.mockData.services);
});

module.exports = router;
