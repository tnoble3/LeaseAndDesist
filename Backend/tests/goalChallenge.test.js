import request from "supertest";
import app from "../app.js";

const registerAndLogin = async () => {
  const userPayload = {
    firstName: "Jest",
    lastName: "User",
    username: `jestuser_${Date.now()}`,
    email: "jest@example.com",
    password: "secret123",
    confirmPassword: "secret123",
  };

  await request(app).post("/api/users/register").send(userPayload).expect(201);

  const loginResponse = await request(app)
    .post("/api/users/login")
    .send({ username: userPayload.username, password: userPayload.password })
    .expect(200);

  return loginResponse.body.token;
};

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

describe("Goals & Challenges flow", () => {
  it("creates a goal, adds a challenge, and tracks progress", async () => {
    const token = await registerAndLogin();

    const goalResponse = await request(app)
      .post("/api/goals")
      .set(authHeader(token))
      .send({
        title: "Learn MongoDB",
        description: "Finish MongoDB University course",
      })
      .expect(201);

    const goalId = goalResponse.body._id;
    expect(goalResponse.body.title).toBe("Learn MongoDB");

    const challengeResponse = await request(app)
      .post("/api/challenges")
      .set(authHeader(token))
      .send({
        goalId,
        title: "Watch Aggregations lesson",
        description: "Complete the aggregations module",
      })
      .expect(201);

    const challengeId = challengeResponse.body._id;
    expect(challengeResponse.body.status).toBe("todo");

    const listResponse = await request(app)
      .get("/api/challenges")
      .query({ goalId })
      .set(authHeader(token))
      .expect(200);

    expect(listResponse.body).toHaveLength(1);

    await request(app)
      .patch(`/api/challenges/${challengeId}`)
      .set(authHeader(token))
      .send({ status: "done" })
      .expect(200);

    const progressResponse = await request(app)
      .get(`/api/goals/${goalId}/progress`)
      .set(authHeader(token))
      .expect(200);

    expect(progressResponse.body).toMatchObject({
      total: 1,
      completed: 1,
      percentage: 100,
    });

    await request(app)
      .delete(`/api/challenges/${challengeId}`)
      .set(authHeader(token))
      .expect(204);

    const postDeleteProgress = await request(app)
      .get(`/api/goals/${goalId}/progress`)
      .set(authHeader(token))
      .expect(200);

    expect(postDeleteProgress.body).toMatchObject({
      total: 0,
      completed: 0,
      percentage: 0,
    });
  });
});
