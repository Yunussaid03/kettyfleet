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
      <p className="text-red-600">
        Vehicle not found.
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Edit Vehicle
      </h1>

      <p className="mt-3 text-gray-600">
        Editing: {vehicle.vehicle_code} —{" "}
        {vehicle.registration_number}
      </p>

      <EditVehicleForm vehicle={vehicle} />
    </div>
  );
}