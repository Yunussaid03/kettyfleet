"use client";


import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase/client";

type Vehicle =  {
    id: string;
    vehicle_code: string;
    registration_number: string;
    vehicle_type: string;
    manufacture_year: number | null;
    passenger_capacity: number | null;
    current_mileage: number | null;
    ownership_type: string | null;
    status: string | null;
    category: string | null;
}

export default function EditVehicleForm({
    vehicle,
}: {
    vehicle: Vehicle;
}) {
    const router= useRouter();
    const [vehicleCode, setVehicleCode] = useState(vehicle.vehicle_code);
    const [registrationNumber, setRegistrationNumber] = useState(vehicle.registration_number);
    const [vehicleType, setVehicleType] = useState(vehicle.vehicle_type);
    const [manufactureYear, setManufactureYear] = useState(vehicle.manufacture_year?.toString() ?? "");
    const [passengerCapacity, setPassengerCapacity] = useState(vehicle.passenger_capacity?.toString() ?? "");
    const [currentMileage, setCurrentMileage] = useState(vehicle.current_mileage?.toString() ?? "");
    const [ownershipType, setOwnershipType] = useState(vehicle.ownership_type ?? "company");
    const [status, setStatus] = useState(vehicle.status ?? "active");
    const [category, setCategory] = useState(vehicle.category ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");



async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
){
    event.preventDefault();

    setFormError("");
    setIsSubmitting(true);

   const { error } = await supabase
      .from("vehicles")
      .update({
        vehicle_code: vehicleCode.trim(),
         registration_number: registrationNumber.trim(),
      vehicle_type: vehicleType.trim(),
      manufacture_year: manufactureYear
        ? Number(manufactureYear)
        : null,
      passenger_capacity: passengerCapacity
        ? Number(passengerCapacity)
        : null,
      current_mileage: currentMileage
        ? Number(currentMileage)
        : 0,
      ownership_type: ownershipType,
      status: status,
      category: category.trim() || null,
    })

    .eq("id", vehicle.id);

    if(error){
        console.error(error)
        setFormError("An error occured while updating the vehicle.");
        setIsSubmitting(false);
        return;
}
    console.log("Vehicle Updated Successfully");
    router.push(`/dashboard/vehicles/${vehicle.id}`);

      }



    return (
        <form
        onSubmit={handleSubmit}
         className="mt-6 space y-4">
            <div>
                <label className="mb-1 block font-medium">
                    Vehicle Code
                </label>
                <input
                type="text"
                value={vehicleCode}
                onChange={(event) => setVehicleCode(event.target.value)}
                className="w-full rounded border p-3"
                />
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Registration Number
                </label>
                <input
                type="text"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
                className="w-full rounded border p-3"
                />
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Vehicle Type
                </label>
                <input
                type="text"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                className="w-full rounded border p-3"
                />
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Manufacture Year
                </label>
                <input
                type="text"
                value={manufactureYear}
                onChange={(event) => setManufactureYear(event.target.value)}
                className="w-full rounded border p-3"
                min="1980"
                max={new Date().getFullYear()}
                />
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Passenger Capacity
                </label>
                <input
                type="text"
                value={passengerCapacity}
                onChange={(event) => setPassengerCapacity(event.target.value)}
                className="w-full rounded border p-3"
                min="1"
                />
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Current Mileage
                </label>
                <input
                type="text"
                value={currentMileage}
                onChange={(event) => setCurrentMileage(event.target.value)}
                className="w-full rounded border p-3"
                min="0"
                />
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Ownership Type
                </label>
                <select
               
                value={ownershipType}
                onChange={(event) => setOwnershipType(event.target.value)}
                className="w-full rounded border p-3"
                >
                <option value = "company">Company</option>
                <option value= "private">Private</option>
                <option value= "leased">Leased</option>

                </select>

        
            </div>

            <div>
                <label className="mb-1 block font medium">
                    Status
                </label>
                <select
                
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded border p-3"
                >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
                <option value="sold">Sold</option>
                </select>

            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Category
                </label>
                <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded border p-3"
                placeholder="4WD, Minivan, MPV"
                />
                
            </div>

            {formError && (
               <p className="text-sm text-red-600">
                          {formError}
               </p>
                  )}

            <button 
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-green-700 px-4 py-2 font medium text-white hover:bg-green-800">
                {isSubmitting ? "Saving..." : "Save Changes"}
            </button>


        </form>
    )
}



