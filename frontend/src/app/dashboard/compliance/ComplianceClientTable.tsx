"use client";

import { useMemo, useState } from "react";
import {
  ComplianceDocType,
  ExpiryStatus,
  NormalizedComplianceRecord,
} from "./types";

interface ComplianceClientTableProps {
  initialRecords: NormalizedComplianceRecord[];
}

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function renderDocTypeBadge(type: ComplianceDocType) {
  switch (type) {
    case "insurance":
      return (
        <span className="inline-flex items-center rounded-md border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
          Insurance
        </span>
      );
    case "inspection":
      return (
        <span className="inline-flex items-center rounded-md border border-purple-200/80 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
          Inspection
        </span>
      );
    case "speed_governor":
      return (
        <span className="inline-flex items-center rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
          Speed Governor
        </span>
      );
    case "rsl":
      return (
        <span className="inline-flex items-center rounded-md border border-teal-200/80 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
          RSL License
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          Document
        </span>
      );
  }
}

function renderExpiryBadge(status: ExpiryStatus, daysRemaining: number | null) {
  switch (status) {
    case "expired":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
          Expired ({Math.abs(daysRemaining ?? 0)}d ago)
        </span>
      );
    case "expiring_soon":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Expiring in {daysRemaining}d
        </span>
      );
    case "valid":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
          Valid ({daysRemaining}d left)
        </span>
      );
    case "unknown":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
          Unknown Expiry
        </span>
      );
  }
}

export default function ComplianceClientTable({
  initialRecords,
}: ComplianceClientTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | ComplianceDocType>(
    "all"
  );
  const [selectedExpiry, setSelectedExpiry] = useState<"all" | ExpiryStatus>(
    "all"
  );

  const filteredRecords = useMemo(() => {
    return initialRecords.filter((record) => {
      // Type filter
      if (selectedType !== "all" && record.docType !== selectedType) {
        return false;
      }

      // Expiry filter
      if (selectedExpiry !== "all" && record.expiryStatus !== selectedExpiry) {
        return false;
      }

      // Search query (case-insensitive) across vehicle code, registration, primary reference, secondary detail, notes
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesVehicleCode = record.vehicleCode
          ? record.vehicleCode.toLowerCase().includes(q)
          : false;
        const matchesReg = record.registrationNumber.toLowerCase().includes(q);
        const matchesRef = record.primaryReference.toLowerCase().includes(q);
        const matchesSec = record.secondaryDetail
          ? record.secondaryDetail.toLowerCase().includes(q)
          : false;
        const matchesNotes = record.notes
          ? record.notes.toLowerCase().includes(q)
          : false;

        if (
          !matchesVehicleCode &&
          !matchesReg &&
          !matchesRef &&
          !matchesSec &&
          !matchesNotes
        ) {
          return false;
        }
      }

      return true;
    });
  }, [initialRecords, selectedType, selectedExpiry, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by vehicle, registration, policy, vendor, or authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Document Type Filter */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="type-filter"
              className="text-xs font-medium text-slate-500"
            >
              Type:
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as "all" | ComplianceDocType)
              }
              aria-label="Filter by document type"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="insurance">Insurance</option>
              <option value="inspection">Inspection</option>
              <option value="speed_governor">Speed Governor</option>
              <option value="rsl">RSL License</option>
            </select>
          </div>

          {/* Expiry Status Filter */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="expiry-filter"
              className="text-xs font-medium text-slate-500"
            >
              Expiry:
            </label>
            <select
              id="expiry-filter"
              value={selectedExpiry}
              onChange={(e) =>
                setSelectedExpiry(e.target.value as "all" | ExpiryStatus)
              }
              aria-label="Filter by expiry status"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Expiry Statuses</option>
              <option value="expired">Expired (&lt; Today)</option>
              <option value="expiring_soon">Expiring Soon (&le; 30d)</option>
              <option value="valid">Valid (&gt; 30d)</option>
              <option value="unknown">Unknown Expiry</option>
            </select>
          </div>

          {/* Reset Filters button if applied */}
          {(selectedType !== "all" ||
            selectedExpiry !== "all" ||
            searchQuery.trim()) && (
            <button
              onClick={() => {
                setSelectedType("all");
                setSelectedExpiry("all");
                setSearchQuery("");
              }}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Unified Table Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fleet Compliance Documents
              </h2>
              <p className="text-xs text-slate-500">
                Consolidated statutory insurance, inspection, speed governor,
                and road service licenses
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Showing {filteredRecords.length} of {initialRecords.length}
            </span>
          </div>
        </div>

        {initialRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No compliance records found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              There are currently no insurance, inspection, speed governor, or
              RSL records in the database.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No records match your filter criteria.
            </p>
            <button
              onClick={() => {
                setSelectedType("all");
                setSelectedExpiry("all");
                setSearchQuery("");
              }}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              Clear filters and show all records &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reference / Provider</th>
                  <th className="px-4 py-3">Details / Outcome</th>
                  <th className="px-4 py-3">Effective Date</th>
                  <th className="px-4 py-3">Expiry / Valid Until</th>
                  <th className="px-4 py-3">Expiry Status</th>
                  <th className="px-6 py-3 text-right">DB Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRecords.map((record) => (
                  <tr
                    key={`${record.docType}-${record.id}`}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <span className="font-semibold text-slate-900">
                        {record.vehicleDisplay}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {renderDocTypeBadge(record.docType)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-800">
                      <span className="font-medium">
                        {record.primaryReference || "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                      {record.secondaryDetail ? (
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                          {record.secondaryDetail}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                      {formatDateDisplay(record.effectiveDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium text-slate-800">
                      {record.expiryDateStr
                        ? formatDateDisplay(record.expiryDateStr)
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {renderExpiryBadge(
                        record.expiryStatus,
                        record.daysRemaining
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right text-xs">
                      {record.dbStatus ? (
                        <span className="capitalize text-slate-600">
                          {record.dbStatus}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
