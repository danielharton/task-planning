Airport Task Planner – Technical Specification and Project Plan
Theme

The project consists of a web application (SPA) for planning and monitoring operational tasks in an airport environment (handling, security, cleaning, maintenance, operations). It includes a RESTful Node.js backend, a relational database, and integrations with aviation-related services such as flight status and METAR/TAF. All components are designed to run locally, without using third-party hosting services.

1. Objective and Scope

The Airport Task Planner application allows users to create, assign, and track operational tasks across different teams such as handling, security, cleaning, and maintenance. These teams are coordinated by duty or operations managers.

The system supports the full life cycle of a task, which goes through the states OPEN → PENDING → COMPLETED → CLOSED. It also maintains a detailed history per user and per flight or stand, in order to ensure full traceability of operational actions.

1.1 Stakeholders

An Administrator manages users, roles, teams, task templates, and SLAs.

A Duty/Ops Manager creates and assigns tasks, validates task completion, closes tasks, and views OTP and turnaround reports.

A Team Lead redistributes tasks within their own team and monitors progress during the shift.

An Executor (for example ground staff, security staff, cleaning staff, or maintenance staff) views assigned tasks such as boarding setup, GPU operations, de-icing, or cleaning, marks tasks as completed, and can consult their own history of work.

1.2 Non-Objectives (MVP)

The MVP does not include full AODB integration or complex resource planning such as automatic rostering. These features may be added later.

The MVP also does not implement real-time chat. Instead, important events are communicated through email notifications or other simple mechanisms.

3. State Model and Rules

The system defines a simple state model for tasks. A task can be in one of the following states: OPEN, PENDING, COMPLETED, or CLOSED. Optionally, there can be an extended state called BLOCKED to reflect operational constraints, such as a delayed aircraft at the gate.

A task transitions from OPEN to PENDING when it is assigned to a team or an executor by a manager or team lead. It moves from PENDING to COMPLETED when the executor marks it as done. It transitions from COMPLETED to CLOSED when the manager validates the work and closes the task. Optionally, a task can move between PENDING and BLOCKED when there are external constraints, such as waiting for GPU, a NOTAM, or an occupied stand.

There are additional airport-specific rules. Tasks can be linked to a flight through a flight_id and/or to a stand or gate through a stand_id. The due_date of a task can be defined relative to the ETD or ETA of a flight. For example, a “boarding setup” task can be set to start 30 minutes before ETD. The closure of critical tasks, such as “doors closed” or “GPU disconnect”, is logged in the turnaround timeline.

The system defines permissions based on user roles. The Administrator can create users, assign roles and teams, and allocate managers or leads to teams. Duty/Ops Managers can allocate managers or leads within their operational area, create tasks, assign them, mark tasks as closed, and view all tasks and histories in their area. Team Leads can create tasks within their area, assign tasks only within their own team, and view tasks and histories for their team. Executors can only view their own tasks and mark them as completed, and they can consult their own history. The Administrator has full visibility and access to all entities and data in the system.

4. Data Model (Textual ERD)

The data model describes the main entities of the system and the relationships between them. The application uses a relational PostgreSQL database to manage users, teams, flights, and operational tasks.

4.1 Main Tables

The users table stores information such as id, email, password hash, full name, role (which can be ADMIN, OPS_MANAGER, TEAM_LEAD, or EXECUTOR), team id, manager id, timestamps, and an active flag.

The teams table stores the team id, team name, domain (such as HANDLING, SECURITY, CLEANING, MAINTENANCE, or OPS), and the id of the team lead.

The flights table stores a flight id, the IATA and ICAO flight codes, the airline, origin and destination airports, the estimated time of arrival and departure, the flight status, the associated stand, the gate, and the aircraft type.

The stands table stores an id, a stand code, the terminal, and notes.

The tasks table stores an id, title, description, state, creator id, assignee id, team id, linked flight id, linked stand id, due date, due offset in minutes, priority (which can be LOW, MEDIUM, HIGH, or CRITICAL), and timestamps.

The task_history table records changes in task state. It stores an id, task id, previous state, new state, the user who changed it, the timestamp, and an optional note.

The comments table stores comments linked to a task, with an id, task id, author id, body, and timestamp.

The attachments table stores information about files attached to a task, including id, task id, file name, MIME type, storage URL or path, the user who uploaded it, and timestamp.

The sla_templates table stores id, name, domain, the trigger (ETA or ETD), an offset in minutes, a default priority, and a boolean flag indicating whether the SLA is required.

