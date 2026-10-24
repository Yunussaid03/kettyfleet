import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ComplianceDocType } from "../../../types";
import EditComplianceForm from "./EditComplianceForm";

export default async function EditComplianceRecordPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  if (
    type !== "insurance" &&
    type !== "inspection" &&
    type !== "speed_governor" &&
    type !== "rsl"
  ) {
    notFound();
  }

  const docType = type as ComplianceDocType;
  const supabase = await createClient();

  let record: Record<string, unknown> | null = null;
  let hasError = false;

  if (docType === "insurance") {
    const res = await supabase
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
        certificate_url,
        status,
        notes,
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .eq("id", id)
      .single();
    record = res.data;
    if (res.error) hasError = true;
  } else if (docType === "inspection") {
    const res = await supabase
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
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .eq("id", id)
      .single();
    record = res.data;
    if (res.error) hasError = true;
  } else if (docType === "speed_governor") {
    const res = await supabase
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
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .eq("id", id)
      .single();
    record = res.data;
    if (res.error) hasError = true;
  } else if (docType === "rsl") {
    const res = await supabase
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
        vehicle:vehicles(id, vehicle_code, registration_number)
      `
      )
      .eq("id", id)
      .single();
    record = res.data;
    if (res.error) hasError = true;
  }

  if (hasError || !record) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/compliance"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Fleet Compliance
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Compliance record not found.</p>
          <p className="mt-1 text-xs text-red-600">
            The record may have been removed or does not exist.
          </p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec = record as Record<string, any>;

  const vehicle = Array.isArray(rec.vehicle)
    ? rec.vehicle[0]
    : rec.vehicle;

  const vehicleLabel = vehicle
    ? vehicle.vehicle_code
      ? `${vehicle.vehicle_code} — ${vehicle.registration_number}`
      : vehicle.registration_number
    : "Vehicle";

  const typeLabels: Record<ComplianceDocType, string> = {
    insurance: "Insurance Policy",
    inspection: "Inspection Record",
    speed_governor: "Speed Governor Certificate",
    rsl: "Road Service License (RSL)",
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/compliance/${docType}/${id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <svg
            className="mr-1 h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Record Details
        </Link>
        <div className="mt-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit {typeLabels[docType]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Editing compliance record for{" "}
            <span className="font-medium text-slate-700">{vehicleLabel}</span>
          </p>
        </div>
      </div>

      {/* Main Form Component */}
      <EditComplianceForm
        docType={docType}
        id={id}
        initialRecord={rec}
      />
    </div>
  );
}
