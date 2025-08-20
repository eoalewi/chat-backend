import request from 'supertest';
import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './setup';

import authRoutes from '../src/modules/auth/auth.routes';

dotenv.config({ path: '.env.test' });

let server: http.Server;

beforeAll(async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/auth', authRoutes);
  server = app.listen(0);
});

afterAll(async () => {
  server.close();
  await prisma.$disconnect();
});

test('register & login flow', async () => {
  const base = request(server);
  const email = `u${Date.now()}@t.com`;

  const reg = await base.post('/auth/register').send({
    email, username: 'tester', password: 'secret123'
  });
  expect(reg.status).toBe(201);
  expect(reg.body.token).toBeDefined();

  const login = await base.post('/auth/login').send({ email, password: 'secret123' });
  expect(login.status).toBe(200);
  expect(login.body.token).toBeDefined();
});