The turnaround_events table records operational turnaround events for flights. It stores an id, flight id, event code (for example ATD, ATA, GPU_ON, GPU_OFF, CLEAN_START, CLEAN_END, BOARDING_START, BOARDING_END, DOORS_CLOSED, PUSHBACK, DEICING_START, or DEICING_END), the time when the event occurred, and an optional linked task id.

The audit_logs table stores logs of important actions. It includes an id, user id, the type of entity, entity id, the action, a timestamp, and additional details.

4.2 Keys and Indexes

The system enforces unique constraints on the user email and on the stand code. It uses indexes on tasks.flight_id, tasks.state, flights.etd, and flights.status to improve query performance.

4.3 Referential Integrity

The tasks.flight_id column references the flights.id column, and when a flight is deleted, the task’s flight id is set to NULL.

The tasks.team_id column references teams.id, and when a team is deleted, the team id in tasks is set to NULL.

The tasks.assignee_id column references users.id, and when a user is deleted or deactivated, the assignee id is set to NULL.

The flights.stand_id column references stands.id, and when a stand is deleted, the stand id in flights is set to NULL.

5. Technology Stack

The architecture of the application is based on a clear separation between the frontend SPA and the backend RESTful service. The chosen technologies provide good performance, modularity, and strong support in the JavaScript ecosystem. All services run locally.

5.1 Frontend

The client application is a Single Page Application built with React and TypeScript. It uses modern tooling to improve productivity and performance. It uses Vite as the build tool and bundler, React Router for client-side routing, and either Zustand or Redux Toolkit for state management. React Query is responsible for data fetching and caching. The user interface and design system are built with Tailwind CSS in combination with the shadcn/ui component library.

5.2 Backend

The RESTful server is implemented with Node.js. It uses NestJS as the main framework (with Express as an alternative option if needed). The backend uses Prisma as the ORM and PostgreSQL as the relational database. The codebase is organized by modules such as auth, users, tasks, flights, and teams.

5.3 Authentication and Authorization

Authentication is handled through JSON Web Tokens (JWT). The system issues short-lived access tokens and longer-lived refresh tokens. Authorization follows a Role-Based Access Control (RBAC) model based on user roles and teams. The system uses refresh token rotation, rate limiting, CORS configuration, and DTO-level validation to protect the API.

5.4 Deployment and Infrastructure (Local Only)

The entire system is deployed and executed locally, without using any third-party hosting or managed database services.

