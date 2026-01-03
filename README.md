Airport Task Planner Technical Specification and Project Plan
1. Introduction

The Airport Task Planner is a web-based task management application designed to support the planning, allocation, execution, and monitoring of operational tasks in an airport environment. The application follows a Single Page Application (SPA) architecture and enables structured collaboration between administrators, managers, and operational staff. Its design is inspired by professional task management platforms such as JIRA and Asana, adapted for airport operational workflows.

2. Objectives
The main objectives of the Airport Task Planner are:

To provide a centralized platform for managing operational airport tasks
To support role-based access and responsibility separation
To enforce a controlled task lifecycle
To enable monitoring and historical tracking of completed work
To ensure scalability and usability across desktop and mobile devices

4. User Roles
3.1 Administrator

The Administrator is responsible for user management:

Creates and manages user accounts
Assigns roles (Manager or Executor)
Assigns a manager to each executor

3.2 Manager

Managers coordinate operational activities:
Create tasks with detailed descriptions
Assign tasks to executors
Monitor task progress and status
Close completed tasks
View task history for executors under their supervision

3.3 Executor

Executors are responsible for performing operational tasks:

View tasks assigned to them
Mark tasks as completed
View their personal task history

4. Task Lifecycle

Each task in the system follows a predefined lifecycle:

OPEN – Task created by a manager

PENDING – Task assigned to an executor

COMPLETED – Task marked as finished by the executor

CLOSED – Task reviewed and closed by the manager

Only authorized roles can perform specific state transitions.

5. Functional Requirements

The system supports multiple users with role-based permissions

Each executor is assigned to exactly one manager

Managers can create operational tasks

Tasks can only be assigned by managers

Executors can only complete tasks assigned to them

Managers can monitor task statuses in real time

Task history is available for both executors and managers

Administrators have full control over user management

6. Non-Functional Requirements

Responsive UI (desktop, tablet, mobile)

Secure authentication and authorization

High availability and reliability

Auditability of task state changes

Scalable architecture

7. System Architecture

The Airport Task Planner uses a layered architecture:

Frontend: Single Page Application (SPA)

Backend: RESTful API

Authentication: JWT-based authentication

Database: Relational database system

8. Technology Stack
Frontend

React

TypeScript

Vite

Tailwind CSS / Material UI

Backend

Node.js

NestJS

REST API

JWT Authentication

Database

PostgreSQL

Prisma ORM

9. Data Model
User Entity

id

name

email

password

role (ADMIN | MANAGER | EXECUTOR)

managerId (mandatory for EXECUTOR)

Task Entity

id

title

description

status (OPEN | PENDING | COMPLETED | CLOSED)

createdByManagerId

assignedToUserId

createdAt

updatedAt

Task History Entity

id

taskId

previousStatus

newStatus

actorUserId

timestamp

10. API Overview
Authentication

POST /auth/login

GET /auth/me

User Management (Administrator)

POST /users

GET /users

PATCH /users/{id}

Task Management

POST /tasks (Manager)

GET /tasks

POST /tasks/{id}/assign (Manager)

POST /tasks/{id}/complete (Executor)

POST /tasks/{id}/close (Manager)

11. Access Control Rules

Executors can only view and update their own tasks

Managers can manage only tasks they created

Managers can view history only for executors they supervise

Administrators have unrestricted access

12. Future Enhancements

Task prioritization and deadlines

Comments and attachments

Notifications and reminders

Reporting and analytics dashboards

Integration with airport operational systems

13. Project Status

This project is currently in the design and planning phase.
Implementation will follow based on the specifications described above.

14. License

This project is developed for educational purposes.
