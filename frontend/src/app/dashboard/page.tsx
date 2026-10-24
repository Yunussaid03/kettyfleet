import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        In Transit
      </span>
    );
  }
  if (s === "scheduled") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        Scheduled
      </span>
    );
  }
  if (s === "completed") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        Completed
      </span>
    );
  }
  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
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

  // Fetch vehicles summary
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, status");

  const totalVehicles = vehicles?.length ?? 0;
  const activeVehicles =
    vehicles?.filter((v) => v.status === "active").length ?? 0;
  const maintenanceVehicles =
    vehicles?.filter((v) => v.status === "maintenance").length ?? 0;
  const inactiveVehicles =
    vehicles?.filter(
      (v) => v.status === "inactive" || v.status === "sold"
    ).length ?? 0;

  // Fetch clients summary
  const { data: clients } = await supabase.from("clients").select("id");
  const totalClients = clients?.length ?? 0;

  // Fetch jobs summary
  const { data: allJobs } = await supabase.from("jobs").select("id, status");
  const activeJobsCount =
    allJobs?.filter((j) => j.status === "active" || j.status === "scheduled")
      .length ?? 0;
  const scheduledCount =
    allJobs?.filter((j) => j.status === "scheduled").length ?? 0;

  // Fetch recent jobs with joined details
  const { data: recentJobsData } = await supabase
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
    .limit(5);

  const recentJobs = (recentJobsData as unknown as RecentJob[]) ?? [];

  // Determine friendly greeting and name
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name
    ? profile.full_name.split(" ")[0]
    : "there";

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your fleet today.
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Operations Date
          </p>
          <p className="text-sm font-medium text-slate-700">{formattedDate}</p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Vehicles */}
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
              <p className="text-xs font-medium text-slate-500">Total Vehicles</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalVehicles}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-600">
            {activeVehicles} active in fleet
          </p>
        </div>

        {/* Total Clients */}
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Clients</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalClients}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Registered partner accounts
          </p>
        </div>

        {/* Active Jobs */}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Jobs</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {activeJobsCount}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-blue-600">
            {scheduledCount} scheduled for dispatch
          </p>
        </div>

        {/* Needs Attention */}
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Needs Attention
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {maintenanceVehicles}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-amber-600">
            Vehicles in maintenance
          </p>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Recent Jobs - 2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Jobs
                </h2>
                <p className="text-xs text-slate-500">
                  Latest dispatch and transport assignments
                </p>
              </div>
              <Link
                href="/dashboard/jobs"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View all &rarr;
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">
                  No jobs have been created yet.
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
                      <th className="px-6 py-3">Date</th>
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
                            className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
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
                        <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-500">
                          {formatDate(job.start_date ?? job.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Quick Actions & Fleet Summary - 1 col) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Quick Actions
              </h2>
              <Link
                href="/dashboard/jobs/new"
                className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                + Add Job
              </Link>
            </div>

            <div className="mt-2 space-y-2.5">
              <Link
                href="/dashboard/vehicles/new"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                      Add Vehicle
                    </p>
                    <p className="text-xs text-slate-400">
                      Register new fleet asset
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                href="/dashboard/clients/new"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                      Add Client
                    </p>
                    <p className="text-xs text-slate-400">
                      Onboard partner or customer
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                href="/dashboard/reports"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-purple-50 group-hover:text-purple-600">
                    <svg
                      className="h-5 w-5"
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
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                      View Reports
                    </p>
                    <p className="text-xs text-slate-400">
                      Operations & analytics
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Fleet Status Summary Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Fleet Availability
              </h2>
              <Link
                href="/dashboard/vehicles"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Manage &rarr;
              </Link>
            </div>

            <div className="mt-3 space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">Active</span>
                </div>
                <span className="font-bold text-slate-900">
                  {activeVehicles} vehicles
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-medium text-slate-700">
                    Maintenance
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  {maintenanceVehicles} vehicles
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-medium text-slate-700">
                    Inactive / Sold
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  {inactiveVehicles} vehicles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}