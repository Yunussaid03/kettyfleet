"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function NewVehiclePage() {
  const router = useRouter();
  const [vehicleCode, setVehicleCode] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [passengerCapacity, setPassengerCapacity] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");
  const [ownershipType, setOwnershipType] = useState("company");
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicleCode.trim() || !registrationNumber.trim() || !vehicleType.trim()) {
      setFormError("Vehicle code, registration number, and vehicle type are required.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    const { error } = await supabase.from("vehicles").insert({
      vehicle_code: vehicleCode.trim(),
      registration_number: registrationNumber.trim(),
      vehicle_type: vehicleType.trim(),
      manufacture_year: manufactureYear ? Number(manufactureYear) : null,
      passenger_capacity: passengerCapacity ? Number(passengerCapacity) : null,
      current_mileage: currentMileage ? Number(currentMileage) : 0,
      ownership_type: ownershipType,
      status: status,
      category: category.trim() || null,
    });

    if (error) {
      setIsSubmitting(false);

      if (error.code === "23505") {
        setFormError("Vehicle code or registration number already exists.");
      } else {
        setFormError("An error occurred while saving the vehicle.");
      }
      return;
    }

    router.push("/dashboard/vehicles");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/dashboard/vehicles"
          className="inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to Vehicles
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Add New Vehicle
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Register a new fleet vehicle into the KettyFleet inventory.
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
            {/* Vehicle Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Vehicle Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vehicleCode}
                onChange={(event) => setVehicleCode(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. V006"
                required
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. KXX 123A"
                required
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Vehicle Type / Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Toyota Hiace"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. 4WD, MiniVan, MPV"
              />
            </div>

            {/* Manufacture Year */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Manufacture Year
              </label>
              <input
                type="number"
                value={manufactureYear}
                onChange={(event) => setManufactureYear(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="2020"
                min="1980"
                max={new Date().getFullYear()}
              />
            </div>

            {/* Passenger Capacity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Passenger Capacity
              </label>
              <input
                type="number"
                value={passengerCapacity}
                onChange={(event) => setPassengerCapacity(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="8"
                min="1"
              />
            </div>

            {/* Current Mileage */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Current Mileage (km)
              </label>
              <input
                type="number"
                value={currentMileage}
                onChange={(event) => setCurrentMileage(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="10000"
                min="0"
              />
            </div>

            {/* Ownership Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Ownership Type
              </label>
              <select
                value={ownershipType}
                onChange={(event) => setOwnershipType(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="company">Company</option>
                <option value="private">Private</option>
                <option value="leased">Leased</option>
              </select>
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "Saving..." : "Save Vehicle"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/vehicles")}
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