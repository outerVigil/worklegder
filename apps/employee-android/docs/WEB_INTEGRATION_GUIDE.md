# Web Admin Integration Guide (Phase 2 React Application)

This guide provides everything the Phase 2 Web Admin engineering team needs to connect a React web dashboard to the shared Node.js/PostgreSQL backend established in Phase 1.

---

## 1. API Base URL & Configuration

| Environment | Base URL |
|---|---|
| Local Development | `http://localhost:3000/api/v1` |
| Staging Environment | `https://staging-api.workledger.internal/api/v1` |
| Production Environment | `https://api.workledger.internal/api/v1` |

---

## 2. Authentication & Token Handling

- **Authentication Method**: JWT with Access Tokens (short-lived, 15m) and Refresh Tokens (long-lived, 7d).
- **Header**: Send `Authorization: Bearer <accessToken>` with every authenticated HTTP request.
- **Refresh Flow**: Intercept 401 Unauthorized responses in Axios/Fetch and call `POST /api/v1/auth/refresh` with `{ refreshToken }` to rotate credentials without forcing user re-login.

### Login Request Example:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "admin.sarah@company.com",
  "password": "SecureAdminPassword123!"
}
```

### Login Response Example:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d82f7180-2a01-4475-9273-fae4125a09b4",
    "user": {
      "id": "usr-admin-01",
      "employeeId": "ADM-001",
      "name": "Sarah Jenkins",
      "email": "admin.sarah@company.com",
      "role": "SUB_ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

---

## 3. Role-Based Access Control (RBAC)

The backend enforces three distinct roles:
1. `SUPER_ADMIN`:
   - Full access to create Sub-Admins, assign employees, view cross-organization audit logs, and configure company working capital.
2. `SUB_ADMIN`:
   - Access to view assigned employees, review daily work entries, approve/reject withdrawal requests, and allocate per-employee capital.
3. `EMPLOYEE`:
   - Restricted to employee mobile app endpoints (`/employee/*`). Cannot approve/reject or access admin dashboard routes.

---

## 4. Administrative Endpoints for Web Dashboard

### A. Sub-Admin Dashboard & Employee Management
- `GET /api/v1/admin/dashboard`: Overall stats (total employees active today, pending approval count, allocated balance).
- `GET /api/v1/admin/employees`: List of assigned employees with current shift status and running balance.
- `GET /api/v1/admin/attendance`: Real-time and historical attendance records with GPS coordinates.

### B. Daily Entry & Financial Approvals
- `GET /api/v1/admin/entries`: Query entries filtered by status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
- `POST /api/v1/admin/entries/:id/approve`: Approve entry and finalize ledger deduction.
- `POST /api/v1/admin/entries/:id/reject`: Reject entry, specify `rejectionReason`, and release withheld reservation.
- `POST /api/v1/admin/allocations`: Grant new working capital allocation to an employee.
- `GET /api/v1/admin/finance/:employeeId`: Full transaction ledger history for a specific employee.

### C. Super Admin Management
- `POST /api/v1/super-admin/sub-admins`: Create and onboard new sub-admins.
- `POST /api/v1/super-admin/assignments`: Map employees to managing sub-admins.

---

## 5. File Upload Flow (S3-Compatible Object Storage)

1. Client requests a signed presigned upload URL:
   `POST /api/v1/employee/uploads/presign`
   Body: `{ "fileName": "upi_screenshot_01.png", "mimeType": "image/png", "fileSize": 2048500 }`
2. Backend generates an encrypted private S3 PUT presigned URL valid for 10 minutes.
3. Client uploads binary directly to S3 via standard HTTP PUT.
4. When viewing screenshots in the admin dashboard, the web app calls `GET /api/v1/admin/entries/:id` which returns a signed time-limited GET URL. Raw buckets are never publicly accessible.

---

## 6. Financial Approval Workflow

```
[Employee submits entry] 
         │
         ▼
[Funds Reserved in Ledger (Pending)]
         │
         ├─── Admin Approves (POST /admin/entries/:id/approve)
         │           │
         │           ▼
         │    [Status -> APPROVED]
         │    [Ledger -> WITHDRAWAL_APPROVED (Settled)]
         │
         └─── Admin Rejects (POST /admin/entries/:id/reject)
                     │
                     ▼
              [Status -> REJECTED]
              [Ledger -> RESERVATION_RELEASED]
              [Funds restored to Employee Available Balance]
```

---

## 7. Example Web Admin Approval Request

```http
POST /api/v1/admin/entries/entry-84920/approve
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "adminRemarks": "Verified against gateway transaction id TXN-9941. Approved."
}
```

Response:
```json
{
  "success": true,
  "message": "Entry approved and financial ledger settled",
  "data": {
    "entryId": "entry-84920",
    "status": "APPROVED",
    "reviewedAt": "2026-11-03T10:15:00Z"
  }
}
```
