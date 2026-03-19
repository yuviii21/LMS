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
- AI Integration: Hugging Face API (`@huggingface/inference`)
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
HF_TOKEN=your_hugging_face_api_token
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
- `POST /api/ai/chat` (AI Chatbot Proxy)

## AI Chatbot Integration

The application features a floating **AI Tutor** designed to help students learn effectively. 
- Integrated directly into the React frontend UI as a floating bubble at the bottom right.
- Proxies secure requests entirely via the Node.js backend.
- Built using the official `@huggingface/inference` SDK.
- Defaults to the `meta-llama/Llama-3.2-1B-Instruct` model (configurable backend route).
