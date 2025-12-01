import express from "express";
import { OpenAI } from "openai";
import AIFeedback from "../models/aiFeedback.js";
import AIPromptService from "../services/aiPromptService.js";

const router = express.Router();

// Lazy-load OpenAI client to avoid errors when API key is not set
let openai = null;
const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

/**
 * POST /ai/generateChallenge
 * Generate an AI-powered coding challenge
 */
router.post("/generateChallenge", async (req, res) => {
  try {
    const { difficulty = "medium", topic = "general programming", language = "JavaScript" } = req.body;

    // Validate parameters
    const validation = AIPromptService.validatePromptParams({
      difficulty,
      topic,
      language,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Generate prompt
    const prompt = AIPromptService.generateChallengePrompt({
      difficulty,
      topic,
      language,
    });

    console.log(`[AI Service] Generating challenge - Difficulty: ${difficulty}, Topic: ${topic}, Language: ${language}`);

    // Call OpenAI API
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert programming instructor. Generate well-structured coding challenges for students learning to code.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0].message.content;

    // Log the prompt and response
    console.log(`[AI Service] Challenge generated successfully`);
    console.log(`[AI Service] Model: ${completion.model}`);
    console.log(`[AI Service] Tokens used - Prompt: ${completion.usage.prompt_tokens}, Completion: ${completion.usage.completion_tokens}`);

    // Parse the response (it should be JSON)
    let parsedResponse;
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      parsedResponse = JSON.parse(jsonMatch ? jsonMatch[0] : responseContent);
    } catch (parseError) {
      console.warn("[AI Service] Could not parse response as JSON, returning raw text");
      parsedResponse = {
        title: "Generated Challenge",
        description: responseContent,
        examples: [],
        hints: [],
        approach: "See description",
      };
    }

    res.json({
      success: true,
      challenge: parsedResponse,
      metadata: {
        difficulty,
        topic,
        language,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[AI Service] Error generating challenge:", error.message);

    // Check if it's an OpenAI API error
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Invalid OpenAI API key",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Rate limited by OpenAI. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to generate challenge. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /ai/submitForFeedback
 * Submit work for AI feedback
 */
router.post("/submitForFeedback", async (req, res) => {
  try {
    const { userId, submissionContent, submissionType = "text", fileName = "" } = req.body;

    // Validate required fields
    if (!userId || !submissionContent) {
      return res.status(400).json({
        success: false,
        error: "userId and submissionContent are required",
      });
    }

    if (!["text", "file"].includes(submissionType)) {
      return res.status(400).json({
        success: false,
        error: "submissionType must be 'text' or 'file'",
      });
    }

    // Validate parameters
    const validation = AIPromptService.validatePromptParams({
      submission: submissionContent,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Generate feedback prompt
    const feedbackPrompt = AIPromptService.generateFeedbackPrompt({
      submission: submissionContent,
      assignmentContext: "a code submission",
    });

    console.log(`[AI Service] Processing feedback submission for user: ${userId}`);

    // Call OpenAI API for feedback
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful programming mentor providing constructive feedback on student code submissions. Be encouraging and specific in your suggestions.",
        },
        {
          role: "user",
          content: feedbackPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0].message.content;

    console.log(`[AI Service] Feedback generated successfully for user: ${userId}`);

    // Save feedback to database
    const feedbackRecord = new AIFeedback({
      user: userId,
      submissionType,
      submissionContent,
      submissionFileName: fileName,
      prompt: feedbackPrompt,
      response: aiResponse,
    });

    await feedbackRecord.save();

    console.log(`[AI Service] Feedback saved to database with ID: ${feedbackRecord._id}`);

    res.json({
      success: true,
      feedbackId: feedbackRecord._id,
      feedback: aiResponse,
      metadata: {
        submissionType,
        processedAt: new Date().toISOString(),
        tokensUsed: completion.usage.total_tokens,
      },
    });
  } catch (error) {
    console.error("[AI Service] Error processing feedback:", error.message);

    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Invalid OpenAI API key",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Rate limited by OpenAI. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to process feedback. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /ai/feedback/:feedbackId
 * Retrieve saved feedback
 */
router.get("/feedback/:feedbackId", async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await AIFeedback.findById(feedbackId).populate("user", "name email");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found",
      });
    }

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("[AI Service] Error retrieving feedback:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve feedback",
    });
  }
});

/**
 * GET /ai/feedback/user/:userId
 * Get all feedback for a user
 */
router.get("/feedback/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const feedbackList = await AIFeedback.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      feedbacks: feedbackList,
      count: feedbackList.length,
    });
  } catch (error) {
    console.error("[AI Service] Error retrieving user feedback:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve feedback",
    });
  }
});

export default router;
