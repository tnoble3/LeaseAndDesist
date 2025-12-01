const promptTemplate = `
You are an AI coach that generates concise practice challenges tailored to a user's goal.
- Goal: "{goalTitle}"
- Focus: "{focus}"

Respond with a compact JSON object:
{
  "title": "short challenge title (max 70 chars)",
  "description": "2-3 sentence plan with an action, a constraint, and an outcome"
}
`.trim();

const fallbackTemplates = [
  (topic) => ({
    title: `90-minute deep dive on ${topic}`,
    description: `Pick one tricky part of ${topic} and spend 90 focused minutes researching, outlining next steps, and capturing open questions.`,
  }),
  (topic) => ({
    title: `Define success for ${topic}`,
    description: `Write 3 concrete outcomes that would make ${topic} a win. Turn each into a checklist item you can tackle this week.`,
  }),
  (topic) => ({
    title: `Ship the smallest slice of ${topic}`,
    description: `Identify a tiny version of ${topic} you can deliver today. Build it, gather feedback, and decide the next slice.`,
  }),
  (topic) => ({
    title: `Unblock ${topic}`,
    description: `List the top 3 blockers for ${topic}, pick the biggest one, and brainstorm 5 ways to remove it. Execute the best option today.`,
  }),
  (topic) => ({
    title: `Ask for feedback on ${topic}`,
    description: `Draft a short update on ${topic}, send it to someone you trust, and collect 2-3 insights you can apply immediately.`,
  }),
];

const safeText = (value, fallback = "") => value?.toString().trim() || fallback;

const hashIndex = (input, modulo) =>
  Math.abs(
    safeText(input)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % modulo;

export const buildPrompt = ({ goalTitle, focus }) => {
  const subject = safeText(goalTitle, "a personal goal");
  const focalPoint = safeText(focus, subject);

  return promptTemplate
    .replace("{goalTitle}", subject)
    .replace("{focus}", focalPoint);
};

const buildFallbackChallenge = (subject) => {
  const topic = safeText(subject, "your next milestone");
  const index = hashIndex(topic, fallbackTemplates.length);
  return fallbackTemplates[index](topic);
};

const callOpenAI = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (typeof fetch !== "function") {
    return null;
  }

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
            "You create concise practice challenges that are immediately actionable. Keep titles short.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response missing content");
  }

  const parsed = JSON.parse(content);
  return parsed;
};

export const generateChallenge = async ({ goalTitle, focus }) => {
  const prompt = buildPrompt({ goalTitle, focus });

  try {
    const openAiResult = await callOpenAI(prompt);
    if (openAiResult?.title && openAiResult?.description) {
      return { prompt, provider: "openai", challenge: openAiResult };
    }
  } catch (error) {
    console.warn("OpenAI generation failed, using fallback", error?.message || error);
  }

  const fallback = buildFallbackChallenge(goalTitle || focus);
  return {
    prompt,
    provider: process.env.OPENAI_API_KEY ? "openai:fallback" : "template",
    challenge: fallback,
  };
};
