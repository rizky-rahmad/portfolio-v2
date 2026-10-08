// Fictional demo data for the PeopleOS prototype.
// Labels mirror the app's own English i18n strings verbatim.

export const outlets = ["This Is Bali", "Acai Queen"];

// ── HR Overview ────────────────────────────────────────────────────────

export const hrTotal = { all: 64, active: 58, leave: 4, inactive: 2 };

export const hrByBrand = [
  { name: "This Is Bali", count: 28 },
  { name: "Acai Queen", count: 24 },
  { name: "HQ", count: 12 },
];

export const brandColors = ["#f59e0b", "#059669", "#4f46e5", "#999999"];

export const hrGlance = {
  newHires: 9,
  newHiresDelta: 2,
  days: 30,
  tenureAvg: "2.3",
  tenureMedian: "1.8",
  ageAvg: "27.4",
  ageFilled: 58,
  ageTotal: 64,
  trainingPct: 78,
  trainingDone: 112,
  trainingTotal: 143,
  trainingOverdue: 6,
};

export const hrByDept = [
  { label: "Kitchen", value: 14 },
  { label: "Service", value: 16 },
  { label: "Bar", value: 9 },
  { label: "Warehouse", value: 6 },
  { label: "Finance", value: 5 },
  { label: "Other", value: 14 },
];

export const hrBySite = [
  { label: "Canggu", value: 17 },
  { label: "Seminyak", value: 14 },
  { label: "Ubud", value: 12 },
  { label: "Kuta", value: 9 },
  { label: "Denpasar", value: 12 },
];

export type ProbationRow = { id: string; name: string; full: string; department: string; day: number };

export const hrProbation: ProbationRow[] = [
  { id: "p1", name: "Gita", full: "Ni Luh Gita", department: "Service", day: 82 },
  { id: "p2", name: "Komang", full: "I Made Komang", department: "Kitchen", day: 64 },
  { id: "p3", name: "Sari", full: "Ni Kadek Sari", department: "Bar", day: 41 },
];

export const hrVacant = [
  { name: "Night auditor", department: "Finance" },
  { name: "Head barista", department: "Bar" },
  { name: "Sous chef", department: "Kitchen" },
];

export const hrHighByPosition = [
  { label: "Server", value: 6 },
  { label: "Kitchen", value: 4 },
  { label: "Barista", value: 3 },
];

export type BirthdayRow = {
  id: string;
  name: string;
  full: string;
  department: string;
  brand: string;
  day: number;
  age: number;
  diff: number;
};

export const hrBirthdays: BirthdayRow[] = [
  { id: "b1", name: "Puspa", full: "Ni Luh Puspa", department: "Finance", brand: "HQ", day: 3, age: 26, diff: -4 },
  { id: "b2", name: "Wijaya", full: "Made Surya Wijaya", department: "Kitchen", brand: "This Is Bali", day: 7, age: 31, diff: -1 },
  { id: "b3", name: "Ariani", full: "Kadek Ariani", department: "Bar", brand: "Acai Queen", day: 11, age: 24, diff: 2 },
  { id: "b4", name: "Sudarma", full: "Wayan Sudarma", department: "Warehouse", brand: "HQ", day: 18, age: 35, diff: 9 },
  { id: "b5", name: "Bayu", full: "Gede Bayu Pratama", department: "Kitchen", brand: "This Is Bali", day: 29, age: 22, diff: 20 },
];

export type ReadinessRow = {
  key: string;
  metric: string;
  status: "ok" | "warn" | "block";
  filled: string;
  how: string;
};

