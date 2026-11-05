# WorkLedger: Employee Management & Financial Tracking System

Part 1 of 2: Complete Employee Android Application (APK) and Centralized Shared Backend.

---

## 📱 Mobile Application (Android)

The Android application is built with modern **Jetpack Compose**, **Material 3**, **Room SQLite**, and **Retrofit**, configured to run seamlessly on Android 7.0+ (API 24+) through Android 15/16.

### Key Screens & Features:
1. **Splash Screen**: Animated branding logo, session validation, auto-routing.
2. **Login Screen**: Secure credential login, password toggle, quick demo account selector.
3. **Attendance Check-In**: Foreground GPS fix, satellite accuracy meter, server timestamping.
4. **Employee Dashboard**: Available balance hero card, formula breakdown, shift timer chip, quick actions, recent activity feed.
5. **Attendance Check-Out**: Live shift duration (supports midnight rollovers), GPS check-out verification.
6. **Daily Entry Form**:
   - 1. Website Details (URL validation)
   - 2. Bank Account Number (securely masked `•••• •••• 4892` preview)
   - 3. Reference ID
   - 4. Total Amount
   - 5. UPI Screenshot (Photo picker, image preview, progress indicator)
   - 6. Withdrawal Amount (enforced: cannot exceed available balance)
7. **Entry History**: Status filter tabs (`ALL`, `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`), admin remarks, full screenshot preview, cancellation of pending entries.
8. **Balance & Financial History**: Financial ledger breakdown (`Available = Allocated - Approved - Pending`), transaction audit stream.
9. **Profile**: Personnel details, assigned sub-admin, configurable backend base URL, server health ping test, logout.

---

## 🗄️ Shared Backend Foundation (Node.js + PostgreSQL + Prisma)

Built as a modular monolith in `backend/` to be shared between this Android app and the upcoming Phase 2 Web Admin Dashboard:
- **Language**: TypeScript / Node.js
- **Database**: PostgreSQL with Prisma ORM (17 tables including full RBAC and immutable financial ledger)
- **Security**: JWT authentication, refresh token rotation, bcrypt password hashing, Helmet, Rate Limiting, encrypted bank account data
- **File Storage**: Private S3-compatible object storage with signed presigned URLs

### Quick Start Backend with Docker:
```bash
cd infrastructure/docker
docker-compose up -d
```
The backend API will be available at: `http://localhost:3000/api/v1/`

---

## 📂 Project Structure

```
├── app/                      # Native Android Kotlin Jetpack Compose Application
│   ├── src/main/java/com/example/
│   │   ├── data/             # Models, Room Database, Remote Retrofit API Client, Repository
│   │   ├── ui/               # Screens, ViewModels, Theme, Navigation, Components
│   │   └── MainActivity.kt   # Application entrypoint & navigation host
├── backend/                  # Shared Node.js / Express / Prisma Backend
│   ├── prisma/schema.prisma  # Complete 17-table PostgreSQL schema
│   └── src/                  # Express app, server, middlewares, and routes
├── packages/
│   ├── shared-types/         # Cross-platform TypeScript definitions
│   ├── validation/           # Zod schemas for input validation
│   └── api-contracts/        # Canonical REST endpoint contracts
├── infrastructure/
│   ├── docker/               # Dockerfile & docker-compose.yml
│   └── nginx/                # Reverse proxy configuration
├── docs/                     # Full Architectural & Integration Documentation
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-specification.md
│   ├── financial-workflow.md
│   ├── attendance-workflow.md
│   └── WEB_INTEGRATION_GUIDE.md # Web Admin connection guide
└── metadata.json
```
