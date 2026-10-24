import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditJobForm from "./EditJobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      id,
      cdo_number,
      status,
      client_id,
      vehicle_id,
      driver_id,
      job_type,
      start_date,
      end_date,
      pickup_location,
      destination,
      notes
    `)
    .eq("id", id)
    .single();

  if (error || !job) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Jobs
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Job not found.</p>
          <p className="mt-1 text-xs text-red-600">The dispatch job may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/jobs/${job.id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Job Details
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Job
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Editing Customer Delivery Order: <span className="font-medium text-slate-700">{job.cdo_number}</span>
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <EditJobForm job={job} />
      </div>
    </div>
  );
}
