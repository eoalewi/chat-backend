import request from 'supertest';
import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma, resetDb } from './setup';
import authRoutes from '../src/modules/auth/auth.routes';
import roomRoutes from '../src/modules/room/room.routes';
import messageRoutes from '../src/modules/message/message.routes';


dotenv.config({ path: '.env.test' });

jest.setTimeout(20000); // 20 seconds

let server: http.Server;
let base: any;



beforeAll(async () => {
  await resetDb();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/rooms', roomRoutes);
  app.use('/messages', messageRoutes);
  server = app.listen(0);
  base = request(server);
});

afterAll(async () => {
  server.close();
  await prisma.$disconnect();
});


async function signupLogin(email: string) {
  await base.post('/auth/register').send({ email, username: 't', password: 'p@ssw0rd' });
  const login = await base.post('/auth/login').send({ email, password: 'p@ssw0rd' });

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return { token: login.body.token as string, userId: user.id };
}

test('send message and mark read', async () => {
  const a = await signupLogin(`a${Date.now()}@t.com`);
  const b = await signupLogin(`b${Date.now()}@t.com`);

  // A creates room
  const room = await base.post('/rooms').set('Authorization', `Bearer ${a.token}`).send({
    name: 'r', isPrivate: false
  });
  const roomId = room.body.id;

  // B joins
  const joined = await base.post('/rooms/join').set('Authorization', `Bearer ${b.token}`).send({ roomId });
  expect(joined.status).toBe(200);

  // A sends message
  const msg = await base.post('/messages').set('Authorization', `Bearer ${a.token}`).send({
    roomId, content: 'hello'
  });
  expect(msg.status).toBe(201);
  const messageId = msg.body.id;

  // B lists messages
  const list = await base.get(`/messages/rooms/${roomId}/messages`).set('Authorization', `Bearer ${b.token}`);
  expect(list.status).toBe(200);
  expect(list.body.items.length).toBeGreaterThan(0);

  // B marks read
  const read = await base.post('/messages/read').set('Authorization', `Bearer ${b.token}`).send({
    messageIds: [messageId]
  });
  expect(read.status).toBe(200);

  // ✅ Verify receipt
  const receipt = await prisma.messageReceipt.findUnique({
    where: { messageId_userId: { messageId, userId: b.userId } }
  });
  expect(receipt?.read).toBe(true);
});

