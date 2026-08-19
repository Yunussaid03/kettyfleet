"use client";

import {useState} from "react";
import {supabase} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";




export default function EditClientForm({ client }){

    const router = useRouter();


    const[clientName, setClientName] = useState(client.client_name);
    const[clientType, setClientType] = useState(client.client_type);
    const[phone, setPhone] = useState(client.phone ?? "");
    const[email, setEmail] = useState(client.email ?? "");
    const[notes, setNotes] = useState(client.notes ?? "");

    const[formError, setFormError] = useState("");
    const[isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault();

    if (!clientName.trim() || !clientType.trim()){
        setFormError("Client Name and Type Required");
        return;
    }

    setFormError("");
    setIsSubmitting(true);

    const { error } = await supabase
        .from("clients")
        .update({
            client_name: clientName.trim(),
            client_type: clientType,
            phone: phone.trim() || null,
            email: email.trim() || null,
            notes: notes.trim() || null,
        })
        .eq("id", client.id);

    if (error) {
        setIsSubmitting(false);
        setFormError("An error occurred while updating the client.");
        return;
    }

    router.push("/dashboard/clients");
    router.refresh();
}
        
    return(
    <div>
        
        <form onSubmit={handleSubmit}>
            <div>
            <label className="mb-1 block font-medium">
                Client Name
            </label>
            <input
            type="text"
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="John Doe"
            className="w-full rounded border p-3"
            />
            </div>

            <div>
            <label className="mb-1 block font-medium">
                Client Type
            </label>
            <select

            value={clientType}
            onChange={(event) => setClientType(event.target.value)}
            className="w-full rounded border p-3"
            >
            <option value = "company">Company</option>
            <option value = "individual">Individual</option>
            </select>
            </div>

            <div>
            <label className="mb-1 block font-medium">
                Phone
            </label>
            <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded border p-3"
            />
            </div>

              <div>
            <label className="mb-1 block font-medium">
                Email
            </label>
            <input
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border p-3"
            />
            </div>

              <div>
            <label className="mb-1 block font-medium">
                Notes
            </label>
            <input
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded border p-3"
            />
            </div>

            {formError &&(
                <p className="text-red-600">
                    {formError}
                </p>
            )}

            <button 
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
               >
                   {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
        </form>
        
        

    </div>
    );
}