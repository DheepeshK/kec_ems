# KEC EMS — Event Management System

A centralized web platform for managing institutional events, attendance tracking, organization management, and analytics at KEC.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, ZXing
- **Backend:** Node.js, Express, MySQL, JWT
- **Monorepo:** npm workspaces (`client` + `server`)

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials and JWT secret.

### 3. Create database

```bash
mysql -u root -p < database/schema.sql
```

### 4. Seed demo data

```bash
npm run seed --workspace=server
```

Default password for all seed users: `password123`

| Role | Email |
|------|-------|
| Super Admin | admin@kec.edu |
| Club Admin | clubadmin@kec.edu |
| Faculty | faculty@kec.edu |
| Volunteer | volunteer@kec.edu |

### 5. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## MVP Features

- JWT authentication with role-based access (super_admin, club_admin, faculty, volunteer)
- Organization management with logo upload
- Student CRUD + CSV bulk import
- Event lifecycle (draft → pending → approved/rejected → completed)
- Multi-organization event collaboration
- Session management per event
- Barcode + manual attendance with duplicate prevention
- Role-scoped dashboard
- Public event and organization showcase (no login)

## Phase 2 (Deferred)

- Volunteer assignment and approval workflow
- OD PDF generation (jsPDF)
- Email sharing via Nodemailer
- Advanced analytics and reports
- Certificate generation

## Project Structure

```
kec-ems/
├── client/          # React frontend
├── server/          # Express API
├── database/        # schema.sql, seeds.sql
└── package.json     # workspace root
```

## API Health Check

```bash
curl http://localhost:5000/api/health
```

## Smoke Test Flow

1. Login as `faculty@kec.edu` / `password123`
2. Create an event with sessions and organizations
3. Submit for approval
4. Login as `clubadmin@kec.edu` and approve the event
5. Open a session's attendance page and mark students via roll number
6. Verify duplicate marking shows an error
7. Visit public `/events` page without login
