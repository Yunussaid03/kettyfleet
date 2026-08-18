import {createClient} from "@/lib/supabase/server";


export default async function ClientDetailsPage({
    params,
}: {
    params:Promise<{ id: string}>;
}) {
    const {id} = await params;
    const supabase = await createClient();
    const { data: client,error} = await supabase
    .from("clients")
    .select(
        "id, client_name, client_type, phone, email, notes, created_at"
    )
    .eq("id", id)
    .single();

    if (error) {
        return (
            <p className="text-red-600">
                Failed to load client.
            </p>
        );
    }
    
  return (
    <div>
        <h1 className="text-3xl font-bold">
            {client.client_name}
        </h1>

        <div className="mt-6 space-y-4">
            <div>
                <p className="text-sm text-gray-500">
                    Client Type
                </p>
                <p className="font-medium capitalize">
                    {client.client_type}
                </p>
            </div>

            <div>
                <p className="text-sm text-gray-500">
                    Phone
                </p>
                <p className="font-medium">
                    {client.phone ?? "—"}
                </p>
            </div>

            <div>
                <p className="text-sm text-gray-500">
                    Email
                </p>
                <p className="font-medium">
                    {client.email ?? "—"}
                </p>
            </div>

            <div>
                <p className="text-sm text-gray-500">
                    Notes
                </p>
                <p className="font-medium">
                    {client.notes ?? "—"}
                </p>
            </div>

            <div>
                <p className="text-sm text-gray-500">
                    Created
                </p>
                <p className="font-medium">
                    {client.created_at}
                </p>
            </div>
        </div>
    </div>
);
}
    
   

