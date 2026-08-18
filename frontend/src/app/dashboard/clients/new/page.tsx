"use client";

import {useState} from "react";
import {supabase} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";


export default  function NewClientPage(){

const router = useRouter();    
const [clientName, setClientName] = useState("");
const [clientType, setClientType] = useState("company");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [notes, setNotes] = useState("");

const [formError, setFormError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

async function handleSubmit (event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();

     if(!clientName.trim() ||  !clientType.trim()){
        setFormError("Client Name and Type Required");
        return;

    }
    setFormError("");
    setIsSubmitting(true);

    const { error } = await supabase
    .from("clients")
    .insert({
        client_name: clientName.trim(),
        client_type: clientType,
        phone: phone.trim() || null,
        email: email.trim() || null ,
        notes: notes.trim() || null

    });

     if (error) {
    setIsSubmitting(false);
    setFormError("An error occurred while saving the client");
    
    return;
   }
   router.push("/dashboard/clients");
   router.refresh();

}

return (
    <div>
        <h1 className="text-3xl font-bold">
        New Client
        </h1>

        <form 
            onSubmit = {handleSubmit}
            className="mt-6 space-y-4"
            >
                <div>

                <label className= "mb-1 block font-medium">
                    Client Name
                <input
                type="text"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                className="w-full rounded border p-3"
                placeholder="John Doe"
                />
                </label>

                </div>

                <div>
                    <label className="mb-1 block font-medium">
                        Client Type
                    <select
                    value={clientType}
                    onChange={(event) => setClientType(event.target.value)}
                    className="w-full rounded border p-3"
                    >
                        <option value="company">Company</option>
                        <option value="individual">Individual</option>
                    </select>

                    </label>
                </div>

                <div>
                    <label className="mb-1 block font-medium">
                        Phone
                        <input
                        type="text"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="w-full rounded border p-3"
                        />
                    </label>
                </div>

                <div>
                    <label className="mb-1 block font-medium">
                        Email
                        <input
                        type="text"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded border p-3"
                        />

                    </label>
                </div>

                <div>
                    <label className="mb-1 block font-medium">
                        Notes
                        <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="w-full rounded border p-3"
                        placeholder="Additional notes..."
                        rows={4}
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
                 className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400 disabled:opacity-100">
                {isSubmitting ? "Saving..." : "Save Vehicle"}
                </button>

        </form>
    </div>

)
    
  



}