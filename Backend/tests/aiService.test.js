import { buildPrompt, generateChallenge } from "../services/aiChallengeService.js";
import { buildFeedbackPrompt, generateFeedback } from "../services/aiFeedbackService.js";

describe("aiChallengeService - buildPrompt", () => {
  it("fills prompt placeholders with goal and focus", () => {
    const prompt = buildPrompt({
      goalTitle: "Ship v1",
      focus: "reduce churn",
    });

    expect(prompt).toContain("Ship v1");
    expect(prompt).toContain("reduce churn");
  });

  it("includes occasion when provided", () => {
    const prompt = buildPrompt({
      goalTitle: "Community Event",
      focus: "engagement",
      occasion: "christmas",
    });

    expect(prompt).toContain("Christmas");
  });

  it("handles empty goal title with fallback text", () => {
    const prompt = buildPrompt({
      goalTitle: "",
      focus: "test focus",
      occasion: "",
    });

    expect(prompt).toContain("test focus");
    expect(prompt.length).toBeGreaterThan(50);
  });

  it("sanitizes occasion text to title case", () => {
    const prompt = buildPrompt({
      goalTitle: "Test",
      focus: "Test",
      occasion: "halloween",
    });

    expect(prompt).toContain("Halloween");
  });
});

describe("aiChallengeService - generateChallenge", () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = "";
  });

  it("falls back to template output when no API key is present", async () => {
    process.env.OPENAI_API_KEY = "";
    const { challenge, provider, prompt } = await generateChallenge({
      goalTitle: "Launch the app",
    });

    expect(prompt.length).toBeGreaterThan(10);
    expect(challenge.title).toBeTruthy();
    expect(challenge.description).toBeTruthy();
    expect(provider).toBe("template");
  });

  it("returns an object with prompt, provider, and challenge", async () => {
    const result = await generateChallenge({
      goalTitle: "Community Connection",
      focus: "neighbor engagement",
    });

    expect(result).toHaveProperty("prompt");
    expect(result).toHaveProperty("provider");
    expect(result).toHaveProperty("challenge");
    expect(result.challenge).toHaveProperty("title");
    expect(result.challenge).toHaveProperty("description");
  });

  it("ensures challenge title does not contain banned words", async () => {
    const bannedWords = ["challenge", "task", "practice", "habit"];

    for (let i = 0; i < 10; i++) {
      const result = await generateChallenge({
        goalTitle: `Test Goal ${i}`,
        focus: `Focus ${i}`,
      });

      const titleLower = result.challenge.title.toLowerCase();
      bannedWords.forEach((word) => {
        expect(titleLower).not.toContain(word);
      });
    }
  });

  it("challenge description length is reasonable", async () => {
    const result = await generateChallenge({
      goalTitle: "Test",
      focus: "Test",
    });

    expect(result.challenge.description.length).toBeGreaterThan(30);
    expect(result.challenge.description.length).toBeLessThan(1000);
  });

  it("challenge title length is reasonable", async () => {
    const result = await generateChallenge({
      goalTitle: "Test",
      focus: "Test",
    });

    expect(result.challenge.title.length).toBeGreaterThan(5);
    expect(result.challenge.title.length).toBeLessThan(100);
  });

  it("handles various occasions correctly", async () => {
    const occasions = ["christmas", "easter", "halloween", "thanksgiving"];

    for (const occasion of occasions) {
      const result = await generateChallenge({
        goalTitle: "Test",
        focus: "Test",
        occasion,
      });

      expect(result.challenge.occasion).toBeTruthy();
      expect(result.challenge).toHaveProperty("title");
      expect(result.challenge).toHaveProperty("description");
    }
  });
});

describe("aiFeedbackService - buildFeedbackPrompt", () => {
  it("fills feedback prompt placeholders with goal and summary", () => {
    const prompt = buildFeedbackPrompt({
      goalTitle: "Better Announcements",
      summary: "Draft of community bulletin",
    });

    expect(prompt).toContain("Better Announcements");
    expect(prompt).toContain("community bulletin");
  });

  it("handles empty goal title with fallback", () => {
    const prompt = buildFeedbackPrompt({
      goalTitle: "",
      summary: "My submission text",
    });

    expect(prompt).toContain("a personal goal");
    expect(prompt).toContain("My submission text");
  });

  it("handles empty summary with fallback", () => {
    const prompt = buildFeedbackPrompt({
      goalTitle: "Test Goal",
      summary: "",
    });

    expect(prompt).toContain("Test Goal");
    expect(prompt).toContain("A short submission was provided");
  });

  it("handles both empty goal and summary", () => {
    const prompt = buildFeedbackPrompt({
      goalTitle: "",
      summary: "",
    });

    expect(prompt).toContain("a personal goal");
    expect(prompt).toContain("A short submission was provided");
  });
});

describe("AI Services - Integration Scenarios", () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = "";
  });

  it("generates deterministic results with templates when using same seed", async () => {
    const params = {
      goalTitle: "Consistent Goal",
      focus: "Consistent Focus",
      occasion: "christmas",
    };

    const result1 = await generateChallenge(params);
    const result2 = await generateChallenge(params);

    expect(result1.challenge.title).toBe(result2.challenge.title);
    expect(result1.challenge.description).toBe(result2.challenge.description);
  });

  it("generates varied results with different inputs", async () => {
    const results = [];

    for (let i = 0; i < 5; i++) {
      const result = await generateChallenge({
        goalTitle: `Goal ${i}`,
        focus: `Focus ${i}`,
        occasion: ["christmas", "halloween", "easter", "thanksgiving"][
          i % 4
        ],
      });
      results.push(result.challenge.title);
    }

    const uniqueTitles = new Set(results);
    // Should have variety in titles
    expect(uniqueTitles.size).toBeGreaterThan(1);
  });

  it("handles null and undefined inputs gracefully", async () => {
    const result = await generateChallenge({
      goalTitle: null,
      focus: undefined,
      occasion: null,
    });

    expect(result.challenge).toBeDefined();
    expect(result.challenge.title).toBeTruthy();
    expect(result.challenge.description).toBeTruthy();
  });
});

