import request from "supertest";
import app from "../app.js";
import * as openaiService from "../services/openaiService.js";
import AIFeedback from "../models/aiFeedback.js";
import prisma from "../services/prismaClient.js";

jest.mock("../services/openaiService.js");

const registerAndLogin = async () => {
  const userPayload = {
    firstName: "Jest",
    lastName: "AI",
    username: `jestai_${Date.now()}`,
    email: `jestai_${Date.now()}@example.com`,
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

describe("AI endpoints", () => {
  beforeAll(() => {
    openaiService.callOpenAI.mockResolvedValue({
      id: "test-id",
      choices: [{ message: { content: JSON.stringify({ title: "Test Title", description: "Test description" }) } }]
    });
  });

  it("POST /api/ai/generateChallenge creates a record and returns generated challenge", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/ai/generateChallenge")
      .set("Authorization", `Bearer ${token}`)
      .send({ topic: "Node.js", difficulty: "intermediate" })
      .expect(200);

    expect(res.body.generated.title).toBe("Test Title");
    const stored = await AIFeedback.findOne({ submissionId: res.body.auditId });
    expect(stored).toBeTruthy();

    // prisma record should exist
    const prismaStored = await prisma.aiFeedback.findUnique({ where: { submissionId: res.body.auditId } });
    expect(prismaStored).toBeTruthy();
  });

  it("POST /api/ai/submitForFeedback returns parsed feedback and stores it", async () => {
    openaiService.callOpenAI.mockResolvedValueOnce({
      id: "fb-id",
      choices: [{ message: { content: JSON.stringify({ score: 92, summary: "Nice!", strengths: ["clarity"], improvements: ["edge cases"] }) } }]
    });

    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/ai/submitForFeedback")
      .set("Authorization", `Bearer ${token}`)
      .send({ submission: "some code snippet" })
      .expect(201);

    expect(res.body.feedback.score).toBe(92);
    const stored = await AIFeedback.findOne({ submissionId: res.body.auditId });
    expect(stored).toBeTruthy();

    const prismaStored = await prisma.aiFeedback.findUnique({ where: { submissionId: res.body.auditId } });
    expect(prismaStored).toBeTruthy();
  });

  afterAll(async () => {
    // disconnect prisma client to clean up
    try {
      await prisma.$disconnect();
    } catch {}
  });
});
