"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface ClientOption {
    id: string;
    client_name: string;
}

interface VehicleOption {
    id: string;
    vehicle_code: string | null;
    registration_number: string;
    vehicle_type: string | null;
    status: string | null;
}

interface DriverOption {
    id: string;
    full_name: string;
}

export default function NewJobPage() {
    const router = useRouter();

    const [cdoNumber, setCdoNumber] = useState("");
    const [clientId, setClientId] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [driverId, setDriverId] = useState("");
    const [jobType, setJobType] = useState("");
    const [customJobType, setCustomJobType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");
    const [destination, setDestination] = useState("");
    const [notes, setNotes] = useState("");

    const [clients, setClients] = useState<ClientOption[]>([]);
    const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
    const [drivers, setDrivers] = useState<DriverOption[]>([]);
    const [canReadDrivers, setCanReadDrivers] = useState(false);

    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);

    useEffect(() => {
        async function fetchOptions() {
            setIsLoadingOptions(true);

            // Fetch clients
            const { data: clientsData } = await supabase
                .from("clients")
                .select("id, client_name")
                .order("client_name", { ascending: true });

            if (clientsData) {
                setClients(clientsData);
            }

            // Fetch vehicles
            const { data: vehiclesData } = await supabase
                .from("vehicles")
                .select("id, vehicle_code, registration_number, vehicle_type, status")
                .order("vehicle_code", { ascending: true });

            if (vehiclesData) {
                setVehicles(vehiclesData);
            }

            // Check if current user's RLS allows reading driver profiles
            const { data: driversData, error: driversError } = await supabase
                .from("profiles")
                .select("id, full_name, role")
                .eq("role", "driver")
                .order("full_name", { ascending: true });

            if (!driversError && driversData) {
                setDrivers(driversData);
                setCanReadDrivers(true);
            } else {
                setCanReadDrivers(false);
            }

            setIsLoadingOptions(false);
        }

        fetchOptions();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!cdoNumber.trim()) {
            setFormError("CDO Number is required.");
            return;
        }

        setFormError("");
        setIsSubmitting(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setIsSubmitting(false);
            setFormError("You must be logged in to create a job.");
            return;
        }

        const resolvedJobType =
            jobType === "Other"
                ? customJobType.trim() || "Other"
                : jobType.trim() || null;

        const { error } = await supabase.from("jobs").insert({
            cdo_number: cdoNumber.trim(),
            client_id: clientId || null,
            vehicle_id: vehicleId || null,
            driver_id: driverId || null,
            job_type: resolvedJobType,
            start_date: startDate || null,
            end_date: endDate || null,
            pickup_location: pickupLocation.trim() || null,
            destination: destination.trim() || null,
            notes: notes.trim() || null,
            created_by: user.id,
        });

        if (error) {
            setIsSubmitting(false);
            if (error.code === "23505") {
                setFormError("A job with this CDO number already exists.");
            } else {
                setFormError(error.message || "An error occurred while creating the job.");
            }
            return;
        }

        router.push("/dashboard/jobs");
        router.refresh();
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">New Job</h1>

                <Link
                    href="/dashboard/jobs"
                    className="font-medium text-green-700 hover:underline"
                >
                    &larr; Back to Jobs
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
                {/* CDO Number */}
                <div>
                    <label className="mb-1 block font-medium">
                        CDO Number <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        value={cdoNumber}
                        onChange={(e) => setCdoNumber(e.target.value)}
                        placeholder="e.g. CDO-001"
                        className="w-full rounded border p-3"
                        required
                    />
                </div>

                {/* Client Selector */}
                <div>
                    <label className="mb-1 block font-medium">Client</label>
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full rounded border p-3"
                        disabled={isLoadingOptions}
                    >
                        <option value="">Select a Client (Optional)</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.client_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Vehicle Selector */}
                <div>
                    <label className="mb-1 block font-medium">Vehicle</label>
                    <select
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        className="w-full rounded border p-3"
                        disabled={isLoadingOptions}
                    >
                        <option value="">Select a Vehicle (Optional)</option>
                        {vehicles.map((v) => {
                            const code = v.vehicle_code ? `${v.vehicle_code} — ` : "";
                            const type = v.vehicle_type ? ` (${v.vehicle_type})` : "";
                            const status = v.status && v.status !== "active" ? ` [${v.status}]` : "";
                            return (
                                <option key={v.id} value={v.id}>
                                    {code}{v.registration_number}{type}{status}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Driver Selector - only rendered if RLS permissions allow reading driver profiles */}
                {canReadDrivers && (
                    <div>
                        <label className="mb-1 block font-medium">Driver</label>
                        <select
                            value={driverId}
                            onChange={(e) => setDriverId(e.target.value)}
                            className="w-full rounded border p-3"
                            disabled={isLoadingOptions}
                        >
                            <option value="">Select a Driver (Optional)</option>
                            {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.full_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Job Type */}
                <div>
                    <label className="mb-1 block font-medium">Job Type</label>
                    <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full rounded border p-3"
                    >
                        <option value="">Select Job Type (Optional)</option>
                        <option value="Safari Tours">Safari Tours</option>
                        <option value="Transfers">Transfers</option>
                        <option value="City Tours">City Tours</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Custom Job Type if "Other" is selected */}
                {jobType === "Other" && (
                    <div>
                        <label className="mb-1 block font-medium">Specify Job Type</label>
                        <input
                            type="text"
                            value={customJobType}
                            onChange={(e) => setCustomJobType(e.target.value)}
                            placeholder="e.g. VIP Corporate Event"
                            className="w-full rounded border p-3"
                        />
                    </div>
                )}

                {/* Dates Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block font-medium">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded border p-3"
                        />
                    </div>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block font-medium">Pickup Location</label>
                        <input
                            type="text"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            placeholder="e.g. JKIA Airport"
                            className="w-full rounded border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Destination</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="e.g. Maasai Mara"
                            className="w-full rounded border p-3"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="mb-1 block font-medium">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional job notes or instructions..."
                        rows={4}
                        className="w-full rounded border p-3"
                    />
                </div>

                {/* Error Banner */}
                {formError && (
                    <p className="text-sm font-medium text-red-600">{formError}</p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400 disabled:opacity-100"
                    >
                        {isSubmitting ? "Saving..." : "Save Job"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/jobs")}
                        className="rounded bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
