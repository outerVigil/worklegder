# WorkLedger API Specification

All API endpoints follow the consistent JSON envelope format:

### Success Envelope
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Envelope
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Field 'referenceId' is mandatory"]
}
```

## Endpoints Summary

### Authentication
- `POST /api/v1/auth/login`: Authenticate employee or admin credentials, return JWT access & refresh tokens.
- `POST /api/v1/auth/refresh`: Rotate refresh token and issue new access token.
- `POST /api/v1/auth/logout`: Revoke active refresh token.
- `GET /api/v1/auth/me`: Get authenticated user profile and permissions.

### Employee Operations
- `GET /api/v1/employee/dashboard`: Live stats, attendance status, available balance, recent activity.
- `GET /api/v1/employee/profile`: Employee profile details and assigned manager.
- `GET /api/v1/employee/attendance/history`: Historical shift logs with GPS coordinates.
- `POST /api/v1/employee/attendance/check-in`: Record foreground GPS fix and issue official start timestamp.
- `POST /api/v1/employee/attendance/check-out`: Complete shift, record GPS fix, compute duration in minutes.
- `POST /api/v1/employee/entries`: Submit daily entry (website, bank, ref, amount, screenshot, withdrawal).
- `GET /api/v1/employee/entries`: List submitted entries with status filter.
- `GET /api/v1/employee/entries/:id`: Retrieve single entry details.
- `POST /api/v1/employee/entries/:id/cancel`: Cancel pending entry and release reserved funds.
- `GET /api/v1/employee/finance/balance`: Query allocated, approved, pending, and available balance.
- `GET /api/v1/employee/finance/history`: Complete chronological financial transaction stream.
