# ClientIQ – Feature Guide

A short explanation of each feature in the platform.

---

## Deployment

**Frontend** – Set `VITE_API_URL` to your backend URL (e.g. `https://api.yourdomain.com`). No trailing slash. The app will append `/api` to it. Leave unset for local dev (uses Vite proxy).

**Backend** – Set `CORS_ORIGIN` to your frontend URL(s), comma-separated (e.g. `https://app.yourdomain.com,https://www.yourdomain.com`). Leave unset for dev (allows all origins).

---

## Auth

**Register** – Create an account with name, email, and password. New users get the default `user` role.

**Login** – Sign in with email and password. A JWT token is stored and used for all protected API calls.

**Logout** – Clears the session and redirects to the login page.

---

## Dashboard

**Overview** – Summary cards for total customers, leads, and revenue. A pie chart shows leads by status (New, Contacted, Qualified, Closed, Lost).

**Recent leads** – Last 5 leads with links to the leads page.

**Recent activity** – Last 5 platform activities (e.g. customer created, lead updated).

**Upcoming tasks** – Next 5 incomplete tasks with due dates.

---

## Customers

**List** – Paginated list of your customers with search by name, email, or company.

**Add** – Create a customer with name, email, phone, company, and notes.

**Edit** – Update customer details. Changes are logged in the activity timeline.

**Delete** – Remove a customer. Associated leads must be handled separately.

**View** – Open a customer to see details, linked leads, and actions (email, summary).

---

## Leads

**List** – Paginated leads with filters by status. Each lead shows customer, status, and value.

**Add** – Create a lead linked to a customer. Set title, status, value, win probability, and notes.

**Edit** – Update lead details and status. Status changes can be reflected in the pipeline.

**Notes** – Add notes to a lead with timestamps and author.

**Delete** – Remove a lead from the system.

---

## Pipeline

**Kanban board** – Drag-and-drop view of leads by status: New → Contacted → Qualified → Closed / Lost.

**Move cards** – Drag a lead card to another column to change its status.

**Quick actions** – Open lead details, send email, or view AI summary from the card.

**Win probability** – Shown on each card to help prioritize follow-ups.

---

## Activities

**Timeline** – Chronological list of actions: customer/lead created or updated, emails sent, tasks completed.

**Filters** – Filter by entity type (Customer, Lead, etc.), entity ID, or activity type.

**Scope** – Activities are scoped to the logged-in user.

---

## Tasks

**List** – All tasks with filters by completion, customer, or lead.

**Add** – Create a task with title, description, due date, priority, and optional customer/lead link.

**Complete** – Mark tasks done; completion is logged in activities.

**Upcoming** – View incomplete tasks with due dates on the dashboard.

---

## Emails

**Send** – Compose and send emails from the app via SMTP (e.g. Gmail). Requires SMTP config in `.env`.

**History** – List of sent emails, filterable by customer or lead.

**Draft with AI** – Use AI to generate a subject and body based on contact context (requires Gemini API key).

---

## Reports

**Summary** – Totals for customers, leads, revenue, and closed deals.

**Revenue chart** – Bar chart of revenue over time (7, 30, or 90 days).

**Conversion funnel** – Leads by status with counts and values. Pie chart for distribution.

**Export** – Download leads or customers as CSV.

---

## AI Features

**Draft with AI** – In the email modal, click “Draft with AI” to generate a follow-up email using contact history, notes, and recent activity.

**Contact summary** – On customer/lead views, click “Summary” to get a short AI summary of the contact and suggested next steps.

*Requires `GOOGLE_GENERATIVE_AI_API_KEY` in `.env`. If not set, these options are disabled or show a clear message.*

---

## Admin

**Access** – Only users with `role: 'admin'` can open `/admin`. Promote users in MongoDB.

**Platform stats** – Totals for users, customers, leads, activities, emails, tasks, and revenue.

**Charts** – Pie chart for leads by status, bar chart for last 7 days (new users/customers/leads), funnel bar chart.

**Recent activity** – Last 15 activities across all users.

---

## Navigation

- **Dashboard** – Home and overview
- **Customers** – Customer management
- **Leads** – Lead management
- **Pipeline** – Kanban view
- **Activity** – Activity timeline
- **Tasks** – Task management
- **Reports** – Analytics and exports
- **Admin** – Platform stats (admin only)