The frontend runs locally through Vite. During development, it is started with a command such as pnpm dev, and the application is available on a local port (for example http://localhost:5173). A production build can be generated with pnpm build and served locally using pnpm preview or a local static file server.

The backend runs locally using NestJS. During development, it is started with pnpm start:dev, and in a simulated production environment it can be started with pnpm start:prod. The API is accessible on a local port (for example http://localhost:3000/api/v1).

PostgreSQL is installed and configured on the local machine. A local database such as planificator_local is created. Prisma migrations are executed locally through commands like pnpm prisma migrate dev.

Environment variables such as DATABASE_URL, JWT_SECRET, and VITE_API_BASE are stored in local .env files for both backend and frontend. No external hosting services like Vercel, Railway, Render, Neon, Supabase, or cloud email providers are required for the project requirements.

5.5 Observability and Monitoring

Basic logging is implemented using a fast JSON logger such as pino. Error tracking can be added as an option using a tool like Sentry, although for a strictly local environment this can remain a simple console-based logging approach. The system also exposes health check endpoints to verify the status of the API and the connectivity to external services, such as aviation data APIs, if they are used.

6. Integration with External Services

The application integrates with several external data services to keep operational data up to date and to automate notifications. These integrations are used for data only and do not provide hosting.

6.1 Flight Status

The system can integrate with APIs such as OpenSky Network, Aviationstack, or an internal airport API, if available, to periodically synchronize flight ETA, ETD, and status. These data are used to automatically compute deadlines, adjust task times when a flight is delayed or brought forward, and provide real-time operational awareness.

6.2 METAR / TAF

The application can retrieve METAR and TAF weather bulletins to reflect operational weather conditions. The weather information can act as a trigger for certain tasks such as starting or ending de-icing procedures, depending on temperature, precipitation, and other relevant parameters.

6.3 Holidays API

The system can integrate with a Holidays API to manage public holidays and non-working days. This information can help plan maintenance or cleaning activities on days with fewer or no scheduled flights.

6.4 Notifications (Email / Webhooks)

The system can send notifications via email or local webhooks to internal systems when specific events occur. For example, it can notify users when a task is assigned or updated, when an SLA is at risk of being breached, or when a flight changes gate, stand, or estimated time. Notification preferences can be configured at team or user level.

7. REST API
7.1 General Conventions

The API prefix is /api/v1. Authentication is implemented using JWT Bearer tokens. All endpoints are protected according to the RBAC rules defined for roles and teams. Responses are paginated when listing collections. Data validation is performed using DTOs in NestJS or schema libraries such as Zod or Yup. The response format is standardized as an object that contains data, meta, and error fields.

7.2 Authentication and Users

The API provides standard authentication and user management functionality, extended with attributes that are specific to the airport context, such as team id and role. There are endpoints for logging in, refreshing tokens, listing users, creating new users, editing existing users, and deactivating users. Only administrators have access to user management.

7.3 Flights

The flights module allows listing flights filtered by date, status, stand, or gate. It supports manually importing a flight or receiving a flight through a webhook. It also exposes an endpoint for retrieving detailed information about a specific flight, including its turnaround timeline. Duty/Ops users can also register events for a flight, such as GPU on or doors closed.

7.4 Stands and Gates

The stands module allows listing all stands, creating new stands, and viewing details of a single stand. All users can list and view stand details, while only administrators can create or modify stands.

7.5 SLA Templates

The SLA templates module allows listing existing SLA templates and creating new ones. Administrators manage SLA templates, while Ops managers can use them for operational planning.

7.6 Tasks

The tasks module supports creating tasks, listing tasks, assigning them, marking them as completed, and closing them. When a task is created with a reference to an SLA template, the due date is computed automatically from the ETD or ETA plus the defined offset. All users can view tasks that they are allowed to see based on their role and team. Executors can mark their own tasks as completed. Ops managers can close tasks after validation.

8. Validations and Business Rules

This section defines the business logic and consistency rules applied by the application.

8.1 Derivation and Automatic Calculations

When a task is created from an SLA template, the system automatically derives the due_date field from the flight’s ETD or ETA, depending on the template’s trigger. The general formula is:
due_date = (ETD or ETA) + offset_minutes.

8.2 Rules for Critical Tasks

Tasks with CRITICAL priority require a mandatory justification when transitioning from COMPLETED to CLOSED. The note or comment field becomes mandatory in this situation.

8.3 Allocation Restrictions

A Team Lead is only allowed to assign tasks within their own team. Any attempt to assign a task to a user outside the team is rejected by the API with an HTTP 403 response.

8.4 Handling Cancelled Flights

If a flight has the status CANCELLED, all non-critical tasks associated with that flight can be automatically marked as CLOSED with a predefined reason such as “Flight cancelled”. Critical tasks remain active and must be reviewed manually.

8.5 SLA Monitoring and Alerts

The system periodically checks task deadlines and raises alerts when the current time is greater than the due date minus ten minutes and the task is not yet in the COMPLETED state. These alerts are visible in the operational dashboard and can generate email or other notifications to the responsible team.

9. Frontend – Architecture and Screens

The user interface is built as a Single Page Application with client-side routing and modular reusable components. The architecture focuses on efficiency, visual clarity, and ease of use for airport staff.

9.1 Main Routes

The /dashboard route displays key performance indicators, such as On-Time Performance (OTP), flights in the next three hours, and active SLA alerts.

The /flights route lists active flights, their live status, assigned stand or gate, and their turnaround timeline.

The /tasks route lists tasks and allows filtering by team, flight, stand, priority, and state.

The /tasks/new route provides a form for creating a new task based on a predefined SLA template.

The /tasks/:id route shows the details of a specific task, including its history, attachments, and links to the associated flight or stand.

The /stands route allows the administrator to manage stands and gates.

The /users route allows the administrator to manage users and teams.

9.2 Main Components

The frontend is structured into independent React components that are easy to test and reuse.

A FlightCard component displays essential flight data such as time, airline, status, and stand.

A TurnaroundTimeline component visualizes the sequence of turnaround events such as GPU, cleaning, boarding, and pushback.

An SlaBadge component displays the time remaining until an SLA expires or shows if it has been breached.

A StandPicker component allows users to select stands and available gates.

A TeamFilter component filters tasks by the current team.

An AlertBanner component informs users about delays, SLA alerts, or cancelled flights.

10. Security and Compliance

Security is a central pillar of the application architecture. All components, including authentication, API, database, and UI, are configured to prevent unauthorized access, exposure of sensitive data, and common web attacks.

10.1 Authentication and Session Management

Passwords are stored as hashes using the Argon2id algorithm with appropriate time and memory cost parameters. The system uses two types of tokens: an access token with a short validity of around fifteen minutes, and a refresh token with a longer validity of about seven days that is rotated at each use. Tokens are invalidated automatically when a password is reset or an account is deactivated.

10.2 API Protection

CORS is configured strictly to allow only the local frontend origin. Rate limiting is applied, for example allowing a maximum number of requests per minute per IP. Security middleware such as Helmet is used to set safe HTTP headers.

10.3 Data Validation and Filtering

All incoming data is validated using DTOs or schema libraries such as Zod. All textual inputs are sanitized to protect against XSS attacks. Because the API is stateless and uses tokens, CSRF protection is not required in the same way as for cookie-based sessions.

10.4 Audit and Compliance

Critical actions, such as task allocation, task closure, or role changes, are recorded in audit logs. These logs include the user, the affected entity, the action performed, the timestamp, and additional details. The system follows the principle of data minimization and enforces role-based authorization.

11. Testing

The testing process ensures reliability, stability, and compliance with the technical specifications. It uses a layered approach that includes unit tests, integration tests, and end-to-end tests, with measurable coverage and as much automation as is feasible in a local environment.

11.1 Unit Tests

Unit tests focus on business logic, validation, and RBAC mechanisms. Frameworks such as Jest or Vitest are used for fast execution and for generating coverage reports.

11.2 Integration Tests

Integration tests exercise REST routes in a controlled NestJS or Express environment using Supertest. These tests run against a temporary PostgreSQL database, which can be started in a local Docker container or reset through commands such as prisma migrate reset followed by seeding. The goal is to verify the interactions between modules and full API responses.
11.4 Coverage and Targets

The minimum coverage target for the backend is 70%. For the frontend, smoke tests are implemented to ensure that critical pages load and basic flows work. Test results are integrated into a local CI-like flow where lint, test, and build commands are executed before delivery.

12. Local Setup and Running

The application is split into two main modules: the backend (NestJS and PostgreSQL) and the frontend (React and Vite).

Local configuration requires defining environment variables such as DATABASE_URL, JWT_SECRET, and VITE_API_BASE, installing dependencies, and running Prisma migrations.

The backend server is started in development mode with pnpm start:dev. The frontend is started with pnpm dev. The system includes a seed script to generate initial data for users, teams, and demo tasks.

13. Deployment (Local Only)

The entire system is deployed locally.

The database runs as a local PostgreSQL instance (for example version 14 or 15).

The API runs locally from the NestJS project, started with commands such as pnpm start:dev or pnpm start:prod.

The frontend is built with Vite and served locally either through the dev server or via a local static server for the production build.

Secrets such as JWT secrets and database URLs are stored in local .env files and are not pushed to version control.

There is no deployment to external hosting such as Vercel, Railway, Render, Supabase, Neon, or similar platforms, in order to satisfy the requirement that everything runs locally.

14. CI/CD (Local Workflow)

A simple CI-like workflow is defined, even if it is executed locally. It includes linting with ESLint and Prettier checks, running unit and integration tests with caching of dependencies, building the frontend and backend, and optionally generating preview builds.

There is no automatic deployment to any remote environment. The main branch is used as the stable reference for local deployment.

15. Delivery Plan (Aligned with Course Requirements)

The implementation of the project is divided into three main stages according to the course calendar.

By 16 November 2025, the team delivers the technical documentation (this document), the project plan, initializes the Git repository or repositories, creates the initial backlog with issues and project boards, and prepares basic wireframes.

By 6 December 2025, the team delivers a functional REST API for local use, including authentication, CRUD operations for users and tasks, state transitions, and history tracking. A complete README is provided with instructions for running the project and seeding data. The local API and database are fully functional and can be tested using a Postman or Insomnia collection.

At the last seminar, the team delivers the complete application (frontend and backend) with management reports, integration with a Holidays API, and an email notification system or equivalent. A live demo is presented, and links or instructions for running the local deployment are provided.

16. Initial Backlog (MVP)

The backlog defines the minimum set of features needed to reach a viable MVP and outlines additional features planned for a later post-MVP phase.

16.1 MVP Features

The MVP includes authentication and authorization with RBAC for all defined roles. It provides full CRUD functionality for users, teams, and stands. It supports importing and synchronizing flights manually or via a mock integrator and displays a list of active flights. It offers CRUD operations for tasks associated with flights or stands, including advanced filters by team, state, and priority. It supports SLA templates and automatic calculation of task deadlines based on ETD or ETA. It implements the full task state transitions with history logging and SLA alerts. It includes an operational dashboard for OPS users, showing OTP indicators, work in progress, and active alerts. It provides PWA support for offline use, allowing field staff to view and update tasks without a permanent connection.

16.2 Post-MVP Features

The post-MVP phase can include integration with live aviation APIs such as OpenSky or Aviationstack and full METAR/TAF weather support. It can implement a richer turnaround timeline view and advanced operational reports. It can offer webhooks to internal systems such as AODB, PA systems, or FIDS, where available. It can add data export functionality to formats such as CSV or Excel, tagging of tasks, and attachment storage on a local file system or, if allowed, an S3-compatible service.

17. Proposed Directory Structure (Mono-Repo)

The project can be organized as a mono-repo with a root folder containing the applications and shared packages. The /apps/api folder contains the NestJS backend with a src folder organized by modules such as auth, users, tasks, comments, and reports, as well as a common folder for guards, pipes, and filters, and an infra folder for Prisma and mailer integrations. The prisma/schema.prisma file defines the database schema.

The /apps/web folder contains the React + Vite frontend with a src folder split into app (routes), components, features (such as tasks, users, and reports), and lib (for API clients and hooks).

The /packages folder can contain shared configurations such as ESLint configs or TypeScript configs. A .github/workflows folder can define CI workflows, even if they are not used for external deployment.

18. Example Prisma Models (Fragment)

The Prisma schema defines enums for roles, task states, and priorities. It defines models for Team, Flight, Stand, Task, TurnaroundEvent, and others, with appropriate relations and default values. Teams have a name, domain, an optional lead, and members. Flights include optional IATA and ICAO codes, airline, origin, destination, ETA, ETD, status, stand, gate, aircraft type, and related tasks and events. Stands have a unique code, optional terminal and notes, and related flights and tasks. Tasks have a title, description, state, priority, due date, offsets, creator, optional assignee, optional team, optional flight and stand, history, comments, and timestamps. Turnaround events are linked to a flight and optionally to a task, and they store an event code and the time it occurred.

19. Wireframes

The dashboard wireframe contains four cards showing counts of tasks in OPEN, PENDING, COMPLETED, and CLOSED states, a “My tasks today” list, and a bar chart of tasks by priority.

The tasks list wireframe shows a table with columns such as title, assignee, state, priority, due date, and actions, as well as filters at the top.

The task details wireframe displays a header with a state badge and actions, and tabs for details, history, and comments.

The users (Admin) wireframe shows a list of users, an add/edit dialog, and a manager selector for executors.

20. Metrics and Reports

The system can compute and display several metrics and reports. It can provide On-Time Performance (OTP) per day or per airline. It can show average turnaround time and the deviation from planned values. It can measure SLA adherence as the percentage of critical tasks completed on time. It can display work in progress per team and the average time spent in each state. Finally, it can show the most frequent causes of the BLOCKED state if that extended state is enabled.

21. Risks and Mitigations

One risk is the accuracy of flight data. The system mitigates this by using caching, manual reconciliation, and a fallback to manual input entered by OPS staff. Another risk is connectivity for staff working on the apron or in other challenging areas; this is mitigated by implementing PWA features and offline caching for the last two hours of flights and tasks. Operational safety risks are mitigated through strict permissions and an audit trail for critical changes.

22. License and Compliance

The project uses the MIT license for its own code. It respects the licenses of all dependencies and external libraries.

23. User Documentation

A short user guide is provided in the README file, including GIFs or screenshots that illustrate login, task creation and assignment, task completion and closure, filtering, and history viewing.

24. Next Steps

The next steps include preparing a ready-to-run NestJS + Prisma + Auth template for the backend, and a React + Vite + Tailwind + shadcn/ui + React Query template for the frontend, covering the tasks list, task details, users (admin), and dashboard screens. The project will also include an Insomnia or Postman collection for API testing, as well as seed scripts and npm/pnpm scripts to automate setup and data seeding.
11.3 End-to-End (E2E) Tests

End-to-end tests are implemented with Playwright and run against a local preview build of the application. The scenarios verify critical flows such as login, creating and assigning tasks, viewing flights, closing tasks, and generating SLA alerts.
