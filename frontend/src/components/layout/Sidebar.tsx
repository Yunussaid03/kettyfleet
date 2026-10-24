"use client";

import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SideBarProps = {
  fullName: string;
  role: string;
};

export default function Sidebar({ fullName, role }: SideBarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <aside className="flex min-h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-800 bg-slate-900 p-5 text-slate-100">
      <div className="mb-6 flex items-center space-x-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
          KF
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            KettyFleet
          </h2>
          <p className="text-xs text-slate-400">Operations ERP</p>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1.5">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === "/dashboard"
                  ? "border-l-2 border-blue-500 bg-slate-800 font-semibold text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/vehicles"
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                pathname.startsWith("/dashboard/vehicles")
                  ? "border-l-2 border-blue-500 bg-slate-800 font-semibold text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Vehicles
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/clients"
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                pathname.startsWith("/dashboard/clients")
                  ? "border-l-2 border-blue-500 bg-slate-800 font-semibold text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Clients
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/jobs"
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                pathname.startsWith("/dashboard/jobs")
                  ? "border-l-2 border-blue-500 bg-slate-800 font-semibold text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Jobs
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/reports"
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                pathname.startsWith("/dashboard/reports")
                  ? "border-l-2 border-blue-500 bg-slate-800 font-semibold text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Reports
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-4">
        <p className="truncate text-sm font-medium text-white">
          {fullName}
        </p>

        <p className="mb-3 text-xs capitalize text-slate-400">
          {role}
        </p>

        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 transition-colors hover:text-red-400"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}