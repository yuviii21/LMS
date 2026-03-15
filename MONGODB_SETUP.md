# OneEight LMS - PostgreSQL Backend Setup Guide (Aiven)

## Overview
The backend uses **Express.js** with **PostgreSQL** (hosted on Aiven) for user authentication and data persistence. JWT tokens are used for session management.

---

## Prerequisites

1. **Node.js** (v14 or higher) - Download from [nodejs.org](https://nodejs.org)
2. **PostgreSQL** - Using Aiven Cloud Database - [aiven.io](https://aiven.io)

---

## Step 1: Setup PostgreSQL Database (Aiven)

### Using Aiven PostgreSQL
1. Go to [Aiven Console](https://aiven.io)
2. Create a free account or sign in
3. Create a new PostgreSQL service
4. Get your connection credentials from the Aiven console:
   - **Host:** Your Aiven PostgreSQL host
   - **Port:** Usually 18023
   - **Database:** defaultdb
   - **User:** avnadmin
   - **Password:** Your Aiven password

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
DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@your-host.aivencloud.com:18023/defaultdb?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
PORT=5000
NODE_ENV=development
```

**Important:** 
- Replace `YOUR_PASSWORD` and `your-host` with your actual Aiven PostgreSQL credentials from the Aiven console
- Ensure the connection string includes `?sslmode=require`

### 4. Initialize the database tables
```bash
node init-db.js
```

Expected output:
```
Starting database initialization...
Tables created successfully!
```

### 5. Start the backend server
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

1. **Keep backend running** (from Step 2.5)
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

## PostgreSQL Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT DEFAULT 'Passionate learner',
  avatar VARCHAR(255) DEFAULT '👨‍💻',
  enrolled_courses JSONB DEFAULT '[]'::jsonb,
  progress JSONB DEFAULT '{}'::jsonb,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Troubleshooting

### Error: `Cannot find module 'express'`
```bash
npm install
```

### Error: `DATABASE_URL not defined`
- Check `.env` file exists with correct PostgreSQL URI
- Restart server after creating `.env`
- Ensure `?sslmode=require` is in your DATABASE_URL

### Error: `SSL/TLS error`
- Add `?sslmode=require` to your DATABASE_URL
- Make sure you're using the correct Aiven host and port

### Error: `connect ECONNREFUSED 127.0.0.1:5000`
- Backend server not running
- Run: `npm start` from `/backend` directory

### Error: `Tables already exist`
- This is normal - the init-db.js uses `CREATE TABLE IF NOT EXISTS`
- You only need to run it once

---

## Deployment

### Deploy Backend to Vercel, Railway, or Render

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables:
   - `DATABASE_URL` (Your Aiven PostgreSQL URI)
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Run `node init-db.js` after first deployment to initialize tables
5. Deploy

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
✅ PostgreSQL persistence (Aiven Cloud)  
✅ SSL/TLS encrypted connections  
✅ Error handling  
✅ CORS enabled  
✅ UUID primary keys  
✅ JSONB for flexible data storage  

---

## Next Steps

1. Create Aiven PostgreSQL account
2. Run `npm install` in backend folder
3. Create `.env` with your Aiven PostgreSQL connection string
4. Run `node init-db.js` to initialize database tables
5. Start backend: `npm start`
6. Test with backend health: `/api/health`
7. Register and login through the app!

---

## Support

Need help? Check:
- Backend console for error messages
- Browser DevTools Console (F12 → Console tab)
- Network tab to see API requests/responses

