import React from "react";
import { ComplianceDocType, ExpiryStatus } from "./types";

export function formatDateDisplay(dateStr: string | null): string {
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

export function renderDocTypeBadge(type: ComplianceDocType) {
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

export function renderExpiryBadge(
  status: ExpiryStatus,
  daysRemaining: number | null
) {
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
