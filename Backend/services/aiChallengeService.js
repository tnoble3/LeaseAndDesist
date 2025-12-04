import nodeFetch from "node-fetch";

const promptTemplate = `
You are an AI community event planner that suggests one actionable event neighbors can host together.

Context:
- Community goal or theme: "{goalTitle}"
- Focus area: "{focus}"
- Occasion: "{occasion}"

Guidelines:
- Suggest one community event neighbors attend together within a day or weekend (block party, open mic, potluck, courtyard fair, cleanup, workshop).
- Include what happens, who participates, where it happens, materials needed, and the community impact. Keep costs low.
- If an occasion is provided, theme the event around it; otherwise keep it season-neutral.
- Do not suggest personal practice plans, 30-day challenges, journaling, or solo tasks—only shared events that people host or attend.
- Keep titles short and avoid words like "challenge" or "task" in the title.
- Respond with a JSON object only:
{
  "title": "short event title (max 70 chars)",
  "description": "2-3 sentences with what happens, who participates, materials, and the community benefit"
}
`.trim();

const fallbackTemplates = [
  (topic, occasion) => ({
    title: occasion
      ? `${occasion} courtyard social`
      : `Courtyard meetup for ${topic}`,
    description: occasion
      ? `Host a ${occasion.toLowerCase()}-themed courtyard social with music, a hot chocolate or lemonade table, and name tags. Invite neighbors to bring one snack, set out a few yard games, and end with a group photo to share in the community chat.`
      : `Host a relaxed courtyard meetup centered on ${topic}. Provide a simple snack table, name tags, and one conversation starter. Close with a quick round of "one thing to improve" to collect ideas for the community.`,
  }),
  (topic, occasion) => ({
    title: occasion ? `${occasion} giving drive` : `${topic} service day`,
    description: occasion
      ? `Run a ${occasion.toLowerCase()} giving drive: place a decorated bin in the lobby for shelf-stable food or winter clothing, share a flyer in the group chat, and have volunteers deliver donations to a local shelter together.`
      : `Organize a ${topic} service day. Split into small crews to tidy shared areas, refresh planters, or wipe down mailboxes. Wrap up with lemonade and a quick share-out on what to improve next time.`,
  }),
  (topic, occasion) => ({
    title: occasion ? `${occasion} walkabout` : `Neighborhood walkabout for ${topic}`,
    description: occasion
      ? `Schedule a ${occasion.toLowerCase()}-themed evening walk. Hand out route cards with a scavenger hunt (lights, decorations, friendly pets), invite kids to tally finds, and finish with cookies in the lobby.`
      : `Lead a neighborhood walkabout focused on ${topic}. Map a 30–45 minute route, add a simple scavenger hunt (public art, native plants, accessibility issues), and gather quick notes to share back with neighbors.`,
  }),
  (topic, occasion) => ({
    title: occasion ? `${occasion} game night` : `${topic} game night`,
    description: occasion
      ? `Host a ${occasion.toLowerCase()} game night in the common room. Ask three neighbors to bring board games, set out cocoa and popcorn, and run a friendly bracket so people can drop in for quick rounds.`
      : `Host a casual game night themed around ${topic}. Offer 3–4 quick-play games on separate tables, create a sign-up sheet for snacks, and collect a one-line "favorite moment" wall to post in the chat afterward.`,
  }),
];

const safeText = (value, fallback = "") => value?.toString().trim() || fallback;

const sanitizeEvent = (payload = {}) => {
  const title = safeText(payload.title);
  const description = safeText(payload.description);

  const cleanedTitle = title
    .replace(/challenge/gi, "event")
    .replace(/task/gi, "event")
    .trim();
  const cleanedDescription = description
    .replace(/challenge/gi, "event")
    .replace(/task/gi, "event")
    .trim();

  return {
    title: cleanedTitle || title || "Community event",
    description: cleanedDescription || description || "",
  };
};

const formatOccasion = (value) => {
  const cleaned = safeText(value);
  if (!cleaned) return "";
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const hashIndex = (input, modulo) =>
  Math.abs(
    safeText(input)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % modulo;

export const buildPrompt = ({ goalTitle, focus, occasion }) => {
  const subject = safeText(goalTitle, "a connected community");
  const focalPoint = safeText(focus, subject);
  const occasionLabel = formatOccasion(occasion) || "none";

  return promptTemplate
    .replace("{goalTitle}", subject)
    .replace("{focus}", focalPoint)
    .replace("{occasion}", occasionLabel);
};

const buildFallbackEvent = (subject, occasion) => {
  const topic = safeText(subject, "the community");
  const occasionLabel = formatOccasion(occasion);
  const index = hashIndex(`${topic}:${occasionLabel}`, fallbackTemplates.length);
  return fallbackTemplates[index](topic, occasionLabel);
};

const resolveFetch = () => (typeof fetch === "function" ? fetch : nodeFetch);

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const fetchFn = resolveFetch();
  if (typeof fetchFn !== "function") {
    throw new Error("Fetch is not available in this runtime");
  }

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
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errText}`);
  }

  const payload = await response.json();
  const content =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text ||
    payload?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!content) {
    throw new Error("Gemini response missing content");
  }

  const parsed = JSON.parse(content);
  return parsed;
};

const looksLikeNonEvent = (text) => {
  const lowered = text.toLowerCase();
  const banned = [
    "challenge",
    "task",
    "habit",
    "journal",
    "practice",
    "smallest slice",
    "deep dive",
    "study",
    "research",
    "checklist",
    "daily",
    "every day",
    "30-day",
    "deliver",
    "ship",
  ];
  return banned.some((phrase) => lowered.includes(phrase));
};

const ensureCommunityEvent = (candidate, subject, occasion) => {
  const combined = `${candidate.title} ${candidate.description}`.trim();

  if (!combined || looksLikeNonEvent(combined) || candidate.description.length < 30) {
    return buildFallbackEvent(subject, occasion);
  }

  const neighborCue = /(neighbor|resident|community|block|courtyard|building)/i;
  if (!neighborCue.test(combined)) {
    return {
      ...candidate,
      description: `${candidate.description} Invite neighbors to join and share a quick photo in the community chat.`,
    };
  }

  return candidate;
};

export const generateChallenge = async ({ goalTitle, focus, occasion }) => {
  const prompt = buildPrompt({ goalTitle, focus, occasion });
  const occasionLabel = formatOccasion(occasion);

  try {
    const geminiResult = await callGemini(prompt);
    if (geminiResult?.title && geminiResult?.description) {
      const cleaned = sanitizeEvent(geminiResult);
      const eventSafe = ensureCommunityEvent(cleaned, goalTitle || focus, occasion);
      const challenge = occasionLabel
        ? { ...eventSafe, occasion: occasionLabel }
        : { ...eventSafe };
      return {
        prompt,
        provider: "gemini",
        challenge,
      };
    }
  } catch (error) {
    console.warn("Gemini generation failed, using fallback", error?.message || error);
  }

  const fallback = buildFallbackEvent(goalTitle || focus, occasion);
  const challenge = occasionLabel
    ? { ...fallback, occasion: occasionLabel }
    : { ...fallback };
  return {
    prompt,
    provider: process.env.GEMINI_API_KEY ? "gemini:fallback" : "template",
    challenge,
  };
};
