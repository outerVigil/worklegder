import { EntrySubmission } from '../../types';

export function generateReceiptSvg(refId: string, amount: number, employee: string): string {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <rect width="400" height="600" fill="%23f8fafc"/>
    <rect x="20" y="20" width="360" height="560" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
    <rect x="20" y="20" width="360" height="90" rx="16" fill="%230f172a"/>
    <text x="200" y="60" font-family="Arial" font-size="16" font-weight="bold" fill="%23ffffff" text-anchor="middle">UPI TRANSFER VERIFICATION</text>
    <text x="200" y="85" font-family="Arial" font-size="12" fill="%2338bdf8" text-anchor="middle">SUCCESSFUL PAYMENT RECEIPT</text>
    
    <circle cx="200" cy="160" r="32" fill="%23ecfdf5"/>
    <path d="M188 160l8 8 16-16" stroke="%23059669" stroke-width="4" fill="none" stroke-linecap="round"/>
    
    <text x="200" y="225" font-family="Arial" font-size="28" font-weight="bold" fill="%230f172a" text-anchor="middle">₹${amount.toLocaleString()}</text>
    <text x="200" y="250" font-family="Arial" font-size="13" fill="%2364748b" text-anchor="middle">Transfer to Authorized Account</text>
    
    <line x1="50" y1="280" x2="350" y2="280" stroke="%23e2e8f0" stroke-dasharray="4"/>
    
    <text x="50" y="315" font-family="Arial" font-size="12" fill="%2364748b">Employee Name</text>
    <text x="350" y="315" font-family="Arial" font-size="13" font-weight="bold" fill="%230f172a" text-anchor="end">${employee}</text>
    
    <text x="50" y="355" font-family="Arial" font-size="12" fill="%2364748b">UPI Ref ID</text>
    <text x="350" y="355" font-family="Courier" font-size="12" font-weight="bold" fill="%230284c7" text-anchor="end">${refId}</text>
    
    <text x="50" y="395" font-family="Arial" font-size="12" fill="%2364748b">Payment Mode</text>
    <text x="350" y="395" font-family="Arial" font-size="12" fill="%230f172a" text-anchor="end">Instant IMPS / UPI 2.0</text>
    
    <text x="50" y="435" font-family="Arial" font-size="12" fill="%2364748b">Timestamp</text>
    <text x="350" y="435" font-family="Arial" font-size="12" fill="%230f172a" text-anchor="end">Today, 10:42 AM</text>
    
    <rect x="45" y="470" width="310" height="70" rx="8" fill="%23f1f5f9"/>
    <text x="60" y="495" font-family="Arial" font-size="11" font-weight="bold" fill="%23334155">Bank RRN Code: 93847291048</text>
    <text x="60" y="515" font-family="Arial" font-size="10" fill="%2364748b">Verified by National Payments Corporation Gateway</text>
    <text x="60" y="530" font-family="Arial" font-size="10" fill="%23059669">Status: SETTLED &amp; CONFIRMED</text>
  </svg>`;
}

export const INITIAL_ENTRIES: EntrySubmission[] = [
  {
    id: 'ent_001',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://client-portal.partner-enterprise.com/order/ORD-9821',
    bankAccountNumber: '50100492817264',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001248',
    referenceId: 'UPI-REF-89472910482',
    amount: 3500,
    withdrawalAmount: 3500,
    screenshotUrl: generateReceiptSvg('UPI-REF-89472910482', 3500, 'Rahul Sharma'),
    status: 'PENDING',
    remarks: 'Field client travel allowance and client demonstration reimbursement.',
    submittedAt: '2026-11-05T10:30:00Z',
  },
  {
    id: 'ent_002',
    employeeId: 'emp_103',
    employeeName: 'Amit Verma',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://payments.supplier-portal.org/invoice/INV-2026-88',
    bankAccountNumber: '38192049182',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0004920',
    referenceId: 'UPI-REF-38291048192',
    amount: 2200,
    withdrawalAmount: 2200,
    screenshotUrl: generateReceiptSvg('UPI-REF-38291048192', 2200, 'Amit Verma'),
    status: 'PENDING',
    remarks: 'Hardware procurement and urgent onsite cable kit.',
    submittedAt: '2026-11-05T11:15:00Z',
  },
  {
    id: 'ent_003',
    employeeId: 'emp_105',
    employeeName: 'Vikas Deshmukh',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://gateway.vendorpay.com/txn/TXN-102948',
    bankAccountNumber: '4920192841',
    bankName: 'Kotak Mahindra Bank',
    ifscCode: 'KKBK0000921',
    referenceId: 'UPI-REF-10294819204',
    amount: 1200,
    withdrawalAmount: 1200,
    screenshotUrl: generateReceiptSvg('UPI-REF-10294819204', 1200, 'Vikas Deshmukh'),
    status: 'PENDING',
    remarks: 'Mobile recharge and field diagnostic sim connectivity.',
    submittedAt: '2026-11-05T11:45:00Z',
  },
  {
    id: 'ent_004',
    employeeId: 'emp_201',
    employeeName: 'Karthik Raman',
    subAdminId: 'usr_sub_2',
    websiteUrl: 'https://logistics-vendor.com/proof/PR-88192',
    bankAccountNumber: '50100882194821',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0000492',
    referenceId: 'UPI-REF-99482019482',
    amount: 4800,
    withdrawalAmount: 4800,
    screenshotUrl: generateReceiptSvg('UPI-REF-99482019482', 4800, 'Karthik Raman'),
    status: 'PENDING',
    remarks: 'Emergency parcel freight forwarding payment receipt.',
    submittedAt: '2026-11-05T09:50:00Z',
  },
  {
    id: 'ent_005',
    employeeId: 'emp_203',
    employeeName: 'Suresh Kumar',
    subAdminId: 'usr_sub_2',
    websiteUrl: 'https://fuel-partner.in/receipts/F-99218',
    bankAccountNumber: '984729104829',
    bankName: 'Bank of Baroda',
    ifscCode: 'BARB0DELHI',
    referenceId: 'UPI-REF-48291048291',
    amount: 2500,
    withdrawalAmount: 2500,
    screenshotUrl: generateReceiptSvg('UPI-REF-48291048291', 2500, 'Suresh Kumar'),
    status: 'PENDING',
    remarks: 'Fuel diesel refueling for delivery van #DL-4C-9921.',
    submittedAt: '2026-11-05T10:10:00Z',
  },
  {
    id: 'ent_006',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://client-portal.partner-enterprise.com/order/ORD-9112',
    bankAccountNumber: '50100492817264',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001248',
    referenceId: 'UPI-REF-77291048291',
    amount: 5000,
    withdrawalAmount: 5000,
    screenshotUrl: generateReceiptSvg('UPI-REF-77291048291', 5000, 'Rahul Sharma'),
    status: 'APPROVED',
    remarks: 'Quarterly internet stipend and workstation ergonomics.',
    submittedAt: '2026-11-04T14:20:00Z',
    reviewedAt: '2026-11-04T16:00:00Z',
    reviewedBy: 'usr_sub_1',
    reviewedByName: 'Sarah Jenkins',
  },
  {
    id: 'ent_007',
    employeeId: 'emp_102',
    employeeName: 'Priya Patel',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://metro-transit.gov/ticketing/pass-88',
    bankAccountNumber: '002105008912',
    bankName: 'ICICI Bank',
    ifscCode: 'ICIC0000021',
    referenceId: 'UPI-REF-66291048291',
    amount: 3200,
    withdrawalAmount: 3200,
    screenshotUrl: generateReceiptSvg('UPI-REF-66291048291', 3200, 'Priya Patel'),
    status: 'APPROVED',
    remarks: 'Metro transit monthly pass reimbursement.',
    submittedAt: '2026-11-04T11:10:00Z',
    reviewedAt: '2026-11-04T12:30:00Z',
    reviewedBy: 'usr_sub_1',
    reviewedByName: 'Sarah Jenkins',
  },
  {
    id: 'ent_008',
    employeeId: 'emp_104',
    employeeName: 'Sneha Roy',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://misc-vendor.com/invoice/998',
    bankAccountNumber: '918020048192841',
    bankName: 'Axis Bank',
    ifscCode: 'UTIB0001082',
    referenceId: 'UPI-REF-11291048291',
    amount: 8500,
    withdrawalAmount: 8500,
    screenshotUrl: generateReceiptSvg('UPI-REF-11291048291', 8500, 'Sneha Roy'),
    status: 'REJECTED',
    rejectionReason: 'Invalid transaction receipt. RRN code does not correspond with verified vendor invoice.',
    remarks: 'Duplicate submission from prior billing cycle.',
    submittedAt: '2026-10-30T09:40:00Z',
    reviewedAt: '2026-10-30T14:10:00Z',
    reviewedBy: 'usr_sub_1',
    reviewedByName: 'Sarah Jenkins',
  },
];