export const hrReadiness: ReadinessRow[] = [
  { key: "total", metric: "Total employees", status: "ok", filled: "64/64 · 100%", how: "Automatic, from the employee list." },
  { key: "byBrand", metric: "Headcount by brand", status: "ok", filled: "64/64 · 100%", how: "Set the brand on each department, on the Departments page." },
  { key: "byDept", metric: "Headcount by department", status: "ok", filled: "64/64 · 100%", how: "Pick a department on the employee profile, Placement tab." },
  { key: "newHires", metric: "New hires", status: "ok", filled: "event · answered", how: "Join date on the employee profile, Placement tab." },
  { key: "tenure", metric: "Average tenure", status: "ok", filled: "61/64 · 95%", how: "Join date on the employee profile, Placement tab." },
  { key: "age", metric: "Average age", status: "warn", filled: "58/64 · 91%", how: "Date of birth on the employee profile, Information tab." },
  { key: "birthdays", metric: "Birthdays this month", status: "warn", filled: "58/64 · 91%", how: "Date of birth on the employee profile, Information tab." },
  { key: "training", metric: "Training completion %", status: "ok", filled: "143 assignments", how: "Assign training from the Training module." },
  { key: "bySite", metric: "Headcount by site", status: "warn", filled: "55/64 · 86%", how: "Pick a work site on the employee profile, Placement tab." },
  { key: "byType", metric: "Worker type", status: "warn", filled: "49/64 · 77%", how: "Pick a worker type on the employee profile, or via CSV import." },
  { key: "vacant", metric: "Vacant positions", status: "ok", filled: "event · answered", how: "Assign employees to positions, on the profile Placement tab." },
  { key: "high", metric: "High performers", status: "ok", filled: "13 flagged", how: "Flag a high performer on the employee position assignment." },
  { key: "probation", metric: "Employees on probation", status: "ok", filled: "event · answered", how: "Join date on the employee profile, Placement tab." },
  { key: "salary", metric: "Average salary by brand", status: "block", filled: "Needs permission", how: "Grant pay-data access from the Users menu." },
  { key: "turnover", metric: "Turnover rate", status: "ok", filled: "event · answered", how: "Filled automatically when an employee status becomes Terminated." },
  { key: "promotions", metric: "Promotions", status: "ok", filled: "event · answered", how: "Filled automatically when an employee changes position." },
  { key: "gender", metric: "Gender ratio", status: "block", filled: "—", how: "Pick a gender on the employee profile, Information tab." },
];

// ── Approvals ──────────────────────────────────────────────────────────

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalKind = "leave" | "correction" | "overtime";

export type ApprovalStepState = {
  status: ApprovalStatus;
  reviewerName?: string;
  reviewedAt?: string;
  note?: string;
};

export type Approval = {
  id: string;
  kind: ApprovalKind;
  typeLabel: string;
  employee: string;
  nickname: string;
  department: string;
  outlet: string;
  submitted: string;
  dates: string;
  duration?: string;
  reason: string;
  status: ApprovalStatus;
  leader: ApprovalStepState;
  pc: ApprovalStepState;
  reviewAs: "leader" | "pc";
  needsYou: boolean;
  attachment?: string;
};

export const kindLabel: Record<ApprovalKind, string> = {
  leave: "Leave",
  correction: "Attendance correction",
  overtime: "Overtime",
};

