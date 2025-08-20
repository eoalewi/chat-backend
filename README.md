# Realtime Chat Backend (Node + Express + Socket.IO + TypeScript + Prisma + MySQL) A feature-complete chat backend with auth, rooms, realtime messaging, typing, presence, rate limiting, and delivery/read receipts.
---

## ✨ Features
- 🔐 Authentication (JWT + bcrypt)
- 💬 Realtime messaging with Socket.IO
- 👥 Rooms & memberships
- ✍️ Typing indicators
- 🟢 Presence (online/offline + last seen)
- 📬 Message delivery & read receipts
- 🚦 Rate limiting (5 msgs / 10s per user)
- 🐳 Docker + docker-compose ready
- ✅ Tested with Jest + Supertest

---

## 🚀 Tech Stack
- **Backend**: Node.js, Express, TypeScript  
- **Realtime**: Socket.IO  
- **Database**: MySQL with Prisma ORM  
- **Auth**: JWT & bcrypt  
- **Infra**: Docker, docker-compose  
- **Testing**: Jest, Supertest  

---

## ⚡ Getting Started (Local)

### 1. Install dependencies
```bash
npm install
````

### 2. Configure environment

```bash
cp .env.example .env
```

Update `DATABASE_URL` for MySQL.

### 3. Run database & migrate

```bash
npx prisma migrate dev
```

### 4. Start development

```bash
npm run dev
```

### 5. Build & run

```bash
npm run build
npm start
```

### 6. Run with Docker

```bash
docker-compose up --build
```

---

## 📜 Scripts

* `npm run dev` — start in dev mode (ts-node)
* `npm run build` — compile TypeScript
* `npm start` — run compiled server
* `npm test` — run Jest tests

---

## 📡 API Endpoints

### Auth

* `POST /auth/register` — `{ email, username, password }`
* `POST /auth/login` — `{ email, password }`

### Rooms

* `POST /rooms` — create room (auth)
* `POST /rooms/join` — join room (auth)
* `GET /rooms` — list my rooms (auth)

### Messages

* `POST /messages` — send message (auth)
* `GET /messages/rooms/:roomId/messages?limit=20&cursor=ID` — history (auth)
* `POST /messages/read` — mark messages read (auth)

---

## 🔌 Socket.IO Events

* `join_room` — `{ roomId }`
* `send_message` — `{ roomId, content }` → emits `receive_message`
* `typing` — `{ roomId, isTyping }` → emits `typing`
* `user_status` — broadcast online/offline
* `delivered` — `{ messageId, roomId, userIds[], deliveredAt }`
* `read_message` — `{ roomId, messageIds[] }` → emits `read`
* `receive_message` — broadcasted to `room:<roomId>`

---

## 📘 Notes

* Rate limit: **5 messages / 10 seconds per user** (server-side)
* Presence: user goes online on first socket connect; offline on last disconnect
* `lastSeen` stored on disconnect

---

## 📝 License

MIT © [Oluwatosin Alewi](https://github.com/eoalewi)

```