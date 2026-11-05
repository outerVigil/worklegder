# Financial Workflow & Ledger Integrity

## 1. Core Financial Formula

```
Available Balance = Total Approved Allocations - Approved Withdrawals - Pending Withdrawal Requests
```

## 2. Fund Reservation Engine

1. **Working Capital Allocation (Admin Action)**:
   - Admin allocates funds to an employee profile (`POST /admin/allocations`).
   - Creates a transaction: `ALLOCATION_CREDIT`.
   - Increases `Total Allocated` and `Available Balance`.

2. **Daily Entry Submission (Employee Action)**:
   - Employee enters work details, amount, and withdrawal request (`POST /employee/entries`).
   - **Pre-check**: The system verifies that `withdrawalAmount <= Available Balance`.
   - Entry status set to `PENDING`.
   - The ledger creates a `PENDING_RESERVATION` record.
   - The requested amount is immediately withheld from `Available Balance`, preventing overdrawing and race conditions.

3. **Entry Cancellation (Employee Action)**:
   - If the entry is still `PENDING`, employee can cancel it (`POST /employee/entries/:id/cancel`).
   - Status changes to `CANCELLED`.
   - Ledger creates a `RESERVATION_RELEASED` transaction.
   - Withheld amount returns to `Available Balance`.

4. **Entry Approval (Admin Action via Web App)**:
   - Admin reviews UPI screenshot and details (`POST /admin/entries/:id/approve`).
   - Status changes to `APPROVED`.
   - Ledger records `WITHDRAWAL_APPROVED` and marks deduction as `SETTLED`.
   - Increases `Approved Withdrawals`, decreases `Pending Withdrawal Requests`.
   - `Available Balance` remains consistent.

5. **Entry Rejection (Admin Action via Web App)**:
   - Admin enters rejection reason (`POST /admin/entries/:id/reject`).
   - Status changes to `REJECTED`.
   - Ledger creates `RESERVATION_RELEASED`.
   - Withheld amount is unreserved and returns to `Available Balance`.
