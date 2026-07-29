import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();
    


  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar
          fullName={profile?.full_name ?? "User"}
          role={profile?.role ?? "unknown"}
        />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </>
  );
}