import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditVehicleForm from "@/components/vehicles/EditVehicleForm";

export default async function EditVehiclePage({
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
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/vehicles/${id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Vehicle Details
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Vehicle
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Editing vehicle <span className="font-medium text-slate-700">{vehicle.vehicle_code}</span> &bull; {vehicle.registration_number}
          </p>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="max-w-3xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <EditVehicleForm vehicle={vehicle} />
      </div>
    </div>
  );
}