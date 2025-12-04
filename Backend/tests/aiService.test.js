import { buildPrompt, generateChallenge } from "../services/aiChallengeService.js";

describe("aiChallengeService", () => {
  it("fills prompt placeholders with goal and focus", () => {
    const prompt = buildPrompt({
      goalTitle: "Ship v1",
      focus: "reduce churn",
    });

    expect(prompt).toContain("Ship v1");
    expect(prompt).toContain("reduce churn");
  });

  it("falls back to template output when no API key is present", async () => {
    process.env.GEMINI_API_KEY = "";
    const { challenge, provider, prompt } = await generateChallenge({
      goalTitle: "Launch the app",
    });

    expect(prompt.length).toBeGreaterThan(10);
    expect(challenge.title).toBeTruthy();
    expect(challenge.description).toBeTruthy();
    expect(provider).toBe("template");
  });
});
