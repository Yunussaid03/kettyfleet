import Link from "next/link";
import { createClient } from "@/lib/supabase/server";


export default async function JobsPage() {

    const supabase = await createClient();

    const { data: jobs, error} = await supabase
    .from("jobs")
    .select("*")
    .order("start_date", {ascending: true});

    if (error){
        return(
            <p className="text-red-600">
                Failure to Load Jobs
            </p>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Jobs
                </h1>

                <Link
                    href="/dashboard/jobs/new"
                    className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                >
                    Add Job
                </Link>
            </div>

                {jobs.length === 0 ? (
                    <p className= "mt-6 text-gray-600">
                        No Jobs have been added yet.
                    </p>
                ): (
                    <div className="mt-6 overflow-auto">
                         <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="p-3">CDO Number</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Start Date</th>
                            <th className="p-3">End Date</th>
                            <th className="p-3">Pickup</th>
                            <th className="p-3">Destination</th>
                        </tr>
                    </thead>

                      <tbody>
                        {jobs.map((job) => (
                            <tr
                                key={job.id}
                                className="border-b"
                            >
                                <td className="p-3">
                                    <Link
                                        href={`/dashboard/jobs/${job.id}`}
                                        className="font-medium text-green-700 hover:underline"
                                    >
                                        {job.cdo_number}
                                    </Link>
                                </td>
                                <td className="p-3">
                                    {job.status}
                                </td>
                                <td className="p-3">
                                    {job.start_date ?? "Not Provided"}
                                </td>
                                <td className="p-3">
                                    {job.end_date ?? "Not Provided"}
                                </td>
                                <td className="p-3">
                                    {job.pickup_location ?? "Not Provided"}
                                </td>
                                <td className="p-3">
                                    {job.destination ?? "Not Provided"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
                )}
        </div>
    );
}