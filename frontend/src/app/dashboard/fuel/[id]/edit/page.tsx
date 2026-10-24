import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditFuelRecordForm from "./EditFuelRecordForm";

export default async function EditFuelRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("fuel_records")
    .select(`
      id,
      vehicle_id,
      job_id,
      fillup_date,
      odometer_before,
      odometer_after,
      fuel_amount_litres,
      fuel_cost_per_litres,
      km_covered,
      fuel_efficiency,
      fuel_station,
      invoice_number,
      notes,
      vehicle:vehicles(id, vehicle_code, registration_number)
    `)
    .eq("id", id)
    .single();

  if (error || !record) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/fuel"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Fuel Records
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Fuel record not found.</p>
          <p className="mt-1 text-xs text-red-600">The record may have been removed or does not exist.</p>
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
          href={`/dashboard/fuel/${record.id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Fuel Record Details
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Fuel Record
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Editing fill-up log for <span className="font-medium text-slate-700">{vehicleLabel}</span> &bull; {record.fillup_date}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <EditFuelRecordForm record={record} />
      </div>
    </div>
  );
}
