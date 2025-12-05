const feedbackPromptTemplate = `
You are an expert reviewer providing concise, kind feedback.
- Goal: "{goalTitle}"
- Submission summary: "{summary}"

Respond as JSON with:
{
  "feedback": "2-4 sentences with strengths, specific improvements, and one next step"
}
`.trim();

const safeText = (value, fallback = "") => value?.toString().trim() || fallback;

const buildFeedbackPrompt = ({ goalTitle, summary }) => {
  const goal = safeText(goalTitle, "a personal goal");
  const synopsis = safeText(summary, "A short submission was provided.");

  return feedbackPromptTemplate
    .replace("{goalTitle}", goal)
    .replace("{summary}", synopsis);
};

const callOpenAI = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (typeof fetch !== "function") return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a supportive reviewer. Keep feedback concise, actionable, and kind.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.55,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI feedback failed: ${response.status} ${errText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI feedback missing content");
  }

  return JSON.parse(content);
};

const fallbackFeedback = (summary) => {
  const base = safeText(summary, "your work");
  return {
    feedback: `Thanks for sharing ${base}. Strengths: it is clear and purposeful. To improve, tighten the structure, clarify the desired outcome, and add one concrete example. Next step: pick a small section and revise it with these tweaks, then share again for review.`,
  };
};

export const generateFeedback = async ({ goalTitle, summary }) => {
  const prompt = buildFeedbackPrompt({ goalTitle, summary });

  try {
    const result = await callOpenAI(prompt);
    if (result?.feedback) {
      return { prompt, provider: "openai", feedback: result.feedback };
    }
  } catch (error) {
    console.warn("OpenAI feedback failed, using fallback", error?.message || error);
  }

  const fallback = fallbackFeedback(summary);
  return {
    prompt,
    provider: process.env.OPENAI_API_KEY ? "openai:fallback" : "template",
    feedback: fallback.feedback,
  };
};
