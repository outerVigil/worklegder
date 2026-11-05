# Attendance & Foreground GPS Workflow

## 1. Foreground Location Policy

WorkLedger captures device GPS strictly on-demand during explicit employee attendance interactions:
- Check-In Button Press
- Check-Out Button Press

**Continuous background location tracking is strictly forbidden and never implemented.**

## 2. Check-In Lifecycle

1. **Permission Request**: Runtime Android permission check for `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`.
2. **Satellite Fix & Accuracy Gate**:
   - Device fetches high-accuracy location via `FusedLocationProviderClient`.
   - The accuracy meter assesses signal quality (e.g. ±8m is considered high accuracy).
   - If accuracy is within the threshold (<= 35m), coordinates pass the discrepancy gate.
3. **Server Timestamping**:
   - Payload containing `latitude`, `longitude`, `accuracy`, and `deviceTimestamp` is sent to `POST /api/v1/employee/attendance/check-in`.
   - The backend records the server's official UTC timestamp to prevent device clock tampering.
   - An active attendance session record is created in PostgreSQL.
4. **Active Shift Tracking**:
   - The application starts a local elapsed shift timer.
   - Work dashboard enables daily entry submission.

## 3. Check-Out Lifecycle & Midnight Rollover

1. **Verification**: Employee navigates to Check-Out (`POST /api/v1/employee/attendance/check-out`).
2. **Current Location Fix**: Captures current latitude, longitude, and accuracy radius.
3. **Duration Calculation**:
   - Duration is calculated in minutes from server `checkInTime` to server `checkOutTime`.
   - Automatically supports shifts crossing midnight into the next day without truncation or errors.
4. **Session Finalization**:
   - Status transitions from `ACTIVE` to `COMPLETED`.
   - Total hours and minutes are logged in the attendance history.
