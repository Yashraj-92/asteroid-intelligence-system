const express = require("express");
const router = express.Router();
const axios = require("axios");

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getDefaultDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 2);

  return {
    start: formatDate(today),
    end: formatDate(end),
  };
}

router.get("/range", async (req, res) => {
  try {
    const defaults = getDefaultDates();
    const startDate = req.query.start_date || defaults.start;
    const endDate = req.query.end_date || defaults.end;

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
    const response = await axios.get(url);

    const neo = response.data.near_earth_objects || {};
    const allAsteroids = [];
    const dailyCounts = [];

    Object.keys(neo).forEach((date) => {
      const asteroids = neo[date] || [];
      dailyCounts.push({
        date,
        count: asteroids.length,
        hazardous: asteroids.filter(a => a.is_potentially_hazardous_asteroid).length,
      });

      asteroids.forEach((a) => {
        const approach = a.close_approach_data?.[0] || {};
        allAsteroids.push({
          id: a.id,
          date,
          name: a.name,
          hazardous: a.is_potentially_hazardous_asteroid,
          nasaUrl: a.nasa_jpl_url,
          diameterMaxMeters:
            a.estimated_diameter?.meters?.estimated_diameter_max || 0,
          missDistanceKm: Number(approach.miss_distance?.kilometers || 0),
          speedKph: Number(
            approach.relative_velocity?.kilometers_per_hour || 0
          ),
          closeApproachDate: approach.close_approach_date || date,
        });
      });
    });

    const hazardousCount = allAsteroids.filter(a => a.hazardous).length;
    const closest = [...allAsteroids].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0] || null;
    const fastest = [...allAsteroids].sort((a, b) => b.speedKph - a.speedKph)[0] || null;
    const largest = [...allAsteroids].sort((a, b) => b.diameterMaxMeters - a.diameterMaxMeters)[0] || null;

    res.json({
      startDate,
      endDate,
      total: allAsteroids.length,
      hazardousCount,
      closest,
      fastest,
      largest,
      dailyCounts,
      asteroids: allAsteroids,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch NASA range data" });
  }
});

router.get("/today", async (req, res) => {
  try {
    const today = formatDate(new Date());
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
    const response = await axios.get(url);

    const asteroids = response.data.near_earth_objects?.[today] || [];

    const formatted = asteroids.map((a) => {
      const approach = a.close_approach_data?.[0] || {};
      return {
        id: a.id,
        name: a.name,
        hazardous: a.is_potentially_hazardous_asteroid,
        nasaUrl: a.nasa_jpl_url,
        diameterMaxMeters:
          a.estimated_diameter?.meters?.estimated_diameter_max || 0,
        missDistanceKm: Number(approach.miss_distance?.kilometers || 0),
        speedKph: Number(
          approach.relative_velocity?.kilometers_per_hour || 0
        ),
        closeApproachDate: approach.close_approach_date || today,
      };
    });

    const hazardousCount = formatted.filter((a) => a.hazardous).length;
    const closest = [...formatted].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0] || null;
    const fastest = [...formatted].sort((a, b) => b.speedKph - a.speedKph)[0] || null;

    res.json({
      date: today,
      total: formatted.length,
      hazardousCount,
      closest,
      fastest,
      asteroids: formatted,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch NASA data" });
  }
});

module.exports = router;
