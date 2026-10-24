import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function renderClientTypeBadge(type: string | null) {
  const t = type?.toLowerCase() ?? "unknown";
  if (t === "company") {
    return (
      <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
        Company
      </span>
    );
  }
  if (t === "individual") {
    return (
      <span className="inline-flex items-center rounded-full border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 capitalize">
        Individual
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
      {type ?? "Unknown"}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not Provided";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("id, client_name, client_type, phone, email, notes, created_at")
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
      {/* Top Navigation & Header */}
      <div>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Clients
        </Link>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {client.client_name}
              </h1>
              {renderClientTypeBadge(client.client_type)}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Account ID: <span className="font-mono text-xs text-slate-600">{client.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/clients/${id}/edit`}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="-ml-0.5 mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Client
            </Link>
          </div>
        </div>
      </div>

      {/* Client Information Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Client Information</h2>
          <p className="text-xs text-slate-500">Contact details and account profile</p>
        </div>

        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Client / Company Name
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {client.client_name}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Account Type
              </dt>
              <dd className="mt-1">
                {renderClientTypeBadge(client.client_type)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Telephone Contact
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">Not Provided</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Email Address
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.email}
                  </a>
                ) : (
                  <span className="text-slate-400">Not Provided</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Account Created
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {formatDate(client.created_at)}
              </dd>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Notes & Instructions
              </dt>
              <dd className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700">
                {client.notes ? (
                  <p className="whitespace-pre-line">{client.notes}</p>
                ) : (
                  <span className="text-slate-400">No additional notes recorded for this client.</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}