export const stepLabel: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const initialApprovals: Approval[] = [
  {
    id: "APR-201",
    kind: "leave",
    typeLabel: "Annual leave",
    employee: "Ni Made Ayu",
    nickname: "Ayu",
    department: "Service",
    outlet: "This Is Bali",
    submitted: "08 Oct 2026, 09:12",
    dates: "14 Oct 2026 → 15 Oct 2026",
    reason: "Family ceremony in Ubud — 2 days.",
    status: "pending",
    leader: { status: "pending" },
    pc: { status: "pending" },
    reviewAs: "leader",
    needsYou: true,
  },
  {
    id: "APR-202",
    kind: "leave",
    typeLabel: "Sick leave",
    employee: "I Wayan Jonas",
    nickname: "Jonas",
    department: "Kitchen",
    outlet: "This Is Bali",
    submitted: "09 Oct 2026, 07:40",
    dates: "09 Oct 2026",
    reason: "Flu, resting at home. Doctor note attached.",
    status: "pending",
    leader: { status: "approved", reviewerName: "Made (leader)", reviewedAt: "09 Oct 2026, 08:05" },
    pc: { status: "pending" },
    reviewAs: "pc",
    needsYou: true,
    attachment: "doctor-note.pdf",
  },
  {
    id: "APR-203",
    kind: "overtime",
    typeLabel: "Overtime",
    employee: "Ni Putu Putri",
    nickname: "Putri",
    department: "Bar",
    outlet: "Acai Queen",
    submitted: "07 Oct 2026, 21:50",
    dates: "07 Oct 2026, 19:00 → 21:00",
    duration: "120 minutes",
    reason: "Covered the evening rush — short-staffed.",
    status: "pending",
    leader: { status: "pending" },
    pc: { status: "pending" },
    reviewAs: "leader",
    needsYou: true,
  },
  {
    id: "APR-204",
    kind: "correction",
    typeLabel: "Clock-in correction",
    employee: "I Gede Made",
    nickname: "Made",
    department: "Service",
    outlet: "Acai Queen",
    submitted: "06 Oct 2026, 10:02",
    dates: "05 Oct 2026 · in 08:55 → 09:05",
    reason: "Forgot to clock in — was setting up the bar.",
    status: "approved",
    leader: { status: "approved", reviewerName: "Sinta (leader)", reviewedAt: "06 Oct 2026, 11:20" },
    pc: { status: "approved", reviewerName: "Rani (PC)", reviewedAt: "06 Oct 2026, 13:44" },
    reviewAs: "pc",
    needsYou: false,
  },
  {
    id: "APR-205",
    kind: "leave",
    typeLabel: "Unpaid leave",
    employee: "I Kadek Dewa",
    nickname: "Dewa",
    department: "Service",
    outlet: "This Is Bali",
    submitted: "05 Oct 2026, 16:31",
    dates: "11 Oct 2026 → 13 Oct 2026",
    reason: "Trip to Jakarta.",
    status: "rejected",
    leader: {
      status: "rejected",
      reviewerName: "Made (leader)",
      reviewedAt: "05 Oct 2026, 18:02",
      note: "Peak weekend — we need everyone on the floor.",
    },
    pc: { status: "pending" },
    reviewAs: "leader",
    needsYou: false,
  },
];

// ── Schedule & attendance ──────────────────────────────────────────────

export type PosShiftStatus = "scheduled" | "published" | "completed" | "cancelled" | "open";

export type PosShift = {
  id: string;
  employee: string;
  full: string;
  position: string;
  day: number;
  start: string;
  end: string;
  status: PosShiftStatus;
  draft?: boolean;
};

export const posDays = ["Mon 13", "Tue 14", "Wed 15", "Thu 16", "Fri 17", "Sat 18", "Sun 19"];

export const weekShifts: PosShift[] = [
  { id: "w1", employee: "Ayu", full: "Ni Made Ayu", position: "Server", day: 0, start: "09:00", end: "17:00", status: "published" },
  { id: "w2", employee: "Jonas", full: "I Wayan Jonas", position: "Kitchen", day: 0, start: "13:00", end: "21:00", status: "published" },
  { id: "w3", employee: "Putri", full: "Ni Putu Putri", position: "Barista", day: 1, start: "09:00", end: "17:00", status: "published" },
  { id: "w4", employee: "Made", full: "I Gede Made", position: "Server", day: 1, start: "13:00", end: "21:00", status: "scheduled", draft: true },
  { id: "w5", employee: "Ayu", full: "Ni Made Ayu", position: "Server", day: 2, start: "09:00", end: "17:00", status: "published" },
  { id: "w6", employee: "Open shift", full: "", position: "Server", day: 3, start: "13:00", end: "21:00", status: "open" },
  { id: "w7", employee: "Jonas", full: "I Wayan Jonas", position: "Kitchen", day: 4, start: "09:00", end: "17:00", status: "published" },
  { id: "w8", employee: "Putri", full: "Ni Putu Putri", position: "Barista", day: 4, start: "13:00", end: "21:00", status: "scheduled", draft: true },
  { id: "w9", employee: "Made", full: "I Gede Made", position: "Server", day: 5, start: "09:00", end: "17:00", status: "published" },
  { id: "w10", employee: "Ayu", full: "Ni Made Ayu", position: "Server", day: 5, start: "13:00", end: "21:00", status: "published" },
  { id: "w11", employee: "Jonas", full: "I Wayan Jonas", position: "Kitchen", day: 6, start: "09:00", end: "15:00", status: "completed" },
];

export type AttendanceRow = {
  id: string;
  member: string;
  full: string;
  job: string;
  dept: string;
  scheduled: string;
  clockIn: string;
  clockOut: string;
  hours: string;
  diff: string;
  brk: string;
  location: string;
  status: "Active" | "On break" | "Completed";
  flags: string[];
};

