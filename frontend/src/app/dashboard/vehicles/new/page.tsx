"use client";
import {useState} from "react";
import {supabase} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";





export default function NewVehiclePage() {

const router = useRouter();
const [vehicleCode,setVehicleCode] = useState("");
const [registrationNumber,setRegistrationNumber] = useState("");
const [vehicleType, setVehicleType]= useState("");
const [formError,setFormError] = useState("");


 async function handleSubmit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(!vehicleCode.trim() ||  !registrationNumber.trim() || !vehicleType.trim()){
        setFormError("All fields are required");
        return;

    }

    setFormError("");

    const { error } = await supabase
    .from ("vehicles")
    .insert({
        vehicle_code: vehicleCode.trim(),
        registration_number: registrationNumber.trim(),
        vehicle_type: vehicleType.trim(),

    });
   if (error) {
    setFormError(error.message);
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
            {formError && (
                <p className="text-sm text-red-600">
                    {formError}
                </p>
            )}
            <button
            type="submit"
            className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800">
                Save Vehicle
            </button>

            <button
            type="submit"
            onClick={() => router.push("/dashboard/vehicles")}
            >
                Cancel
            </button>
          </form>
        </div>
    )
}