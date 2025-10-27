const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should signup a new user', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userId');
  });

  it('should login the user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'Password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
