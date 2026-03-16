# LMS (Learning Management System)

A simple LMS application with a frontend UI and a Node.js/Express backend connected to PostgreSQL.

## Live Demo

https://lms-ekny.vercel.app/

## Repository Structure

- `index.html` - Frontend application
- `api/[...all].js` - Serverless API handler
- `backend/` - Express backend and database setup
- `MONGODB_SETUP.md` - MongoDB setup notes
- `QUICK_START.md` - Quick start for PostgreSQL backend

## Tech Stack

- Frontend: HTML/CSS/JavaScript
- Backend: Node.js, Express
- Auth: JWT, bcryptjs
- Database: PostgreSQL (`pg`)
- Deployment: Vercel

## Local Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Create backend environment file

Create `backend/.env`:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Initialize database and run backend

```bash
cd backend
node init-db.js
npm start
```

Backend runs at `http://localhost:5000`.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
