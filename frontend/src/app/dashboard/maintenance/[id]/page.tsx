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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function MaintenanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: record, error } = await supabase
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
      vehicle:vehicles(id, vehicle_code, registration_number, vehicle_type, status, current_mileage)
    `)
    .eq("id", id)
    .single();

  if (error || !record) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/maintenance"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Maintenance
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Maintenance record not found.</p>
          <p className="mt-1 text-xs text-red-600">The record may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  const vehicleData = Array.isArray(record.vehicle) ? record.vehicle[0] : record.vehicle;
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
          href="/dashboard/maintenance"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Maintenance
        </Link>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {record.item_type}
              </h1>
              <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Service Record
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Serviced on {formatDate(record.maintencance_date)} &bull; Vehicle:{" "}
              <span className="font-medium text-slate-700">{vehicleDisplay ?? "Unassigned"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/maintenance/${id}/edit`}
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
        {/* Left Column (2 Cols): Service Specification & Financials */}
        <div className="space-y-6 lg:col-span-2">
          {/* Service Details Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Service Details</h2>
              <p className="text-xs text-slate-500">Maintenance specifications and mechanical diagnostics</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Category / Item Type
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {record.item_type}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Service Date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(record.maintencance_date)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Odometer at Service
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {record.odometer_at_service !== null && record.odometer_at_service !== undefined
                      ? `${record.odometer_at_service.toLocaleString()} km`
                      : "Not Recorded"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Log Entry Timestamp
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(record.created_at)}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Work Description
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {record.description || "No specific work description recorded."}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Notes &amp; Warranty Details
                  </dt>
                  <dd className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700">
                    {record.notes ? (
                      <p className="whitespace-pre-line">{record.notes}</p>
                    ) : (
                      <span className="text-slate-400">No additional notes or warranty information recorded.</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Workshop & Payment Details */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Workshop &amp; Financials</h2>
              <p className="text-xs text-slate-500">Service provider, personnel, and payment method</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Service Cost
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(Number(record.cost) || 0)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Payment Method
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {record.payment_method || "Not Specified"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Service Provider / Garage
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {record.service_provider || "Not Specified"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Lead Mechanic
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {record.mechanic_name || "Not Specified"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Vehicle Profile Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Maintained Vehicle
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
                      Current Mileage: {vehicleData.current_mileage.toLocaleString()} km
                    </p>
                  )}
                  {vehicleData.status && (
                    <span className="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700 capitalize">
                      Fleet Status: {vehicleData.status}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Vehicle details unavailable.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
