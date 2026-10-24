import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ComplianceDocType, calculateExpiry } from "../../types";
import {
  formatDateDisplay,
  renderDocTypeBadge,
  renderExpiryBadge,
} from "../../formatters";

export default async function ComplianceRecordDetailsPage({
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

  // Fetch record from the corresponding table with vehicle information
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
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type, status)
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
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type, status)
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
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type, status)
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
        created_at,
        vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type, status)
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
            The requested document record may have been removed or does not exist.
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

  const vehicleDisplay = vehicle
    ? vehicle.vehicle_code
      ? `${vehicle.vehicle_code} — ${vehicle.registration_number}`
      : vehicle.registration_number
    : "Unknown Vehicle";

  // Calculate Expiry
  const expiryDateVal =
    docType === "rsl" ? rec.valid_until : rec.expiry_date;
  const expiry = calculateExpiry(expiryDateVal);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/dashboard/compliance"
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
          Back to Fleet Compliance
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {docType === "insurance" &&
                  `Insurance: ${rec.insurance_company}`}
                {docType === "inspection" &&
                  `Inspection: ${rec.inspection_center || "Center"}`}
                {docType === "speed_governor" &&
                  `Speed Governor: ${rec.vendor}`}
                {docType === "rsl" &&
                  `RSL: ${rec.issuing_authority || "Authority"}`}
              </h1>
              {renderDocTypeBadge(docType)}
              {renderExpiryBadge(expiry.status, expiry.daysRemaining)}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Assigned to{" "}
              <Link
                href={`/dashboard/vehicles/${rec.vehicle_id}`}
                className="font-semibold text-slate-800 hover:text-blue-600 hover:underline"
              >
                {vehicleDisplay}
              </Link>{" "}
              &bull; Recorded on {formatDateDisplay(rec.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/compliance/${docType}/${id}/edit`}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="-ml-0.5 mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Record
            </Link>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Document Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Document Specification Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">
              Document Specifications
            </h2>
            <p className="text-xs text-slate-500">
              Statutory details and regulatory certification attributes
            </p>

            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {/* INSURANCE DETAILS */}
              {docType === "insurance" && (
                <>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Insurance Underwriter
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {rec.insurance_company}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Policy Number
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {rec.policy_number || "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Cover Type
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {rec.cover_type}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Premium Amount
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {rec.premium_amount !== null
                        ? `KES ${Number(rec.premium_amount).toLocaleString(
                            "en-KE",
                            { minimumFractionDigits: 2 }
                          )}`
                        : "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Policy Start Date
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDateDisplay(rec.start_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Policy Expiry Date
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDateDisplay(rec.expiry_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Policy Database Status
                    </dt>
                    <dd className="mt-1 text-sm capitalize text-slate-900">
                      {rec.status || "active"}
                    </dd>
                  </div>
                </>
              )}

              {/* INSPECTION DETAILS */}
              {docType === "inspection" && (
                <>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Inspection Center
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {rec.inspection_center || "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Inspection Outcome / Result
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {rec.result ? (
                        <span
                          className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                            rec.result.toLowerCase() === "pass"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : rec.result.toLowerCase() === "fail"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {rec.result}
                        </span>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Booking Date
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDateDisplay(rec.booking_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Inspection Date
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDateDisplay(rec.inspection_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Inspection Expiry Date
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDateDisplay(rec.expiry_date)}
                    </dd>
                  </div>
                </>
              )}

              {/* SPEED GOVERNOR DETAILS */}
              {docType === "speed_governor" && (
                <>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Governor Vendor / Supplier
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {rec.vendor}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Fitting / Installation Date
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDateDisplay(rec.installation_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Certificate Expiry Date
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDateDisplay(rec.expiry_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Governor Status
                    </dt>
                    <dd className="mt-1 text-sm capitalize text-slate-900">
                      {rec.status || "active"}
                    </dd>
                  </div>
                </>
              )}

              {/* RSL LICENSE DETAILS */}
              {docType === "rsl" && (
                <>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Issuing Authority
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {rec.issuing_authority || "NTSA"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      License Status
                    </dt>
                    <dd className="mt-1 text-sm capitalize text-slate-900">
                      {rec.status || "active"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Application Date
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDateDisplay(rec.application_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Issue Date
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDateDisplay(rec.issue_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Valid From
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDateDisplay(rec.valid_from)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Valid Until (Expiry)
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDateDisplay(rec.valid_until)}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Digital Certificate & Notes Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">
              Attached Certificate &amp; Notes
            </h2>
            <p className="text-xs text-slate-500">
              Digital document reference and operational notes
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-medium text-slate-500">
                  Certificate URL / Reference
                </dt>
                <dd className="mt-1 text-sm">
                  {rec.certificate_url ? (
                    <a
                      href={rec.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <svg
                        className="mr-1.5 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {rec.certificate_url}
                    </a>
                  ) : (
                    <span className="text-slate-400">No document attached</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-slate-500">Notes</dt>
                <dd className="mt-1 whitespace-pre-line text-sm text-slate-700">
                  {rec.notes || (
                    <span className="text-slate-400">No additional notes</span>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Vehicle Profile & Expiry Breakdown */}
        <div className="space-y-6">
          {/* Expiry Analysis Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Compliance Expiry Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Calendar-day statutory validation
            </p>

            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-center">
              <p className="text-xs font-medium text-slate-500">Expiry Status</p>
              <div className="mt-2 flex justify-center">
                {renderExpiryBadge(expiry.status, expiry.daysRemaining)}
              </div>
              <p className="mt-3 text-xs text-slate-600">
                {expiry.status === "expired" && (
                  <span className="font-medium text-rose-600">
                    Expired {Math.abs(expiry.daysRemaining ?? 0)} days ago. Vehicle may not be compliant for road operations.
                  </span>
                )}
                {expiry.status === "expiring_soon" && (
                  <span className="font-medium text-amber-600">
                    Expiring in {expiry.daysRemaining} days. Renewal action required soon.
                  </span>
                )}
                {expiry.status === "valid" && (
                  <span className="font-medium text-emerald-600">
                    Valid for another {expiry.daysRemaining} days.
                  </span>
                )}
                {expiry.status === "unknown" && (
                  <span className="text-slate-500">
                    No valid expiration date recorded for this document.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Assigned Vehicle Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Fleet Vehicle
            </h3>
            <p className="text-xs text-slate-500">
              Vehicle assigned to this certificate
            </p>

            {vehicle ? (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Registration</p>
                  <p className="text-sm font-bold text-slate-900">
                    {vehicle.registration_number}
                  </p>
                </div>
                {vehicle.vehicle_code && (
                  <div>
                    <p className="text-xs text-slate-500">Fleet Code</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {vehicle.vehicle_code}
                    </p>
                  </div>
                )}
                {vehicle.vehicle_type && (
                  <div>
                    <p className="text-xs text-slate-500">Vehicle Type</p>
                    <p className="text-sm text-slate-800">
                      {vehicle.vehicle_type}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Operational Status</p>
                  <p className="text-sm capitalize font-medium text-slate-800">
                    {vehicle.status || "Active"}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/dashboard/vehicles/${record.vehicle_id}`}
                    className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View Vehicle Full Details &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400">
                Vehicle information unavailable.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
