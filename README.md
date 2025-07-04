# Real Estate Web Application

A full-stack web application for real estate listings with chat functionality, filtering, agent/admin authentication, and user interaction. Built using:

* **Frontend:** React + Vite + SCSS
* **Backend:** Node.js + Express + Prisma
* **Database:** MongoDB

---

## \:house: Features

### User

* Sign up/login/logout (JWT + cookie-based)
* View property listings
* Save posts
* Chat with agents
* Post property listings
* View price history

### Agent

* Sign up/login/logout
* View dashboard
* Manage listings

### Admin (via API)

* User and agent data access
* Post management

---

## \:file\_folder: Project Structure

```bash
Estate_app/
├── api/             # Express backend
│   ├── controllers/ # Business logic (auth, chat, post, user, agent)
│   ├── middleware/  # JWT verification
│   ├── prisma/      # Prisma schema
│   ├── routes/      # API routes
│   ├── lib/         # Prisma client
│   └── app.js       # Express app
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── context/     # Auth & Socket context
│   │   ├── lib/         # Helper utilities
│   │   ├── routes/      # Pages
│   │   └── main.jsx     # App entry point
├── socket/          # Real-time WebSocket (Socket.IO)
```

---

## \:hammer\_and\_wrench: Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/real-estate-app.git
cd real-estate-app
```

### 2. Setup Environment Variables

Create `.env` file in `api/`:

```env
DATABASE_URL="your-mongodb-connection-string"
JWT_SECRET_KEY="your-secret-key"
CLIENT_URL="http://localhost:5173"
```

### 3. Install Dependencies

```bash
cd api && npm install
cd ../client && npm install
cd ../socket && npm install
```

### 4. Run the Application

```bash
# Terminal 1: Backend
cd api
npx prisma generate
npx prisma db push
npm run dev

# Terminal 2: Frontend
cd ../client
npm run dev

# Terminal 3: Socket Server
cd ../socket
node app.js
```

---

## \:rocket: API Overview

| Endpoint               | Method | Description          |
| ---------------------- | ------ | -------------------- |
| /api/auth/login        | POST   | User login           |
| /api/auth/register     | POST   | User registration    |
| /api/posts             | GET    | List all posts       |
| /api/users/save        | POST   | Save a post          |
| /api/chats             | GET    | Get user chats       |
| /api/messages/\:chatId | POST   | Send message in chat |

... more routes in `/api/routes/`

---

## \:framed\_picture: Architecture Diagram

![Architecture Diagram](./docs/architecture.png)

* **Frontend** communicates with **Express API** and receives real-time messages via **Socket.IO**.
* **Prisma** abstracts MongoDB access.
* **JWT middleware** secures user/agent routes.

---

## \:memo: Notes

* Only Gmail addresses are accepted for registration.
* Passwords are hashed using bcrypt.
* Agent and user roles are separated.

---

## \:handshake: Contributing

1. Fork this repo
2. Create a branch `git checkout -b feature-name`
3. Commit changes `git commit -am 'Add new feature'`
4. Push to the branch `git push origin feature-name`
5. Create a pull request

---

## \:camera\_flash: Screenshots

Place your screenshots in the `docs/` folder and reference them in this README.

---

## \:star: License

MIT

---

## \:mailbox\_with\_mail: Contact

For issues, please open an issue on GitHub or contact `your.email@example.com`.
