import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
                <p className="text-red-600">
                    Vehicle Not Found.
                </p>
            );
        }

    return (
        <div>
            < div className= "flex items-center justify-between">
            <h1 className="text-3xl font-bold">
                Vehicle Details
            </h1>

            <Link href={`/dashboard/vehicles/${id}/edit`}
            className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800">
                Edit Vehicle
            </Link>
            </div>
            <div className="mt-6 space-y-2">
                <p>
                    <strong>Code:</strong>{vehicle.vehicle_code}
                </p>
                <p>
                    <strong>Registration:</strong>{vehicle.registration_number}
                </p>
                <p>
                    <strong>Vehicle:</strong>{vehicle.vehicle_type}
                </p>
                <p>
                    <strong>Status:</strong>{vehicle.status}
                </p>
                <p>
                    <strong>Manufacture Year:</strong>{vehicle.manufacture_year ?? "Not Provided"}
                </p>
                <p>
                    <strong>Passenger Capacity:</strong>{vehicle.passenger_capacity ?? "Not Provided"}
                </p>
                <p>
                    <strong>Ownership:</strong>{vehicle.ownership ?? "Not Provided"}
                </p>
                <p>
                    <strong>Current Mileage:</strong>{vehicle.current_mileage ?? "Not Provided"}
                </p>
                <p>
                    <strong>Category:</strong>{vehicle.category ?? "Not Provided"}
                </p>
                <p>
                    <strong>Logbook Number:</strong>{vehicle.logbook_number ?? "Not Provided"}
                </p>
                <p>
                    <strong>Notes:</strong>{vehicle.notes ?? "Not Provided"}
                </p>
            </div>
        </div>
    );
}