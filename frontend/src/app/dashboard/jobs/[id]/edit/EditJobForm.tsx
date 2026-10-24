"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export interface JobRecord {
  id: string;
  cdo_number: string;
  status: string;
  client_id: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
  job_type: string | null;
  start_date: string | null;
  end_date: string | null;
  pickup_location: string | null;
  destination: string | null;
  notes: string | null;
}

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

const PRESET_JOB_TYPES = ["Safari Tours", "Transfers", "City Tours"];

export default function EditJobForm({ job }: { job: JobRecord }) {
  const router = useRouter();

  const isPreset = job.job_type ? PRESET_JOB_TYPES.includes(job.job_type) : false;
  const initialJobType = job.job_type ? (isPreset ? job.job_type : "Other") : "";
  const initialCustomJobType = job.job_type && !isPreset ? job.job_type : "";

  const [cdoNumber, setCdoNumber] = useState(job.cdo_number);
  const [clientId, setClientId] = useState(job.client_id ?? "");
  const [vehicleId, setVehicleId] = useState(job.vehicle_id ?? "");
  const [driverId, setDriverId] = useState(job.driver_id ?? "");
  const [jobType, setJobType] = useState(initialJobType);
  const [customJobType, setCustomJobType] = useState(initialCustomJobType);
  const [startDate, setStartDate] = useState(job.start_date ?? "");
  const [endDate, setEndDate] = useState(job.end_date ?? "");
  const [pickupLocation, setPickupLocation] = useState(job.pickup_location ?? "");
  const [destination, setDestination] = useState(job.destination ?? "");
  const [notes, setNotes] = useState(job.notes ?? "");

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

    const resolvedJobType =
      jobType === "Other"
        ? customJobType.trim() || "Other"
        : jobType.trim() || null;

    const updatePayload: {
      cdo_number: string;
      client_id: string | null;
      vehicle_id: string | null;
      driver_id?: string | null;
      job_type: string | null;
      start_date: string | null;
      end_date: string | null;
      pickup_location: string | null;
      destination: string | null;
      notes: string | null;
      updated_at: string;
    } = {
      cdo_number: cdoNumber.trim(),
      client_id: clientId || null,
      vehicle_id: vehicleId || null,
      job_type: resolvedJobType,
      start_date: startDate || null,
      end_date: endDate || null,
      pickup_location: pickupLocation.trim() || null,
      destination: destination.trim() || null,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // Only modify driver_id if the user has permission to read/manage drivers
    if (canReadDrivers) {
      updatePayload.driver_id = driverId || null;
    }

    const { error } = await supabase
      .from("jobs")
      .update(updatePayload)
      .eq("id", job.id);

    if (error) {
      setIsSubmitting(false);
      if (error.code === "23505") {
        setFormError("A job with this CDO number already exists.");
      } else {
        setFormError(error.message || "An error occurred while updating the job.");
      }
      return;
    }

    router.push(`/dashboard/jobs/${job.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* CDO Number */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            CDO Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cdoNumber}
            onChange={(e) => setCdoNumber(e.target.value)}
            placeholder="e.g. CDO-001"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Job Classification
          </label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select Job Type (Optional)</option>
            <option value="Safari Tours">Safari Tours</option>
            <option value="Transfers">Transfers</option>
            <option value="City Tours">City Tours</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Custom Job Type */}
        {jobType === "Other" && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Specify Custom Job Classification
            </label>
            <input
              type="text"
              value={customJobType}
              onChange={(e) => setCustomJobType(e.target.value)}
              placeholder="e.g. VIP Corporate Event"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}

        {/* Client Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Client Account
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Fleet Vehicle
          </label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
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

        {/* Driver Selector */}
        {canReadDrivers && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Assigned Driver
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
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

        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Pickup Origin
          </label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="e.g. JKIA Airport"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Maasai Mara Serena"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Instructions &amp; Delivery Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional job notes, passenger counts, or delivery instructions..."
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
