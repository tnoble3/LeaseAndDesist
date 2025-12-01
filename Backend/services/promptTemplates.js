/*
  Prompt templates and a very small templating helper.
  Templates use simple {{placeholder}} markers.
*/

export const templates = {
  generateChallenge: {
    id: "generateChallenge",
    description: "Create a practice challenge (title + short description)",
    template:
      `You are a helpful challenge generator. Create a short practice challenge focused on: "{{topic}}" (difficulty: {{difficulty}}). Respond with valid JSON only, for example: { "title": "...", "description": "..." }`,
  },

  feedbackReview: {
    id: "feedbackReview",
    description: "Evaluate a user submission and return score and advice.",
    template:
      `You are a helpful reviewer. Given the user's submission: "{{submission}}" return JSON only with keys: score (number 0-100), summary (string), strengths (array of strings), improvements (array of strings). Be concise and actionable.`,
  }
};

export const renderTemplate = (template, values = {}) => {
  let t = template;
  Object.keys(values).forEach((k) => {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
    t = t.replace(re, values[k] ?? "");
  });
  return t;
};
