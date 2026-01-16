# Airport Task Planner (MVP)

A minimal **Airport Task Planner** web application (SPA + API) for creating, allocating and monitoring tasks.

## Features (MVP)

- **Roles**: ADMIN, MANAGER, EXECUTOR
- Admin can create users and assign a manager to each executor
- Manager can create tasks (OPEN), assign tasks (PENDING), close completed tasks (CLOSED)
- Executor can view assigned tasks and complete them (COMPLETED)
- Task history available for executor and managers (for their team)
- Airport weather (METAR) lookup via external API with stored lookup history

## Technical Specification & Project Plan

### Introduction

The Airport Task Planner is a web-based task management application designed to support the planning, allocation, execution, and monitoring of operational tasks in an airport environment. The application follows a Single Page Application (SPA) architecture and enables structured collaboration between administrators, managers, and operational staff. Its design is inspired by professional task management platforms such as JIRA and Asana, adapted for airport operational workflows.

### Objectives

- Provide a centralized platform for managing operational airport tasks
- Support role-based access and responsibility separation
- Enforce a controlled task lifecycle
- Enable monitoring and historical tracking of completed work
- Ensure scalability and usability across desktop and mobile devices

### User Roles

**Administrator**
- Creates and manages user accounts
- Assigns roles (Manager or Executor)
- Assigns a manager to each executor

**Manager**
- Creates tasks with detailed descriptions
- Assigns tasks to executors
- Monitors task progress and status
- Closes completed tasks
- Views task history for executors under their supervision

**Executor**
- Views tasks assigned to them
- Marks tasks as completed
- Views their personal task history

### Task Lifecycle

Each task in the system follows a predefined lifecycle:

- **OPEN** – Task created by a manager
- **PENDING** – Task assigned to an executor
- **COMPLETED** – Task marked as finished by the executor
- **CLOSED** – Task reviewed and closed by the manager

Only authorized roles can perform specific state transitions.

### Functional Requirements

- The system supports multiple users with role-based permissions
- Each executor is assigned to exactly one manager
- Managers can create operational tasks
- Tasks can only be assigned by managers
- Executors can only complete tasks assigned to them
- Managers can monitor task statuses in real time
- Task history is available for both executors and managers
- Administrators have full control over user management

### Non-Functional Requirements

- Responsive UI (desktop, tablet, mobile)
- Secure authentication and authorization
- High availability and reliability
- Auditability of task state changes
- Scalable architecture

### System Architecture

The Airport Task Planner uses a layered architecture:

- **Frontend**: Single Page Application (SPA)
- **Backend**: RESTful API
- **Authentication**: JWT-based authentication
- **Database**: Relational database system

### Data Model

**User Entity**
- `id`
- `name`
- `email`
- `password`
- `role` (ADMIN | MANAGER | EXECUTOR)
- `managerId` (mandatory for EXECUTOR)

**Task Entity**
- `id`
- `title`
- `description`
- `status` (OPEN | PENDING | COMPLETED | CLOSED)
- `createdByManagerId`
- `assignedToUserId`
- `createdAt`
- `updatedAt`

**Task History Entity**
- `id`
- `taskId`
- `previousStatus`
- `newStatus`
- `actorUserId`
- `timestamp`

### API Overview

**Authentication**
- `POST /auth/login`
- `GET /auth/me`

**User Management (Administrator)**
- `POST /users`
- `GET /users`
- `PATCH /users/{id}`

**Task Management**
- `POST /tasks` (Manager)
- `GET /tasks`
- `POST /tasks/{id}/assign` (Manager)
- `POST /tasks/{id}/complete` (Executor)
- `POST /tasks/{id}/close` (Manager)

### Access Control Rules

- Executors can only view and update their own tasks
- Managers can manage only tasks they created
- Managers can view history only for executors they supervise
- Administrators have unrestricted access

### Future Enhancements

- Task prioritization and deadlines
- Comments and attachments
- Notifications and reminders
- Reporting and analytics dashboards
- Integration with airport operational systems

### Project Status

This project is currently implemented as an MVP and can be run locally or deployed following the instructions below.

## Tech Stack

### Backend
- Node.js (18+)
- Express.js
- PostgreSQL
- Knex.js ORM
- JWT Authentication

### Frontend
- React 19
- Material-UI
- React Router
- React Toastify

## Getting Started

### Prerequisites

- Node.js 18+ (required for built-in `fetch` used to call the external METAR API)
- PostgreSQL database

