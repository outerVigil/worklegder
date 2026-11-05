WorkLedger Platform
WorkLedger is an employee management platform with attendance tracking,
internal finance workflows, and role-based administration. It is
designed around a shared backend API used by an Android employee
application and a web-based administration dashboard.
Project status: The backend foundation and initial database schema
have been created. Authentication is currently being implemented. Some
technologies and capabilities listed below are part of the planned
architecture and should not be considered production-complete until
their modules are implemented and tested.

Table of Contents
- Overview
- Applications
- Technology Stack
- Architecture
- Core Features
- User Roles
- Backend Structure
- Database Design
- API Conventions
- Security
- Local Development
- Environment Variables
- Development Roadmap
Overview
WorkLedger brings employee operations into one platform:
- Employee attendance check-in and check-out.
- Employee profiles and employment information.
- Shift management and employee shift assignments.
- Attendance correction requests and administrative review.
- Internal finance requests, approvals, and ledger records.
- Notifications and audit logging.
- Role-based access for employees, sub-admins, and super admins.
The finance module is an internal ledger and approval workflow. It
does not initiate bank transfers or move money through banking networks.

Attendance location is intended to be collected only during foreground
check-in and check-out actions. The application is not designed for
continuous background location tracking.
Applications
  Application             Purpose                 Technology
  Employee mobile app     Employee-facing         Kotlin, Android,
attendance, profile,    Jetpack Compose
requests, and finance
views                   

  Admin web app           Administrative          React, TypeScript, Vite
dashboard and
management workflows    

  Backend API             Shared business logic,  Node.js, Express,
authentication,         TypeScript
authorization, and data
access                  
Database                Persistent relational   PostgreSQL, Prisma ORM
data
Both client applications communicate with the same backend API.
Technology Stack
Employee Android application
  Technology        Usage
  Kotlin            Primary application language
Android           Mobile application platform
Jetpack Compose   Declarative UI toolkit
Material 3        Android UI design system
Room              Local persistence
Retrofit          HTTP API communication

The Android application uses Kotlin data models and Retrofit contracts.
It does not directly import the TypeScript packages used by the web and
backend projects.
Admin web application
  Technology     Usage
  React 19       Component-based user interface
TypeScript     Static typing
Vite           Development server and build tooling
React Router   Client-side routing
Axios          HTTP requests to the backend
Tailwind CSS   Utility-first styling
Backend
  Technology      Usage
  Node.js         JavaScript runtime
Express 5       HTTP server and API routing
TypeScript      Backend application language
Prisma ORM 6    Database access and schema management
Zod             Request and environment validation
bcrypt          Password hashing
jsonwebtoken    JWT creation and verification
Helmet          HTTP security headers
CORS            Cross-origin request configuration
cookie-parser   Reading HTTP cookies
dotenv          Loading environment variables
tsx             TypeScript development execution
Database and data layer
  Technology       Usage
  PostgreSQL       Primary relational database
Prisma Client    Type-safe database queries
Prisma Migrate   Database schema migrations
Prisma Studio    Database inspection and development

The schema uses UUID identifiers, PostgreSQL date/time fields, decimal
types for monetary values, and indexes for commonly queried
relationships and records.


Development and infrastructure
  Tool / technology             Intended usage
  Git                           Source control
npm                           Backend package management and scripts
# optional for scaling the app
Docker                        Containerization
Kubernetes (k3s-compatible)   Container orchestration
GitHub Actions                CI/CD automation
Argo CD                       GitOps-based deployment

Docker, Kubernetes, GitHub Actions, and Argo CD are planned
infrastructure components; mark them as implemented only after their
configuration and workflows are added to the repository.
Architecture
                 +-------------------------+
                 |      Employee App       |
                 | Kotlin / Jetpack Compose|
                 +------------+------------+
                              |
                              | HTTPS / JSON
                              |
                 +------------v------------+
                 |       Backend API       |
                 |   Node.js / Express     |
                 |       TypeScript        |
                 +------------+------------+
                              |
                              | Prisma ORM
                              |
                 +------------v------------+
                 |       PostgreSQL        |
                 +-------------------------+
                              ^
                              |
                 +------------+------------+
                 |       Admin Web         |
                 | React / TypeScript      |
                 |       Vite              |
                 +-------------------------+
The diagram represents the logical application architecture. Both
clients call the same backend; neither client connects directly to
PostgreSQL.
Core Features
Employee management
- Employee identity and profile records.
- Employee codes.
- Department and designation information.
- Employment status.
- Assignment of employees to sub-admins.
Attendance
- Check-in and check-out sessions.
- Check-in and check-out timestamps.
- Optional GPS coordinates and location accuracy captured at the
  attendance action.
- Shift definitions and employee shift assignments.
- Attendance correction requests.
- Review and approval status for adjustments.
Internal finance
- Employee finance accounts.
- Finance requests such as expenses, reimbursements, advances, and
  other requests.
- Approval or rejection by authorized administrators.
- Ledger transactions and ledger entries.
- Decimal-based monetary storage to avoid floating-point currency
  calculations.
- Transaction reversal status.
The ledger is intended to enforce balanced double-entry accounting in
its service layer before transactions can be posted. That enforcement
must be implemented and tested before the ledger is used for operational
financial records.
Notifications and audit
- User notifications with read/unread status.
- Audit records for actions, entities, actors, and timestamps.
- Optional request metadata such as IP address and user agent.
User Roles
  Role                                Responsibility
  SUPER_ADMIN                       Platform-wide administration and
