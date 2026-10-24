import { createClient } from "@/lib/supabase/server";
import {
  calculateExpiry,
  NormalizedComplianceRecord,
  ComplianceDocType,
} from "./types";
import ComplianceClientTable from "./ComplianceClientTable";

interface VehicleRel {
  id: string;
  vehicle_code: string | null;
  registration_number: string;
}

interface InsuranceRecordDb {
  id: string;
  vehicle_id: string;
  insurance_company: string;
  policy_number: string | null;
  cover_type: string;
  premium_amount: number | null;
  start_date: string;
  expiry_date: string;
  status: string | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  vehicle: VehicleRel | VehicleRel[] | null;
}

interface InspectionRecordDb {
  id: string;
  vehicle_id: string;
  booking_date: string | null;
  inspection_date: string | null;
  inspection_center: string | null;
  result: string | null;
  expiry_date: string | null; // text in schema
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  vehicle: VehicleRel | VehicleRel[] | null;
}

interface SpeedGovernorRecordDb {
  id: string;
  vehicle_id: string;
  vendor: string;
  installation_date: string;
  expiry_date: string | null;
  certificate_url: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  vehicle: VehicleRel | VehicleRel[] | null;
}

interface RslRecordDb {
  id: string;
  vehicle_id: string;
  application_date: string | null;
  issue_date: string | null;
  valid_from: string | null;
  valid_until: string;
  issuing_authority: string | null;
  certificate_url: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  vehicle: VehicleRel | VehicleRel[] | null;
}

function extractVehicleInfo(vehicle: VehicleRel | VehicleRel[] | null): {
  vehicleCode: string | null;
  registrationNumber: string;
  display: string;
} {
  if (!vehicle) {
    return {
      vehicleCode: null,
      registrationNumber: "Unknown Vehicle",
      display: "Unknown Vehicle",
    };
  }
  const v = Array.isArray(vehicle) ? vehicle[0] : vehicle;
  if (!v) {
    return {
      vehicleCode: null,
      registrationNumber: "Unknown Vehicle",
      display: "Unknown Vehicle",
    };
  }
  const display = v.vehicle_code
    ? `${v.vehicle_code} (${v.registration_number})`
    : v.registration_number;
  return {
    vehicleCode: v.vehicle_code,
    registrationNumber: v.registration_number,
    display,
  };
}