## Install & Run (Tutorial)

This tutorial walks you through a clean setup from scratch.

### 0) Clone the repository

```bash
git clone <YOUR_REPO_URL>
cd <YOUR_REPO_FOLDER>
```

### 1) Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=airport_tasks
JWT_SECRET=your-secret-key
PORT=4000
```

### 2) Install and start the backend

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

The API will be available at `http://localhost:4000`.

### 3) Configure the frontend

Open a new terminal, then:

```bash
cd frontend
```

Create a `.env` file (or copy from a template if you have one) with:

```
REACT_APP_API_URL=http://localhost:4000
```

### 4) Install and start the frontend

```bash
npm install
npm run start
```

The SPA will be available at `http://localhost:3000`.

### Environment Variables

**Backend (.env)**:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=airport_tasks
JWT_SECRET=your-secret-key
PORT=4000
```

**Frontend (.env)**:
```
REACT_APP_API_URL=http://localhost:4000
```

---

## Deployment (Overview)

You can deploy the backend and frontend separately. Any provider is fine (Render, Fly.io, Railway, Azure, AWS, etc.).

### Backend

1. Provision a PostgreSQL database.
2. Set environment variables on the host:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`
3. Run migrations and seeds:
   - `npm run migrate`
   - `npm run seed`
4. Start the API:
   - `npm run start`

### Frontend

1. Set `REACT_APP_API_URL` to your deployed API URL.
2. Build the app:
   - `npm run build`
3. Deploy the `build/` folder on a static host (Netlify, Vercel, Azure Static Web Apps, S3, etc.).

---

## Default Seeded Accounts

| Role     | Email                   | Password     |
|----------|-------------------------|--------------|
| Admin    | admin@airport.local     | Admin123!    |
| Manager  | manager@airport.local   | Manager123!  |
| Executor | exec@airport.local      | Exec123!     |

---

## Task Lifecycle

```
OPEN → PENDING → COMPLETED → CLOSED
```

- **OPEN**: Task created by a manager
- **PENDING**: Task assigned to an executor
- **COMPLETED**: Task marked as finished by the executor
- **CLOSED**: Task reviewed and closed by the manager

---

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### User Management (Admin only)
- `POST /users` - Create new user
- `GET /users` - List all users
- `PATCH /users/:id` - Update user
- `GET /users/managers` - List managers (for assigning to executors)

### Task Management
- `POST /tasks` - Create task (Manager)
- `GET /tasks` - Get tasks (role-based)
- `POST /tasks/:id/assign` - Assign task to executor (Manager)
- `POST /tasks/:id/complete` - Complete task (Executor)
- `POST /tasks/:id/close` - Close task (Manager)

### History
- `GET /my/history` - Get own task history (Executor)
- `GET /executors/:id/history` - Get executor's history (Manager)

### Team
- `GET /team` - Get manager's team members (Manager)

### Airport Weather
- `GET /airports/metar?icao=LROP` - Get METAR data for airport (Authenticated)
- `GET /airports/lookups` - Get user's METAR lookup history (Authenticated)

---

## Access Control Rules

| Role     | Permissions |
|----------|-------------|
| Admin    | Full access to user management |
| Manager  | Create tasks, assign to team, close completed tasks, view team history |
| Executor | View assigned tasks, complete tasks, view own history |

- Executors can only view and update their own tasks
- Managers can manage only tasks they created
- Managers can view history only for executors they supervise
- Administrators have unrestricted access

---

## External Data

The app integrates with the public **aviationweather.gov** METAR endpoint to retrieve real-time airport weather. Each lookup is stored in the database and can be viewed from the **Airport Weather** page in the SPA.

Example METAR lookup:
```
GET /airports/metar?icao=LROP
```

---

## Project Structure

```
├── backend/
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Seed data
│   ├── src/
│   │   ├── endpoints/       # API route handlers
│   │   ├── routes/          # Route definitions
│   │   └── utils/           # Utilities and middleware
│   ├── index.mjs            # Express app
│   ├── server.mjs           # Server entry point
│   └── knexfile.cjs         # Database configuration
│
├── frontend/
│   ├── public/              # Static assets
│   └── src/
│       ├── api/             # API service functions
│       ├── components/      # React components
│       ├── layouts/         # Page layouts
│       ├── utils/           # Utilities
│       └── views/           # Page views
│
└── README.md
```

---

## Notes

This is an MVP intended for educational use. It prioritizes clarity and minimal scope.

---

## License

This project is developed for educational purposes.
