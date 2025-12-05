const apiRequest = (method, url, body, token) => {
  return cy.request({
    method,
    url,
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    failOnStatusCode: false,
  });
};

describe("Smoke test: login → goal → challenge → complete", () => {
  it("walks through the main happy path", () => {
    const user = {
      firstName: "Cypress",
      lastName: "User",
      username: `cypress_${Date.now()}`,
      email: `cypress_${Date.now()}@example.com`,
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
          "/api/goals",
          { title: "Ship Story 2", description: "Goal from Cypress" },
          token
        ).then((goalResponse) => {
          expect(goalResponse.status).to.eq(201);
          const goalId = goalResponse.body._id;

          apiRequest(
            "POST",
            "/api/challenges",
            {
              goalId,
              title: "Write Cypress spec",
              description: "Part of the story",
            },
            token
          ).then((challengeResponse) => {
            expect(challengeResponse.status).to.eq(201);
            const challengeId = challengeResponse.body._id;

            apiRequest(
              "PATCH",
              `/api/challenges/${challengeId}`,
              { status: "done" },
              token
            ).then((updateResponse) => {
              expect(updateResponse.status).to.eq(200);

              apiRequest(
                "GET",
                `/api/goals/${goalId}/progress`,
                undefined,
                token
              ).then((progressResponse) => {
                expect(progressResponse.status).to.eq(200);
                expect(progressResponse.body.percentage).to.eq(100);
              });
            });
          });
        });
      });
    });
  });
});
