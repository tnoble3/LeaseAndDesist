import { generateChallenge } from "../services/aiChallengeService.js";
import { generateFeedback } from "../services/aiFeedbackService.js";

describe("AI services snapshots", () => {
  beforeAll(() => {
    process.env.GEMINI_API_KEY = "";
  });

  it("keeps challenge output stable without Gemini", async () => {
    const result = await generateChallenge({
      goalTitle: "Snapshot Goal",
      focus: "Improve activation",
    });

    expect(result).toMatchSnapshot();
  });

  it("keeps feedback output stable without Gemini", async () => {
    const result = await generateFeedback({
      goalTitle: "Snapshot Goal",
      summary: "This is my writeup for activation.",
    });

    expect(result).toMatchSnapshot();
  });
});
