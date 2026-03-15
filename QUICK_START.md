# Quick Start - PostgreSQL Backend (Aiven)

## 3 Steps to Get Running

### 1️⃣ Get PostgreSQL URL
- **Using Aiven:** PostgreSQL service on Aiven Cloud - [aiven.io](https://aiven.io)
- **Connection string format:** `postgres://avnadmin:YOUR_PASSWORD@your-host.aivencloud.com:port/defaultdb?sslmode=require`

### 2️⃣ Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in `/backend` folder:
```env
DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@your-host.aivencloud.com:18023/defaultdb?sslmode=require
JWT_SECRET=mysupersecretkey123
PORT=5000
```

Replace `YOUR_PASSWORD` and `your-host` with your actual Aiven PostgreSQL credentials!

### 3️⃣ Initialize Database & Start Backend
```bash
# First time: Initialize database tables
node init-db.js

# Start backend
npm start
```

Expected output:
```
Tables created successfully!
Server running on http://localhost:5000
```

---

## Test It

1. Open `index.html` in browser
2. Click **Sign Up** and create an account
3. Login with your account
4. Done! ✅

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot find module 'express'` | Run `npm install` from `/backend` folder |
| `DATABASE_URL not defined` | Check `.env` file with PostgreSQL connection string |
| `Connection refused` | Backend not running - Run `npm start` |
| `SSL/TLS error` | Ensure `?sslmode=require` is in your DATABASE_URL |

---

## File Structure
```
LMS/
├── index.html (Frontend - React SPA)
├── QUICK_START.md (This file)
└── backend/
    ├── server.js
    ├── db.js
    ├── init-db.js
    ├── package.json
    ├── .env (Create this - not in repo)
    └── routes/
        └── auth.js
```

---

## Architecture

```
Frontend (index.html)
    ↓ (API Calls)
Express Backend (localhost:5000)
    ↓ (pg driver)
PostgreSQL Database (Aiven)
```

---

## API Endpoints Running

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

---

Ready? Let's go! 🚀
