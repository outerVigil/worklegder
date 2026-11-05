# WorkLedger Architecture Document

## 1. System Overview

WorkLedger is a modular employee management, attendance verification, and centralized financial tracking system. 
This repository contains:
1. **Employee Android Application**: Native Android app built with Jetpack Compose, Retrofit, Room DB, FusedLocationProviderClient, and Material 3 design.
2. **Shared Backend Foundation**: Centralized REST API built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL. It serves both the mobile client and the upcoming Web Admin Application.

```
+------------------------------------+       +------------------------------------+
|  Part 1: Employee Android App     |       |  Part 2: React Web Admin App       |
|  (Jetpack Compose, Room, GPS)      |       |  (Upcoming Phase 2 Web Dashboard)  |
+-----------------+------------------+       +-----------------+------------------+
                  |                                            |
                  | HTTPS REST API (JWT Bearer)               | HTTPS REST API
                  +---------------------+----------------------+
                                        |
                         +--------------v--------------+
                         |  Shared Express.js Backend  |
                         |  (Modular Monolith, RBAC)   |
                         +--------------+--------------+
                                        |
               +------------------------+------------------------+
               |                                                 |
+--------------v---------------+                 +---------------v---------------+
|  PostgreSQL Database (Prisma)|                 | S3-Compatible Object Storage  |
|  - Users & Roles (RBAC)      |                 | - Encrypted UPI Screenshots   |
|  - Centralized Ledger        |                 | - Signed Presigned URLs       |
|  - GPS Attendance Records    |                 +-------------------------------+
+------------------------------+
```

## 2. Key Architecture Principles

1. **Centralized Financial Ledger**:
   - Double-entry row-level transactions.
   - Atomic balance updates using PostgreSQL transactions (`BEGIN...COMMIT`).
   - Reserve funds on entry submission, release on cancellation/rejection, settle permanently upon admin approval.
2. **Foreground GPS Gate**:
   - Location is captured only during check-in and check-out actions.
   - Official check-in/out timestamps are issued by the backend server.
   - Precision validation gate ensures accuracy is acceptable before accepting shift verification.
3. **Dual-Mode Android Client**:
   - Fully operational against the remote Node backend.
   - Built-in SQLite/Room offline persistence ensuring the Android APK functions seamlessly during standalone testing and offline network states.
