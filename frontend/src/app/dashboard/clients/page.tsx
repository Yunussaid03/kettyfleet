import Link from "next/link";
import { createClient } from "@/lib/supabase/server";


export default async function ClientsPage() {
    const supabase = await createClient();

    const { data: clients, error } = await supabase
    .from("clients")
    .select(
        "id, client_name, client_type, phone, email, created_at"
    )
    .order(
        "client_name", {ascending: true}
    );

    if(error){
        return (
            <p className="text-red-600">
                Failure to load Clients
            </p>
        );
    }

   

    return (
        <div>
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
                Clients
            </h1>

                <Link 
                    href="/dashboard/clients/new"
                    className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                    >
                    Add Client
                </Link>
        </div>

                
                <div className= "mt-6 overflow-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                        <tr>
                            <th className="p-3">Client Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Created</th>
                        </tr>
                        </thead>

                        <tbody>
                            {clients.map((client) => (
                                <tr
                                key={ client.id}
                                className="border-b">
                                    <td className="p-3">
                                         <Link
                                              href={`/dashboard/clients/${client.id}`}
                                               className="font-medium text-green-700 hover:underline"
                                                 >
                                                  {client.client_name}
                                         </Link>
                                    </td>
                                    <td className="p-3">{client.client_type}</td>
                                    <td className="p-3">{client.phone}</td>
                                    <td className="p-3">{client.email}</td>
                                    <td className="p-3">{client.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                </div>
                </div>
       

        
    )
}