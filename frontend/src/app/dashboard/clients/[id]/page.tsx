import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createClient();

    const { data: client, error } = await supabase
        .from("clients")
        .select(
            "id, client_name, client_type, phone, email, notes, created_at"
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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Client Details
                </h1>

                <Link
                    href={`/dashboard/clients/${id}/edit`}
                    className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
                >
                    Edit Client
                </Link>
            </div>

            <div className="mt-6 space-y-2">
                <p>
                    <strong>Name:</strong>{" "}
                    {client.client_name}
                </p>

                <p>
                    <strong>Type:</strong>{" "}
                    {client.client_type}
                </p>

                <p>
                    <strong>Phone:</strong>{" "}
                    {client.phone ?? "Not Provided"}
                </p>

                <p>
                    <strong>Email:</strong>{" "}
                    {client.email ?? "Not Provided"}
                </p>

                <p>
                    <strong>Notes:</strong>{" "}
                    {client.notes ?? "Not Provided"}
                </p>

                <p>
                    <strong>Created:</strong>{" "}
                    {client.created_at}
                </p>
            </div>
        </div>
    );
}