# GrowSuite

**GrowSuite** is an all-in-one business operating platform for freelancers, small teams, and agencies — combining CRM, pipeline management, projects, tasks, invoicing, payments, and time tracking into one connected workspace.

> Grow your business. Not your CRM.

Manage clients, deals, projects, and invoices from one place — so your team spends less time chasing admin and more time doing the work.

---

## What's in this repo

This project has two parts:

| | |
|---|---|
| **Landing page** | Long-scroll marketing site — hero, feature walkthrough, pricing, and a scroll-driven product story from Lead → Deal → Project → Invoice → Payment |
| **App (dashboard)** | The actual product — the workspace users log into to run their business |

---

## Features

- **CRM** — Leads and Clients, with lead status tracking (New, Contacted, Qualified) and a searchable client directory
- **Pipeline** — Visual, stage-based deal tracking (Qualified → Proposal → Negotiation → Won) with pipeline value at a glance
- **Projects & Tasks** — Kanban-style project management, task assignment, and progress tracking, linked directly to clients and deals
- **Time Tracking** — Manual and timer-based time entries, billable/non-billable flagging, and invoice generation from unbilled hours
- **Invoicing & Payments** — Generate invoices from tracked work, record payments, and track outstanding/overdue balances
- **Calendar** — Unified view of project deadlines and scheduled events
- **Analytics & Activity** — Revenue, pipeline, and productivity insights, plus a live activity log across the workspace
- **Command Palette** (⌘K) — Fast keyboard-driven navigation and quick actions across the whole app
- **Settings** — Workspace configuration, team member roles and permissions, billing & plans, integrations (Razorpay, Google Calendar), and account security

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- React
- Tailwind CSS
- Framer Motion

**Backend**
- Node.js (controllers/routes architecture)
- Prisma ORM
- PostgreSQL

**Design System**
- Dark-first, near-black interface (`#0A0A0A` background, `#141414` surfaces, `#262626` borders)
- Restrained green accent (`#28CA41`) reserved for positive states, links, and indicators — never used as a button fill
- Semantic status colors: green (positive), red (overdue/destructive), amber (pending), blue (informational)
- No native form controls, no drop shadows on interactive elements, minimal contrast hierarchy throughout

---

## Project Structure

```
growsuite/
├── frontend/
│   ├── app/
│   │   └── dashboard/          # App routes (leads, pipeline, projects, etc.)
│   └── components/
│       ├── dashboard/          # Sidebar, dashboard widgets, feature components
│       └── ui/                 # Shared design-system components (StatusBadge, etc.)
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   └── routes/
│   └── prisma/
│       └── schema.prisma
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/growsuite.git
cd growsuite

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL and any integration keys

# Run database migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## Roadmap

**Now**
- Time Tracking & Billable Hours
- Narrow-scope Automation Engine (e.g. Lead Won → Create Project)

**Next**
- File & Asset Management
- Deeper Analytics & Reporting (MRR, conversion rates, per-project profitability)

**Later**
- Client Portal (external-facing, white-labeled client access)
- Proposals, Contracts & E-Signatures
- Unified Inbox (two-way email sync)

---

## License

*Add your license here.*

---

Built by [Rushikesh](https://github.com/Rushikesh1911)  
& https://rushixh.vercel.app
