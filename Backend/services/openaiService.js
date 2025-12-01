import fetch from "node-fetch";

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

export const callOpenAI = async (messages = [], options = {}) => {
  // If there's no key (CI/test or development), return a deterministic fallback
  if (!OPENAI_KEY) {
    return {
      id: "local-fallback",
      object: "chat.completion",
      choices: [
        { message: { role: "assistant", content: options.mock || "fallback response (no key configured)" } }
      ]
    };
  }

  const payload = {
    model: options.model || "gpt-4o-mini",
    messages,
    max_tokens: options.maxTokens || 400,
    temperature: typeof options.temperature === "number" ? options.temperature : 0.6
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json;
};
