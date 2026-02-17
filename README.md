# ClientIQ – CRM

A full-stack Customer Relationship Management (CRM) application built with the MERN stack. Manage customers, leads, pipeline, activities, tasks, and emails—with AI-powered draft and contact summaries.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Production Checklist](#production-checklist)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite 7** | Build tool, dev server, HMR |
| **React Router 7** | Client-side routing |
| **Framer Motion** | Animations and transitions |
| **Recharts** | Charts (pie, bar, funnel) |
| **Lucide React** | Icons |
| **Axios** | HTTP client for API calls |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express 4** | Web framework |
| **MongoDB** | Database |
| **Mongoose 8** | ODM for MongoDB |
| **JWT** (jsonwebtoken) | Authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | SMTP email sending |
| **Multer** | File upload handling |
| **Cloudinary** | Image storage (avatars, customer images) |
| **Vercel AI SDK** + **@ai-sdk/google** | AI features (Gemini) |
| **Zod** | Schema validation for AI responses |

### DevOps & Tooling

- **dotenv** – Environment variables
- **CORS** – Cross-origin requests
- **nodemon** – Dev auto-restart (backend)

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  Port 3000 (dev) / Static build (prod)                           │
│  - SPA with React Router                                         │
│  - AuthContext for user state                                    │
│  - Axios interceptors for JWT + 401 handling                      │
└───────────────────────────────┬───────────────────────────────────┘
                               │ HTTP/REST
                               │ /api/*
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express)                         │
│  Port 5000                                                       │
│  - REST API                                                     │
│  - JWT auth middleware                                           │
│  - Role-based access (user / admin)                              │
└───────────────────────────────┬───────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    MongoDB      │  │   Cloudinary    │  │  External APIs   │
│  (Data store)   │  │ (Image uploads) │  │  - Gmail SMTP    │
│                 │  │                 │  │  - Gemini AI     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Request Flow

1. **Auth**: User logs in → backend returns JWT → frontend stores in `localStorage` and sends `Authorization: Bearer <token>` on every request.
2. **Protected routes**: Backend `protect` middleware validates JWT and attaches `req.user`.
3. **Admin routes**: Additional `admin` middleware checks `req.user.role === 'admin'`.
4. **File uploads**: Images uploaded via Multer (memory) → sent to Cloudinary → URL returned and stored in DB.

### Data Flow

- **Customers** → have many **Leads**
- **Leads** → belong to a Customer, have status (New, Contacted, Qualified, Closed, Lost)
- **Activities** → log all CRUD and key actions (customer/lead/task/email)
- **Tasks** → can link to Customer or Lead
- **Emails** → sent via SMTP, stored with customer/lead reference

---

## Project Structure

```
clientIQ/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, ImageUpload, modals, etc.)
│   │   ├── context/         # AuthContext, ToastContext, useAuth
│   │   ├── pages/           # Route-level pages (Dashboard, Leads, etc.)
│   │   ├── services/        # api.js – Axios instance + API functions
│   │   ├── utils/           # cloudinary.js – upload helpers
│   │   ├── App.jsx          # Routes, PrivateRoute, AdminRoute
│   │   └── main.jsx         # Entry, providers
│   ├── vite.config.js       # Proxy /api → backend in dev
│   └── package.json
│
├── backend/
│   ├── server.js            # Entry: dotenv, DB connect, app.listen
│   └── src/
│       ├── app.js           # Express app, CORS, routes
│       ├── config/          # db.js – Mongoose connection
│       ├── controllers/     # auth, customer, lead, email, task, report, ai, admin, activity, upload
│       ├── middleware/      # auth.middleware, admin.middleware, validateObjectId
│       ├── models/          # User, Customer, Lead, Activity, Task, Email
│       ├── routes/          # REST route definitions
│       ├── services/        # emailService.js – Nodemailer
│       └── utils/           # generateToken, logActivity
│
├── Guide.md                 # Feature-by-feature guide
└── README.md
```

### API Routes

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, getMe, updateProfile |
| `/api/customers` | CRUD customers |
| `/api/leads` | CRUD leads, notes, dashboard stats |
| `/api/activities` | List activities, recent |
| `/api/emails` | Send email, list sent emails |
| `/api/tasks` | CRUD tasks, upcoming |
| `/api/reports` | Revenue, funnel, summary, CSV export |
| `/api/ai` | Draft email, summarize contact |
| `/api/admin` | Platform stats (admin only) |
| `/api/upload` | Image upload (auth + register) |

---

## Features

### Core

- **Auth** – Register, login, JWT, profile update (name, avatar)
- **Customers** – CRUD, search, pagination
- **Leads** – CRUD, status workflow, notes, linked to customers
- **Pipeline** – Kanban board, drag-and-drop status changes
- **Activities** – Timeline of all actions
- **Tasks** – Create, complete, link to customer/lead
- **Emails** – Send via SMTP, history, link to customer/lead

### AI (requires `GOOGLE_GENERATIVE_AI_API_KEY`)

- **Draft with AI** – Generate email subject and body from contact context
- **Contact summary** – AI summary and suggested next steps

### Reports

- Summary stats, revenue chart, conversion funnel, CSV export

### Admin

- Platform-wide stats, charts, recent activity (admin role only)

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET (required)
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`. Vite proxies `/api` to the backend.

### 3. First Admin User

1. Register via the app.
2. Promote to admin in MongoDB:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (strong random string in production) |
| `PORT` | No | Backend port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | Prod | Comma-separated frontend URLs (e.g. `https://app.yourdomain.com`) |
| `SMTP_HOST` | For email | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | For email | e.g. `587` |
| `SMTP_SECURE` | For email | `true` or `false` |
| `SMTP_USER` | For email | SMTP username |
| `SMTP_PASS` | For email | SMTP password (Gmail: use App Password) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | For AI | Gemini API key |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Prod | Backend URL (e.g. `https://api.yourdomain.com`). Leave unset for dev (uses proxy). |

---

## Deployment

### Frontend

1. Set `VITE_API_URL` to your backend URL (no trailing slash).
2. Build: `npm run build`
3. Deploy the `dist/` folder to Vercel, Netlify, or any static host.

### Backend

1. Set `CORS_ORIGIN` to your frontend URL(s), comma-separated.
2. Set `NODE_ENV=production`.
3. Use production MongoDB (e.g. Atlas).
4. Deploy to Railway, Render, Fly.io, or similar. (Vercel serverless may block SMTP.)

### Example

- Frontend: `https://clientiq.vercel.app` → `VITE_API_URL=https://clientiq-api.railway.app`
- Backend: `CORS_ORIGIN=https://clientiq.vercel.app`

---

## Production Checklist

- [ ] `NODE_ENV=production`
- [ ] Strong, unique `JWT_SECRET`
- [ ] Production MongoDB (e.g. Atlas)
- [ ] `VITE_API_URL` set in frontend build
- [ ] `CORS_ORIGIN` set on backend
- [ ] SMTP configured (Gmail: use App Password)
- [ ] Cloudinary configured for image uploads
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY` for AI features (optional)
- [ ] Frontend build: `cd frontend && npm run build`
- [ ] Serve frontend static files or use a CDN

---

## License

Private / MIT (adjust as needed)
