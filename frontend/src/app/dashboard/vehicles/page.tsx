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

export default async function VehiclesPage() {
  const supabase = await createClient();

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select(
      "id, vehicle_code, registration_number, vehicle_type, manufacture_year, passenger_capacity, ownership_type, status, current_mileage"
    )
    .order("vehicle_code", { ascending: true });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Failed to load vehicles.</p>
        <p className="mt-1 text-xs text-red-600">Please try refreshing the page or check your database permissions.</p>
      </div>
    );
  }

  const totalVehicles = vehicles?.length ?? 0;

  const activeVehicles = vehicles?.filter(
    (vehicle) => vehicle.status === "active"
  ).length ?? 0;

  const maintenanceVehicles = vehicles?.filter(
    (vehicle) => vehicle.status === "maintenance"
  ).length ?? 0;

  const inactiveVehicles = vehicles?.filter(
    (vehicle) => vehicle.status === "inactive" || vehicle.status === "sold"
  ).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Vehicles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your fleet inventory, vehicle status, and specifications.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/vehicles/new"
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
            Add Vehicle
          </Link>
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
          <p className="mt-3 text-xs text-slate-500">Total registered fleet units</p>
        </div>

        {/* Active Vehicles */}
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
              <p className="text-xs font-medium text-slate-500">Active</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {activeVehicles}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-600">Available for dispatch</p>
        </div>

        {/* Maintenance Vehicles */}
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
              <p className="text-xs font-medium text-slate-500">Maintenance</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {maintenanceVehicles}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-amber-600">Under service or repair</p>
        </div>

        {/* Inactive or Sold */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Inactive or Sold</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {inactiveVehicles}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Decommissioned units</p>
        </div>
      </div>

      {/* Table Container Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">All Fleet Vehicles</h2>
          <p className="text-xs text-slate-500">Complete record of registered fleet units</p>
        </div>

        {totalVehicles === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No vehicles have been added yet.</p>
            <Link
              href="/dashboard/vehicles/new"
              className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
            >
              Add your first vehicle &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3">Vehicle Code</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Vehicle Type</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Ownership</th>
                  <th className="px-4 py-3">Mileage</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {vehicle.vehicle_code}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                      {vehicle.registration_number}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {vehicle.vehicle_type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {vehicle.manufacture_year ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {vehicle.passenger_capacity ? `${vehicle.passenger_capacity} seats` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 capitalize text-slate-600">
                      {vehicle.ownership_type ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {vehicle.current_mileage !== null && vehicle.current_mileage !== undefined
                        ? `${vehicle.current_mileage.toLocaleString()} km`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      {renderVehicleStatusBadge(vehicle.status)}
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