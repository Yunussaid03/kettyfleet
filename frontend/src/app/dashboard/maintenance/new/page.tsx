"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface VehicleOption {
  id: string;
  vehicle_code: string | null;
  registration_number: string;
  vehicle_type: string | null;
  current_mileage: number | null;
}

const COMMON_ITEM_TYPES = [
  "General Service",
  "Oil Change",
  "Brake Pads / Discs",
  "Tyres / Wheel Alignment",
  "Engine Repair",
  "Suspension",
  "Battery / Electrical",
  "Transmission / Gearbox",
  "Cooling / Radiator",
  "Bodywork / Paint",
  "Other",
];

export default function NewMaintenancePage() {
  const router = useRouter();

  const [vehicleId, setVehicleId] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [itemType, setItemType] = useState("General Service");
  const [customItemType, setCustomItemType] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [serviceProvider, setServiceProvider] = useState("");
  const [mechanicName, setMechanicName] = useState("");
  const [odometerAtService, setOdometerAtService] = useState("");
  const [notes, setNotes] = useState("");

  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchVehicles() {
      setIsLoadingVehicles(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, vehicle_code, registration_number, vehicle_type, current_mileage")
        .order("vehicle_code", { ascending: true });

      if (data && !error) {
        setVehicles(data);
      }
      setIsLoadingVehicles(false);
    }

    fetchVehicles();
  }, []);

  // When vehicle changes, auto-fill the current mileage as default odometer reading
  function handleVehicleChange(selectedId: string) {
    setVehicleId(selectedId);
    const selectedVehicle = vehicles.find((v) => v.id === selectedId);
    if (selectedVehicle && selectedVehicle.current_mileage) {
      setOdometerAtService(String(selectedVehicle.current_mileage));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicleId) {
      setFormError("Please select a fleet vehicle.");
      return;
    }

    if (!maintenanceDate) {
      setFormError("Service date is required.");
      return;
    }

    const resolvedItemType =
      itemType === "Other"
        ? customItemType.trim() || "Other"
        : itemType.trim() || "General Service";

    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost < 0) {
      setFormError("Please enter a valid maintenance cost amount (minimum 0).");
      return;
    }

    const parsedOdometer = odometerAtService ? parseInt(odometerAtService, 10) : null;
    if (odometerAtService && (isNaN(parsedOdometer!) || parsedOdometer! < 0)) {
      setFormError("Please enter a valid odometer reading.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    const { error } = await supabase.from("maintenance_records").insert({
      vehicle_id: vehicleId,
      maintencance_date: maintenanceDate,
      item_type: resolvedItemType,
      description: description.trim() || null,
      cost: parsedCost,
      payment_method: paymentMethod.trim() || null,
      service_provider: serviceProvider.trim() || null,
      mechanic_name: mechanicName.trim() || null,
      odometer_at_service: parsedOdometer,
      notes: notes.trim() || null,
    });

    if (error) {
      setIsSubmitting(false);
      setFormError(error.message || "An error occurred while saving the maintenance record.");
      return;
    }

    router.push("/dashboard/maintenance");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/dashboard/maintenance"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Maintenance
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Log Maintenance Record
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Record vehicle repairs, scheduled service, parts replacement, and workshop costs.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
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
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoadingVehicles}
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

            {/* Service Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Service Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Item Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Maintenance Category <span className="text-red-500">*</span>
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {COMMON_ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Item Type if "Other" */}
            {itemType === "Other" && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Specify Category Name
                </label>
                <input
                  type="text"
                  value={customItemType}
                  onChange={(e) => setCustomItemType(e.target.value)}
                  placeholder="e.g. Windscreen Replacement"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            {/* Cost (KES) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Cost (KES) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 15000"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Odometer at Service */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Odometer Reading (km)
              </label>
              <input
                type="number"
                min="0"
                value={odometerAtService}
                onChange={(e) => setOdometerAtService(e.target.value)}
                placeholder="e.g. 125000"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Service Provider / Garage */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Service Provider / Garage
              </label>
              <input
                type="text"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
                placeholder="e.g. AutoXpress Mombasa"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Mechanic Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Lead Mechanic Name
              </label>
              <input
                type="text"
                value={mechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
                placeholder="e.g. Joseph Mwangi"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Payment Method */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Cash">Cash</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Invoice / Account">Invoice / Account</option>
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Work Summary &amp; Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Front brake pads replacement and rotor resurfacing"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Additional Notes / Warranty Details
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional remarks, invoice reference number, or warranty notes..."
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
              {isSubmitting ? "Saving..." : "Save Record"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/maintenance")}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
