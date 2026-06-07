const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

router.get("/", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ ok: false, step: "env", error: "GEMINI_API_KEY missing" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Reply with exactly: Gemini test ok",
    });

    res.json({
      ok: true,
      text: response.text || null,
    });
  } catch (error) {
    console.error("Gemini test route error:", error);
    res.json({
      ok: false,
      step: "model_call",
      error: String(error?.message || error),
    });
  }
});

module.exports = router; 
