import AIPromptService from "../services/aiPromptService.js";

describe("AIPromptService", () => {
  describe("generateChallengePrompt", () => {
    it("should generate a challenge prompt with default parameters", () => {
      const prompt = AIPromptService.generateChallengePrompt();

      expect(prompt).toContain("medium");
      expect(prompt).toContain("general programming");
      expect(prompt).toContain("JavaScript");
      expect(prompt).toContain("Challenge Title");
    });

    it("should generate a challenge prompt with custom parameters", () => {
      const prompt = AIPromptService.generateChallengePrompt({
        difficulty: "hard",
        topic: "data structures",
        language: "Python",
      });

      expect(prompt).toContain("hard");
      expect(prompt).toContain("data structures");
      expect(prompt).toContain("Python");
    });

    it("should return a prompt with required sections", () => {
      const prompt = AIPromptService.generateChallengePrompt();

      expect(prompt).toContain("title");
      expect(prompt).toContain("description");
      expect(prompt).toContain("hints");
      expect(prompt).toContain("approach");
    });
  });

  describe("generateFeedbackPrompt", () => {
    it("should generate a feedback prompt with default parameters", () => {
      const prompt = AIPromptService.generateFeedbackPrompt();

      expect(prompt).toContain("programming assignment");
      expect(prompt).toContain("Strengths");
      expect(prompt).toContain("Areas for Improvement");
    });

    it("should generate a feedback prompt with custom submission", () => {
      const submission = "function add(a, b) { return a + b; }";
      const prompt = AIPromptService.generateFeedbackPrompt({
        submission,
      });

      expect(prompt).toContain(submission);
      expect(prompt).toContain("feedback");
    });

    it("should return a prompt with required feedback sections", () => {
      const prompt = AIPromptService.generateFeedbackPrompt();

      expect(prompt).toContain("Strengths");
      expect(prompt).toContain("Suggestions");
      expect(prompt).toContain("Resources");
      expect(prompt).toContain("Overall Assessment");
    });
  });

  describe("validatePromptParams", () => {
    it("should validate valid parameters", () => {
      const result = AIPromptService.validatePromptParams({
        difficulty: "easy",
        topic: "arrays",
        language: "JavaScript",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject invalid difficulty", () => {
      const result = AIPromptService.validatePromptParams({
        difficulty: "impossible",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject invalid language", () => {
      const result = AIPromptService.validatePromptParams({
        language: "COBOL",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject non-string topic", () => {
      const result = AIPromptService.validatePromptParams({
        topic: 123,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate all valid difficulties", () => {
      const difficulties = ["easy", "medium", "hard"];

      difficulties.forEach((difficulty) => {
        const result = AIPromptService.validatePromptParams({ difficulty });
        expect(result.isValid).toBe(true);
      });
    });

    it("should validate all valid languages", () => {
      const languages = [
        "JavaScript",
        "Python",
        "Java",
        "C++",
        "TypeScript",
        "Other",
      ];

      languages.forEach((language) => {
        const result = AIPromptService.validatePromptParams({ language });
        expect(result.isValid).toBe(true);
      });
    });
  });

  // Snapshot tests
  describe("Snapshot Tests", () => {
    it("should match snapshot for challenge prompt", () => {
      const prompt = AIPromptService.generateChallengePrompt({
        difficulty: "medium",
        topic: "recursion",
        language: "JavaScript",
      });

      expect(prompt).toMatchSnapshot();
    });

    it("should match snapshot for feedback prompt", () => {
      const submission = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
      `.trim();

      const prompt = AIPromptService.generateFeedbackPrompt({
        submission,
        assignmentContext: "a fibonacci implementation",
      });

      expect(prompt).toMatchSnapshot();
    });

    it("should match snapshot for different difficulty levels", () => {
      const easyPrompt = AIPromptService.generateChallengePrompt({
        difficulty: "easy",
      });
      const mediumPrompt = AIPromptService.generateChallengePrompt({
        difficulty: "medium",
      });
      const hardPrompt = AIPromptService.generateChallengePrompt({
        difficulty: "hard",
      });

      expect({ easy: easyPrompt, medium: mediumPrompt, hard: hardPrompt }).toMatchSnapshot();
    });
  });
});
