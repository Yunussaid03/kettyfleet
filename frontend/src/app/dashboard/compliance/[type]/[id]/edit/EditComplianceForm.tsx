"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ComplianceDocType } from "../../../types";

interface VehicleOption {
  id: string;
  vehicle_code: string | null;
  registration_number: string;
  vehicle_type: string | null;
}

interface EditComplianceFormProps {
  docType: ComplianceDocType;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialRecord: Record<string, any>;
}

export default function EditComplianceForm({
  docType,
  id,
  initialRecord,
}: EditComplianceFormProps) {
  const router = useRouter();

  // Shared fields
  const [vehicleId, setVehicleId] = useState(initialRecord.vehicle_id || "");
  const [notes, setNotes] = useState(initialRecord.notes || "");
  const [certificateUrl, setCertificateUrl] = useState(
    initialRecord.certificate_url || ""
  );

  // Insurance fields
  const [insuranceCompany, setInsuranceCompany] = useState(
    initialRecord.insurance_company || ""
  );
  const [policyNumber, setPolicyNumber] = useState(
    initialRecord.policy_number || ""
  );
  const [coverType, setCoverType] = useState(() => {
    const ct = initialRecord.cover_type || "Comprehensive";
    const standard = [
      "Comprehensive",
      "PSV Commercial TPO",
      "Third Party Only (TPO)",
      "Third Party, Fire & Theft",
    ];
    return standard.includes(ct) ? ct : "Other";
  });
  const [customCoverType, setCustomCoverType] = useState(() => {
    const ct = initialRecord.cover_type || "";
    const standard = [
      "Comprehensive",
      "PSV Commercial TPO",
      "Third Party Only (TPO)",
      "Third Party, Fire & Theft",
    ];
    return standard.includes(ct) ? "" : ct;
  });
  const [premiumAmount, setPremiumAmount] = useState(
    initialRecord.premium_amount !== null &&
      initialRecord.premium_amount !== undefined
      ? String(initialRecord.premium_amount)
      : ""
  );
  const [startDate, setStartDate] = useState(initialRecord.start_date || "");
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState(
    initialRecord.expiry_date || ""
  );
  const [insuranceStatus, setInsuranceStatus] = useState(
    initialRecord.status || "active"
  );

  // Inspection fields
  const [bookingDate, setBookingDate] = useState(
    initialRecord.booking_date || ""
  );
  const [inspectionDate, setInspectionDate] = useState(
    initialRecord.inspection_date || ""
  );
  const [inspectionCenter, setInspectionCenter] = useState(
    initialRecord.inspection_center || ""
  );
  const [inspectionResult, setInspectionResult] = useState(() => {
    const res = initialRecord.result || "Pass";
    const standard = ["Pass", "Fail", "Pending"];
    return standard.includes(res) ? res : "Other";
  });
  const [customInspectionResult, setCustomInspectionResult] = useState(() => {
    const res = initialRecord.result || "";
    const standard = ["Pass", "Fail", "Pending"];
    return standard.includes(res) ? "" : res;
  });
  const [inspectionExpiryDate, setInspectionExpiryDate] = useState(
    initialRecord.expiry_date || ""
  );

  // Speed Governor fields
  const [governorVendor, setGovernorVendor] = useState(
    initialRecord.vendor || ""
  );
  const [installationDate, setInstallationDate] = useState(
    initialRecord.installation_date || ""
  );
  const [governorExpiryDate, setGovernorExpiryDate] = useState(
    initialRecord.expiry_date || ""
  );
  const [governorStatus, setGovernorStatus] = useState(
    initialRecord.status || "active"
  );

  // RSL License fields
  const [applicationDate, setApplicationDate] = useState(
    initialRecord.application_date || ""
  );
  const [issueDate, setIssueDate] = useState(initialRecord.issue_date || "");
  const [validFrom, setValidFrom] = useState(initialRecord.valid_from || "");
  const [validUntil, setValidUntil] = useState(initialRecord.valid_until || "");
  const [issuingAuthority, setIssuingAuthority] = useState(
    initialRecord.issuing_authority || "NTSA"
  );
  const [rslStatus, setRslStatus] = useState(initialRecord.status || "active");

  // State & Loading
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchVehicles() {
      setIsLoadingVehicles(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, vehicle_code, registration_number, vehicle_type")
        .order("vehicle_code", { ascending: true });

      if (data && !error) {
        setVehicles(data);
      }
      setIsLoadingVehicles(false);
    }

    fetchVehicles();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!vehicleId) {
      setFormError("Please select a fleet vehicle.");
      return;
    }

    // UPDATE INSURANCE
    if (docType === "insurance") {
      if (!insuranceCompany.trim()) {
        setFormError("Insurance company name is required.");
        return;
      }
      const resolvedCover =
        coverType === "Other"
          ? customCoverType.trim()
          : coverType.trim();
      if (!resolvedCover) {
        setFormError("Cover type is required.");
        return;
      }
      if (!startDate) {
        setFormError("Policy start date is required.");
        return;
      }
      if (!insuranceExpiryDate) {
        setFormError("Policy expiry date is required.");
        return;
      }
      if (insuranceExpiryDate < startDate) {
        setFormError("Expiry date cannot be earlier than start date.");
        return;
      }

      let parsedPremium: number | null = null;
      if (premiumAmount.trim()) {
        parsedPremium = parseFloat(premiumAmount);
        if (isNaN(parsedPremium) || parsedPremium < 0) {
          setFormError("Please enter a valid premium amount (KES).");
          return;
        }
      }

      setIsSubmitting(true);
      const { error } = await supabase
        .from("insurance_records")
        .update({
          vehicle_id: vehicleId,
          insurance_company: insuranceCompany.trim(),
          policy_number: policyNumber.trim() || null,
          cover_type: resolvedCover,
          premium_amount: parsedPremium,
          start_date: startDate,
          expiry_date: insuranceExpiryDate,
          certificate_url: certificateUrl.trim() || null,
          status: insuranceStatus || "active",
          notes: notes.trim() || null,
        })
        .eq("id", id);

      if (error) {
        setIsSubmitting(false);
        setFormError(error.message || "Failed to update insurance record.");
        return;
      }

      setSuccessMessage("Insurance record updated successfully.");
      router.push(`/dashboard/compliance/insurance/${id}`);
      router.refresh();
      return;
    }

    // UPDATE INSPECTION
    if (docType === "inspection") {
      const resolvedResult =
        inspectionResult === "Other"
          ? customInspectionResult.trim()
          : inspectionResult.trim();

      setIsSubmitting(true);
      const { error } = await supabase
        .from("inspection_records")
        .update({
          vehicle_id: vehicleId,
          booking_date: bookingDate || null,
          inspection_date: inspectionDate || null,
          inspection_center: inspectionCenter.trim() || null,
          result: resolvedResult || null,
          expiry_date: inspectionExpiryDate.trim() || null,
          certificate_url: certificateUrl.trim() || null,
          notes: notes.trim() || null,
        })
        .eq("id", id);

      if (error) {
        setIsSubmitting(false);
        setFormError(error.message || "Failed to update inspection record.");
        return;
      }

      setSuccessMessage("Inspection record updated successfully.");
      router.push(`/dashboard/compliance/inspection/${id}`);
      router.refresh();
      return;
    }

    // UPDATE SPEED GOVERNOR
    if (docType === "speed_governor") {
      if (!governorVendor.trim()) {
        setFormError("Governor vendor or provider name is required.");
        return;
      }
      if (!installationDate) {
        setFormError("Installation date is required.");
        return;
      }

      setIsSubmitting(true);
      const { error } = await supabase
        .from("speed_governor_records")
        .update({
          vehicle_id: vehicleId,
          vendor: governorVendor.trim(),
          installation_date: installationDate,
          expiry_date: governorExpiryDate || null,
          certificate_url: certificateUrl.trim() || null,
          status: governorStatus || "active",
          notes: notes.trim() || null,
        })
        .eq("id", id);

      if (error) {
        setIsSubmitting(false);
        setFormError(error.message || "Failed to update speed governor record.");
        return;
      }

      setSuccessMessage("Speed governor record updated successfully.");
      router.push(`/dashboard/compliance/speed_governor/${id}`);
      router.refresh();
      return;
    }

    // UPDATE RSL
    if (docType === "rsl") {
      if (!validUntil) {
        setFormError("Valid Until date is required for Road Service License.");
        return;
      }
      if (validFrom && validUntil < validFrom) {
        setFormError("Valid Until date cannot be earlier than Valid From date.");
        return;
      }

      setIsSubmitting(true);
      const { error } = await supabase
        .from("rsl_records")
        .update({
          vehicle_id: vehicleId,
          application_date: applicationDate || null,
          issue_date: issueDate || null,
          valid_from: validFrom || null,
          valid_until: validUntil,
          issuing_authority: issuingAuthority.trim() || "NTSA",
          certificate_url: certificateUrl.trim() || null,
          status: rslStatus || "active",
          notes: notes.trim() || null,
        })
        .eq("id", id);

      if (error) {
        setIsSubmitting(false);
        setFormError(error.message || "Failed to update RSL record.");
        return;
      }

      setSuccessMessage("Road Service License updated successfully.");
      router.push(`/dashboard/compliance/rsl/${id}`);
      router.refresh();
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-semibold">{formError}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        {/* Section 1: Vehicle Assignment */}
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-base font-bold text-slate-900">
            Vehicle Assignment
          </h2>
          <p className="text-xs text-slate-500">
            Assign this compliance document to a fleet vehicle.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Vehicle <span className="text-red-500">*</span>
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={isLoadingVehicles}
                required
                className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              >
                <option value="">
                  {isLoadingVehicles
                    ? "Loading vehicles..."
                    : "— Select Fleet Vehicle —"}
                </option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_code
                      ? `${v.vehicle_code} — ${v.registration_number}`
                      : v.registration_number}{" "}
                    {v.vehicle_type ? `(${v.vehicle_type})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Type-Specific Fields */}
        <div className="pt-6">
          {/* INSURANCE FIELDS */}
          {docType === "insurance" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Insurance Policy Information
                </h3>
                <p className="text-xs text-slate-500">
                  Underwriting insurer, policy number, cover type, and duration.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Insurance Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Insurance, CIC, Britam"
                    value={insuranceCompany}
                    onChange={(e) => setInsuranceCompany(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POL-2026-9812"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Cover Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={coverType}
                    onChange={(e) => setCoverType(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="PSV Commercial TPO">
                      PSV Commercial TPO
                    </option>
                    <option value="Third Party Only (TPO)">
                      Third Party Only (TPO)
                    </option>
                    <option value="Third Party, Fire & Theft">
                      Third Party, Fire & Theft
                    </option>
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>

                {coverType === "Other" && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Custom Cover Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter cover type"
                      value={customCoverType}
                      onChange={(e) => setCustomCoverType(e.target.value)}
                      required
                      className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Premium Amount (KES)
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-slate-400">
                      KES
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={premiumAmount}
                      onChange={(e) => setPremiumAmount(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 py-2 pl-12 pr-3 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={insuranceExpiryDate}
                    onChange={(e) => setInsuranceExpiryDate(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Policy Status
                  </label>
                  <select
                    value={insuranceStatus}
                    onChange={(e) => setInsuranceStatus(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* INSPECTION FIELDS */}
          {docType === "inspection" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Motor Vehicle Inspection Details
                </h3>
                <p className="text-xs text-slate-500">
                  Statutory roadworthiness inspection bookings, centers, and test outcomes.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Inspection Center
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NTSA Likoni Road, AutoXpress"
                    value={inspectionCenter}
                    onChange={(e) => setInspectionCenter(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Inspection Outcome / Result
                  </label>
                  <select
                    value={inspectionResult}
                    onChange={(e) => setInspectionResult(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Pending">Pending</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {inspectionResult === "Other" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Custom Result
                    </label>
                    <input
                      type="text"
                      placeholder="Enter custom result"
                      value={customInspectionResult}
                      onChange={(e) =>
                        setCustomInspectionResult(e.target.value)
                      }
                      className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={inspectionExpiryDate}
                    onChange={(e) => setInspectionExpiryDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SPEED GOVERNOR FIELDS */}
          {docType === "speed_governor" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Speed Governor Calibration Details
                </h3>
                <p className="text-xs text-slate-500">
                  Certified speed limiter vendor, fitting date, and certificate validity.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Vendor / Provider Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dalcom, Safeway, Omata"
                    value={governorVendor}
                    onChange={(e) => setGovernorVendor(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Installation Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Certificate Expiry Date
                  </label>
                  <input
                    type="date"
                    value={governorExpiryDate}
                    onChange={(e) => setGovernorExpiryDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={governorStatus}
                    onChange={(e) => setGovernorStatus(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* RSL LICENSE FIELDS */}
          {docType === "rsl" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Road Service License (RSL) Details
                </h3>
                <p className="text-xs text-slate-500">
                  Commercial passenger/transport service authority license and validity.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NTSA"
                    value={issuingAuthority}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Application Date
                  </label>
                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Valid Until <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={rslStatus}
                    onChange={(e) => setRslStatus(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Document Reference & Notes */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-slate-900">
            Certificate Document &amp; Additional Notes
          </h3>
          <p className="text-xs text-slate-500">
            Optionally update the cloud certificate URL or add remarks.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Certificate / Document URL
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or cloud document link"
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Any remarks, policy modifications, or inspection feedback..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <Link
          href={`/dashboard/compliance/${docType}/${id}`}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingVehicles}
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isSubmitting ? (
            <>
              <svg
                className="-ml-0.5 mr-2 h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Updating Record...
            </>
          ) : (
            "Update Compliance Record"
          )}
        </button>
      </div>
    </form>
  );
}
