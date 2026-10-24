import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function renderVehicleStatusBadge(status: string | null) {
  const s = status?.toLowerCase() ?? "unknown";
  if (s === "active") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 capitalize">
        Active
      </span>
    );
  }
  if (s === "maintenance") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 capitalize">
        Maintenance
      </span>
    );
  }
  if (s === "sold") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 capitalize">
        Sold
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
      {status ?? "Unknown"}
    </span>
  );
}

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !vehicle) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/vehicles"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Vehicles
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Vehicle not found.</p>
          <p className="mt-1 text-xs text-red-600">The vehicle may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div>
        <Link
          href="/dashboard/vehicles"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Vehicles
        </Link>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {vehicle.vehicle_code}
              </h1>
              {renderVehicleStatusBadge(vehicle.status)}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Registration: <span className="font-medium text-slate-700">{vehicle.registration_number}</span> &bull; {vehicle.vehicle_type}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/vehicles/${id}/edit`}
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
              Edit Vehicle
            </Link>
          </div>
        </div>
      </div>

      {/* Specifications & Details Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Vehicle Specifications</h2>
          <p className="text-xs text-slate-500">Technical specifications and registration profile</p>
        </div>

        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Vehicle Code
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {vehicle.vehicle_code}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Registration Number
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {vehicle.registration_number}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Vehicle Type / Model
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {vehicle.vehicle_type}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Status
              </dt>
              <dd className="mt-1">
                {renderVehicleStatusBadge(vehicle.status)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Manufacture Year
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {vehicle.manufacture_year ?? "Not Provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Passenger Capacity
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {vehicle.passenger_capacity ? `${vehicle.passenger_capacity} seats` : "Not Provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Ownership Type
              </dt>
              <dd className="mt-1 text-sm font-medium capitalize text-slate-800">
                {vehicle.ownership_type ?? "Not Provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Current Mileage
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {vehicle.current_mileage !== null && vehicle.current_mileage !== undefined
                  ? `${vehicle.current_mileage.toLocaleString()} km`
                  : "Not Provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Category
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {vehicle.category ?? "Not Provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Logbook Number
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {vehicle.logbook_number ?? "Not Provided"}
              </dd>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Notes & Remarks
              </dt>
              <dd className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700">
                {vehicle.notes ?? "No additional notes recorded for this vehicle."}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}