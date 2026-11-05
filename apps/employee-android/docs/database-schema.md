# WorkLedger Database Schema (PostgreSQL & Prisma)

The database schema utilizes UUID primary keys, strict foreign key constraints, high-precision decimals (`DECIMAL(12, 2)`) for monetary balances, and encrypted columns for sensitive bank accounts.

## Tables Summary

1. `users`: System credentials, bcrypt/Argon2 password hash, role enum, active flag.
2. `roles`: Role definitions (`SUPER_ADMIN`, `SUB_ADMIN`, `EMPLOYEE`).
3. `permissions`: Granular actions (`entries:approve`, `finance:allocate`, etc.).
4. `role_permissions`: Many-to-many junction between roles and permissions.
5. `employee_profiles`: Personnel profiles, unique employee ID string (e.g. `EMP-1082`).
6. `admin_assignments`: Maps employees to assigned managing Sub-Admins.
7. `attendance`: Check-in & check-out timestamps, latitude, longitude, accuracy radius, shift duration.
8. `employee_entries`: Daily task submissions, website URLs, masked bank details, encrypted bank account, amounts, approval status.
9. `entry_revisions`: Audit history of entry modifications.
10. `entry_files`: Metadata for UPI payment screenshots stored in S3/private storage.
11. `allocations`: Approved working capital allocated to employees by administrators.
12. `financial_transactions`: Immutable financial ledger transactions (credits, debits, reservations, releases).
13. `alerts`: System notifications and discrepancy signals.
14. `notifications`: In-app employee messages.
15. `refresh_tokens`: Rotatable refresh tokens with SHA-256 hash.
16. `audit_logs`: Detailed operational logging for security and compliance.
17. `employee_activity`: High-level timeline of employee interactions.
