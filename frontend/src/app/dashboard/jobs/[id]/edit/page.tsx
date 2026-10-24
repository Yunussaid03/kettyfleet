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
            <p className="text-red-600">
                Job Not Found.
            </p>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Edit Job
                </h1>

                <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="font-medium text-green-700 hover:underline"
                >
                    &larr; Back to Job Details
                </Link>
            </div>

            <p className="mt-3 text-gray-600">
                Editing: {job.cdo_number}
            </p>

            <EditJobForm job={job} />
        </div>
    );
}
