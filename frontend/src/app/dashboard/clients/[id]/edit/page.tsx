import { createClient } from "@/lib/supabase/server";
import EditClientForm from "./EditClientForm";

export default async function EditClientPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createClient();

    const { data: client, error } = await supabase
        .from("clients")
        .select(
            "id, client_name, client_type, phone, email, notes"
        )
        .eq("id", id)
        .single();

    if (error || !client) {
        return (
            <p className="text-red-600">
                Client Not Found.
            </p>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">
                Edit {client.client_name}
            </h1>

            <EditClientForm client={client} />
        </div>
    );
}