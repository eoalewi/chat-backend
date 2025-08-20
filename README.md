Got it ✅
You want your project’s **README.md** to look professional (like the NestJS one you showed), with badges, centered logo/title, and a structured breakdown of features, installation, usage, API, and license.

Here’s a polished **boilerplate README.md** tailored for your realtime chat backend:

````markdown
<p align="center">
  <img src="https://img.icons8.com/external-flatart-icons-outline-flatarticons/344/external-chat-chat-flatart-icons-outline-flatarticons.png" width="120" alt="Chat Logo" />
</p>

<h1 align="center">Realtime Chat Backend</h1>

<p align="center">
  A feature-complete <b>chat backend</b> built with Node.js, Express, TypeScript, Socket.IO, Prisma, and MySQL.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/express" target="_blank"><img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" alt="Express" /></a>
  <a href="https://socket.io" target="_blank"><img src="https://img.shields.io/badge/Socket.IO-Realtime-blue?logo=socket.io" alt="Socket.IO" /></a>
  <a href="https://www.prisma.io/" target="_blank"><img src="https://img.shields.io/badge/Prisma-ORM-black?logo=prisma" alt="Prisma" /></a>
  <a href="https://www.mysql.com/" target="_blank"><img src="https://img.shields.io/badge/MySQL-Database-orange?logo=mysql" alt="MySQL" /></a>
  <a href="https://github.com/" target="_blank"><img src="https://img.shields.io/github/license/yourusername/chat-backend" alt="License" /></a>
</p>

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

MIT © [Your Name](https://github.com/yourusername)

```

---

👉 This is clean, professional, and matches the style of the NestJS one you saw.  
Would you like me to also add **usage examples with cURL or Postman requests** (so devs can quickly test APIs), or keep it lean?
```
