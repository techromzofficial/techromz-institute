"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { sanitizeInternalRedirect } from "@/lib/authRedirect";

export function ReportBreadcrumb({ reportTitle = "Order Performance", returnTo }) {
  let decodedReturnTo = returnTo;

  try {
    decodedReturnTo = returnTo ? decodeURIComponent(returnTo) : returnTo;
  } catch {
    decodedReturnTo = "";
  }

  const backUrl = sanitizeInternalRedirect(decodedReturnTo, "/admin/analytics");

  return (
    <nav className="report-breadcrumb" aria-label="Breadcrumb">
      <Link href={backUrl} className="breadcrumb-link">
        Analytics
      </Link>
      <ChevronRight size={12} className="breadcrumb-separator" />
      <span className="breadcrumb-current" aria-current="page">
        {reportTitle}
      </span>
    </nav>
  );
}
