# OneEight LMS - MongoDB Backend Setup Guide

## Overview
The backend uses **Express.js** with **MongoDB** for user authentication and data persistence. JWT tokens are used for session management.

---

## Prerequisites

1. **Node.js** (v14 or higher) - Download from [nodejs.org](https://nodejs.org)
2. **MongoDB** - Choose one:
   - **MongoDB Atlas** (Cloud) - Recommended for Vercel deployment
   - **MongoDB Local** - For local development

---

## Step 1: Install MongoDB

### Option A: MongoDB Atlas (Cloud) - Recommended
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/oneeight-lms`

### Option B: MongoDB Local
1. Download and install from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Use connection string: `mongodb://localhost:27017/oneeight-lms`

---

## Step 2: Setup Backend

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oneeight-lms
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
PORT=5000
```

**Important:** Replace `MONGODB_URI` with your actual MongoDB connection string

### 4. Start the backend server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see: `Server running on http://localhost:5000`

---

## Step 3: Update Frontend

The frontend is already configured to use `http://localhost:5000/api`. No changes needed!

---

## Step 4: Run the Application

1. **Keep backend running** (from Step 2.4)
2. **Open the frontend:**
   - Drag `index.html` to your browser, OR
   - Use Live Server extension in VS Code
3. **Test registration and login**

---

## API Endpoints

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Verify Token
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

---

## MongoDB Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  bio: String,
  avatar: String,
  enrolledCourses: [String],
  progress: Map,
  joinDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Error: `Cannot find module 'express'`
```bash
npm install
```

### Error: `MONGODB_URI not defined`
- Check `.env` file exists with correct MongoDB URI
- Restart server after creating `.env`

### Error: `connect ECONNREFUSED 127.0.0.1:5000`
- Backend server not running
- Run: `npm start` from `/backend` directory

### Error: `MongoNetworkError`
- MongoDB connection string is incorrect
- Check MONGODB_URI in `.env`
- MongoDB server might be down

---

## Deployment

### Deploy Backend to Vercel, Railway, or Render

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy

### Update Frontend API URL
If backend is deployed, update `API_URL` in `index.html`:
```javascript
const API_URL = 'https://your-backend-domain.com/api';
```

---

## Features

✅ User Registration with password hashing  
✅ JWT-based authentication  
✅ Cross-device login support  
✅ Secure session management  
✅ MongoDB persistence  
✅ Error handling  
✅ CORS enabled  

---

## Next Steps

1. Create MongoDB Atlas account (or install local MongoDB)
2. Run `npm install` in backend folder
3. Create `.env` with your MongoDB URI
4. Start backend: `npm start`
5. Test with frontend at `http://localhost:5000/api/health`
6. Register and login through the app!

---

## Support

Need help? Check:
- Backend console for error messages
- Browser DevTools Console (F12 → Console tab)
- Network tab to see API requests/responses

