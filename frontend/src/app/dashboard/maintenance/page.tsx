import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface MaintenanceRow {
  id: string;
  vehicle_id: string;
  maintencance_date: string;
  item_type: string;
  description: string | null;
  cost: number;
  payment_method: string | null;
  service_provider: string | null;
  mechanic_name: string | null;
  odometer_at_service: number | null;
  notes: string | null;
  created_at: string;
  vehicle:
    | { id: string; vehicle_code: string | null; registration_number: string; vehicle_type: string | null }
    | { id: string; vehicle_code: string | null; registration_number: string; vehicle_type: string | null }[]
    | null;
}

function getVehicleDisplay(vehicle: MaintenanceRow["vehicle"]): string {
  if (!vehicle) return "—";
  const v = Array.isArray(vehicle) ? vehicle[0] : vehicle;
  if (!v) return "—";
  return v.vehicle_code ? `${v.vehicle_code} (${v.registration_number})` : v.registration_number;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function MaintenancePage() {
  const supabase = await createClient();

  const { data: recordsData, error } = await supabase
    .from("maintenance_records")
    .select(`
      id,
      vehicle_id,
      maintencance_date,
      item_type,
      description,
      cost,
      payment_method,
      service_provider,
      mechanic_name,
      odometer_at_service,
      notes,
      created_at,
      vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type)
    `)
    .order("maintencance_date", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Failed to load maintenance records.</p>
        <p className="mt-1 text-xs text-red-600">Please try refreshing the page or check your database permissions.</p>
      </div>
    );
  }

  const records = (recordsData ?? []) as unknown as MaintenanceRow[];

  const totalRecords = records.length;
  const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
  const uniqueVehiclesServiced = new Set(records.map((r) => r.vehicle_id)).size;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Fleet Maintenance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Log and manage vehicle servicing, repairs, parts replacement, and workshop costs.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/maintenance/new"
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
            Add Maintenance
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Service Logs */}
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Service Logs</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalRecords}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Total recorded maintenance jobs</p>
        </div>

        {/* Total Cost */}
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
              <p className="text-xs font-medium text-slate-500">Total Expenditure</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-600">Cumulative fleet repair cost</p>
        </div>

        {/* Vehicles Serviced */}
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
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Vehicles Serviced</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {uniqueVehiclesServiced}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Unique fleet units maintained</p>
        </div>
      </div>

      {/* Table Container Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Maintenance History</h2>
          <p className="text-xs text-slate-500">Complete log of vehicle service records and workshop invoices</p>
        </div>

        {totalRecords === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No maintenance records have been logged yet.</p>
            <Link
              href="/dashboard/maintenance/new"
              className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
            >
              Log your first service record &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-4 py-3">Service Date</th>
                  <th className="px-4 py-3">Item / Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Odometer</th>
                  <th className="px-4 py-3">Provider / Mechanic</th>
                  <th className="px-6 py-3 text-right">Cost (KES)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <Link
                        href={`/dashboard/maintenance/${record.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {getVehicleDisplay(record.vehicle)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                      {formatDate(record.maintencance_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                        {record.item_type}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-slate-600">
                      {record.description || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                      {record.odometer_at_service !== null && record.odometer_at_service !== undefined
                        ? `${record.odometer_at_service.toLocaleString()} km`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {record.service_provider || record.mechanic_name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right font-medium text-slate-900">
                      {formatCurrency(Number(record.cost) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