export const attendanceToday: AttendanceRow[] = [
  { id: "a1", member: "Ayu", full: "Ni Made Ayu", job: "Server", dept: "Service", scheduled: "09:00–17:00", clockIn: "08:55", clockOut: "—", hours: "4.2h", diff: "+5m", brk: "—", location: "This Is Bali", status: "Active", flags: [] },
  { id: "a2", member: "Jonas", full: "I Wayan Jonas", job: "Kitchen", dept: "Kitchen", scheduled: "09:00–17:00", clockIn: "09:14", clockOut: "—", hours: "3.9h", diff: "+14m", brk: "—", location: "This Is Bali", status: "Active", flags: ["Late 14m"] },
  { id: "a3", member: "Putri", full: "Ni Putu Putri", job: "Barista", dept: "Bar", scheduled: "09:00–17:00", clockIn: "08:58", clockOut: "—", hours: "4.1h", diff: "-2m", brk: "12m", location: "This Is Bali", status: "On break", flags: [] },
  { id: "a4", member: "Made", full: "I Gede Made", job: "Server", dept: "Service", scheduled: "13:00–21:00", clockIn: "—", clockOut: "—", hours: "0h", diff: "—", brk: "—", location: "Acai Queen", status: "Completed", flags: ["Needs clock out"] },
];

// ── Hiring ─────────────────────────────────────────────────────────────

export type HireStage =
  | "applied"
  | "screening"
  | "trial"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export const hireStages: HireStage[] = [
  "applied",
  "screening",
  "trial",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export const hireStageLabel: Record<HireStage, string> = {
  applied: "Applied",
  screening: "Screening",
  trial: "Trial",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export type HireCandidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  job: string;
  dept: string;
  stage: HireStage;
  source: string;
  score: number | null;
  rating: number;
  wa: boolean;
  applied: string;
  video: boolean;
  cv: string;
};

export const hireJobs = ["Server", "Barista", "Kitchen"];

export const initialHireCandidates: HireCandidate[] = [
  { id: "h1", name: "Dewa", email: "dewa@example.com", phone: "+62 812 0001", job: "Server", dept: "Service", stage: "applied", source: "IG", score: 82, rating: 4, wa: true, applied: "2h ago", video: true, cv: "2 years serving in Seminyak cafés. Basic latte art. Available weekends." },
  { id: "h2", name: "Sinta", email: "sinta@example.com", phone: "+62 812 0002", job: "Barista", dept: "Bar", stage: "screening", source: "TT", score: 91, rating: 5, wa: true, applied: "5h ago", video: true, cv: "3 years specialty coffee. Dial-in, milk texture, manual brew. Calm under rush." },
  { id: "h3", name: "Bagus", email: "bagus@example.com", phone: "+62 812 0003", job: "Kitchen", dept: "Kitchen", stage: "trial", source: "REF", score: null, rating: 3, wa: false, applied: "1d ago", video: false, cv: "Commis, 1 year. Knife skills basic. Referred by Jonas." },
  { id: "h4", name: "Rani", email: "rani@example.com", phone: "+62 812 0004", job: "Server", dept: "Service", stage: "interview", source: "WA", score: 76, rating: 4, wa: true, applied: "2d ago", video: true, cv: "Hotel F&B background. Strong upselling. Interview Thu 10:00." },
  { id: "h5", name: "Komang", email: "komang@example.com", phone: "+62 812 0005", job: "Server", dept: "Service", stage: "offer", source: "IG", score: 88, rating: 5, wa: true, applied: "3d ago", video: true, cv: "Ex fine-dining. Wine basics. Offer sent Mon, awaiting reply." },
  { id: "h6", name: "Gita", email: "gita@example.com", phone: "+62 812 0006", job: "Barista", dept: "Bar", stage: "applied", source: "TT", score: null, rating: 0, wa: false, applied: "3h ago", video: false, cv: "Fresh graduate, hospitality school. Eager, no experience yet." },
  { id: "h7", name: "Yoga", email: "yoga@example.com", phone: "+62 812 0007", job: "Kitchen", dept: "Kitchen", stage: "screening", source: "IG", score: 64, rating: 2, wa: true, applied: "4d ago", video: true, cv: "Street-food stall cook. Fast hands, needs plating training." },
];
