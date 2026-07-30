"use client";

import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {usePathname} from "next/navigation";

type SideBarProps = {
    fullName: string;
    role: string;
}

export default function Sidebar(
    {
        fullName,
        role
    }: SideBarProps) {
        const pathname = usePathname();
        async function handleLogout() {
             await supabase.auth.signOut();
        window.location.href= "/auth/login";

        }
    

    return (
    <aside className="flex min-h-[calc(100vh-4rem)] w-64 flex-col bg-green-900 p-5 text-white">
      <h2 className="mb-8 text-2xl font-bold">
        KettyFleet
      </h2>

      <nav>
        <ul className="space-y-4">
          <li>
            <Link href=
            "/dashboard"
            className={`block rounded px-3 py-2 ${pathname === "/dashboard" ?
            "bg-green-700 font-medium" : "hover:bg-green-800"}`}
            >
            Dashboard
            </Link>
          </li>
          <li>
            <Link href="/dashboard/vehicles"
            className={`block rounded px-3 py-2 ${
           pathname.startsWith("/dashboard/vehicles")
                ? "bg-green-700 font-medium"
                : "hover:bg-green-800"
            }`}>
            Vehicles
            </Link>
            </li>
          <li>
            <Link href="/dashboard/clients"
            className={`block rounded px-3 py-2 ${
           pathname.startsWith("/dashboard/clients")
               ? "bg-green-700 font-medium"
                : "hover:bg-green-800"
        }`}>
              Clients
            </Link>
          </li>
          <li>
            <Link href="/dashboard/jobs"
            className={`block rounded px-3 py-2 ${
           pathname.startsWith("/dashboard/jobs")
                ? "bg-green-700 font-medium"
                : "hover:bg-green-800"
            }`}>
              Jobs
            </Link>
          </li>
          <li>
            <Link href="/dashboard/reports"
            className={`block rounded px-3 py-2 ${
           pathname.startsWith("/dashboard/reports")
                ? "bg-green-700 font-medium"
                : "hover:bg-green-800"
            }`}>
              Reports
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-red-700 pt-4">

        <p className="font-medium">
            {fullName}
        </p>

        <p className="mb-3 text-sm capitalize text-gray-300">
            {role}
        </p>

        <button
          onClick={handleLogout}
          className="text-sm text-black-300 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}