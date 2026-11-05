import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'WorkLedger Centralized API is healthy',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Mock/Live Route Handlers for Employee & Shared API
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Identifier and password are required']
    });
  }

  const isSarah = identifier.toLowerCase().includes('sarah') || identifier.includes('102');
  const user = {
    id: isSarah ? 'emp-usr-102' : 'emp-usr-101',
    employeeId: isSarah ? 'EMP-1083' : 'EMP-1082',
    name: isSarah ? 'Sarah Connor' : 'John Doe',
    email: identifier.includes('@') ? identifier : `${identifier}@company.com`,
    role: 'EMPLOYEE',
    phone: isSarah ? '+1 (555) 345-6789' : '+1 (555) 234-5678',
    assignedSubAdmin: isSarah ? 'Admin David Miller' : 'Admin Sarah Jenkins',
    status: 'ACTIVE'
  };

  return res.json({
    success: true,
    message: 'Operation successful',
    data: {
      accessToken: `jwt_access_token_${Date.now()}`,
      refreshToken: `jwt_refresh_token_${Date.now()}`,
      user
    }
  });
});

app.get('/api/v1/auth/me', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Operation successful',
    data: {
      id: 'emp-usr-101',
      employeeId: 'EMP-1082',
      name: 'John Doe',
      email: 'emp101@company.com',
      role: 'EMPLOYEE',
      phone: '+1 (555) 234-5678',
      assignedSubAdmin: 'Admin Sarah Jenkins',
      status: 'ACTIVE'
    }
  });
});

// Employee Attendance
app.post('/api/v1/employee/attendance/check-in', (req: Request, res: Response) => {
  const { latitude, longitude, accuracy, deviceTimestamp } = req.body;
  const officialTimestamp = new Date().toISOString();

  return res.status(201).json({
    success: true,
    message: 'Attendance check-in recorded successfully',
    data: {
      id: `att-${Date.now()}`,
      employeeId: 'EMP-1082',
      checkInTime: officialTimestamp,
      checkInLatitude: latitude,
      checkInLongitude: longitude,
      checkInAccuracy: accuracy,
      status: 'ACTIVE'
    }
  });
});

app.post('/api/v1/employee/attendance/check-out', (req: Request, res: Response) => {
  const { latitude, longitude, accuracy, remarks } = req.body;
  const officialTimestamp = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Attendance check-out recorded successfully',
    data: {
      id: `att-${Date.now()}`,
      employeeId: 'EMP-1082',
      checkOutTime: officialTimestamp,
      checkOutLatitude: latitude,
      checkOutLongitude: longitude,
      checkOutAccuracy: accuracy,
      durationMinutes: 485,
      status: 'COMPLETED',
      remarks
    }
  });
});

// Daily Work Entries
app.post('/api/v1/employee/entries', (req: Request, res: Response) => {
  const { websiteUrl, bankAccountNumber, referenceId, amount, withdrawalAmount, screenshotDataUrl } = req.body;
  
  if (!websiteUrl || !bankAccountNumber || !referenceId || !amount || withdrawalAmount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['All 6 fields are mandatory']
    });
  }

  const maskedBank = '•••• •••• ' + (bankAccountNumber.slice(-4) || '0000');
  const officialTimestamp = new Date().toISOString();

  return res.status(201).json({
    success: true,
    message: 'Daily entry submitted and funds reserved in ledger',
    data: {
      id: `entry-${Date.now()}`,
      employeeId: 'EMP-1082',
      websiteUrl,
      bankAccountNumberMasked: maskedBank,
      referenceId,
      amount: Number(amount),
      withdrawalAmount: Number(withdrawalAmount),
      screenshotUrl: screenshotDataUrl || '',
      status: 'PENDING',
      createdAt: officialTimestamp
    }
  });
});

// Financial Ledger Balance & Summary
app.get('/api/v1/employee/finance/balance', (_req: Request, res: Response) => {
  const allocated = 12500.0;
  const approved = 5200.0;
  const pending = 850.0;
  const available = allocated - approved - pending;

  return res.json({
    success: true,
    message: 'Operation successful',
    data: {
      totalAllocated: allocated,
      approvedWithdrawals: approved,
      pendingWithdrawals: pending,
      availableBalance: available
    }
  });
});

// Centralized Error Handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    errors: [err.message]
  });
});
