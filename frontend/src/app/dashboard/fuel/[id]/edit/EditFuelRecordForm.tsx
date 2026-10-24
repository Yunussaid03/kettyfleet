"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export interface FuelRecordProps {
  id: string;
  vehicle_id: string;
  job_id: string | null;
  fillup_date: string;
  odometer_before: number;
  odometer_after: number;
  fuel_amount_litres: number;
  fuel_cost_per_litres: number;
  km_covered: number | null;
  fuel_efficiency: number | null;
  fuel_station: string | null;
  invoice_number: string | null;
  notes: string | null;
}

interface VehicleOption {
  id: string;
  vehicle_code: string | null;
  registration_number: string;
  vehicle_type: string | null;
}

interface JobOption {
  id: string;
  cdo_number: string;
}

export default function EditFuelRecordForm({
  record,
}: {
  record: FuelRecordProps;
}) {
  const router = useRouter();

  const [vehicleId, setVehicleId] = useState(record.vehicle_id);
  const [jobId, setJobId] = useState(record.job_id ?? "");
  const [fillupDate, setFillupDate] = useState(record.fillup_date ?? "");
  const [odometerBefore, setOdometerBefore] = useState(String(record.odometer_before ?? ""));
  const [odometerAfter, setOdometerAfter] = useState(String(record.odometer_after ?? ""));
  const [fuelAmountLitres, setFuelAmountLitres] = useState(String(record.fuel_amount_litres ?? ""));
  const [fuelCostPerLitres, setFuelCostPerLitres] = useState(String(record.fuel_cost_per_litres ?? ""));
  const [fuelStation, setFuelStation] = useState(record.fuel_station ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(record.invoice_number ?? "");
  const [notes, setNotes] = useState(record.notes ?? "");

  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchOptions() {
      setIsLoadingOptions(true);

      const [vehiclesRes, jobsRes] = await Promise.all([
        supabase
          .from("vehicles")
          .select("id, vehicle_code, registration_number, vehicle_type")
          .order("vehicle_code", { ascending: true }),
        supabase
          .from("jobs")
          .select("id, cdo_number")
          .order("cdo_number", { ascending: false }),
      ]);

      if (vehiclesRes.data) {
        setVehicles(vehiclesRes.data);
      }
      if (jobsRes.data) {
        setJobs(jobsRes.data);
      }

      setIsLoadingOptions(false);
    }

    fetchOptions();
  }, []);

  // Calculate live derived metrics
  const beforeNum = parseInt(odometerBefore, 10);
  const afterNum = parseInt(odometerAfter, 10);
  const litresNum = parseFloat(fuelAmountLitres);
  const rateNum = parseFloat(fuelCostPerLitres);

  const calculatedKm =
    !isNaN(beforeNum) && !isNaN(afterNum) && afterNum >= beforeNum
      ? afterNum - beforeNum
      : null;

  const calculatedEfficiency =
    calculatedKm !== null && !isNaN(litresNum) && litresNum > 0
      ? (calculatedKm / litresNum).toFixed(2)
      : null;

  const calculatedTotalCost =
    !isNaN(litresNum) && !isNaN(rateNum) && litresNum >= 0 && rateNum >= 0
      ? (litresNum * rateNum).toFixed(2)
      : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicleId) {
      setFormError("Please select a fleet vehicle.");
      return;
    }

    if (!fillupDate) {
      setFormError("Fill-up date is required.");
      return;
    }

    if (isNaN(beforeNum) || beforeNum < 0) {
      setFormError("Please enter a valid Odometer Before reading.");
      return;
    }

    if (isNaN(afterNum) || afterNum < 0) {
      setFormError("Please enter a valid Odometer After reading.");
      return;
    }

    if (afterNum < beforeNum) {
      setFormError("Odometer After cannot be less than Odometer Before.");
      return;
    }

    if (isNaN(litresNum) || litresNum <= 0) {
      setFormError("Please enter a valid fuel volume in litres (greater than 0).");
      return;
    }

    if (isNaN(rateNum) || rateNum < 0) {
      setFormError("Please enter a valid fuel cost per litre.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    const km = afterNum - beforeNum;
    const efficiency = litresNum > 0 ? parseFloat((km / litresNum).toFixed(2)) : null;

    const { error } = await supabase
      .from("fuel_records")
      .update({
        vehicle_id: vehicleId,
        job_id: jobId || null,
        fillup_date: fillupDate,
        odometer_before: beforeNum,
        odometer_after: afterNum,
        fuel_amount_litres: litresNum,
        fuel_cost_per_litres: rateNum,
        km_covered: km,
        fuel_efficiency: efficiency,
        fuel_station: fuelStation.trim() || null,
        invoice_number: invoiceNumber.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", record.id);

    if (error) {
      setIsSubmitting(false);
      setFormError(error.message || "An error occurred while updating the fuel record.");
      return;
    }

    router.push(`/dashboard/fuel/${record.id}`);
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
        {/* Vehicle Selector */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Fleet Vehicle <span className="text-red-500">*</span>
          </label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoadingOptions}
            required
          >
            <option value="">Select a Vehicle...</option>
            {vehicles.map((v) => {
              const code = v.vehicle_code ? `${v.vehicle_code} — ` : "";
              const type = v.vehicle_type ? ` (${v.vehicle_type})` : "";
              return (
                <option key={v.id} value={v.id}>
                  {code}{v.registration_number}{type}
                </option>
              );
            })}
          </select>
        </div>

        {/* Optional Job Assignment */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Associated Dispatch Job (Optional)
          </label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoadingOptions}
          >
            <option value="">No Associated Job (Fleet Standby / General)</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.cdo_number}
              </option>
            ))}
          </select>
        </div>

        {/* Fill-Up Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Fill-Up Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fillupDate}
            onChange={(e) => setFillupDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        {/* Fuel Station */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Fuel Station / Vendor
          </label>
          <input
            type="text"
            value={fuelStation}
            onChange={(e) => setFuelStation(e.target.value)}
            placeholder="e.g. TotalEnergies Airport Rd"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Odometer Before */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Odometer Before (km) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={odometerBefore}
            onChange={(e) => setOdometerBefore(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        {/* Odometer After */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Odometer After (km) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={odometerAfter}
            onChange={(e) => setOdometerAfter(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        {/* Fuel Volume (Litres) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Fuel Volume (Litres) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={fuelAmountLitres}
            onChange={(e) => setFuelAmountLitres(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        {/* Fuel Cost per Litre */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Cost Per Litre <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fuelCostPerLitres}
            onChange={(e) => setFuelCostPerLitres(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        {/* Invoice Number */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Invoice / Receipt Number
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Live Calculated Stats Preview Card */}
        {(calculatedKm !== null || calculatedEfficiency !== null || calculatedTotalCost !== null) && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Calculated Metrics Preview
            </p>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <span className="text-xs text-slate-500">Distance Covered:</span>
                <p className="text-sm font-bold text-slate-900">
                  {calculatedKm !== null ? `${calculatedKm.toLocaleString()} km` : "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Fuel Efficiency:</span>
                <p className="text-sm font-bold text-emerald-600">
                  {calculatedEfficiency !== null ? `${calculatedEfficiency} km/L` : "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Total Fill-Up Cost:</span>
                <p className="text-sm font-bold text-slate-900">
                  {calculatedTotalCost !== null ? calculatedTotalCost : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Notes &amp; Remarks
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details, driver comments, or station remarks..."
            rows={3}
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
          onClick={() => router.push(`/dashboard/fuel/${record.id}`)}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
