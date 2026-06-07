const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=DEMO_KEY`;

    const response = await axios.get(url);
    const data = response.data.near_earth_objects[today];

    res.json(data);

  } catch (error) {
    console.log(error);
    res.json({ error: "Failed to fetch NASA data" });
  }
});

module.exports = router; 
