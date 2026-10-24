export type ComplianceDocType =
  | "insurance"
  | "inspection"
  | "speed_governor"
  | "rsl";

export type ExpiryStatus = "expired" | "expiring_soon" | "valid" | "unknown";

export interface NormalizedComplianceRecord {
  id: string;
  docType: ComplianceDocType;
  docTypeLabel: string;
  vehicleId: string;
  vehicleDisplay: string;
  vehicleCode: string | null;
  registrationNumber: string;
  primaryReference: string; // Policy No, Inspection Center, Vendor, Issuing Authority
  secondaryDetail: string | null; // Cover Type, Result, etc.
  effectiveDate: string | null;
  expiryDateStr: string | null;
  daysRemaining: number | null;
  expiryStatus: ExpiryStatus;
  dbStatus: string | null; // Raw status from db (e.g. active, expired, pending, etc.)
  notes: string | null;
  certificateUrl: string | null;
  createdDate: string;
}

export interface ComplianceSummaryMetrics {
  total: number;
  expired: number;
  expiringSoon: number;
  valid: number;
  unknown: number;
}

/**
 * Validates whether a string is a valid ISO date string (YYYY-MM-DD or standard parseable ISO)
 * Returns the Date object parsed at UTC/local start of day, or null if invalid.
 */
export function parseDateStrict(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Basic check for YYYY-MM-DD or ISO pattern
  const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) {
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // 0-indexed
  const day = parseInt(match[3], 10);

  const date = new Date(year, month, day);
  // Verify date validity (e.g., month/day rollover checks)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Normalizes a Date to midnight (00:00:00.000) for exact calendar-day granularity comparisons.
 */
export function toCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Computes calendar-day expiry status:
 * - Expired: expiry date is before today (< 0 days).
 * - Expiring soon: today through the next 30 days inclusive (0 <= days <= 30).
 * - Valid: beyond the 30-day window (> 30 days).
 * - Missing or unparseable: Unknown.
 */
export function calculateExpiry(
  expiryDateStr: string | null | undefined,
  referenceDate: Date = new Date()
): { daysRemaining: number | null; status: ExpiryStatus } {
  const parsedExpiry = parseDateStrict(expiryDateStr);
  if (!parsedExpiry) {
    return { daysRemaining: null, status: "unknown" };
  }

  const today = toCalendarDay(referenceDate);
  const expiry = toCalendarDay(parsedExpiry);

  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { daysRemaining: diffDays, status: "expired" };
  } else if (diffDays <= 30) {
    return { daysRemaining: diffDays, status: "expiring_soon" };
  } else {
    return { daysRemaining: diffDays, status: "valid" };
  }
}
