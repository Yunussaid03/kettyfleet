import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function JobDetailsPage({
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
            job_type,
            start_date,
            end_date,
            pickup_location,
            destination,
            notes,
            created_at,
            client:clients(id, client_name),
            vehicle:vehicles(id, vehicle_code, registration_number),
            driver:profiles!driver_id(id, full_name)
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

    const clientData = Array.isArray(job.client) ? job.client[0] : job.client;
    const clientName = clientData?.client_name ?? "Not Provided";

    const vehicleData = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;
    const vehicleDisplay = vehicleData
        ? vehicleData.vehicle_code
            ? `${vehicleData.vehicle_code} (${vehicleData.registration_number})`
            : vehicleData.registration_number
        : "Not Provided";

    const driverData = Array.isArray(job.driver) ? job.driver[0] : job.driver;
    const driverName = driverData?.full_name ?? "Not Provided";

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Job Details
                </h1>

                <div className="flex items-center space-x-3">
                    <Link
                        href={`/dashboard/jobs/${id}/edit`}
                        className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                    >
                        Edit Job
                    </Link>

                    <Link
                        href="/dashboard/jobs"
                        className="font-medium text-green-700 hover:underline"
                    >
                        &larr; Back to Jobs
                    </Link>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <p>
                    <strong>CDO Number:</strong>{" "}
                    {job.cdo_number}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    <span className="capitalize">{job.status}</span>
                </p>

                <p>
                    <strong>Job Type:</strong>{" "}
                    {job.job_type ?? "Not Provided"}
                </p>

                <p>
                    <strong>Client:</strong>{" "}
                    {clientName}
                </p>

                <p>
                    <strong>Vehicle:</strong>{" "}
                    {vehicleDisplay}
                </p>

                <p>
                    <strong>Driver:</strong>{" "}
                    {driverName}
                </p>

                <p>
                    <strong>Start Date:</strong>{" "}
                    {job.start_date ?? "Not Provided"}
                </p>

                <p>
                    <strong>End Date:</strong>{" "}
                    {job.end_date ?? "Not Provided"}
                </p>

                <p>
                    <strong>Pickup Location:</strong>{" "}
                    {job.pickup_location ?? "Not Provided"}
                </p>

                <p>
                    <strong>Destination:</strong>{" "}
                    {job.destination ?? "Not Provided"}
                </p>

                <p>
                    <strong>Notes:</strong>{" "}
                    {job.notes ?? "Not Provided"}
                </p>
            </div>
        </div>
    );
}
