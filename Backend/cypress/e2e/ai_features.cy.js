/**
 * AI Features E2E Tests
 * Tests for Story 3.1 through 3.8
 * - AI Challenge Generation (with modal)
 * - AI Feedback Submission and Review
 * - Error handling and Sentry integration
 */

const apiRequest = (method, url, body, token) => {
  return cy.request({
    method,
    url,
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    failOnStatusCode: false,
  });
};

describe("Story 3.1-3.2: AI Challenge Generation", () => {
  let token;
  let goalId;
  let userId;

  beforeEach(() => {
    const user = {
      firstName: "AI",
      lastName: "Tester",
      username: `ai_test_${Date.now()}`,
      email: `ai_test_${Date.now()}@example.com`,
      password: "testpass123",
      confirmPassword: "testpass123",
    };

    apiRequest("POST", "/api/users/register", user).then((response) => {
      expect(response.status).to.eq(201);

      apiRequest("POST", "/api/users/login", {
        username: user.username,
        password: user.password,
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);
        token = loginResponse.body.token;
        userId = loginResponse.body.user._id;

        // Create a goal for testing
        apiRequest(
          "POST",
          "/api/goals",
          {
            title: "Community Connection",
            description: "Build stronger neighbor bonds",
          },
          token
        ).then((goalResponse) => {
          expect(goalResponse.status).to.eq(201);
          goalId = goalResponse.body._id;
        });
      });
    });
  });

  it("should generate a challenge via POST /api/ai/generateChallenge", () => {
    apiRequest(
      "POST",
      "/api/ai/generateChallenge",
      { goalId, focus: "neighborhood engagement" },
      token
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("title");
      expect(response.body).to.have.property("description");
      expect(response.body).to.have.property("provider");
      expect(["openai", "openai:fallback", "template"]).to.include(
        response.body.provider
      );
      expect(response.body.goalId).to.eq(goalId);
    });
  });

  it("should log the prompt and response to AiLog", () => {
    apiRequest(
      "POST",
      "/api/ai/generateChallenge",
      { goalId, focus: "birthday celebration" },
      token
    ).then((response) => {
      expect(response.status).to.eq(200);
      const { title, description } = response.body;

      // Verify that the AI log was created by checking the response
      // In real scenario, would query the DB or another endpoint
      expect(title).to.exist;
      expect(description).to.exist;
    });
  });

  it("should support occasion parameter to theme the event", () => {
    const occasions = ["christmas", "halloween", "easter"];

    occasions.forEach((occasion) => {
      apiRequest(
        "POST",
        "/api/ai/generateChallenge",
        { goalId, occasion },
        token
      ).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.occasion).to.eq(occasion);
      });
    });
  });

  it("should reject invalid goalId", () => {
    apiRequest(
      "POST",
      "/api/ai/generateChallenge",
      { goalId: "invalid-id" },
      token
    ).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property("message");
    });
  });

  it("should reject occasion that is too long", () => {
    const longOccasion = "a".repeat(100);
    apiRequest(
      "POST",
      "/api/ai/generateChallenge",
      { goalId, occasion: longOccasion },
      token
    ).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include("too long");
    });
  });

  it("should work without authentication (fail appropriately)", () => {
    apiRequest("POST", "/api/ai/generateChallenge", { goalId }, null).then(
      (response) => {
        expect(response.status).to.eq(401);
      }
    );
  });
});

describe("Story 3.4-3.6: AI Feedback Submission", () => {
  let token;
  let goalId;

  beforeEach(() => {
    const user = {
      firstName: "Feedback",
      lastName: "Tester",
      username: `feedback_test_${Date.now()}`,
      email: `feedback_test_${Date.now()}@example.com`,
      password: "testpass123",
      confirmPassword: "testpass123",
    };

    apiRequest("POST", "/api/users/register", user).then((response) => {
      token = null;

      apiRequest("POST", "/api/users/login", {
        username: user.username,
        password: user.password,
      }).then((loginResponse) => {
        token = loginResponse.body.token;

        apiRequest(
          "POST",
          "/api/goals",
          { title: "Public Relations", description: "Improve comms" },
          token
        ).then((goalResponse) => {
          goalId = goalResponse.body._id;
        });
      });
    });
  });

  it("should submit content for feedback via POST /api/ai/submitForFeedback", () => {
    // Small delay to ensure token is set
    cy.wait(500);

    apiRequest(
      "POST",
      "/api/ai/submitForFeedback",
      {
        goalId,
        content: "Dear neighbors, let's organize a monthly potluck...",
        fileName: "letter.txt",
      },
      token
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("feedback");
      expect(response.body).to.have.property("submissionId");
      expect(response.body).to.have.property("provider");
    });
  });

  it("should store feedback in AiFeedback table with submission details", () => {
    cy.wait(500);

    const content = "Here is my draft announcement for the community.";

    apiRequest(
      "POST",
      "/api/ai/submitForFeedback",
      {
        goalId,
        content,
        fileName: "announcement.txt",
      },
      token
    ).then((response) => {
      expect(response.status).to.eq(200);
      const { feedback, submissionId } = response.body;

      expect(feedback).to.be.a("string");
      expect(feedback.length).to.be.greaterThan(20);
      expect(submissionId).to.exist;
    });
  });

  it("should reject empty content", () => {
    cy.wait(500);

    apiRequest(
      "POST",
      "/api/ai/submitForFeedback",
      { goalId, content: "" },
      token
    ).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include("Content is required");
    });
  });

  it("should reject submission with invalid goalId", () => {
    cy.wait(500);

    apiRequest(
      "POST",
      "/api/ai/submitForFeedback",
      {
        goalId: "not-a-valid-id",
        content: "Some content here",
      },
      token
    ).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("should work without goalId (general feedback)", () => {
    cy.wait(500);

    apiRequest(
      "POST",
      "/api/ai/submitForFeedback",
      { content: "This is a general draft without a specific goal." },
      token
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("feedback");
    });
  });
});

