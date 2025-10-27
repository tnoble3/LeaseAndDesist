import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import prisma from '../lib/prismaClient.js';

const uniqueEmail = (() => {
  let count = 0;
  return () => `testuser${Date.now()}_${count++}@example.com`;
})();

const defaultPassword = 'Passw0rd!';

describe('Auth routes', () => {
  test('signup creates a user and sets refresh cookie', async () => {
    const agent = request.agent(app);
    const email = uniqueEmail();

    const response = await agent
      .post('/api/auth/signup')
      .send({ email, password: defaultPassword })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toMatchObject({ email });

    const cookies = response.headers['set-cookie'] || [];
    expect(cookies.some((cookie) => cookie.includes('refreshToken'))).toBe(true);

    const storedUser = await prisma.user.findUnique({ where: { email } });
    expect(storedUser).not.toBeNull();
  });

  test('login fails with invalid credentials', async () => {
    const email = uniqueEmail();
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.create({ data: { email, passwordHash } });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toMatch(/invalid/i);
  });

  test('login succeeds and issues tokens', async () => {
    const agent = request.agent(app);
    const email = uniqueEmail();
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.create({ data: { email, passwordHash } });

    const response = await agent
      .post('/api/auth/login')
      .send({ email, password: defaultPassword })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toMatchObject({ email });

    const cookies = response.headers['set-cookie'] || [];
    expect(cookies.some((cookie) => cookie.includes('refreshToken'))).toBe(true);
  });

  test('refresh rotates tokens when provided a valid cookie', async () => {
    const agent = request.agent(app);
    const email = uniqueEmail();

    const signup = await agent
      .post('/api/auth/signup')
      .send({ email, password: defaultPassword })
      .expect(201);

    const firstAccessToken = signup.body.accessToken;

    const refresh = await agent.post('/api/auth/refresh').expect(200);

    expect(refresh.body).toHaveProperty('accessToken');
    expect(refresh.body.user).toMatchObject({ email });
    expect(refresh.body.accessToken).not.toEqual(firstAccessToken);
  });

  test('logout clears refresh token', async () => {
    const agent = request.agent(app);
    const email = uniqueEmail();

    await agent
      .post('/api/auth/signup')
      .send({ email, password: defaultPassword })
      .expect(201);

    await agent.post('/api/auth/logout').expect(200);

    await agent.post('/api/auth/refresh').expect(401);
  });
});
