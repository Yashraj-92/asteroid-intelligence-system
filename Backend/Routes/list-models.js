 const express = require("express");
const router = express.Router();
const axios = require("axios");

const GEMINI_API_KEY = "YOUR_KEY_HERE";

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://generativelanguage.googleapis.com/v1/models?key=" + GEMINI_API_KEY
    );

    res.json(response.data);
  } catch (error) {
    res.json(error.response?.data || error);
  }
});

module.exports = router;