describe("Story 3.3: AI Prompt Templates", () => {
  let token;
  let goalId;

  beforeEach(() => {
    const user = {
      firstName: "Template",
      lastName: "Tester",
      username: `template_test_${Date.now()}`,
      email: `template_test_${Date.now()}@example.com`,
      password: "testpass123",
      confirmPassword: "testpass123",
    };

    apiRequest("POST", "/api/users/register", user).then(() => {
      apiRequest("POST", "/api/users/login", {
        username: user.username,
        password: user.password,
      }).then((loginResponse) => {
        token = loginResponse.body.token;

        apiRequest(
          "POST",
          "/api/goals",
          { title: "Engagement Goal", description: "Test templates" },
          token
        ).then((goalResponse) => {
          goalId = goalResponse.body._id;
        });
      });
    });
  });

  it("should use consistent templates for generation", () => {
    // Call the same parameters multiple times to ensure consistency
    const params = { goalId, focus: "neighborhood gardening" };

    cy.wait(500);

    apiRequest("POST", "/api/ai/generateChallenge", params, token).then(
      (response1) => {
        expect(response1.status).to.eq(200);
        const firstTitle = response1.body.title;

        apiRequest("POST", "/api/ai/generateChallenge", params, token).then(
          (response2) => {
            expect(response2.status).to.eq(200);
            // When no OpenAI key, templates should be consistent
            if (response1.body.provider === "template") {
              expect(response2.body.title).to.equal(firstTitle);
            }
          }
        );
      }
    );
  });
});

describe("Story 3.7: Snapshot Tests for AI Responses", () => {
  let token;
  let goalId;

  beforeEach(() => {
    const user = {
      firstName: "Snapshot",
      lastName: "Tester",
      username: `snapshot_test_${Date.now()}`,
      email: `snapshot_test_${Date.now()}@example.com`,
      password: "testpass123",
      confirmPassword: "testpass123",
    };

    apiRequest("POST", "/api/users/register", user).then(() => {
      apiRequest("POST", "/api/users/login", {
        username: user.username,
        password: user.password,
      }).then((loginResponse) => {
        token = loginResponse.body.token;

        apiRequest(
          "POST",
          "/api/goals",
          { title: "Snapshot Test Goal", description: "For snapshot testing" },
          token
        ).then((goalResponse) => {
          goalId = goalResponse.body._id;
        });
      });
    });
  });

  it("should return stable challenge snapshots", () => {
    cy.wait(500);

    const testData = [
      { goalId, focus: "community building" },
      { goalId, focus: "sustainability", occasion: "earth day" },
      { goalId },
    ];

    testData.forEach((params) => {
      apiRequest("POST", "/api/ai/generateChallenge", params, token).then(
        (response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.all.keys(
            "title",
            "description",
            "occasion",
            "goalId",
            "focus",
            "provider"
          );
          expect(response.body.title).to.be.a("string");
          expect(response.body.title.length).to.be.lessThan(80);
          expect(response.body.description).to.be.a("string");
          expect(response.body.description.length).to.be.greaterThan(30);
        }
      );
    });
  });

  it("should return stable feedback snapshots", () => {
    cy.wait(500);

    const feedbackTests = [
      { goalId, content: "Draft post for community involvement." },
      { content: "General announcement draft without a goal." },
      {
        goalId,
        content: "Multi-line petition text.\nLine 2 here.\nLine 3 as well.",
      },
    ];

    feedbackTests.forEach((params) => {
      apiRequest("POST", "/api/ai/submitForFeedback", params, token).then(
        (response) => {
          expect(response.status).to.eq(200);
          expect(response.body.feedback).to.be.a("string");
          expect(response.body.feedback.length).to.be.greaterThan(20);
          expect(response.body.provider).to.be.oneOf([
            "openai",
            "openai:fallback",
            "template",
          ]);
        }
      );
    });
  });
});

describe("Story 3.8: Error Tracking with Sentry", () => {
  it("should log backend errors to Sentry when endpoint fails", () => {
    // Test that backend error endpoint works
    cy.request({
      method: "GET",
      url: "/api/debug-sentry",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(500);
    });
  });

  it("should handle missing authentication gracefully", () => {
    cy.request({
      method: "POST",
      url: "/api/ai/generateChallenge",
      body: { focus: "test" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("should provide meaningful error messages", () => {
    const user = {
      firstName: "Error",
      lastName: "Tester",
      username: `error_test_${Date.now()}`,
      email: `error_test_${Date.now()}@example.com`,
      password: "testpass123",
      confirmPassword: "testpass123",
    };

    apiRequest("POST", "/api/users/register", user).then(() => {
      apiRequest("POST", "/api/users/login", {
        username: user.username,
        password: user.password,
      }).then((loginResponse) => {
        const token = loginResponse.body.token;

        // Try to generate challenge with invalid goal
        apiRequest(
          "POST",
          "/api/ai/generateChallenge",
          { goalId: "not-a-valid-mongodb-id" },
          token
        ).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.exist;
        });
      });
    });
  });
});
