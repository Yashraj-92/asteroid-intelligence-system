const express = require("express");
const router = express.Router();
const axios = require("axios");

const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
const GEMINI_MODEL = "gemini-1.5-flash";

router.post("/", async (req, res) => {
  const userMessage = req.body.message || "";

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        contents: [
          {
            parts: [
              {
                text: `Reply only in English. Be concise and professional.

User: ${userMessage}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 200
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        }
      }
    );

    const aiReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response.";

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Gemini error:", error.response?.data || error.message);

    res.json({
      reply: "The AI service is temporarily unavailable due to quota limits. Please try again shortly."
    });
  }
});

module.exports = router;
