const apiRequest = (method, url, body, token) => {
  return cy.request({
    method,
    url,
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    failOnStatusCode: false,
  });
};

describe("Smoke test: AI flows", () => {
  it("can generate an AI challenge and request feedback using the API", () => {
    const user = {
      firstName: "CypressAI",
      lastName: "User",
      username: `cypress_ai_${Date.now()}`,
      email: `cypress_ai_${Date.now()}@example.com`,
      password: "supersecret",
      confirmPassword: "supersecret",
    };

    apiRequest("POST", "/api/users/register", user).then((response) => {
      expect(response.status).to.eq(201);

      apiRequest("POST", "/api/users/login", {
        username: user.username,
        password: user.password,
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);
        const token = loginResponse.body.token;

        apiRequest(
          "POST",
          "/api/ai/generateChallenge",
          { topic: "express routing", difficulty: "beginner" },
          token
        ).then((aiResp) => {
          expect(aiResp.status).to.eq(200);
          expect(aiResp.body.generated).to.exist;

          apiRequest(
            "POST",
            "/api/ai/submitForFeedback",
            { submission: "my example submission for feedback" },
            token
          ).then((feedbackResp) => {
            expect(feedbackResp.status).to.eq(201);
            expect(feedbackResp.body.feedback).to.exist;
          });
        });
      });
    });
  });
});
