"use client";

import { supabase } from "@/lib/supabase/client";

type SideBarProps = {
    fullName: string;
    role: string;
}

export default function Sidebar(
    {
        fullName,
        role
    }: SideBarProps) {
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
          <li>Dashboard</li>
          <li>Vehicles</li>
          <li>Clients</li>
          <li>Jobs</li>
          <li>Reports</li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-red-700 pt-4">

        <p className="font-medium">
            {fullName}
        </p>

        <p className="mb-3text-sm capitalize text-gray-300">
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