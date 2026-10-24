import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditMaintenanceForm from "./EditMaintenanceForm";

export default async function EditMaintenancePage({
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
      vehicle:vehicles(id, vehicle_code, registration_number)
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
          <p className="mt-1 text-xs text-red-600">The maintenance record may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  const vehicleData = Array.isArray(record.vehicle) ? record.vehicle[0] : record.vehicle;
  const vehicleLabel = vehicleData
    ? vehicleData.vehicle_code
      ? `${vehicleData.vehicle_code} — ${vehicleData.registration_number}`
      : vehicleData.registration_number
    : "Vehicle";

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/maintenance/${record.id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Service Details
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Maintenance Record
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Editing service log for <span className="font-medium text-slate-700">{vehicleLabel}</span> &bull; {record.item_type}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <EditMaintenanceForm record={record} />
      </div>
    </div>
  );
}