export default async function ComplianceDashboardPage() {
  const supabase = await createClient();

  // Query all four compliance tables concurrently along with vehicle metadata
  const [insuranceRes, inspectionRes, speedRes, rslRes] = await Promise.all([
    supabase
      .from("insurance_records")
      .select(
        `
        id,
        vehicle_id,
        insurance_company,
        policy_number,
        cover_type,
        premium_amount,
        start_date,
        expiry_date,
        status,
        certificate_url,
        notes,
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .order("expiry_date", { ascending: true }),

    supabase
      .from("inspection_records")
      .select(
        `
        id,
        vehicle_id,
        booking_date,
        inspection_date,
        inspection_center,
        result,
        expiry_date,
        certificate_url,
        notes,
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("speed_governor_records")
      .select(
        `
        id,
        vehicle_id,
        vendor,
        installation_date,
        expiry_date,
        certificate_url,
        status,
        notes,
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .order("expiry_date", { ascending: true }),

    supabase
      .from("rsl_records")
      .select(
        `
        id,
        vehicle_id,
        application_date,
        issue_date,
        valid_from,
        valid_until,
        issuing_authority,
        certificate_url,
        status,
        notes,
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .order("valid_until", { ascending: true }),
  ]);

  // Aggregate errors if any
  const errors: string[] = [];
  if (insuranceRes.error)
    errors.push(`Insurance: ${insuranceRes.error.message}`);
  if (inspectionRes.error)
    errors.push(`Inspection: ${inspectionRes.error.message}`);
  if (speedRes.error) errors.push(`Speed Governor: ${speedRes.error.message}`);
  if (rslRes.error) errors.push(`RSL: ${rslRes.error.message}`);

  if (errors.length > 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">
          Failed to load one or more compliance datasets.
        </p>
        <ul className="mt-2 list-inside list-disc text-xs text-red-600">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Please check your database connection or Supabase RLS policies.
        </p>
      </div>
    );
  }

  const today = new Date();
  const normalizedRecords: NormalizedComplianceRecord[] = [];

  // 1. Normalize Insurance
  const insuranceRows = (insuranceRes.data ??
    []) as unknown as InsuranceRecordDb[];
  for (const item of insuranceRows) {
    const vInfo = extractVehicleInfo(item.vehicle);
    const expiry = calculateExpiry(item.expiry_date, today);
    const ref = item.policy_number
      ? `${item.insurance_company} • ${item.policy_number}`
      : item.insurance_company;

    normalizedRecords.push({
      id: item.id,
      docType: "insurance" as ComplianceDocType,
      docTypeLabel: "Insurance",
      vehicleId: item.vehicle_id,
      vehicleDisplay: vInfo.display,
      vehicleCode: vInfo.vehicleCode,
      registrationNumber: vInfo.registrationNumber,
      primaryReference: ref,
      secondaryDetail: item.cover_type,
      effectiveDate: item.start_date,
      expiryDateStr: item.expiry_date,
      daysRemaining: expiry.daysRemaining,
      expiryStatus: expiry.status,
      dbStatus: item.status,
      notes: item.notes,
      certificateUrl: item.certificate_url,
      createdDate: item.created_at,
    });
  }

  // 2. Normalize Inspection
  const inspectionRows = (inspectionRes.data ??
    []) as unknown as InspectionRecordDb[];
  for (const item of inspectionRows) {
    const vInfo = extractVehicleInfo(item.vehicle);
    const expiry = calculateExpiry(item.expiry_date, today);
    const ref = item.inspection_center || "Inspection Center";

    normalizedRecords.push({
      id: item.id,
      docType: "inspection" as ComplianceDocType,
      docTypeLabel: "Inspection",
      vehicleId: item.vehicle_id,
      vehicleDisplay: vInfo.display,
      vehicleCode: vInfo.vehicleCode,
      registrationNumber: vInfo.registrationNumber,
      primaryReference: ref,
      secondaryDetail: item.result ? `Result: ${item.result}` : null,
      effectiveDate: item.inspection_date || item.booking_date,
      expiryDateStr: item.expiry_date,
      daysRemaining: expiry.daysRemaining,
      expiryStatus: expiry.status,
      dbStatus: item.result,
      notes: item.notes,
      certificateUrl: item.certificate_url,
      createdDate: item.created_at,
    });
  }

  // 3. Normalize Speed Governor
  const speedRows = (speedRes.data ?? []) as unknown as SpeedGovernorRecordDb[];
  for (const item of speedRows) {
    const vInfo = extractVehicleInfo(item.vehicle);
    const expiry = calculateExpiry(item.expiry_date, today);

    normalizedRecords.push({
      id: item.id,
      docType: "speed_governor" as ComplianceDocType,
      docTypeLabel: "Speed Governor",
      vehicleId: item.vehicle_id,
      vehicleDisplay: vInfo.display,
      vehicleCode: vInfo.vehicleCode,
      registrationNumber: vInfo.registrationNumber,
      primaryReference: item.vendor,
      secondaryDetail: null,
      effectiveDate: item.installation_date,
      expiryDateStr: item.expiry_date,
      daysRemaining: expiry.daysRemaining,
      expiryStatus: expiry.status,
      dbStatus: item.status,
      notes: item.notes,
      certificateUrl: item.certificate_url,
      createdDate: item.created_at,
    });
  }

  // 4. Normalize RSL
  const rslRows = (rslRes.data ?? []) as unknown as RslRecordDb[];
  for (const item of rslRows) {
    const vInfo = extractVehicleInfo(item.vehicle);
    const expiry = calculateExpiry(item.valid_until, today);
    const ref = item.issuing_authority
      ? `Authority: ${item.issuing_authority}`
      : "Road Service License";

    normalizedRecords.push({
      id: item.id,
      docType: "rsl" as ComplianceDocType,
      docTypeLabel: "RSL License",
      vehicleId: item.vehicle_id,
      vehicleDisplay: vInfo.display,
      vehicleCode: vInfo.vehicleCode,
      registrationNumber: vInfo.registrationNumber,
      primaryReference: ref,
      secondaryDetail: item.status ? `Status: ${item.status}` : null,
      effectiveDate: item.valid_from || item.issue_date,
      expiryDateStr: item.valid_until,
      daysRemaining: expiry.daysRemaining,
      expiryStatus: expiry.status,
      dbStatus: item.status,
      notes: item.notes,
      certificateUrl: item.certificate_url,
      createdDate: item.created_at,
    });
  }

  // Sort unified records: expired first, then expiring soon, then valid, then unknown; within that, by daysRemaining
  normalizedRecords.sort((a, b) => {
    const priority = { expired: 1, expiring_soon: 2, valid: 3, unknown: 4 };
    const pDiff = priority[a.expiryStatus] - priority[b.expiryStatus];
    if (pDiff !== 0) return pDiff;

    if (a.daysRemaining !== null && b.daysRemaining !== null) {
      return a.daysRemaining - b.daysRemaining;
    }
    return 0;
  });

  // Calculate 4 primary KPI metrics
  const totalDocs = normalizedRecords.length;
  const expiredDocs = normalizedRecords.filter(
    (r) => r.expiryStatus === "expired"
  ).length;
  const expiringSoonDocs = normalizedRecords.filter(
    (r) => r.expiryStatus === "expiring_soon"
  ).length;
  const validDocs = normalizedRecords.filter(
    (r) => r.expiryStatus === "valid"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Fleet Compliance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor statutory vehicle certifications, insurance renewals,
            inspections, speed governors, and road service licenses.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Documents */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Documents
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalDocs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Across 4 statutory categories
          </p>
        </div>

        {/* Card 2: Expired Documents */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Expired Documents
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {expiredDocs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-rose-600">
            Immediate renewal required
          </p>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Expiring Soon
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {expiringSoonDocs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-amber-600">
            Due within next 30 days
          </p>
        </div>

        {/* Card 4: Currently Valid */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Valid by Date
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {validDocs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-600">
            Valid beyond 30 days
          </p>
        </div>
      </div>

      {/* Unified Table Component with client-side filtering and search */}
      <ComplianceClientTable initialRecords={normalizedRecords} />
    </div>
  );
}