configuration

  SUB_ADMIN                         Management of assigned employees
and permitted review workflows
EMPLOYEE                          Personal profile, attendance, and
finance requests
Authorization is enforced by the backend. Hiding a page or button in a
client is not a substitute for server-side permission checks.
Backend Structure
Current backend directory layout:
apps/backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── prisma.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── validate.middleware.ts
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       ├── auth.routes.ts
│   │       ├── auth.service.ts
│   │       └── auth.validation.ts
│   ├── routes/
│   │   └── index.ts
│   ├── types/
│   │   └── express.d.ts
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
This is the current foundation; the structure will expand as attendance,
employee, finance, notification, and administration modules are
implemented.
Database Design
The current Prisma schema includes these principal entities:
  Model                               Purpose
  User                              Login identity, role, and account
status

  Employee                          Employee-specific information

  Shift                             Work shift definitions

  EmployeeShiftAssignment           Effective-dated employee-to-shift
assignments

  AttendanceSession                 Check-in/check-out records

  AttendanceAdjustment              Attendance correction requests and
review

  FinanceAccount                    Internal finance accounts

  FinanceRequest                    Employee-submitted finance requests

  LedgerTransaction                 Posted or reversed ledger
transaction

  LedgerEntry                       Debit and credit lines for a
transaction

  AuditLog                          Administrative and system audit
history

  Notification                      User notifications
RefreshSession                    Hashed refresh-token session
records
Important data design decisions:
- UUID primary keys are used for core records.
- Monetary fields use PostgreSQL Decimal, not JavaScript
  floating-point numbers.
- Bank details, if added, should be masked by default and revealed
  only through an authorized, audited operation.
- Foreign keys and indexes support relational integrity and common
  lookup paths.
API Conventions
- Base path: /api/v1
- Transport: HTTPS in production.
- Payload format: JSON.
- Authentication: Bearer access token.
- Identifiers: UUIDs for database entities.
- Timestamps: ISO 8601 in UTC at API boundaries.
- Monetary values: decimal strings in API payloads.
Success response convention:
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
Error response convention:
{
  "success": false,
  "message": "A description of the error",
  "errors": []
}
The initial health endpoint is:
GET /api/v1/health
The login endpoint being developed is:
POST /api/v1/auth/login
It accepts an identifier (email or employee code) and password.
Security
Security controls included in the backend foundation or planned for
completion:
- Passwords are stored as bcrypt hashes, never as plain text.
- JWT access tokens are short-lived.
- Refresh tokens are stored server-side as hashes and are intended to
  be delivered using an HttpOnly cookie.
- Authentication middleware verifies the access token and checks the
  user's active status.
- Role-based authorization is enforced in backend middleware.
- Zod validates incoming request data and environment configuration.
- Helmet adds HTTP security headers.
- CORS is configured for approved client origins.
- Secrets are loaded from environment variables and must not be
  committed to Git.
- Login rate limiting, refresh-token rotation and reuse detection, and
  CSRF/origin protections must be completed before production
  deployment.
Local Development
Prerequisites
Install the following tools:
- Node.js and npm.
- PostgreSQL.
- Git.
- Android Studio for the employee Android app.
- A code editor such as Visual Studio Code.
Backend setup
Open a terminal in apps/backend:
cd apps/backend
npm install
Create a .env file based on .env.example and configure the database
connection and required secrets.

Generate the Prisma Client:
npm run db:generate
Apply database migrations:
npm run db:migrate
Start the backend development server:
npm run dev
Run TypeScript checks:
npm run typecheck
Build the backend:
npm run build
Start the compiled backend:
npm start
Open Prisma Studio:
npm run db:studio
Local API URLs
With the default local configuration:
- API root: http://localhost:5000/
- Health check: http://localhost:5000/api/v1/health
- Login: POST http://localhost:5000/api/v1/auth/login
The employee Android app and admin web app should be configured to use
the backend URL reachable from their respective runtime environments. An
Android emulator generally cannot use localhost to reach the host
computer; configure the appropriate host-machine address for the
emulator.
Environment Variables
The backend validates its core environment configuration at startup. The
.env file should remain local and must not be committed.

Example variable names:
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/workledger
JWT_ACCESS_SECRET=replace_with_a_long_random_secret_at_least_32_characters
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret_at_least_32_characters
A one-time Super Admin seed script may additionally use
SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD if
that script is present in the project. Remove temporary bootstrap
credentials from the environment after the initial account is created.
Never publish real credentials in documentation or source control.
Development Roadmap
The following work remains part of the planned implementation:
1. Complete authentication: refresh, logout, current-user endpoint,
   token rotation, and security protections.
2. Add employee and user administration APIs.
3. Implement attendance check-in/check-out, shift rules, history, and
   adjustment reviews.
4. Implement finance requests, approvals, and balanced ledger
   posting/reversal.
5. Add notifications and audit workflows.
6. Connect the admin web application to the API.
7. Connect the Android employee application to the API.
8. Add automated tests, CI/CD, Docker images, and deployment
   infrastructure.
9. Perform security, integration, and end-to-end testing before
   production use.
WorkLedger --- one platform for employee operations, attendance, and
internal finance workflows.