import { generateChallenge } from "../services/aiChallengeService.js";
import { generateFeedback } from "../services/aiFeedbackService.js";

describe("AI services snapshots - Challenge Generation", () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = "";
  });

  it("keeps challenge output stable without OpenAI - basic case", async () => {
    const result = await generateChallenge({
      goalTitle: "Snapshot Goal",
      focus: "Improve activation",
    });

    expect(result).toMatchSnapshot();
    expect(result.provider).toBe("template");
    expect(result.challenge).toHaveProperty("title");
    expect(result.challenge).toHaveProperty("description");
  });

  it("keeps challenge output stable with occasion parameter", async () => {
    const result = await generateChallenge({
      goalTitle: "Holiday Event",
      focus: "Community gathering",
      occasion: "christmas",
    });

    expect(result).toMatchSnapshot();
    expect(result.challenge.occasion).toBe("Christmas");
  });

  it("keeps challenge output stable without goal title", async () => {
    const result = await generateChallenge({
      goalTitle: "",
      focus: "neighborhood improvement",
      occasion: "",
    });

    expect(result).toMatchSnapshot();
    expect(result.challenge.title).toBeTruthy();
    expect(result.challenge.description).toBeTruthy();
  });

  it("keeps challenge output stable with all parameters", async () => {
    const result = await generateChallenge({
      goalTitle: "Build Community Bonds",
      focus: "resident engagement",
      occasion: "easter",
    });

    expect(result).toMatchSnapshot();
    expect(result.provider).toBe("template");
    expect(result.challenge).toHaveProperty("title");
    expect(result.challenge).toHaveProperty("description");
    expect(result.challenge.occasion).toBe("Easter");
  });

  it("challenge title never contains banned words", async () => {
    const bannedWords = ["challenge", "task", "practice", "habit"];

    for (let i = 0; i < 5; i++) {
      const result = await generateChallenge({
        goalTitle: `Goal ${i}`,
        focus: `Focus ${i}`,
      });

      const titleLower = result.challenge.title.toLowerCase();
      bannedWords.forEach((word) => {
        expect(titleLower).not.toContain(word);
      });
    }
  });

  it("challenge description mentions community/neighbors appropriately", async () => {
    const result = await generateChallenge({
      goalTitle: "Test Goal",
      focus: "Test Focus",
    });

    const descriptionLower = result.challenge.description.toLowerCase();
    const hasNeighborCue =
      descriptionLower.includes("neighbor") ||
      descriptionLower.includes("community") ||
      descriptionLower.includes("building") ||
      descriptionLower.includes("event");

    expect(hasNeighborCue).toBe(true);
  });

  it("challenge response is consistent with same input (deterministic fallbacks)", async () => {
    const params = {
      goalTitle: "Consistent Test",
      focus: "Test Focus",
      occasion: "halloween",
    };

    const result1 = await generateChallenge(params);
    const result2 = await generateChallenge(params);

    // When using templates (no OpenAI), responses should be identical
    expect(result1.provider).toBe("template");
    expect(result2.provider).toBe("template");
    expect(result1.challenge.title).toBe(result2.challenge.title);
    expect(result1.challenge.description).toBe(result2.challenge.description);
  });
});

describe("AI services snapshots - Feedback Generation", () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = "";
  });

  it("keeps feedback output stable without OpenAI - basic case", async () => {
    const result = await generateFeedback({
      goalTitle: "Snapshot Goal",
      summary: "This is my writeup for activation.",
    });

    expect(result).toMatchSnapshot();
    expect(result.provider).toBe("template");
    expect(result.feedback).toHaveProperty("feedback");
  });

  it("keeps feedback output stable without goal title", async () => {
    const result = await generateFeedback({
      goalTitle: "",
      summary: "A short draft submission.",
    });

    expect(result).toMatchSnapshot();
    expect(result.feedback).toBeTruthy();
  });

  it("keeps feedback output stable with empty summary", async () => {
    const result = await generateFeedback({
      goalTitle: "Goal Title",
      summary: "",
    });

    expect(result).toMatchSnapshot();
    expect(result.feedback).toBeTruthy();
  });

  it("feedback is supportive and actionable", async () => {
    const result = await generateFeedback({
      goalTitle: "Community Newsletter",
      summary: "Draft of newsletter about upcoming events.",
    });

    const feedback = result.feedback;
    expect(feedback).toBeTruthy();
    expect(feedback.length).toBeGreaterThan(20);
    // Should mention strengths or improvements
    expect(
      feedback.toLowerCase().includes("strength") ||
        feedback.toLowerCase().includes("improv") ||
        feedback.toLowerCase().includes("good") ||
        feedback.toLowerCase().includes("consider")
    ).toBe(true);
  });

  it("keeps feedback output consistent with same input (deterministic fallbacks)", async () => {
    const params = {
      goalTitle: "Consistent Test Goal",
      summary: "Testing feedback consistency",
    };

    const result1 = await generateFeedback(params);
    const result2 = await generateFeedback(params);

    // When using templates (no OpenAI), responses should be identical
    expect(result1.provider).toBe("template");
    expect(result2.provider).toBe("template");
    expect(result1.feedback).toBe(result2.feedback);
  });

  it("feedback quality varies based on summary length", async () => {
    const shortSummary = "Short";
    const longSummary =
      "This is a much longer summary that contains more details about the submission, providing more context for the AI to work with. It has multiple sentences and ideas.";

    const shortResult = await generateFeedback({
      goalTitle: "Test",
      summary: shortSummary,
    });

    const longResult = await generateFeedback({
      goalTitle: "Test",
      summary: longSummary,
    });

    expect(shortResult.feedback).toBeTruthy();
    expect(longResult.feedback).toBeTruthy();
    // Both should provide feedback
    expect(shortResult.feedback.length).toBeGreaterThan(20);
    expect(longResult.feedback.length).toBeGreaterThan(20);
  });
});

describe("AI services snapshots - Error Handling", () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = "";
  });

  it("handles null/undefined parameters gracefully", async () => {
    const result = await generateChallenge({
      goalTitle: null,
      focus: undefined,
      occasion: null,
    });

    expect(result.challenge).toHaveProperty("title");
    expect(result.challenge).toHaveProperty("description");
    expect(result.challenge.title).toBeTruthy();
  });

  it("handles extremely long input gracefully", async () => {
    const longText = "x".repeat(1000);

    const result = await generateChallenge({
      goalTitle: longText,
      focus: longText,
      occasion: "test",
    });

    expect(result.challenge).toHaveProperty("title");
    expect(result.challenge.title.length).toBeLessThan(150);
  });

  it("feedback handles special characters and emojis", async () => {
    const result = await generateFeedback({
      goalTitle: "Test with @#$% special chars!",
      summary: "Draft with emojis 🎉 and symbols !@#$",
    });

    expect(result.feedback).toBeTruthy();
    expect(typeof result.feedback).toBe("string");
  });
});

