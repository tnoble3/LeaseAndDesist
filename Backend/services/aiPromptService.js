/**
 * AI Prompt Service
 * Provides reusable prompts for AI challenge generation and feedback
 */

const AIPromptService = {
  /**
   * Generate a challenge prompt template
   * @param {Object} options - Configuration options
   * @param {string} options.difficulty - Challenge difficulty (easy, medium, hard)
   * @param {string} options.topic - Topic for the challenge
   * @param {string} options.language - Programming language (optional)
   * @returns {string} Formatted prompt
   */
  generateChallengePrompt: (options = {}) => {
    const {
      difficulty = "medium",
      topic = "general programming",
      language = "JavaScript",
    } = options;

    return `Create a coding challenge with the following specifications:
- Difficulty Level: ${difficulty}
- Topic: ${topic}
- Programming Language: ${language}

Please provide:
1. Challenge Title (keep it concise)
2. Detailed Description of what the user needs to implement
3. Example Input/Output if applicable
4. Hints (2-3 helpful hints)
5. Expected Solution Approach

Format your response as a JSON object with these exact keys: title, description, examples, hints, approach`;
  },

  /**
   * Generate a feedback prompt template
   * @param {Object} options - Configuration options
   * @param {string} options.submission - The user's code or work submission
   * @param {string} options.assignmentContext - Context about what was assigned
   * @returns {string} Formatted prompt
   */
  generateFeedbackPrompt: (options = {}) => {
    const {
      submission = "",
      assignmentContext = "a programming assignment",
    } = options;

    return `Please provide constructive feedback on the following submission for ${assignmentContext}:

\`\`\`
${submission}
\`\`\`

Provide feedback in the following structure:
1. Strengths: What the student did well
2. Areas for Improvement: Specific areas that need work
3. Suggestions: Concrete suggestions for improvement
4. Resources: Links or references for learning
5. Overall Assessment: A brief summary

Be encouraging and constructive.`;
  },

  /**
   * Validate prompt generation parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validatePromptParams: (params = {}) => {
    const errors = [];
    const validDifficulties = ["easy", "medium", "hard"];
    const validLanguages = [
      "JavaScript",
      "Python",
      "Java",
      "C++",
      "TypeScript",
      "Other",
    ];

    if (
      params.difficulty &&
      !validDifficulties.includes(params.difficulty)
    ) {
      errors.push(
        `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}`
      );
    }

    if (
      params.language &&
      !validLanguages.includes(params.language)
    ) {
      errors.push(
        `Invalid language. Must be one of: ${validLanguages.join(", ")}`
      );
    }

    if (params.topic && typeof params.topic !== "string") {
      errors.push("Topic must be a string");
    }

    if (params.submission && typeof params.submission !== "string") {
      errors.push("Submission must be a string");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default AIPromptService;
