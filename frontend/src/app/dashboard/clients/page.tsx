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
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, client_name, client_type, phone, email, created_at")
    .order("client_name", { ascending: true });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Failed to load clients.</p>
        <p className="mt-1 text-xs text-red-600">Please try refreshing the page or check your database permissions.</p>
      </div>
    );
  }

  const totalClients = clients?.length ?? 0;
  const corporateClients = clients?.filter((c) => c.client_type === "company").length ?? 0;
  const individualClients = clients?.filter((c) => c.client_type === "individual").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Clients
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your partner accounts, enterprise accounts, and individual clients.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="-ml-0.5 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Clients */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Clients</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {totalClients}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Registered partner & client accounts</p>
        </div>

        {/* Corporate / Company Clients */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Corporate Accounts</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {corporateClients}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-600">Company & enterprise clients</p>
        </div>

        {/* Individual Clients */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Individual Accounts</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {individualClients}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-purple-600">Private & direct retail clients</p>
        </div>
      </div>

      {/* Table Container Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">All Client Accounts</h2>
          <p className="text-xs text-slate-500">Complete directory of registered clients</p>
        </div>

        {totalClients === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No clients have been added yet.</p>
            <Link
              href="/dashboard/clients/new"
              className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
            >
              Add your first client &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3">Client Name</th>
                  <th className="px-4 py-3">Account Type</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-6 py-3">Added Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {client.client_name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {renderClientTypeBadge(client.client_type)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {client.phone ? (
                        <a
                          href={`tel:${client.phone}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {client.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {client.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-500">
                      {formatDate(client.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}