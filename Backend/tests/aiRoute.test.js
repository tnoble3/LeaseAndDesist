import request from "supertest";
import app from "../app.js";
import AiFeedback from "../models/aiFeedback.js";
import AiLog from "../models/aiLog.js";

const registerAndLogin = async () => {
  const userPayload = {
    firstName: "AI",
    lastName: "Tester",
    username: `ai_user_${Date.now()}`,
    email: "ai@example.com",
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

describe("POST /api/ai/generateChallenge", () => {
  it("returns a challenge and logs prompt/response", async () => {
    const token = await registerAndLogin();

    const goalResponse = await request(app)
      .post("/api/goals")
      .set(authHeader(token))
      .send({
        title: "Improve onboarding",
        description: "Make the first session smoother",
      })
      .expect(201);

    const goalId = goalResponse.body._id;

    const aiResponse = await request(app)
      .post("/api/ai/generateChallenge")
      .set(authHeader(token))
      .send({ goalId })
      .expect(200);

    expect(aiResponse.body.title).toBeTruthy();
    expect(aiResponse.body.description).toBeTruthy();
    expect(aiResponse.body.goalId).toBe(goalId);

    const logs = await AiLog.find();
    expect(logs).toHaveLength(1);
    expect(logs[0].prompt).toContain(goalResponse.body.title);
    expect(logs[0].response).toContain(aiResponse.body.title);
  });
});

describe("POST /api/ai/submitForFeedback", () => {
  it("returns feedback and stores the submission log", async () => {
    const token = await registerAndLogin();

    const goalResponse = await request(app)
      .post("/api/goals")
      .set(authHeader(token))
      .send({
        title: "Improve onboarding",
        description: "Make the first session smoother",
      })
      .expect(201);

    const goalId = goalResponse.body._id;

    const feedbackResponse = await request(app)
      .post("/api/ai/submitForFeedback")
      .set(authHeader(token))
      .send({
        goalId,
        content: "Here is my draft onboarding email for new users.",
        fileName: "welcome.txt",
      })
      .expect(200);

    expect(feedbackResponse.body.feedback).toBeTruthy();
    expect(feedbackResponse.body.goalId).toBe(goalId);
    expect(feedbackResponse.body.fileName).toBe("welcome.txt");
    expect(feedbackResponse.body.submissionId).toBeTruthy();

    const logs = await AiFeedback.find();
    expect(logs).toHaveLength(1);
    expect(logs[0].prompt).toContain(goalResponse.body.title);
    expect(logs[0].response).toContain(feedbackResponse.body.feedback.slice(0, 10));
    expect(logs[0].submissionId).toBe(feedbackResponse.body.submissionId);
  });
});
