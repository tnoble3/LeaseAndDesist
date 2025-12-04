import nodeFetch from "node-fetch";

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

const resolveFetch = () => (typeof fetch === "function" ? fetch : nodeFetch);

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const fetchFn = resolveFetch();
  if (typeof fetchFn !== "function") return null;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetchFn(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.55,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini feedback failed: ${response.status} ${errText}`);
  }

  const payload = await response.json();
  const content =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text ||
    payload?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!content) {
    throw new Error("Gemini feedback missing content");
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
    const result = await callGemini(prompt);
    if (result?.feedback) {
      return { prompt, provider: "gemini", feedback: result.feedback };
    }
  } catch (error) {
    console.warn("Gemini feedback failed, using fallback", error?.message || error);
  }

  const fallback = fallbackFeedback(summary);
  return {
    prompt,
    provider: process.env.GEMINI_API_KEY ? "gemini:fallback" : "template",
    feedback: fallback.feedback,
  };
};
