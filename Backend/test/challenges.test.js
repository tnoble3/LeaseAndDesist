import test, { after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

// These tests require a running MongoDB and valid MONGO_URI in env.
// If MONGO_URI is not set we skip the suite to avoid false failures.
const skipSuite = !process.env.MONGO_URI;

test('challenge CRUD flow (register -> login -> create -> patch -> delete)', async (t) => {
  if (skipSuite) {
    t.skip('MONGO_URI not set; skipping integration tests');
    return;
  }

  const request = supertest(app);

  // register
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Passw0rd!';
  const registerRes = await request.post('/api/users/register').send({ name: 'Test User', email, password });
  assert.equal(registerRes.status, 201);
  const token = registerRes.body.token;
  assert.ok(token);

  // create challenge
  const createRes = await request
    .post('/api/challenges')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Challenge', description: 'desc', target_date: new Date().toISOString() });
  assert.equal(createRes.status, 201);
  const challenge = createRes.body;
  assert.equal(challenge.title, 'Test Challenge');

  // toggle complete
  const patchRes = await request
    .patch(`/api/challenges/${challenge._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ completed: true });
  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.completed, true);

  // delete
  const delRes = await request
    .delete(`/api/challenges/${challenge._id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(delRes.status, 200);
}, { timeout: 20000 });

// ✅ Cleanup hook to close MongoDB after all tests
after(async () => {
  await mongoose.connection.close();
});
