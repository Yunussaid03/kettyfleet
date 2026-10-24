import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not Provided";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function FuelRecordDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("fuel_records")
    .select(`
      id,
      vehicle_id,
      job_id,
      fillup_date,
      odometer_before,
      odometer_after,
      fuel_amount_litres,
      fuel_cost_per_litres,
      km_covered,
      fuel_efficiency,
      fuel_station,
      invoice_number,
      notes,
      created_at,
      vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type, status, current_mileage),
      job:jobs(id, cdo_number)
    `)
    .eq("id", id)
    .single();

  if (error || !record) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/fuel"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Fuel Records
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Fuel record not found.</p>
          <p className="mt-1 text-xs text-red-600">The fuel log may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  const vehicleData = Array.isArray(record.vehicle) ? record.vehicle[0] : record.vehicle;
  const jobData = Array.isArray(record.job) ? record.job[0] : record.job;

  const vehicleDisplay = vehicleData
    ? vehicleData.vehicle_code
      ? `${vehicleData.vehicle_code} — ${vehicleData.registration_number}`
      : vehicleData.registration_number
    : null;

  const totalCost = (Number(record.fuel_amount_litres) || 0) * (Number(record.fuel_cost_per_litres) || 0);
  const distance =
    record.km_covered !== null
      ? record.km_covered
      : record.odometer_after - record.odometer_before;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/dashboard/fuel"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Fuel Records
        </Link>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Fuel Fill-Up: {formatNumber(Number(record.fuel_amount_litres))} L
              </h1>
              {record.fuel_efficiency && (
                <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {Number(record.fuel_efficiency).toFixed(2)} km/L
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Logged on {formatDate(record.fillup_date)} &bull; Vehicle:{" "}
              <span className="font-medium text-slate-700">{vehicleDisplay ?? "Unassigned"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/fuel/${id}/edit`}
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

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Fuel & Odometer Metrics */}
        <div className="space-y-6 lg:col-span-2">
          {/* Fuel & Financial Specifications */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Fuel &amp; Expenditure Details</h2>
              <p className="text-xs text-slate-500">Volume, unit rate, and total cost calculation</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Fuel Volume
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-slate-900">
                    {formatNumber(Number(record.fuel_amount_litres))} Litres
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Cost Per Litre
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800">
                    {formatNumber(Number(record.fuel_cost_per_litres))} / L
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Total Refuel Cost
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-emerald-600">
                    {formatNumber(totalCost)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Fill-Up Date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(record.fillup_date)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Fuel Station / Vendor
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {record.fuel_station || "Not Specified"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Invoice / Receipt #
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-medium text-slate-800">
                    {record.invoice_number || "Not Provided"}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Notes &amp; Remarks
                  </dt>
                  <dd className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700">
                    {record.notes ? (
                      <p className="whitespace-pre-line">{record.notes}</p>
                    ) : (
                      <span className="text-slate-400">No additional remarks recorded for this fill-up.</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Odometer & Mileage Performance */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Odometer &amp; Efficiency Analysis</h2>
              <p className="text-xs text-slate-500">Trip odometer tracking and consumption efficiency</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Odometer Before Fill-Up
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {record.odometer_before.toLocaleString()} km
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Odometer After Fill-Up
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {record.odometer_after.toLocaleString()} km
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Distance Covered
                  </dt>
                  <dd className="mt-1 text-base font-bold text-slate-900">
                    {distance > 0 ? `${distance.toLocaleString()} km` : "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Fuel Efficiency
                  </dt>
                  <dd className="mt-1 text-base font-bold text-emerald-600">
                    {record.fuel_efficiency ? `${Number(record.fuel_efficiency).toFixed(2)} km/L` : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Vehicle & Job Cards */}
        <div className="space-y-6">
          {/* Maintained Vehicle Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assigned Vehicle
              </h3>
              {vehicleData && (
                <Link
                  href={`/dashboard/vehicles/${vehicleData.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View Vehicle &rarr;
                </Link>
              )}
            </div>
            <div className="mt-3">
              {vehicleData ? (
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-900">{vehicleDisplay}</p>
                  {vehicleData.vehicle_type && (
                    <p className="text-xs text-slate-500">Model: {vehicleData.vehicle_type}</p>
                  )}
                  {vehicleData.current_mileage !== null && vehicleData.current_mileage !== undefined && (
                    <p className="text-xs text-slate-500">
                      Odometer: {vehicleData.current_mileage.toLocaleString()} km
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Vehicle details unavailable.</p>
              )}
            </div>
          </div>

          {/* Job Card (if assigned) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dispatch Assignment
              </h3>
              {jobData && (
                <Link
                  href={`/dashboard/jobs/${jobData.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View Job &rarr;
                </Link>
              )}
            </div>
            <div className="mt-3">
              {jobData ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{jobData.cdo_number}</p>
                  <p className="mt-1 text-xs text-slate-500">Associated delivery order</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No dispatch job associated with this fill-up.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
