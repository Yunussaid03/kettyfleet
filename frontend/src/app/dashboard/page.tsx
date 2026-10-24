import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateExpiry } from "./compliance/types";
import { renderDocTypeBadge, renderExpiryBadge } from "./compliance/formatters";

interface RecentJob {
  id: string;
  cdo_number: string;
  status: string;
  start_date: string | null;
  created_at: string | null;
  client: { client_name: string } | { client_name: string }[] | null;
  vehicle:
    | { vehicle_code: string | null; registration_number: string }
    | { vehicle_code: string | null; registration_number: string }[]
    | null;
  driver: { full_name: string } | { full_name: string }[] | null;
}

function getClientName(client: RecentJob["client"]): string {
  if (!client) return "Unassigned";
  const c = Array.isArray(client) ? client[0] : client;
  return c?.client_name ?? "Unassigned";
}

function getVehicleDisplay(vehicle: RecentJob["vehicle"]): string {
  if (!vehicle) return "Unassigned";
  const v = Array.isArray(vehicle) ? vehicle[0] : vehicle;
  if (!v) return "Unassigned";
  return v.vehicle_code ? v.vehicle_code : v.registration_number;
}

function getDriverName(driver: RecentJob["driver"]): string {
  if (!driver) return "Unassigned";
  const d = Array.isArray(driver) ? driver[0] : driver;
  return d?.full_name ?? "Unassigned";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not set";
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

function renderStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "active") {
    return (
      <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
        In Transit
      </span>
    );
  }
  if (s === "scheduled") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        Scheduled
      </span>
    );
  }
  if (s === "completed") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Completed
      </span>
    );
  }
  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
      {status}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch current user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Concurrent operational data fetching across all implemented modules
  const [
    vehiclesRes,
    clientsRes,
    jobsRes,
    recentJobsRes,
    maintenanceRes,
    fuelRes,
    insuranceRes,
    inspectionRes,
    speedGovRes,
    rslRes,
  ] = await Promise.all([
    supabase.from("vehicles").select("id, status, current_mileage"),
    supabase.from("clients").select("id, client_type"),
    supabase.from("jobs").select("id, status"),
    supabase
      .from("jobs")
      .select(`
        id,
        cdo_number,
        status,
        start_date,
        created_at,
        client:clients(id, client_name),
        vehicle:vehicles(id, vehicle_code, registration_number),
        driver:profiles!driver_id(id, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("maintenance_records").select("id, cost, maintencance_date"),
    supabase
      .from("fuel_records")
      .select("id, fuel_amount_litres, fuel_cost_per_litres, km_covered, odometer_before, odometer_after"),
    supabase
      .from("insurance_records")
      .select("id, vehicle_id, insurance_company, expiry_date, status, vehicle:vehicles(id, vehicle_code, registration_number)"),
    supabase
      .from("inspection_records")
      .select("id, vehicle_id, inspection_center, result, expiry_date, vehicle:vehicles(id, vehicle_code, registration_number)"),
    supabase
      .from("speed_governor_records")
      .select("id, vehicle_id, vendor, expiry_date, status, vehicle:vehicles(id, vehicle_code, registration_number)"),
    supabase
      .from("rsl_records")
      .select("id, vehicle_id, issuing_authority, valid_until, status, vehicle:vehicles(id, vehicle_code, registration_number)"),
  ]);

  // 1. Vehicles Analytics
  const vehicles = vehiclesRes.data ?? [];
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;

  // 2. Clients Analytics
  const totalClients = clientsRes.data?.length ?? 0;

  // 3. Jobs Analytics
  const allJobs = jobsRes.data ?? [];
  const inTransitCount = allJobs.filter((j) => j.status?.toLowerCase() === "active").length;
  const scheduledCount = allJobs.filter((j) => j.status?.toLowerCase() === "scheduled").length;

  const recentJobs = (recentJobsRes.data as unknown as RecentJob[]) ?? [];

  // 3. Financial Analytics (Maintenance & Fuel)
  const maintenanceRecords = maintenanceRes.data ?? [];
  const totalMaintenanceExpenditure = maintenanceRecords.reduce(
    (sum, m) => sum + (Number(m.cost) || 0),
    0
  );

  const fuelRecords = fuelRes.data ?? [];
  const totalFuelLitres = fuelRecords.reduce(
    (sum, f) => sum + (Number(f.fuel_amount_litres) || 0),
    0
  );
  const totalFuelExpenditure = fuelRecords.reduce(
    (sum, f) =>
      sum +
      (Number(f.fuel_amount_litres) || 0) * (Number(f.fuel_cost_per_litres) || 0),
    0
  );

  // 4. Compliance Expiry Aggregation
  const today = new Date();
  interface ComplianceAlert {
    id: string;
    type: "insurance" | "inspection" | "speed_governor" | "rsl";
    label: string;
    vehicleDisplay: string;
    expiryDate: string;
    daysRemaining: number | null;
    status: "expired" | "expiring_soon" | "valid" | "unknown";
  }

  const complianceAlerts: ComplianceAlert[] = [];

  function getVehicleLabel(v: unknown): string {
    if (!v) return "Unknown Vehicle";
    const item = Array.isArray(v)
      ? (v[0] as { vehicle_code?: string | null; registration_number?: string } | undefined)
      : (v as { vehicle_code?: string | null; registration_number?: string });
    return item?.vehicle_code
      ? `${item.vehicle_code} (${item.registration_number})`
      : item?.registration_number || "Unknown Vehicle";
  }

  // Insurance
  for (const item of insuranceRes.data ?? []) {
    const exp = calculateExpiry(item.expiry_date, today);
    if (exp.status === "expired" || exp.status === "expiring_soon") {
      complianceAlerts.push({
        id: item.id,
        type: "insurance",
        label: item.insurance_company,
        vehicleDisplay: getVehicleLabel(item.vehicle),
        expiryDate: item.expiry_date,
        daysRemaining: exp.daysRemaining,
        status: exp.status,
      });
    }
  }

  // Inspection
  for (const item of inspectionRes.data ?? []) {
    const exp = calculateExpiry(item.expiry_date, today);
    if (exp.status === "expired" || exp.status === "expiring_soon") {
      complianceAlerts.push({
        id: item.id,
        type: "inspection",
        label: item.inspection_center || "Inspection",
        vehicleDisplay: getVehicleLabel(item.vehicle),
        expiryDate: item.expiry_date || "—",
        daysRemaining: exp.daysRemaining,
        status: exp.status,
      });
    }
  }

  // Speed Governor
  for (const item of speedGovRes.data ?? []) {
    const exp = calculateExpiry(item.expiry_date, today);
    if (exp.status === "expired" || exp.status === "expiring_soon") {
      complianceAlerts.push({
        id: item.id,
        type: "speed_governor",
        label: item.vendor,
        vehicleDisplay: getVehicleLabel(item.vehicle),
        expiryDate: item.expiry_date || "—",
        daysRemaining: exp.daysRemaining,
        status: exp.status,
      });
    }
  }

  // RSL
  for (const item of rslRes.data ?? []) {
    const exp = calculateExpiry(item.valid_until, today);
    if (exp.status === "expired" || exp.status === "expiring_soon") {
      complianceAlerts.push({
        id: item.id,
        type: "rsl",
        label: `RSL: ${item.issuing_authority || "NTSA"}`,
        vehicleDisplay: getVehicleLabel(item.vehicle),
        expiryDate: item.valid_until,
        daysRemaining: exp.daysRemaining,
        status: exp.status,
      });
    }
  }

  // Sort compliance alerts: expired first, then ascending by daysRemaining
  complianceAlerts.sort((a, b) => {
    if (a.status === "expired" && b.status !== "expired") return -1;
    if (b.status === "expired" && a.status !== "expired") return 1;
    return (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0);
  });

  const totalComplianceDocs =
    (insuranceRes.data?.length ?? 0) +
    (inspectionRes.data?.length ?? 0) +
    (speedGovRes.data?.length ?? 0) +
    (rslRes.data?.length ?? 0);

  const expiredCount = complianceAlerts.filter((a) => a.status === "expired").length;
  const expiringSoonCount = complianceAlerts.filter(
    (a) => a.status === "expiring_soon"
  ).length;

  // Header Greeting
  const hour = today.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name
    ? profile.full_name.split(" ")[0]
    : "Operator";

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time fleet performance, operational dispatch, expenditures, and statutory compliance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-lg border border-slate-200/80 bg-white px-3.5 py-1.5 text-right sm:block shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations Center
            </p>
            <p className="text-xs font-semibold text-slate-700">{formattedDate}</p>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="-ml-0.5 mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Dispatch Job
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics: 4 Columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Fleet */}
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
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Fleet Assets</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalVehicles}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">
              {activeVehicles} ready for dispatch
            </span>
            <Link
              href="/dashboard/vehicles"
              className="text-blue-600 hover:underline"
            >
              View fleet &rarr;
            </Link>
          </div>
        </div>

        {/* Card 2: Active Dispatch Jobs */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Jobs</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {inTransitCount + scheduledCount}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              For {totalClients} client accounts
            </span>
            <Link href="/dashboard/jobs" className="text-blue-600 hover:underline">
              All jobs &rarr;
            </Link>
          </div>
        </div>

        {/* Card 3: Fuel & Energy Cost */}
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
                  d="M4 4v16a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1zm10 4h2a2 2 0 012 2v8a2 2 0 002 2h0a2 2 0 002-2V8l-3-3M7 8h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Fuel Expenditure</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                KES {totalFuelExpenditure.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{totalFuelLitres.toLocaleString("en-US", { maximumFractionDigits: 1 })} Litres logged</span>
            <Link href="/dashboard/fuel" className="text-blue-600 hover:underline">
              Fuel logs &rarr;
            </Link>
          </div>
        </div>

        {/* Card 4: Statutory Compliance Status */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                expiredCount > 0
                  ? "bg-rose-50 text-rose-600"
                  : expiringSoonCount > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
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
              <p className="text-xs font-medium text-slate-500">Compliance</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalComplianceDocs} <span className="text-xs font-normal text-slate-500">docs</span>
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            {expiredCount > 0 ? (
              <span className="font-semibold text-rose-600">
                {expiredCount} expired &bull; {expiringSoonCount} due soon
              </span>
            ) : expiringSoonCount > 0 ? (
              <span className="font-semibold text-amber-600">
                {expiringSoonCount} expiring within 30d
              </span>
            ) : (
              <span className="font-semibold text-emerald-600">
                All tracked documents valid
              </span>
            )}
            <Link
              href="/dashboard/compliance"
              className="text-blue-600 hover:underline"
            >
              Audit &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Operational Tables & Side Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Recent Jobs & Operational Dispatch */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Jobs Table Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Dispatch Activity
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time Customer Delivery Orders (CDO) and vehicle routing
                </p>
              </div>
              <Link
                href="/dashboard/jobs"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View all jobs &rarr;
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">
                  No active jobs found in the dispatch log.
                </p>
                <Link
                  href="/dashboard/jobs/new"
                  className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
                >
                  Create your first job &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3">CDO Number</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Scheduled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {recentJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="font-semibold text-slate-900 transition-colors hover:text-blue-600 hover:underline"
                          >
                            {job.cdo_number}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {getClientName(job.client)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                          {getVehicleDisplay(job.vehicle)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {getDriverName(job.driver)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {renderStatusBadge(job.status)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5 text-right text-xs text-slate-500">
                          {formatDate(job.start_date ?? job.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Operational Expenses Summary (Maintenance & Fuel Combined) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Fleet Operating Costs
                </h2>
                <p className="text-xs text-slate-500">
                  Recorded maintenance repairs and fuel consumption
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Total: KES {(totalMaintenanceExpenditure + totalFuelExpenditure).toLocaleString("en-KE", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Workshop Maintenance</span>
                  <Link href="/dashboard/maintenance" className="text-xs text-blue-600 hover:underline">
                    View Logs &rarr;
                  </Link>
                </div>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  KES {totalMaintenanceExpenditure.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Across {maintenanceRecords.length} recorded repairs and services
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Fuel Refuels</span>
                  <Link href="/dashboard/fuel" className="text-xs text-blue-600 hover:underline">
                    View Logs &rarr;
                  </Link>
                </div>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  KES {totalFuelExpenditure.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {totalFuelLitres.toLocaleString("en-US", { maximumFractionDigits: 1 })} Litres in {fuelRecords.length} fill-up logs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Compliance Expiry Watch & Quick Links */}
        <div className="space-y-6">
          {/* Compliance Expiry Watchlist */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Statutory Expiry Watch
                </h2>
                <p className="text-xs text-slate-500">
                  Documents requiring renewal attention
                </p>
              </div>
              <Link
                href="/dashboard/compliance"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                All &rarr;
              </Link>
            </div>

            {complianceAlerts.length === 0 ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-800">
                  Fleet Fully Compliant
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  No expired or critical upcoming documents.
                </p>
              </div>
            ) : (
              <div className="mt-3 divide-y divide-slate-100">
                {complianceAlerts.slice(0, 5).map((alert, idx) => (
                  <div key={`${alert.type}-${alert.id}-${idx}`} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/dashboard/compliance/${alert.type}/${alert.id}`}
                        className="text-xs font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {alert.vehicleDisplay}
                      </Link>
                      {renderDocTypeBadge(alert.type)}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-slate-500 truncate max-w-[140px]">
                        {alert.label}
                      </span>
                      {renderExpiryBadge(alert.status, alert.daysRemaining)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Operations Actions */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Operations Shortcuts
            </h2>

            <div className="mt-3 space-y-2">
              <Link
                href="/dashboard/jobs/new"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Dispatch New Job</p>
                    <p className="text-[11px] text-slate-400">CDO delivery order</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600">&rarr;</span>
              </Link>

              <Link
                href="/dashboard/fuel/new"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1zm10 4h2a2 2 0 012 2v8a2 2 0 002 2h0a2 2 0 002-2V8l-3-3M7 8h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Log Fuel Fill-Up</p>
                    <p className="text-[11px] text-slate-400">Record station transaction</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600">&rarr;</span>
              </Link>

              <Link
                href="/dashboard/maintenance/new"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Add Service Log</p>
                    <p className="text-[11px] text-slate-400">Workshop &amp; repairs</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600">&rarr;</span>
              </Link>

              <Link
                href="/dashboard/compliance/new"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">File Compliance</p>
                    <p className="text-[11px] text-slate-400">Insurance, NTSA &amp; RSL</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}