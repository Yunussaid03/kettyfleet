import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface JobRow {
  id: string;
  cdo_number: string;
  status: string;
  job_type: string | null;
  start_date: string | null;
  end_date: string | null;
  pickup_location: string | null;
  destination: string | null;
  client: { client_name: string } | { client_name: string }[] | null;
  vehicle:
    | { vehicle_code: string | null; registration_number: string }
    | { vehicle_code: string | null; registration_number: string }[]
    | null;
  driver: { full_name: string } | { full_name: string }[] | null;
}

function getClientName(client: JobRow["client"]): string {
  if (!client) return "—";
  const c = Array.isArray(client) ? client[0] : client;
  return c?.client_name ?? "—";
}

function getVehicleDisplay(vehicle: JobRow["vehicle"]): string {
  if (!vehicle) return "—";
  const v = Array.isArray(vehicle) ? vehicle[0] : vehicle;
  if (!v) return "—";
  return v.vehicle_code ? `${v.vehicle_code} (${v.registration_number})` : v.registration_number;
}

function getDriverName(driver: JobRow["driver"]): string {
  if (!driver) return "—";
  const d = Array.isArray(driver) ? driver[0] : driver;
  return d?.full_name ?? "—";
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

function renderJobStatusBadge(status: string) {
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

export default async function JobsPage() {
  const supabase = await createClient();

  const { data: jobsData, error } = await supabase
    .from("jobs")
    .select(`
      id,
      cdo_number,
      status,
      job_type,
      start_date,
      end_date,
      pickup_location,
      destination,
      client:clients(id, client_name),
      vehicle:vehicles(id, vehicle_code, registration_number),
      driver:profiles!driver_id(id, full_name)
    `)
    .order("start_date", { ascending: true });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Failed to load dispatch jobs.</p>
        <p className="mt-1 text-xs text-red-600">Please try refreshing the page or check your database permissions.</p>
      </div>
    );
  }

  const jobs = (jobsData ?? []) as unknown as JobRow[];

  const totalJobs = jobs.length;
  const inTransitJobs = jobs.filter((j) => j.status?.toLowerCase() === "active").length;
  const scheduledJobs = jobs.filter((j) => j.status?.toLowerCase() === "scheduled").length;
  const completedJobs = jobs.filter((j) => j.status?.toLowerCase() === "completed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Jobs &amp; Dispatch
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage dispatch assignments, customer delivery orders (CDO), vehicles, and drivers.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/jobs/new"
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
            Add Job
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Jobs */}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Assignments</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalJobs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Total recorded CDO jobs</p>
        </div>

        {/* Scheduled Jobs */}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Scheduled</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {scheduledJobs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-amber-600">Pending dispatch departure</p>
        </div>

        {/* In Transit */}
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
              <p className="text-xs font-medium text-slate-500">In Transit</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {inTransitJobs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-blue-600">Currently active on road</p>
        </div>

        {/* Completed */}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Completed</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {completedJobs}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-600">Successfully closed jobs</p>
        </div>
      </div>

      {/* Table Container Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Dispatch Assignments</h2>
          <p className="text-xs text-slate-500">Overview of all Customer Delivery Orders and scheduled transfers</p>
        </div>

        {totalJobs === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No jobs have been added yet.</p>
            <Link
              href="/dashboard/jobs/new"
              className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
            >
              Add your first job &rarr;
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
                  <th className="px-4 py-3">Route</th>
                  <th className="px-6 py-3">Start Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {jobs.map((job) => {
                  const hasRoute = Boolean(job.pickup_location || job.destination);
                  const routeDisplay = hasRoute
                    ? `${job.pickup_location ?? "?"} → ${job.destination ?? "?"}`
                    : "—";

                  return (
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
                        {renderJobStatusBadge(job.status)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                        {routeDisplay}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-500">
                        {formatDate(job.start_date)}
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