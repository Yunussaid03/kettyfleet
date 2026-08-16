import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
      <p className="text-red-600">
        Failed to load vehicles.
      </p>
    );
  }

  const totalVehicles = vehicles.length;

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "active").length;

  const maintenanceVehicles = vehicles.filter(
    (vehicles) => vehicles.status === "maintenance").length;

  const inactiveVehicles = vehicles.filter(
    (vehicles) => vehicles.status === "inactive" || 
                  vehicles.status === "sold").length;

  

  

  return (
    <div>
     <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
            Vehicles
            </h1>
    
         
         <Link href="/dashboard/vehicles/new"
         className="rounded bg-green-700 px-4 py-2 text-white hover:bg-gree-800">
            Add Vehicle
         </Link>
          </div>


      <div className="mt-6 grid gap-4 sm: grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
            <p className="text-sm text-gray-500">
                Total Vehicles
            </p>
            <p className="m-t1 text-2xl font-bold">{totalVehicles}
            </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm: grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
            <p className="text-sm text-gray-500">
                Active 
            </p>
            <p className="m-t1 text-2xl font-bold">{activeVehicles}
            </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm: grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
            <p className="text-sm text-gray-500">
                Maintenance 
            </p>
            <p className="m-t1 text-2xl font-bold">{maintenanceVehicles}
            </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm: grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
            <p className="text-sm text-gray-500">
                Inactive or Sold
            </p>
            <p className="m-t1 text-2xl font-bold">{inactiveVehicles}
            </p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <p className="mt-6 text-gray-600">
          No vehicles have been added yet.
        </p>
      ) : (

        <div className="mt-6 overflow-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr>
                        <th className="p-3">Vehicle Code</th>
                        <th className="p-3">Registration</th>
                        <th className="p-3">Vehicle</th>
                        <th className="p-3">Year</th>
                        <th className="p-3">Capacity</th>
                        <th className="p-3">Ownership</th>
                        <th className="p-3">Mileage</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {vehicles.map((vehicle) => (
                        <tr
                        key={vehicle.id}
                        className="border-b"
                        >
                            <td className="p-3">
                                <Link
                                href={`/dashboard/vehicles/${vehicle.id}`}
                                className = "font-medium text-green-700 hover:underline"
                                >
                                    {vehicle.vehicle_code}
                                </Link>
                                </td>
                            <td className="p-3">{vehicle.registration_number}</td>
                            <td className="p-3">{vehicle.vehicle_type}</td>
                            <td className="p-3">{vehicle.manufacture_year ?? "_"}</td>
                            <td className="p-3">{vehicle.passenger_capacity ?? "_"}</td>
                            <td className="p-3 capitalize">{vehicle.ownership_type ?? "_"}</td>
                            <td className="p-3">
                                {vehicle.current_mileage?.toLocaleString() ?? "_"}
                            </td>
                            <td className="p-3"
                            >
                                <span
                                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                    vehicle.status === "active" ? "bg-green-400 text-green-700":
                                    vehicle.status === "maintenance" ? "bg-yellow-400 text-yellow-700":
                                    vehicle.status === "inactive" ? "bg-gray-400 text-gray-700"
                                    : "bg-red-400 text-red-700"
                                }`}
                                    >
                                    {vehicle.status}
                                    </span>
                                    </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div> 
                 
  ); 

}