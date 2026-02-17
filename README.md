# ClientIQ – CRM

A MERN-stack CRM with customers, leads, pipeline, activities, tasks, emails, reports, and AI features.

## Tech Stack

- **Frontend:** React, Vite, Framer Motion, Recharts, Lucide Icons
- **Backend:** Express, Mongoose, JWT, Nodemailer, Vercel AI SDK (Gemini)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET (required)
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 3. First Admin User

Create a user via Register, then promote to admin in MongoDB:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (use a strong random string in production) |
| `PORT` | No | Backend port (default: 5000) |
| `SMTP_*` | For email | SMTP config (e.g. Gmail) – email feature disabled if not set |
| `GOOGLE_GENERATIVE_AI_API_KEY` | For AI | Gemini API key – AI draft/summary disabled if not set |

## Production Launch Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, unique `JWT_SECRET`
- [ ] Use production MongoDB (e.g. Atlas)
- [ ] Configure SMTP for email (optional)
- [ ] Configure Gemini API key for AI features (optional)
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Serve frontend static files from backend or use a reverse proxy (nginx)
- [ ] Ensure `/api` routes proxy to backend if frontend is on a different host

## Features

- **Auth:** Register, login, JWT
- **Customers & Leads:** CRUD, pipeline (Kanban), notes
- **Activities:** Timeline of actions
- **Tasks:** Create, complete, link to customers/leads
- **Emails:** Send via SMTP, AI draft
- **Reports:** Revenue, funnel, CSV export
- **Admin:** Platform stats (admin role required)
