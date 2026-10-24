import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface FuelRecordRow {
  id: string;
  vehicle_id: string;
  job_id: string | null;
  fillup_date: string;
  odometer_before: number;
  odometer_after: number;
  fuel_amount_litres: number;
  fuel_cost_per_litres: number;
  km_covered: number | null;
  fuel_efficiency: number | null;
  fuel_station: string | null;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
  vehicle:
    | { id: string; vehicle_code: string | null; registration_number: string; vehicle_type: string | null }
    | { id: string; vehicle_code: string | null; registration_number: string; vehicle_type: string | null }[]
    | null;
  job:
    | { id: string; cdo_number: string }
    | { id: string; cdo_number: string }[]
    | null;
}

function getVehicleDisplay(vehicle: FuelRecordRow["vehicle"]): string {
  if (!vehicle) return "—";
  const v = Array.isArray(vehicle) ? vehicle[0] : vehicle;
  if (!v) return "—";
  return v.vehicle_code ? `${v.vehicle_code} (${v.registration_number})` : v.registration_number;
}

function getJobDisplay(job: FuelRecordRow["job"]): string {
  if (!job) return "—";
  const j = Array.isArray(job) ? job[0] : job;
  return j?.cdo_number ?? "—";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
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

export default async function FuelRecordsPage() {
  const supabase = await createClient();

  const { data: recordsData, error } = await supabase
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
      vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type),
      job:jobs(id, cdo_number)
    `)
    .order("fillup_date", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Failed to load fuel records.</p>
        <p className="mt-1 text-xs text-red-600">Please try refreshing the page or check your database permissions.</p>
      </div>
    );
  }

  const records = (recordsData ?? []) as unknown as FuelRecordRow[];

  const totalLogs = records.length;
  const totalLitres = records.reduce((sum, r) => sum + (Number(r.fuel_amount_litres) || 0), 0);
  const totalCost = records.reduce(
    (sum, r) => sum + (Number(r.fuel_amount_litres) || 0) * (Number(r.fuel_cost_per_litres) || 0),
    0
  );
  const totalKm = records.reduce((sum, r) => {
    const km = r.km_covered !== null ? Number(r.km_covered) : Number(r.odometer_after) - Number(r.odometer_before);
    return sum + (km > 0 ? km : 0);
  }, 0);
  const avgEfficiency = totalLitres > 0 && totalKm > 0 ? totalKm / totalLitres : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Fuel Records
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Log fill-ups, track fuel consumption, fuel stations, and monitor vehicle efficiency.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/fuel/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="-ml-0.5 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Fuel Record
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Litres */}
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
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Fuel Volume</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {formatNumber(totalLitres)} <span className="text-sm font-normal text-slate-500">L</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Across {totalLogs} fill-up logs</p>
        </div>

        {/* Total Expenditure */}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Fuel Cost</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {formatNumber(totalCost)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-600">Total expenditure on fuel</p>
        </div>

        {/* Distance Covered */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Distance</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalKm.toLocaleString()} <span className="text-sm font-normal text-slate-500">km</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Recorded distance traveled</p>
        </div>

        {/* Avg Fuel Efficiency */}
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Fleet Efficiency</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {avgEfficiency > 0 ? avgEfficiency.toFixed(2) : "—"}{" "}
                <span className="text-sm font-normal text-slate-500">km/L</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-amber-600">Average fuel economy</p>
        </div>
      </div>

      {/* Table Container Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Fill-Up History</h2>
          <p className="text-xs text-slate-500">Complete record of vehicle refuel transactions and station invoices</p>
        </div>

        {totalLogs === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No fuel records have been logged yet.</p>
            <Link
              href="/dashboard/fuel/new"
              className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
            >
              Log your first fill-up &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-4 py-3">Job CDO</th>
                  <th className="px-4 py-3">Fill-Up Date</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Odometer (km)</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Efficiency</th>
                  <th className="px-6 py-3 text-right">Total Cost</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {records.map((record) => {
                  const km =
                    record.km_covered !== null
                      ? record.km_covered
                      : record.odometer_after - record.odometer_before;
                  const total =
                    (Number(record.fuel_amount_litres) || 0) * (Number(record.fuel_cost_per_litres) || 0);

                  return (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <Link
                          href={`/dashboard/fuel/${record.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                        >
                          {getVehicleDisplay(record.vehicle)}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium text-slate-700">
                        {getJobDisplay(record.job)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                        {formatDate(record.fillup_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {record.fuel_station || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                        {record.odometer_before.toLocaleString()} &rarr; {record.odometer_after.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                        {km > 0 ? `${km.toLocaleString()} km` : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                        {formatNumber(Number(record.fuel_amount_litres))} L
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                        {formatNumber(Number(record.fuel_cost_per_litres))} / L
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {record.fuel_efficiency ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {Number(record.fuel_efficiency).toFixed(2)} km/L
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right font-medium text-slate-900">
                        {formatNumber(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
