import { templates, renderTemplate } from "../services/promptTemplates.js";

describe("Prompt templates", () => {
  it("generateChallenge template snapshot", () => {
    const prompt = renderTemplate(templates.generateChallenge.template, {
      topic: "async programming",
      difficulty: "beginner",
    });
    expect(prompt).toMatchSnapshot();
  });

  it("feedbackReview template snapshot", () => {
    const prompt = renderTemplate(templates.feedbackReview.template, {
      submission: "function foo() {}",
    });
    expect(prompt).toMatchSnapshot();
  });
});
