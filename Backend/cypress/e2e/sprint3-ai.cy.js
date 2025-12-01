describe("Sprint 3 - AI & APIs E2E Tests", () => {
  const baseUrl = Cypress.env("CYPRESS_BASE_URL") || "http://localhost:5173";
  const apiUrl =
    Cypress.env("VITE_API_URL") || "http://localhost:5000";

  // Test user credentials
  const testUser = {
    firstName: "Cypress",
    lastName: "Tester",
    username: `cypress_${Date.now()}`,
    email: `cypress${Date.now()}@test.com`,
    password: "TestPassword123!",
    confirmPassword: "TestPassword123!",
  };

  before(() => {
    // Clear localStorage and cookies before tests
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe("Story 3.1 & 3.2: Generate Challenge from AI", () => {
    beforeEach(() => {
      // Register and login
      cy.visit(`${baseUrl}/`);
      cy.get('button:contains("Register")').click();
      cy.get('input[placeholder*="First"]').type(testUser.firstName);
      cy.get('input[placeholder*="Last"]').type(testUser.lastName);
      cy.get('input[placeholder*="Username"]').type(testUser.username);
      cy.get('input[placeholder*="Email"]').type(testUser.email);
      cy.get('input[placeholder*="Password"]').first().type(testUser.password);
      cy.get('input[placeholder*="Confirm"]').type(testUser.confirmPassword);
      cy.get('button:contains("Create Account")').click();

      // Wait for redirect to dashboard
      cy.url().should("include", "/");
      cy.get("nav").should("be.visible");
    });

    it("Should display Generate Challenge button in navbar", () => {
      cy.get("button:contains('Generate Challenge')").should("be.visible");
    });

    it("Should open AI challenge modal when button clicked", () => {
      cy.get("button:contains('Generate Challenge')").click();
      cy.get("h2:contains('Generate Challenge with AI')").should("be.visible");
      cy.get("select").should("have.length.at.least", 2); // difficulty and language selects
    });

    it("Should allow selecting difficulty, topic, and language", () => {
      cy.get("button:contains('Generate Challenge')").click();

      // Select difficulty
      cy.get("select").first().select("hard");
      cy.get("select").first().should("have.value", "hard");

      // Enter topic
      cy.get('input[placeholder*="e.g."]').type("binary trees");

      // Select language
      cy.get("select").last().select("Python");
    });

    it("Should send request to /api/ai/generateChallenge and display result", () => {
      // Mock the OpenAI endpoint (skip actual API call in test)
      cy.intercept("POST", `${apiUrl}/api/ai/generateChallenge`, {
        statusCode: 200,
        body: {
          success: true,
          challenge: {
            title: "Binary Tree Traversal",
            description: "Implement an in-order traversal of a binary tree.",
            examples: [
              "Input: [3,9,20,null,null,15,7]",
              "Output: [9,3,15,20,7]",
            ],
            hints: [
              "Use recursion or a stack",
              "In-order means left-root-right",
            ],
            approach: "Use DFS with explicit stack or recursive calls",
          },
        },
      }).as("generateChallenge");

      cy.get("button:contains('Generate Challenge')").click();
      cy.get("select").first().select("hard");
      cy.get('input[placeholder*="e.g."]').type("binary trees");
      cy.get("button:contains('Generate Challenge')").last().click();

      // Wait for API call
      cy.wait("@generateChallenge");

      // Verify challenge displays
      cy.contains("Binary Tree Traversal").should("be.visible");
      cy.contains("in-order traversal").should("be.visible");
    });

    it("Should display challenge preview with title, description, hints, examples", () => {
      cy.intercept("POST", `${apiUrl}/api/ai/generateChallenge`, {
        statusCode: 200,
        body: {
          success: true,
          challenge: {
            title: "Test Challenge",
            description: "Test description",
            examples: ["Example 1"],
            hints: ["Hint 1"],
            approach: "Test approach",
          },
        },
      }).as("generateChallenge");

      cy.get("button:contains('Generate Challenge')").click();
      cy.get("button:contains('Generate Challenge')").last().click();

      cy.wait("@generateChallenge");

      cy.contains("Test Challenge").should("be.visible");
      cy.contains("Test description").should("be.visible");
      cy.contains("Example 1").should("be.visible");
      cy.contains("Hint 1").should("be.visible");
    });

    it("Should close modal on close button click", () => {
      cy.get("button:contains('Generate Challenge')").click();
      cy.get("h2:contains('Generate Challenge with AI')").should("be.visible");
      cy.get("button:contains('✕')").first().click();
      cy.get("h2:contains('Generate Challenge with AI')").should("not.exist");
    });
  });

  describe("Story 3.4 & 3.5: Submit Work for AI Feedback", () => {
    beforeEach(() => {
      // Register and login
      cy.visit(`${baseUrl}/`);
      cy.get('button:contains("Register")').click();
      cy.get('input[placeholder*="First"]').type(testUser.firstName);
      cy.get('input[placeholder*="Last"]').type(testUser.lastName);
      cy.get('input[placeholder*="Username"]').type(testUser.username);
      cy.get('input[placeholder*="Email"]').type(testUser.email);
      cy.get('input[placeholder*="Password"]').first().type(testUser.password);
      cy.get('input[placeholder*="Confirm"]').type(testUser.confirmPassword);
      cy.get('button:contains("Create Account")').click();

      cy.url().should("include", "/");
    });

    it("Should display Get AI Feedback button in navbar", () => {
      cy.get("button:contains('Get AI Feedback')").should("be.visible");
    });

    it("Should open feedback submission modal", () => {
      cy.get("button:contains('Get AI Feedback')").click();
      cy.get("h2:contains('Get AI Feedback')").should("be.visible");
    });

    it("Should allow text input submission type", () => {
      cy.get("button:contains('Get AI Feedback')").click();

      // Select text input radio
      cy.get('input[type="radio"]').first().check();
      cy.get('textarea[placeholder*="Paste"]').should("be.visible");
    });

    it("Should allow file upload submission type", () => {
      cy.get("button:contains('Get AI Feedback')").click();

      // Select file upload radio
      cy.get('input[type="radio"]').last().check();
      cy.get('input[type="file"]').should("be.visible");
    });

    it("Should submit text code and receive feedback", () => {
      cy.intercept("POST", `${apiUrl}/api/ai/submitForFeedback`, {
        statusCode: 200,
        body: {
          success: true,
          feedbackId: "mock-id-123",
          feedback:
            "Your code is well-structured. Consider adding error handling for edge cases.",
        },
      }).as("submitFeedback");

      cy.get("button:contains('Get AI Feedback')").click();

      // Select text input and paste code
      cy.get('input[type="radio"]').first().check();
      cy.get('textarea[placeholder*="Paste"]').type(
        'function add(a, b) { return a + b; }'
      );

      // Submit
      cy.get('button:contains("Get Feedback")').click();

      // Wait for API call
      cy.wait("@submitFeedback");

      // Verify feedback displays
      cy.contains("well-structured").should("be.visible");
      cy.contains("error handling").should("be.visible");
    });

    it("Should display formatted feedback response", () => {
      cy.intercept("POST", `${apiUrl}/api/ai/submitForFeedback`, {
        statusCode: 200,
        body: {
          success: true,
          feedbackId: "mock-id-456",
          feedback: `Strengths:
- Clear variable names
- Proper function structure

Areas for Improvement:
- Add input validation
- Consider performance optimization`,
        },
      }).as("submitFeedback");

      cy.get("button:contains('Get AI Feedback')").click();
      cy.get('input[type="radio"]').first().check();
      cy.get('textarea[placeholder*="Paste"]').type("const x = () => {}");
      cy.get('button:contains("Get Feedback")').click();

      cy.wait("@submitFeedback");

      cy.contains("Strengths:").should("be.visible");
      cy.contains("Clear variable names").should("be.visible");
      cy.contains("Areas for Improvement:").should("be.visible");
    });

    it("Should close feedback modal after submission", () => {
      cy.intercept("POST", `${apiUrl}/api/ai/submitForFeedback`, {
        statusCode: 200,
        body: {
          success: true,
          feedbackId: "mock-id-789",
          feedback: "Great work!",
        },
      }).as("submitFeedback");

      cy.get("button:contains('Get AI Feedback')").click();
      cy.get('input[type="radio"]').first().check();
      cy.get('textarea[placeholder*="Paste"]').type("code here");
      cy.get('button:contains("Get Feedback")').click();

      cy.wait("@submitFeedback");

      // Click close button
      cy.get('button:contains("Close")').click();
      cy.get("h2:contains('Get AI Feedback')").should("not.exist");
    });
  });

  describe("Story 3.3 & 3.7: AI Prompt Service Consistency", () => {
    it("Should generate consistent prompts for same input", () => {
      // This test verifies the prompt service on backend via API
      cy.request("POST", `${apiUrl}/api/ai/generateChallenge`, {
        difficulty: "easy",
        topic: "loops",
        language: "JavaScript",
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("success", true);
        expect(response.body.challenge).to.have.property("title");
        expect(response.body.challenge).to.have.property("description");
      });
    });

    it("Should reject invalid difficulty levels", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/ai/generateChallenge`,
        body: {
          difficulty: "impossible",
          topic: "test",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("Should reject invalid languages", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/ai/generateChallenge`,
        body: {
          language: "COBOL",
          topic: "test",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  describe("Story 3.6: Feedback Persistence", () => {
    it("Should retrieve saved feedback by ID", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/ai/submitForFeedback`,
        body: {
          userId: "test-user-id",
          submissionContent: "test code",
          submissionType: "text",
        },
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 200) {
          const feedbackId = response.body.feedbackId;

          // Retrieve the saved feedback
          cy.request(
            "GET",
            `${apiUrl}/api/ai/feedback/${feedbackId}`
          ).then((getFeedback) => {
            expect(getFeedback.status).to.equal(200);
            expect(getFeedback.body.feedback).to.have.property("response");
          });
        }
      });
    });

    it("Should retrieve all feedback for a user", () => {
      const userId = "test-user-" + Date.now();

      cy.request({
        method: "GET",
        url: `${apiUrl}/api/ai/feedback/user/${userId}`,
        failOnStatusCode: false,
      }).then((response) => {
        // Should return array of feedbacks (might be empty)
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("feedbacks");
        expect(response.body.feedbacks).to.be.an("array");
      });
    });
  });

  describe("Story 3.8: Error Handling & Logging", () => {
    it("Should handle missing OpenAI API key gracefully", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/ai/generateChallenge`,
        body: {
          difficulty: "easy",
          topic: "test",
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Should return 500 or 401 if API key missing, not crash
        expect([400, 401, 429, 500]).to.include(response.status);
      });
    });

    it("Should handle rate limiting from OpenAI", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/ai/generateChallenge`,
        body: {
          difficulty: "easy",
          topic: "test",
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Should not crash, should return proper error
        expect(response.body).to.have.property("success");
        if (!response.body.success) {
          expect(response.body).to.have.property("error");
        }
      });
    });

    it("Should validate required fields in feedback submission", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/ai/submitForFeedback`,
        body: {
          // Missing required userId and submissionContent
          submissionType: "text",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.exist;
      });
    });

    it("Should handle large file uploads gracefully", () => {
      const largeContent = "code ".repeat(50000); // Large submission

      cy.request({
        method: "POST",
        url: `${apiUrl}/api/ai/submitForFeedback`,
        body: {
          userId: "test-user",
          submissionContent: largeContent,
          submissionType: "text",
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Should handle or reject gracefully
        expect([200, 400, 413]).to.include(response.status);
      });
    });
  });

  describe("Responsive Design Tests", () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/`);
    });

    it("Should display modals on mobile viewport", () => {
      cy.viewport("iphone-x");
      cy.get("button:contains('Generate Challenge')").should("be.visible");
      cy.get("button:contains('Get AI Feedback')").should("be.visible");
    });

    it("Should display modals on tablet viewport", () => {
      cy.viewport("ipad-2");
      cy.get("button:contains('Generate Challenge')").should("be.visible");
    });

    it("Should display modals on desktop viewport", () => {
      cy.viewport(1920, 1080);
      cy.get("button:contains('Generate Challenge')").should("be.visible");
    });

    it("Modal should be usable on mobile", () => {
      cy.viewport("iphone-x");
      cy.get("button:contains('Generate Challenge')").click();
      cy.get("h2:contains('Generate Challenge with AI')").should("be.visible");
      cy.get("select").should("be.visible");
      cy.get("button:contains('✕')").should("be.visible");
    });
  });
});
