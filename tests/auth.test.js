const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;

describe('Auth endpoints', () => {
    let mongod;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        process.env.MONGO_URI = uri;
        process.env.JWT_SECRET = 'testsecret';
        app = require('../server');
        // ensure mongoose uses the in-memory server
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        if (mongod) await mongod.stop();
    });

    test('signup -> login -> logout flow', async () => {
        const email = 'test@example.com';
        const pw = 'password123';

        const signupRes = await request(app).post('/api/auth/signup').send({ name: 'Test', email, password: pw });
        expect(signupRes.status).toBe(201);
        expect(signupRes.body).toHaveProperty('accessToken');

        const loginRes = await request(app).post('/api/auth/login').send({ email, password: pw });
        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('accessToken');

        const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', loginRes.headers['set-cookie'] || []);
        expect(logoutRes.status).toBe(200);
    });

    test('login with invalid credentials fails', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'nope@example.com', password: 'x' });
        expect(res.status).toBe(401);
    });
});
