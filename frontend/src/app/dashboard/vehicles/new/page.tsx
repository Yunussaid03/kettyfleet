"use client";
import {useState} from "react";
import {supabase} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";





export default function NewVehiclePage() {

const router = useRouter();
const [vehicleCode,setVehicleCode] = useState("");
const [registrationNumber,setRegistrationNumber] = useState("");
const [vehicleType, setVehicleType]= useState("");
const [manufactureYear, setManufactureYear] = useState("");
const [passengerCapacity, setPassengerCapacity] = useState("");
const [currentMileage, setCurrentMileage] = useState("");
const [ownershipType, setOwnershipType] = useState("company");
const [status, setStatus] = useState("active");
const [category, setCategory] = useState("");



const [formError,setFormError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);


 async function handleSubmit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(!vehicleCode.trim() ||  !registrationNumber.trim() || !vehicleType.trim()){
        setFormError("All fields are required");
        return;

    }

    setFormError("");
    setIsSubmitting(true);

    const { error } = await supabase
    .from ("vehicles")
    .insert({
        vehicle_code: vehicleCode.trim(),
        registration_number: registrationNumber.trim(),
        vehicle_type: vehicleType.trim(),
        manufacture_year: manufactureYear ? Number(manufactureYear) : null,
        passenger_capacity: passengerCapacity ? Number(passengerCapacity) : null,
        current_mileage: currentMileage ? Number(currentMileage) : 0,
        ownership_type: ownershipType,
        status: status,
        category: category.trim() || null,




    });
   if (error) {
    setIsSubmitting(false);

    if (error.code === "23505"){
        setFormError("Vehicle code or registration number already exists.");
        
    }
    else {
        setFormError("An error occurred while saving the vehicle.");
    }
    
    return;
   }
   router.push("/dashboard/vehicles");   //Redirect to vehicles page
   router.refresh();

}

    return (
        <div>
            <h1 className="text-3xl font-bold">
                New Vehicle
            </h1>

          <form
          onSubmit={handleSubmit} 
          className="mt-6 space-y-4" >
            <div>
                <label className="mb-1 block font-medium">
                    Vehicle Code
                    
                </label>
                <input
                type="text"
                value={vehicleCode}
                onChange={(event) => setVehicleCode(event.target.value)}
                className="w-full rounded border p-3"
                placeholder="V006"
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
                    placeholder="KXX 123A"

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
                placeholder="Toyota Hiace"
                />
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Manufacture Year
                    <input
                    type="number"
                    value={manufactureYear}
                    onChange={(event) => setManufactureYear(event.target.value)}
                    className="w-full rounded border p-3"
                    placeholder="2020"
                    min="1980"
                    max={new Date().getFullYear()}
                    />
                </label>
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Passenger Capacity
                    <input
                    type="number"
                    value={passengerCapacity}
                    onChange={(event) => setPassengerCapacity(event.target.value)}
                    className="w-full rounded border p-3"
                    placeholder="8"
                    min="1"
                    />
                </label>
            </div>

            <div>
                <label className="mb-1 block font-medium">
                    Current Mileage
                    <input
                    type="number"
                    value={currentMileage}
                    onChange={(event) => setCurrentMileage(event.target.value)}
                    className="w-full rounded border p-3"
                    placeholder="10000"
                    min="0"
                    />
                </label>
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

                    <option value="company">Company</option>
                    <option value="private">Private</option>
                    <option value="leased">Leased</option>

                </select>

                </div>

                <div>
                <label className="mb-1 block font-medium">
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
                        <input
                        type="text"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full rounded border p-3"
                        placeholder="4WD, MiniVan, MPV"
                        />
                    </label>
                </div>    
                
            {formError && (
                <p className="text-sm text-red-600">
                    {formError}
                </p>
            )}
            <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled: cursor-not-allowed disabled: opacity-50">
                {isSubmitting ? "Saving..." : "Save Vehicle"}
            </button>

            <button
            type="button"
            onClick={() => router.push("/dashboard/vehicles")}
            className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
            >
                Cancel
            </button>
          </form>
        </div>
    )
}