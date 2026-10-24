import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [vehiclesRes, jobsRes, maintenanceRes, fuelRes] = await Promise.all([
    supabase.from("vehicles").select("id, status"),
    supabase.from("jobs").select("id, status"),
    supabase.from("maintenance_records").select("id, cost"),
    supabase.from("fuel_records").select("id, fuel_amount_litres, fuel_cost_per_litres"),
  ]);

  const vehicles = vehiclesRes.data ?? [];
  const jobs = jobsRes.data ?? [];
  const maintenance = maintenanceRes.data ?? [];
  const fuel = fuelRes.data ?? [];

  const totalMaintenanceCost = maintenance.reduce(
    (sum, m) => sum + (Number(m.cost) || 0),
    0
  );
  const totalFuelCost = fuel.reduce(
    (sum, f) =>
      sum +
      (Number(f.fuel_amount_litres) || 0) * (Number(f.fuel_cost_per_litres) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Fleet Operations &amp; Financial Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Executive audit summaries, operational cost distribution, and fleet utilization metrics.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Operating Expenditure</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            KES {(totalMaintenanceCost + totalFuelCost).toLocaleString("en-KE", { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-slate-400">Combined fuel &amp; workshop service</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Maintenance Repairs</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            KES {totalMaintenanceCost.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-slate-400">{maintenance.length} logged repair jobs</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Fuel Spending</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            KES {totalFuelCost.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-slate-400">{fuel.length} logged station transactions</p>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Fleet Asset Audit</h2>
              <p className="text-xs text-slate-500">Asset statuses and maintenance allocation</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600 leading-relaxed">
            Summary of all {vehicles.length} fleet units. {vehicles.filter((v) => v.status === "active").length} vehicles are active in rotation, {vehicles.filter((v) => v.status === "maintenance").length} are undergoing workshop service, and {vehicles.filter((v) => v.status === "inactive" || v.status === "sold").length} are decommissioned.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link href="/dashboard/vehicles" className="text-xs font-semibold text-blue-600 hover:underline">
              Inspect Fleet Inventory &rarr;
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Dispatch Performance</h2>
              <p className="text-xs text-slate-500">Delivery order fulfillment rates</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600 leading-relaxed">
            Tracks {jobs.length} delivery assignments. {jobs.filter((j) => j.status?.toLowerCase() === "completed").length} jobs completed, {jobs.filter((j) => j.status?.toLowerCase() === "active").length} in transit, and {jobs.filter((j) => j.status?.toLowerCase() === "scheduled").length} scheduled for upcoming departure.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link href="/dashboard/jobs" className="text-xs font-semibold text-blue-600 hover:underline">
              Review Dispatch Logs &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}