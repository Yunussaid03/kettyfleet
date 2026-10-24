import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
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
      notes,
      created_at,
      client:clients(id, client_name, client_type, phone),
      vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type),
      driver:profiles!driver_id(id, full_name, phone)
    `)
    .eq("id", id)
    .single();

  if (error || !job) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Jobs
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Job not found.</p>
          <p className="mt-1 text-xs text-red-600">The dispatch job may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  const clientData = Array.isArray(job.client) ? job.client[0] : job.client;
  const vehicleData = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;
  const driverData = Array.isArray(job.driver) ? job.driver[0] : job.driver;

  const vehicleDisplay = vehicleData
    ? vehicleData.vehicle_code
      ? `${vehicleData.vehicle_code} — ${vehicleData.registration_number}`
      : vehicleData.registration_number
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Jobs
        </Link>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {job.cdo_number}
              </h1>
              {renderJobStatusBadge(job.status)}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Customer Delivery Order &bull; Job Type: <span className="font-medium text-slate-700">{job.job_type ?? "Standard Dispatch"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/jobs/${id}/edit`}
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
              Edit Job
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns for Job Spec Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Schedule, Route & Assignments */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dispatch Assignment & Schedule Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Dispatch &amp; Schedule</h2>
              <p className="text-xs text-slate-500">Operations timing and delivery tracking</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    CDO Number
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {job.cdo_number}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Job Status
                  </dt>
                  <dd className="mt-1">
                    {renderJobStatusBadge(job.status)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Job Classification
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {job.job_type ?? "Not Provided"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Created In System
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(job.created_at)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Start / Departure Date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(job.start_date)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Expected Completion Date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(job.end_date)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Route & Location Details */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Route &amp; Destination</h2>
              <p className="text-xs text-slate-500">Pickup origin and destination delivery point</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Pickup Location
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {job.pickup_location ?? <span className="font-normal text-slate-400">Not Provided</span>}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Destination
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {job.destination ?? <span className="font-normal text-slate-400">Not Provided</span>}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Job Notes &amp; Special Instructions
                  </dt>
                  <dd className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700">
                    {job.notes ? (
                      <p className="whitespace-pre-line">{job.notes}</p>
                    ) : (
                      <span className="text-slate-400">No additional notes recorded for this job.</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Client, Vehicle, Driver Cards */}
        <div className="space-y-6">
          {/* Client Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Client Profile
              </h3>
              {clientData && (
                <Link
                  href={`/dashboard/clients/${clientData.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View Client &rarr;
                </Link>
              )}
            </div>
            <div className="mt-3">
              {clientData ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{clientData.client_name}</p>
                  {clientData.phone && (
                    <p className="mt-1 text-xs text-slate-500">Tel: {clientData.phone}</p>
                  )}
                  {clientData.client_type && (
                    <span className="mt-2 inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-2xs font-medium text-blue-700 capitalize">
                      {clientData.client_type}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No client assigned to this job.</p>
              )}
            </div>
          </div>

          {/* Vehicle Card */}
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
                <div>
                  <p className="text-sm font-bold text-slate-900">{vehicleDisplay}</p>
                  {vehicleData.vehicle_type && (
                    <p className="mt-1 text-xs text-slate-500">{vehicleData.vehicle_type}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No vehicle assigned to this job.</p>
              )}
            </div>
          </div>

          {/* Driver Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assigned Driver
              </h3>
            </div>
            <div className="mt-3">
              {driverData ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{driverData.full_name}</p>
                  {driverData.phone && (
                    <p className="mt-1 text-xs text-slate-500">Tel: {driverData.phone}</p>
                  )}
                  <span className="mt-2 inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-2xs font-medium text-emerald-700">
                    Designated Driver
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No driver assigned to this job.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
