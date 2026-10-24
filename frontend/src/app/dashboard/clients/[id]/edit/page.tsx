import Link from "next/link";
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
    .select("id, client_name, client_type, phone, email, notes")
    .eq("id", id)
    .single();

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Clients
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Client not found.</p>
          <p className="mt-1 text-xs text-red-600">The client record may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/clients/${id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Client Details
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Client
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Editing client profile for <span className="font-medium text-slate-700">{client.client_name}</span>
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <EditClientForm client={client} />
      </div>
    </div>
  );
}