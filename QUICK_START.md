# Quick Start - MongoDB Backend

## 3 Steps to Get Running

### 1️⃣ Get MongoDB URL
- **Free Option:** MongoDB Atlas (cloud) - [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)
- **Copy your connection string:** `mongodb+srv://username:password@cluster.mongodb.net/oneeight-lms`

### 2️⃣ Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in `/backend` folder:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oneeight-lms
JWT_SECRET=mysupersecretkey123
PORT=5000
```

Replace with your MongoDB URI!

### 3️⃣ Start Backend
```bash
npm start
```

Expected output:
```
Connected to MongoDB
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
| `MONGODB_URI not defined` | Check `.env` file with MongoDB connection string |
| `Connection refused` | Backend not running - Run `npm start` |
| `MongoNetworkError` | Wrong MongoDB URI or server is down |

---

## File Structure
```
LMS/
├── index.html (Frontend - React SPA)
├── MONGODB_SETUP.md (Detailed setup guide)
├── QUICK_START.md (This file)
└── backend/
    ├── server.js
    ├── package.json
    ├── .env (Create this - not in repo)
    ├── .env.example
    ├── models/
    │   └── User.js
    └── routes/
        └── auth.js
```

---

## Architecture

```
Frontend (index.html)
    ↓ (API Calls)
Express Backend (localhost:5000)
    ↓ (Mongoose)
MongoDB Database
```

---

## API Endpoints Running

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

---

Ready? Let's go! 🚀
