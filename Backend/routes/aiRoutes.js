import express from "express";
import { callOpenAI } from "../services/openaiService.js";
import { templates, renderTemplate } from "../services/promptTemplates.js";
import AIFeedback from "../models/aiFeedback.js";
import prisma from "../services/prismaClient.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Protect all AI routes
router.use(auth);

router.post("/generateChallenge", async (req, res) => {
  try {
    const { topic = "javascript fundamentals", difficulty = "beginner" } = req.body;

    const prompt = renderTemplate(templates.generateChallenge.template, { topic, difficulty });

    const messages = [
      { role: "system", content: "You must return JSON only." },
      { role: "user", content: prompt }
    ];

    const aiResponse = await callOpenAI(messages, { temperature: 0.55 });
    const content = aiResponse?.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      parsed = { title: `AI: ${topic}`, description: content };
    }

    const record = await AIFeedback.create({
      submissionId: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user: req.userId || null,
      prompt,
      response: { raw: content, aiResponseId: aiResponse?.id },
      source: "generateChallenge"
    });

    // Also persist a lightweight copy into Prisma (helps satisfy Prisma migration/story requirement)
    try {
      await prisma.aiFeedback.create({
        data: {
          submissionId: record.submissionId,
          prompt,
          response: parsed,
          source: "generateChallenge",
        },
      });
    } catch (pErr) {
      // Do not fail the request if Prisma write fails — log for later inspection
      console.warn("Prisma persist warning:", pErr?.message || pErr);
    }

    res.json({ source: "ai", generated: parsed, auditId: record.submissionId, raw: content });
  } catch (error) {
    console.error("AI GenerateChallenge error:", error?.message || error);
    res.status(500).json({ message: "AI generation failed", error: error?.message || error });
  }
});

router.post("/submitForFeedback", async (req, res) => {
  try {
    const { submission = "" } = req.body;
    if (!submission || submission.trim().length === 0) {
      return res.status(400).json({ message: "Submission content required." });
    }

    const prompt = renderTemplate(templates.feedbackReview.template, { submission });

    const messages = [
      { role: "system", content: "Return compact JSON only." },
      { role: "user", content: prompt }
    ];

    const aiResponse = await callOpenAI(messages, { maxTokens: 600 });
    const content = aiResponse?.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      parsed = { message: content };
    }

    const record = await AIFeedback.create({
      submissionId: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user: req.userId || null,
      prompt,
      response: parsed,
      source: "submitForFeedback"
    });

    // Also replicate to Prisma
    try {
      await prisma.aiFeedback.create({
        data: {
          submissionId: record.submissionId,
          prompt,
          response: parsed,
          source: "submitForFeedback",
        },
      });
    } catch (pErr) {
      console.warn("Prisma persist warning:", pErr?.message || pErr);
    }

    res.status(201).json({ auditId: record.submissionId, feedback: parsed });
  } catch (error) {
    console.error("AI submitForFeedback error:", error?.message || error);
    res.status(500).json({ message: "AI feedback failed", error: error?.message || error });
  }
});

export default router;
